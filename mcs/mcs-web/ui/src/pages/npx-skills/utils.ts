import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCatalogItemDto,
  NpxSkillsCliMode,
  NpxSkillsOperation,
} from "@/types";
import type {
  CatalogSection,
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
    case "update_packages":
      return t("npxSkills.operationUpdatePackages");
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

export function describeInstallItemInput(item: {
  package_ref: string;
  skill_flags?: string[];
}) {
  if (!item.skill_flags || item.skill_flags.length === 0) {
    return item.package_ref;
  }
  if (item.skill_flags.length === 1) {
    return `${item.package_ref} --skill ${item.skill_flags[0]}`;
  }
  return `${item.package_ref} · ${item.skill_flags.length} skills`;
}

export function resolveRepoUrl(packageRef: string): string | null {
  const trimmed = packageRef.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\.git$/i, "");
  }

  const sshMatch = trimmed.match(/^git@github\.com:(.+?)(?:\.git)?$/i);
  if (sshMatch?.[1]) {
    return `https://github.com/${sshMatch[1]}`;
  }

  const githubPrefixMatch = trimmed.match(/^github:(.+)$/i);
  if (githubPrefixMatch?.[1]) {
    return `https://github.com/${githubPrefixMatch[1].replace(/\.git$/i, "")}`;
  }

  const ownerRepoMatch = trimmed.match(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  if (ownerRepoMatch) {
    return `https://github.com/${trimmed.replace(/\.git$/i, "")}`;
  }

  return null;
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
    category_slug: string;
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
        slug: item.category_slug,
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

export function buildCatalogSections(
  items: NpxSkillsCatalogItemDto[],
  groups: TaxonomyGroupSummary[],
): CatalogSection[] {
  const itemsByCategory = new Map<string, NpxSkillsCatalogItemDto[]>();
  for (const item of items) {
    const bucket = itemsByCategory.get(item.category_id);
    if (bucket) {
      bucket.push(item);
    } else {
      itemsByCategory.set(item.category_id, [item]);
    }
  }

  const sections: CatalogSection[] = [];
  for (const group of groups) {
    for (const category of group.categories) {
      const sectionItems = itemsByCategory.get(category.id);
      if (!sectionItems || sectionItems.length === 0) {
        continue;
      }

      sections.push({
        id: category.id,
        anchorId: `npx-skills-category-${category.id}`,
        slug: category.slug,
        label: category.label,
        groupId: group.id,
        groupLabel: group.label,
        count: sectionItems.length,
        items: sectionItems,
      });
    }
  }

  return sections;
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
      item.category_slug.toLowerCase().includes(search) ||
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
      item.category_slug.toLowerCase().includes(search) ||
      item.category_label.toLowerCase().includes(search) ||
      item.source.display.toLowerCase().includes(search) ||
      item.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });
}

export function formatCategoryLabel(categorySlug: string, categoryLabel: string) {
  return categorySlug === categoryLabel
    ? categoryLabel
    : `${categorySlug} · ${categoryLabel}`;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;
  return items.slice(start, start + safePageSize);
}
