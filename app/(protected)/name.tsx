import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/styles";
export default function Name() {
  const router = useRouter();
  const icons = ["😀", "🤠", "🥸", "😎", "🧐"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextIcon = () => {
    setCurrentIndex((prev) => (prev + 1) % icons.length);
  };

  const prevIcon = () => {
    setCurrentIndex((prev) => (prev - 1 + icons.length) % icons.length);
  };

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
        <Text style={styles.pageTitle}>Select Icon😃</Text>

        <View style={{ alignItems: "center", gap: 10 }}>

          <Text style={{ fontSize: 200 }}>{icons[currentIndex]}</Text>

          <View style={{ flexDirection: "row", gap: 20 }}>
            <TouchableOpacity
              onPress={prevIcon}
              style={styles.triangleLeft}
            >

            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextIcon}
              style={styles.triangleRight}
            >
            </TouchableOpacity>
          </View>
          <Text style={styles.sectoinTitleText}>Change name</Text>

          <TextInput
            style={[styles.button, styles.buttonText, { textAlign: "center" }]}
            placeholder="Enter name"
            placeholderTextColor="#ffffff"
            value={buttonText}
            onChangeText={setButtonText}
            keyboardType="numeric"
            maxLength={12}
          />

          <TouchableOpacity
            style={styles.button}
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </View>
  );

}