import { create } from "zustand";
import { authService } from "@/services";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/api";
import type { User, SignInResponse, AuthTokens } from "@/types/api.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // MFA state
  requiresMfa: boolean;
  mfaSession: string | null;
  mfaUsername: string | null;
  
  // Actions
  signIn: (usernameOrEmail: string, password: string) => Promise<SignInResponse>;
  verifyMfa: (totpCode: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  requiresMfa: false,
  mfaSession: null,
  mfaUsername: null,

  signIn: async (usernameOrEmail: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.signIn(usernameOrEmail, password);
      
      if (result.requiresMfa && result.mfaChallenge) {
        // MFA required - store challenge info
        set({
          requiresMfa: true,
          mfaSession: result.mfaChallenge.session,
          mfaUsername: result.mfaChallenge.username,
          isLoading: false,
        });
      } else {
        // No MFA - load user
        const user = await authService.getMe();
        set({
          user,
          isAuthenticated: true,
          requiresMfa: false,
          mfaSession: null,
          mfaUsername: null,
          isLoading: false,
        });
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Sign in failed";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyMfa: async (totpCode: string) => {
    const { mfaSession, mfaUsername } = get();
    if (!mfaSession || !mfaUsername) {
      throw new Error("No MFA session available");
    }

    set({ isLoading: true, error: null });
    try {
      await authService.verifyTotp(mfaSession, mfaUsername, totpCode);
      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
        requiresMfa: false,
        mfaSession: null,
        mfaUsername: null,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "MFA verification failed";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signUp: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signUp(username, email, password);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Sign up failed";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        requiresMfa: false,
        mfaSession: null,
        mfaUsername: null,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Load user error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  setUser: (user: User) => set({ user }),
}));
