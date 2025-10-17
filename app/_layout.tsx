import { AuthProvider } from "@/context/AuthContext";
import { SignalRProvider } from "@/context/SignalRContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SignalRProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#333333",
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShown: false,
          }}
        />
      </SignalRProvider>
    </AuthProvider>
  );
}
