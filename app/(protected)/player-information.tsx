import { AuthContext } from "@/context/AuthContext";
import { styles } from "@/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import RecordingPlayer from "./game/recording-player";

export default function PlayerInformation() {
  const router = useRouter();
  const { user } = useContext(AuthContext)!;
  const [lobbies, setLobbies] = useState<any[]>([]);

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(() => {
    const getPlayerLobbies = async () => {
      if (!user?.token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Lobby/get-player-lobbies`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (!response.ok) {
          console.error("Server error:", response.status);
          return;
        }

        const data = await response.json();
        setLobbies(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    getPlayerLobbies();
  }, [user?.token]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingVertical: 40 }}>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              marginHorizontal: 20,
              borderRadius: 20,
              paddingVertical: 30,
              paddingHorizontal: 20,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Image
              source={{ uri: user?.photoUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 3,
                borderColor: "#1cb808",
                marginBottom: 20,
              }}
            />
            <Text
              style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}
            >
              {user?.name}
            </Text>

            <View style={{ width: "100%" }}>
              {lobbies.map((lobby) => (
                <View
                  key={lobby.id}
                  style={{
                    marginBottom: 25,
                    padding: 15,
                    borderRadius: 15,
                    backgroundColor: "#f0f0f0dc",
                  }}
                >
                  <View style={{ marginBottom: 10 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 5,
                      }}
                    >
                      Lobby ID: {lobby.id}
                    </Text>
                    <Text style={{ fontSize: 16, marginBottom: 3 }}>
                      Total players: {lobby.totalPlayers}
                    </Text>
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                      Total rounds: {lobby.totalRounds}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      marginBottom: 10,
                    }}
                  >
                    Your recordings
                  </Text>

                  {lobby.recordings
                    ?.filter((recording: any) => recording?.userId === user?.id)
                    .map((recording: any) => (
                      <View
                        key={recording.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "column",
                            gap: 5,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ fontSize: 16, marginRight: 10 }}>
                            Round: {recording.round}
                          </Text>
                          <RecordingPlayer uri={recording.url} />
                        </View>
                      </View>
                    ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
