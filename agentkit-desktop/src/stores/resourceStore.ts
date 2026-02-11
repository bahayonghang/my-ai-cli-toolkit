/**
 * Resource Store - Zustand state management for resources
 */

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ResourceItem, Platform, SyncResult } from "@/types";
import { showErrorToast } from "@/utils/errorUtils";

interface ResourceState {
  resources: ResourceItem[];
  selectedResource: ResourceItem | null;
  /** Derived from _loadingCount — true when any async operation is in flight */
  loading: boolean;
  /** @internal tracks concurrent async operations */
  _loadingCount: number;
  error: string | null;

  // Actions
  fetchResources: () => Promise<void>;
  refreshResources: () => Promise<void>;
  selectResource: (resource: ResourceItem | null) => void;
  installResource: (id: string, platforms: Platform[]) => Promise<SyncResult[]>;
  uninstallResource: (id: string, platforms: Platform[]) => Promise<void>;
  updateResource: (id: string) => Promise<boolean>;
  clearError: () => void;
}

/** Increment loading counter */
function startLoading(s: ResourceState) {
  const count = s._loadingCount + 1;
  return { _loadingCount: count, loading: true, error: null };
}

/** Decrement loading counter; loading is false when counter reaches 0 */
function stopLoading(s: ResourceState) {
  const count = Math.max(0, s._loadingCount - 1);
  return { _loadingCount: count, loading: count > 0 };
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  selectedResource: null,
  loading: false,
  _loadingCount: 0,
  error: null,

  fetchResources: async () => {
    set(startLoading);
    try {
      const resources = await invoke<ResourceItem[]>("get_resources");
      // Re-sync selectedResource from refreshed list
      const selected = get().selectedResource;
      const updatedSelected = selected
        ? resources.find((r) => r.id === selected.id) ?? null
        : null;
      set(s => ({ resources, selectedResource: updatedSelected, ...stopLoading(s) }));
    } catch (err) {
      const friendly = showErrorToast(err, "loading resources");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
    }
  },

  refreshResources: async () => {
    set(startLoading);
    try {
      const resources = await invoke<ResourceItem[]>("refresh_resources");
      // Re-sync selectedResource from refreshed list
      const selected = get().selectedResource;
      const updatedSelected = selected
        ? resources.find((r) => r.id === selected.id) ?? null
        : null;
      set(s => ({ resources, selectedResource: updatedSelected, ...stopLoading(s) }));
    } catch (err) {
      const friendly = showErrorToast(err, "refreshing resources");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
    }
  },

  selectResource: (resource) => {
    set({ selectedResource: resource });
  },

  installResource: async (id, platforms) => {
    set(startLoading);
    try {
      const results = await invoke<SyncResult[]>("install_resource", {
        id,
        platforms,
      });

      // Refresh resources to get updated status
      await get().fetchResources();

      set(stopLoading);
      return results;
    } catch (err) {
      const friendly = showErrorToast(err, "installing resource");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
      throw err;
    }
  },

  uninstallResource: async (id, platforms) => {
    set(startLoading);
    try {
      await invoke("uninstall_resource", { id, platforms });

      // Refresh resources to get updated status
      await get().fetchResources();

      set(stopLoading);
    } catch (err) {
      const friendly = showErrorToast(err, "uninstalling resource");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
      throw err;
    }
  },

  updateResource: async (id) => {
    set(startLoading);
    try {
      const updated = await invoke<boolean>("update_resource", { id });

      // Refresh resources to get updated status
      await get().fetchResources();

      set(stopLoading);
      return updated;
    } catch (err) {
      const friendly = showErrorToast(err, "updating resource");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
