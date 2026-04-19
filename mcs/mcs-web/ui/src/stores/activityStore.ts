import { create } from "zustand";

import { getActivityRuns } from "@/api/client";
import type {
  ActivityEventDto,
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

export interface ActivityLiveFilters {
  platformId?: string;
  surface?: ActivitySurface;
  operation?: ActivityOperation;
  runId?: string;
}

const LIVE_EVENT_LIMIT = 200;

interface ActivityState {
  data: ActivityRunsPageDto | null;
  loading: boolean;
  error: string | null;
  lastQueryKey: string | null;
  liveEvents: ActivityEventDto[];
  liveConnected: boolean;
  liveError: string | null;
  liveSource: EventSource | null;
  fetchRuns: (filters: ActivityRunsFilters, signal?: AbortSignal) => Promise<void>;
  refreshRuns: (filters: ActivityRunsFilters) => Promise<void>;
  startLiveTail: (filters?: ActivityLiveFilters) => void;
  stopLiveTail: () => void;
  clearLiveEvents: () => void;
}

function queryKey(filters: ActivityRunsFilters) {
  return JSON.stringify(filters);
}

function buildLiveUrl(filters: ActivityLiveFilters): string {
  const params = new URLSearchParams();
  if (filters.platformId) params.set("platform_id", filters.platformId);
  if (filters.surface) params.set("surface", filters.surface);
  if (filters.operation) params.set("operation", filters.operation);
  if (filters.runId) params.set("run_id", filters.runId);
  const suffix = params.toString();
  return suffix ? `/api/activity/live?${suffix}` : "/api/activity/live";
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  lastQueryKey: null,
  liveEvents: [],
  liveConnected: false,
  liveError: null,
  liveSource: null,

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

  startLiveTail: (filters = {}) => {
    const current = get();
    if (current.liveSource) {
      current.liveSource.close();
    }
    const source = new EventSource(buildLiveUrl(filters));
    source.addEventListener("activity_event", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as ActivityEventDto;
        set((state) => {
          const next = [...state.liveEvents, payload];
          if (next.length > LIVE_EVENT_LIMIT) {
            next.splice(0, next.length - LIVE_EVENT_LIMIT);
          }
          return { liveEvents: next };
        });
      } catch (error) {
        console.error("Failed to parse activity event", error);
      }
    });
    source.onopen = () => set({ liveConnected: true, liveError: null });
    source.onerror = () => {
      set({ liveConnected: false, liveError: "Live stream disconnected" });
    };
    set({ liveSource: source, liveConnected: false, liveError: null });
  },

  stopLiveTail: () => {
    const { liveSource } = get();
    if (liveSource) {
      liveSource.close();
    }
    set({ liveSource: null, liveConnected: false });
  },

  clearLiveEvents: () => set({ liveEvents: [] }),
}));
