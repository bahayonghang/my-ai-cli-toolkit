/**
 * Settings Store - Zustand state management for app settings
 */

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Settings, Theme, Language, LinkMode } from "@/types";
import { changeLanguage } from "@/i18n";

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setDefaultLinkMode: (mode: LinkMode) => Promise<void>;
  clearError: () => void;
}

const defaultSettings: Settings = {
  defaultLinkMode: "symlink" as LinkMode,
  theme: "system" as Theme,
  language: "english" as Language,
  autoDetectPlatforms: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await invoke<Settings>("get_settings");
      set({ settings, loading: false });

      // Apply theme and language
      applyTheme(settings.theme);
      changeLanguage(settings.language);
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    const { settings } = get();
    const merged = { ...settings, ...newSettings };

    set({ loading: true, error: null });
    try {
      await invoke("update_settings", { settings: merged });
      set({ settings: merged, loading: false });

      // Apply theme if changed
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }

      // Apply language if changed
      if (newSettings.language) {
        changeLanguage(newSettings.language);
      }
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  setTheme: async (theme) => {
    await get().updateSettings({ theme });
  },

  setLanguage: async (language) => {
    await get().updateSettings({ language });
  },

  setDefaultLinkMode: async (defaultLinkMode) => {
    await get().updateSettings({ defaultLinkMode });
  },

  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // System theme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}
