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
import { showErrorToast } from "@/utils/errorUtils";

interface MarketplaceState {
  // Data
  skills: MarketplaceSkill[];
  categories: MarketplaceCategory[];
  cacheStats: CacheStats | null;

  // UI State
  /** Derived from _loadingCount — true when any async fetch is in flight */
  loading: boolean;
  /** @internal tracks concurrent async operations */
  _loadingCount: number;
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
  installSkill: (owner: string, repo: string, skill: string) => Promise<InstallResult>;
  uninstallSkill: (owner: string, repo: string, skill: string) => Promise<InstallResult>;
  checkNodejs: () => Promise<void>;
  fetchCacheStats: () => Promise<void>;

  // UI Actions
  setSortBy: (sortBy: MarketplaceSortBy) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

/** Increment loading counter */
function startLoading(s: MarketplaceState) {
  const count = s._loadingCount + 1;
  return { _loadingCount: count, loading: true, error: null };
}

/** Decrement loading counter; loading is false when counter reaches 0 */
function stopLoading(s: MarketplaceState) {
  const count = Math.max(0, s._loadingCount - 1);
  return { _loadingCount: count, loading: count > 0 };
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  // Initial state
  skills: [],
  categories: [],
  cacheStats: null,
  loading: false,
  _loadingCount: 0,
  installing: null,
  error: null,
  sortBy: "hot",
  searchQuery: "",
  filters: {},
  nodejsAvailable: null,
  nodejsVersion: null,

  fetchSkills: async (queryOverride?: Partial<MarketplaceQuery>) => {
    set(startLoading);
    try {
      const { sortBy, searchQuery, filters } = get();
      const normalizedSearch = searchQuery.trim();
      const searchValue = queryOverride?.search
        ?? (normalizedSearch.length >= 2 ? normalizedSearch : undefined);
      const categoryValue = queryOverride?.category ?? filters.category;
      const sourceValue = queryOverride?.source ?? filters.source;
      const platformValue = queryOverride?.platform ?? filters.platform;
      const query: MarketplaceQuery = {
        sortBy: queryOverride?.sortBy ?? sortBy,
        page: queryOverride?.page ?? 1,
        perPage: queryOverride?.perPage ?? 50,
        ...(searchValue !== undefined && { search: searchValue }),
        ...(categoryValue !== undefined && { category: categoryValue }),
        ...(sourceValue !== undefined && { source: sourceValue }),
        ...(platformValue !== undefined && { platform: platformValue }),
      };

      const skills = await invoke<MarketplaceSkill[]>("get_marketplace_skills", { query });
      set(s => ({ skills, ...stopLoading(s) }));
    } catch (err) {
      const friendly = showErrorToast(err, "fetching marketplace");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
    }
  },

  searchSkills: async (keyword: string) => {
    set(s => ({ ...startLoading(s), searchQuery: keyword }));
    try {
      if (keyword.trim().length < 2) {
        set(s => ({ ...stopLoading(s) }));
        return;
      }
      const { filters } = get();
      const skills = await invoke<MarketplaceSkill[]>("search_marketplace", {
        keyword,
        filters,
      });
      set(s => ({ skills, ...stopLoading(s) }));
    } catch (err) {
      const friendly = showErrorToast(err, "searching marketplace");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
    }
  },

  refreshCache: async () => {
    set(startLoading);
    try {
      const skills = await invoke<MarketplaceSkill[]>("refresh_marketplace_cache");
      set(s => ({ skills, ...stopLoading(s) }));
      // Also refresh cache stats
      await get().fetchCacheStats();
    } catch (err) {
      const friendly = showErrorToast(err, "refreshing cache");
      set(s => ({ error: friendly.message, ...stopLoading(s) }));
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

  installSkill: async (owner: string, repo: string, skill: string) => {
    const skillId = `${owner}/${repo}/${skill}`;
    set({ installing: skillId, error: null });
    try {
      const result = await invoke<InstallResult>("install_marketplace_skill", {
        owner,
        repo,
        skill,
      });

      if (result.success) {
        // Update local state to mark skill as installed
        const { skills } = get();
        const updatedSkills = skills.map((skill) =>
          skill.id === skillId || `${skill.owner}/${skill.repo}/${skill.skill ?? skill.name}` === skillId
            ? { ...skill, installed: true }
            : skill
        );
        set({ skills: updatedSkills });
      }

      set({ installing: null });
      return result;
    } catch (err) {
      const friendly = showErrorToast(err, "installing skill");
      set({ error: friendly.message, installing: null });
      throw err;
    }
  },

  uninstallSkill: async (owner: string, repo: string, skill: string) => {
    const skillId = `${owner}/${repo}/${skill}`;
    set({ installing: skillId, error: null });
    try {
      const result = await invoke<InstallResult>("uninstall_marketplace_skill", {
        owner,
        repo,
        skill,
      });

      if (result.success) {
        // Update local state to mark skill as uninstalled
        const { skills } = get();
        const updatedSkills = skills.map((skill) =>
          skill.id === skillId || `${skill.owner}/${skill.repo}/${skill.skill ?? skill.name}` === skillId
            ? { ...skill, installed: false }
            : skill
        );
        set({ skills: updatedSkills });
      }

      set({ installing: null });
      return result;
    } catch (err) {
      const friendly = showErrorToast(err, "uninstalling skill");
      set({ error: friendly.message, installing: null });
      throw err;
    }
  },

  checkNodejs: async () => {
    try {
      const [available, version] = await Promise.all([
        invoke<boolean>("check_nodejs_available"),
        invoke<string | null>("get_nodejs_version"),
      ]);
      set({ nodejsAvailable: available, nodejsVersion: version });
    } catch {
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
    const normalized = query.trim();
    if (normalized.length >= 2) {
      get().searchSkills(query);
    } else if (normalized.length === 0) {
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
