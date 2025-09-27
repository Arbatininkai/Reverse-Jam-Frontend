import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/styles";

export default function Main() {
  const router = useRouter();
  const { logout, user } = useContext(AuthContext)!;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <Text style={styles.pageTitle}>
          Reverse <Text style={styles.jam}>JAM</Text>
        </Text>
        <Text style={styles.pageTitle}>Signed in as: {user?.name}</Text>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 150,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/join")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/create")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Create Lobby</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={styles.button}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
