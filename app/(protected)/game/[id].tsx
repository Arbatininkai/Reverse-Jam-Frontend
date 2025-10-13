import { AuthContext } from "@/context/AuthContext";
import { styles } from "@/styles/styles";
import tracks from "@/tracks";
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
  const [track, setTrack] = useState<any>(null);

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

  // Load a local track (random or first)
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      console.log(tracks);
      setTrack(tracks[randomIndex]);
    }
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

        {track && (
          <>
            <Text style={styles.smallerText}>{track.title}</Text>

            <Image
              source={track.albumCover}
              style={{
                width: 240,
                height: 240,
                alignSelf: "center",
                marginTop: 20,
                borderRadius: 12,
              }}
            />

            <MusicPlayer audioUrl={track.reversedAudio} />
          </>
        )}
      </ImageBackground>
    </View>
  );
}
