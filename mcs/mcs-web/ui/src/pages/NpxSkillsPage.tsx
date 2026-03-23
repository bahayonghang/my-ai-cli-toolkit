import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  FormControlLabel,
  Grid,
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
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";

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
  MobileFilterButton,
  PlatformShellIdentity,
} from "@/components/shell/AppShell";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { NpxRunConfigDialog } from "@/components/dialogs/NpxRunConfigDialog";
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
import { useDebounce } from "@/hooks/useDebounce";
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
} from "./npx-skills/types";
import {
  COMMON_AGENTS,
  LS_KEY_AGENTS,
  LS_KEY_CLI_MODE,
} from "./npx-skills/types";
import {
  loadAgents,
  loadCliMode,
  safeParseEvent,
  operationLabel,
  buildInstallKey,
  parseSkillFlags,
  buildTaxonomyGroups,
} from "./npx-skills/utils";
import NpxFindView from "./npx-skills/NpxFindView";
import NpxInstalledView from "./npx-skills/NpxInstalledView";
import NpxInstalledSkillDrawer from "./npx-skills/NpxInstalledSkillDrawer";
import NpxMaintenanceView from "./npx-skills/NpxMaintenanceView";
import NpxSummaryCard from "./npx-skills/NpxSummaryCard";
import NpxSkillsFilters from "./npx-skills/NpxSkillsFilters";
import { PlatformBadge } from "@/components/platform/PlatformVisuals";

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
    recentProjects,
    openDialog: openInstallTargetDialog,
    closeDialog: closeInstallTargetDialog,
    applyTarget: applyInstallTarget,
  } = useInstallTarget(platformId);

  const [view, setView] = useState<ViewMode>("installed");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingRunAction, setPendingRunAction] =
    useState<PendingRunAction | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [installedSearch, setInstalledSearch] = useState("");
  const debouncedCatalogSearch = useDebounce(catalogSearch, 250);
  const debouncedInstalledSearch = useDebounce(installedSearch, 250);
  const [installedOnly, setInstalledOnly] = useState(false);
  const [selectedCatalogCategoryId, setSelectedCatalogCategoryId] = useState<
    string | null
  >(null);
  const [selectedInstalledCategoryId, setSelectedInstalledCategoryId] =
    useState<string | null>(null);

  const [catalogItems, setCatalogItems] = useState<NpxSkillsCatalogItemDto[]>(
    [],
  );
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [installedItems, setInstalledItems] = useState<NpxInstalledSkillInstanceDto[]>(
    [],
  );
  const [installedCapabilities, setInstalledCapabilities] =
    useState<NpxSkillsCapabilitiesDto | null>(null);
  const [installedSummary, setInstalledSummary] =
    useState<NpxSkillsInstalledSummaryDto | null>(null);
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
  const jobItemsRef = useRef<JobItemState[]>([]);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    return () => {
      catalogAbortRef.current?.abort();
      installedAbortRef.current?.abort();
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
    localStorage.setItem(LS_KEY_AGENTS, JSON.stringify(next));
  }, []);

  const updateCliMode = useCallback((next: NpxSkillsCliMode) => {
    setCliMode(next);
    localStorage.setItem(LS_KEY_CLI_MODE, next);
  }, []);

  const fetchCatalog = useCallback(async () => {
    if (!platformId) {
      return;
    }
    catalogAbortRef.current?.abort();
    const controller = new AbortController();
    catalogAbortRef.current = controller;
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data = await getNpxSkillsCatalog(
        platformId,
        {
          search: debouncedCatalogSearch || undefined,
          installedOnly,
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
      if (!controller.signal.aborted) {
        setCatalogLoading(false);
      }
    }
  }, [platformId, debouncedCatalogSearch, installedOnly, installTarget]);

  const fetchInstalled = useCallback(async () => {
    if (!platformId) {
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
        platformId,
        {
          search: debouncedInstalledSearch || undefined,
          installTarget,
        },
        controller.signal,
      );
      setInstalledItems(data.items);
      setInstalledCapabilities(data.capabilities);
      setInstalledSummary(data.summary);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      const typedError = error as Error & {
        details?: { remediation?: string; reason?: string };
      };
      setInstalledItems([]);
      setInstalledCapabilities(null);
      setInstalledSummary(null);
      setInstalledError(typedError.message);
      setInstalledErrorHint(
        typedError.details?.remediation ?? typedError.details?.reason ?? null,
      );
    } finally {
      if (!controller.signal.aborted) {
        setInstalledLoading(false);
      }
    }
  }, [platformId, debouncedInstalledSearch, installTarget]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    void fetchInstalled();
  }, [fetchInstalled]);

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
  }, [installedSearch, installTarget.scope, installTarget.project_path]);

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
  const installedGroups = useMemo(
    () => buildTaxonomyGroups(installedItems),
    [installedItems],
  );

  const visibleCatalogItems = useMemo(
    () =>
      selectedCatalogCategoryId
        ? catalogItems.filter(
            (item) => item.category_id === selectedCatalogCategoryId,
          )
        : catalogItems,
    [catalogItems, selectedCatalogCategoryId],
  );

  const visibleInstalledItems = useMemo(
    () =>
      installedItems.filter((item) => {
        if (
          selectedInstalledCategoryId &&
          item.category_id !== selectedInstalledCategoryId
        ) {
          return false;
        }
        if (
          installedSourceFilter === "curated" &&
          item.source.kind !== "curated"
        ) {
          return false;
        }
        if (
          installedSourceFilter === "manual" &&
          item.source.kind === "curated"
        ) {
          return false;
        }
        if (
          installedTrackingFilter !== "all" &&
          item.tracking.kind !== installedTrackingFilter
        ) {
          return false;
        }
        if (
          installedUpdateFilter !== "all" &&
          item.update.kind !== installedUpdateFilter
        ) {
          return false;
        }
        return true;
      }),
    [
      installedItems,
      selectedInstalledCategoryId,
      installedSourceFilter,
      installedTrackingFilter,
      installedUpdateFilter,
    ],
  );

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
    void fetchCatalog();
    void fetchInstalled();
  }, [fetchCatalog, fetchInstalled]);

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
    if (selectedInstallPayload.length === 0) {
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
    if (itemIds.length === 0) {
      return;
    }
    setPendingRunAction({ kind: "remove", itemIds });
  };

  const openRemoveSelected = () => {
    openRemoveDialog(
      installedItems
        .filter(
          (item) => selectedInstalledIds.has(item.id) && item.actions.removable,
        )
        .map((item) => item.id),
    );
  };

  const openCheckDialog = () => setPendingRunAction({ kind: "check" });
  const openUpdateDialog = () => setPendingRunAction({ kind: "update" });

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
  const installTargetPath =
    resolvedTarget?.skills_path ?? t("installed.installTargetLoading");
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
        <Box
          sx={[
            workbenchPanelSx,
            {
              mb: 3,
              px: { xs: 2.25, md: 3 },
              py: { xs: 2, md: 2.5 },
              background:
                "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-panel-fill-strong) 42%, var(--mcs-panel-fill) 100%)",
              borderColor: "var(--mcs-workbench-outline-strong)",
            },
          ]}
        >
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack
                spacing={1.1}
                sx={{ height: "100%", justifyContent: "center" }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "var(--mcs-workbench-accent-strong)" }}
                >
                  {t("npxSkills.workspaceLabel")}
                </Typography>
                <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
                  <PlatformBadge
                    platformId={platform?.id ?? platformId}
                    name={platform?.name ?? platformId ?? t("common.unknown")}
                    fallbackIcon={platform?.icon}
                    size={58}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      letterSpacing: "-0.05em",
                      fontSize: { xs: "2rem", md: "2.75rem" },
                      lineHeight: 1.04,
                    }}
                  >
                    {t("npxSkills.pageTitle", {
                      platform: platform?.name ?? platformId ?? t("common.unknown"),
                    })}
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: 760, lineHeight: 1.75 }}
                >
                  {t("npxSkills.settingsDefaultsNote")}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack
                spacing={1.25}
                sx={{ height: "100%", justifyContent: "space-between" }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    p: 1.6,
                    border: "1px solid var(--mcs-workbench-outline)",
                    background:
                      "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-summary-tile-fill) 100%)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "var(--mcs-workbench-muted)",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {t("common.installTarget")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.35 }}
                  >
                    {installTargetModeLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {installTargetPath}
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row", lg: "column" }}
                  spacing={1.1}
                >
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setSettingsOpen(true)}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {t("npxSkills.settings")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FolderOpenOutlinedIcon />}
                    onClick={openInstallTargetDialog}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {t("common.installTarget")}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.3fr) minmax(320px, 0.9fr)",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 3.5,
              border: "1px solid var(--mcs-workbench-outline)",
              background:
                "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-summary-tile-fill-strong) 22%, var(--mcs-panel-fill) 100%)",
              boxShadow: "var(--mcs-summary-tile-shadow)",
              px: { xs: 1.75, md: 2.25 },
              py: { xs: 1.5, md: 1.75 },
            }}
          >
            <Stack spacing={0.9}>
              <Typography
                variant="overline"
                sx={{ color: "var(--mcs-workbench-accent-strong)" }}
              >
                {view === "find"
                  ? t("npxSkills.viewFind")
                  : view === "installed"
                    ? t("npxSkills.viewInstalled")
                    : t("npxSkills.viewMaintenance")}
              </Typography>
              <Typography variant="h6" sx={{ letterSpacing: "-0.03em" }}>
                {t("common.selectedCount", {
                  count:
                    view === "find"
                      ? selectedCatalogItems.length
                      : view === "installed"
                      ? selectedInstalledIds.size
                        : jobTotal,
                })}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--mcs-workbench-muted)", lineHeight: 1.7 }}
              >
                {resolvedTarget?.skills_path ??
                  t("installed.installTargetLoading")}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 3.5,
              border: "1px solid var(--mcs-workbench-outline)",
              background:
                "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-workbench-surface-strong) 24%, var(--mcs-panel-fill) 100%)",
              boxShadow: "var(--mcs-summary-tile-shadow)",
              px: { xs: 1.75, md: 2 },
              py: { xs: 1.5, md: 1.75 },
            }}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                label={
                  installTarget.scope === "project"
                    ? t("installed.installTargetProject")
                    : t("installed.installTargetGlobal")
                }
                color="info"
                variant="outlined"
              />
              <Chip
                label={`${agents.length} agents`}
                color="warning"
                variant="outlined"
              />
              <Chip
                label={cliMode.toUpperCase()}
                color="default"
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryInstalled")}
              value={installedSummary?.total ?? installedItems.length}
              icon={<Inventory2OutlinedIcon color="success" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryCurated")}
              value={installedSummary?.curated ?? 0}
              icon={<TipsAndUpdatesOutlinedIcon color="info" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryManual")}
              value={installedSummary?.manual ?? 0}
              icon={<BuildCircleOutlinedIcon color="warning" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryUpdates")}
              value={installedSummary?.update_available ?? 0}
              icon={<SettingsIcon color="action" />}
            />
          </Grid>
        </Grid>

        <Card
          elevation={0}
          sx={[
            workbenchPanelSx,
            {
              mb: 3,
              background:
                "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-summary-tile-fill-strong) 20%, var(--mcs-panel-fill) 100%)",
              borderColor: "var(--mcs-workbench-outline)",
              boxShadow: "var(--mcs-summary-tile-shadow)",
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
            position: "relative",
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid var(--mcs-workbench-outline)",
            background:
              "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-summary-tile-fill-strong) 20%, var(--mcs-panel-fill) 100%)",
            boxShadow: "var(--mcs-panel-shadow)",
            p: { xs: 1.25, md: 1.5 },
            isolation: "isolate",
            "&::before": {
              content: '""',
              position: "absolute",
              insetInline: 20,
              top: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, var(--mcs-panel-accent-soft) 22%, var(--mcs-panel-accent) 50%, var(--mcs-panel-accent-soft) 78%, transparent 100%)",
              opacity: 0.88,
              pointerEvents: "none",
            },
            "& > *": {
              position: "relative",
              zIndex: 1,
            },
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
              visibleInstalledItems={visibleInstalledItems}
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
