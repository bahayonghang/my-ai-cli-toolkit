import type {
  InstallCatalogItemDto,
  InstallResult,
  ItemType,
  PlatformDisplay,
} from "@/types";

export interface InstallHubFilters {
  itemType: ItemType;
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
  itemType: ItemType;
  selectedItemNames: string[];
  selectedPlatforms: PlatformDisplay[];
  filteredItemCount: number;
  totalItemCount: number;
  plannedActionCount: number;
}

export interface PlatformInstallResult {
  platform: PlatformDisplay;
  successCount: number;
  failureCount: number;
  results: InstallResult[];
  requestError: string | null;
  runId?: string | null;
}

export type ExecutionPhase = "idle" | "running" | "complete";

export interface ExecutionState {
  running: boolean;
  currentStep: number;
  totalSteps: number;
  phase: ExecutionPhase;
  activePlatformId: string | null;
}

export type SkillSelection = Set<InstallCatalogItemDto["name"]>;
export type PlatformSelection = Set<PlatformDisplay["id"]>;
