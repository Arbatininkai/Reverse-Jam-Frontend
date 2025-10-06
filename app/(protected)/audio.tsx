import { Ionicons } from "@expo/vector-icons";
import { Slider } from "@rneui/themed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/styles";
export default function Audio() {
  const router = useRouter();
  const [value, setValue] = useState(50);
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
        <Text style={styles.pageTitle}>Audio</Text>
        <View style={styles.bigBox}>
          <Text style={styles.audioSliderText}>Master volume</Text>

          <View style={{ alignItems: "center", gap: 10 }}>
            <Text style={{ color: "#fff", fontSize: 20 }}>
              Volume: {value.toFixed(0)}%
            </Text>
            <Slider
              value={value}
              onValueChange={(v) => setValue(v)}
              maximumValue={100}
              minimumValue={0}

              thumbStyle={{ height: 20, width: 20 }}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#6121afff"
              step={1}
              style={{ width: 300, height: 40 }}

            />
          </View>
        </View>


      </ImageBackground>
    </View>
  );

}