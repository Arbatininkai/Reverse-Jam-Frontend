import { Storage } from "@/utils/utils";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { Platform } from "react-native";

type User = {
  id: string;
  email?: string;
  name?: string;
  photoUrl?: string;
  token: string;
  totalWins: number;
  emoji?: string;
} | null;

type DecodedToken = {
  exp: number; // expiration timestamp in seconds
};

type AuthContextType = {
  user: User;
  isLoggedIn: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loginWithGoogle: () => void;
  logout: () => void;
};

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL || "http://10.0.2.2:5000"
    : process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:5000";

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_WEB_CLIENT_ID ||
  "945939078641-no1bls6nnf2s5teqk3m5b1q3kfkorle1.apps.googleusercontent.com";
const IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_IOS_CLIENT_ID ||
  "945939078641-elo0ietkgqcacrhkotlraf1r3vq3bjdm.apps.googleusercontent.com";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  scopes: ["profile", "email"],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // If user was previously logged in, restore their token and user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await Storage.getItem("token");
        const userStr = await Storage.getItem("user");

        if (token && userStr) {
          const decoded: DecodedToken = jwtDecode(token);
          const now = Date.now() / 1000;

          // Check if token is still valid
          if (decoded.exp > now) {
            const res = await fetch(`${API_BASE_URL}/api/auth/userinfo`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              console.log("Failed to fetch user info, clearing storage");
              await Storage.removeItem("token");
              await Storage.removeItem("user");
              return;
            }
            const user = await res.json();
            setUser({ ...user, token });
            await Storage.setItem("user", JSON.stringify(user));
            setIsLoggedIn(true);
            router.replace("/main");
            console.log("Restored user:", user);
          } else {
            console.log("Token expired, removing saved session");
            await Storage.removeItem("token");
            await Storage.removeItem("user");
          }
        }
      } catch (err) {
        console.log("Failed to restore user:", err);
        await Storage.removeItem("token");
        await Storage.removeItem("user");
      }
    };
    loadUser();
  }, []);

  const loginWithGoogle = async () => {
    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }
      await GoogleSignin.signOut();

      // Sign in and get user info
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        console.log("Got Google ID Token");

        // Send ID token to backend for verification and authentication
        const backendResponse = await fetch(
          `${API_BASE_URL}/api/auth/google-signin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(idToken),
          }
        );

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          throw new Error(
            errorData.message || `Backend error: ${backendResponse.status}`
          );
        }

        console.log("STATUS:", backendResponse.status);
        console.log("RAW RESPONSE:", backendResponse);
        const responseData = await backendResponse.json();
        console.log("Backend response:", responseData);

        // Store both token and refresh token
        await Storage.setItem("token", responseData.token);
        await Storage.setItem("user", JSON.stringify(responseData.user));

        setUser({
          id: responseData.user.id,
          email: responseData.user.email,
          name: responseData.user.name,
          photoUrl: responseData.user.photoUrl,
          token: responseData.token,
          totalWins: responseData.user.totalWins,
          emoji: responseData.user.emoji,
        });

        setIsLoggedIn(true);
        router.replace("/main");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      // Handle specific errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available or outdated");
      } else {
        console.log("Some other error happened");
      }
    }
  };

  const logout = async () => {
    try {
      // Sign out from Google
      await GoogleSignin.signOut();

      // Clear local state
      setUser(null);
      setIsLoggedIn(false);
      await Storage.removeItem("token");
      await Storage.removeItem("user");
      router.replace("/");

      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
