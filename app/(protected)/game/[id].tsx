import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MusicPlayer from "./music-player";

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL
    : process.env.EXPO_PUBLIC_BASE_URL;

export default function Game() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();

  const [lobby, setLobby] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);

  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;
  const tokenId = user?.token;

  const { leaveLobby, lobby: signalRLobby } = useSignalR();

  // Make it so that the user cannot swipe back to the previous page
  useEffect(() => {
    const backHandler = () => true; // block hardware back
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backHandler
    );
    return () => subscription.remove();
  }, []);

  // Load lobby data from storage
  useEffect(() => {
    if (signalRLobby) {
      setLobby(signalRLobby);
      Storage.setItem(`lobby-${id}`, JSON.stringify(signalRLobby));
    }
  }, [signalRLobby]);

  // Load selected song
  useEffect(() => {
    const loadSong = async () => {
      const storedSong = await Storage.getItem(`song-${id}`);
      if (storedSong) {
        setTrack(JSON.parse(storedSong));
      }
    };
    loadSong();
  }, [id]);

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

    // Remove player via SignalR
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

        <Text style={styles.sectoinTitleText}>Listen And Repeat</Text>

        {track && (
          <>
            <Text style={styles.smallerText}>{track.artist}</Text>
            <Text style={styles.smallerText}>{track.name}</Text>

            <Image
              source={{ uri: track.coverUrl }}
              style={{
                width: 240,
                height: 240,
                alignSelf: "center",
                marginTop: 20,
                borderRadius: 12,
              }}
            />

            <MusicPlayer audioUrl={track.url} />
          </>
        )}
      </ImageBackground>
    </View>
  );
}
