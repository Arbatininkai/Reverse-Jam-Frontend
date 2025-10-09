import { AuthContext } from "@/context/AuthContext";
import { styles } from "@/styles/styles";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import MusicPlayer from "./musicPlayer";

export default function Game() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();

  const [lobby, setLobby] = useState<any>(null);

  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;

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

        <Text style={styles.smallerText}>Song name that is playing</Text>

        <View style={styles.songOptionsContainer}>
          <Feather
            name="mic"
            size={50}
            color="#f1ededfa"
            style={styles.sideIcon}
          />

          <MusicPlayer />

          <Feather
            name="refresh-ccw"
            size={50}
            color="#f1ededfa"
            style={styles.sideIcon}
          />
        </View>
      </ImageBackground>
    </View>
  );
}
