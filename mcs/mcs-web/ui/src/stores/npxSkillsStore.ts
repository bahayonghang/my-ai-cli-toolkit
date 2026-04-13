import { create } from "zustand";
import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCatalogItemDto,
  NpxSkillsCapabilitiesDto,
  NpxSkillsCliMode,
  NpxSkillsInstalledSummaryDto,
  NpxSkillsJobStartDto,
  NpxSkillsOperation,
  NpxSkillsPackagePreviewDto,
  NpxSkillsRunConfig,
  InstallTarget,
} from "@/types";
import {
  getNpxInstalledSkills,
  getNpxSkillsCatalog,
  previewNpxSkillsPackage,
} from "@/api/client";
import type {
  InstalledSourceFilter,
  InstalledTrackingFilter,
  InstalledUpdateFilter,
  JobItemState,
  PendingRunAction,
  RunResultStatus,
  TaxonomyGroupSummary,
} from "@/pages/npx-skills/types";
import {
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

// ── Store interface ───────────────────────────────────────────────

export interface NpxSkillsState {
  // ── Catalog data (cached) ─────────────────────────────────────
  catalogItems: NpxSkillsCatalogItemDto[];
  catalogLoading: boolean;
  catalogError: string | null;
  catalogSyncedAt: number | null;
  catalogGroups: TaxonomyGroupSummary[];

  // ── Catalog UI filters ────────────────────────────────────────
  catalogSearch: string;
  installedOnly: boolean;
  selectedCatalogCategoryId: string | null;
  selectedCatalogKeys: Set<string>;

  // ── Package preview ───────────────────────────────────────────
  packagePreviewInput: string;
  packagePreviewLoading: boolean;
  packagePreviewError: string | null;
  packagePreview: NpxSkillsPackagePreviewDto | null;
  selectedPreviewSkills: Set<string>;

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
  fetchCatalog: (
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

export const useNpxSkillsStore = create<NpxSkillsState>((set) => ({
  // ── Initial state ─────────────────────────────────────────────

  catalogItems: [],
  catalogLoading: false,
  catalogError: null,
  catalogSyncedAt: null,
  catalogGroups: [],

  catalogSearch: "",
  installedOnly: false,
  selectedCatalogCategoryId: null,
  selectedCatalogKeys: new Set(),

  packagePreviewInput: "",
  packagePreviewLoading: false,
  packagePreviewError: null,
  packagePreview: null,
  selectedPreviewSkills: new Set(),

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
  expandedJobItemIds: new Set(),
  jobRunConfig: null,
  jobResultStatus: "idle",
  jobStatusMessage: null,

  agents: loadAgents(),
  cliMode: loadCliMode(),
  settingsOpen: false,
  pendingRunAction: null,

  // ── Catalog actions ───────────────────────────────────────────

  setCatalogSearch: (value) => set({ catalogSearch: value }),
  setInstalledOnly: (value) => set({ installedOnly: value }),
  setSelectedCatalogCategoryId: (value) => set({ selectedCatalogCategoryId: value }),
  setSelectedCatalogKeys: (update) =>
    set((state) => ({
      selectedCatalogKeys:
        typeof update === "function" ? update(state.selectedCatalogKeys) : update,
    })),

  fetchCatalog: async (workspaceId, installTarget, signal) => {
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
      set({
        catalogItems: data,
        catalogGroups,
        catalogSyncedAt: Date.now(),
      });
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
      installedItems: [],
      installedCapabilities: null,
      installedSummary: null,
      installedGroups: [],
      installedLoading: false,
      installedError: null,
      installedErrorHint: null,
      installedSyncedAt: null,
      installedPage: 1,
      selectedCatalogKeys: new Set(),
      selectedInstalledIds: new Set(),
      selectedInstalledItem: null,
      packagePreview: null,
      packagePreviewError: null,
      selectedPreviewSkills: new Set(),
    }),
}));

// ── Derived data selectors ────────────────────────────────────────

export function selectVisibleCatalogItems(state: NpxSkillsState) {
  return filterCatalogItems(state.catalogItems, {
    search: state.catalogSearch,
    categoryId: state.selectedCatalogCategoryId,
    installedOnly: state.installedOnly,
  });
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
