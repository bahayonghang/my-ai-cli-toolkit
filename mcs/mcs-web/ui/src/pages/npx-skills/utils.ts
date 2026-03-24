import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCatalogItemDto,
  NpxSkillsCliMode,
  NpxSkillsOperation,
} from "@/types";
import type {
  InstalledSourceFilter,
  InstalledTrackingFilter,
  InstalledUpdateFilter,
  TaxonomyCategorySummary,
  TaxonomyGroupSummary,
  TranslationFn,
  ViewMode,
} from "./types";
import { DEFAULT_AGENTS, DEFAULT_CLI_MODE, LS_KEY_AGENTS, LS_KEY_CLI_MODE } from "./types";

function getLocalStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storage = window.localStorage;
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function"
  ) {
    return null;
  }

  return storage;
}

export function loadAgents(): string[] {
  const storage = getLocalStorage();
  if (!storage) {
    return DEFAULT_AGENTS;
  }
  try {
    const raw = storage.getItem(LS_KEY_AGENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_AGENTS;
}

export function loadCliMode(): NpxSkillsCliMode {
  const storage = getLocalStorage();
  if (!storage) {
    return DEFAULT_CLI_MODE;
  }
  try {
    const raw = storage.getItem(LS_KEY_CLI_MODE);
    return raw === "npx" ? "npx" : DEFAULT_CLI_MODE;
  } catch {
    return DEFAULT_CLI_MODE;
  }
}

export function persistNpxSkillsPreference(key: string, value: string) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
}

export function safeParseEvent<T>(event: Event): T | null {
  const payload = event as MessageEvent<string>;
  if (!payload?.data) {
    return null;
  }
  try {
    return JSON.parse(payload.data) as T;
  } catch {
    return null;
  }
}

export function operationLabel(operation: NpxSkillsOperation, t: TranslationFn) {
  switch (operation) {
    case "install":
      return t("npxSkills.operationInstall");
    case "remove":
      return t("npxSkills.operationRemove");
    case "check":
      return t("npxSkills.operationCheck");
    case "update":
      return t("npxSkills.operationUpdate");
  }
}

export function installStatusColor(
  status: NpxSkillsCatalogItemDto["installed_state"]
): "success" | "default" {
  switch (status) {
    case "installed":
      return "success";
    default:
      return "default";
  }
}

export function buildInstallKey(item: NpxSkillsCatalogItemDto) {
  return `${item.package_ref}::${item.skill_flag ?? ""}`;
}

export function parseSkillFlags(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function buildTaxonomyGroups<
  T extends {
    group_id: string;
    group_label: string;
    group_order: number;
    category_id: string;
    category_label: string;
    category_order: number;
  },
>(items: T[]): TaxonomyGroupSummary[] {
  const groups = new Map<
    string,
    {
      label: string;
      order: number;
      categories: Map<string, TaxonomyCategorySummary>;
    }
  >();

  for (const item of items) {
    let group = groups.get(item.group_id);
    if (!group) {
      group = {
        label: item.group_label,
        order: item.group_order,
        categories: new Map(),
      };
      groups.set(item.group_id, group);
    }

    const existingCategory = group.categories.get(item.category_id);
    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      group.categories.set(item.category_id, {
        id: item.category_id,
        label: item.category_label,
        count: 1,
        groupId: item.group_id,
        groupOrder: item.group_order,
        categoryOrder: item.category_order,
      });
    }
  }

  return Array.from(groups.entries())
    .map(([groupId, group]) => ({
      id: groupId,
      label: group.label,
      order: group.order,
      categories: Array.from(group.categories.values()).sort(
        (left, right) =>
          left.categoryOrder - right.categoryOrder || left.label.localeCompare(right.label)
      ),
    }))
    .map((group) => ({
      ...group,
    }))
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
}

function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

export function shouldLoadCatalog(view: ViewMode, loaded: boolean, stale: boolean) {
  return view === "find" && (!loaded || stale);
}

export function shouldLoadInstalled(view: ViewMode, loaded: boolean, stale: boolean) {
  return (view === "installed" || view === "maintenance") && (!loaded || stale);
}

export function filterCatalogItems(
  items: NpxSkillsCatalogItemDto[],
  options: {
    search: string;
    categoryId: string | null;
    installedOnly: boolean;
  }
) {
  const search = normalizeSearchQuery(options.search);
  return items.filter((item) => {
    if (options.categoryId && item.category_id !== options.categoryId) {
      return false;
    }
    if (options.installedOnly && item.installed_state !== "installed") {
      return false;
    }
    if (!search) {
      return true;
    }
    return (
      item.name.toLowerCase().includes(search) ||
      item.package_ref.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) === true ||
      item.group_label.toLowerCase().includes(search) ||
      item.category_label.toLowerCase().includes(search) ||
      item.usage?.toLowerCase().includes(search) === true ||
      item.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });
}

export function filterInstalledItems(
  items: NpxInstalledSkillInstanceDto[],
  options: {
    search: string;
    categoryId: string | null;
    sourceFilter: InstalledSourceFilter;
    trackingFilter: InstalledTrackingFilter;
    updateFilter: InstalledUpdateFilter;
  }
) {
  const search = normalizeSearchQuery(options.search);
  return items.filter((item) => {
    if (options.categoryId && item.category_id !== options.categoryId) {
      return false;
    }
    if (options.sourceFilter === "curated" && item.source.kind !== "curated") {
      return false;
    }
    if (options.sourceFilter === "manual" && item.source.kind === "curated") {
      return false;
    }
    if (options.trackingFilter !== "all" && item.tracking.kind !== options.trackingFilter) {
      return false;
    }
    if (options.updateFilter !== "all" && item.update.kind !== options.updateFilter) {
      return false;
    }
    if (!search) {
      return true;
    }
    return (
      item.name.toLowerCase().includes(search) ||
      item.source.ref.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) === true ||
      item.group_label.toLowerCase().includes(search) ||
      item.category_label.toLowerCase().includes(search) ||
      item.source.display.toLowerCase().includes(search) ||
      item.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;
  return items.slice(start, start + safePageSize);
}
