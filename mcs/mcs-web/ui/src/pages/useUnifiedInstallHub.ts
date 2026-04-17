import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAgents,
  getCommands,
  getSkillCatalog,
  installAgents,
  installCommands,
  installSkills,
} from "@/api/client";
import type {
  ExecutionState,
  InstallHubStage,
  PlatformInstallResult,
  PlatformSelection,
  SkillSelection,
} from "@/components/install-hub/types";
import { useI18n } from "@/i18n";
import type { TranslateFn } from "@/i18n";
import type {
  InstallCatalogItemDto,
  ItemType,
  PlatformDisplay,
} from "@/types";
import {
  mergePlatformItemsIntoCatalog,
  platformSupportsItemType,
} from "@/utils/installHubContent";
import {
  buildInstallHubSummary,
  coerceInstallHubStage,
  collectSkillCategories,
  filterSkillCatalog,
  resolveInstallHubSteps,
  summarizeInstallResults,
} from "./installHubLogic";

const INITIAL_EXECUTION: ExecutionState = {
  running: false,
  currentStep: 0,
  totalSteps: 0,
  phase: "idle",
  activePlatformId: null,
};

interface Dependencies {
  platforms: PlatformDisplay[];
  fetchPlatforms: () => Promise<void>;
  refreshPlatforms: () => Promise<void>;
  notify: (
    message: string,
    severity?: "success" | "error" | "info" | "warning",
  ) => void;
}

interface RunnerDependencies {
  platforms: PlatformDisplay[];
  refreshPlatforms: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  notify: (
    message: string,
    severity?: "success" | "error" | "info" | "warning",
  ) => void;
  itemType: ItemType;
  catalog: InstallCatalogItemDto[];
  selectedPlatforms: PlatformSelection;
  selectedSkills: SkillSelection;
  setExecution: (state: ExecutionState) => void;
  setResults: (results: PlatformInstallResult[]) => void;
  setActiveStage: (stage: InstallHubStage) => void;
  t: TranslateFn;
}

interface PlatformInstallTask {
  platform: PlatformDisplay;
  itemType: ItemType;
  itemNames: string[];
}

export function useUnifiedInstallHub({
  platforms,
  fetchPlatforms,
  refreshPlatforms,
  notify,
}: Dependencies) {
  const { t } = useI18n();
  const catalogState = useCatalogState(platforms);
  const selectionState = useSelectionState(platforms.length);
  const { selectedSkills, selectedPlatforms, setSelectedSkills, setSelectedPlatforms } =
    selectionState;
  const [execution, setExecution] = useState<ExecutionState>(INITIAL_EXECUTION);
  const [results, setResults] = useState<PlatformInstallResult[]>([]);
  const [activeStage, setActiveStage] = useState<InstallHubStage>("skills");

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    setSelectedSkills(new Set());
    setSelectedPlatforms((previous) => {
      const next = new Set(
        [...previous].filter((platformId) =>
          platforms.some(
            (platform) =>
              platform.id === platformId &&
              platformSupportsItemType(platform, catalogState.itemType),
          ),
        ),
      );
      return next;
    });
  }, [catalogState.itemType, platforms, setSelectedPlatforms, setSelectedSkills]);

  const availablePlatforms = useMemo(
    () =>
      platforms.filter((platform) =>
        platformSupportsItemType(platform, catalogState.itemType),
      ),
    [platforms, catalogState.itemType],
  );

  const summary = useMemo(
    () =>
      buildInstallHubSummary({
        platforms: availablePlatforms,
        selectedPlatforms,
        selectedSkills,
        catalog: catalogState.catalog,
        itemType: catalogState.itemType,
        filteredSkillCount: catalogState.filteredSkills.length,
        totalSkillCount: catalogState.catalog.length,
      }),
    [
      availablePlatforms,
      selectedPlatforms,
      selectedSkills,
      catalogState.catalog,
      catalogState.itemType,
      catalogState.filteredSkills.length,
    ],
  );

  const steps = useMemo(
    () => resolveInstallHubSteps(selectedSkills.size, selectedPlatforms.size),
    [selectedSkills.size, selectedPlatforms.size],
  );

  useEffect(() => {
    setActiveStage((previous) =>
      coerceInstallHubStage(previous, selectedSkills.size, selectedPlatforms.size),
    );
  }, [selectedPlatforms.size, selectedSkills.size]);

  const goToStage = useCallback(
    (stage: InstallHubStage) => {
      if (execution.running && stage !== "review") {
        return;
      }
      if (stage !== "skills" && !steps[stage].available) {
        return;
      }
      setActiveStage(stage);
    },
    [execution.running, steps],
  );

  const runInstall = useInstallRunner({
    platforms: availablePlatforms,
    refreshPlatforms,
    refreshCatalog: catalogState.refreshCatalog,
    notify,
    itemType: catalogState.itemType,
    catalog: catalogState.catalog,
    selectedPlatforms,
    selectedSkills,
    setExecution,
    setResults,
    setActiveStage,
    t,
  });

  return {
    ...catalogState,
    ...selectionState,
    activeStage,
    availablePlatforms,
    goToStage,
    steps,
    summary,
    execution,
    results,
    setResults,
    plannedActionCount: summary.plannedActionCount,
    runInstall,
  };
}

function useCatalogState(platforms: PlatformDisplay[]) {
  const [catalog, setCatalog] = useState<InstallCatalogItemDto[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [itemType, setItemType] = useState<ItemType>("skill");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [defaultOnly, setDefaultOnly] = useState(false);

  const categories = useMemo(() => collectSkillCategories(catalog), [catalog]);
  const filteredSkills = useMemo(
    () => filterSkillCatalog(catalog, search, selectedCategory, defaultOnly),
    [catalog, search, selectedCategory, defaultOnly],
  );

  const refreshCatalog = useCallback(async () => {
    await loadCatalog(
      itemType,
      platforms,
      setCatalog,
      setCatalogError,
      setLoadingCatalog,
    );
  }, [itemType, platforms]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    setSelectedCategory(null);
    setDefaultOnly(false);
  }, [itemType]);

  return {
    catalog,
    itemType,
    loadingCatalog,
    catalogError,
    search,
    selectedCategory,
    defaultOnly,
    categories,
    filteredSkills,
    setItemType,
    setSearch,
    setSelectedCategory,
    setDefaultOnly,
    refreshCatalog,
  };
}

function useSelectionState(platformCount: number) {
  const [selectedSkills, setSelectedSkills] = useState<SkillSelection>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSelection>(new Set());

  useEffect(() => {
    if (platformCount === 0 && selectedPlatforms.size > 0) {
      setSelectedPlatforms(new Set());
    }
  }, [platformCount, selectedPlatforms.size]);

  return { selectedSkills, selectedPlatforms, setSelectedSkills, setSelectedPlatforms };
}

function useInstallRunner({
  platforms,
  refreshPlatforms,
  refreshCatalog,
  notify,
  itemType,
  catalog,
  selectedPlatforms,
  selectedSkills,
  setExecution,
  setResults,
  setActiveStage,
  t,
}: RunnerDependencies) {
  return useCallback(async () => {
    const selection = resolveInstallSelection(
      platforms,
      selectedPlatforms,
      selectedSkills,
      catalog,
      itemType,
    );
    if (!selection) {
      notify(t("installHub.noCompatibleSelections"), "warning");
      return;
    }

    const totalPlatforms = selection.tasks.length;
    setActiveStage("review");

    const runResults = await installAcrossPlatforms(
      selection,
      setExecution,
      setResults,
      t,
    );
    setExecution({
      running: false,
      currentStep: totalPlatforms,
      totalSteps: totalPlatforms,
      phase: "complete",
      activePlatformId: null,
    });
    await refreshPlatforms();
    await refreshCatalog();
    notifySummary(runResults, notify, t);
  }, [
    platforms,
    refreshPlatforms,
    refreshCatalog,
    notify,
    itemType,
    catalog,
    selectedPlatforms,
    selectedSkills,
    setExecution,
    setResults,
    setActiveStage,
    t,
  ]);
}

async function loadCatalog(
  itemType: ItemType,
  platforms: PlatformDisplay[],
  setCatalog: (value: InstallCatalogItemDto[]) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
) {
  setLoading(true);
  setError(null);
  try {
    if (itemType === "skill") {
      const skills = await getSkillCatalog();
      setCatalog(
        skills.map((skill) => ({
          ...skill,
          item_type: "skill",
        })),
      );
      return;
    }

    const supportedPlatforms = platforms.filter((platform) =>
      platformSupportsItemType(platform, itemType),
    );
    const itemsByPlatform = await Promise.all(
      supportedPlatforms.map(async (platform) => ({
        platform,
        items:
          itemType === "command"
            ? await getCommands(platform.id)
            : await getAgents(platform.id),
      })),
    );

    setCatalog(
      mergePlatformItemsIntoCatalog(
        itemType as Extract<ItemType, "command" | "agent">,
        itemsByPlatform,
      ),
    );
  } catch (error) {
    setError((error as Error).message);
  } finally {
    setLoading(false);
  }
}

function resolveInstallSelection(
  platforms: PlatformDisplay[],
  selectedPlatforms: PlatformSelection,
  selectedSkills: SkillSelection,
  catalog: InstallCatalogItemDto[],
  itemType: ItemType,
): { tasks: PlatformInstallTask[] } | null {
  if (selectedSkills.size === 0 || selectedPlatforms.size === 0) {
    return null;
  }

  const catalogByName = new Map(catalog.map((item) => [item.name, item]));
  const tasks = platforms
    .filter((platform) => selectedPlatforms.has(platform.id))
    .map((platform) => ({
      platform,
      itemType,
      itemNames: Array.from(selectedSkills).filter((name) => {
        const item = catalogByName.get(name);
        return item?.item_type === itemType && Boolean(item.platform_status?.[platform.id]);
      }),
    }));

  if (tasks.every((task) => task.itemNames.length === 0)) {
    return null;
  }

  return { tasks };
}

export async function installAcrossPlatforms(
  selection: { tasks: PlatformInstallTask[] },
  setExecution: (state: ExecutionState) => void,
  setResults: (results: PlatformInstallResult[]) => void,
  t: TranslateFn,
): Promise<PlatformInstallResult[]> {
  const totalPlatforms = selection.tasks.length;
  const runResultsByPlatform = new Map<string, PlatformInstallResult>();
  setResults([]);
  setExecution({
    running: true,
    currentStep: 0,
    totalSteps: totalPlatforms,
    phase: "running",
    activePlatformId: selection.tasks[0]?.platform.id ?? null,
  });

  let completedCount = 0;

  const promises = selection.tasks.map(async (task) => {
    const result = await installOnPlatform(
      task.platform,
      task.itemNames,
      task.itemType,
      t,
    );
    runResultsByPlatform.set(task.platform.id, result);
    completedCount++;
    const nextActivePlatform =
      selection.tasks.find(
        (candidate) => !runResultsByPlatform.has(candidate.platform.id),
      )?.platform.id ?? null;
    setExecution({
      running: true,
      currentStep: completedCount,
      totalSteps: totalPlatforms,
      phase: "running",
      activePlatformId: nextActivePlatform,
    });
    setResults(resolveResultsInSelectionOrder(selection.tasks, runResultsByPlatform));
    return result;
  });

  await Promise.allSettled(promises);
  return resolveResultsInSelectionOrder(selection.tasks, runResultsByPlatform);
}

export async function installOnPlatform(
  platform: PlatformDisplay,
  names: string[],
  itemType: ItemType,
  t: TranslateFn,
): Promise<PlatformInstallResult> {
  if (names.length === 0) {
    return {
      platform,
      successCount: 0,
      failureCount: 0,
      results: [],
      requestError: null,
    };
  }

  try {
    const response =
      itemType === "skill"
        ? await installSkills(platform.id, names)
        : itemType === "command"
          ? await installCommands(platform.id, names)
          : await installAgents(platform.id, names);
    return {
      platform,
      successCount: response.success_count,
      failureCount: response.failure_count,
      results: response.results,
      requestError: null,
      runId: response.run_id ?? null,
    };
  } catch (error) {
    const message = (error as Error).message;
    return {
      platform,
      successCount: 0,
      failureCount: names.length,
      results: names.map((name) => buildInstallError(name, message, t)),
      requestError: message,
      runId: null,
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

function resolveResultsInSelectionOrder(
  selectionTasks: PlatformInstallTask[],
  resultsByPlatform: Map<string, PlatformInstallResult>,
): PlatformInstallResult[] {
  return selectionTasks
    .map((task) => resultsByPlatform.get(task.platform.id))
    .filter((result): result is PlatformInstallResult => result !== undefined);
}

function notifySummary(
  results: PlatformInstallResult[],
  notify: (
    message: string,
    severity?: "success" | "error" | "info" | "warning",
  ) => void,
  t: TranslateFn,
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
    summary.totalFailure > 0 ? "warning" : "success",
  );
}
