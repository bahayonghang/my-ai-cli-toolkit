import { create } from "zustand";
import type {
  NpxCatalogInstallStateDto,
  NpxInstalledPackageDto,
  NpxInstalledSkillInstanceDto,
  NpxSkillsCatalogItemDto,
  NpxSkillsCapabilitiesDto,
  NpxSkillsCliMode,
  NpxSkillsCliVersionDto,
  NpxSkillsInstalledSummaryDto,
  NpxSkillsJobStartDto,
  NpxSkillsOperation,
  NpxSkillsPackagePreviewDto,
  NpxSkillsPackagesSummaryDto,
  NpxSkillsRunConfig,
  InstallTarget,
} from "@/types";
import {
  getNpxSkillsCatalogInstallState,
  getNpxInstalledPackages,
  getNpxInstalledSkills,
  getNpxSkillsCliVersion,
  getNpxSkillsCatalog,
  previewNpxSkillsPackage,
} from "@/api/client";
import type {
  CatalogSection,
  InstalledSourceFilter,
  InstalledTrackingFilter,
  InstalledUpdateFilter,
  JobLogEntry,
  JobItemState,
  PendingRunAction,
  RunResultStatus,
  TaxonomyGroupSummary,
} from "@/pages/npx-skills/types";
import {
  buildCatalogSections,
  buildTaxonomyGroups,
  loadAgents,
  loadCliMode,
  paginateItems,
  filterCatalogItems,
  filterInstalledItems,
  persistNpxSkillsPreference,
} from "@/pages/npx-skills/utils";
import { LS_KEY_AGENTS, LS_KEY_CLI_MODE } from "@/pages/npx-skills/types";

// ── Taxonomy mapping helpers ──────────────────────────────────────

function mapTaxonomyGroups(
  groups: Array<{
    id: string;
    label: string;
    order: number;
    categories: Array<{
      id: string;
      slug: string;
      label: string;
      count: number;
      group_id: string;
      group_order: number;
      category_order: number;
    }>;
  }>,
): TaxonomyGroupSummary[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    order: group.order,
    categories: group.categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.label,
      count: category.count,
      groupId: category.group_id,
      groupOrder: category.group_order,
      categoryOrder: category.category_order,
    })),
  }));
}

function buildGroupedTaxonomyFromCatalog(items: NpxSkillsCatalogItemDto[]) {
  const groups = new Map<
    string,
    {
      label: string;
      order: number;
      categories: Map<
        string,
        {
          id: string;
          slug: string;
          label: string;
          count: number;
          group_id: string;
          group_order: number;
          category_order: number;
        }
      >;
    }
  >();

  for (const item of items) {
    let group = groups.get(item.group_id);
    if (!group) {
      group = {
        label: item.group_label,
        order: item.group_order,
        categories: new Map(),
      };
      groups.set(item.group_id, group);
    }

    const existing = group.categories.get(item.category_id);
    if (existing) {
      existing.count += 1;
      continue;
    }

    group.categories.set(item.category_id, {
      id: item.category_id,
      slug: item.category_slug,
      label: item.category_label,
      count: 1,
      group_id: item.group_id,
      group_order: item.group_order,
      category_order: item.category_order,
    });
  }

  return Array.from(groups.entries())
    .map(([id, group]) => ({
      id,
      label: group.label,
      order: group.order,
      categories: Array.from(group.categories.values()).sort(
        (left, right) =>
          left.category_order - right.category_order ||
          left.label.localeCompare(right.label),
      ),
    }))
    .sort(
      (left, right) =>
        left.order - right.order || left.label.localeCompare(right.label),
    );
}

// ── Derived recompute helper ──────────────────────────────────────

type CatalogDerivedInputs = Pick<
  NpxSkillsState,
  "catalogItems" | "catalogSearch" | "installedOnly" | "catalogGroups"
>;

function recomputeCatalogDerived(inputs: CatalogDerivedInputs): {
  visibleCatalogItems: NpxSkillsCatalogItemDto[];
  catalogSections: CatalogSection[];
} {
  const visibleCatalogItems = filterCatalogItems(inputs.catalogItems, {
    search: inputs.catalogSearch,
    categoryId: null,
    installedOnly: inputs.installedOnly,
  });
  const groups =
    inputs.catalogGroups.length > 0
      ? inputs.catalogGroups
      : buildTaxonomyGroups(visibleCatalogItems);
  const catalogSections = buildCatalogSections(visibleCatalogItems, groups);
  return { visibleCatalogItems, catalogSections };
}

function applyCatalogInstallState(
  items: NpxSkillsCatalogItemDto[],
  installedIdsByName: Record<string, string>,
): NpxSkillsCatalogItemDto[] {
  return items.map((item) => {
    const installedName = item.skill_flag ?? item.name;
    const installedInstanceId = installedIdsByName[installedName] ?? null;
    return {
      ...item,
      installed_state: installedInstanceId ? "installed" : "not_installed",
      installed_instance_id: installedInstanceId,
    };
  });
}

function mergeCatalogInstallStateResponse(
  items: NpxSkillsCatalogItemDto[],
  response: NpxCatalogInstallStateDto | null,
): NpxSkillsCatalogItemDto[] {
  if (
    !response ||
    (response.freshness !== "fresh" && response.freshness !== "stale")
  ) {
    return items;
  }
  return applyCatalogInstallState(items, response.installed_ids_by_name);
}

// ── Store interface ───────────────────────────────────────────────

export interface NpxSkillsState {
  // ── Catalog data (cached) ─────────────────────────────────────
  catalogItems: NpxSkillsCatalogItemDto[];
  catalogLoading: boolean;
  catalogError: string | null;
  catalogSyncedAt: number | null;
  catalogGroups: TaxonomyGroupSummary[];
  catalogRequestKey: string | null;
  catalogInstallState: NpxCatalogInstallStateDto | null;
  catalogInstallStateLoading: boolean;
  catalogInstallStateError: string | null;
  catalogInstallStateSyncedAt: number | null;
  catalogInstallStateRequestKey: string | null;

  // ── Catalog derived (referentially stable — recomputed only on input change) ─
  visibleCatalogItems: NpxSkillsCatalogItemDto[];
  catalogSections: CatalogSection[];

  // ── Catalog UI filters ────────────────────────────────────────
  catalogSearch: string;
  installedOnly: boolean;
  selectedCatalogCategoryId: string | null;
  selectedCatalogKeys: Set<string>;
  activeCatalogAnchorId: string | null;

  // ── Package preview ───────────────────────────────────────────
  packagePreviewInput: string;
  packagePreviewLoading: boolean;
  packagePreviewError: string | null;
  packagePreview: NpxSkillsPackagePreviewDto | null;
  selectedPreviewSkills: Set<string>;

  // ── Package inventory + CLI version ───────────────────────────
  packageItems: NpxInstalledPackageDto[];
  packageCapabilities: NpxSkillsCapabilitiesDto | null;
  packageSummary: NpxSkillsPackagesSummaryDto | null;
  packageLoading: boolean;
  packageError: string | null;
  packageSyncedAt: number | null;
  packageQueryKey: string | null;
  packageSearch: string;
  packagePage: number;
  packagePageSize: number;
  packageTotalPages: number;
  packageFilteredTotal: number;
  selectedPackageIds: Set<string>;
  selectedPackageItem: NpxInstalledPackageDto | null;
  cliVersionInfo: NpxSkillsCliVersionDto | null;
  cliVersionLoading: boolean;
  cliVersionError: string | null;
  cliVersionSyncedAt: number | null;
  cliVersionRequestKey: string | null;

  // ── Installed data (cached) ───────────────────────────────────
  installedItems: NpxInstalledSkillInstanceDto[];
  installedCapabilities: NpxSkillsCapabilitiesDto | null;
  installedSummary: NpxSkillsInstalledSummaryDto | null;
  installedGroups: TaxonomyGroupSummary[];
  installedLoading: boolean;
  installedError: string | null;
  installedErrorHint: string | null;
  installedSyncedAt: number | null;

  // ── Installed UI filters ──────────────────────────────────────
  installedSearch: string;
  selectedInstalledCategoryId: string | null;
  selectedInstalledIds: Set<string>;
  selectedInstalledItem: NpxInstalledSkillInstanceDto | null;
  installedSourceFilter: InstalledSourceFilter;
  installedTrackingFilter: InstalledTrackingFilter;
  installedUpdateFilter: InstalledUpdateFilter;
  installedPage: number;
  installedPageSize: number;

  // ── Job state ─────────────────────────────────────────────────
  jobId: string | null;
  jobOperation: NpxSkillsOperation | null;
  jobRunning: boolean;
  jobCompleted: number;
  jobTotal: number;
  jobPercent: number;
  jobSuccessCount: number;
  jobFailureCount: number;
  streamDisconnected: boolean;
  jobItems: JobItemState[];
  jobLogEntries: JobLogEntry[];
  expandedJobItemIds: Set<string>;
  jobRunConfig: NpxSkillsRunConfig | null;
  jobResultStatus: RunResultStatus;
  jobStatusMessage: string | null;

  // ── Settings ──────────────────────────────────────────────────
  agents: string[];
  cliMode: NpxSkillsCliMode;
  settingsOpen: boolean;
  pendingRunAction: PendingRunAction | null;

  // ── Actions ───────────────────────────────────────────────────

  // Catalog
  setCatalogSearch: (value: string) => void;
  setInstalledOnly: (value: boolean) => void;
  setSelectedCatalogCategoryId: (value: string | null) => void;
  setSelectedCatalogKeys: (update: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setActiveCatalogAnchorId: (value: string | null) => void;
  fetchCatalog: (
    workspaceId: string,
    installTarget: InstallTarget,
    signal?: AbortSignal,
  ) => Promise<void>;
  fetchCatalogInstallState: (
    workspaceId: string,
    installTarget: InstallTarget,
    signal?: AbortSignal,
  ) => Promise<void>;

  // Package preview
  setPackagePreviewInput: (value: string) => void;
  setSelectedPreviewSkills: (update: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  loadPackagePreview: (
    workspaceId: string,
    packageRef: string,
    installTarget: InstallTarget,
    agents: string[],
    cliMode: NpxSkillsCliMode,
    preferredSelection: string[] | null,
    signal?: AbortSignal,
  ) => Promise<void>;
  clearPackagePreview: () => void;

  // Package inventory + CLI version
  setPackageSearch: (value: string) => void;
  setPackagePage: (page: number) => void;
  setPackagePageSize: (size: number) => void;
  setSelectedPackageIds: (update: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setSelectedPackageItem: (item: NpxInstalledPackageDto | null) => void;
  fetchPackages: (
    workspaceId: string,
    installTarget: InstallTarget,
    refreshRemote?: boolean,
    signal?: AbortSignal,
  ) => Promise<void>;
  fetchCliVersion: (
    workspaceId: string,
    cliMode: NpxSkillsCliMode,
    refresh?: boolean,
    signal?: AbortSignal,
  ) => Promise<void>;

  // Installed
  setInstalledSearch: (value: string) => void;
  setSelectedInstalledCategoryId: (value: string | null) => void;
  setSelectedInstalledIds: (update: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setSelectedInstalledItem: (item: NpxInstalledSkillInstanceDto | null) => void;
  setInstalledSourceFilter: (value: InstalledSourceFilter) => void;
  setInstalledTrackingFilter: (value: InstalledTrackingFilter) => void;
  setInstalledUpdateFilter: (value: InstalledUpdateFilter) => void;
  setInstalledPage: (page: number) => void;
  setInstalledPageSize: (size: number) => void;
  fetchInstalled: (
    workspaceId: string,
    installTarget: InstallTarget,
    signal?: AbortSignal,
  ) => Promise<void>;

  // Job management
  initializeJob: (labels: string[], runConfig: NpxSkillsRunConfig) => void;
  setJobStarted: (started: NpxSkillsJobStartDto) => void;
  updateJobItemStatus: (
    itemId: string,
    status: JobItemState["status"],
    output?: string,
    error?: string | null,
    durationMs?: number | null,
  ) => void;
  updateJobProgress: (completed: number, total: number, successCount: number, failureCount: number, percent: number) => void;
  completeJob: (total: number, successCount: number, failureCount: number, operation: NpxSkillsOperation) => void;
  failJob: (message: string, operation: NpxSkillsOperation) => void;
  interruptJob: (items: JobItemState[], completed: number, total: number, successCount: number, failureCount: number, percent: number, message: string) => void;
  appendJobLogEntry: (entry: JobLogEntry) => void;
  toggleJobItemExpanded: (id: string) => void;
  setStreamDisconnected: (value: boolean) => void;

  // Settings
  updateAgents: (next: string[]) => void;
  updateCliMode: (next: NpxSkillsCliMode) => void;
  setSettingsOpen: (open: boolean) => void;
  setPendingRunAction: (action: PendingRunAction | null) => void;

  // Lifecycle
  resetForWorkspaceChange: () => void;
}

// ── Store implementation ──────────────────────────────────────────

export const useNpxSkillsStore = create<NpxSkillsState>((set, get) => {
  const CLI_VERSION_TTL_MS = 60_000;
  const CATALOG_INSTALL_STATE_TTL_MS = 60_000;
  let cliVersionFetchPromise: Promise<void> | null = null;
  let cliVersionFetchKey: string | null = null;
  let catalogInstallStateFetchPromise: Promise<void> | null = null;
  let catalogInstallStateFetchKey: string | null = null;

  return {
  // ── Initial state ─────────────────────────────────────────────

  catalogItems: [],
  catalogLoading: false,
  catalogError: null,
  catalogSyncedAt: null,
  catalogGroups: [],
  catalogRequestKey: null,
  catalogInstallState: null,
  catalogInstallStateLoading: false,
  catalogInstallStateError: null,
  catalogInstallStateSyncedAt: null,
  catalogInstallStateRequestKey: null,

  visibleCatalogItems: [],
  catalogSections: [],

  catalogSearch: "",
  installedOnly: false,
  selectedCatalogCategoryId: null,
  selectedCatalogKeys: new Set(),
  activeCatalogAnchorId: null,

  packagePreviewInput: "",
  packagePreviewLoading: false,
  packagePreviewError: null,
  packagePreview: null,
  selectedPreviewSkills: new Set(),

  packageItems: [],
  packageCapabilities: null,
  packageSummary: null,
  packageLoading: false,
  packageError: null,
  packageSyncedAt: null,
  packageQueryKey: null,
  packageSearch: "",
  packagePage: 1,
  packagePageSize: 20,
  packageTotalPages: 1,
  packageFilteredTotal: 0,
  selectedPackageIds: new Set(),
  selectedPackageItem: null,
  cliVersionInfo: null,
  cliVersionLoading: false,
  cliVersionError: null,
  cliVersionSyncedAt: null,
  cliVersionRequestKey: null,

  installedItems: [],
  installedCapabilities: null,
  installedSummary: null,
  installedGroups: [],
  installedLoading: false,
  installedError: null,
  installedErrorHint: null,
  installedSyncedAt: null,

  installedSearch: "",
  selectedInstalledCategoryId: null,
  selectedInstalledIds: new Set(),
  selectedInstalledItem: null,
  installedSourceFilter: "all",
  installedTrackingFilter: "all",
  installedUpdateFilter: "all",
  installedPage: 1,
  installedPageSize: 50,

  jobId: null,
  jobOperation: null,
  jobRunning: false,
  jobCompleted: 0,
  jobTotal: 0,
  jobPercent: 0,
  jobSuccessCount: 0,
  jobFailureCount: 0,
  streamDisconnected: false,
  jobItems: [],
  jobLogEntries: [],
  expandedJobItemIds: new Set(),
  jobRunConfig: null,
  jobResultStatus: "idle",
  jobStatusMessage: null,

  agents: loadAgents(),
  cliMode: loadCliMode(),
  settingsOpen: false,
  pendingRunAction: null,

  // ── Catalog actions ───────────────────────────────────────────

  setCatalogSearch: (value) =>
    set((state) => ({
      catalogSearch: value,
      ...recomputeCatalogDerived({ ...state, catalogSearch: value }),
    })),
  setInstalledOnly: (value) =>
    set((state) => ({
      installedOnly: value,
      ...recomputeCatalogDerived({ ...state, installedOnly: value }),
    })),
  setSelectedCatalogCategoryId: (value) => set({ selectedCatalogCategoryId: value }),
  setSelectedCatalogKeys: (update) =>
    set((state) => ({
      selectedCatalogKeys:
        typeof update === "function" ? update(state.selectedCatalogKeys) : update,
    })),
  setActiveCatalogAnchorId: (value) =>
    set((state) =>
      state.activeCatalogAnchorId === value ? state : { activeCatalogAnchorId: value },
    ),

  fetchCatalog: async (workspaceId, installTarget, signal) => {
    const requestKey = [
      workspaceId,
      installTarget.scope,
      installTarget.project_path ?? "",
    ].join("::");
    const state = get();
    if (
      state.catalogRequestKey === requestKey &&
      state.catalogSyncedAt !== null &&
      state.catalogError === null
    ) {
      return;
    }
    set({ catalogLoading: true, catalogError: null });
    try {
      const data = await getNpxSkillsCatalog(
        workspaceId,
        { installTarget },
        signal,
      );
      const catalogGroups = mapTaxonomyGroups(
        buildGroupedTaxonomyFromCatalog(data),
      );
      set((state) => ({
        catalogItems: mergeCatalogInstallStateResponse(data, state.catalogInstallState),
        catalogGroups,
        catalogSyncedAt: Date.now(),
        catalogRequestKey: requestKey,
        ...recomputeCatalogDerived({
          catalogItems: mergeCatalogInstallStateResponse(data, state.catalogInstallState),
          catalogSearch: state.catalogSearch,
          installedOnly: state.installedOnly,
          catalogGroups,
        }),
      }));
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        set({ catalogError: (error as Error).message });
      }
    } finally {
      if (!signal?.aborted) {
        set({ catalogLoading: false });
      }
    }
  },

  fetchCatalogInstallState: async (workspaceId, installTarget, signal) => {
    const requestKey = [
      workspaceId,
      installTarget.scope,
      installTarget.project_path ?? "",
    ].join("::");
    const state = get();
    const canReuse =
      state.catalogInstallStateRequestKey === requestKey &&
      state.catalogInstallStateSyncedAt !== null &&
      Date.now() - state.catalogInstallStateSyncedAt <= CATALOG_INSTALL_STATE_TTL_MS &&
      state.catalogInstallState?.freshness === "fresh";
    if (canReuse) {
      return;
    }
    if (catalogInstallStateFetchPromise && catalogInstallStateFetchKey === requestKey) {
      return catalogInstallStateFetchPromise;
    }

    set({ catalogInstallStateLoading: true, catalogInstallStateError: null });
    catalogInstallStateFetchKey = requestKey;
    catalogInstallStateFetchPromise = (async () => {
      try {
        const data = await getNpxSkillsCatalogInstallState(
          workspaceId,
          installTarget,
          signal,
        );
        set((current) => {
          const catalogItems = mergeCatalogInstallStateResponse(
            current.catalogItems,
            data,
          );
          return {
            catalogItems,
            catalogInstallState: data,
            catalogInstallStateSyncedAt: Date.now(),
            catalogInstallStateRequestKey: requestKey,
            ...recomputeCatalogDerived({
              catalogItems,
              catalogSearch: current.catalogSearch,
              installedOnly: current.installedOnly,
              catalogGroups: current.catalogGroups,
            }),
          };
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set({ catalogInstallStateError: (error as Error).message });
        }
      } finally {
        if (catalogInstallStateFetchKey === requestKey) {
          catalogInstallStateFetchKey = null;
          catalogInstallStateFetchPromise = null;
        }
        if (!signal?.aborted) {
          set({ catalogInstallStateLoading: false });
        }
      }
    })();
    return catalogInstallStateFetchPromise;
  },

  // ── Package preview actions ───────────────────────────────────

  setPackagePreviewInput: (value) => set({ packagePreviewInput: value }),
  setSelectedPreviewSkills: (update) =>
    set((state) => ({
      selectedPreviewSkills:
        typeof update === "function"
          ? update(state.selectedPreviewSkills)
          : update,
    })),

  loadPackagePreview: async (
    workspaceId,
    packageRef,
    installTarget,
    agents,
    cliMode,
    preferredSelection,
    signal,
  ) => {
    set({
      packagePreviewInput: packageRef,
      packagePreviewLoading: true,
      packagePreviewError: null,
    });
    try {
      const preview = await previewNpxSkillsPackage(workspaceId, {
        packageRef,
        installTarget,
        config: { agents, cli_mode: cliMode },
      });
      if (signal?.aborted) return;

      const nextSelection = new Set<string>();
      if (preview.mode === "listed_skills") {
        if (preferredSelection?.length) {
          const available = new Set(preview.skills.map((s) => s.name));
          for (const name of preferredSelection) {
            if (available.has(name)) nextSelection.add(name);
          }
        } else if (preview.skills.length === 1) {
          nextSelection.add(preview.skills[0].name);
        }
      }
      set({
        packagePreview: preview,
        selectedPreviewSkills: nextSelection,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        set({
          packagePreview: null,
          selectedPreviewSkills: new Set(),
          packagePreviewError: (error as Error).message,
        });
      }
    } finally {
      if (!signal?.aborted) {
        set({ packagePreviewLoading: false });
      }
    }
  },

  clearPackagePreview: () =>
    set({
      packagePreview: null,
      packagePreviewError: null,
      selectedPreviewSkills: new Set(),
    }),

  // ── Package inventory + CLI version actions ───────────────────

  setPackageSearch: (value) => set({ packageSearch: value, packagePage: 1 }),
  setPackagePage: (page) => set({ packagePage: page }),
  setPackagePageSize: (size) => set({ packagePageSize: size, packagePage: 1 }),
  setSelectedPackageIds: (update) =>
    set((state) => ({
      selectedPackageIds:
        typeof update === "function" ? update(state.selectedPackageIds) : update,
    })),
  setSelectedPackageItem: (item) => set({ selectedPackageItem: item }),

  fetchPackages: async (workspaceId, installTarget, refreshRemote = false, signal) => {
    const state = useNpxSkillsStore.getState();
    const requestKey = [
      workspaceId,
      installTarget.scope,
      installTarget.project_path ?? "",
      state.packageSearch.trim(),
      state.packagePage,
      state.packagePageSize,
    ].join("::");

    if (
      !refreshRemote &&
      state.packageQueryKey === requestKey &&
      state.packageSyncedAt !== null &&
      state.packageError === null
    ) {
      return;
    }

    set({ packageLoading: true, packageError: null });
    try {
      const data = await getNpxInstalledPackages(
        workspaceId,
        {
          search: state.packageSearch || undefined,
          page: state.packagePage,
          pageSize: state.packagePageSize,
          refreshRemote,
          installTarget,
        },
        signal,
      );
      set((current) => {
        const availableIds = new Set(data.items.map((item) => item.id));
        const selectedPackageIds = new Set(
          [...current.selectedPackageIds].filter((id) => availableIds.has(id)),
        );
        const selectedPackageItem = current.selectedPackageItem
          ? data.items.find((item) => item.id === current.selectedPackageItem?.id) ?? null
          : null;

        return {
          packageItems: data.items,
          packageCapabilities: data.capabilities,
          packageSummary: data.summary,
          packageSyncedAt: Date.now(),
          packageQueryKey: requestKey,
          packageFilteredTotal: data.filtered_total,
          packageTotalPages: data.total_pages,
          packagePage: data.page,
          packagePageSize: data.page_size,
          selectedPackageIds,
          selectedPackageItem,
        };
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        const typedError = error as Error & {
          details?: { remediation?: string; reason?: string };
        };
        set({
          packageError:
            typedError.details?.remediation ??
            typedError.details?.reason ??
            typedError.message,
        });
      }
    } finally {
      if (!signal?.aborted) {
        set({ packageLoading: false });
      }
    }
  },

  fetchCliVersion: async (workspaceId, cliMode, refresh = false, signal) => {
    const requestKey = [workspaceId, cliMode].join("::");
    const state = get();
    const canReuse =
      !refresh &&
      state.cliVersionRequestKey === requestKey &&
      state.cliVersionSyncedAt !== null &&
      Date.now() - state.cliVersionSyncedAt <= CLI_VERSION_TTL_MS &&
      state.cliVersionInfo?.freshness === "fresh";
    if (canReuse) {
      return;
    }
    if (cliVersionFetchPromise && cliVersionFetchKey === requestKey) {
      return cliVersionFetchPromise;
    }

    set({ cliVersionLoading: true, cliVersionError: null });
    cliVersionFetchKey = requestKey;
    cliVersionFetchPromise = (async () => {
      try {
        const data = await getNpxSkillsCliVersion(workspaceId, cliMode, refresh, signal);
        set({
          cliVersionInfo: data,
          cliVersionSyncedAt: Date.now(),
          cliVersionRequestKey: requestKey,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set({
            cliVersionError: (error as Error).message,
            cliVersionInfo: null,
          });
        }
      } finally {
        if (cliVersionFetchKey === requestKey) {
          cliVersionFetchKey = null;
          cliVersionFetchPromise = null;
        }
        if (!signal?.aborted) {
          set({ cliVersionLoading: false });
        }
      }
    })();
    return cliVersionFetchPromise;
  },

  // ── Installed actions ─────────────────────────────────────────

  setInstalledSearch: (value) => set({ installedSearch: value }),
  setSelectedInstalledCategoryId: (value) => set({ selectedInstalledCategoryId: value }),
  setSelectedInstalledIds: (update) =>
    set((state) => ({
      selectedInstalledIds:
        typeof update === "function"
          ? update(state.selectedInstalledIds)
          : update,
    })),
  setSelectedInstalledItem: (item) => set({ selectedInstalledItem: item }),
  setInstalledSourceFilter: (value) => set({ installedSourceFilter: value, installedPage: 1 }),
  setInstalledTrackingFilter: (value) => set({ installedTrackingFilter: value, installedPage: 1 }),
  setInstalledUpdateFilter: (value) => set({ installedUpdateFilter: value, installedPage: 1 }),
  setInstalledPage: (page) => set({ installedPage: page }),
  setInstalledPageSize: (size) => set({ installedPageSize: size, installedPage: 1 }),

  fetchInstalled: async (workspaceId, installTarget, signal) => {
    set({ installedLoading: true, installedError: null, installedErrorHint: null });
    try {
      const data = await getNpxInstalledSkills(
        workspaceId,
        { installTarget },
        signal,
      );
      set({
        installedItems: data.items,
        installedCapabilities: data.capabilities,
        installedSummary: data.summary,
        installedGroups: mapTaxonomyGroups(data.groups),
        installedSyncedAt: Date.now(),
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        const typedError = error as Error & {
          details?: { remediation?: string; reason?: string };
        };
        set({
          installedError: typedError.message,
          installedErrorHint:
            typedError.details?.remediation ??
            typedError.details?.reason ??
            null,
        });
      }
    } finally {
      if (!signal?.aborted) {
        set({ installedLoading: false });
      }
    }
  },

  // ── Job management actions ────────────────────────────────────

  initializeJob: (labels, runConfig) =>
    set({
      jobId: null,
      jobOperation: null,
      jobRunning: true,
      jobCompleted: 0,
      jobTotal: labels.length,
      jobPercent: 0,
      jobSuccessCount: 0,
      jobFailureCount: 0,
      streamDisconnected: false,
      expandedJobItemIds: new Set(),
      jobRunConfig: runConfig,
      jobResultStatus: "running",
      jobStatusMessage: null,
      jobLogEntries: [],
      jobItems: labels.map((label, index) => ({
        id: String(index),
        label,
        status: "pending" as const,
        output: "",
        error: null,
        durationMs: null,
      })),
    }),

  setJobStarted: (started) =>
    set({
      jobId: started.job_id,
      jobOperation: started.operation,
      jobTotal: started.total,
    }),

  updateJobItemStatus: (itemId, status, output, error, durationMs) =>
    set((state) => ({
      jobItems: state.jobItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
              ...(output !== undefined ? { output } : {}),
              ...(error !== undefined ? { error } : {}),
              ...(durationMs !== undefined ? { durationMs } : {}),
            }
          : item,
      ),
    })),

  updateJobProgress: (completed, total, successCount, failureCount, percent) =>
    set({ jobCompleted: completed, jobTotal: total, jobSuccessCount: successCount, jobFailureCount: failureCount, jobPercent: percent }),

  completeJob: (total, successCount, failureCount) =>
    set({
      jobRunning: false,
      jobCompleted: total,
      jobTotal: total,
      jobSuccessCount: successCount,
      jobFailureCount: failureCount,
      jobPercent: 100,
      jobResultStatus: failureCount > 0 ? "warning" : "success",
    }),

  failJob: (message) =>
    set({
      jobRunning: false,
      jobResultStatus: "error",
      jobStatusMessage: message,
    }),

  interruptJob: (items, completed, total, successCount, failureCount, percent, message) =>
    set({
      jobItems: items,
      jobRunning: false,
      jobCompleted: completed,
      jobTotal: total,
      jobSuccessCount: successCount,
      jobFailureCount: failureCount,
      jobPercent: percent,
      streamDisconnected: true,
      jobResultStatus: "interrupted",
      jobStatusMessage: message,
    }),

  appendJobLogEntry: (entry) =>
    set((state) => ({
      jobLogEntries: [...state.jobLogEntries, entry],
    })),

  toggleJobItemExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedJobItemIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedJobItemIds: next };
    }),

  setStreamDisconnected: (value) => set({ streamDisconnected: value }),

  // ── Settings actions ──────────────────────────────────────────

  updateAgents: (next) => {
    persistNpxSkillsPreference(LS_KEY_AGENTS, JSON.stringify(next));
    set({ agents: next });
  },

  updateCliMode: (next) => {
    persistNpxSkillsPreference(LS_KEY_CLI_MODE, next);
    set({ cliMode: next });
  },

  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setPendingRunAction: (action) => set({ pendingRunAction: action }),

  // ── Lifecycle ─────────────────────────────────────────────────

  resetForWorkspaceChange: () =>
    set({
      catalogItems: [],
      catalogLoading: false,
      catalogError: null,
      catalogSyncedAt: null,
      catalogGroups: [],
      catalogRequestKey: null,
      catalogInstallState: null,
      catalogInstallStateLoading: false,
      catalogInstallStateError: null,
      catalogInstallStateSyncedAt: null,
      catalogInstallStateRequestKey: null,
      visibleCatalogItems: [],
      catalogSections: [],
      packageItems: [],
      packageCapabilities: null,
      packageSummary: null,
      packageLoading: false,
      packageError: null,
      packageSyncedAt: null,
      packageQueryKey: null,
      packageSearch: "",
      packagePage: 1,
      packagePageSize: 20,
      packageTotalPages: 1,
      packageFilteredTotal: 0,
      selectedPackageIds: new Set(),
      selectedPackageItem: null,
      cliVersionInfo: null,
      cliVersionLoading: false,
      cliVersionError: null,
      cliVersionSyncedAt: null,
      cliVersionRequestKey: null,
      installedItems: [],
      installedCapabilities: null,
      installedSummary: null,
      installedGroups: [],
      installedLoading: false,
      installedError: null,
      installedErrorHint: null,
      installedSyncedAt: null,
      installedPage: 1,
      activeCatalogAnchorId: null,
      selectedCatalogKeys: new Set(),
      selectedInstalledIds: new Set(),
      selectedInstalledItem: null,
      packagePreview: null,
      packagePreviewError: null,
      selectedPreviewSkills: new Set(),
      pendingRunAction: null,
      jobLogEntries: [],
    }),
  };
});

// ── Derived data selectors ────────────────────────────────────────

export function selectVisibleCatalogItems(state: NpxSkillsState) {
  return filterCatalogItems(state.catalogItems, {
    search: state.catalogSearch,
    categoryId: null,
    installedOnly: state.installedOnly,
  });
}

export function selectCatalogSections(state: NpxSkillsState): CatalogSection[] {
  const visibleItems = selectVisibleCatalogItems(state);
  const groups =
    state.catalogGroups.length > 0
      ? state.catalogGroups
      : buildTaxonomyGroups(visibleItems);
  return buildCatalogSections(visibleItems, groups);
}

export function selectFilteredInstalledItems(state: NpxSkillsState) {
  return filterInstalledItems(state.installedItems, {
    search: state.installedSearch,
    categoryId: state.selectedInstalledCategoryId,
    sourceFilter: state.installedSourceFilter,
    trackingFilter: state.installedTrackingFilter,
    updateFilter: state.installedUpdateFilter,
  });
}

export function selectVisibleInstalledItems(state: NpxSkillsState) {
  const filtered = selectFilteredInstalledItems(state);
  return paginateItems(filtered, state.installedPage, state.installedPageSize);
}

export function selectInstalledTotalPages(state: NpxSkillsState) {
  const filteredTotal = selectFilteredInstalledItems(state).length;
  return Math.max(1, Math.ceil(filteredTotal / Math.max(1, state.installedPageSize)));
}

export function selectFilteredInstalledTotal(state: NpxSkillsState) {
  return selectFilteredInstalledItems(state).length;
}
