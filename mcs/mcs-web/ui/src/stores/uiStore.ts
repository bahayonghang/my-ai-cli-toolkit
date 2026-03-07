import { create } from "zustand";
import { resolveInitialLocale, type Locale } from "@/i18n/locale";

type ColorMode = "light" | "dark";
const COLOR_MODE_KEY = "mcs-color-mode";
const LOCALE_KEY = "mcs-locale";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(key);
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, value);
}

interface UiState {
  colorMode: ColorMode;
  locale: Locale;
  drawerOpen: boolean;
  notification: { message: string; severity: "success" | "error" | "info" | "warning" } | null;
  toggleColorMode: () => void;
  setLocale: (locale: Locale) => void;
  setDrawerOpen: (open: boolean) => void;
  showNotification: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
  clearNotification: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  colorMode: (readStorage(COLOR_MODE_KEY) as ColorMode) ?? "dark",
  locale: resolveInitialLocale(
    readStorage(LOCALE_KEY),
    typeof navigator === "undefined" ? undefined : navigator.language
  ),
  drawerOpen: true,
  notification: null,

  toggleColorMode: () => {
    set((state) => {
      const next = state.colorMode === "light" ? "dark" : "light";
      writeStorage(COLOR_MODE_KEY, next);
      return { colorMode: next };
    });
  },

  setLocale: (locale) => {
    writeStorage(LOCALE_KEY, locale);
    set({ locale });
  },

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  showNotification: (message, severity = "info") => {
    set({ notification: { message, severity } });
  },

  clearNotification: () => set({ notification: null }),
}));
