import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const loginStyles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 70,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  label: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    textAlign: "center",
  },
  googleButton: {
    width: Math.min(width * 0.8, 280),
    height: 48,
    marginTop: 20,
    borderRadius: 8,
  },
});
