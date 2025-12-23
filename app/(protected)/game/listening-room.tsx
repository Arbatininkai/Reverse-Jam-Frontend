import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { createStyles } from "@/styles/createStyles";
import { styles } from "@/styles/styles";
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
import RecordingPlayer from "./recording-player";

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL
    : process.env.EXPO_PUBLIC_BASE_URL;

export default function ListeningRoom() {
  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.id;
  const tokenId = user?.token;

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [lobby, setLobby] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const { lobby: signalRLobby, nextPlayer, connectionRef } = useSignalR();
  const [allRecordingsReady, setAllRecordingsReady] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHumanVoting, setIsHumanVoting] = useState(true);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [hasSubmittedVote, setHasSubmittedVote] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  const playerCount = lobby?.players?.length || 0;
  const totalRounds = lobby?.totalRounds || 1;
  const canOwnerAdvance = voteCount >= playerCount - 1 || !isHumanVoting;

  const currentPlayer = lobby?.players?.[currentIndex];
  const currentRound = lobby?.currentRound || 0;
  const currentRecording = recordings.find(
    (r) => r.userId === currentPlayer?.id && r.round === currentRound + 1
  );

  const isCurrentPlayerSelf = currentPlayer?.id === currentUserId;
  const isLastPlayer = currentIndex === playerCount - 1;
  const isLastRound = currentRound === totalRounds - 1;
  const aiVotingScore =
    lobby?.aiRate && currentRecording?.aiScore != null
      ? currentRecording.aiScore
      : null;

  useEffect(() => {
    console.log(signalRLobby);
    if (signalRLobby && recordings.length > 0) {
      if (
        recordings.length ===
          signalRLobby.players.length * signalRLobby.totalRounds &&
        !allRecordingsReady
      ) {
        setLobby(signalRLobby);
        if (!signalRLobby.humanRate) setIsHumanVoting(false);
        setAllRecordingsReady(true);
      }
      setCurrentIndex(signalRLobby?.currentPlayerIndex || 0);
    }
  }, [signalRLobby, recordings]);

  useEffect(() => {
    if (!signalRLobby) return;
    const fetchRecordings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Recordings/${signalRLobby.lobbyCode}/recordings`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${tokenId}` },
          }
        );
        if (!response.ok) throw new Error(await response.text());
        const files = await response.json();

        setRecordings(files);
        console.log("Recordings fetched:", files);
      } catch (err) {
        console.error("Error fetching recordings:", err);
      }
    };
    fetchRecordings();
  }, [signalRLobby]);

  useEffect(() => {
    setSelectedScore(null);
    setHasSubmittedVote(false);
    setVoteCount(0);
  }, [currentIndex]);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) return;
    connection.on("PlayerVoted", () => {
      console.log("Someone voted, increasing vote count");
      setVoteCount((prev) => prev + 1);
    });
    return () => {
      connection.off("PlayerVoted");
    };
  }, [connectionRef.current]);

  const handleEmojiPress = (score: number) => {
    if (!currentPlayer || isCurrentPlayerSelf) return;
    setSelectedScore(score);
    console.log(`Selected rating ${score} for ${currentPlayer.name}`);
  };

  const handleNextAction = async () => {
    if (!isLastPlayer) {
      nextPlayer(Number(id));
      return;
    }

    if (!isLastRound) {
      nextPlayer(Number(id));
      return;
    }

    try {
      await calculateFinalScores();
    } catch (err) {
      console.error("Error calculating final scores:", err);
      alert("Failed to calculate final scores. Please try again.");
    }
  };

  const handleSubmitVote = async () => {
    if (!currentPlayer || !selectedScore) {
      alert("Please select a rating before submitting!");
      return;
    }
    try {
      const vote = [
        {
          targetUserId: currentPlayer.id,
          score: selectedScore,
        },
      ];
      const response = await fetch(`${API_BASE_URL}/api/game/submit-votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
        body: JSON.stringify({
          lobbyCode: lobby.lobbyCode,
          round: currentRound,
          votes: vote,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit vote: ${errorText}`);
      }
      const result = await response.json();
      console.log("Vote submitted successfully:", result);
      setHasSubmittedVote(true);

      if (connectionRef.current) {
        await connectionRef.current.invoke("NotifyPlayerVoted", Number(id));
      }
    } catch (err) {
      console.error("Error submitting vote:", err);
      alert("Failed to submit vote. Please try again.");
    }
  };

  const calculateFinalScores = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/game/calculate-final-scores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenId}`,
          },
          body: JSON.stringify(lobby.lobbyCode),
        }
      );
      let result;
      if (response.ok) {
        result = await response.json();
      } else {
        result = { scores: [] };
      }
      console.log("Final scores calculated:", result);

      const totalAiScoresPerUser = recordings?.reduce((acc, recording) => {
        const userId = recording.userId;
        const aiScore = recording.aiScore || 0;

        if (!acc[userId]) {
          acc[userId] = 0;
        }

        acc[userId] += aiScore;
        return acc;
      }, {} as Record<number, number>);

      router.replace({
        pathname: "/(protected)/game/final-room",
        params: {
          id: id,
          lobbyCode: lobby.lobbyCode,
          scores: JSON.stringify(result.scores),
          players: JSON.stringify(lobby.players),
          totalAiScore: JSON.stringify(totalAiScoresPerUser),
        },
      });
      if (connectionRef.current) {
        await connectionRef.current.invoke(
          "NotifyFinalScores",
          Number(id),
          result.scores
        );
      }
    } catch (err) {
      console.error("Error calculating final scores:", err);
    }
  };

  const emojis = [
    { emoji: "🤮", score: 1 },
    { emoji: "😓", score: 2 },
    { emoji: "😐", score: 3 },
    { emoji: "😍", score: 4 },
    { emoji: "🤩", score: 5 },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitleText, { marginTop: 80 }]}>
            Listen To The Singers
          </Text>
          <Text style={styles.sectionTitleText}>
            Round: {currentRound + 1} / {totalRounds}
          </Text>
          <Text style={styles.smallerText}>
            Player: {currentIndex + 1} / {playerCount}
          </Text>

          {!allRecordingsReady ? (
            <Text style={styles.smallerText}>
              Waiting for all players to submit their recordings...
            </Text>
          ) : (
            <>
              {currentPlayer && currentRecording && (
                <View style={styles.playerInfoContainer}>
                  <Text style={styles.smallerText}>
                    {currentPlayer.name} is singing
                    {isCurrentPlayerSelf && " (You)"}
                  </Text>
                  {currentPlayer?.emoji ? (
                    <Text style={{ fontSize: 80 }}>
                      {String.fromCodePoint(parseInt(currentPlayer.emoji, 16))}
                    </Text>
                  ) : (
                    <Image
                      source={{ uri: currentPlayer?.photoUrl }}
                      style={createStyles.playerIcon}
                    />
                  )}
                  <RecordingPlayer
                    key={currentRecording.url}
                    title={currentRecording.fileName}
                    uri={currentRecording.url}
                  />
                </View>
              )}

              {!isCurrentPlayerSelf && !hasSubmittedVote && isHumanVoting && (
                <>
                  <View style={styles.wideButton}>
                    {emojis.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleEmojiPress(item.score)}
                        style={{
                          padding: 5,
                          backgroundColor:
                            selectedScore === item.score
                              ? "#ffffffaa"
                              : "transparent",
                          borderRadius: 100,
                        }}
                      >
                        <Text style={styles.emojiText}>{item.emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedScore !== null && (
                    <Text style={styles.smallestText}>
                      Selected rating: {selectedScore}/5 for{" "}
                      {currentPlayer?.name}
                    </Text>
                  )}
                </>
              )}

              {!isCurrentPlayerSelf && !hasSubmittedVote && isHumanVoting && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: "#22c55e", marginTop: 20 },
                    !selectedScore && { opacity: 0.5 },
                  ]}
                  onPress={handleSubmitVote}
                  disabled={!selectedScore}
                >
                  <Text style={styles.buttonText}>Submit Vote</Text>
                </TouchableOpacity>
              )}

              {currentRecording?.aiScore != null && lobby?.aiRate && (
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 0,
                  }}
                >
                  <Text style={styles.mediumText}>
                    {isCurrentPlayerSelf
                      ? "AI Has Rated Your Recording"
                      : `AI rating for ${currentPlayer?.name}`}
                  </Text>
                  <Text style={styles.emojiText}>
                    {emojis[Math.round(aiVotingScore)].emoji}
                  </Text>
                  <Text style={styles.mediumText}>
                    AI rating: {Number(aiVotingScore).toFixed(2)}/5
                  </Text>
                </View>
              )}

              {(isCurrentPlayerSelf || hasSubmittedVote) && isHumanVoting && (
                <Text style={styles.smallestText}>
                  {isCurrentPlayerSelf
                    ? "Other players are rating your recording..."
                    : "Vote submitted! Waiting for next player..."}
                </Text>
              )}

              {(lobby?.ownerId === user?.id ||
                (isLastPlayer && isLastRound)) && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: "#3b82f6",
                      marginTop: 20,
                    },
                    !canOwnerAdvance && { opacity: 0.5 },
                  ]}
                  onPress={async () => {
                    handleNextAction();
                  }}
                  disabled={!canOwnerAdvance}
                >
                  <Text style={styles.buttonText}>
                    {!isLastPlayer
                      ? "Next Player"
                      : !isLastRound
                      ? "Go To Next Round"
                      : "View Final Scores"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
