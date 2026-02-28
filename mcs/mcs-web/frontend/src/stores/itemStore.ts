import { create } from "zustand";
import type { ItemDto, CategoryDto, InstallStatus } from "@/types";
import { getSkills, getCommands, getCategories } from "@/api/client";

type Tab = "skills" | "commands";

interface ItemState {
  items: ItemDto[];
  categories: CategoryDto[];
  activeTab: Tab;
  search: string;
  selectedCategory: string | null;
  statusFilter: InstallStatus | null;
  selectedNames: Set<string>;
  loading: boolean;
  error: string | null;

  setTab: (tab: Tab) => void;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setStatusFilter: (status: InstallStatus | null) => void;
  toggleSelection: (name: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  fetchItems: (platformId: string) => Promise<void>;
  fetchCategories: (platformId: string) => Promise<void>;
  refresh: (platformId: string) => Promise<void>;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  categories: [],
  activeTab: "skills",
  search: "",
  selectedCategory: null,
  statusFilter: null,
  selectedNames: new Set(),
  loading: false,
  error: null,

  setTab: (tab) => {
    set({ activeTab: tab, selectedNames: new Set(), search: "", selectedCategory: null, statusFilter: null });
  },

  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ selectedCategory: category }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  toggleSelection: (name) => {
    const selected = new Set(get().selectedNames);
    if (selected.has(name)) {
      selected.delete(name);
    } else {
      selected.add(name);
    }
    set({ selectedNames: selected });
  },

  selectAll: () => {
    const all = new Set(get().items.map((i) => i.name));
    set({ selectedNames: all });
  },

  clearSelection: () => set({ selectedNames: new Set() }),

  fetchItems: async (platformId) => {
    const { activeTab, search, selectedCategory, statusFilter } = get();
    set({ loading: true, error: null });
    try {
      const params = {
        search: search || undefined,
        category: selectedCategory ?? undefined,
        status: statusFilter ?? undefined,
      };
      const items =
        activeTab === "skills"
          ? await getSkills(platformId, params)
          : await getCommands(platformId, params);
      set({ items, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchCategories: async (platformId) => {
    try {
      const categories = await getCategories(platformId);
      set({ categories });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  refresh: async (platformId) => {
    await Promise.all([
      get().fetchItems(platformId),
      get().fetchCategories(platformId),
    ]);
  },
}));
