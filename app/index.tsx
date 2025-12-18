import { AuthContext } from "@/context/AuthContext";
import { loginStyles } from "@/styles/loginStyles";
import { styles } from "@/styles/styles";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { Redirect } from "expo-router";
import React, { useContext } from "react";
import { ActivityIndicator, ImageBackground, Text, View } from "react-native";

export default function Index() {
  const auth = useContext(AuthContext)!;

  if (!auth.isAuthLoading && auth.isLoggedIn) {
    return <Redirect href="/(protected)/main" />;
  }

  return (
    <View style={loginStyles.container}>
      <ImageBackground
        source={require("../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={loginStyles.formContainer}>
          {auth.isAuthLoading ? (
            <>
              <Text style={loginStyles.label}>Logging in...</Text>
              <ActivityIndicator size={80} color="white" />
            </>
          ) : (
            <>
              <Text style={loginStyles.label}>Login with Google</Text>
              <Text style={loginStyles.label}>
                Sign in to access your account
              </Text>
              <GoogleSigninButton
                style={loginStyles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={auth.loginWithGoogle}
              />
            </>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}
