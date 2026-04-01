import type { TranslateFn } from "@/i18n";
import type {
  InstallCatalogItemDto,
  ItemDto,
  ItemType,
  PlatformDisplay,
} from "@/types";
import { getPlatformCommandsLabel, platformUsesPromptLibrary } from "./platformLabels";

export function getInstallHubItemTypeLabel(
  itemType: ItemType,
  t: TranslateFn,
): string {
  switch (itemType) {
    case "command":
      return t("common.commandsAndPrompts");
    case "agent":
      return t("common.agents");
    case "skill":
    default:
      return t("common.skills");
  }
}

export function platformSupportsItemType(
  platform: PlatformDisplay,
  itemType: ItemType,
): boolean {
  switch (itemType) {
    case "command":
      return Boolean(platform.supports_commands);
    case "agent":
      return Boolean(platform.supports_agents);
    case "skill":
    default:
      return true;
  }
}

export function getPlatformInstallPath(
  platform: PlatformDisplay,
  itemType: ItemType,
  t: TranslateFn,
): string {
  switch (itemType) {
    case "command":
      return platform.commands_path ?? t("dialogs.syncUnsupportedTarget");
    case "agent":
      return platform.agents_path ?? t("dialogs.syncUnsupportedTarget");
    case "skill":
    default:
      return platform.skills_path;
  }
}

export function getPlatformScopedItemTypeLabel(
  platform: PlatformDisplay | undefined,
  itemType: ItemType,
  t: TranslateFn,
): string {
  if (itemType !== "command") {
    return getInstallHubItemTypeLabel(itemType, t);
  }

  if (!platform) {
    return t("common.commandsAndPrompts");
  }

  return platformUsesPromptLibrary(platform)
    ? t("common.prompts")
    : getPlatformCommandsLabel(platform, t);
}

export function mergePlatformItemsIntoCatalog(
  itemType: Extract<ItemType, "command" | "agent">,
  itemsByPlatform: Array<{ platform: PlatformDisplay; items: ItemDto[] }>,
): InstallCatalogItemDto[] {
  const catalog = new Map<string, InstallCatalogItemDto>();

  for (const { platform, items } of itemsByPlatform) {
    for (const item of items) {
      const existing = catalog.get(item.name);
      if (existing) {
        existing.platform_status = {
          ...(existing.platform_status ?? {}),
          [platform.id]: item.status,
        };
        if (!existing.description && item.description) {
          existing.description = item.description;
        }
        if (!existing.category && item.category) {
          existing.category = item.category;
        }
        if (item.is_default) {
          existing.is_default = true;
        }
        if (item.tags.length > 0) {
          existing.tags = Array.from(new Set([...existing.tags, ...item.tags])).sort();
        }
        continue;
      }

      catalog.set(item.name, {
        item_type: itemType,
        name: item.name,
        description: item.description,
        category: item.category,
        tags: [...item.tags].sort(),
        is_default: item.is_default,
        platform_status: { [platform.id]: item.status },
      });
    }
  }

  return Array.from(catalog.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}
