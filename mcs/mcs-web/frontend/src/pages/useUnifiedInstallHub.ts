import { useCallback, useEffect, useMemo, useState } from "react";
import { getSkillCatalog, installSkills } from "@/api/client";
import { useI18n } from "@/i18n";
import type { TranslateFn } from "@/i18n";
import type {
  ExecutionState,
  PlatformInstallResult,
  PlatformSelection,
  SkillSelection,
} from "@/components/install-hub/types";
import type { PlatformDisplay, SkillCatalogDto } from "@/types";
import {
  collectSkillCategories,
  filterSkillCatalog,
  summarizeInstallResults,
} from "./installHubLogic";

const INITIAL_EXECUTION: ExecutionState = { running: false, currentStep: 0, totalSteps: 0 };

interface Dependencies {
  platforms: PlatformDisplay[];
  fetchPlatforms: () => Promise<void>;
  refreshPlatforms: () => Promise<void>;
  notify: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

interface RunnerDependencies {
  platforms: PlatformDisplay[];
  refreshPlatforms: () => Promise<void>;
  notify: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
  selectedPlatforms: PlatformSelection;
  selectedSkills: SkillSelection;
  setExecution: (state: ExecutionState) => void;
  setResults: (results: PlatformInstallResult[]) => void;
  t: TranslateFn;
}

interface SkillsPathGroup {
  pathKey: string;
  platforms: PlatformDisplay[];
}

export function useUnifiedInstallHub({
  platforms,
  fetchPlatforms,
  refreshPlatforms,
  notify,
}: Dependencies) {
  const { t } = useI18n();
  const catalogState = useCatalogState(fetchPlatforms);
  const selectionState = useSelectionState(platforms);
  const [execution, setExecution] = useState<ExecutionState>(INITIAL_EXECUTION);
  const [results, setResults] = useState<PlatformInstallResult[]>([]);
  const selectedPlatformList = useMemo(
    () => platforms.filter((platform) => selectionState.selectedPlatforms.has(platform.id)),
    [platforms, selectionState.selectedPlatforms]
  );
  const plannedActionCount = useMemo(
    () => countSkillsPathGroups(selectedPlatformList) * selectionState.selectedSkills.size,
    [selectedPlatformList, selectionState.selectedSkills]
  );
  const runInstall = useInstallRunner({
    platforms,
    refreshPlatforms,
    notify,
    selectedPlatforms: selectionState.selectedPlatforms,
    selectedSkills: selectionState.selectedSkills,
    setExecution,
    setResults,
    t,
  });

  return {
    ...catalogState,
    ...selectionState,
    execution,
    results,
    setResults,
    plannedActionCount,
    runInstall,
  };
}

function useCatalogState(fetchPlatforms: () => Promise<void>) {
  const [catalog, setCatalog] = useState<SkillCatalogDto[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [defaultOnly, setDefaultOnly] = useState(false);

  const categories = useMemo(() => collectSkillCategories(catalog), [catalog]);
  const filteredSkills = useMemo(
    () => filterSkillCatalog(catalog, search, selectedCategory, defaultOnly),
    [catalog, search, selectedCategory, defaultOnly]
  );

  useEffect(() => {
    fetchPlatforms();
    loadCatalog(setCatalog, setCatalogError, setLoadingCatalog);
  }, [fetchPlatforms]);

  return {
    catalog,
    loadingCatalog,
    catalogError,
    search,
    selectedCategory,
    defaultOnly,
    categories,
    filteredSkills,
    setSearch,
    setSelectedCategory,
    setDefaultOnly,
  };
}

function useSelectionState(platforms: PlatformDisplay[]) {
  const [selectedSkills, setSelectedSkills] = useState<SkillSelection>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSelection>(new Set());

  useEffect(() => {
    if (platforms.length === 0) return;
    setSelectedPlatforms((previous) =>
      previous.size === 0 ? new Set(platforms.map((platform) => platform.id)) : previous
    );
  }, [platforms]);

  return { selectedSkills, selectedPlatforms, setSelectedSkills, setSelectedPlatforms };
}

function useInstallRunner({
  platforms,
  refreshPlatforms,
  notify,
  selectedPlatforms,
  selectedSkills,
  setExecution,
  setResults,
  t,
}: RunnerDependencies) {
  return useCallback(async () => {
    const selection = resolveInstallSelection(platforms, selectedPlatforms, selectedSkills);
    if (!selection) return;
    const totalGroups = countSkillsPathGroups(selection.platforms);

    const runResults = await installAcrossPlatforms(
      selection,
      setExecution,
      setResults,
      t
    );
    setExecution({
      running: false,
      currentStep: totalGroups,
      totalSteps: totalGroups,
    });
    await refreshPlatforms();
    notifySummary(runResults, notify, t);
  }, [
    platforms,
    refreshPlatforms,
    notify,
    selectedPlatforms,
    selectedSkills,
    setExecution,
    setResults,
    t,
  ]);
}

async function loadCatalog(
  setCatalog: (value: SkillCatalogDto[]) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void
) {
  setLoading(true);
  setError(null);
  try {
    setCatalog(await getSkillCatalog());
  } catch (error) {
    setError((error as Error).message);
  } finally {
    setLoading(false);
  }
}

function resolveInstallSelection(
  platforms: PlatformDisplay[],
  selectedPlatforms: PlatformSelection,
  selectedSkills: SkillSelection
): { platforms: PlatformDisplay[]; skills: string[] } | null {
  if (selectedSkills.size === 0 || selectedPlatforms.size === 0) return null;
  return {
    platforms: platforms.filter((platform) => selectedPlatforms.has(platform.id)),
    skills: Array.from(selectedSkills),
  };
}

async function installAcrossPlatforms(
  selection: { platforms: PlatformDisplay[]; skills: string[] },
  setExecution: (state: ExecutionState) => void,
  setResults: (results: PlatformInstallResult[]) => void,
  t: TranslateFn
): Promise<PlatformInstallResult[]> {
  const groups = groupPlatformsBySkillsPath(selection.platforms);
  const runResultsByPlatform = new Map<string, PlatformInstallResult>();
  setResults([]);
  setExecution({ running: true, currentStep: 0, totalSteps: groups.length });

  for (let index = 0; index < groups.length; index++) {
    const group = groups[index];
    const sourcePlatform = group.platforms[0];
    setExecution({ running: true, currentStep: index + 1, totalSteps: groups.length });

    const sourceResult = await installOnPlatform(sourcePlatform, selection.skills, t);
    runResultsByPlatform.set(sourcePlatform.id, sourceResult);
    for (const platform of group.platforms.slice(1)) {
      runResultsByPlatform.set(
        platform.id,
        buildReusedPlatformResult(platform, sourcePlatform, sourceResult)
      );
    }

    setResults(resolveResultsInSelectionOrder(selection.platforms, runResultsByPlatform));
  }

  return resolveResultsInSelectionOrder(selection.platforms, runResultsByPlatform);
}

async function installOnPlatform(
  platform: PlatformDisplay,
  names: string[],
  t: TranslateFn
): Promise<PlatformInstallResult> {
  try {
    const response = await installSkills(platform.id, names);
    return {
      platform,
      successCount: response.success_count,
      failureCount: response.failure_count,
      results: response.results,
      requestError: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    return {
      platform,
      successCount: 0,
      failureCount: names.length,
      results: names.map((name) => buildInstallError(name, message, t)),
      requestError: message,
    };
  }
}

function buildInstallError(name: string, error: string, t: TranslateFn) {
  return {
    success: false,
    item_name: name,
    message: t("installHub.failedToInstallItem", { name }),
    error,
  };
}

function countSkillsPathGroups(platforms: PlatformDisplay[]): number {
  return groupPlatformsBySkillsPath(platforms).length;
}

function groupPlatformsBySkillsPath(platforms: PlatformDisplay[]): SkillsPathGroup[] {
  const groups: SkillsPathGroup[] = [];
  const groupIndexByPath = new Map<string, number>();

  for (const platform of platforms) {
    const pathKey = normalizeSkillsPath(platform.skills_path);
    const existingIndex = groupIndexByPath.get(pathKey);
    if (existingIndex === undefined) {
      groupIndexByPath.set(pathKey, groups.length);
      groups.push({ pathKey, platforms: [platform] });
      continue;
    }
    groups[existingIndex].platforms.push(platform);
  }

  return groups;
}

function normalizeSkillsPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

function buildReusedPlatformResult(
  platform: PlatformDisplay,
  sourcePlatform: PlatformDisplay,
  sourceResult: PlatformInstallResult
): PlatformInstallResult {
  return {
    platform,
    successCount: sourceResult.successCount,
    failureCount: sourceResult.failureCount,
    results: sourceResult.results.map((itemResult) => ({
      ...itemResult,
      message: `Reused shared-path result from ${sourcePlatform.id}: ${itemResult.message}`,
    })),
    requestError: sourceResult.requestError
      ? `Reused shared-path result from ${sourcePlatform.id}: ${sourceResult.requestError}`
      : null,
  };
}

function resolveResultsInSelectionOrder(
  selectionPlatforms: PlatformDisplay[],
  resultsByPlatform: Map<string, PlatformInstallResult>
): PlatformInstallResult[] {
  return selectionPlatforms
    .map((platform) => resultsByPlatform.get(platform.id))
    .filter((result): result is PlatformInstallResult => result !== undefined);
}

function notifySummary(
  results: PlatformInstallResult[],
  notify: (message: string, severity?: "success" | "error" | "info" | "warning") => void,
  t: TranslateFn
) {
  const summary = summarizeInstallResults(results);
  const suffix =
    summary.failedPlatforms.length > 0
      ? t("installHub.failedPlatformsSuffix", {
          platforms: summary.failedPlatforms.join(", "),
        })
      : "";
  notify(
    t("installHub.installFinished", {
      success: summary.totalSuccess,
      failed: summary.totalFailure,
      suffix,
    }),
    summary.totalFailure > 0 ? "warning" : "success"
  );
}
