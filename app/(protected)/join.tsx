import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "../../styles/styles";

export default function Join() {
  const router = useRouter();
  const [buttonText, setButtonText] = useState("");
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
        <Text style={styles.pageTitle}>Join Game Screen</Text>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 150,
          }}
        >
          <Text style={styles.sectoinTitleText}>Join random lobby</Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>RANDOM LOBBY</Text>
          </TouchableOpacity>

          <Text style={styles.sectoinTitleText}>Enter seed</Text>

          <TextInput
            style={[styles.button, styles.buttonText, { textAlign: "center" }]}
            placeholder="#_ _ _ _"
            placeholderTextColor="#ffffff"
            value={buttonText}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
              setButtonText(cleaned);
            }}
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Join game</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
