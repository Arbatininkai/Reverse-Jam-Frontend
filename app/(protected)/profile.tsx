import { AuthContext } from "@/context/AuthContext";
import { styles } from "@/styles/styles";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const router = useRouter();
  const { user } = useContext(AuthContext)!;

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
          <Ionicons name="arrow-back" size={28} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            margin: 20,
            borderRadius: 20,
            paddingVertical: 30,
            paddingHorizontal: 20,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 5 },
            shadowRadius: 10,
            elevation: 10,
            marginTop: 80,
          }}
        >
          {user?.emoji ? (
            <Text style={{ fontSize: 100 }}>
              {String.fromCodePoint(parseInt(user.emoji, 16))}
            </Text>
          ) : (
            <Image
              source={{ uri: user?.photoUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 3,
                borderColor: "#1cb808",
                marginBottom: 20,
              }}
            />
          )}

          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            {user?.name}
          </Text>
          <Text style={{ fontSize: 16, color: "#292828ff", marginBottom: 5 }}>
            {user?.email}
          </Text>
          <Text style={{ fontSize: 16, color: "#292828ff", marginBottom: 20 }}>
            Total Wins: {user?.totalWins}
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1cb808",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
            }}
            onPress={() => router.push("./name")}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#e09f13ff",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
              marginTop: 10,
            }}
            onPress={() => router.push("./player-information")}
          >
            <AntDesign name="inbox" size={20} color="white" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>
              See Lobby Participations
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
