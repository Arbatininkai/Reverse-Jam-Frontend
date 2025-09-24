import { StyleSheet } from "react-native";

export const loginStyles = StyleSheet.create({
  formContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    alignItems: "stretch",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
