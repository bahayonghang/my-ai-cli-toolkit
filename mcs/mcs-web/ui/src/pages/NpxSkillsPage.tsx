import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SettingsIcon from "@mui/icons-material/Settings";

import {
  getNpxInstalledSkills,
  getNpxSkillsCatalog,
  previewNpxSkillsPackage,
  startNpxSkillsCheckJob,
  startNpxSkillsInstallJob,
  startNpxSkillsRemoveJob,
  startNpxSkillsUpdateJob,
} from "@/api/client";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { ListSurface, AppShell } from "@/components/shell/AppShell";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { NpxRunConfigDialog } from "@/components/dialogs/NpxRunConfigDialog";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { useI18n } from "@/i18n";
import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCapabilitiesDto,
  NpxSkillsCatalogItemDto,
  NpxSkillsCliConfig,
  NpxSkillsCliMode,
  NpxSkillsInstallItemInput,
  NpxSkillsInstalledSummaryDto,
  NpxSkillsItemFinishedPayload,
  NpxSkillsItemStartedPayload,
  NpxSkillsJobCompletedPayload,
  NpxSkillsJobFailedPayload,
  NpxSkillsJobProgressPayload,
  NpxSkillsJobStartDto,
  NpxSkillsOperation,
  NpxSkillsPackagePreviewDto,
  NpxSkillsRunConfig,
  PlatformDisplay,
} from "@/types";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { finalizeInterruptedJob } from "@/utils/npxJobState";
import {
  buildNpxJobNotification,
  buildNpxRunConfigSummary,
} from "./npxSkillsFeedback";
import NpxFindView from "./npx-skills/NpxFindView";
import NpxInstalledSkillDrawer from "./npx-skills/NpxInstalledSkillDrawer";
import NpxInstalledView from "./npx-skills/NpxInstalledView";
import NpxMaintenanceView from "./npx-skills/NpxMaintenanceView";
import type {
  InstalledSourceFilter,
  InstalledTrackingFilter,
  InstalledUpdateFilter,
  JobItemState,
  PendingRunAction,
  RunResultStatus,
  TaxonomyGroupSummary,
} from "./npx-skills/types";
import {
  COMMON_AGENTS,
  LS_KEY_AGENTS,
  LS_KEY_CLI_MODE,
} from "./npx-skills/types";
import {
  buildInstallKey,
  filterCatalogItems,
  filterInstalledItems,
  loadAgents,
  loadCliMode,
  operationLabel,
  paginateItems,
  parseSkillFlags,
  persistNpxSkillsPreference,
  safeParseEvent,
} from "./npx-skills/utils";

function upsertWorkspaceParam(current: URLSearchParams, workspaceId: string) {
  const next = new URLSearchParams(current);
  next.set("workspace", workspaceId);
  return next;
}

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

function groupCatalogInstallPayload(
  items: NpxSkillsCatalogItemDto[],
): NpxSkillsInstallItemInput[] {
  const grouped = new Map<
    string,
    {
      package_ref: string;
      skill_flags: string[];
      catalog_entry_id: string | null;
    }
  >();

  for (const item of items) {
    const existing = grouped.get(item.package_ref);
    if (!existing) {
      grouped.set(item.package_ref, {
        package_ref: item.package_ref,
        skill_flags: item.skill_flag ? [item.skill_flag] : [],
        catalog_entry_id: item.id,
      });
      continue;
    }

    if (!item.skill_flag) {
      existing.skill_flags = [];
      existing.catalog_entry_id = null;
      continue;
    }

    if (!existing.skill_flags.includes(item.skill_flag)) {
      existing.skill_flags.push(item.skill_flag);
    }
  }

  return Array.from(grouped.values()).map((item) => ({
    package_ref: item.package_ref,
    skill_flags: item.skill_flags,
    catalog_entry_id: item.catalog_entry_id,
  }));
}

function buildGroupedInstallLabels(items: NpxSkillsCatalogItemDto[]) {
  return groupCatalogInstallPayload(items).map((item) => {
    let label = item.package_ref;
    for (const flag of item.skill_flags ?? []) {
      label += ` --skill ${flag}`;
    }
    return label;
  });
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

export default function NpxSkillsPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateDeferred = useNavigateDeferred();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const platforms = usePlatformStore((state) => state.platforms);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const requestedWorkspaceId = searchParams.get("workspace");
  const currentWorkspaceId = useMemo(() => {
    if (
      requestedWorkspaceId &&
      platforms.some((platform) => platform.id === requestedWorkspaceId)
    ) {
      return requestedWorkspaceId;
    }
    return platforms[0]?.id ?? null;
  }, [platforms, requestedWorkspaceId]);
  const platform = useMemo(
    () =>
      currentWorkspaceId
        ? platforms.find((item) => item.id === currentWorkspaceId) ?? null
        : null,
    [currentWorkspaceId, platforms],
  );

  const { showNotification } = useUiStore();
  const {
    loading: installTargetLoading,
    dialogOpen: installTargetDialogOpen,
    target: installTarget,
    resolvedTarget,
    resolutionError,
    recentProjects,
    openDialog: openInstallTargetDialog,
    closeDialog: closeInstallTargetDialog,
    applyTarget: applyInstallTarget,
  } = useInstallTarget(currentWorkspaceId ?? undefined);
  const installTargetBlocked = Boolean(resolutionError);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingRunAction, setPendingRunAction] =
    useState<PendingRunAction | null>(null);

  const [catalogSearch, setCatalogSearch] = useState("");
  const [installedSearch, setInstalledSearch] = useState("");
  const [installedOnly, setInstalledOnly] = useState(false);
  const [selectedCatalogCategoryId, setSelectedCatalogCategoryId] = useState<
    string | null
  >(null);
  const [selectedInstalledCategoryId, setSelectedInstalledCategoryId] =
    useState<string | null>(null);

  const [catalogItems, setCatalogItems] = useState<NpxSkillsCatalogItemDto[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogSyncedAt, setCatalogSyncedAt] = useState<number | null>(null);

  const [installedItems, setInstalledItems] = useState<NpxInstalledSkillInstanceDto[]>([]);
  const [installedCapabilities, setInstalledCapabilities] =
    useState<NpxSkillsCapabilitiesDto | null>(null);
  const [installedSummary, setInstalledSummary] =
    useState<NpxSkillsInstalledSummaryDto | null>(null);
  const [installedGroups, setInstalledGroups] = useState<TaxonomyGroupSummary[]>([]);
  const [installedLoading, setInstalledLoading] = useState(false);
  const [installedError, setInstalledError] = useState<string | null>(null);
  const [installedErrorHint, setInstalledErrorHint] = useState<string | null>(null);
  const [installedSyncedAt, setInstalledSyncedAt] = useState<number | null>(null);

  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<Set<string>>(
    new Set(),
  );
  const [selectedInstalledIds, setSelectedInstalledIds] = useState<
    Set<string>
  >(new Set());
  const [selectedInstalledItem, setSelectedInstalledItem] =
    useState<NpxInstalledSkillInstanceDto | null>(null);
  const [installedSourceFilter, setInstalledSourceFilter] =
    useState<InstalledSourceFilter>("all");
  const [installedTrackingFilter, setInstalledTrackingFilter] =
    useState<InstalledTrackingFilter>("all");
  const [installedUpdateFilter, setInstalledUpdateFilter] =
    useState<InstalledUpdateFilter>("all");
  const [installedPage, setInstalledPage] = useState(1);
  const [installedPageSize, setInstalledPageSize] = useState(
    isMobile ? 20 : 50,
  );

  const [packagePreviewInput, setPackagePreviewInput] = useState("");
  const [packagePreviewLoading, setPackagePreviewLoading] = useState(false);
  const [packagePreviewError, setPackagePreviewError] = useState<string | null>(null);
  const [packagePreview, setPackagePreview] =
    useState<NpxSkillsPackagePreviewDto | null>(null);
  const [selectedPreviewSkills, setSelectedPreviewSkills] = useState<Set<string>>(
    new Set(),
  );

  const [agents, setAgents] = useState<string[]>(loadAgents);
  const [cliMode, setCliMode] = useState<NpxSkillsCliMode>(loadCliMode);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobOperation, setJobOperation] = useState<NpxSkillsOperation | null>(
    null,
  );
  const [jobRunning, setJobRunning] = useState(false);
  const [jobCompleted, setJobCompleted] = useState(0);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobPercent, setJobPercent] = useState(0);
  const [jobSuccessCount, setJobSuccessCount] = useState(0);
  const [jobFailureCount, setJobFailureCount] = useState(0);
  const [streamDisconnected, setStreamDisconnected] = useState(false);
  const [jobItems, setJobItems] = useState<JobItemState[]>([]);
  const [expandedJobItemIds, setExpandedJobItemIds] = useState<Set<string>>(
    new Set(),
  );
  const [jobRunConfig, setJobRunConfig] = useState<NpxSkillsRunConfig | null>(
    null,
  );
  const [jobResultStatus, setJobResultStatus] =
    useState<RunResultStatus>("idle");
  const [jobStatusMessage, setJobStatusMessage] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const streamWarnedRef = useRef(false);
  const catalogAbortRef = useRef<AbortController | null>(null);
  const installedAbortRef = useRef<AbortController | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const jobItemsRef = useRef<JobItemState[]>([]);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    if (!currentWorkspaceId || requestedWorkspaceId === currentWorkspaceId) {
      return;
    }
    setSearchParams((current) => upsertWorkspaceParam(current, currentWorkspaceId), {
      replace: true,
    });
  }, [currentWorkspaceId, requestedWorkspaceId, setSearchParams]);

  useEffect(() => {
    setInstalledPageSize(isMobile ? 20 : 50);
  }, [isMobile]);

  useEffect(() => {
    return () => {
      catalogAbortRef.current?.abort();
      installedAbortRef.current?.abort();
      previewAbortRef.current?.abort();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    jobItemsRef.current = jobItems;
  }, [jobItems]);

  const updateAgents = useCallback((next: string[]) => {
    setAgents(next);
    persistNpxSkillsPreference(LS_KEY_AGENTS, JSON.stringify(next));
  }, []);

  const updateCliMode = useCallback((next: NpxSkillsCliMode) => {
    setCliMode(next);
    persistNpxSkillsPreference(LS_KEY_CLI_MODE, next);
  }, []);

  const installTargetKey = useMemo(
    () =>
      `${currentWorkspaceId ?? ""}::${installTarget.scope}::${installTarget.project_path ?? ""}`,
    [currentWorkspaceId, installTarget.project_path, installTarget.scope],
  );

  const requestCatalog = useCallback(async () => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) {
      return;
    }
    catalogAbortRef.current?.abort();
    const controller = new AbortController();
    catalogAbortRef.current = controller;
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data = await getNpxSkillsCatalog(
        currentWorkspaceId,
        { installTarget },
        controller.signal,
      );
      setCatalogItems(data);
      setCatalogSyncedAt(Date.now());
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setCatalogError((error as Error).message);
      }
    } finally {
      if (catalogAbortRef.current === controller) {
        catalogAbortRef.current = null;
      }
      if (!controller.signal.aborted) {
        setCatalogLoading(false);
      }
    }
  }, [currentWorkspaceId, installTarget, installTargetLoading, resolvedTarget]);

  const requestInstalled = useCallback(async () => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) {
      return;
    }
    installedAbortRef.current?.abort();
    const controller = new AbortController();
    installedAbortRef.current = controller;
    setInstalledLoading(true);
    setInstalledError(null);
    setInstalledErrorHint(null);
    try {
      const data = await getNpxInstalledSkills(
        currentWorkspaceId,
        { installTarget },
        controller.signal,
      );
      setInstalledItems(data.items);
      setInstalledCapabilities(data.capabilities);
      setInstalledSummary(data.summary);
      setInstalledGroups(mapTaxonomyGroups(data.groups));
      setInstalledSyncedAt(Date.now());
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        const typedError = error as Error & {
          details?: { remediation?: string; reason?: string };
        };
        setInstalledError(typedError.message);
        setInstalledErrorHint(
          typedError.details?.remediation ?? typedError.details?.reason ?? null,
        );
      }
    } finally {
      if (installedAbortRef.current === controller) {
        installedAbortRef.current = null;
      }
      if (!controller.signal.aborted) {
        setInstalledLoading(false);
      }
    }
  }, [currentWorkspaceId, installTarget, installTargetLoading, resolvedTarget]);

  const loadPackagePreview = useCallback(
    async (packageRef: string, preferredSelection: string[] | null) => {
      if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) {
        return;
      }
      previewAbortRef.current?.abort();
      const controller = new AbortController();
      previewAbortRef.current = controller;
      setPackagePreviewInput(packageRef);
      setPackagePreviewLoading(true);
      setPackagePreviewError(null);
      try {
        const preview = await previewNpxSkillsPackage(currentWorkspaceId, {
          packageRef,
          installTarget,
          config: {
            agents,
            cli_mode: cliMode,
          },
        });
        if (controller.signal.aborted) {
          return;
        }
        setPackagePreview(preview);
        if (preview.mode === "listed_skills") {
          const nextSelection = new Set<string>();
          if (preferredSelection?.length) {
            const available = new Set(preview.skills.map((skill) => skill.name));
            for (const name of preferredSelection) {
              if (available.has(name)) {
                nextSelection.add(name);
              }
            }
          } else if (preview.skills.length === 1) {
            nextSelection.add(preview.skills[0].name);
          }
          setSelectedPreviewSkills(nextSelection);
        } else {
          setSelectedPreviewSkills(new Set());
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setPackagePreview(null);
          setSelectedPreviewSkills(new Set());
          setPackagePreviewError((error as Error).message);
        }
      } finally {
        if (previewAbortRef.current === controller) {
          previewAbortRef.current = null;
        }
        if (!controller.signal.aborted) {
          setPackagePreviewLoading(false);
        }
      }
    },
    [
      agents,
      cliMode,
      currentWorkspaceId,
      installTarget,
      installTargetLoading,
      resolvedTarget,
    ],
  );

  useEffect(() => {
    catalogAbortRef.current?.abort();
    installedAbortRef.current?.abort();
    previewAbortRef.current?.abort();
    setCatalogItems([]);
    setCatalogLoading(false);
    setCatalogError(null);
    setCatalogSyncedAt(null);
    setInstalledItems([]);
    setInstalledCapabilities(null);
    setInstalledSummary(null);
    setInstalledGroups([]);
    setInstalledLoading(false);
    setInstalledError(null);
    setInstalledErrorHint(null);
    setInstalledSyncedAt(null);
    setInstalledPage(1);
    setSelectedCatalogKeys(new Set());
    setSelectedInstalledIds(new Set());
    setSelectedInstalledItem(null);
    setPackagePreview(null);
    setPackagePreviewError(null);
    setSelectedPreviewSkills(new Set());
  }, [installTargetKey]);

  useEffect(() => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) {
      return;
    }
    void Promise.all([requestCatalog(), requestInstalled()]);
  }, [
    currentWorkspaceId,
    installTargetKey,
    installTargetLoading,
    requestCatalog,
    requestInstalled,
    resolvedTarget,
  ]);

  useEffect(() => {
    setInstalledPage(1);
  }, [
    currentWorkspaceId,
    installedPageSize,
    installedSearch,
    installedSourceFilter,
    installedTrackingFilter,
    installedUpdateFilter,
    selectedInstalledCategoryId,
  ]);

  const catalogGroups = useMemo(
    () => mapTaxonomyGroups(buildGroupedTaxonomyFromCatalog(catalogItems)),
    [catalogItems],
  );

  const visibleCatalogItems = useMemo(
    () =>
      filterCatalogItems(catalogItems, {
        search: catalogSearch,
        categoryId: selectedCatalogCategoryId,
        installedOnly,
      }),
    [catalogItems, catalogSearch, installedOnly, selectedCatalogCategoryId],
  );

  const selectedCatalogItems = useMemo(
    () =>
      catalogItems.filter((item) => selectedCatalogKeys.has(buildInstallKey(item))),
    [catalogItems, selectedCatalogKeys],
  );

  const selectedInstallPayload = useMemo(
    () => groupCatalogInstallPayload(selectedCatalogItems),
    [selectedCatalogItems],
  );

  const filteredInstalledItems = useMemo(
    () =>
      filterInstalledItems(installedItems, {
        search: installedSearch,
        categoryId: selectedInstalledCategoryId,
        sourceFilter: installedSourceFilter,
        trackingFilter: installedTrackingFilter,
        updateFilter: installedUpdateFilter,
      }),
    [
      installedItems,
      installedSearch,
      selectedInstalledCategoryId,
      installedSourceFilter,
      installedTrackingFilter,
      installedUpdateFilter,
    ],
  );
  const installedFilteredTotal = filteredInstalledItems.length;
  const installedTotalPages = Math.max(
    1,
    Math.ceil(installedFilteredTotal / Math.max(1, installedPageSize)),
  );
  useEffect(() => {
    if (installedPage > installedTotalPages) {
      setInstalledPage(installedTotalPages);
    }
  }, [installedPage, installedTotalPages]);
  const visibleInstalledItems = useMemo(
    () => paginateItems(filteredInstalledItems, installedPage, installedPageSize),
    [filteredInstalledItems, installedPage, installedPageSize],
  );

  const defaultRunConfig = useMemo<NpxSkillsRunConfig>(
    () => ({
      agents,
      cliMode,
      installTarget,
    }),
    [agents, cliMode, installTarget],
  );

  const closeEventStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const initializeJobItems = useCallback((labels: string[]) => {
    setJobItems(
      labels.map((label, index) => ({
        id: String(index),
        label,
        status: "pending",
        output: "",
        error: null,
        durationMs: null,
      })),
    );
  }, []);

  const refreshAfterJob = useCallback(() => {
    void Promise.all([requestCatalog(), requestInstalled()]);
  }, [requestCatalog, requestInstalled]);

  const toggleJobItemExpanded = useCallback((id: string) => {
    setExpandedJobItemIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const startJob = useCallback(
    async (
      labels: string[],
      starter: () => Promise<NpxSkillsJobStartDto>,
      runConfig: NpxSkillsRunConfig,
    ) => {
      if (!currentWorkspaceId || labels.length === 0 || jobRunning) {
        return;
      }
      streamWarnedRef.current = false;
      setStreamDisconnected(false);
      setJobId(null);
      setJobOperation(null);
      setJobRunning(true);
      setJobCompleted(0);
      setJobTotal(labels.length);
      setJobPercent(0);
      setJobSuccessCount(0);
      setJobFailureCount(0);
      setExpandedJobItemIds(new Set());
      setJobRunConfig(runConfig);
      setJobResultStatus("running");
      setJobStatusMessage(null);
      initializeJobItems(labels);
      closeEventStream();

      try {
        const started = await starter();
        setJobId(started.job_id);
        setJobOperation(started.operation);
        setJobTotal(started.total);

        const streamUrl = `/api/platforms/${encodeURIComponent(
          currentWorkspaceId,
        )}/npx-skills/jobs/${encodeURIComponent(started.job_id)}/stream`;
        const source = new EventSource(streamUrl);
        eventSourceRef.current = source;

        source.addEventListener("item_started", (event) => {
          const payload = safeParseEvent<NpxSkillsItemStartedPayload>(event);
          if (!payload) {
            return;
          }
          setJobItems((previous) =>
            previous.map((item) =>
              item.id === payload.item_id ? { ...item, status: "running" } : item,
            ),
          );
        });

        source.addEventListener("item_finished", (event) => {
          const payload = safeParseEvent<NpxSkillsItemFinishedPayload>(event);
          if (!payload) {
            return;
          }
          setJobItems((previous) =>
            previous.map((item) =>
              item.id === payload.item_id
                ? {
                    ...item,
                    status: payload.success ? "success" : "error",
                    output: payload.output,
                    error: payload.error,
                    durationMs: payload.duration_ms,
                  }
                : item,
            ),
          );
        });

        source.addEventListener("job_progress", (event) => {
          const payload = safeParseEvent<NpxSkillsJobProgressPayload>(event);
          if (!payload) {
            return;
          }
          setJobCompleted(payload.completed);
          setJobTotal(payload.total);
          setJobSuccessCount(payload.success_count);
          setJobFailureCount(payload.failure_count);
          setJobPercent(payload.percent);
        });

        source.addEventListener("job_completed", (event) => {
          const payload = safeParseEvent<NpxSkillsJobCompletedPayload>(event);
          if (!payload) {
            return;
          }
          setJobRunning(false);
          setJobCompleted(payload.total);
          setJobTotal(payload.total);
          setJobSuccessCount(payload.success_count);
          setJobFailureCount(payload.failure_count);
          setJobPercent(100);
          closeEventStream();
          refreshAfterJob();
          const notification = buildNpxJobNotification(
            payload.operation,
            payload.success_count,
            payload.failure_count,
            t,
          );
          setJobResultStatus(payload.failure_count > 0 ? "warning" : "success");
          setJobStatusMessage(notification.message);
          showNotification(notification.message, notification.severity);
        });

        source.addEventListener("job_failed", (event) => {
          const payload = safeParseEvent<NpxSkillsJobFailedPayload>(event);
          if (!payload) {
            return;
          }
          setJobRunning(false);
          setJobResultStatus("error");
          setJobStatusMessage(
            t("npxSkills.jobFailedMessage", {
              operation: operationLabel(payload.operation, t),
              message: payload.message,
            }),
          );
          closeEventStream();
          const notification = buildNpxJobNotification(payload.operation, 0, 1, t);
          showNotification(notification.message, notification.severity);
        });

        source.onerror = () => {
          const interrupted = finalizeInterruptedJob(
            jobItemsRef.current,
            t("npxSkills.jobInterrupted", {
              operation: operationLabel(started.operation, t),
            }),
          );
          closeEventStream();
          setJobItems(interrupted.items);
          setJobRunning(false);
          setJobCompleted(interrupted.completed);
          setJobTotal(interrupted.total);
          setJobSuccessCount(interrupted.successCount);
          setJobFailureCount(interrupted.failureCount);
          setJobPercent(interrupted.percent);
          setStreamDisconnected(true);
          setJobResultStatus("interrupted");
          setJobStatusMessage(
            t("npxSkills.jobInterruptedMessage", {
              operation: operationLabel(started.operation, t),
            }),
          );
          if (!streamWarnedRef.current) {
            streamWarnedRef.current = true;
            showNotification(t("npxSkills.jobConnectionLost"), "warning");
          }
        };
      } catch (error) {
        setJobRunning(false);
        setJobResultStatus("error");
        setJobStatusMessage((error as Error).message);
        closeEventStream();
        showNotification((error as Error).message, "error");
      }
    },
    [
      closeEventStream,
      currentWorkspaceId,
      initializeJobItems,
      jobRunning,
      refreshAfterJob,
      showNotification,
      t,
    ],
  );

  const openInstallSelectedDialog = useCallback(() => {
    if (selectedInstallPayload.length === 0) {
      return;
    }
    setPendingRunAction({
      kind: "install",
      items: selectedInstallPayload,
      labels: buildGroupedInstallLabels(selectedCatalogItems),
      itemCount: selectedCatalogItems.length,
    });
  }, [selectedCatalogItems, selectedInstallPayload]);

  const openPackagePreviewForItem = useCallback(
    (item: NpxSkillsCatalogItemDto) => {
      void loadPackagePreview(
        item.package_ref,
        item.skill_flag ? [item.skill_flag] : null,
      );
    },
    [loadPackagePreview],
  );

  const previewPackage = useCallback(() => {
    if (!packagePreviewInput.trim()) {
      return;
    }
    void loadPackagePreview(packagePreviewInput.trim(), null);
  }, [loadPackagePreview, packagePreviewInput]);

  const installPreviewSelection = useCallback(() => {
    if (!packagePreview) {
      return;
    }
    setPendingRunAction({
      kind: "quick-install",
      packageRef: packagePreview.package_ref,
      skillFlagsInput:
        packagePreview.mode === "listed_skills"
          ? Array.from(selectedPreviewSkills).join("\n")
          : "",
    });
  }, [packagePreview, selectedPreviewSkills]);

  const openInstalledDetail = useCallback((item: NpxInstalledSkillInstanceDto) => {
    setSelectedInstalledItem(item);
  }, []);
  const closeInstalledDetail = useCallback(() => setSelectedInstalledItem(null), []);

  const copyInstalledSourceRef = useCallback(
    (value: string) => {
      navigator.clipboard.writeText(value).then(
        () => showNotification(t("npxSkills.copySuccess"), "success"),
        () => showNotification(t("npxSkills.copyFailed"), "error"),
      );
    },
    [showNotification, t],
  );

  const openRemoveDialog = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) {
      return;
    }
    setPendingRunAction({ kind: "remove", itemIds });
  }, []);

  const openRemoveSelected = useCallback(() => {
    openRemoveDialog(Array.from(selectedInstalledIds));
  }, [openRemoveDialog, selectedInstalledIds]);

  const openCheckDialog = useCallback(() => {
    setPendingRunAction({ kind: "check" });
  }, []);

  const openUpdateDialog = useCallback(() => {
    setPendingRunAction({ kind: "update" });
  }, []);

  const handleRunDialogConfirm = useCallback(
    async (payload: {
      config: NpxSkillsRunConfig;
      packageRef: string;
      skillFlagsInput: string;
    }) => {
      if (!currentWorkspaceId || !pendingRunAction) {
        return;
      }

      const runCliConfig: NpxSkillsCliConfig = {
        agents: payload.config.agents,
        cli_mode: payload.config.cliMode,
      };

      if (pendingRunAction.kind === "install") {
        await startJob(
          pendingRunAction.labels,
          () =>
            startNpxSkillsInstallJob(
              currentWorkspaceId,
              pendingRunAction.items,
              payload.config.installTarget,
              runCliConfig,
            ),
          payload.config,
        );
        setSelectedCatalogKeys(new Set());
      } else if (pendingRunAction.kind === "quick-install") {
        const item: NpxSkillsInstallItemInput = {
          package_ref: payload.packageRef,
          skill_flags: parseSkillFlags(payload.skillFlagsInput),
        };
        await startJob(
          [item.package_ref],
          () =>
            startNpxSkillsInstallJob(
              currentWorkspaceId,
              [item],
              payload.config.installTarget,
              runCliConfig,
            ),
          payload.config,
        );
      } else if (pendingRunAction.kind === "remove") {
        const itemIds = [...pendingRunAction.itemIds];
        await startJob(
          itemIds,
          () =>
            startNpxSkillsRemoveJob(
              currentWorkspaceId,
              itemIds,
              payload.config.installTarget,
              runCliConfig,
            ),
          payload.config,
        );
        setSelectedInstalledIds(new Set());
        setSelectedInstalledItem(null);
      } else if (pendingRunAction.kind === "check") {
        await startJob(
          [t("npxSkills.operationCheck")],
          () =>
            startNpxSkillsCheckJob(
              currentWorkspaceId,
              payload.config.installTarget,
              runCliConfig,
            ),
          payload.config,
        );
      } else if (pendingRunAction.kind === "update") {
        await startJob(
          [t("npxSkills.operationUpdate")],
          () =>
            startNpxSkillsUpdateJob(
              currentWorkspaceId,
              payload.config.installTarget,
              runCliConfig,
            ),
          payload.config,
        );
      }

      setPendingRunAction(null);
    },
    [currentWorkspaceId, pendingRunAction, startJob, t],
  );

  const pendingRunDialogContent = useMemo(() => {
    if (!pendingRunAction) {
      return null;
    }
    switch (pendingRunAction.kind) {
      case "install":
        return {
          title: t("npxSkills.runConfigInstallTitle"),
          description: t("npxSkills.runConfigInstallDescription"),
          confirmLabel: t("npxSkills.runConfigInstallConfirm"),
          confirmColor: "primary" as const,
          packageRef: undefined,
          skillFlagsInput: undefined,
        };
      case "quick-install":
        return {
          title: t("npxSkills.runConfigQuickInstallTitle"),
          description: t("npxSkills.runConfigQuickInstallDescription"),
          confirmLabel: t("npxSkills.runConfigQuickInstallConfirm"),
          confirmColor: "primary" as const,
          packageRef: pendingRunAction.packageRef,
          skillFlagsInput: pendingRunAction.skillFlagsInput,
        };
      case "remove":
        return {
          title: t("npxSkills.runConfigRemoveTitle"),
          description: t("npxSkills.runConfigRemoveDescription"),
          confirmLabel: t("npxSkills.runConfigRemoveConfirm"),
          confirmColor: "error" as const,
          packageRef: undefined,
          skillFlagsInput: undefined,
        };
      case "check":
        return {
          title: t("npxSkills.runConfigCheckTitle"),
          description: t("npxSkills.runConfigCheckDescription"),
          confirmLabel: t("npxSkills.runConfigCheckConfirm"),
          confirmColor: "info" as const,
          packageRef: undefined,
          skillFlagsInput: undefined,
        };
      case "update":
        return {
          title: t("npxSkills.runConfigUpdateTitle"),
          description: t("npxSkills.runConfigUpdateDescription"),
          confirmLabel: t("npxSkills.runConfigUpdateConfirm"),
          confirmColor: "warning" as const,
          packageRef: undefined,
          skillFlagsInput: undefined,
        };
    }
  }, [pendingRunAction, t]);

  const runConfigSummary = useMemo(
    () => (jobRunConfig ? buildNpxRunConfigSummary(jobRunConfig, t) : null),
    [jobRunConfig, t],
  );

  const installTargetModeLabel =
    installTarget.scope === "project"
      ? t("installed.installTargetProject")
      : t("installed.installTargetGlobal");
  const installTargetPath = resolvedTarget?.skills_path
    ?? (installTargetBlocked
      ? t("installed.installTargetUnavailable")
      : t("installed.installTargetLoading"));
  const runConfigPath = useMemo(() => {
    if (jobRunConfig?.installTarget.scope === "project") {
      return jobRunConfig.installTarget.project_path?.trim() || installTargetPath;
    }
    return installTargetPath;
  }, [jobRunConfig, installTargetPath]);

  const currentWorkspaceName = platform?.name ?? currentWorkspaceId ?? t("common.unknown");

  return (
    <AppShell
      variant="workbench"
      title={t("npxSkills.registryTitle")}
      pageHeading={t("npxSkills.registryTitle")}
      subtitle={t("npxSkills.registrySubtitle")}
      onBack={
        currentWorkspaceId
          ? () => navigateDeferred(`/platform/${currentWorkspaceId}`)
          : () => navigateDeferred("/")
      }
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          <Tooltip title={installTargetPath}>
            <Chip
              icon={<FolderOpenOutlinedIcon />}
              variant="outlined"
              color="info"
              clickable
              aria-label={t("common.installTarget")}
              onClick={openInstallTargetDialog}
              label={installTargetModeLabel}
              sx={{
                flexShrink: 0,
                maxWidth: { xs: 220, sm: 240 },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            {t("npxSkills.settings")}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        {installTargetBlocked ? (
          <Alert severity="error">{resolutionError}</Alert>
        ) : null}

        <ListSurface tone="workbench">
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", xl: "center" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" sx={{ color: "var(--mcs-workbench-muted)" }}>
                  {t("npxSkills.registryEyebrow")}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.45, letterSpacing: "-0.04em" }}>
                  {t("npxSkills.registryHeroTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, maxWidth: 860 }}>
                  {t("npxSkills.registryHeroSubtitle")}
                </Typography>
              </Box>
              {currentWorkspaceId ? (
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => navigateDeferred(`/platform/${currentWorkspaceId}`)}
                >
                  {t("npxSkills.openLocalLibrary")}
                </Button>
              ) : null}
            </Stack>

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <Autocomplete
                options={platforms}
                value={platform}
                getOptionLabel={(option: PlatformDisplay) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, nextValue) => {
                  if (!nextValue) {
                    return;
                  }
                  setSearchParams((current) => upsertWorkspaceParam(current, nextValue.id));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("npxSkills.workspaceAnchorLabel")}
                    placeholder={t("npxSkills.workspaceAnchorPlaceholder")}
                  />
                )}
                sx={{ minWidth: { xs: "100%", lg: 260 } }}
              />

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  variant="outlined"
                  label={t("npxSkills.contextInstallTarget", {
                    mode: installTargetModeLabel,
                  })}
                />
                <Chip
                  variant="outlined"
                  label={t("npxSkills.contextAgents", { count: agents.length })}
                />
                <Chip
                  variant="outlined"
                  label={
                    cliMode === "auto"
                      ? t("npxSkills.cliModeAuto")
                      : t("npxSkills.cliModeNpx")
                  }
                />
                {catalogSyncedAt ? (
                  <Chip
                    size="small"
                    color="info"
                    variant="outlined"
                    label={t("npxSkills.lastSyncedAt", {
                      value: new Date(catalogSyncedAt).toLocaleTimeString(),
                    })}
                  />
                ) : null}
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {t("npxSkills.workspaceAnchorSummary", { workspace: currentWorkspaceName })}
            </Typography>
          </Stack>
        </ListSurface>

        <NpxFindView
          t={t}
          isMobile={isMobile}
          catalogSearch={catalogSearch}
          setCatalogSearch={setCatalogSearch}
          installedOnly={installedOnly}
          setInstalledOnly={setInstalledOnly}
          fetchCatalog={() => void requestCatalog()}
          openInstallSelectedDialog={openInstallSelectedDialog}
          selectedInstallPayload={selectedInstallPayload}
          jobRunning={jobRunning}
          catalogGroups={catalogGroups}
          selectedCatalogCategoryId={selectedCatalogCategoryId}
          setSelectedCatalogCategoryId={setSelectedCatalogCategoryId}
          catalogError={catalogError}
          catalogLoading={catalogLoading}
          installTargetLoading={installTargetLoading}
          catalogItems={catalogItems}
          visibleCatalogItems={visibleCatalogItems}
          selectedCatalogKeys={selectedCatalogKeys}
          setSelectedCatalogKeys={setSelectedCatalogKeys}
          installTargetScope={installTarget.scope}
          showNotification={showNotification}
          packagePreviewInput={packagePreviewInput}
          setPackagePreviewInput={setPackagePreviewInput}
          packagePreviewLoading={packagePreviewLoading}
          packagePreviewError={packagePreviewError}
          packagePreview={packagePreview}
          selectedPreviewSkills={selectedPreviewSkills}
          setSelectedPreviewSkills={setSelectedPreviewSkills}
          previewPackage={previewPackage}
          installPreviewSelection={installPreviewSelection}
          openPackagePreviewForItem={openPackagePreviewForItem}
        />

        <Divider />

        <Box>
          <Typography variant="overline" sx={{ color: "var(--mcs-workbench-muted)" }}>
            {t("npxSkills.sectionInstalled")}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.45, letterSpacing: "-0.03em" }}>
            {t("npxSkills.installedSectionTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 860 }}>
            {t("npxSkills.installedSectionSubtitle")}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {installedSyncedAt
              ? t("npxSkills.inventorySnapshotHint", {
                  value: new Date(installedSyncedAt).toLocaleTimeString(),
                })
              : t("npxSkills.inventorySnapshotPending")}
          </Typography>
        </Box>

        <NpxInstalledView
          t={t}
          isMobile={isMobile}
          installedSearch={installedSearch}
          setInstalledSearch={setInstalledSearch}
          fetchInstalled={() => void requestInstalled()}
          jobRunning={jobRunning}
          installedItems={visibleInstalledItems}
          installedSummary={installedSummary}
          selectedInstalledIds={selectedInstalledIds}
          setSelectedInstalledIds={setSelectedInstalledIds}
          openRemoveSelected={openRemoveSelected}
          openRemoveDialog={openRemoveDialog}
          openInstalledDetail={openInstalledDetail}
          installedGroups={installedGroups}
          selectedInstalledCategoryId={selectedInstalledCategoryId}
          setSelectedInstalledCategoryId={setSelectedInstalledCategoryId}
          installedError={installedError}
          installedErrorHint={installedErrorHint}
          installedLoading={installedLoading}
          installTargetLoading={installTargetLoading}
          filteredInstalledTotal={installedFilteredTotal}
          installedPage={installedPage}
          setInstalledPage={setInstalledPage}
          installedTotalPages={installedTotalPages}
          sourceFilter={installedSourceFilter}
          setSourceFilter={setInstalledSourceFilter}
          trackingFilter={installedTrackingFilter}
          setTrackingFilter={setInstalledTrackingFilter}
          updateFilter={installedUpdateFilter}
          setUpdateFilter={setInstalledUpdateFilter}
          capabilities={installedCapabilities}
        />

        <Divider />

        <Box>
          <Typography variant="overline" sx={{ color: "var(--mcs-workbench-muted)" }}>
            {t("npxSkills.sectionMaintenance")}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.45, letterSpacing: "-0.03em" }}>
            {t("npxSkills.maintenanceSectionTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 860 }}>
            {t("npxSkills.maintenanceSectionSubtitle")}
          </Typography>
        </Box>

        <NpxMaintenanceView
          t={t}
          jobRunning={jobRunning}
          openCheckDialog={openCheckDialog}
          openUpdateDialog={openUpdateDialog}
          capabilities={installedCapabilities}
          jobOperation={jobOperation}
          jobStatusMessage={jobStatusMessage}
          jobResultStatus={jobResultStatus}
          jobItems={jobItems}
          jobCompleted={jobCompleted}
          jobTotal={jobTotal}
          jobSuccessCount={jobSuccessCount}
          jobFailureCount={jobFailureCount}
          jobPercent={jobPercent}
          jobId={jobId}
          streamDisconnected={streamDisconnected}
          expandedJobItemIds={expandedJobItemIds}
          toggleJobItemExpanded={toggleJobItemExpanded}
          runConfigSummary={runConfigSummary}
          runConfigPath={runConfigPath}
        />

        <NpxInstalledSkillDrawer
          t={t}
          item={selectedInstalledItem}
          open={Boolean(selectedInstalledItem)}
          onClose={closeInstalledDetail}
          onRemove={(itemId) => {
            closeInstalledDetail();
            openRemoveDialog([itemId]);
          }}
          onCopySource={copyInstalledSourceRef}
        />
      </Stack>

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={async (nextTarget) => {
          const applied = await applyInstallTarget(nextTarget);
          if (applied) {
            closeInstallTargetDialog();
          }
          return applied;
        }}
      />

      {pendingRunDialogContent ? (
        <NpxRunConfigDialog
          open={Boolean(pendingRunAction)}
          loading={jobRunning}
          title={pendingRunDialogContent.title}
          description={pendingRunDialogContent.description}
          confirmLabel={pendingRunDialogContent.confirmLabel}
          confirmColor={pendingRunDialogContent.confirmColor}
          agentOptions={COMMON_AGENTS}
          defaultConfig={defaultRunConfig}
          recentProjects={recentProjects}
          packageRef={pendingRunDialogContent.packageRef}
          skillFlagsInput={pendingRunDialogContent.skillFlagsInput}
          onClose={() => setPendingRunAction(null)}
          onConfirm={handleRunDialogConfirm}
        />
      ) : null}

      <Card
        variant="outlined"
        sx={{
          display: settingsOpen ? "block" : "none",
          position: "fixed",
          right: 24,
          bottom: 24,
          width: { xs: "calc(100vw - 32px)", sm: 420 },
          maxHeight: "70vh",
          overflow: "auto",
          zIndex: 1200,
          boxShadow: "var(--mcs-shadow-lg)",
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {t("npxSkills.settings")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("npxSkills.settingsDefaultsNote")}
              </Typography>
            </Box>

            <Autocomplete
              multiple
              freeSolo
              options={COMMON_AGENTS}
              value={agents}
              onChange={(_, next) => updateAgents(next)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option}
                      size="small"
                      color="primary"
                      variant="outlined"
                      {...rest}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("npxSkills.targetAgents")}
                  placeholder={t("npxSkills.targetAgents")}
                  helperText={t("npxSkills.targetAgentsHelp")}
                />
              )}
            />

            <Autocomplete
              disableClearable
              options={[
                { value: "auto" as const, label: t("npxSkills.cliModeAuto") },
                { value: "npx" as const, label: t("npxSkills.cliModeNpx") },
              ]}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              value={
                cliMode === "auto"
                  ? { value: "auto" as const, label: t("npxSkills.cliModeAuto") }
                  : { value: "npx" as const, label: t("npxSkills.cliModeNpx") }
              }
              onChange={(_, nextValue) => updateCliMode(nextValue.value)}
              renderInput={(params) => (
                <TextField {...params} label={t("npxSkills.summaryCliMode")} />
              )}
            />

            <Typography variant="caption" color="text.secondary">
              {cliMode === "auto"
                ? t("npxSkills.cliModeAutoHelp")
                : t("npxSkills.cliModeNpxHelp")}
            </Typography>

            <Button variant="contained" onClick={() => setSettingsOpen(false)}>
              {t("common.close")}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <NotificationSnackbar />
    </AppShell>
  );
}
