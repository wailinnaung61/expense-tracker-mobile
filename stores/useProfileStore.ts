import { create } from "zustand";
import { profileService } from "@/services/profile.service";
import type { ProfileResponse, UpdateProfileRequest } from "@/types/profile.types";

interface ProfileState {
  profile: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateNotificationLocale: (locale: string) => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileService.getProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || error.message || "Failed to fetch profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileService.updateProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || error.message || "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Update notification language (backend profile.locale)
   * This is ONLY for email/push notifications, NOT for app UI
   * App UI language is handled separately by i18next (see hooks/useTranslation.ts)
   */
  updateNotificationLocale: async (locale: string) => {
    const { updateProfile } = get();
    await updateProfile({ locale });
  },

  updateCurrency: async (currency: string) => {
    const { updateProfile } = get();
    await updateProfile({ currency });
  },
}));
