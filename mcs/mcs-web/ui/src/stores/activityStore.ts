import { create } from "zustand";

import { getActivityRuns } from "@/api/client";
import type {
  ActivityOperation,
  ActivityRunsPageDto,
  ActivityRunStatus,
  ActivitySurface,
  InstallTargetScope,
  ItemType,
} from "@/types";

export interface ActivityRunsFilters {
  runId?: string;
  platformId?: string;
  surface?: ActivitySurface;
  operation?: ActivityOperation;
  itemType?: ItemType;
  status?: ActivityRunStatus;
  targetScope?: InstallTargetScope;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface ActivityState {
  data: ActivityRunsPageDto | null;
  loading: boolean;
  error: string | null;
  lastQueryKey: string | null;
  fetchRuns: (filters: ActivityRunsFilters, signal?: AbortSignal) => Promise<void>;
  refreshRuns: (filters: ActivityRunsFilters) => Promise<void>;
}

function queryKey(filters: ActivityRunsFilters) {
  return JSON.stringify(filters);
}

export const useActivityStore = create<ActivityState>((set) => ({
  data: null,
  loading: false,
  error: null,
  lastQueryKey: null,

  fetchRuns: async (filters, signal) => {
    set({ loading: true, error: null });
    try {
      const data = await getActivityRuns(filters, signal);
      set({ data, loading: false, lastQueryKey: queryKey(filters) });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      set({ error: (error as Error).message, loading: false });
    }
  },

  refreshRuns: async (filters) => {
    set({ lastQueryKey: null });
    await useActivityStore.getState().fetchRuns(filters);
  },
}));
