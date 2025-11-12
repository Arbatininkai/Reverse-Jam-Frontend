// leaving-manager.ts
import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Platform } from "react-native";
import { Storage } from "./utils";

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL
    : process.env.EXPO_PUBLIC_BASE_URL;

export function useLobbyManager() {
  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;
  const tokenId = user?.token;

  const { leaveLobby, lobby: signalRLobby } = useSignalR();
  const router = useRouter();

  const handleDeleteLobby = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lobby/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
        body: JSON.stringify(id),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to delete lobby:", errorText);
      }
      await Storage.removeItem(`song-${id}`);
      await Storage.removeItem(`lobby-${id}`);
    } catch (err) {
      console.error("Error deleting lobby:", err);
    }
  };

  const handleLeaveGame = async (id: string) => {
    if (!signalRLobby || !currentUserId) return;

    try {
      await leaveLobby(Number(id));
      console.log("SignalR LeaveLobby invoked from Game screen");
    } catch (err) {
      console.error("Error calling LeaveLobby:", err);
    }

    // Only delete lobby if last player
    if (signalRLobby.players.length < 1) {
      await handleDeleteLobby(id);
    }

    router.replace("../main");
  };

  return { handleDeleteLobby, handleLeaveGame };
}
