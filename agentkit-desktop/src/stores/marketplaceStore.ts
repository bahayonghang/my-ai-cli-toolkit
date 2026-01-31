/**
 * Marketplace Store - Zustand state management for skill marketplace
 */

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type {
  MarketplaceSkill,
  MarketplaceQuery,
  MarketplaceFilters,
  MarketplaceCategory,
  MarketplaceSortBy,
  InstallResult,
  CacheStats,
} from "@/types";

interface MarketplaceState {
  // Data
  skills: MarketplaceSkill[];
  categories: MarketplaceCategory[];
  cacheStats: CacheStats | null;

  // UI State
  loading: boolean;
  installing: string | null; // skill id being installed
  error: string | null;

  // Filters & Query
  sortBy: MarketplaceSortBy;
  searchQuery: string;
  filters: MarketplaceFilters;

  // Node.js availability
  nodejsAvailable: boolean | null;
  nodejsVersion: string | null;

  // Actions
  fetchSkills: (query?: Partial<MarketplaceQuery>) => Promise<void>;
  searchSkills: (keyword: string) => Promise<void>;
  refreshCache: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  installSkill: (owner: string, repo: string) => Promise<InstallResult>;
  uninstallSkill: (owner: string, repo: string) => Promise<InstallResult>;
  checkNodejs: () => Promise<void>;
  fetchCacheStats: () => Promise<void>;

  // UI Actions
  setSortBy: (sortBy: MarketplaceSortBy) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  // Initial state
  skills: [],
  categories: [],
  cacheStats: null,
  loading: false,
  installing: null,
  error: null,
  sortBy: "popular",
  searchQuery: "",
  filters: {},
  nodejsAvailable: null,
  nodejsVersion: null,

  fetchSkills: async (queryOverride?: Partial<MarketplaceQuery>) => {
    set({ loading: true, error: null });
    try {
      const { sortBy, searchQuery, filters } = get();
      const query: MarketplaceQuery = {
        sortBy: queryOverride?.sortBy ?? sortBy,
        search: queryOverride?.search ?? (searchQuery || undefined),
        category: queryOverride?.category ?? filters.category,
        source: queryOverride?.source ?? filters.source,
        platform: queryOverride?.platform ?? filters.platform,
        page: queryOverride?.page ?? 1,
        perPage: queryOverride?.perPage ?? 50,
      };

      const skills = await invoke<MarketplaceSkill[]>("get_marketplace_skills", { query });
      set({ skills, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  searchSkills: async (keyword: string) => {
    set({ loading: true, error: null, searchQuery: keyword });
    try {
      const { filters } = get();
      const skills = await invoke<MarketplaceSkill[]>("search_marketplace", {
        keyword,
        filters,
      });
      set({ skills, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  refreshCache: async () => {
    set({ loading: true, error: null });
    try {
      const skills = await invoke<MarketplaceSkill[]>("refresh_marketplace_cache");
      set({ skills, loading: false });
      // Also refresh cache stats
      await get().fetchCacheStats();
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await invoke<MarketplaceCategory[]>("get_marketplace_categories");
      set({ categories });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  installSkill: async (owner: string, repo: string) => {
    const skillId = `${owner}/${repo}`;
    set({ installing: skillId, error: null });
    try {
      const result = await invoke<InstallResult>("install_marketplace_skill", {
        owner,
        repo,
      });

      if (result.success) {
        // Update local state to mark skill as installed
        const { skills } = get();
        const updatedSkills = skills.map((skill) =>
          skill.id === skillId || `${skill.owner}/${skill.repo}` === skillId
            ? { ...skill, installed: true }
            : skill
        );
        set({ skills: updatedSkills });
      }

      set({ installing: null });
      return result;
    } catch (error) {
      set({ error: String(error), installing: null });
      throw error;
    }
  },

  uninstallSkill: async (owner: string, repo: string) => {
    const skillId = `${owner}/${repo}`;
    set({ installing: skillId, error: null });
    try {
      const result = await invoke<InstallResult>("uninstall_marketplace_skill", {
        owner,
        repo,
      });

      if (result.success) {
        // Update local state to mark skill as uninstalled
        const { skills } = get();
        const updatedSkills = skills.map((skill) =>
          skill.id === skillId || `${skill.owner}/${skill.repo}` === skillId
            ? { ...skill, installed: false }
            : skill
        );
        set({ skills: updatedSkills });
      }

      set({ installing: null });
      return result;
    } catch (error) {
      set({ error: String(error), installing: null });
      throw error;
    }
  },

  checkNodejs: async () => {
    try {
      const [available, version] = await Promise.all([
        invoke<boolean>("check_nodejs_available"),
        invoke<string | null>("get_nodejs_version"),
      ]);
      set({ nodejsAvailable: available, nodejsVersion: version });
    } catch (error) {
      set({ nodejsAvailable: false, nodejsVersion: null });
    }
  },

  fetchCacheStats: async () => {
    try {
      const cacheStats = await invoke<CacheStats>("get_marketplace_cache_stats");
      set({ cacheStats });
    } catch (error) {
      console.error("Failed to fetch cache stats:", error);
    }
  },

  // UI Actions
  setSortBy: (sortBy: MarketplaceSortBy) => {
    set({ sortBy });
    get().fetchSkills({ sortBy });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    if (query.trim()) {
      get().searchSkills(query);
    } else {
      get().fetchSkills();
    }
  },

  setFilters: (newFilters: Partial<MarketplaceFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters });
    get().fetchSkills();
  },

  clearFilters: () => {
    set({ filters: {}, searchQuery: "" });
    get().fetchSkills();
  },

  clearError: () => {
    set({ error: null });
  },
}));
