import { useCallback, useEffect, useMemo, useRef } from "react";
import { Outlet, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Chip,
  Drawer,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";

import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { AppShell } from "@/components/shell/AppShell";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { NpxRunConfigDialog } from "@/components/dialogs/NpxRunConfigDialog";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { useI18n } from "@/i18n";
import type {
  NpxSkillsCatalogItemDto,
  NpxSkillsCliConfig,
  NpxSkillsInstallItemInput,
  NpxSkillsItemFinishedPayload,
  NpxSkillsItemStartedPayload,
  NpxSkillsJobCompletedPayload,
  NpxSkillsJobFailedPayload,
  NpxSkillsJobProgressPayload,
  NpxSkillsRunConfig,
  PlatformDisplay,
} from "@/types";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { useNpxSkillsStore } from "@/stores/npxSkillsStore";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { finalizeInterruptedJob } from "@/utils/npxJobState";
import {
  buildNpxJobNotification,
} from "./npxSkillsFeedback";
import {
  buildInstallKey,
  operationLabel,
  parseSkillFlags,
  safeParseEvent,
} from "./npx-skills/utils";
import { COMMON_AGENTS } from "./npx-skills/types";
import type { JobItemState } from "./npx-skills/types";
import {
  startNpxSkillsCheckJob,
  startNpxSkillsInstallJob,
  startNpxSkillsRemoveJob,
  startNpxSkillsUpdateJob,
} from "@/api/client";

// ── Helpers ───────────────────────────────────────────────────────

function upsertWorkspaceParam(current: URLSearchParams, workspaceId: string) {
  const next = new URLSearchParams(current);
  next.set("workspace", workspaceId);
  return next;
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

// ── Layout component ──────────────────────────────────────────────

export default function NpxSkillsLayout() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateDeferred = useNavigateDeferred();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Store state
  const store = useNpxSkillsStore;
  const agents = store((s) => s.agents);
  const cliMode = store((s) => s.cliMode);
  const settingsOpen = store((s) => s.settingsOpen);
  const pendingRunAction = store((s) => s.pendingRunAction);
  const jobRunning = store((s) => s.jobRunning);
  const jobRunConfig = store((s) => s.jobRunConfig);
  const catalogSyncedAt = store((s) => s.catalogSyncedAt);
  const catalogItems = store((s) => s.catalogItems);
  const selectedCatalogKeys = store((s) => s.selectedCatalogKeys);

  const eventSourceRef = useRef<EventSource | null>(null);
  const streamWarnedRef = useRef(false);
  const catalogAbortRef = useRef<AbortController | null>(null);
  const installedAbortRef = useRef<AbortController | null>(null);
  const jobItemsRef = useRef<JobItemState[]>([]);

  // Sync jobItems ref
  const jobItems = store((s) => s.jobItems);
  useEffect(() => {
    jobItemsRef.current = jobItems;
  }, [jobItems]);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    if (!currentWorkspaceId || requestedWorkspaceId === currentWorkspaceId) {
      return;
    }
    setSearchParams(
      (current) => upsertWorkspaceParam(current, currentWorkspaceId),
      { replace: true },
    );
  }, [currentWorkspaceId, requestedWorkspaceId, setSearchParams]);

  useEffect(() => {
    store.getState().setInstalledPageSize(isMobile ? 20 : 50);
  }, [isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      catalogAbortRef.current?.abort();
      installedAbortRef.current?.abort();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const installTargetKey = useMemo(
    () =>
      `${currentWorkspaceId ?? ""}::${installTarget.scope}::${installTarget.project_path ?? ""}`,
    [currentWorkspaceId, installTarget.project_path, installTarget.scope],
  );

  // Reset store when workspace changes
  useEffect(() => {
    catalogAbortRef.current?.abort();
    installedAbortRef.current?.abort();
    store.getState().resetForWorkspaceChange();
  }, [installTargetKey]);

  const requestCatalog = useCallback(async () => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) return;
    catalogAbortRef.current?.abort();
    const controller = new AbortController();
    catalogAbortRef.current = controller;
    await store
      .getState()
      .fetchCatalog(currentWorkspaceId, installTarget, controller.signal);
    if (catalogAbortRef.current === controller) {
      catalogAbortRef.current = null;
    }
  }, [currentWorkspaceId, installTarget, installTargetLoading, resolvedTarget]);

  const requestInstalled = useCallback(async () => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) return;
    installedAbortRef.current?.abort();
    const controller = new AbortController();
    installedAbortRef.current = controller;
    await store
      .getState()
      .fetchInstalled(currentWorkspaceId, installTarget, controller.signal);
    if (installedAbortRef.current === controller) {
      installedAbortRef.current = null;
    }
  }, [currentWorkspaceId, installTarget, installTargetLoading, resolvedTarget]);

  // Initial data load
  useEffect(() => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) return;
    void Promise.all([requestCatalog(), requestInstalled()]);
  }, [
    currentWorkspaceId,
    installTargetKey,
    installTargetLoading,
    requestCatalog,
    requestInstalled,
    resolvedTarget,
  ]);

  const defaultRunConfig = useMemo<NpxSkillsRunConfig>(
    () => ({ agents, cliMode, installTarget }),
    [agents, cliMode, installTarget],
  );

  const closeEventStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const refreshAfterJob = useCallback(() => {
    void Promise.all([requestCatalog(), requestInstalled()]);
  }, [requestCatalog, requestInstalled]);

  // Selected catalog items derived
  const selectedCatalogItems = useMemo(
    () =>
      catalogItems.filter((item) =>
        selectedCatalogKeys.has(buildInstallKey(item)),
      ),
    [catalogItems, selectedCatalogKeys],
  );
  const selectedInstallPayload = useMemo(
    () => groupCatalogInstallPayload(selectedCatalogItems),
    [selectedCatalogItems],
  );

  const startJob = useCallback(
    async (
      labels: string[],
      starter: () => Promise<{ job_id: string; operation: string; total: number }>,
      runConfig: NpxSkillsRunConfig,
    ) => {
      if (!currentWorkspaceId || labels.length === 0 || jobRunning) return;
      streamWarnedRef.current = false;
      store.getState().initializeJob(labels, runConfig);
      closeEventStream();

      try {
        const started = await starter();
        store.getState().setJobStarted(started as any);

        const streamUrl = `/api/platforms/${encodeURIComponent(
          currentWorkspaceId,
        )}/npx-skills/jobs/${encodeURIComponent(started.job_id)}/stream`;
        const source = new EventSource(streamUrl);
        eventSourceRef.current = source;

        source.addEventListener("item_started", (event) => {
          const payload = safeParseEvent<NpxSkillsItemStartedPayload>(event);
          if (!payload) return;
          store
            .getState()
            .updateJobItemStatus(payload.item_id, "running");
        });

        source.addEventListener("item_finished", (event) => {
          const payload = safeParseEvent<NpxSkillsItemFinishedPayload>(event);
          if (!payload) return;
          store.getState().updateJobItemStatus(
            payload.item_id,
            payload.success ? "success" : "error",
            payload.output,
            payload.error,
            payload.duration_ms,
          );
        });

        source.addEventListener("job_progress", (event) => {
          const payload = safeParseEvent<NpxSkillsJobProgressPayload>(event);
          if (!payload) return;
          store.getState().updateJobProgress(
            payload.completed,
            payload.total,
            payload.success_count,
            payload.failure_count,
            payload.percent,
          );
        });

        source.addEventListener("job_completed", (event) => {
          const payload = safeParseEvent<NpxSkillsJobCompletedPayload>(event);
          if (!payload) return;
          store.getState().completeJob(
            payload.total,
            payload.success_count,
            payload.failure_count,
            payload.operation,
          );
          closeEventStream();
          refreshAfterJob();
          const notification = buildNpxJobNotification(
            payload.operation,
            payload.success_count,
            payload.failure_count,
            t,
          );
          store.getState().jobStatusMessage = notification.message;
          useNpxSkillsStore.setState({ jobStatusMessage: notification.message });
          showNotification(notification.message, notification.severity);
        });

        source.addEventListener("job_failed", (event) => {
          const payload = safeParseEvent<NpxSkillsJobFailedPayload>(event);
          if (!payload) return;
          const msg = t("npxSkills.jobFailedMessage", {
            operation: operationLabel(payload.operation, t),
            message: payload.message,
          });
          store.getState().failJob(msg, payload.operation);
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
              operation: operationLabel(started.operation as any, t),
            }),
          );
          closeEventStream();
          store.getState().interruptJob(
            interrupted.items,
            interrupted.completed,
            interrupted.total,
            interrupted.successCount,
            interrupted.failureCount,
            interrupted.percent,
            t("npxSkills.jobInterruptedMessage", {
              operation: operationLabel(started.operation as any, t),
            }),
          );
          if (!streamWarnedRef.current) {
            streamWarnedRef.current = true;
            showNotification(t("npxSkills.jobConnectionLost"), "warning");
          }
        };
      } catch (error) {
        store.getState().failJob((error as Error).message, "install");
        closeEventStream();
        showNotification((error as Error).message, "error");
      }
    },
    [
      closeEventStream,
      currentWorkspaceId,
      jobRunning,
      refreshAfterJob,
      showNotification,
      t,
    ],
  );

  const handleRunDialogConfirm = useCallback(
    async (payload: {
      config: NpxSkillsRunConfig;
      packageRef: string;
      skillFlagsInput: string;
    }) => {
      if (!currentWorkspaceId || !pendingRunAction) return;

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
        store.getState().setSelectedCatalogKeys(new Set());
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
        store.getState().setSelectedInstalledIds(new Set());
        store.getState().setSelectedInstalledItem(null);
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

      store.getState().setPendingRunAction(null);
    },
    [currentWorkspaceId, pendingRunAction, startJob, t],
  );

  const pendingRunDialogContent = useMemo(() => {
    if (!pendingRunAction) return null;
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

  const installTargetModeLabel =
    installTarget.scope === "project"
      ? t("installed.installTargetProject")
      : t("installed.installTargetGlobal");
  const installTargetPath =
    resolvedTarget?.skills_path ??
    (installTargetBlocked
      ? t("installed.installTargetUnavailable")
      : t("installed.installTargetLoading"));

  // ── Sub-page navigation ──────────────────────────────────────

  const isDiscoverActive = location.pathname.endsWith("/discover") ||
    location.pathname === "/registry" ||
    location.pathname === "/registry/";
  const isManageActive = location.pathname.endsWith("/manage");

  const baseSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";

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
            onClick={() => store.getState().setSettingsOpen(true)}
          >
            {t("npxSkills.settings")}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        {installTargetBlocked ? (
          <Box sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "error.main",
            bgcolor: "error.main",
            color: "error.contrastText",
            opacity: 0.9,
          }}>
            <Typography variant="body2" fontWeight={600}>{resolutionError}</Typography>
          </Box>
        ) : null}

        {/* ── Context bar ──────────────────────────────────────── */}
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: { xs: 1.5, md: 1.75 },
            borderRadius: 4,
            border: "1px solid var(--mcs-workbench-outline)",
            background:
              "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill) 100%)",
            boxShadow: "var(--mcs-shadow-sm)",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <Autocomplete
                options={platforms}
                value={platform}
                getOptionLabel={(option: PlatformDisplay) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                onChange={(_, nextValue) => {
                  if (!nextValue) return;
                  setSearchParams((current) =>
                    upsertWorkspaceParam(current, nextValue.id),
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("npxSkills.workspaceAnchorLabel")}
                    placeholder={t("npxSkills.workspaceAnchorPlaceholder")}
                    size="small"
                  />
                )}
                sx={{ minWidth: { xs: "100%", lg: 260 } }}
              />

              <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("npxSkills.contextInstallTarget", {
                    mode: installTargetModeLabel,
                  })}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("npxSkills.contextAgents", {
                    count: agents.length,
                  })}
                />
                <Chip
                  size="small"
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
          </Stack>
        </Box>

        {/* ── Pill-style sub-navigation ────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 0.5,
            borderRadius: 99,
            border: "1px solid var(--mcs-workbench-outline)",
            background: "var(--mcs-panel-fill)",
            width: "fit-content",
          }}
        >
          <ButtonBase
            onClick={() => navigate(`/registry/discover${baseSearch}`)}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 99,
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: 1,
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              background: isDiscoverActive
                ? "linear-gradient(135deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-panel-fill-emphasis) 100%)"
                : "transparent",
              color: isDiscoverActive
                ? "var(--mcs-panel-accent)"
                : "text.secondary",
              border: isDiscoverActive
                ? "1px solid var(--mcs-workbench-outline-strong)"
                : "1px solid transparent",
              boxShadow: isDiscoverActive
                ? "var(--mcs-shadow-sm)"
                : "none",
              "&:hover": {
                background: isDiscoverActive
                  ? undefined
                  : "var(--mcs-panel-fill-emphasis)",
              },
            }}
          >
            <TravelExploreIcon sx={{ fontSize: 18 }} />
            {t("npxSkills.navDiscover")}
          </ButtonBase>
          <ButtonBase
            onClick={() => navigate(`/registry/manage${baseSearch}`)}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 99,
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: 1,
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              background: isManageActive
                ? "linear-gradient(135deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-panel-fill-emphasis) 100%)"
                : "transparent",
              color: isManageActive
                ? "var(--mcs-panel-accent)"
                : "text.secondary",
              border: isManageActive
                ? "1px solid var(--mcs-workbench-outline-strong)"
                : "1px solid transparent",
              boxShadow: isManageActive
                ? "var(--mcs-shadow-sm)"
                : "none",
              "&:hover": {
                background: isManageActive
                  ? undefined
                  : "var(--mcs-panel-fill-emphasis)",
              },
            }}
          >
            <InventoryOutlinedIcon sx={{ fontSize: 18 }} />
            {t("npxSkills.navManage")}
          </ButtonBase>
        </Box>

        {/* ── Sub-page content ─────────────────────────────────── */}
        <Outlet
          context={{
            currentWorkspaceId,
            installTarget,
            installTargetLoading,
            resolvedTarget,
            installTargetBlocked,
            isMobile,
            requestCatalog,
            requestInstalled,
            selectedInstallPayload,
            selectedCatalogItems,
            defaultRunConfig,
            installTargetPath,
            jobRunConfig,
          }}
        />
      </Stack>

      {/* ── Shared Dialogs ───────────────────────────────────────── */}

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={async (nextTarget) => {
          const applied = await applyInstallTarget(nextTarget);
          if (applied) closeInstallTargetDialog();
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
          onClose={() => store.getState().setPendingRunAction(null)}
          onConfirm={handleRunDialogConfirm}
        />
      ) : null}

      {/* ── Settings drawer ──────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => store.getState().setSettingsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 420 },
            p: 2.5,
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
            onChange={(_, next) => store.getState().updateAgents(next)}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getItemProps({ index });
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
              {
                value: "auto" as const,
                label: t("npxSkills.cliModeAuto"),
              },
              { value: "npx" as const, label: t("npxSkills.cliModeNpx") },
            ]}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            value={
              cliMode === "auto"
                ? {
                    value: "auto" as const,
                    label: t("npxSkills.cliModeAuto"),
                  }
                : {
                    value: "npx" as const,
                    label: t("npxSkills.cliModeNpx"),
                  }
            }
            onChange={(_, nextValue) =>
              store.getState().updateCliMode(nextValue.value)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("npxSkills.summaryCliMode")}
              />
            )}
          />

          <Typography variant="caption" color="text.secondary">
            {cliMode === "auto"
              ? t("npxSkills.cliModeAutoHelp")
              : t("npxSkills.cliModeNpxHelp")}
          </Typography>

          <Button
            variant="contained"
            onClick={() => store.getState().setSettingsOpen(false)}
          >
            {t("common.close")}
          </Button>
        </Stack>
      </Drawer>

      <NotificationSnackbar />
    </AppShell>
  );
}
