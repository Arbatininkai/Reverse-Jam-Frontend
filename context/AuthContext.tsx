import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Platform } from "react-native";

type User = { token: string } | null;

type AuthContextType = {
  user: User;
  isLoggedIn: boolean;
  isReady: boolean;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") return localStorage.getItem("token");
    return await SecureStore.getItemAsync("token");
  } catch (err) {
    console.log("Error getting token:", err);
    return null;
  }
};

const setToken = async (token: string) => {
  try {
    if (Platform.OS === "web") localStorage.setItem("token", token);
    else await SecureStore.setItemAsync("token", token);
  } catch (err) {
    console.log("Error setting token:", err);
  }
};

const deleteToken = async () => {
  try {
    if (Platform.OS === "web") localStorage.removeItem("token");
    else await SecureStore.deleteItemAsync("token");
  } catch (err) {
    console.log("Error deleting token:", err);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Load saved token at startup
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          setUser({ token });
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.log("Error fetching token:", err);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Signup
  const signup = async (username: string, email: string, password: string) => {
    // Call to backend, needs to be implemented with an endpoint
    try {
      const res = await axios.post(
        "https://192.168.0.103:8081/api/auth/login",
        {
          username,
          email,
          password,
        }
      );
      if (res.data?.token) {
        await setToken(res.data.token);
        setUser({ token: res.data.token });
        setIsLoggedIn(true);
        router.replace("/");
      } else {
        console.log("Signup failed: no token returned");
      }
    } catch (err: any) {
      console.log("Signup error:", err.response?.data || err.message);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    // Call to backend, needs to be implemented with an endpoint
    try {
      const res = await axios.post(
        "https://192.168.0.103:8081/api/auth/login",
        {
          email,
          password,
        }
      );
      if (res.data?.token) {
        await setToken(res.data.token);
        setUser({ token: res.data.token });
        setIsLoggedIn(true);
        router.replace("/");
      } else {
        console.log("Login failed: no token returned");
      }
    } catch (err: any) {
      console.log("Login error:", err.response?.data || err.message);
    }
  };

  const logout = async () => {
    try {
      await deleteToken();
      setUser(null);
      setIsLoggedIn(false);
      router.replace("../login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, isReady, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
