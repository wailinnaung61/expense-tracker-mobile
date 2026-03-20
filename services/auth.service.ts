import api from "@/lib/api";
import { AuthTokens, SignInResponse, User } from "@/types/api.types";

export const authService = {
  signUp: (username: string, email: string, password: string) =>
    api.post("/auth/signup", { username, email, password }).then((r) => r.data),

  signIn: (
    usernameOrEmail: string,
    password: string,
  ): Promise<SignInResponse> =>
    api.post("/auth/signin", { usernameOrEmail, password }).then((r) => r.data),

  confirmSignUp: (username: string, confirmationCode: string) =>
    api
      .post("/auth/confirm", { username, confirmationCode })
      .then((r) => r.data),

  resendConfirmation: (username: string) =>
    api.post("/auth/resend-confirmation", { username }).then((r) => r.data),

  refresh: (refreshToken: string, username: string): Promise<AuthTokens> =>
    api.post("/auth/refresh", { refreshToken, username }).then((r) => r.data),

  forgotPassword: (usernameOrEmail: string) =>
    api.post("/auth/forgot-password", { usernameOrEmail }).then((r) => r.data),

  resetPassword: (
    usernameOrEmail: string,
    confirmationCode: string,
    newPassword: string,
  ) =>
    api
      .post("/auth/reset-password", {
        usernameOrEmail,
        confirmationCode,
        newPassword,
      })
      .then((r) => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api
      .post("/auth/change-password", { oldPassword, newPassword })
      .then((r) => r.data),

  signOut: () => api.post("/auth/signout").then((r) => r.data),

  getMe: (): Promise<User> => api.get("/auth/me").then((r) => r.data),

  updateProfile: (userName: string, email: string): Promise<User> =>
    api.put("/auth/profile", { userName, email }).then((r) => r.data),

  resendEmailVerification: () =>
    api.post("/auth/resend-email-verification").then((r) => r.data),

  confirmEmailChange: (confirmationCode: string) =>
    api
      .post("/auth/confirm-email-change", { confirmationCode })
      .then((r) => r.data),
};
