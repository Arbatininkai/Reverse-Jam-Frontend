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
  const [lobby, setLobby] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);

  const { leaveLobby, lobby: signalRLobby } = useSignalR();

  const playerCount = lobby?.players?.length || 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialPlayerCount, setInitialPlayerCount] = useState<number>(0);

  const nextPlayer = () => {
    if (currentIndex === playerCount - 1) return;
    setCurrentIndex((prev) => (prev + 1) % lobby.players.length);
    console.log("Current recodings: ", currentRecording);
  };

  const currentPlayer = lobby?.players?.[currentIndex];
  const currentRecording = recordings.find(
    (r) => r.userId === currentPlayer?.id
  );

  useEffect(() => {
    if (signalRLobby) {
      setLobby(signalRLobby);
      console.log("New lobby: ", lobby);
      if (initialPlayerCount === 0 && signalRLobby.players) {
        setInitialPlayerCount(signalRLobby.players.length);
      }

      setCurrentIndex((prevIndex) => {
        const players = signalRLobby.players || [];
        if (players.length === 0) return 0;

        // if current player not found in updated lobby, shift index
        const current = players[prevIndex];
        if (!current) {
          return prevIndex >= players.length ? 0 : prevIndex % players.length;
        }
        return prevIndex;
      });
      Storage.setItem(`lobby-${id}`, JSON.stringify(signalRLobby));
    }
  }, [signalRLobby]);

  useEffect(() => {
    if (!lobby) return;

    const getRecordings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Recordings/${lobby.lobbyCode}/recordings`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenId}`,
            },
          }
        );

        if (!response.ok) throw new Error(await response.text());
        const files = await response.json();
        console.log("Files: ", files);
        setRecordings(files);
      } catch (err) {
        console.error("Error fetching recordings:", err);
      }
    };

    getRecordings();
  }, [lobby]);

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

  const handleLeaveGame = async () => {
    if (!signalRLobby || !currentUserId) return;

    try {
      await leaveLobby(Number(id));
      console.log("SignalR LeaveLobby invoked from Game screen");
    } catch (err) {
      console.error("Error calling LeaveLobby:", err);
    }

    // Only delete lobby if last player
    if (signalRLobby.players.length < 1) {
      await handleDeleteLobby();
    }

    router.replace("../main");
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
            lobby?.players?.length === 1 ? handleDeleteLobby : handleLeaveGame
          }
        >
          <Entypo name="cross" size={30} color="#ee2121ff" />
          <Text style={styles.leaveText}>Leave Game</Text>
        </TouchableOpacity>
        <Text style={styles.sectoinTitleText}>Listen To The Singers</Text>
        {recordings.length !== initialPlayerCount ? (
          <Text style={styles.sectoinTitleText}>
            Waiting for other players so sumbit their recordings...
          </Text>
        ) : (
          <>
            {currentPlayer && (
              <View style={styles.playerInfoContainer}>
                <Text style={styles.smallerText}>
                  {currentPlayer.name} is singing
                </Text>
                <Image
                  source={{
                    uri: currentPlayer.photoUrl,
                  }}
                  style={createStyles.bigPlayerIcon}
                />
                <RecordingPlayer
                  key={currentRecording?.url}
                  title={currentRecording?.fileName}
                  uri={currentRecording?.url}
                />
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={nextPlayer}>
              <Text style={styles.buttonText}>
                {currentIndex !== playerCount - 1
                  ? "Next Player"
                  : "Submit Voting"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ImageBackground>
    </View>
  );
}
