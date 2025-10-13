import { AuthContext } from "@/context/AuthContext";
import { createStyles } from "@/styles/createStyles";
import { Storage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import * as signalR from "@microsoft/signalr";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../../styles/styles";

export default function Waiting() {
  const router = useRouter();

  const { id } = useGlobalSearchParams<{ id: string }>();

  const [lobby, setLobby] = useState<any>(null);

  const { user } = useContext(AuthContext)!;
  const tokenId = user?.token;
  const currentUserId = user?.id;

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const loadLobby = async () => {
      if (id) {
        const stored = await Storage.getItem(`lobby-${id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setLobby(parsed);
            // Connect to SignalR
            if (parsed.lobbyCode) {
              connectToLobby(parsed.lobbyCode);
            }
          } catch {
            console.warn("Failed to parse stored lobby data");
          }
        }
      }
    };
    loadLobby();

    // When someone leaves the lobby, close the connection
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [id]);

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  const connectToLobby = async (lobbyCode: string) => {
    if (!tokenId || !lobbyCode) return;

    const connection = new signalR.HubConnectionBuilder()
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

    // change type to User later
    connection.on("PlayerJoined", (newPlayer: any) => {
      console.log("Player joined:", newPlayer);
      setLobby((prev: any) => {
        if (!prev) return prev;
        if (prev.players.some((p: any) => p.id === newPlayer.id)) return prev;
        return { ...prev, players: [...prev.players, newPlayer] };
      });
    });

    connection.on("PlayerLeft", (player: any) => {
      console.log("Player left:", player);
      setLobby((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter((p: any) => p.id !== player.id),
        };
      });
    });

    connection.on("Error", (message: string) => {
      console.error("SignalR Error:", message);
    });

    connection.on("LobbyDeleted", () => {
      console.log("Lobby was deleted by the owner");
      connection.stop();
      router.replace("/");
    });

    try {
      await connection.start();
      console.log("Connected to SignalR hub");
      await connection.invoke("JoinLobby", lobbyCode);
      connectionRef.current = connection;
    } catch (err) {
      console.error("Failed to connect to SignalR:", err);
    }
  };

  const deleteLobby = async () => {
    await fetch(`${API_BASE_URL}/api/Lobby/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify({ lobbyId: id }),
    });

    await Storage.removeItem(`lobby-${id}`);
    await connectionRef.current?.stop();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={30} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={createStyles.title}>Waiting Room</Text>

          <Text style={styles.smallerText}>Seed:</Text>

          <View style={createStyles.seedWrapper}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {lobby?.lobbyCode ? `#${lobby.lobbyCode}` : "#APDS"}
              </Text>
            </View>
          </View>

          <Text style={styles.smallerText}>List of Players</Text>

          <Text style={styles.smallerText}>
            Player Count: {lobby?.players?.length || 0}/{lobby?.maxPlayers || 4}
          </Text>

          <View style={createStyles.playerBox}>
            {lobby?.players?.map((player: any) => (
              <View key={player.id} style={createStyles.playerContainer}>
                <Image
                  source={{ uri: player.pholoUrl || player.photoUrl }}
                  style={createStyles.playerIcon}
                />
                <Text style={createStyles.playerName}>{player.name}</Text>
              </View>
            ))}
          </View>

          {/* The first user added to the lobby will be the creator and will be able to delete the lobby */}
          {currentUserId === lobby?.players?.[0]?.id && (
            <View style={createStyles.createButtonWrapper}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={deleteLobby}
              >
                <Text style={styles.deleteText}>Delete Lobby</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={createStyles.createButtonWrapper}>
            <TouchableOpacity
              onPress={() => {
                router.replace(`../game/${id}`);
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
