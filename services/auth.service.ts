import api from "@/lib/api";
import { AuthTokens, SignInResponse, User } from "@/types/api.types";

export const authService = {
  signUp: (username: string, email: string, password: string) =>
    api.post("/Auth/signup", { username, email, password }).then((r) => r.data),

  signIn: (
    usernameOrEmail: string,
    password: string,
  ): Promise<SignInResponse> => {
    console.log("🔐 Sign-in attempt:", { usernameOrEmail });
    return api
      .post("/Auth/signin", { usernameOrEmail, password })
      .then((r) => {
        console.log("✅ Sign-in success:", r.data);
        return r.data;
      })
      .catch((err) => {
        console.error("❌ Sign-in error:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
          data: err.response?.data,
        });
        throw err;
      });
  },

  confirmSignUp: (username: string, confirmationCode: string) =>
    api
      .post("/Auth/confirm", { username, confirmationCode })
      .then((r) => r.data),

  resendConfirmation: (username: string) =>
    api.post("/Auth/resend-confirmation", { username }).then((r) => r.data),

  refresh: (refreshToken: string, username: string): Promise<AuthTokens> =>
    api.post("/Auth/refresh", { refreshToken, username }).then((r) => r.data),

  forgotPassword: (usernameOrEmail: string) =>
    api.post("/Auth/forgot-password", { usernameOrEmail }).then((r) => r.data),

  resetPassword: (
    usernameOrEmail: string,
    confirmationCode: string,
    newPassword: string,
  ) =>
    api
      .post("/Auth/reset-password", {
        usernameOrEmail,
        confirmationCode,
        newPassword,
      })
      .then((r) => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api
      .post("/Auth/change-password", { oldPassword, newPassword })
      .then((r) => r.data),

  signOut: () => api.post("/Auth/signout").then((r) => r.data),

  getMe: (): Promise<User> => api.get("/Auth/me").then((r) => r.data),

  updateProfile: (userName: string, email: string): Promise<User> =>
    api.put("/Auth/profile", { userName, email }).then((r) => r.data),

  resendEmailVerification: () =>
    api.post("/Auth/resend-email-verification").then((r) => r.data),

  confirmEmailChange: (confirmationCode: string) =>
    api
      .post("/Auth/confirm-email-change", { confirmationCode })
      .then((r) => r.data),
};
