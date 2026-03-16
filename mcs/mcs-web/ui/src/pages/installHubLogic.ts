import type { SkillCatalogDto, PlatformDisplay } from "@/types";
import type {
  InstallHubSelectionSummary,
  InstallHubStage,
  InstallHubStepState,
  PlatformInstallResult,
  PlatformSelection,
  SkillSelection,
} from "@/components/install-hub/types";

const EMPTY_CATEGORY = "uncategorized";

export function collectSkillCategories(skills: SkillCatalogDto[]): string[] {
  const categories = new Set<string>();
  for (const skill of skills) {
    categories.add(skill.category ?? EMPTY_CATEGORY);
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export function filterSkillCatalog(
  skills: SkillCatalogDto[],
  search: string,
  category: string | null,
  defaultOnly: boolean
): SkillCatalogDto[] {
  const loweredSearch = search.trim().toLowerCase();
  return skills.filter((skill) => {
    if (defaultOnly && !skill.is_default) return false;
    if (category && (skill.category ?? EMPTY_CATEGORY) !== category) return false;
    if (!loweredSearch) return true;

    const nameMatch = skill.name.toLowerCase().includes(loweredSearch);
    const descMatch = (skill.description ?? "").toLowerCase().includes(loweredSearch);
    return nameMatch || descMatch;
  });
}

export function summarizeInstallResults(results: PlatformInstallResult[]): {
  totalSuccess: number;
  totalFailure: number;
  failedPlatforms: string[];
} {
  let totalSuccess = 0;
  let totalFailure = 0;
  const failedPlatforms: string[] = [];

  for (const result of results) {
    totalSuccess += result.successCount;
    totalFailure += result.failureCount;
    if (result.failureCount > 0 || result.requestError) {
      failedPlatforms.push(result.platform.id);
    }
  }

  return { totalSuccess, totalFailure, failedPlatforms };
}

export function resolveInstallHubSteps(
  selectedSkillCount: number,
  selectedPlatformCount: number,
): Record<InstallHubStage, InstallHubStepState> {
  return {
    skills: {
      stage: "skills",
      available: true,
      complete: selectedSkillCount > 0,
    },
    platforms: {
      stage: "platforms",
      available: selectedSkillCount > 0,
      complete: selectedPlatformCount > 0,
    },
    review: {
      stage: "review",
      available: selectedSkillCount > 0 && selectedPlatformCount > 0,
      complete: false,
    },
  };
}

export function coerceInstallHubStage(
  activeStage: InstallHubStage,
  selectedSkillCount: number,
  selectedPlatformCount: number,
): InstallHubStage {
  if (selectedSkillCount === 0) {
    return "skills";
  }

  if (activeStage === "review" && selectedPlatformCount === 0) {
    return "platforms";
  }

  return activeStage;
}

export function buildInstallHubSummary(args: {
  platforms: PlatformDisplay[];
  selectedPlatforms: PlatformSelection;
  selectedSkills: SkillSelection;
  filteredSkillCount: number;
  totalSkillCount: number;
}): InstallHubSelectionSummary {
  const selectedPlatformItems = args.platforms.filter((platform) =>
    args.selectedPlatforms.has(platform.id),
  );

  return {
    selectedSkillNames: Array.from(args.selectedSkills),
    selectedPlatforms: selectedPlatformItems,
    filteredSkillCount: args.filteredSkillCount,
    totalSkillCount: args.totalSkillCount,
    plannedActionCount: selectedPlatformItems.length * args.selectedSkills.size,
  };
}
