import type { NpxSkillsCatalogItemDto, NpxSkillsCliMode, NpxSkillsOperation } from "@/types";
import type { TaxonomyGroupSummary, TranslationFn } from "./types";
import { DEFAULT_AGENTS, DEFAULT_CLI_MODE, LS_KEY_AGENTS, LS_KEY_CLI_MODE } from "./types";

export function loadAgents(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY_AGENTS);
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
  const raw = localStorage.getItem(LS_KEY_CLI_MODE);
  return raw === "npx" ? "npx" : DEFAULT_CLI_MODE;
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
  const groups = new Map<string, TaxonomyGroupSummary>();

  for (const item of items) {
    const existingGroup = groups.get(item.group_id);
    if (!existingGroup) {
      groups.set(item.group_id, {
        id: item.group_id,
        label: item.group_label,
        order: item.group_order,
        categories: [
          {
            id: item.category_id,
            label: item.category_label,
            count: 1,
            groupId: item.group_id,
            groupOrder: item.group_order,
            categoryOrder: item.category_order,
          },
        ],
      });
      continue;
    }

    const existingCategory = existingGroup.categories.find(
      (category) => category.id === item.category_id
    );
    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      existingGroup.categories.push({
        id: item.category_id,
        label: item.category_label,
        count: 1,
        groupId: item.group_id,
        groupOrder: item.group_order,
        categoryOrder: item.category_order,
      });
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      categories: [...group.categories].sort(
        (left, right) =>
          left.categoryOrder - right.categoryOrder || left.label.localeCompare(right.label)
      ),
    }))
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
}
