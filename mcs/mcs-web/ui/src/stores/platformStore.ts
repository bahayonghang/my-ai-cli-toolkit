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
  lastFetchedAt: number | null;
  fetchPlatforms: () => Promise<void>;
  refreshPlatforms: () => Promise<void>;
  selectPlatform: (id: string) => void;
}

export const usePlatformStore = create<PlatformState>((set, get) => {
  const PLATFORMS_TTL_MS = 60_000;
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
        set({ platforms, loading: false, lastFetchedAt: Date.now() });
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
    lastFetchedAt: null,

    fetchPlatforms: async () => {
      const { lastFetchedAt, platforms } = get();
      if (platforms.length === 0) {
        await loadPlatforms(true);
        return;
      }

      if (
        lastFetchedAt === null ||
        Date.now() - lastFetchedAt > PLATFORMS_TTL_MS
      ) {
        void loadPlatforms(false);
      }
    },

    refreshPlatforms: async () => {
      set({ loading: true, error: null });
      try {
        await refreshContentApi();
        const platforms = await getPlatforms();
        set({ platforms, loading: false, lastFetchedAt: Date.now() });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      }
    },

    selectPlatform: (id: string) => {
      set({ selectedId: id });
    },
  };
});
