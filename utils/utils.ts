import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const Storage = {
  getItem: async (key: string) =>
    Platform.OS === "web"
      ? localStorage.getItem(key)
      : SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) =>
    Platform.OS === "web"
      ? localStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) =>
    Platform.OS === "web"
      ? localStorage.removeItem(key)
      : SecureStore.deleteItemAsync(key),
};
