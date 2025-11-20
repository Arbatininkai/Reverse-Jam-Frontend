import { AuthContext } from "@/context/AuthContext";
import { createStyles } from "@/styles/createStyles";
import { Storage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox, RadioButton } from "react-native-paper";
import { styles } from "../../styles/styles";

export default function Create() {
  const router = useRouter();

  const [isPrivate, setIsPrivate] = useState(false);
  const [aiRate, setAiRate] = useState(true);
  const [humanRate, setHumanRate] = useState(false);

  const [totalRounds, setTotalRounds] = useState(1);

  const { user } = useContext(AuthContext)!;
  const [errorMessage, setErrorMessage] = useState("");
  const tokenId = user?.token;

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  const handleCreateLobby = async () => {
    try {
      if (!aiRate && !humanRate) {
        setErrorMessage("Please select voting system");
        return;
      }
      setErrorMessage("");
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
          totalRounds,
        }),
      });

      if (!response.ok) {
        console.log("Server error:", await response);
        return;
      }

      const lobby = await response.json();
      console.log("Lobby created:", lobby);

      await Storage.setItem(`lobby-${lobby.id}`, JSON.stringify(lobby));

      router.replace(`/waiting-room/${lobby.id}`);
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
          onPress={() => {
            setErrorMessage("");
            router.back();
          }}
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
          <Text style={createStyles.title}>Create Lobby</Text>

          <Text style={createStyles.selectText}>Select Lobby Type</Text>

          <RadioButton.Group
            onValueChange={(newValue) => setIsPrivate(newValue === "private")}
            value={isPrivate ? "private" : "public"}
          >
            <View style={createStyles.containerBox}>
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

          <View style={createStyles.containerBox}>
            <View style={createStyles.option}>
              <Checkbox
                status={aiRate ? "checked" : "unchecked"}
                onPress={() => {
                  setAiRate(!aiRate);
                  setErrorMessage("");
                }}
                color="#FF5722"
                uncheckedColor="#ccc"
              />
              <Text style={createStyles.optionLabel}>AI Score</Text>
            </View>

            <View style={createStyles.option}>
              <Checkbox
                status={humanRate ? "checked" : "unchecked"}
                onPress={() => {
                  setHumanRate(!humanRate);
                  setErrorMessage("");
                }}
                color="#f321a3ff"
                uncheckedColor="#ccc"
              />
              <Text style={createStyles.optionLabel}>People Vote</Text>
            </View>
          </View>

          {errorMessage && errorMessage != "" && (
            <Text style={[styles.errorText, { marginTop: 10 }]}>
              {errorMessage}
            </Text>
          )}

          <Text style={[createStyles.selectText]}>Select Round Amount</Text>

          <RadioButton.Group
            onValueChange={(newValue) => setTotalRounds(parseInt(newValue))}
            value={totalRounds.toString()}
          >
            <View style={createStyles.numberBox}>
              <View style={createStyles.option}>
                <RadioButton value="1" color="#4CAF50" uncheckedColor="#ccc" />
                <Text style={createStyles.optionLabel}>1</Text>
              </View>

              <View style={createStyles.option}>
                <RadioButton value="2" color="#2196F3" uncheckedColor="#ccc" />
                <Text style={createStyles.optionLabel}>2</Text>
              </View>

              <View style={createStyles.option}>
                <RadioButton value="3" color="#FF9800" uncheckedColor="#ccc" />
                <Text style={createStyles.optionLabel}>3</Text>
              </View>
            </View>
          </RadioButton.Group>

          <View style={createStyles.createButtonWrapper}>
            <TouchableOpacity onPress={handleCreateLobby} style={styles.button}>
              <Text style={styles.buttonText}>Create Lobby</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
