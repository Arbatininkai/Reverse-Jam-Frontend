import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  pageTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  createButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: "#f194ff",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginBottom: 20,
    width: 200,
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#808080",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#0f78ceff",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
