import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
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
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

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
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { useInstallTarget } from "@/hooks/useInstallTarget";
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
} from "@/types";
import { useUiStore } from "@/stores/uiStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useDebounce } from "@/hooks/useDebounce";

type ViewMode = "find" | "installed" | "maintenance";

interface JobItemState {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  output: string;
  error: string | null;
  durationMs: number | null;
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
  return `${item.repo}::${item.skill_flag ?? ""}`;
}

function parseSkillFlags(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function NpxSkillsPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigateDeferred = (to: string) => startTransition(() => navigate(to));

  const platform = usePlatformStore((state) =>
    state.platforms.find((item) => item.id === platformId)
  );
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const { colorMode, toggleColorMode, showNotification } = useUiStore();

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickInstallOpen, setQuickInstallOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [installedSearch, setInstalledSearch] = useState("");
  const debouncedCatalogSearch = useDebounce(catalogSearch, 250);
  const debouncedInstalledSearch = useDebounce(installedSearch, 250);
  const [installedOnly, setInstalledOnly] = useState(false);

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

  const [quickPackageRef, setQuickPackageRef] = useState("");
  const [quickSkillFlags, setQuickSkillFlags] = useState("");

  const [removeNames, setRemoveNames] = useState<string[]>([]);

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

  const eventSourceRef = useRef<EventSource | null>(null);
  const streamWarnedRef = useRef(false);
  const catalogAbortRef = useRef<AbortController | null>(null);
  const installedAbortRef = useRef<AbortController | null>(null);

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

  const cliConfig = useMemo<NpxSkillsCliConfig>(
    () => ({
      agents,
      cli_mode: cliMode,
    }),
    [agents, cliMode]
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

  const selectedCatalogItems = useMemo(
    () =>
      catalogItems.filter((item) => selectedCatalogKeys.has(buildInstallKey(item))),
    [catalogItems, selectedCatalogKeys]
  );

  const selectedInstallPayload = useMemo<NpxSkillsInstallItemInput[]>(
    () =>
      selectedCatalogItems.map((item) => ({
        package_ref: item.repo,
        skill_flags: item.skill_flag ? [item.skill_flag] : [],
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

  const startJob = useCallback(
    async (labels: string[], starter: () => Promise<NpxSkillsJobStartDto>) => {
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

          const failedSuffix =
            payload.failure_count > 0
              ? `, ${t("npxSkills.jobFailed", { count: payload.failure_count })}`
              : "";
          showNotification(
            t("npxSkills.jobCompleted", {
              operation: operationLabel(payload.operation, t),
              success: payload.success_count,
              failedSuffix,
            }),
            payload.failure_count > 0 ? "warning" : "success"
          );
        });

        source.addEventListener("job_failed", (event) => {
          const payload = safeParseEvent<NpxSkillsJobFailedPayload>(event);
          if (!payload) {
            return;
          }
          setJobRunning(false);
          closeEventStream();
          showNotification(
            t("npxSkills.jobFailedMessage", {
              operation: operationLabel(payload.operation, t),
              message: payload.message,
            }),
            "error"
          );
        });

        source.onerror = () => {
          setStreamDisconnected(true);
          if (!streamWarnedRef.current) {
            streamWarnedRef.current = true;
            showNotification(t("npxSkills.jobConnectionLost"), "warning");
          }
        };
      } catch (error) {
        setJobRunning(false);
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

  const handleInstallSelected = async () => {
    if (!platformId || selectedInstallPayload.length === 0) {
      return;
    }
    await startJob(
      selectedCatalogItems.map((item) => {
        let label = item.repo;
        if (item.skill_flag) {
          label += ` --skill ${item.skill_flag}`;
        }
        return label;
      }),
      () =>
        startNpxSkillsInstallJob(
          platformId,
          selectedInstallPayload,
          installTarget,
          cliConfig
        )
    );
    setSelectedCatalogKeys(new Set());
  };

  const handleQuickInstall = async () => {
    if (!platformId || !quickPackageRef.trim()) {
      return;
    }
    const item: NpxSkillsInstallItemInput = {
      package_ref: quickPackageRef.trim(),
      skill_flags: parseSkillFlags(quickSkillFlags),
    };
    await startJob(
      [item.package_ref],
      () => startNpxSkillsInstallJob(platformId, [item], installTarget, cliConfig)
    );
    setQuickInstallOpen(false);
    setQuickPackageRef("");
    setQuickSkillFlags("");
  };

  const handleRemove = async () => {
    if (!platformId || removeNames.length === 0) {
      return;
    }
    const names = [...removeNames];
    setRemoveNames([]);
    await startJob(names, () =>
      startNpxSkillsRemoveJob(platformId, names, installTarget, cliConfig)
    );
    setSelectedInstalledNames(new Set());
  };

  const openRemoveSelected = () => {
    setRemoveNames(
      installedItems
        .filter((item) => selectedInstalledNames.has(item.name) && item.manageable)
        .map((item) => item.name)
    );
  };

  const handleCheck = async () => {
    if (!platformId) {
      return;
    }
    await startJob([t("npxSkills.operationCheck")], () =>
      startNpxSkillsCheckJob(platformId, installTarget, cliConfig)
    );
  };

  const handleUpdate = async () => {
    if (!platformId) {
      return;
    }
    await startJob([t("npxSkills.operationUpdate")], () =>
      startNpxSkillsUpdateJob(platformId, installTarget, cliConfig)
    );
  };

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
          size="small"
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
        <FormControlLabel
          control={
            <Switch
              checked={installedOnly}
              onChange={(_, checked) => setInstalledOnly(checked)}
            />
          }
          label={t("npxSkills.installedOnly")}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void fetchCatalog()}
        >
          {t("npxSkills.refreshCatalog")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TipsAndUpdatesOutlinedIcon />}
          onClick={() => setQuickInstallOpen(true)}
        >
          {t("npxSkills.quickInstall")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<InstallDesktopIcon />}
          disabled={selectedInstallPayload.length === 0 || jobRunning}
          onClick={() => void handleInstallSelected()}
        >
          {t("npxSkills.installSelected")}
        </Button>
      </Box>

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
      ) : catalogItems.length === 0 ? (
        <Alert severity="info">{t("npxSkills.noCatalogResults")}</Alert>
      ) : (
        <Grid container spacing={2}>
          {catalogItems.map((item) => {
            const key = buildInstallKey(item);
            const isSelected = selectedCatalogKeys.has(key);
            const isDisabled = item.project_only && installTarget.scope === "global";

            return (
              <Grid key={key} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  variant="outlined"
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
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
                  sx={{
                    height: "100%",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.55 : 1,
                    borderColor: isSelected ? "primary.main" : "divider",
                    boxShadow: isSelected
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.16)}`
                      : "none",
                    transition: "all 160ms ease",
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
                            wordBreak: "break-all",
                          }}
                        >
                          {item.repo}
                        </Typography>
                      </Box>
                      <Checkbox checked={isSelected} disabled={isDisabled} />
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
                      {item.category && (
                        <Chip size="small" variant="outlined" label={item.category} />
                      )}
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
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
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
          size="small"
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
          size="small"
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
      ) : installedItems.length === 0 ? (
        <Alert severity="info">{t("npxSkills.noInstalledResults")}</Alert>
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
                {installedItems.map((item) => {
                  const selected = selectedInstalledNames.has(item.name);
                  return (
                    <Box component="tr" key={item.name}>
                      <Box component="td">
                        <Checkbox
                          checked={selected}
                          disabled={!item.manageable}
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
                            wordBreak: "break-all",
                          }}
                        >
                          {item.package_ref ?? item.repo ?? "—"}
                        </Typography>
                        {item.skill_flags && item.skill_flags.length > 0 && (
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
                      <Box component="td">{item.category ?? "—"}</Box>
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
                          onClick={() => setRemoveNames([item.name])}
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
                  onClick={() => void handleCheck()}
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
                  onClick={() => void handleUpdate()}
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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            mb={2}
            flexWrap="wrap"
          >
            <Typography variant="h6">
              {jobOperation ? operationLabel(jobOperation, t) : t("npxSkills.viewMaintenance")}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
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
          </Box>

          {(jobRunning || jobTotal > 0) && (
            <Box sx={{ mb: 2 }}>
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
                        label={item.status}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.durationMs != null ? `${item.durationMs}ms` : ""}
                    </Typography>
                    {item.error && (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                      >
                        {item.error}
                      </Typography>
                    )}
                    {item.output && (
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(0,0,0,0.3)"
                              : "rgba(0,0,0,0.03)",
                          border: `1px solid ${theme.palette.divider}`,
                          fontFamily: '"Fira Code", monospace',
                          fontSize: "0.75rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.output}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
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
            onClick={() => navigateDeferred(`/platform/${platformId}`)}
            sx={{ mr: 0.5 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Tooltip title={t("common.home")}>
            <IconButton
              color="inherit"
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
                size="small"
                color="info"
                clickable
                onClick={openInstallTargetDialog}
                label={t("installed.installTargetChip", {
                  mode:
                    installTarget.scope === "project"
                      ? t("installed.installTargetProject")
                      : t("installed.installTargetGlobal"),
                  path: resolvedTarget?.skills_path ?? t("installed.installTargetLoading"),
                })}
                sx={{ "& .MuiChip-label": { whiteSpace: "nowrap" } }}
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
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
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
              {t("npxSkills.targetAgentsHelp")}
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

      <Dialog
        open={quickInstallOpen}
        onClose={() => setQuickInstallOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("npxSkills.quickInstallTitle")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">{t("npxSkills.quickInstallHelp")}</Alert>
            <TextField
              label={t("npxSkills.packageRef")}
              placeholder={t("npxSkills.packageRefPlaceholder")}
              value={quickPackageRef}
              onChange={(event) => setQuickPackageRef(event.target.value)}
              fullWidth
            />
            <TextField
              label={t("npxSkills.skillFlags")}
              placeholder={t("npxSkills.skillFlagsPlaceholder")}
              value={quickSkillFlags}
              onChange={(event) => setQuickSkillFlags(event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickInstallOpen(false)}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={() => void handleQuickInstall()}
            disabled={!quickPackageRef.trim() || jobRunning}
          >
            {t("common.install")}
          </Button>
        </DialogActions>
      </Dialog>

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={applyInstallTarget}
      />

      <ConfirmDialog
        open={removeNames.length > 0}
        title={t("npxSkills.confirmRemoveTitle")}
        message={t("npxSkills.confirmRemoveMessage", { count: removeNames.length })}
        confirmLabel={t("common.uninstall")}
        confirmColor="error"
        onConfirm={() => void handleRemove()}
        onCancel={() => setRemoveNames([])}
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
