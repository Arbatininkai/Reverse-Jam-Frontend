import { useContext, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { loginStyles } from "../../styles/loginStyles";
import { styles } from "../../styles/styles";
import { loginSchema } from "../../validation/validation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const { login } = useContext(AuthContext)!;

  const handleLogin = async () => {
    // Email and password validation
    const result = loginSchema.safeParse({ email, password });

    setEmailError("");
    setPasswordError("");
    setServerError("");

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") setEmailError(issue.message);
        if (issue.path[0] === "password") setPasswordError(issue.message);
      });
      return;
    }
    try {
      await login(email, password);
      console.log("Logging in with:", email, password);
    } catch (err) {
      setServerError("Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Log In</Text>

      <SafeAreaView style={loginStyles.formContainer}>
        <Text style={loginStyles.label}>Email</Text>
        <TextInput
          style={loginStyles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="example.name568@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {emailError ? (
          <Text style={loginStyles.errorText}>{emailError}</Text>
        ) : null}

        <Text style={loginStyles.label}>Password</Text>
        <TextInput
          style={loginStyles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="your password"
          secureTextEntry
        />

        {passwordError ? (
          <Text style={loginStyles.errorText}>{passwordError}</Text>
        ) : null}

        {serverError ? (
          <Text style={loginStyles.errorText}>{serverError}</Text>
        ) : null}

        <TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
          <Text style={loginStyles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
