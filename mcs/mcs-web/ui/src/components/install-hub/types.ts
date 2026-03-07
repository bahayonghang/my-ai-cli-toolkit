import type { InstallResult, PlatformDisplay, SkillCatalogDto } from "@/types";

export interface InstallHubFilters {
  search: string;
  category: string | null;
  defaultOnly: boolean;
}

export interface PlatformInstallResult {
  platform: PlatformDisplay;
  successCount: number;
  failureCount: number;
  results: InstallResult[];
  requestError: string | null;
}

export interface ExecutionState {
  running: boolean;
  currentStep: number;
  totalSteps: number;
}

export type SkillSelection = Set<SkillCatalogDto["name"]>;
export type PlatformSelection = Set<PlatformDisplay["id"]>;
