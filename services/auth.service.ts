import api, { STORAGE_KEYS } from "@/lib/api";
import { storage } from "@/lib/storage";
import type {
  AuthTokens,
  SignInResponse,
  User,
} from "@/types/api.types";

// Extended types for MFA
export interface MfaSetupResponse {
  secretCode: string;
  qrCodeUri: string;
  session: string;
}

export interface MfaVerifySetupRequest {
  totpCode: string;
  session: string;
}

export interface MfaVerifySetupResponse {
  backupCodes: string[];
  message: string;
  tokens: AuthTokens;
}

export interface MfaStatusResponse {
  mfaEnabled: boolean;
  mfaMethod: string | null;
}

export interface DisableMfaWithBackupCodeRequest {
  username: string;
  backupCode: string;
}

export const authService = {
  // ===== Sign Up & Confirmation =====
  signUp: async (username: string, email: string, password: string) => {
    const response = await api.post("/api/Auth/signup", { username, email, password });
    return response.data;
  },

  confirmSignUp: async (username: string, confirmationCode: string) => {
    const response = await api.post("/api/Auth/confirm", { username, confirmationCode });
    return response.data;
  },

  resendConfirmation: async (username: string) => {
    const response = await api.post("/api/Auth/resend-confirmation", { username });
    return response.data;
  },

  // ===== Sign In =====
  signIn: async (usernameOrEmail: string, password: string): Promise<SignInResponse> => {
    console.log("🔐 Sign-in attempt:", { usernameOrEmail });
    const response = await api.post<SignInResponse>("/api/Auth/signin", {
      usernameOrEmail,
      password,
    });

    console.log("✅ Sign-in response:", response.data);

    // If no MFA required and tokens available, store them
    if (!response.data.requiresMfa && response.data.tokens) {
      await authService.storeTokens(response.data.tokens);
      await storage.setItem(STORAGE_KEYS.USERNAME, usernameOrEmail);
    }

    return response.data;
  },

  // ===== MFA Verification =====
  verifyTotp: async (session: string, username: string, totpCode: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>("/api/Auth/mfa/verify", {
      session,
      username,
      totpCode,
    });

    // Store tokens after successful MFA verification
    await authService.storeTokens(response.data);
    await storage.setItem(STORAGE_KEYS.USERNAME, username);

    return response.data;
  },

  // ===== MFA Setup =====
  setupMfa: async (): Promise<MfaSetupResponse> => {
    const response = await api.post<MfaSetupResponse>("/api/Auth/mfa/setup");
    return response.data;
  },

  verifyMfaSetup: async (data: MfaVerifySetupRequest): Promise<MfaVerifySetupResponse> => {
    const response = await api.post<MfaVerifySetupResponse>("/api/Auth/mfa/setup/verify", data);
    
    // Store updated tokens after MFA setup
    if (response.data.tokens) {
      await authService.storeTokens(response.data.tokens);
    }
    
    return response.data;
  },

  getMfaStatus: async (): Promise<MfaStatusResponse> => {
    const response = await api.get<MfaStatusResponse>("/api/Auth/mfa/status");
    return response.data;
  },

  disableMfa: async (): Promise<{ message: string }> => {
    const response = await api.post("/api/Auth/mfa/disable");
    return response.data;
  },

  disableMfaWithBackup: async (username: string, backupCode: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/api/Auth/mfa/disable-with-backup", {
      username,
      backupCode,
    });
    return response.data;
  },

  // ===== Password Management =====
  forgotPassword: async (usernameOrEmail: string) => {
    const response = await api.post("/api/Auth/forgot-password", { usernameOrEmail });
    return response.data;
  },

  resetPassword: async (
    usernameOrEmail: string,
    confirmationCode: string,
    newPassword: string
  ) => {
    const response = await api.post("/api/Auth/reset-password", {
      usernameOrEmail,
      confirmationCode,
      newPassword,
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await api.post("/api/Auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // ===== User Info & Profile =====
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/api/Auth/me");
    return response.data;
  },

  updateProfile: async (userName: string, email: string): Promise<User> => {
    const response = await api.put<User>("/api/Auth/profile", { userName, email });
    return response.data;
  },

  resendEmailVerification: async () => {
    const response = await api.post("/api/Auth/resend-email-verification");
    return response.data;
  },

  confirmEmailChange: async (confirmationCode: string) => {
    const response = await api.post("/api/Auth/confirm-email-change", { confirmationCode });
    return response.data;
  },

  // ===== Token Management =====
  refresh: async (refreshToken: string, username: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>("/api/Auth/refresh", { refreshToken, username });
    return response.data;
  },

  storeTokens: async (tokens: AuthTokens) => {
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await storage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken);
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  clearTokens: async () => {
    await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.ID_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.USERNAME);
  },

  // ===== Sign Out =====
  signOut: async () => {
    try {
      await api.post("/api/Auth/signout");
    } catch (error) {
      console.error("❌ Sign-out API error:", error);
      // Continue with local sign out even if API fails
    } finally {
      await authService.clearTokens();
    }
  },

  // ===== OAuth =====
  getGoogleAuthUrl: async (redirectUri: string): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>("/api/Auth/google/url", {
      params: { redirectUri },
    });
    return response.data;
  },

  googleCallback: async (code: string, state: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>("/api/Auth/google/callback", { code, state });
    
    // Store tokens after successful Google sign-in
    await authService.storeTokens(response.data);
    
    return response.data;
  },
};
