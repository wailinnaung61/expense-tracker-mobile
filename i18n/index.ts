import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/api";

// Import translations
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import my from "./locales/my.json";

const resources = {
  en: { translation: en },
  ja: { translation: ja },
  my: { translation: my },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  fallbackLng: "en",
  lng: "en", // Will be overridden by stored language
  interpolation: {
    escapeValue: false,
  },
});

// Load saved language preference
storage.getItem(STORAGE_KEYS.LANGUAGE).then((lang) => {
  if (lang && ["en", "ja", "my"].includes(lang)) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;
