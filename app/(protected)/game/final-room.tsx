import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { useLobbyManager } from "@/utils/leaving-manager";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View
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

  const first = sortedScores[0];
  const second = sortedScores[1];
  const third = sortedScores[2];

  const findPlayer = (id: string) =>
    parsedPlayers?.find((p: any) => p.id === id);
  
 return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Leave button */}
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

        {/* WINNER TITLE */}
        <Text
          style={{
            fontSize: 40,
            fontWeight: "bold",
            color: "yellow",
            marginTop: 80,
            textAlign: "center",
          }}
        >
          WINNERS!!!
        </Text>

        {/* PODIUM CONTAINER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-end",
            marginTop: 40,
            width: "100%",
            paddingHorizontal: 20,
          }}
        >
          {/* SECOND PLACE */}
          {second && (
            <View style={{ alignItems: "center", marginRight: 10 }}>
              <Text style={{ fontSize: 40 }}>
                {findPlayer(second.userId)?.emoji || "🤓"}
              </Text>
              <Text style={{ color: "white", marginBottom: 6 }}>
                {findPlayer(second.userId)?.name}
              </Text>
              <View
                style={{
                  width: 80,
                  height: 120,
                  backgroundColor: "#d6c8e0",
                  borderRadius: 10,
                }}
              />
            </View>
          )}

          {/* FIRST PLACE */}
          {first && (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 55 }}>
                {findPlayer(first.userId)?.emoji || "😎"}
              </Text>
              <Text style={{ color: "white", marginBottom: 6 }}>
                {findPlayer(first.userId)?.name}
              </Text>
              <View
                style={{
                  width: 110,
                  height: 170,
                  backgroundColor: "gold",
                  borderRadius: 10,
                  borderWidth: 3,
                  borderColor: "#00aaff",
                }}
              />
            </View>
          )}

          {/* THIRD PLACE */}
          {third && (
            <View style={{ alignItems: "center", marginLeft: 10 }}>
              <Text style={{ fontSize: 40 }}>
                {findPlayer(third.userId)?.emoji || "🤯"}
              </Text>
              <Text style={{ color: "white", marginBottom: 6 }}>
                {findPlayer(third.userId)?.name}
              </Text>
              <View
                style={{
                  width: 80,
                  height: 90,
                  backgroundColor: "#b87d3b",
                  borderRadius: 10,
                }}
              />
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}
