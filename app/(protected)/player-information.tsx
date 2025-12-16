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
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 3;

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(() => {
    setLobbies([]);
    setPage(1);
    setHasMore(true);
    getPlayerLobbies(1);
  }, [user?.token]);

  const getPlayerLobbies = async (pageNumber: number) => {
    if (!user?.token || isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Lobby/user?page=${pageNumber}&pageSize=${PAGE_SIZE}`,
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

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
      console.log(data);

      setLobbies((prev) => [...prev, ...data]);
      setPage(pageNumber);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
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
            {user?.emoji ? (
              <Text style={{ fontSize: 100 }}>
                {String.fromCodePoint(parseInt(user.emoji, 16))}
              </Text>
            ) : (
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
            )}
            <Text
              style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}
            >
              {user?.name}
            </Text>

            {lobbies.length > 0 ? (
              <>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Lobbies You Have Participated In
                </Text>

                <View style={{ width: "100%" }}>
                  {lobbies.map((l, index) => {
                    const lobby = l.lobby;
                    return (
                      <View
                        key={lobby.id}
                        style={{
                          marginBottom: 25,
                          padding: 15,
                          borderRadius: 30,
                          backgroundColor: "#ddb271ff",
                        }}
                      >
                        <View style={{ marginBottom: 10 }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              marginBottom: 5,
                              textAlign: "center",
                            }}
                          >
                            #{index + 1} Lobby Code: {lobby.lobbyCode}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              marginBottom: 3,
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            Total players: {lobby.players?.length || 0}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              marginBottom: 5,
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            Total rounds: {lobby.totalRounds || 0}
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            marginBottom: 10,
                            textAlign: "center",
                          }}
                        >
                          Your recordings:
                        </Text>

                        {lobby.recordings
                          ?.filter(
                            (recording: any) => recording.userId === user?.id
                          )
                          .map((recording: any) => (
                            <View
                              key={recording.id}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                                justifyContent: "center",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "column",
                                  gap: 5,
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    marginRight: 10,
                                    textAlign: "center",
                                    fontWeight: "600",
                                  }}
                                >
                                  Round: {recording.round}
                                </Text>
                                <RecordingPlayer uri={recording.url} />
                                {lobby.aiRate && (
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      marginRight: 10,
                                      textAlign: "center",
                                      fontWeight: "600",
                                    }}
                                  >
                                    AI Score:{" "}
                                    {Number(recording.aiScore).toFixed(2)}/5
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))}
                      </View>
                    );
                  })}
                  {hasMore && (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { marginTop: 10, opacity: isLoading ? 0.6 : 1 },
                      ]}
                      onPress={() => getPlayerLobbies(page + 1)}
                      disabled={isLoading}
                    >
                      <Text style={styles.buttonText}>
                        {isLoading ? "Loading..." : "Load More"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <Text
                style={{ fontSize: 20, marginBottom: 5, textAlign: "center" }}
              >
                You have not participated in any lobbies yet.
              </Text>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
