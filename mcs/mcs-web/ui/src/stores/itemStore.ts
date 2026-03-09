import { create } from "zustand";
import type {
  ItemDto,
  CategoryDto,
  InstallStatus,
  InstallTarget,
  ItemType,
} from "@/types";
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
  fetchItems: (platformId: string, installTarget?: InstallTarget) => Promise<void>;
  fetchCategories: (
    platformId: string,
    installTarget?: InstallTarget,
    itemType?: ItemType
  ) => Promise<void>;
  refresh: (platformId: string, installTarget?: InstallTarget) => Promise<void>;
}

let itemsAbortController: AbortController | null = null;
let categoriesAbortController: AbortController | null = null;
let itemsRequestVersion = 0;
let categoriesRequestVersion = 0;

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
    set({
      activeTab: tab,
      selectedNames: new Set(),
      search: "",
      selectedCategory: null,
      statusFilter: null,
    });
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

  fetchItems: async (platformId, installTarget) => {
    const { activeTab, search, selectedCategory, statusFilter } = get();
    const version = ++itemsRequestVersion;

    itemsAbortController?.abort();
    itemsAbortController = new AbortController();

    set({ loading: get().items.length === 0, error: null });

    try {
      const params = {
        search: search || undefined,
        category: selectedCategory ?? undefined,
        status: statusFilter ?? undefined,
        installTarget,
      };
      const items =
        activeTab === "skills"
          ? await getSkills(platformId, params, itemsAbortController.signal)
          : await getCommands(platformId, params, itemsAbortController.signal);

      if (version !== itemsRequestVersion) {
        return;
      }
      set({ items, loading: false });
    } catch (e) {
      if ((e as Error).name === "AbortError" || version !== itemsRequestVersion) {
        return;
      }
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchCategories: async (platformId, installTarget, itemType) => {
    const version = ++categoriesRequestVersion;

    categoriesAbortController?.abort();
    categoriesAbortController = new AbortController();

    try {
      const categories = await getCategories(
        platformId,
        installTarget,
        itemType,
        categoriesAbortController.signal
      );
      if (version !== categoriesRequestVersion) {
        return;
      }
      set({ categories });
    } catch (e) {
      if ((e as Error).name === "AbortError" || version !== categoriesRequestVersion) {
        return;
      }
      set({ error: (e as Error).message });
    }
  },

  refresh: async (platformId, installTarget) => {
    const itemType = get().activeTab === "skills" ? "skill" : "command";
    await Promise.all([
      get().fetchItems(platformId, installTarget),
      get().fetchCategories(platformId, installTarget, itemType),
    ]);
  },
}));
