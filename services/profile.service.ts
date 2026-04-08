import api from "@/lib/api";
import type { ProfileResponse, UpdateProfileRequest } from "@/types/profile.types";

export const profileService = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>("/api/Profile");
    return response.data;
  },

  /**
   * Update current user's profile
   * Supports: phoneNumber, currency, locale, dailyLimit, notificationPreferences
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await api.put<ProfileResponse>("/api/Profile", data);
    return response.data;
  },
};
