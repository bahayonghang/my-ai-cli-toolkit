import type { NpxSkillsCliMode, NpxSkillsInstallItemInput } from "@/types";
import type { useI18n } from "@/i18n";

export type ViewMode = "find" | "installed" | "maintenance";
export type InstalledSourceFilter = "all" | "curated" | "manual";
export type InstalledTrackingFilter = "all" | "tracked" | "untracked";
export type InstalledUpdateFilter =
  | "all"
  | "not_checked"
  | "up_to_date"
  | "update_available"
  | "unsupported";

export interface JobItemState {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  output: string;
  error: string | null;
  durationMs: number | null;
}

export type PendingRunAction =
  | {
      kind: "install";
      items: NpxSkillsInstallItemInput[];
      labels: string[];
      itemCount: number;
    }
  | {
      kind: "quick-install";
      packageRef: string;
      skillFlagsInput: string;
    }
  | {
      kind: "remove";
      itemIds: string[];
    }
  | {
      kind: "check";
    }
  | {
      kind: "update";
    };

export type RunResultStatus = "idle" | "running" | "success" | "warning" | "error" | "interrupted";

export interface TaxonomyCategorySummary {
  id: string;
  slug: string;
  label: string;
  count: number;
  groupId: string;
  groupOrder: number;
  categoryOrder: number;
}

export interface TaxonomyGroupSummary {
  id: string;
  label: string;
  order: number;
  categories: TaxonomyCategorySummary[];
}

export type TranslationFn = ReturnType<typeof useI18n>["t"];

export const COMMON_AGENTS = [
  "claude-code",
  "codex",
  "cursor",
  "gemini",
  "copilot",
  "windsurf",
  "kiro",
  "opencode",
  "cline",
  "augment",
  "trae",
  "trae_cn",
  "antigravity",
];
export const DEFAULT_AGENTS = ["claude-code", "codex"];
export const DEFAULT_CLI_MODE: NpxSkillsCliMode = "auto";
export const LS_KEY_AGENTS = "mcs-npx-skills-agents";
export const LS_KEY_CLI_MODE = "mcs-npx-skills-cli-mode";
