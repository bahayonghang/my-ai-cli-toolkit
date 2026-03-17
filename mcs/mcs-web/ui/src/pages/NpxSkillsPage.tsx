import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import HomeIcon from "@mui/icons-material/Home";
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
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { NpxRunConfigDialog } from "@/components/dialogs/NpxRunConfigDialog";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useI18n } from "@/i18n";
import type {
  NpxInstalledSkillDto,
  NpxSkillsCatalogItemDto,
  NpxSkillsCliConfig,
  NpxSkillsCliMode,
  NpxSkillsInstallItemInput,
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
import { buildNpxJobNotification, buildNpxRunConfigSummary } from "./npxSkillsFeedback";

import type { ViewMode, JobItemState, PendingRunAction, RunResultStatus } from "./npx-skills/types";
import { COMMON_AGENTS, LS_KEY_AGENTS, LS_KEY_CLI_MODE } from "./npx-skills/types";
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
import NpxMaintenanceView from "./npx-skills/NpxMaintenanceView";
import NpxSummaryCard from "./npx-skills/NpxSummaryCard";
import NpxSkillsFilters from "./npx-skills/NpxSkillsFilters";

export default function NpxSkillsPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigateDeferred = useNavigateDeferred();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const platform = usePlatformStore((state) =>
    state.platforms.find((item) => item.id === platformId)
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

  const [view, setView] = useState<ViewMode>("find");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingRunAction, setPendingRunAction] = useState<PendingRunAction | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [installedSearch, setInstalledSearch] = useState("");
  const debouncedCatalogSearch = useDebounce(catalogSearch, 250);
  const debouncedInstalledSearch = useDebounce(installedSearch, 250);
  const [installedOnly, setInstalledOnly] = useState(false);
  const [selectedCatalogCategoryId, setSelectedCatalogCategoryId] = useState<string | null>(null);
  const [selectedInstalledCategoryId, setSelectedInstalledCategoryId] = useState<string | null>(
    null
  );

  const [catalogItems, setCatalogItems] = useState<NpxSkillsCatalogItemDto[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [installedItems, setInstalledItems] = useState<NpxInstalledSkillDto[]>([]);
  const [installedLoading, setInstalledLoading] = useState(false);
  const [installedError, setInstalledError] = useState<string | null>(null);

  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<Set<string>>(new Set());
  const [selectedInstalledNames, setSelectedInstalledNames] = useState<Set<string>>(new Set());

  const [agents, setAgents] = useState<string[]>(loadAgents);
  const [cliMode, setCliMode] = useState<NpxSkillsCliMode>(loadCliMode);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobOperation, setJobOperation] = useState<NpxSkillsOperation | null>(null);
  const [jobRunning, setJobRunning] = useState(false);
  const [jobCompleted, setJobCompleted] = useState(0);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobPercent, setJobPercent] = useState(0);
  const [jobSuccessCount, setJobSuccessCount] = useState(0);
  const [jobFailureCount, setJobFailureCount] = useState(0);
  const [streamDisconnected, setStreamDisconnected] = useState(false);
  const [jobItems, setJobItems] = useState<JobItemState[]>([]);
  const [expandedJobItemIds, setExpandedJobItemIds] = useState<Set<string>>(new Set());
  const [jobRunConfig, setJobRunConfig] = useState<NpxSkillsRunConfig | null>(null);
  const [jobResultStatus, setJobResultStatus] = useState<RunResultStatus>("idle");
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
    [agents, cliMode, installTarget]
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
        controller.signal
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
    try {
      const data = await getNpxInstalledSkills(
        platformId,
        {
          search: debouncedInstalledSearch || undefined,
          installTarget,
        },
        controller.signal
      );
      setInstalledItems(data);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      setInstalledError((error as Error).message);
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
  }, [catalogSearch, installedOnly, installTarget.scope, installTarget.project_path]);

  useEffect(() => {
    setSelectedInstalledNames(new Set());
  }, [installedSearch, installTarget.scope, installTarget.project_path]);

  useEffect(() => {
    setSelectedCatalogCategoryId(null);
  }, [catalogSearch, installedOnly, installTarget.scope, installTarget.project_path]);

  useEffect(() => {
    setSelectedInstalledCategoryId(null);
  }, [installedSearch, installTarget.scope, installTarget.project_path]);

  const catalogGroups = useMemo(() => buildTaxonomyGroups(catalogItems), [catalogItems]);
  const installedGroups = useMemo(() => buildTaxonomyGroups(installedItems), [installedItems]);

  const visibleCatalogItems = useMemo(
    () =>
      selectedCatalogCategoryId
        ? catalogItems.filter((item) => item.category_id === selectedCatalogCategoryId)
        : catalogItems,
    [catalogItems, selectedCatalogCategoryId]
  );

  const visibleInstalledItems = useMemo(
    () =>
      selectedInstalledCategoryId
        ? installedItems.filter((item) => item.category_id === selectedInstalledCategoryId)
        : installedItems,
    [installedItems, selectedInstalledCategoryId]
  );

  const selectedCatalogItems = useMemo(
    () =>
      visibleCatalogItems.filter((item) => selectedCatalogKeys.has(buildInstallKey(item))),
    [visibleCatalogItems, selectedCatalogKeys]
  );

  const selectedInstallPayload = useMemo<NpxSkillsInstallItemInput[]>(
    () =>
      selectedCatalogItems.map((item) => ({
        package_ref: item.package_ref,
        skill_flags: item.skill_flag ? [item.skill_flag] : [],
        catalog_entry_id: item.id,
      })),
    [selectedCatalogItems]
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
      }))
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
      runConfig: NpxSkillsRunConfig
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
          platformId
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
              item.id === payload.item_id ? { ...item, status: "running" } : item
            )
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
                : item
            )
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
            t
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
            })
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
            })
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
            })
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
    ]
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

  const openRemoveDialog = (names: string[]) => {
    if (names.length === 0) {
      return;
    }
    setPendingRunAction({ kind: "remove", names });
  };

  const openRemoveSelected = () => {
    openRemoveDialog(
      installedItems
        .filter((item) => selectedInstalledNames.has(item.name) && item.manageable)
        .map((item) => item.name)
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
              runCliConfig
            ),
          payload.config
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
              runCliConfig
            ),
          payload.config
        );
      } else if (pendingRunAction.kind === "remove") {
        const names = [...pendingRunAction.names];
        await startJob(
          names,
          () =>
            startNpxSkillsRemoveJob(
              platformId,
              names,
              payload.config.installTarget,
              runCliConfig
            ),
          payload.config
        );
        setSelectedInstalledNames(new Set());
      } else if (pendingRunAction.kind === "check") {
        await startJob(
          [t("npxSkills.operationCheck")],
          () =>
            startNpxSkillsCheckJob(
              platformId,
              payload.config.installTarget,
              runCliConfig
            ),
          payload.config
        );
      } else if (pendingRunAction.kind === "update") {
        await startJob(
          [t("npxSkills.operationUpdate")],
          () =>
            startNpxSkillsUpdateJob(
              platformId,
              payload.config.installTarget,
              runCliConfig
            ),
          payload.config
        );
      }

      setPendingRunAction(null);
    },
    [pendingRunAction, platformId, startJob, t]
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
    [jobRunConfig, t]
  );
  const runConfigPath = useMemo(() => {
    if (!jobRunConfig) {
      return "";
    }
    if (jobRunConfig.installTarget.scope === "project") {
      return jobRunConfig.installTarget.project_path?.trim() ?? "";
    }
    if (installTarget.scope === "global") {
      return resolvedTarget?.skills_path ?? "";
    }
    return "";
  }, [installTarget.scope, jobRunConfig, resolvedTarget?.skills_path]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <AnimatedBackground />

      <AppBar position="fixed">
        <Toolbar>
            <IconButton
              color="inherit"
              aria-label={t("common.back")}
              onClick={() => navigateDeferred(`/platform/${platformId}`)}
              sx={{ mr: 0.5 }}
            >
            <ArrowBackIcon />
          </IconButton>
          <Tooltip title={t("common.home")}>
            <IconButton
              color="inherit"
              aria-label={t("common.home")}
              onClick={() => navigateDeferred("/")}
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              {t("npxSkills.pageTitle", {
                platform: `${platform?.icon ?? ""} ${platform?.name ?? platformId}`,
              })}
            </Typography>
            <Tooltip title={resolvedTarget?.skills_path ?? t("installed.installTargetLoading")}>
              <Chip
                icon={<FolderOpenOutlinedIcon />}
                variant="outlined"
                color="info"
                clickable
                aria-label={t("common.installTarget")}
                onClick={openInstallTargetDialog}
                label={t("installed.installTargetChip", {
                  mode:
                    installTarget.scope === "project"
                      ? t("installed.installTargetProject")
                      : t("installed.installTargetGlobal"),
                  path: resolvedTarget?.skills_path ?? t("installed.installTargetLoading"),
                })}
                sx={{
                  maxWidth: { xs: 220, sm: 360 },
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </Tooltip>
          </Box>
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
            sx={{ mr: 1, display: { xs: "none", sm: "inline-flex" } }}
          >
            {t("npxSkills.settings")}
          </Button>
          <LanguageToggle sx={{ mr: 1 }} />
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1,
          mt: 8,
          p: { xs: 2, md: 3 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryInstalled")}
              value={installedItems.length}
              icon={<Inventory2OutlinedIcon color="success" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryCatalog")}
              value={catalogItems.length}
              icon={<TipsAndUpdatesOutlinedIcon color="info" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryAgents")}
              value={agents.length}
              icon={<BuildCircleOutlinedIcon color="warning" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NpxSummaryCard
              label={t("npxSkills.summaryCliMode")}
              value={cliMode.toUpperCase()}
              icon={<SettingsIcon color="action" />}
            />
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ mb: 3, overflow: "hidden" }}>
          <Tabs
            value={view}
            onChange={(_, next) => setView(next)}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab label={t("npxSkills.viewFind")} value="find" />
            <Tab label={t("npxSkills.viewInstalled")} value="installed" />
            <Tab label={t("npxSkills.viewMaintenance")} value="maintenance" />
          </Tabs>
        </Card>

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
            selectedInstalledNames={selectedInstalledNames}
            setSelectedInstalledNames={setSelectedInstalledNames}
            openRemoveSelected={openRemoveSelected}
            openRemoveDialog={openRemoveDialog}
            installedGroups={installedGroups}
            selectedInstalledCategoryId={selectedInstalledCategoryId}
            setSelectedInstalledCategoryId={setSelectedInstalledCategoryId}
            installedError={installedError}
            installedLoading={installedLoading}
            installTargetLoading={installTargetLoading}
            visibleInstalledItems={visibleInstalledItems}
          />
        )}
        {view === "maintenance" && (
          <NpxMaintenanceView
            t={t}
            jobRunning={jobRunning}
            openCheckDialog={openCheckDialog}
            openUpdateDialog={openUpdateDialog}
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
              view === "find" ? selectedCatalogCategoryId : selectedInstalledCategoryId
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
                      onChange={(_, checked) => updateCliMode(checked ? "auto" : "npx")}
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
    </Box>
  );
}
