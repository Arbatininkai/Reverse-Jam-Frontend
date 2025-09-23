import { AuthContext } from "@/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { useContext } from "react";

export default function ProtectedLayout() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  if (!authContext.isReady) {
    return null;
  }

  if (authContext.isReady && !authContext.isLoggedIn) {
    router.replace("../login");
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#333333",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: true,
      }}
    />
  );
}
