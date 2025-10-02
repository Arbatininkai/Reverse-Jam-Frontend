import { styles } from "@/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { loginStyles } from "../../styles/loginStyles";

export default function Login() {
  const auth = useContext(AuthContext)!;
  const router = useRouter();

  return (
    <View style={loginStyles.container}>
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

        <View style={loginStyles.formContainer}>
          <Text style={loginStyles.label}>Login with Google</Text>
          <Text style={loginStyles.label}>Sign in to access your account</Text>
          <GoogleSigninButton
            style={loginStyles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={auth.loginWithGoogle}
            disabled={false}
          />
        </View>
      </ImageBackground>
    </View>
  );
}
