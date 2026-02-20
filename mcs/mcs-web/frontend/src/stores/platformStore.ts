import { create } from "zustand";
import type { PlatformDisplay } from "@/types";
import { getPlatforms } from "@/api/client";

interface PlatformState {
  platforms: PlatformDisplay[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  fetchPlatforms: () => Promise<void>;
  selectPlatform: (id: string) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  platforms: [],
  selectedId: null,
  loading: false,
  error: null,

  fetchPlatforms: async () => {
    set({ loading: true, error: null });
    try {
      const platforms = await getPlatforms();
      set({ platforms, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  selectPlatform: (id: string) => {
    set({ selectedId: id });
  },
}));
