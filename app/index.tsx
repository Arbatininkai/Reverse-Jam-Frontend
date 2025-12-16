import { AuthContext } from "@/context/AuthContext";
import { loginStyles } from "@/styles/loginStyles";
import { styles } from "@/styles/styles";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { ImageBackground, Text, View } from "react-native";

export default function Index() {
  const auth = useContext(AuthContext)!;
  const router = useRouter();

  return (
    <View style={loginStyles.container}>
      <ImageBackground
        source={require("../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        

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
