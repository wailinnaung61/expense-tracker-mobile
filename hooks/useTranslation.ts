import { useTranslation as useI18nTranslation } from "react-i18next";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/api";

export type SupportedLanguage = "en" | "ja" | "my";

export const LANGUAGE_OPTIONS = [
  { value: "en" as const, label: "English" },
  { value: "ja" as const, label: "日本語" },
  { value: "my" as const, label: "မြန်မာ" },
];

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  /**
   * Change app UI language (i18next + local storage)
   * This is ONLY for app interface text, NOT for backend notifications
   * Backend notification language is handled separately (profile.locale)
   */
  const changeLanguage = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  return {
    t,
    i18n,
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
  };
};
