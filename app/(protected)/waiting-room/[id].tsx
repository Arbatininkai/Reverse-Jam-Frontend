import { AuthContext } from "@/context/AuthContext";
import { createStyles } from "@/styles/createStyles";
import { Storage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
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

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

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
