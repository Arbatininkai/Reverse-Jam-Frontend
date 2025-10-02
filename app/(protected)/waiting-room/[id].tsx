import { createStyles } from "@/styles/createStyles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../../styles/styles";

export default function Waiting() {
  const router = useRouter();

  //TODO: Implement waiting room

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
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
        <Text style={styles.pageTitle}>Waiting Room</Text>

        <Text style={styles.pageTitle}>Seed</Text>

        <View style={createStyles.createButtonWrapper}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
