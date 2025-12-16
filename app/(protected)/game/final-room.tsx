import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { useLobbyManager } from "@/utils/leaving-manager";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
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

  const { id, scores, players, totalAiScore } = useLocalSearchParams();
  const lobbyId = Array.isArray(id) ? id[0] : id;

  const parsedPlayers =
    typeof players === "string" ? JSON.parse(players) : players;

  const totalAiScoresPerUser =
    typeof totalAiScore === "string" ? JSON.parse(totalAiScore) : {};

  const [lobby, setLobby] = useState<any>(null);
  const [finalScores, setFinalScores] = useState<any[]>([]);
  const { lobby: signalRLobby, connectionRef } = useSignalR();
  const { handleLeaveGame } = useLobbyManager();

  useEffect(() => {
    if (signalRLobby) {
      setLobby(signalRLobby);
      Storage.setItem(`lobby-${id}`, JSON.stringify(signalRLobby));
    }
  }, [signalRLobby]);

  useEffect(() => {
    if (!scores) return setFinalScores([]);
    try {
      const parsed = JSON.parse(scores as string);
      setFinalScores(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFinalScores([]);
    }
  }, [scores]);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) return;

    connection.on("FinalScoresReady", (data: any[]) => setFinalScores(data));
    return () => connection.off("FinalScoresReady");
  }, [connectionRef.current]);

  const rankedPlayers = useMemo(() => {
    return parsedPlayers
      .map((player: any) => {
        const vote = finalScores.find((s) => s.userId === player.id);

        return {
          player,
          voteScore: vote?.totalScore ?? null,
          aiScore:
            totalAiScoresPerUser[player.id] !== undefined
              ? Number(totalAiScoresPerUser[player.id])
              : null,
        };
      })
      .filter((x: any) => x.player)
      .sort((a: any, b: any) => {
        // Priority: voting score if enabled, otherwise AI score
        if (lobby?.humanRate) {
          return (b.voteScore ?? 0) - (a.voteScore ?? 0);
        }
        return (b.aiScore ?? 0) - (a.aiScore ?? 0);
      });
  }, [parsedPlayers, finalScores, totalAiScoresPerUser, lobby]);

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
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => handleLeaveGame(lobbyId)}
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
        >
          <Text style={styles.sectionTitleText}>Game Results</Text>
          <Text style={styles.smallerText}>
            Players: {parsedPlayers.length}
          </Text>

          <Text style={[styles.sectionTitleText, { marginVertical: 20 }]}>
            Final Scores
          </Text>

          {rankedPlayers.map((item: any, i: number) => {
            const { player, voteScore, aiScore } = item;

            return (
              <View
                key={player.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: getColor(i),
                  padding: 15,
                  borderRadius: 12,
                  marginVertical: 8,
                  width: "90%",
                  borderWidth: player.id === currentUserId ? 3 : 0,
                  borderColor: "#ee2121ff",
                }}
              >
                {player.emoji ? (
                  <Text style={{ fontSize: 45 }}>
                    {String.fromCodePoint(parseInt(player.emoji, 16))}
                  </Text>
                ) : (
                  <Image
                    source={{ uri: player.photoUrl }}
                    style={player.playerIcon}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={[styles.smallerText, { fontWeight: "bold" }]}>
                    {player.name} {player.id === currentUserId && "(You)"}
                  </Text>

                  {lobby?.humanRate && voteScore !== null && (
                    <Text style={styles.smallestText}>
                      Voting Score: {voteScore}
                    </Text>
                  )}

                  {lobby?.aiRate && aiScore !== null && (
                    <Text style={styles.smallestText}>
                      AI Score: {aiScore.toFixed(2)}
                    </Text>
                  )}

                  {lobby?.humanRate && !lobby?.aiRate && voteScore === null && (
                    <Text style={styles.smallestText}>No Scores Available</Text>
                  )}
                </View>

                <Text style={[styles.sectionTitleText, { fontSize: 20 }]}>
                  #{i + 1}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
