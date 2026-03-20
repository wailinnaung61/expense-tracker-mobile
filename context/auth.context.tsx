import { STORAGE_KEYS } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { AuthTokens, User } from "@/types/api.types";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (
    usernameOrEmail: string,
    password: string,
  ) => Promise<{ requiresMfa: boolean; mfaChallenge?: unknown }>;
  signUp: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ userId: string }>;
  signOut: () => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function storeTokens(tokens: AuthTokens, username?: string) {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.ID_TOKEN, tokens.idToken),
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    username
      ? SecureStore.setItemAsync(STORAGE_KEYS.USERNAME, username)
      : Promise.resolve(),
  ]);
}

async function clearTokens() {
  await Promise.all(
    Object.values(STORAGE_KEYS).map((k) => SecureStore.deleteItemAsync(k)),
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function signIn(usernameOrEmail: string, password: string) {
    const result = await authService.signIn(usernameOrEmail, password);
    if (!result.requiresMfa && result.tokens) {
      await storeTokens(result.tokens, usernameOrEmail);
      const userData = await authService.getMe();
      setUser(userData);
    }
    return {
      requiresMfa: result.requiresMfa,
      mfaChallenge: result.mfaChallenge ?? undefined,
    };
  }

  async function signUp(username: string, email: string, password: string) {
    const result = await authService.signUp(username, email, password);
    return { userId: result.userId };
  }

  async function signOut() {
    try {
      await authService.signOut();
    } catch {
      // sign out locally even if API fails
    } finally {
      await clearTokens();
      setUser(null);
    }
  }

  async function confirmSignUp(username: string, code: string) {
    await authService.confirmSignUp(username, code);
  }

  async function refreshUser() {
    const userData = await authService.getMe();
    setUser(userData);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        confirmSignUp,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
