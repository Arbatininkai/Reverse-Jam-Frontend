import { Storage } from "@/utils/utils";
import * as signalR from "@microsoft/signalr";
import { usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useRef, useState } from "react";
import { Platform } from "react-native";
import { AuthContext } from "./AuthContext";

type SignalRContextType = {
  connectionRef: React.MutableRefObject<signalR.HubConnection | null>;
  connectToLobby: (
    lobbyCode: string,
    tokenId: string | undefined
  ) => Promise<void>;
  leaveLobby: (lobbyId: number) => Promise<void>;
  startGame: (lobbyId: number) => Promise<void>;
  nextPlayer: (lobbyId: number) => Promise<void>;
  lobby: any;
  setLobby: React.Dispatch<React.SetStateAction<any>>;
  currentPlayerId: number | null;
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
};

const SignalRContext = createContext<SignalRContextType | null>(null);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [lobby, setLobby] = useState<any>(null);
  const { user, setUser } = useContext(AuthContext)!;
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  const connectToLobby = async (
    lobbyCode: string,
    tokenId: string | undefined
  ) => {
    if (!tokenId) return;

    try {
      if (lobbyCode && lobbyCode != "") {
        const response = await fetch(
          `${API_BASE_URL}/api/lobby/exists/${lobbyCode}`,
          {
            headers: { Authorization: `Bearer ${tokenId}` },
          }
        );
        if (!response.ok) {
          const msg = await response.text();
          setErrorMessage("Lobby not found");
          return;
        }
      }
    } catch (err) {
      setErrorMessage("Could not verify lobby. Please try again.");
      return;
    }

    // If the connection is already established, stop it first
    let connection = connectionRef.current;
    if (connection) {
      try {
        if (connection.state !== signalR.HubConnectionState.Disconnected) {
          await connection.stop();
        }
      } catch (err) {
        console.warn("Error stopping old connection:", err);
      } finally {
        connectionRef.current = null;
      }
    }

    // Make a new connection
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/lobbyHub`, {
        accessTokenFactory: () => tokenId!,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("JoinedLobby", (lobbyData: any) => {
      console.log("JoinedLobby:", lobbyData);
      setLobby(lobbyData);
      Storage.setItem(`lobby-${lobbyData.id}`, JSON.stringify(lobbyData));
    });

    connection.on("PlayerJoined", (player: any) => {
      console.log("Player joined:", player);
      setLobby((prev: any) => {
        if (!prev) return prev;
        if (prev.players.some((p: any) => p.id === player.id)) return prev;
        return { ...prev, players: [...prev.players, player] };
      });
    });

    connection.on("PlayerLeft", (player: any, newOwnerId: number, lobby) => {
      console.log(`${player.name} left:`, newOwnerId, lobby);
      setLobby((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter((p: any) => p.id !== player.id),
          ownerId: newOwnerId,
        };
      });
    });

    connection.on("LobbyUpdated", (lobbyData: any) => {
      console.log("Lobby updated:", lobbyData);
      setLobby((prevLobby: any) => {
        const prevRound = prevLobby?.currentRound;
        const currentRound = lobbyData.currentRound;

        const roundChanged =
          prevRound !== undefined && currentRound !== prevRound;

        console.log(
          "Lobby updated",
          lobbyData,
          "prevRound",
          prevRound,
          "currentRound",
          currentRound,
          "roundChanged",
          roundChanged
        );

        if (lobbyData.hasGameStarted && roundChanged) {
          console.log("CHANGED ROOM");
          router.replace(
            `../game/original-song-listening-room?id=${lobbyData.id}&round=${currentRound}`
          );
        }

        return lobbyData;
      });

      Storage.setItem(`lobby-${lobbyData.id}`, JSON.stringify(lobbyData));
    });

    connection.on("CurrentPlayerChanged", (lobbyData, playerId) => {
      setCurrentPlayerId(playerId);
      setLobby(lobbyData);
      Storage.setItem(`lobby-${lobbyData.id}`, JSON.stringify(lobbyData));
    });

    connection.on("GameStarted", (lobbyId: number, songs: any) => {
      Storage.setItem(`song-${lobbyId}`, JSON.stringify(songs));
      router.replace(`../game/${lobbyId}`);
    });

    connection.on("PlayerWon", (winner) => {
      console.log("Winner: ", winner);
      if (winner.id === user?.id) {
        setUser((prev: any) => ({
          ...prev,
          totalWins: winner.totalWins,
        }));
        Storage.setItem("user", JSON.stringify(winner));
      }
    });

    connection.on("YouLeft", async () => {
      setLobby(null);
      console.log("You left the lobby");
      connectionRef.current = null;
    });

    connection.on("LobbyDeleted", async () => {
      console.log("Lobby was deleted by the owner");
      if (lobby?.id) await Storage.removeItem(`lobby-${lobby.id}`);
      if (pathname !== "/") router.replace("/");
      await connection.stop();
      connectionRef.current = null;
    });

    connection.on("Error", (message: string) => {
      console.log("SignalR Error:", message);
      setErrorMessage(message);
    });

    try {
      await connection.start();
      console.log("Connected to SignalR hub");
      connectionRef.current = connection;
      await connection.invoke("JoinLobby", lobbyCode);
    } catch (err) {
      console.error("Failed to connect to SignalR hub:", err);
    }
  };

  const leaveLobby = async (lobbyId: number) => {
    try {
      const connection = connectionRef.current;
      if (!connection) {
        console.warn("No SignalR connection to leave lobby");
        return;
      }

      await connection.invoke("LeaveLobby", lobbyId);
      console.log("SignalR LeaveLobby invoked");
      await connection.stop();
      connectionRef.current = null;
    } catch (err) {
      console.error("Error calling LeaveLobby:", err);
    }
  };

  const startGame = async (lobbyId: number) => {
    try {
      await connectionRef.current?.invoke("StartGame", lobbyId);
      console.log("SignalR StartGame invoked");
    } catch (err) {
      console.error("Error calling StartGame:", err);
    }
  };

  const nextPlayer = async (lobbyId: number) => {
    try {
      await connectionRef.current?.invoke("NextPlayer", lobbyId);
      console.log("SignalR NextPlayer invoked");
    } catch (err) {
      console.error("Error calling NextPlayer:", err);
    }
  };

  return (
    <SignalRContext.Provider
      value={{
        connectionRef,
        connectToLobby,
        leaveLobby,
        startGame,
        nextPlayer,
        lobby,
        setLobby,
        currentPlayerId,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error("useSignalR must be used within a SignalRProvider");
  return ctx;
};
