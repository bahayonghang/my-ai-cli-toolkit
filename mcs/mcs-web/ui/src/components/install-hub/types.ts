import type { InstallResult, PlatformDisplay, SkillCatalogDto } from "@/types";

export interface InstallHubFilters {
  search: string;
  category: string | null;
  defaultOnly: boolean;
}

export type InstallHubStage = "skills" | "platforms" | "review";

export interface InstallHubStepState {
  stage: InstallHubStage;
  available: boolean;
  complete: boolean;
}

export interface InstallHubSelectionSummary {
  selectedSkillNames: string[];
  selectedPlatforms: PlatformDisplay[];
  filteredSkillCount: number;
  totalSkillCount: number;
  plannedActionCount: number;
}

export interface PlatformInstallResult {
  platform: PlatformDisplay;
  successCount: number;
  failureCount: number;
  results: InstallResult[];
  requestError: string | null;
}

export type ExecutionPhase = "idle" | "running" | "complete";

export interface ExecutionState {
  running: boolean;
  currentStep: number;
  totalSteps: number;
  phase: ExecutionPhase;
  activePlatformId: string | null;
}

export type SkillSelection = Set<SkillCatalogDto["name"]>;
export type PlatformSelection = Set<PlatformDisplay["id"]>;
