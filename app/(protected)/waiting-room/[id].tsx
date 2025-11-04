import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { createStyles } from "@/styles/createStyles";
import { Storage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
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
  const pathname = usePathname();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { user } = useContext(AuthContext)!;
  const tokenId = user?.token;

  const [totalRounds, setTotalRounds] = useState("1");

  const {
    connectionRef,
    connectToLobby,
    leaveLobby,
    startGame,
    lobby,
    setLobby,
  } = useSignalR();

  useEffect(() => {
    const loadLobby = async () => {
      if (!id) return;
      const stored = await Storage.getItem(`lobby-${id}`);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      setLobby(parsed);

      // Connect only if not already connected and we have the lobbyCode
      if (parsed.lobbyCode && !connectionRef.current) {
        try {
          await connectToLobby(parsed.lobbyCode, tokenId);
        } catch (err) {
          console.error("Failed to connect to lobby:", err);
        }
      }
    };

    loadLobby();
  }, [id]);

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

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
      await Storage.removeItem(`lobby-${id}`);
    } catch (err) {
      console.error("Error deleting lobby:", err);
    }
  };

  const handleLeaveLobby = async () => {
    await leaveLobby(Number(id));
    if (pathname !== "/" && lobby?.players?.length !== 1) router.replace("/");
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
            lobby?.players?.length === 1 ? handleDeleteLobby : handleLeaveLobby
          }
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
                  source={{ uri: player.photoUrl || player.pholoUrl }}
                  style={createStyles.playerIcon}
                />
                <Text style={createStyles.playerName}>{player.name}</Text>
              </View>
            ))}
          </View>

          {lobby?.ownerId === user?.id && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.smallerText}>Total Rounds:</Text>
              <Picker
                selectedValue={totalRounds}
                style={{ height: 50, width: 100 }}
                onValueChange={(itemValue) => setTotalRounds(itemValue)}
              >
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
              </Picker>
            </View>
          )}

          {lobby?.ownerId === user?.id && (
            <View style={createStyles.createButtonWrapper}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteLobby}
              >
                <Text style={styles.deleteText}>Delete Lobby</Text>
              </TouchableOpacity>
            </View>
          )}

          {lobby?.ownerId === user?.id && (
            <View style={createStyles.createButtonWrapper}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => startGame(Number(id))}
              >
                <Text style={styles.buttonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
