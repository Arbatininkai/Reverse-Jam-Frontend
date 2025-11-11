import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL
    : process.env.EXPO_PUBLIC_BASE_URL;

export default function FinalRoom() {
  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;
  const tokenId = user?.token;

  const { id, lobbyCode, scores } = useLocalSearchParams();
  const router = useRouter();

  const [lobby, setLobby] = useState<any>(null);
  const [finalScores, setFinalScores] = useState<any[]>([]);
  const { leaveLobby, lobby: signalRLobby, connectionRef } = useSignalR();

  useEffect(() => {
    if (signalRLobby) {
      setLobby(signalRLobby);
      Storage.setItem(`lobby-${id}`, JSON.stringify(signalRLobby));
    }
  }, [signalRLobby]);

  useEffect(() => {
    if (scores) {
      try {
        setFinalScores(JSON.parse(scores as string));
      } catch (err) {}
    }
  }, [scores]);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) return;
    connection.on("FinalScoresReady", (data: any[]) => setFinalScores(data));
    return () => connection.off("FinalScoresReady");
  }, [connectionRef.current]);

  
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

  const playerCount = lobby?.players?.length || 0;
  const totalRounds = lobby?.totalRounds || 1;
  const currentRound = lobby?.currentRound || 0;

  const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);

  const getColor = (index: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    return "#983A3A";
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

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectoinTitleText}>Game Results</Text>
          <Text style={styles.smallerText}>
            Round: {currentRound + 1} / {totalRounds}
          </Text>
          <Text style={styles.smallerText}>Players: {playerCount}</Text>

          {sortedScores.length > 0 ? (
            <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
              <Text style={[styles.sectoinTitleText, { marginBottom: 20 }]}>
                Final Scores
              </Text>
              {sortedScores.map((s, i) => {
                const p = lobby?.players?.find((x: any) => x.id === s.userId);
                return (
                  <View
                    key={s.userId}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: getColor(i),
                      padding: 15,
                      borderRadius: 12,
                      marginVertical: 8,
                      width: "90%",
                      borderWidth: s.userId === currentUserId ? 3 : 0,
                      borderColor: "#ee2121ff",
                    }}
                  >
                    <Image
                      source={{ uri: p?.photoUrl }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        marginRight: 15,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.smallerText, { fontWeight: "bold" }]}>
                        {p?.name || "Unknown Player"}
                        {s.userId === currentUserId && " (You)"}
                      </Text>
                      <Text style={styles.smallestText}>
                        Score: {s.score} points
                      </Text>
                    </View>
                    <Text style={[styles.sectoinTitleText, { fontSize: 20 }]}>
                      #{i + 1}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={styles.sectoinTitleText}>Calculating Scores...</Text>
              <Text style={styles.smallestText}>
                Final results will appear here shortly
              </Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
