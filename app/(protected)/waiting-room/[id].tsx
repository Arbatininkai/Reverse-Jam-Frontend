import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { createStyles } from "@/styles/createStyles";
import { useLobbyManager } from "@/utils/leaving-manager";
import { Storage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams } from "expo-router";
import { useContext, useEffect } from "react";
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
  const { id } = useGlobalSearchParams<{ id: string }>();
  const lobbyId = Array.isArray(id) ? id[0] : id;
  const { handleDeleteLobby, handleLeaveGame } = useLobbyManager();
  const { user } = useContext(AuthContext)!;
  const tokenId = user?.token;

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  const { connectionRef, connectToLobby, startGame, lobby, setLobby } =
    useSignalR();

  const joinUrl = lobby?.lobbyCode
    ? `arbatininkai://join?seed=${encodeURIComponent(lobby.lobbyCode)}`
    : "arbatininkai://join";

  useEffect(() => {
    const loadLobby = async () => {
      if (!id) return;
      const stored = await Storage.getItem(`lobby-${id}`);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      setLobby(parsed);

      // Connect only if not already connected and we have the lobbyCode
      if (parsed.lobbyCode && !connectionRef.current) {
        try {
          await connectToLobby(parsed.lobbyCode, tokenId);
        } catch (err) {
          console.error("Failed to connect to lobby:", err);
        }
      }
    };

    loadLobby();
  }, [id]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (lobby?.players?.length === 1) {
              handleDeleteLobby(lobbyId);
            } else {
              handleLeaveGame(lobbyId);
            }
          }}
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
                  source={{ uri: player.photoUrl }}
                  style={createStyles.playerIcon}
                />
                <Text style={createStyles.playerName}>{player.name}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.smallerText, { marginRight: 10 }]}>
            Total Rounds: {lobby?.totalRounds || 1}
          </Text>

          {lobby?.ownerId === user?.id && (
            <View style={createStyles.createButtonWrapper}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteLobby(lobbyId)}
              >
                <Text style={styles.deleteText}>Delete Lobby</Text>
              </TouchableOpacity>
            </View>
          )}

          {lobby?.ownerId === user?.id && (
            <View style={createStyles.createButtonWrapper}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => startGame(Number(id))}
              >
                <Text style={styles.buttonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
