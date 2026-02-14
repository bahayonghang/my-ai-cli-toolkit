/**
 * i18n Configuration - Internationalization setup
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

// Language resources
const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

function applyDocumentLanguage(langCode: "en" | "zh") {
  if (typeof document !== "undefined") {
    document.documentElement.lang = langCode;
  }
}

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

applyDocumentLanguage("en");

/**
 * Change the current language
 */
export function changeLanguage(lang: "english" | "chinese") {
  const langCode: "en" | "zh" = lang === "chinese" ? "zh" : "en";
  i18n.changeLanguage(langCode);
  applyDocumentLanguage(langCode);
}

/**
 * Get current language code
 */
export function getCurrentLanguage(): "english" | "chinese" {
  return i18n.language === "zh" ? "chinese" : "english";
}

export default i18n;
