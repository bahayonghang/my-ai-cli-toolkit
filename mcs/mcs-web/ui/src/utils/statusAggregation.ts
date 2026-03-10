import type { TranslateFn } from "@/i18n";
import type { InstallStatus } from "@/types";

export type AggregatedStatus = "installed" | "not_installed" | "outdated" | "partial" | "unknown";

export interface StatusInfo {
  status: AggregatedStatus;
  tooltip: string;
}

export interface StatusAggregationOptions {
  /** Status when platform_status is empty/undefined. Default: "unknown" */
  emptyDefault?: "unknown" | "not_installed";
  /** Tooltip format for mixed statuses. Default: "counted" */
  partialTooltipMode?: "counted" | "per-platform";
}

export function getAggregatedStatus(
  platformStatus: Record<string, InstallStatus> | undefined,
  t: TranslateFn,
  options?: StatusAggregationOptions,
): StatusInfo {
  const emptyDefault = options?.emptyDefault ?? "unknown";
  const partialTooltipMode = options?.partialTooltipMode ?? "counted";

  if (!platformStatus || Object.keys(platformStatus).length === 0) {
    if (emptyDefault === "not_installed") {
      return { status: "not_installed", tooltip: t("installHub.tooltipNotInstalledAny") };
    }
    return { status: "unknown", tooltip: t("installHub.tooltipNoPlatformData") };
  }

  const statuses = Object.values(platformStatus);
  const platformCount = statuses.length;
  const installedCount = statuses.filter((s) => s === "installed").length;
  const outdatedCount = statuses.filter((s) => s === "outdated").length;
  const notInstalledCount = statuses.filter((s) => s === "not_installed").length;

  if (installedCount === platformCount) {
    return {
      status: "installed",
      tooltip: t("installHub.tooltipInstalledAll", { count: platformCount }),
    };
  }

  if (outdatedCount === platformCount) {
    return {
      status: "outdated",
      tooltip: t("installHub.tooltipOutdatedAll", { count: platformCount }),
    };
  }

  if (notInstalledCount === platformCount) {
    return {
      status: "not_installed",
      tooltip: t("installHub.tooltipNotInstalledAny"),
    };
  }

  // Mixed status
  if (partialTooltipMode === "per-platform") {
    const details = Object.entries(platformStatus)
      .map(([platform, status]) => `${platform}: ${status}`)
      .join(", ");
    return {
      status: "partial",
      tooltip: t("installHub.tooltipMixed", { details, count: platformCount }),
    };
  }

  // counted mode
  const parts: string[] = [];
  if (installedCount > 0) parts.push(t("installHub.tooltipMixedInstalled", { count: installedCount }));
  if (outdatedCount > 0) parts.push(t("installHub.tooltipMixedOutdated", { count: outdatedCount }));
  if (notInstalledCount > 0) parts.push(t("installHub.tooltipMixedNotInstalled", { count: notInstalledCount }));

  return {
    status: "partial",
    tooltip: t("installHub.tooltipMixed", { details: parts.join(", "), count: platformCount }),
  };
}
