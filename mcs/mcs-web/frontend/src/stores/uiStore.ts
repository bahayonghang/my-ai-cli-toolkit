import { create } from "zustand";

type ColorMode = "light" | "dark";

interface UiState {
  colorMode: ColorMode;
  drawerOpen: boolean;
  notification: { message: string; severity: "success" | "error" | "info" | "warning" } | null;
  toggleColorMode: () => void;
  setDrawerOpen: (open: boolean) => void;
  showNotification: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
  clearNotification: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  colorMode: (localStorage.getItem("mcs-color-mode") as ColorMode) ?? "dark",
  drawerOpen: true,
  notification: null,

  toggleColorMode: () => {
    set((state) => {
      const next = state.colorMode === "light" ? "dark" : "light";
      localStorage.setItem("mcs-color-mode", next);
      return { colorMode: next };
    });
  },

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  showNotification: (message, severity = "info") => {
    set({ notification: { message, severity } });
  },

  clearNotification: () => set({ notification: null }),
}));
