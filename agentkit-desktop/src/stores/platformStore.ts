/**
 * Platform Store - Zustand state management for platforms
 */

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { PlatformInfo, Platform } from "@/types";

interface PlatformState {
  platforms: PlatformInfo[];
  selectedPlatforms: Platform[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchPlatforms: () => Promise<void>;
  detectPlatforms: () => Promise<string[]>;
  togglePlatform: (platform: Platform) => void;
  selectAllDetected: () => void;
  clearSelection: () => void;
  clearError: () => void;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  platforms: [],
  selectedPlatforms: [],
  loading: false,
  error: null,

  fetchPlatforms: async () => {
    set({ loading: true, error: null });
    try {
      const platforms = await invoke<PlatformInfo[]>("get_platforms");
      set({ platforms, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  detectPlatforms: async () => {
    set({ loading: true, error: null });
    try {
      const detected = await invoke<string[]>("detect_platforms");
      // Also refresh full platform info
      await get().fetchPlatforms();
      set({ loading: false });
      return detected;
    } catch (error) {
      set({ error: String(error), loading: false });
      return [];
    }
  },

  togglePlatform: (platform) => {
    const { selectedPlatforms } = get();
    const index = selectedPlatforms.indexOf(platform);

    if (index === -1) {
      set({ selectedPlatforms: [...selectedPlatforms, platform] });
    } else {
      set({
        selectedPlatforms: selectedPlatforms.filter((p) => p !== platform),
      });
    }
  },

  selectAllDetected: () => {
    const { platforms } = get();
    const detected = platforms
      .filter((p) => p.detected)
      .map((p) => p.platform);
    set({ selectedPlatforms: detected });
  },

  clearSelection: () => {
    set({ selectedPlatforms: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));
