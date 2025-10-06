import { StyleSheet } from "react-native";

export const createStyles = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 5, height: 5 },
    textShadowRadius: 10,
    marginTop: 10,
  },
  radioBox: {
    alignSelf: "center",
    width: "70%",
    borderWidth: 3,
    marginTop: 20,
    backgroundColor: "#983A3A",
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 10,
  },
  optionLabel: {
    fontSize: 40,
    color: "#fff",
    marginLeft: 8,
  },
  selectText: {
    fontSize: 25,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 5, height: 5 },
    textShadowRadius: 10,
    paddingTop: 20,
    paddingBottom: 10,
    marginLeft: 8,
  },
  createButtonWrapper: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },


});
