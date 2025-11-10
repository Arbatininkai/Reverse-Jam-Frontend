import { AuthContext } from "@/context/AuthContext";
import { Storage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ImageBackground,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/styles";

export default function Name() {
  const router = useRouter();
  const icons = ["\u{1F600}", "🤠", "🥸", "😎", "🧐"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextIcon = () => {
    setCurrentIndex((prev) => (prev + 1) % icons.length);
  };

  const prevIcon = () => {
    setCurrentIndex((prev) => (prev - 1 + icons.length) % icons.length);
  };

  const { user, setUser } = useContext(AuthContext)!;
  const tokenId = user?.token;

  const [buttonText, setButtonText] = useState(user?.name || "");

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_URL
      : process.env.EXPO_PUBLIC_BASE_URL;

  const saveName = async () => {
    const response = await fetch(`${API_BASE_URL}/api/Player/name-change`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify({ name: buttonText }),
    });

    if (response.ok) {
      const updatedUser = { ...user!, name: buttonText };
      setUser(updatedUser);
      await Storage.setItem("user", JSON.stringify(updatedUser));
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
        <Text style={styles.pageTitle}>Select Icon😃</Text>

        <View style={{ alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 200 }}>{icons[currentIndex]}</Text>

          <View style={{ flexDirection: "row", gap: 20 }}>
            <TouchableOpacity
              onPress={prevIcon}
              style={styles.triangleLeft}
            ></TouchableOpacity>

            <TouchableOpacity
              onPress={nextIcon}
              style={styles.triangleRight}
            ></TouchableOpacity>
          </View>
          <Text style={styles.sectoinTitleText}>Change name</Text>

          <TextInput
            style={[styles.button, styles.buttonText, { textAlign: "center" }]}
            placeholder="Enter name"
            placeholderTextColor="#ffffff"
            value={buttonText}
            onChangeText={setButtonText}
            keyboardType="numeric"
            maxLength={17}
          />

          <TouchableOpacity style={styles.button} onPress={saveName}>
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
