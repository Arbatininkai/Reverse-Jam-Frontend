import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { useLobbyManager } from "@/utils/leaving-manager";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FinalRoom() {
  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;

  const { id, scores, players } = useLocalSearchParams();
  const lobbyId = Array.isArray(id) ? id[0] : id;
  const { handleDeleteLobby, handleLeaveGame } = useLobbyManager();
  const [firstRender, setFirstRender] = useState(true);

  const parsedPlayers =
    typeof players === "string" ? JSON.parse(players) : players;

  const [lobby, setLobby] = useState<any>(null);
  const [finalScores, setFinalScores] = useState<any[]>([]);
  const { lobby: signalRLobby, connectionRef } = useSignalR();

  useEffect(() => {
    if (signalRLobby && firstRender) {
      setLobby(signalRLobby);
      Storage.setItem(`lobby-${id}`, JSON.stringify(signalRLobby));
      setFirstRender(false);
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

  const playerCount = lobby?.players?.length || 0;

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
          onPress={() => {
            if (lobby?.players?.length === 1) {
              handleDeleteLobby(lobbyId);
            } else {
              handleLeaveGame(lobbyId);
            }
          }}
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
          <Text style={styles.smallerText}>Players: {playerCount}</Text>

          {sortedScores.length > 0 ? (
            <View
              style={{ width: "100%", alignItems: "center", marginTop: 20 }}
            >
              <Text style={[styles.sectoinTitleText, { marginBottom: 20 }]}>
                Final Scores
              </Text>
              {sortedScores.map((s, i) => {
                const p = parsedPlayers?.find((x: any) => x.id === s.userId);
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
                      <Text
                        style={[styles.smallerText, { fontWeight: "bold" }]}
                      >
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
              <Text style={styles.smallerText}>No scores available</Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
