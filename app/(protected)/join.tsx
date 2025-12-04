import { useSignalR } from "@/context/SignalRContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AuthContext } from "@/context/AuthContext";
import { styles } from "../../styles/styles";

export default function Join() {
  const router = useRouter();
  const [buttonText, setButtonText] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [hasAutoJoined, setHasAutoJoined] = useState(false);
  const codeLength = 6;
  const { user } = useContext(AuthContext)!;
  const tokenId = user?.token;
  const { connectToLobby, lobby, errorMessage, setErrorMessage } = useSignalR();
  const { seed } = useLocalSearchParams<{ seed?: string }>();

  const normalizedSeed = useMemo(() => {
    if (!seed || typeof seed !== "string") {
      return null;
    }

    return seed
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, codeLength);
  }, [seed]);

  const handleJoinRandomLobby = async () => {
    try {
      await connectToLobby("", tokenId); // pass empty string for random lobby
      setIsJoining(true);
    } catch (err) {
      console.error("Failed to join random lobby:", err);
    }
  };

  const handleJoinLobbyWithCode = async () => {
    try {
      setErrorMessage(null);
      if (buttonText && buttonText.length == codeLength) {
        await connectToLobby(buttonText, tokenId); // pass entered lobby code
        setIsJoining(true);
      } else {
        setErrorMessage("Invalid lobby code");
      }
    } catch (err) {
      console.error("Failed to join random lobby:", err);
    }
  };

  // Automatically join when coming from a deep link with a seed
  useEffect(() => {
    if (
      !normalizedSeed ||
      normalizedSeed.length !== codeLength ||
      hasAutoJoined
    ) {
      return;
    }

    setButtonText(normalizedSeed);
    const joinFromLink = async () => {
      try {
        setErrorMessage(null);
        await connectToLobby(normalizedSeed, tokenId);
        setIsJoining(true);
        setHasAutoJoined(true);
      } catch (err) {
        console.error("Failed to join lobby via link:", err);
        setErrorMessage("Unable to join lobby from link.");
        setHasAutoJoined(false);
        setIsJoining(false);
      }
    };

    joinFromLink();
  }, [
    normalizedSeed,
    codeLength,
    tokenId,
    hasAutoJoined,
    connectToLobby,
    setErrorMessage,
  ]);

  // Redirect to waiting room if found active lobby and if user clicked one of the join buttons
  useEffect(() => {
    if (!isJoining || !lobby) return;

    const timer = setTimeout(() => {
      if (lobby.hasGameStarted) {
        setErrorMessage("This game has already started.");
        setIsJoining(false);
        return;
      }

      if (lobby.id) {
        router.replace(`/waiting-room/${lobby.id}`);
        setIsJoining(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [lobby, isJoining]);

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
            setErrorMessage(null);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={30} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Join Game Screen</Text>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 150,
          }}
        >
          <Text style={styles.sectionTitleText}>Join random lobby</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleJoinRandomLobby}
          >
            <Text style={styles.buttonText}>RANDOM LOBBY</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitleText}>Enter seed</Text>

          <TextInput
            style={[styles.button, styles.buttonText, { textAlign: "center" }]}
            placeholder="#_ _ _ _"
            placeholderTextColor="#ffffff"
            value={buttonText}
            onChangeText={(text) => {
              const cleaned = text
                .replace(/[^a-zA-Z0-9]/g, "")
                .toUpperCase()
                .slice(0, codeLength);
              setButtonText(cleaned);
              setErrorMessage(null);
            }}
            keyboardType="default"
            maxLength={6}
          />

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleJoinLobbyWithCode}
          >
            <Text style={styles.buttonText}>JOIN GAME</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
