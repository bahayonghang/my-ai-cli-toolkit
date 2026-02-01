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

      // Apply theme (no transition on initial load - already applied by inline script)
      applyTheme(settings.theme, false);
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

      // Apply theme with smooth transition when user changes it
      if (newSettings.theme) {
        applyTheme(newSettings.theme, true);
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
 * Apply theme to document with optional smooth transition
 * @param theme - Theme to apply ('dark', 'light', or 'system')
 * @param enableTransition - Whether to enable smooth transition animation
 */
function applyTheme(theme: Theme, enableTransition = false) {
  const root = document.documentElement;

  // Cache theme preference to localStorage for instant load on next visit
  localStorage.setItem("agentkit-theme", theme);

  // Determine if dark mode should be applied
  let isDark = false;
  if (theme === "dark") {
    isDark = true;
  } else if (theme === "light") {
    isDark = false;
  } else {
    // System theme
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Enable transition for smooth theme switching (not on initial load)
  if (enableTransition) {
    root.classList.add("theme-transition");
  }

  // Apply or remove dark class
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Remove transition class after animation completes
  if (enableTransition) {
    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 200);
  }
}
