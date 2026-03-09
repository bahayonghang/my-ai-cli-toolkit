import { create } from "zustand";
import type { PlatformDisplay } from "@/types";
import {
  getPlatforms,
  refreshContent as refreshContentApi,
} from "@/api/client";

interface PlatformState {
  platforms: PlatformDisplay[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  fetchPlatforms: () => Promise<void>;
  refreshPlatforms: () => Promise<void>;
  selectPlatform: (id: string) => void;
}

export const usePlatformStore = create<PlatformState>((set, get) => {
  let fetchPromise: Promise<void> | null = null;

  const loadPlatforms = async (blocking: boolean) => {
    if (fetchPromise) {
      return fetchPromise;
    }

    if (blocking) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    fetchPromise = (async () => {
      try {
        const platforms = await getPlatforms();
        set({ platforms, loading: false });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  };

  return {
    platforms: [],
    selectedId: null,
    loading: false,
    error: null,

    fetchPlatforms: async () => {
      if (get().platforms.length > 0) {
        return;
      }
      await loadPlatforms(true);
    },

    refreshPlatforms: async () => {
      set({ loading: true, error: null });
      try {
        await refreshContentApi();
        const platforms = await getPlatforms();
        set({ platforms, loading: false });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      }
    },

    selectPlatform: (id: string) => {
      set({ selectedId: id });
    },
  };
});
