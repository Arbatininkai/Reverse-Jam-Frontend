import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { createStyles } from "@/styles/createStyles";
import { styles } from "@/styles/styles";
import { Storage } from "@/utils/utils";
import { Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RecordingPlayer from "./recording-player";

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL
    : process.env.EXPO_PUBLIC_BASE_URL;

export default function ListeningRoom() {
  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;
  const tokenId = user?.token;

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { leaveLobby, lobby, nextPlayer, currentRecording, currentPlayerId } =
    useSignalR();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [playerSnapshot, setPlayerSnapshot] = useState<any[]>([]);
  const [initialPlayerCount, setInitialPlayerCount] = useState<number>(0);

  const totalRounds = lobby?.totalRounds || 1;
  const currentRound = lobby?.currentRound || 0;

  const allRecordingsReady =
    recordings.length === initialPlayerCount * totalRounds;

  useEffect(() => {
    if (lobby && playerSnapshot.length === 0 && lobby.players?.length) {
      setPlayerSnapshot(lobby.players);
      setInitialPlayerCount(lobby.players.length);
    }
    console.log("Id", currentPlayerId);
    console.log("Current player", currentPlayer);
    if (lobby) Storage.setItem(`lobby-${id}`, JSON.stringify(lobby));
  }, [lobby]);

  // Determine current player from snapshot by ID
  const currentPlayer = currentPlayerId
    ? playerSnapshot.find((p) => p.id === currentPlayerId) ?? null
    : null;

  // Fetch recordings whenever lobby changes
  useEffect(() => {
    if (!lobby) return;

    const fetchRecordings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Recordings/${lobby.lobbyCode}/recordings`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${tokenId}` },
          }
        );

        if (!response.ok) throw new Error(await response.text());
        const files = await response.json();
        setRecordings(files);
      } catch (err) {
        console.error("Error fetching recordings:", err);
      }
    };

    fetchRecordings();
  }, [lobby]);

  const handleLeaveGame = async () => {
    if (!lobby || !currentUserId) return;
    try {
      await leaveLobby(Number(id));
    } catch (err) {
      console.error("Error leaving lobby:", err);
    }

    if (lobby.players.length < 1) {
      await Storage.removeItem(`lobby-${id}`);
      await Storage.removeItem(`song-${id}`);
    }

    router.replace("../main");
  };

  const handleDeleteLobby = async () => {
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

  // Move to next player (host only)
  const handleNextPlayer = () => {
    if (!currentPlayerId || !playerSnapshot.length) return;
    const currentIndex = playerSnapshot.findIndex(
      (p) => p.id === currentPlayerId
    );
    const nextIndex = currentIndex + 1;

    if (nextIndex < playerSnapshot.length) {
      nextPlayer(Number(id)); // Notify using SignalR
    } else {
      console.log("End of round");
    }
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
          onPress={
            playerSnapshot.length === 1 ? handleDeleteLobby : handleLeaveGame
          }
        >
          <Entypo name="cross" size={30} color="#ee2121ff" />
          <Text style={styles.leaveText}>Leave Game</Text>
        </TouchableOpacity>

        <Text style={styles.sectoinTitleText}>Listen To The Singers</Text>
        <Text style={styles.sectoinTitleText}>
          Round: {currentRound + 1} / {totalRounds}
        </Text>

        {!allRecordingsReady ? (
          <Text style={styles.sectoinTitleText}>
            Waiting for all players to submit their recordings...
          </Text>
        ) : (
          <>
            {currentPlayer && currentRecording && (
              <View style={styles.playerInfoContainer}>
                <Text style={styles.smallerText}>
                  {currentPlayer.name} is singing
                </Text>
                <Image
                  source={{ uri: currentPlayer.photoUrl }}
                  style={createStyles.bigPlayerIcon}
                />
                <RecordingPlayer
                  key={currentRecording.url}
                  title={currentRecording.fileName}
                  uri={currentRecording.url}
                />
              </View>
            )}

            {lobby?.ownerId === user?.id && playerSnapshot.length > 0 && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleNextPlayer}
              >
                <Text style={styles.buttonText}>
                  {currentRound === totalRounds - 1 &&
                  currentPlayerId ===
                    playerSnapshot[playerSnapshot.length - 1].id
                    ? "Submit Voting"
                    : "Next Player"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ImageBackground>
    </View>
  );
}
