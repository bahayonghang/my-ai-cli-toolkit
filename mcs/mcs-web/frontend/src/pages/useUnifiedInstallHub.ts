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

    const runResults = await installAcrossPlatforms(
      selection,
      setExecution,
      setResults,
      t
    );
    setExecution({
      running: false,
      currentStep: selection.platforms.length,
      totalSteps: selection.platforms.length,
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
  const runResults: PlatformInstallResult[] = [];
  setResults([]);
  setExecution({ running: true, currentStep: 0, totalSteps: selection.platforms.length });

  for (let index = 0; index < selection.platforms.length; index++) {
    const platform = selection.platforms[index];
    setExecution({ running: true, currentStep: index + 1, totalSteps: selection.platforms.length });
    runResults.push(await installOnPlatform(platform, selection.skills, t));
    setResults([...runResults]);
  }

  return runResults;
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
