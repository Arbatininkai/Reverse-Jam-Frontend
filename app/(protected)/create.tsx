import { AuthContext } from "@/context/AuthContext";
import { createStyles } from "@/styles/createStyles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { styles } from "../../styles/styles";

export default function Create() {
  const router = useRouter();

  const [isPrivate, setIsPrivate] = useState(false);
  const [aiRate, setAiRate] = useState(true);
  const [humanRate, setHumanRate] = useState(false);

  const { user } = useContext(AuthContext)!;
  const tokenId = user?.token;

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  const handleCreateLobby = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lobby/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
        body: JSON.stringify({
          private: isPrivate,
          aiRate,
          humanRate,
        }),
      });

      if (!response.ok) {
        console.log("Server error:", await response.text());
        return;
      }

      const lobby = await response.json();
      console.log("Lobby created:", lobby);

      // TODO: Send player to waiting room where others can join
    } catch (error) {
      console.log("Failed to create lobby", error);
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
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={30} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={createStyles.title}>Create Lobby</Text>

        <Text style={createStyles.selectText}>Select Lobby Type</Text>

        <RadioButton.Group
          onValueChange={(newValue) => setIsPrivate(newValue === "private")}
          value={isPrivate ? "private" : "public"}
        >
          <View style={createStyles.radioBox}>
            <View style={createStyles.option}>
              <RadioButton
                value="public"
                color="#4CAF50"
                uncheckedColor="#ccc"
              />
              <Text style={createStyles.optionLabel}>Public</Text>
            </View>

            <View style={createStyles.option}>
              <RadioButton
                value="private"
                color="#2196F3"
                uncheckedColor="#ccc"
              />
              <Text style={createStyles.optionLabel}>Private</Text>
            </View>
          </View>
        </RadioButton.Group>

        <Text style={createStyles.selectText}>Select Voting System</Text>

        <RadioButton.Group
          onValueChange={(newValue) => {
            if (newValue === "ai") {
              setAiRate(true);
              setHumanRate(false);
            } else {
              setAiRate(false);
              setHumanRate(true);
            }
          }}
          value={aiRate ? "ai" : "people"}
        >
          <View style={createStyles.radioBox}>
            <View style={createStyles.option}>
              <RadioButton value="ai" color="#FF5722" uncheckedColor="#ccc" />
              <Text style={createStyles.optionLabel}>AI Score</Text>
            </View>

            <View style={createStyles.option}>
              <RadioButton
                value="people"
                color="#f321a3ff"
                uncheckedColor="#ccc"
              />
              <Text style={createStyles.optionLabel}>People Vote</Text>
            </View>
          </View>
        </RadioButton.Group>

        <View style={createStyles.createButtonWrapper}>
          <TouchableOpacity onPress={handleCreateLobby} style={styles.button}>
            <Text style={styles.buttonText}>Create Lobby</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
