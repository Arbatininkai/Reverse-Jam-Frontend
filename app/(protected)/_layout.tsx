import { AuthContext } from "@/context/AuthContext";
import { SignalRProvider } from "@/context/SignalRContext";
import { Stack, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";

export default function ProtectedLayout() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Only attempt redirect after mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && auth && !auth.isLoggedIn) {
      router.replace("/login");
    }
  }, [auth?.isLoggedIn, isMounted]);

  return (
    <SignalRProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#333333" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: false,
        }}
      />
    </SignalRProvider>
  );
}
