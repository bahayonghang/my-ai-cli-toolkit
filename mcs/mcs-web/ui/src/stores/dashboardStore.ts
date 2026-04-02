import { create } from "zustand";
import type { DashboardDto } from "@/types";
import { getDashboard } from "@/api/client";

interface DashboardState {
  data: DashboardDto | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => {
  const DASHBOARD_TTL_MS = 30_000;
  let fetchPromise: Promise<void> | null = null;

  const loadDashboard = async (force: boolean) => {
    const { data, lastFetchedAt } = get();
    if (
      !force &&
      data !== null &&
      lastFetchedAt !== null &&
      Date.now() - lastFetchedAt <= DASHBOARD_TTL_MS
    ) {
      return;
    }

    if (fetchPromise) {
      return fetchPromise;
    }

    set({ loading: true, error: null });
    fetchPromise = (async () => {
      try {
        const nextData = await getDashboard();
        set({ data: nextData, loading: false, lastFetchedAt: Date.now() });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  };

  return {
    data: null,
    loading: false,
    error: null,
    lastFetchedAt: null,

    fetchDashboard: async () => {
      await loadDashboard(false);
    },

    refreshDashboard: async () => {
      await loadDashboard(true);
    },
  };
});
