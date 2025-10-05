import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";

export default function Index() {
  const auth = useContext(AuthContext)!;
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  // If user is logged in, redirect to home page
  useEffect(() => {
    if (auth.isLoggedIn && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/main");
    }
  }, [auth.isLoggedIn, hasRedirected]);

  // If already logged in, don't render the component
  if (auth.isLoggedIn) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/music-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Welcome</Text>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>


        </View>
      </ImageBackground>
    </View>
  );
}
