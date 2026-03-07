import type { SkillCatalogDto } from "@/types";
import type { PlatformInstallResult } from "@/components/install-hub/types";

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
