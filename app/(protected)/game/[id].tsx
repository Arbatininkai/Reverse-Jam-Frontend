import { AuthContext } from "@/context/AuthContext";
import { styles } from "@/styles/styles";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MusicPlayer from "./music-player";

const JAMENDO_CLIENT_ID = "80fcf0c2";

export default function Game() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();

  const [lobby, setLobby] = useState<any>(null);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>("");
  const [albumCover, setAlbumCover] = useState<string | null>(null);

  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;

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
    const loadLobby = async () => {
      if (id) {
        const stored = await Storage.getItem(`lobby-${id}`);
        if (stored) {
          try {
            setLobby(JSON.parse(stored));
          } catch {
            console.warn("Failed to parse stored lobby data");
          }
        }
      }
    };
    loadLobby();
  }, [id]);

  // Find a random song from Jamendo
  useEffect(() => {
    const getRandomSong = async () => {
      try {
        // Fetch a random track from Jamendo
        const response = await fetch(
          `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&id=2044063`
        );

        if (!response.ok) {
          console.error("Jamendo fetch error:", response.status);
          return;
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const song = data.results[0];
          console.log("Random Jamendo track:", song.audio);
          setTrackUrl(song.audio);
          setTrackName(song.name);
          setAlbumCover(song.album_image);
        }
      } catch (err) {
        console.error("Jamendo fetch error:", err);
      }
    };

    getRandomSong();
  }, []);

  const handleLeaveGame = async () => {
    if (!lobby || !currentUserId) return;

    // Remove the current user from the players list
    const updatedPlayers = lobby.players.filter(
      (player: any) => player.id !== currentUserId
    );

    // Update lobby
    const updatedLobby = { ...lobby, players: updatedPlayers };

    setLobby(updatedLobby);
    await Storage.setItem(`lobby-${id}`, JSON.stringify(updatedLobby));

    router.replace("../main");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveGame}>
          <Entypo name="cross" size={30} color="#ee2121ff" />
          <Text style={styles.leaveText}>Leave Game</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Listen And Repeat</Text>

        <Text style={styles.smallerText}>{trackName}</Text>

        {albumCover && (
          <Image
            source={{ uri: albumCover }}
            style={{
              width: 240,
              height: 240,
              alignSelf: "center",
              marginTop: 20,
              borderRadius: 12,
            }}
          />
        )}

        {trackUrl && <MusicPlayer audioUrl={trackUrl} />}
      </ImageBackground>
    </View>
  );
}
