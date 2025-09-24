import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/styles";

export default function Index() {
  const router = useRouter();
  const { logout } = useContext(AuthContext)!;

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Reverse Singing Game</Text>

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
          style={styles.joinButton}
        >
          <Text style={styles.buttonText}>Join Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/create")}
          style={styles.createButton}
        >
          <Text style={styles.buttonText}>Create Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.settingsButton}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
