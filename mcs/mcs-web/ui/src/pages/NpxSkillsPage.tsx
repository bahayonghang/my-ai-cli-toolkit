import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  FormControlLabel,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SettingsIcon from "@mui/icons-material/Settings";

import {
  getNpxInstalledSkills,
  getNpxSkillsCatalog,
  startNpxSkillsCheckJob,
  startNpxSkillsInstallJob,
  startNpxSkillsRemoveJob,
  startNpxSkillsUpdateJob,
} from "@/api/client";
import { workbenchPanelSx } from "@/components/common/glassPanel";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import {
  AppShell,
  ListSurface,
  MobileFilterButton,
  PlatformShellIdentity,
} from "@/components/shell/AppShell";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { NpxRunConfigDialog } from "@/components/dialogs/NpxRunConfigDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
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
  NpxSkillsRunConfig,
} from "@/types";
import { useUiStore } from "@/stores/uiStore";
import { usePlatformStore } from "@/stores/platformStore";
import { finalizeInterruptedJob } from "@/utils/npxJobState";
import {
  buildNpxJobNotification,
  buildNpxRunConfigSummary,
} from "./npxSkillsFeedback";

import type {
  ViewMode,
  JobItemState,
  InstalledSourceFilter,
  InstalledTrackingFilter,
  InstalledUpdateFilter,
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
  loadAgents,
  loadCliMode,
  persistNpxSkillsPreference,
  safeParseEvent,
  operationLabel,
  buildInstallKey,
  parseSkillFlags,
  buildTaxonomyGroups,
  filterCatalogItems,
  shouldLoadCatalog,
} from "./npx-skills/utils";
import NpxFindView from "./npx-skills/NpxFindView";
import NpxInstalledView from "./npx-skills/NpxInstalledView";
import NpxInstalledSkillDrawer from "./npx-skills/NpxInstalledSkillDrawer";
import NpxMaintenanceView from "./npx-skills/NpxMaintenanceView";
import NpxSkillsFilters from "./npx-skills/NpxSkillsFilters";

export default function NpxSkillsPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigateDeferred = useNavigateDeferred();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const platform = usePlatformStore((state) =>
    state.platforms.find((item) => item.id === platformId),
  );
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
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
  } = useInstallTarget(platformId);
  const installTargetBlocked = Boolean(resolutionError);

  const [view, setView] = useState<ViewMode>("installed");
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const [catalogItems, setCatalogItems] = useState<NpxSkillsCatalogItemDto[]>(
    [],
  );
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogStale, setCatalogStale] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [installedItems, setInstalledItems] = useState<NpxInstalledSkillInstanceDto[]>(
    [],
  );
  const [installedCapabilities, setInstalledCapabilities] =
    useState<NpxSkillsCapabilitiesDto | null>(null);
  const [installedSummary, setInstalledSummary] =
    useState<NpxSkillsInstalledSummaryDto | null>(null);
  const [installedGroups, setInstalledGroups] = useState<TaxonomyGroupSummary[]>([]);
  const [installedFilteredTotal, setInstalledFilteredTotal] = useState(0);
  const [installedTotalPages, setInstalledTotalPages] = useState(1);
  const [installedLoading, setInstalledLoading] = useState(false);
  const [installedError, setInstalledError] = useState<string | null>(null);
  const [installedErrorHint, setInstalledErrorHint] = useState<string | null>(null);

  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<Set<string>>(
    new Set(),
  );
  const [selectedInstalledIds, setSelectedInstalledIds] = useState<
    Set<string>
  >(new Set());
  const [installedSourceFilter, setInstalledSourceFilter] =
    useState<InstalledSourceFilter>("all");
  const [installedTrackingFilter, setInstalledTrackingFilter] =
    useState<InstalledTrackingFilter>("all");
  const [installedUpdateFilter, setInstalledUpdateFilter] =
    useState<InstalledUpdateFilter>("all");
  const [selectedInstalledItem, setSelectedInstalledItem] =
    useState<NpxInstalledSkillInstanceDto | null>(null);
  const [installedPage, setInstalledPage] = useState(1);
  const [installedPageSize, setInstalledPageSize] = useState(
    isMobile ? 20 : 50,
  );
  const debouncedInstalledSearch = useDebounce(installedSearch, 300);

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
  const catalogRequestActiveRef = useRef(false);
  const installedRequestActiveRef = useRef(false);
  const jobItemsRef = useRef<JobItemState[]>([]);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    return () => {
      catalogAbortRef.current?.abort();
      catalogAbortRef.current = null;
      catalogRequestActiveRef.current = false;
      installedAbortRef.current?.abort();
      installedAbortRef.current = null;
      installedRequestActiveRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setFiltersOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setInstalledPageSize(isMobile ? 20 : 50);
  }, [isMobile]);

  useEffect(() => {
    jobItemsRef.current = jobItems;
  }, [jobItems]);

  const defaultRunConfig = useMemo<NpxSkillsRunConfig>(
    () => ({
      agents,
      cliMode,
      installTarget,
    }),
    [agents, cliMode, installTarget],
  );

  const updateAgents = useCallback((next: string[]) => {
    setAgents(next);
    persistNpxSkillsPreference(LS_KEY_AGENTS, JSON.stringify(next));
  }, []);

  const updateCliMode = useCallback((next: NpxSkillsCliMode) => {
    setCliMode(next);
    persistNpxSkillsPreference(LS_KEY_CLI_MODE, next);
  }, []);

  const installTargetKey = useMemo(
    () => `${platformId ?? ""}::${installTarget.scope}::${installTarget.project_path ?? ""}`,
    [platformId, installTarget.project_path, installTarget.scope],
  );

  const requestCatalog = useCallback(async () => {
    if (!platformId || !resolvedTarget || installTargetLoading) {
      return;
    }
    catalogAbortRef.current?.abort();
    const controller = new AbortController();
    catalogAbortRef.current = controller;
    catalogRequestActiveRef.current = true;
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data = await getNpxSkillsCatalog(
        platformId,
        {
          installTarget,
        },
        controller.signal,
      );
      setCatalogItems(data);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      setCatalogError((error as Error).message);
    } finally {
      if (catalogAbortRef.current === controller) {
        catalogAbortRef.current = null;
        catalogRequestActiveRef.current = false;
      }
      if (!controller.signal.aborted) {
        setCatalogLoading(false);
        setCatalogLoaded(true);
        setCatalogStale(false);
      }
    }
  }, [installTarget, installTargetLoading, platformId, resolvedTarget]);

  const requestInstalled = useCallback(async () => {
    if (!platformId || !resolvedTarget || installTargetLoading) {
      return;
    }
    installedAbortRef.current?.abort();
    const controller = new AbortController();
    installedAbortRef.current = controller;
    installedRequestActiveRef.current = true;
    setInstalledLoading(true);
    setInstalledError(null);
    setInstalledErrorHint(null);
    try {
      const data = await getNpxInstalledSkills(
        platformId,
        {
          search: debouncedInstalledSearch,
          categoryId: selectedInstalledCategoryId ?? undefined,
          sourceFilter: installedSourceFilter,
          trackingFilter: installedTrackingFilter,
          updateFilter: installedUpdateFilter,
          page: installedPage,
          pageSize: installedPageSize,
          installTarget,
        },
        controller.signal,
      );
      setInstalledItems(data.items);
      setInstalledCapabilities(data.capabilities);
      setInstalledSummary(data.summary);
      setInstalledGroups(
        data.groups.map((group) => ({
          id: group.id,
          label: group.label,
          order: group.order,
          categories: group.categories.map((category) => ({
            id: category.id,
            label: category.label,
            count: category.count,
            groupId: category.group_id,
            groupOrder: category.group_order,
            categoryOrder: category.category_order,
          })),
        })),
      );
      setInstalledFilteredTotal(data.filtered_total);
      setInstalledTotalPages(data.total_pages);
      setInstalledPage((previous) => (previous === data.page ? previous : data.page));
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      const typedError = error as Error & {
        details?: { remediation?: string; reason?: string };
      };
      setInstalledError(typedError.message);
      setInstalledErrorHint(
        typedError.details?.remediation ?? typedError.details?.reason ?? null,
      );
    } finally {
      if (installedAbortRef.current === controller) {
        installedAbortRef.current = null;
        installedRequestActiveRef.current = false;
      }
      if (!controller.signal.aborted) {
        setInstalledLoading(false);
      }
    }
  }, [
    debouncedInstalledSearch,
    installTarget,
    installTargetLoading,
    installedPage,
    installedPageSize,
    installedSourceFilter,
    installedTrackingFilter,
    installedUpdateFilter,
    platformId,
    resolvedTarget,
    selectedInstalledCategoryId,
  ]);

  const fetchCatalog = useCallback(() => {
    setCatalogStale(true);
    void requestCatalog();
  }, [requestCatalog]);

  const fetchInstalled = useCallback(() => {
    void requestInstalled();
  }, [requestInstalled]);

  useEffect(() => {
    catalogAbortRef.current?.abort();
    catalogAbortRef.current = null;
    catalogRequestActiveRef.current = false;
    installedAbortRef.current?.abort();
    installedAbortRef.current = null;
    installedRequestActiveRef.current = false;
    setCatalogItems([]);
    setCatalogLoading(false);
    setCatalogError(null);
    setCatalogLoaded(false);
    setCatalogStale(true);
    setInstalledItems([]);
    setInstalledCapabilities(null);
    setInstalledSummary(null);
    setInstalledGroups([]);
    setInstalledFilteredTotal(0);
    setInstalledTotalPages(1);
    setInstalledLoading(false);
    setInstalledError(null);
    setInstalledErrorHint(null);
    setInstalledPage(1);
  }, [installTargetKey]);

  useEffect(() => {
    if (!resolvedTarget || installTargetLoading || !shouldLoadCatalog(view, catalogLoaded, catalogStale)) {
      return;
    }
    void requestCatalog();
  }, [
    catalogLoaded,
    catalogStale,
    installTargetLoading,
    requestCatalog,
    resolvedTarget,
    view,
  ]);

  useEffect(() => {
    if (
      !resolvedTarget ||
      installTargetLoading ||
      (view !== "installed" && view !== "maintenance")
    ) {
      return;
    }
    void requestInstalled();
  }, [
    installTargetLoading,
    requestInstalled,
    resolvedTarget,
    view,
  ]);

  useEffect(() => {
    setSelectedCatalogKeys(new Set());
  }, [
    catalogSearch,
    installedOnly,
    installTarget.scope,
    installTarget.project_path,
  ]);

  useEffect(() => {
    setSelectedInstalledIds(new Set());
    setSelectedInstalledItem(null);
  }, [
    installedSearch,
    installTarget.scope,
    installTarget.project_path,
    selectedInstalledCategoryId,
    installedSourceFilter,
    installedTrackingFilter,
    installedUpdateFilter,
  ]);

  useEffect(() => {
    setSelectedCatalogCategoryId(null);
  }, [
    catalogSearch,
    installedOnly,
    installTarget.scope,
    installTarget.project_path,
  ]);

  useEffect(() => {
    setSelectedInstalledCategoryId(null);
  }, [installedSearch, installTarget.scope, installTarget.project_path]);

  useEffect(() => {
    setInstalledSourceFilter("all");
    setInstalledTrackingFilter("all");
    setInstalledUpdateFilter("all");
  }, [installTarget.scope, installTarget.project_path]);

  const catalogGroups = useMemo(
    () => buildTaxonomyGroups(catalogItems),
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

  useEffect(() => {
    setInstalledPage(1);
  }, [
    installTargetKey,
    installedPageSize,
    installedSearch,
    installedSourceFilter,
    installedTrackingFilter,
    installedUpdateFilter,
    selectedInstalledCategoryId,
  ]);

  const selectedCatalogItems = useMemo(
    () =>
      visibleCatalogItems.filter((item) =>
        selectedCatalogKeys.has(buildInstallKey(item)),
      ),
    [visibleCatalogItems, selectedCatalogKeys],
  );

  const selectedInstallPayload = useMemo<NpxSkillsInstallItemInput[]>(
    () =>
      selectedCatalogItems.map((item) => ({
        package_ref: item.package_ref,
        skill_flags: item.skill_flag ? [item.skill_flag] : [],
        catalog_entry_id: item.id,
      })),
    [selectedCatalogItems],
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
    setCatalogStale(true);
    void requestInstalled();
    if (catalogLoaded) {
      void requestCatalog();
    }
  }, [catalogLoaded, requestCatalog, requestInstalled]);

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
      if (!platformId || labels.length === 0 || jobRunning) {
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
      setView("maintenance");

      try {
        const started = await starter();
        setJobId(started.job_id);
        setJobOperation(started.operation);
        setJobTotal(started.total);

        const streamUrl = `/api/platforms/${encodeURIComponent(
          platformId,
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
              item.id === payload.item_id
                ? { ...item, status: "running" }
                : item,
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
          const notification = buildNpxJobNotification(
            payload.operation,
            0,
            1,
            t,
          );
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
      initializeJobItems,
      jobRunning,
      platformId,
      refreshAfterJob,
      showNotification,
      t,
    ],
  );

  const openInstallSelectedDialog = () => {
    if (selectedInstallPayload.length === 0 || !resolvedTarget) {
      return;
    }
    setPendingRunAction({
      kind: "install",
      items: selectedInstallPayload,
      labels: selectedCatalogItems.map((item) => {
        let label = item.package_ref;
        if (item.skill_flag) {
          label += ` --skill ${item.skill_flag}`;
        }
        return label;
      }),
      itemCount: selectedCatalogItems.length,
    });
  };

  const openQuickInstallDialog = () => {
    if (!resolvedTarget) {
      return;
    }
    setPendingRunAction({
      kind: "quick-install",
      packageRef: "",
      skillFlagsInput: "",
    });
  };

  const openInstalledDetail = (item: NpxInstalledSkillInstanceDto) => {
    setSelectedInstalledItem(item);
  };

  const closeInstalledDetail = () => setSelectedInstalledItem(null);

  const copyInstalledSourceRef = useCallback(
    (value: string) => {
      navigator.clipboard.writeText(value).then(
        () => showNotification(t("npxSkills.copySuccess"), "success"),
        () => showNotification(t("npxSkills.copyFailed"), "error"),
      );
    },
    [showNotification, t],
  );

  const openRemoveDialog = (itemIds: string[]) => {
    if (itemIds.length === 0 || !resolvedTarget) {
      return;
    }
    setPendingRunAction({ kind: "remove", itemIds });
  };

  const openRemoveSelected = () => {
    openRemoveDialog(Array.from(selectedInstalledIds));
  };

  const openCheckDialog = () => {
    if (!resolvedTarget) {
      return;
    }
    setPendingRunAction({ kind: "check" });
  };
  const openUpdateDialog = () => {
    if (!resolvedTarget) {
      return;
    }
    setPendingRunAction({ kind: "update" });
  };

  const handleRunDialogConfirm = useCallback(
    async (payload: {
      config: NpxSkillsRunConfig;
      packageRef: string;
      skillFlagsInput: string;
    }) => {
      if (!platformId || !pendingRunAction) {
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
              platformId,
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
              platformId,
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
              platformId,
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
              platformId,
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
              platformId,
              payload.config.installTarget,
              runCliConfig,
            ),
          payload.config,
        );
      }

      setPendingRunAction(null);
    },
    [pendingRunAction, platformId, startJob, t],
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
      return (
        jobRunConfig.installTarget.project_path?.trim() || installTargetPath
      );
    }
    return installTargetPath;
  }, [jobRunConfig, installTargetPath]);
  return (
    <AppShell
      variant="workbench"
      title={
        <PlatformShellIdentity
          platformId={platform?.id ?? platformId}
          name={platform?.name ?? platformId ?? t("common.unknown")}
          fallbackIcon={platform?.icon}
          subtitle={t("npxSkills.workspaceLabel")}
        />
      }
      pageHeading={t("npxSkills.pageTitle", {
        platform: platform?.name ?? platformId ?? t("common.unknown"),
      })}
      subtitle={`${installTargetModeLabel} · ${installTargetPath}`}
      onBack={() => navigateDeferred(`/platform/${platformId}`)}
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          {isMobile ? (
            <MobileFilterButton onClick={() => setFiltersOpen(true)} />
          ) : null}
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
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            {t("npxSkills.settings")}
          </Button>
        </>
      }
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {installTargetBlocked ? (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {resolutionError}
          </Alert>
        ) : null}
        <ListSurface tone="workbench">
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ letterSpacing: "-0.04em" }}>
                  {t("npxSkills.pageTitle", {
                    platform: platform?.name ?? platformId ?? t("common.unknown"),
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {t("npxSkills.settingsDefaultsNote")}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {installTargetModeLabel} · {t("npxSkills.runConfigAgentsSummary", { count: agents.length })} ·{" "}
                {cliMode.toUpperCase()}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: "anywhere" }}
            >
              {installTargetPath}
            </Typography>
          </Stack>
        </ListSurface>

        <Card
          elevation={0}
          sx={[
            workbenchPanelSx,
            {
              mb: 3,
              background: "var(--mcs-panel-fill)",
              borderColor: "var(--mcs-workbench-outline)",
              boxShadow: "var(--mcs-shadow-sm)",
            },
          ]}
        >
          <Tabs
            value={view}
            onChange={(_, next) => setView(next)}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab label={t("npxSkills.viewInstalled")} value="installed" />
            <Tab label={t("npxSkills.viewFind")} value="find" />
            <Tab label={t("npxSkills.viewMaintenance")} value="maintenance" />
          </Tabs>
        </Card>

        <Box
          sx={{
            borderRadius: 4,
            border: "1px solid var(--mcs-workbench-outline)",
            background: "var(--mcs-panel-fill)",
            boxShadow: "var(--mcs-shadow-sm)",
            p: { xs: 1.25, md: 1.5 },
          }}
        >
          {view === "find" && (
            <NpxFindView
              t={t}
              isMobile={isMobile}
              catalogSearch={catalogSearch}
              setCatalogSearch={setCatalogSearch}
              installedOnly={installedOnly}
              setInstalledOnly={setInstalledOnly}
              setFiltersOpen={setFiltersOpen}
              fetchCatalog={() => void fetchCatalog()}
              openQuickInstallDialog={openQuickInstallDialog}
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
            />
          )}
          {view === "installed" && (
            <NpxInstalledView
              t={t}
              isMobile={isMobile}
              installedSearch={installedSearch}
              setInstalledSearch={setInstalledSearch}
              fetchInstalled={() => void fetchInstalled()}
              jobRunning={jobRunning}
              installedItems={installedItems}
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
          )}
          {view === "maintenance" && (
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
          )}
        </Box>
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
      </Box>

      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{ sx: { width: 300, p: 2 } }}
      >
        {view !== "maintenance" && (
          <NpxSkillsFilters
            groups={view === "find" ? catalogGroups : installedGroups}
            selectedCategoryId={
              view === "find"
                ? selectedCatalogCategoryId
                : selectedInstalledCategoryId
            }
            onCategoryChange={(categoryId) => {
              if (view === "find") {
                setSelectedCatalogCategoryId(categoryId);
              } else {
                setSelectedInstalledCategoryId(categoryId);
              }
              setFiltersOpen(false);
            }}
            t={t}
          />
        )}
      </Drawer>

      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            p: 3,
          },
        }}
      >
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

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t("npxSkills.summaryCliMode")}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cliMode === "auto"}
                      onChange={(_, checked) =>
                        updateCliMode(checked ? "auto" : "npx")
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {cliMode === "auto"
                          ? t("npxSkills.cliModeAuto")
                          : t("npxSkills.cliModeNpx")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cliMode === "auto"
                          ? t("npxSkills.cliModeAutoHelp")
                          : t("npxSkills.cliModeNpxHelp")}
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </CardContent>
          </Card>

          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            {t("common.close")}
          </Button>
        </Stack>
      </Drawer>

      {pendingRunAction && pendingRunDialogContent && (
        <NpxRunConfigDialog
          open
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
      )}

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={applyInstallTarget}
      />

      <NotificationSnackbar />
    </AppShell>
  );
}
