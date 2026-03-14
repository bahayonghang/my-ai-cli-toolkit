import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  LinearProgress,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import HomeIcon from "@mui/icons-material/Home";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TuneIcon from "@mui/icons-material/Tune";

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

type ViewMode = "find" | "installed" | "maintenance";

interface JobItemState {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  output: string;
  error: string | null;
  durationMs: number | null;
}

type PendingRunAction =
  | {
      kind: "install";
      items: NpxSkillsInstallItemInput[];
      labels: string[];
      itemCount: number;
    }
  | {
      kind: "quick-install";
      packageRef: string;
      skillFlagsInput: string;
    }
  | {
      kind: "remove";
      names: string[];
    }
  | {
      kind: "check";
    }
  | {
      kind: "update";
    };

type RunResultStatus = "idle" | "running" | "success" | "warning" | "error" | "interrupted";

interface TaxonomyCategorySummary {
  id: string;
  label: string;
  count: number;
  groupId: string;
  groupOrder: number;
  categoryOrder: number;
}

interface TaxonomyGroupSummary {
  id: string;
  label: string;
  order: number;
  categories: TaxonomyCategorySummary[];
}

const COMMON_AGENTS = [
  "claude-code",
  "codex",
  "cursor",
  "gemini",
  "copilot",
  "windsurf",
  "kiro",
  "opencode",
  "cline",
  "augment",
  "trae",
  "trae_cn",
  "antigravity",
];
const DEFAULT_AGENTS = ["claude-code", "codex"];
const DEFAULT_CLI_MODE: NpxSkillsCliMode = "auto";
const LS_KEY_AGENTS = "mcs-npx-skills-agents";
const LS_KEY_CLI_MODE = "mcs-npx-skills-cli-mode";

function loadAgents(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY_AGENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_AGENTS;
}

function loadCliMode(): NpxSkillsCliMode {
  const raw = localStorage.getItem(LS_KEY_CLI_MODE);
  return raw === "npx" ? "npx" : DEFAULT_CLI_MODE;
}

function safeParseEvent<T>(event: Event): T | null {
  const payload = event as MessageEvent<string>;
  if (!payload?.data) {
    return null;
  }
  try {
    return JSON.parse(payload.data) as T;
  } catch {
    return null;
  }
}

function operationLabel(operation: NpxSkillsOperation, t: ReturnType<typeof useI18n>["t"]) {
  switch (operation) {
    case "install":
      return t("npxSkills.operationInstall");
    case "remove":
      return t("npxSkills.operationRemove");
    case "check":
      return t("npxSkills.operationCheck");
    case "update":
      return t("npxSkills.operationUpdate");
  }
}

function installStatusColor(
  status: NpxSkillsCatalogItemDto["install_status"]
): "success" | "warning" | "default" {
  switch (status) {
    case "installed":
      return "success";
    case "outdated":
      return "warning";
    default:
      return "default";
  }
}

function buildInstallKey(item: NpxSkillsCatalogItemDto) {
  return `${item.package_ref}::${item.skill_flag ?? ""}`;
}

function parseSkillFlags(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildTaxonomyGroups<
  T extends {
    group_id: string;
    group_label: string;
    group_order: number;
    category_id: string;
    category_label: string;
    category_order: number;
  },
>(items: T[]): TaxonomyGroupSummary[] {
  const groups = new Map<string, TaxonomyGroupSummary>();

  for (const item of items) {
    const existingGroup = groups.get(item.group_id);
    if (!existingGroup) {
      groups.set(item.group_id, {
        id: item.group_id,
        label: item.group_label,
        order: item.group_order,
        categories: [
          {
            id: item.category_id,
            label: item.category_label,
            count: 1,
            groupId: item.group_id,
            groupOrder: item.group_order,
            categoryOrder: item.category_order,
          },
        ],
      });
      continue;
    }

    const existingCategory = existingGroup.categories.find(
      (category) => category.id === item.category_id
    );
    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      existingGroup.categories.push({
        id: item.category_id,
        label: item.category_label,
        count: 1,
        groupId: item.group_id,
        groupOrder: item.group_order,
        categoryOrder: item.category_order,
      });
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      categories: [...group.categories].sort(
        (left, right) =>
          left.categoryOrder - right.categoryOrder || left.label.localeCompare(right.label)
      ),
    }))
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
}

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

  const renderFindView = () => (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          placeholder={t("npxSkills.searchCatalogPlaceholder")}
          value={catalogSearch}
          onChange={(event) => setCatalogSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 360, maxWidth: "100%" }}
        />
        {isMobile && (
          <IconButton
            aria-label={t("common.openFilters")}
            onClick={() => setFiltersOpen(true)}
          >
            <TuneIcon />
          </IconButton>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={installedOnly}
              onChange={(_, checked) => setInstalledOnly(checked)}
            />
          }
          label={t("npxSkills.installedOnly")}
        />
        {isMobile && (
          <IconButton
            aria-label={t("common.openFilters")}
            onClick={() => setFiltersOpen(true)}
          >
            <TuneIcon />
          </IconButton>
        )}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void fetchCatalog()}
        >
          {t("npxSkills.refreshCatalog")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<TipsAndUpdatesOutlinedIcon />}
          onClick={openQuickInstallDialog}
        >
          {t("npxSkills.quickInstall")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<InstallDesktopIcon />}
          disabled={selectedInstallPayload.length === 0 || jobRunning}
          onClick={openInstallSelectedDialog}
        >
          {t("npxSkills.installSelected")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {!isMobile && (
          <Card
            variant="outlined"
            sx={{ width: 280, flexShrink: 0, position: "sticky", top: 96 }}
          >
            <CardContent sx={{ p: 2 }}>
              <NpxSkillsFilters
                groups={catalogGroups}
                selectedCategoryId={selectedCatalogCategoryId}
                onCategoryChange={setSelectedCatalogCategoryId}
                t={t}
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {catalogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {catalogError}
            </Alert>
          )}

          {(catalogLoading || installTargetLoading) && (
            <LinearProgress sx={{ mb: 2, borderRadius: 999 }} />
          )}

          {catalogLoading && catalogItems.length === 0 ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : visibleCatalogItems.length === 0 ? (
            <Alert severity="info">{t("npxSkills.noCatalogResults")}</Alert>
          ) : (
            <Grid container spacing={2}>
              {visibleCatalogItems.map((item) => {
            const key = buildInstallKey(item);
            const isSelected = selectedCatalogKeys.has(key);
            const isDisabled = item.project_only && installTarget.scope === "global";

            return (
              <Grid key={key} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    opacity: isDisabled ? 0.55 : 1,
                    borderColor: isSelected ? "primary.main" : "divider",
                    boxShadow: isSelected
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.16)}`
                      : "none",
                    transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <CardActionArea
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedCatalogKeys((previous) => {
                        const next = new Set(previous);
                        if (next.has(key)) {
                          next.delete(key);
                        } else {
                          next.add(key);
                        }
                        return next;
                      });
                    }}
                    aria-pressed={isSelected}
                    sx={{
                      height: "100%",
                      alignItems: "stretch",
                      "&:hover": isDisabled
                        ? undefined
                        : {
                            borderColor: "primary.main",
                            transform: "translateY(-2px)",
                          },
                    }}
                  >
                    <CardContent>
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      gap={1}
                      mb={1}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={700}>
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontFamily: '"Fira Code", monospace',
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.package_ref}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Tooltip title={t("npxSkills.copyInstallCommand")} arrow>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              const cmd = item.skill_flag
                                ? `npx skills add ${item.package_ref} --skill ${item.skill_flag}`
                                : `npx skills add ${item.package_ref}`;
                              navigator.clipboard.writeText(cmd).then(
                                () => showNotification(t("npxSkills.copySuccess"), "success"),
                                () => showNotification(t("npxSkills.copyFailed"), "error"),
                              );
                            }}
                            aria-label={t("npxSkills.copyInstallCommand")}
                            sx={{ mr: 0.5 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          inputProps={{
                            "aria-label": t("common.selectItem", { name: item.name }),
                          }}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => {
                            setSelectedCatalogKeys((previous) => {
                              const next = new Set(previous);
                              if (next.has(key)) {
                                next.delete(key);
                              } else {
                                next.add(key);
                              }
                              return next;
                            });
                          }}
                        />
                      </Box>
                    </Box>

                    <Box display="flex" gap={0.75} flexWrap="wrap" mb={1.5}>
                      <Chip
                        size="small"
                        color={installStatusColor(item.install_status)}
                        variant="outlined"
                        label={
                          item.install_status === "installed"
                            ? t("status.installed")
                            : item.install_status === "outdated"
                            ? t("status.outdated")
                            : t("status.notInstalled")
                        }
                      />
                      <Chip size="small" variant="outlined" label={item.category_label} />
                      <Chip size="small" variant="outlined" label={item.install_provider} />
                      {item.project_only && (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label={t("npxSkills.projectOnly")}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "4.2em",
                      }}
                    >
                      {item.description ?? t("npxSkills.noDescription")}
                    </Typography>

                    {item.usage && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 1.25, color: "info.main" }}
                      >
                        {item.usage}
                      </Typography>
                    )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );

  const renderInstalledView = () => (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          placeholder={t("npxSkills.searchInstalledPlaceholder")}
          value={installedSearch}
          onChange={(event) => setInstalledSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 360, maxWidth: "100%" }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void fetchInstalled()}
        >
          {t("npxSkills.refreshInstalled")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          disabled={
            jobRunning ||
            installedItems.filter(
              (item) => selectedInstalledNames.has(item.name) && item.manageable
            ).length === 0
          }
          onClick={openRemoveSelected}
        >
          {t("npxSkills.removeSelected")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {!isMobile && (
          <Card
            variant="outlined"
            sx={{ width: 280, flexShrink: 0, position: "sticky", top: 96 }}
          >
            <CardContent sx={{ p: 2 }}>
              <NpxSkillsFilters
                groups={installedGroups}
                selectedCategoryId={selectedInstalledCategoryId}
                onCategoryChange={setSelectedInstalledCategoryId}
                t={t}
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {installedError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {installedError}
            </Alert>
          )}

          {(installedLoading || installTargetLoading) && (
            <LinearProgress sx={{ mb: 2, borderRadius: 999 }} />
          )}

          {installedLoading && installedItems.length === 0 ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : visibleInstalledItems.length === 0 ? (
            <Alert severity="info">{t("npxSkills.noInstalledResults")}</Alert>
          ) : isMobile ? (
        <Stack spacing={1.5}>
          {visibleInstalledItems.map((item) => {
            const selected = selectedInstalledNames.has(item.name);
            return (
              <Card key={item.name} variant="outlined">
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Checkbox
                      checked={selected}
                      disabled={!item.manageable}
                      inputProps={{
                        "aria-label": t("common.selectItem", { name: item.name }),
                      }}
                      onChange={() =>
                        setSelectedInstalledNames((previous) => {
                          const next = new Set(previous);
                          if (next.has(item.name)) {
                            next.delete(item.name);
                          } else {
                            next.add(item.name);
                          }
                          return next;
                        })
                      }
                    />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight={700}>
                        {item.name}
                      </Typography>
                      <Box display="flex" gap={0.75} flexWrap="wrap" mt={0.75} mb={1}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            item.source === "managed"
                              ? t("npxSkills.sourceCatalog")
                              : t("npxSkills.sourceFilesystem")
                          }
                        />
                        {!item.manageable && (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={t("npxSkills.unmanaged")}
                          />
                        )}
                        <Chip size="small" variant="outlined" label={item.category_label} />
                        <Chip size="small" variant="outlined" label={item.install_provider} />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontFamily: '"Fira Code", monospace',
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item.package_ref}
                      </Typography>
                      {item.skill_flags.length > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.75,
                            color: "text.secondary",
                            fontFamily: '"Fira Code", monospace',
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.skill_flags.map((flag) => `--skill ${flag}`).join(" ")}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: "anywhere" }}>
                        {item.description ?? "—"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    color="error"
                    variant="outlined"
                  disabled={!item.manageable}
                  onClick={() => openRemoveDialog([item.name])}
                >
                  {t("common.uninstall")}
                </Button>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
          ) : (
        <Card elevation={0}>
          <Box sx={{ overflowX: "auto" }}>
            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& th, & td": {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  px: 2,
                  py: 1.5,
                  textAlign: "left",
                  verticalAlign: "top",
                },
                "& th": {
                  color: "text.secondary",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                },
              }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ width: 48 }} />
                  <Box component="th">{t("common.name")}</Box>
                  <Box component="th">{t("npxSkills.repo")}</Box>
                  <Box component="th">{t("common.category")}</Box>
                  <Box component="th">{t("common.description")}</Box>
                  <Box component="th">{t("common.actions")}</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {visibleInstalledItems.map((item) => {
                  const selected = selectedInstalledNames.has(item.name);
                  return (
                    <Box component="tr" key={item.name}>
                      <Box component="td">
                        <Checkbox
                          checked={selected}
                          disabled={!item.manageable}
                          inputProps={{
                            "aria-label": t("common.selectItem", { name: item.name }),
                          }}
                          onChange={() =>
                            setSelectedInstalledNames((previous) => {
                              const next = new Set(previous);
                              if (next.has(item.name)) {
                                next.delete(item.name);
                              } else {
                                next.add(item.name);
                              }
                              return next;
                            })
                          }
                        />
                      </Box>
                      <Box component="td">
                        <Typography variant="body2" fontWeight={700}>
                          {item.name}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.75 }}
                          label={
                            item.source === "managed"
                              ? t("npxSkills.sourceCatalog")
                              : t("npxSkills.sourceFilesystem")
                          }
                        />
                        {!item.manageable && (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 0.75, ml: 0.75 }}
                            label={t("npxSkills.unmanaged")}
                          />
                        )}
                      </Box>
                      <Box component="td">
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: '"Fira Code", monospace',
                            color: "text.secondary",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.package_ref}
                        </Typography>
                        {item.skill_flags.length > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.75,
                              color: "text.secondary",
                              fontFamily: '"Fira Code", monospace',
                            }}
                          >
                            {item.skill_flags.map((flag) => `--skill ${flag}`).join(" ")}
                          </Typography>
                        )}
                      </Box>
                      <Box component="td">{item.category_label}</Box>
                      <Box component="td">
                        <Typography variant="body2" color="text.secondary">
                          {item.description ?? "—"}
                        </Typography>
                      </Box>
                      <Box component="td">
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={!item.manageable}
                          onClick={() => openRemoveDialog([item.name])}
                        >
                          {t("common.uninstall")}
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Card>
          )}
        </Box>
      </Box>
    </>
  );

  const renderMaintenanceView = () => (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BuildCircleOutlinedIcon color="info" />
                  <Typography variant="h6">{t("npxSkills.checkUpdates")}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t("npxSkills.runCheckHelp")}
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<RefreshIcon />}
                  disabled={jobRunning}
                  onClick={openCheckDialog}
                >
                  {t("npxSkills.checkUpdates")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <SystemUpdateAltIcon color="warning" />
                  <Typography variant="h6">{t("npxSkills.updateAll")}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t("npxSkills.runUpdateHelp")}
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<SystemUpdateAltIcon />}
                  disabled={jobRunning}
                  onClick={openUpdateDialog}
                >
                  {t("npxSkills.updateAll")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
            >
              <Box>
                <Typography variant="h6">
                  {jobOperation ? operationLabel(jobOperation, t) : t("npxSkills.viewMaintenance")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {jobStatusMessage ?? t("npxSkills.jobEmpty")}
                </Typography>
              </Box>
              <Chip
                color={
                  jobResultStatus === "success"
                    ? "success"
                    : jobResultStatus === "warning"
                    ? "warning"
                    : jobResultStatus === "error" || jobResultStatus === "interrupted"
                    ? "error"
                    : jobResultStatus === "running"
                    ? "info"
                    : "default"
                }
                variant={jobResultStatus === "idle" ? "outlined" : "filled"}
                label={
                  jobResultStatus === "success"
                    ? t("npxSkills.runResultSuccess")
                    : jobResultStatus === "warning"
                    ? t("npxSkills.runResultWarning")
                    : jobResultStatus === "error"
                    ? t("npxSkills.runResultError")
                    : jobResultStatus === "interrupted"
                    ? t("npxSkills.runResultInterrupted")
                    : jobResultStatus === "running"
                    ? t("npxSkills.runResultRunning")
                    : t("npxSkills.viewMaintenance")
                }
              />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                variant="outlined"
                label={t("npxSkills.jobQueue", { count: jobItems.length })}
              />
              <Chip
                size="small"
                variant="outlined"
                label={t("npxSkills.jobCurrent", {
                  completed: jobCompleted,
                  total: jobTotal,
                })}
              />
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={t("npxSkills.jobSuccess", { count: jobSuccessCount })}
              />
              <Chip
                size="small"
                color="error"
                variant="outlined"
                label={t("npxSkills.jobFailed", { count: jobFailureCount })}
              />
            </Stack>

            {runConfigSummary && (
              <Card
                variant="outlined"
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}
              >
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Typography variant="overline" color="text.secondary">
                    {t("npxSkills.runConfigExecutedWith")}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    <Chip size="small" variant="outlined" label={runConfigSummary.agentsLabel} />
                    <Chip size="small" variant="outlined" label={runConfigSummary.cliModeLabel} />
                    <Chip size="small" variant="outlined" label={runConfigSummary.installTargetLabel} />
                    <Chip size="small" color="info" variant="outlined" label={t("npxSkills.runConfigTemporaryOverride")} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
                    {runConfigPath
                      ? t("npxSkills.runConfigCurrentPath", {
                          path: runConfigPath,
                        })
                      : t("npxSkills.runConfigUnknownPath")}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {(jobRunning || jobTotal > 0) && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, jobPercent))}
                sx={{ height: 8, borderRadius: 999 }}
              />
              {jobId && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                  Job: {jobId}
                </Typography>
              )}
              {streamDisconnected && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {t("npxSkills.jobConnectionLost")}
                </Alert>
              )}
            </Box>
          )}

          {jobItems.length === 0 ? (
            <Alert severity="info">{t("npxSkills.jobEmpty")}</Alert>
          ) : (
            <Stack spacing={1}>
              {jobItems.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{
                    bgcolor:
                      item.status === "running"
                        ? alpha(theme.palette.info.main, 0.06)
                        : item.status === "success"
                        ? alpha(theme.palette.success.main, 0.06)
                        : item.status === "error"
                        ? alpha(theme.palette.error.main, 0.06)
                        : "background.paper",
                  }}
                >
                  <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                      mb={1}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {item.label}
                      </Typography>
                      <Chip
                        size="small"
                        color={
                          item.status === "success"
                            ? "success"
                            : item.status === "error"
                            ? "error"
                            : item.status === "running"
                            ? "info"
                            : "default"
                        }
                        label={
                          item.status === "success"
                            ? t("npxSkills.itemStatusSuccess")
                            : item.status === "error"
                            ? t("npxSkills.itemStatusError")
                            : item.status === "running"
                            ? t("npxSkills.itemStatusRunning")
                            : t("npxSkills.itemStatusPending")
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.durationMs != null ? `${item.durationMs}ms` : ""}
                    </Typography>
                    {item.error && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {t("npxSkills.itemErrorSummary")}: {item.error}
                      </Typography>
                    )}
                    {(item.output || item.error) && (
                      <>
                        <Button
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => toggleJobItemExpanded(item.id)}
                        >
                          {expandedJobItemIds.has(item.id)
                            ? t("npxSkills.itemHideDetails")
                            : t("npxSkills.itemShowDetails")}
                        </Button>
                        {expandedJobItemIds.has(item.id) && (
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "var(--mcs-surface-muted)",
                              border: `1px solid ${theme.palette.divider}`,
                              fontFamily: '"Fira Code", monospace',
                              fontSize: "0.75rem",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.error && (
                              <Box sx={{ mb: item.output ? 1.5 : 0 }}>
                                <Typography variant="caption" color="error" sx={{ display: "block", mb: 0.5 }}>
                                  {t("npxSkills.itemErrorSummary")}
                                </Typography>
                                {item.error}
                              </Box>
                            )}
                            {item.output && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                  {t("npxSkills.itemOutputLabel")}
                                </Typography>
                                {item.output}
                              </Box>
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );

  return (
    <Box
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
        component="main"
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
            <SummaryCard
              label={t("npxSkills.summaryInstalled")}
              value={installedItems.length}
              icon={<Inventory2OutlinedIcon color="success" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              label={t("npxSkills.summaryCatalog")}
              value={catalogItems.length}
              icon={<TipsAndUpdatesOutlinedIcon color="info" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              label={t("npxSkills.summaryAgents")}
              value={agents.length}
              icon={<BuildCircleOutlinedIcon color="warning" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
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

        {view === "find" && renderFindView()}
        {view === "installed" && renderInstalledView()}
        {view === "maintenance" && renderMaintenanceView()}
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

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function NpxSkillsFilters({
  groups,
  selectedCategoryId,
  onCategoryChange,
  t,
}: {
  groups: TaxonomyGroupSummary[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const totalCount = groups.reduce(
    (sum, group) =>
      sum + group.categories.reduce((groupSum, category) => groupSum + category.count, 0),
    0
  );

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {t("common.category")}
      </Typography>
      <List dense disablePadding sx={{ mt: 1 }}>
        <ListItemButton
          selected={selectedCategoryId === null}
          onClick={() => onCategoryChange(null)}
        >
          <ListItemText primary={t("common.all")} secondary={String(totalCount)} />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        {groups.map((group) => (
          <Box key={group.id} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", px: 2, py: 0.5, textTransform: "uppercase" }}
            >
              {group.label}
            </Typography>
            {group.categories.map((category) => (
              <ListItemButton
                key={category.id}
                selected={selectedCategoryId === category.id}
                onClick={() => onCategoryChange(category.id)}
              >
                <ListItemText
                  primary={category.label}
                  secondary={String(category.count)}
                />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );
}
