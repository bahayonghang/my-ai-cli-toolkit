import { useCallback, useEffect, useRef, useState } from "react";
import { getAgents, getCategories, getCommands, getSkills } from "@/api/client";
import type {
  CategoryDto,
  InstallStatus,
  InstallTarget,
  ItemDto,
  ItemType,
} from "@/types";

interface Options {
  platformId?: string;
  activeTab: "skills" | "commands" | "agents";
  search: string;
  selectedCategory: string | null;
  statusFilter?: InstallStatus | null;
  installTarget?: InstallTarget;
  itemTypeOverride?: ItemType;
}

interface Result {
  items: ItemDto[];
  categories: CategoryDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePlatformItemsData({
  platformId,
  activeTab,
  search,
  selectedCategory,
  statusFilter = null,
  installTarget,
  itemTypeOverride,
}: Options): Result {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsAbortRef = useRef<AbortController | null>(null);
  const categoriesAbortRef = useRef<AbortController | null>(null);
  const itemType =
    itemTypeOverride ??
    (activeTab === "skills" ? "skill" : activeTab === "commands" ? "command" : "agent");

  const fetchCategories = useCallback(async () => {
    if (!platformId) {
      setCategories([]);
      return;
    }
    categoriesAbortRef.current?.abort();
    const controller = new AbortController();
    categoriesAbortRef.current = controller;

    try {
      const nextCategories = await getCategories(
        platformId,
        installTarget,
        itemType,
        controller.signal
      );
      if (!controller.signal.aborted) {
        setCategories(nextCategories);
      }
    } catch (errorValue) {
      if ((errorValue as Error).name === "AbortError") {
        return;
      }
      setError((errorValue as Error).message);
    }
  }, [installTarget, itemType, platformId]);

  const fetchItems = useCallback(async () => {
    if (!platformId) {
      setItems([]);
      setLoading(false);
      return;
    }
    itemsAbortRef.current?.abort();
    const controller = new AbortController();
    itemsAbortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const params = {
        search: search || undefined,
        category: selectedCategory ?? undefined,
        status: statusFilter ?? undefined,
        installTarget,
      };
      const nextItems =
        activeTab === "skills"
          ? await getSkills(platformId, params, controller.signal)
          : activeTab === "commands"
            ? await getCommands(platformId, params, controller.signal)
            : await getAgents(platformId, params, controller.signal);
      if (!controller.signal.aborted) {
        setItems(nextItems);
      }
    } catch (errorValue) {
      if ((errorValue as Error).name === "AbortError") {
        return;
      }
      setError((errorValue as Error).message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [activeTab, installTarget, platformId, search, selectedCategory, statusFilter]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchItems(), fetchCategories()]);
  }, [fetchCategories, fetchItems]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  useEffect(
    () => () => {
      itemsAbortRef.current?.abort();
      categoriesAbortRef.current?.abort();
    },
    []
  );

  return { items, categories, loading, error, refresh };
}
