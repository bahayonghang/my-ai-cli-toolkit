import type { TranslateFn } from "@/i18n";
import type {
  NpxSkillsOperation,
  NpxSkillsRunConfig,
} from "@/types";

export function buildNpxJobNotification(
  operation: NpxSkillsOperation,
  successCount: number,
  failureCount: number,
  t: TranslateFn
): { message: string; severity: "success" | "warning" | "error" } {
  if (operation === "check") {
    if (successCount === 0 && failureCount > 0) {
      return {
        message: t("npxSkills.toastCheckFailed"),
        severity: "error",
      };
    }
    return {
      message:
        failureCount > 0
          ? t("npxSkills.toastCheckPartial", { failed: failureCount })
          : t("npxSkills.toastCheckSuccess"),
      severity: failureCount > 0 ? "warning" : "success",
    };
  }

  if (operation === "update" || operation === "update_packages") {
    if (successCount === 0 && failureCount > 0) {
      return {
        message:
          operation === "update_packages"
            ? t("npxSkills.toastUpdatePackagesFailed")
            : t("npxSkills.toastUpdateFailed"),
        severity: "error",
      };
    }
    return {
      message:
        failureCount > 0
          ? operation === "update_packages"
            ? t("npxSkills.toastUpdatePackagesPartial", {
                success: successCount,
                failed: failureCount,
              })
            : t("npxSkills.toastUpdatePartial", {
                success: successCount,
                failed: failureCount,
              })
          : operation === "update_packages"
            ? t("npxSkills.toastUpdatePackagesSuccess", { success: successCount })
            : t("npxSkills.toastUpdateSuccess", { success: successCount }),
      severity: failureCount > 0 ? "warning" : "success",
    };
  }

  if (operation === "remove") {
    if (successCount === 0 && failureCount > 0) {
      return {
        message: t("npxSkills.toastRemoveFailed"),
        severity: "error",
      };
    }
    return {
      message:
        failureCount > 0
          ? t("npxSkills.toastRemovePartial", {
              success: successCount,
              failed: failureCount,
            })
          : t("npxSkills.toastRemoveSuccess", { success: successCount }),
      severity: failureCount > 0 ? "warning" : "success",
    };
  }

  if (successCount === 0 && failureCount > 0) {
    return {
      message: t("npxSkills.toastInstallFailed"),
      severity: "error",
    };
  }

  return {
    message:
      failureCount > 0
        ? t("npxSkills.toastInstallPartial", {
            success: successCount,
            failed: failureCount,
          })
        : t("npxSkills.toastInstallSuccess", { success: successCount }),
    severity: failureCount > 0 ? "warning" : "success",
  };
}

export function buildNpxRunConfigSummary(
  config: NpxSkillsRunConfig,
  t: TranslateFn
) {
  return {
    agentsLabel: t("npxSkills.runConfigAgentsSummary", {
      count: config.agents.length,
    }),
    cliModeLabel:
      config.cliMode === "auto"
        ? t("npxSkills.runConfigCliSummaryAuto")
        : t("npxSkills.runConfigCliSummaryNpx"),
    installTargetLabel:
      config.installTarget.scope === "project"
        ? t("npxSkills.runConfigTargetSummaryProject")
        : t("npxSkills.runConfigTargetSummaryGlobal"),
    installTargetPath:
      config.installTarget.scope === "project"
        ? config.installTarget.project_path?.trim() ?? ""
        : "",
  };
}
