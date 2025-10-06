import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/styles";

export default function Settings() {
  const router = useRouter();

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
        <Text style={styles.pageTitle}>Settings</Text>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 150,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/name")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Change Name</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/audio")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Audio</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
