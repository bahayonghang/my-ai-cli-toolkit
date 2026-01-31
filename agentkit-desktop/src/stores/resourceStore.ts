/**
 * Resource Store - Zustand state management for resources
 */

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ResourceItem, Platform, SyncResult } from "@/types";

interface ResourceState {
  resources: ResourceItem[];
  selectedResource: ResourceItem | null;
  loading: boolean;
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

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  selectedResource: null,
  loading: false,
  error: null,

  fetchResources: async () => {
    set({ loading: true, error: null });
    try {
      const resources = await invoke<ResourceItem[]>("get_resources");
      set({ resources, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  refreshResources: async () => {
    set({ loading: true, error: null });
    try {
      const resources = await invoke<ResourceItem[]>("refresh_resources");
      set({ resources, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  selectResource: (resource) => {
    set({ selectedResource: resource });
  },

  installResource: async (id, platforms) => {
    set({ loading: true, error: null });
    try {
      const results = await invoke<SyncResult[]>("install_resource", {
        id,
        platforms,
      });

      // Refresh resources to get updated status
      await get().fetchResources();

      set({ loading: false });
      return results;
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  uninstallResource: async (id, platforms) => {
    set({ loading: true, error: null });
    try {
      await invoke("uninstall_resource", { id, platforms });

      // Refresh resources to get updated status
      await get().fetchResources();

      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  updateResource: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await invoke<boolean>("update_resource", { id });

      // Refresh resources to get updated status
      await get().fetchResources();

      set({ loading: false });
      return updated;
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
