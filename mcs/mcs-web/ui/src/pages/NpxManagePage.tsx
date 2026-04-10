import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import StorageIcon from "@mui/icons-material/Storage";

import { useI18n } from "@/i18n";
import {
  useNpxSkillsStore,
  selectFilteredInstalledTotal,
  selectVisibleInstalledItems,
  selectInstalledTotalPages,
} from "@/stores/npxSkillsStore";
import type {
  InstallTarget,
  NpxInstalledSkillInstanceDto,
  NpxSkillsRunConfig,
  ResolvedInstallTarget,
} from "@/types";
import { buildNpxRunConfigSummary } from "./npxSkillsFeedback";
import NpxInstalledView from "./npx-skills/NpxInstalledView";
import NpxInstalledSkillDrawer from "./npx-skills/NpxInstalledSkillDrawer";
import NpxMaintenanceView from "./npx-skills/NpxMaintenanceView";
import NpxSummaryCard from "./npx-skills/NpxSummaryCard";
import { useUiStore } from "@/stores/uiStore";

interface LayoutContext {
  currentWorkspaceId: string | null;
  installTarget: InstallTarget;
  installTargetLoading: boolean;
  resolvedTarget: ResolvedInstallTarget | null;
  isMobile: boolean;
  requestInstalled: () => Promise<void>;
  installTargetPath: string;
  jobRunConfig: NpxSkillsRunConfig | null;
}

export default function NpxManagePage() {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showNotification } = useUiStore();
  const ctx = useOutletContext<LayoutContext>();

  const store = useNpxSkillsStore;

  // Store state
  const installedSearch = store((s) => s.installedSearch);
  const installedItems = store((s) => s.installedItems);
  const installedSummary = store((s) => s.installedSummary);
  const installedCapabilities = store((s) => s.installedCapabilities);
  const installedGroups = store((s) => s.installedGroups);
  const installedLoading = store((s) => s.installedLoading);
  const installedError = store((s) => s.installedError);
  const installedErrorHint = store((s) => s.installedErrorHint);
  const installedSyncedAt = store((s) => s.installedSyncedAt);
  const selectedInstalledCategoryId = store((s) => s.selectedInstalledCategoryId);
  const selectedInstalledIds = store((s) => s.selectedInstalledIds);
  const selectedInstalledItem = store((s) => s.selectedInstalledItem);
  const installedSourceFilter = store((s) => s.installedSourceFilter);
  const installedTrackingFilter = store((s) => s.installedTrackingFilter);
  const installedUpdateFilter = store((s) => s.installedUpdateFilter);
  const installedPage = store((s) => s.installedPage);
  const jobRunning = store((s) => s.jobRunning);
  const jobOperation = store((s) => s.jobOperation);
  const jobStatusMessage = store((s) => s.jobStatusMessage);
  const jobResultStatus = store((s) => s.jobResultStatus);
  const jobItems = store((s) => s.jobItems);
  const jobCompleted = store((s) => s.jobCompleted);
  const jobTotal = store((s) => s.jobTotal);
  const jobSuccessCount = store((s) => s.jobSuccessCount);
  const jobFailureCount = store((s) => s.jobFailureCount);
  const jobPercent = store((s) => s.jobPercent);
  const jobId = store((s) => s.jobId);
  const streamDisconnected = store((s) => s.streamDisconnected);
  const expandedJobItemIds = store((s) => s.expandedJobItemIds);
  const jobRunConfig = store((s) => s.jobRunConfig);

  // Derived state
  const filteredInstalledTotal = useMemo(
    () => selectFilteredInstalledTotal(store.getState()),
    [
      installedItems,
      installedSearch,
      selectedInstalledCategoryId,
      installedSourceFilter,
      installedTrackingFilter,
      installedUpdateFilter,
    ],
  );
  const visibleInstalledItems = useMemo(
    () => selectVisibleInstalledItems(store.getState()),
    [
      installedItems,
      installedSearch,
      selectedInstalledCategoryId,
      installedSourceFilter,
      installedTrackingFilter,
      installedUpdateFilter,
      installedPage,
      store.getState().installedPageSize,
    ],
  );
  const installedTotalPages = useMemo(
    () => selectInstalledTotalPages(store.getState()),
    [filteredInstalledTotal, store.getState().installedPageSize],
  );

  const runConfigSummary = useMemo(
    () => (jobRunConfig ? buildNpxRunConfigSummary(jobRunConfig, t) : null),
    [jobRunConfig, t],
  );

  const runConfigPath = useMemo(() => {
    if (jobRunConfig?.installTarget.scope === "project") {
      return (
        jobRunConfig.installTarget.project_path?.trim() ||
        ctx.installTargetPath
      );
    }
    return ctx.installTargetPath;
  }, [jobRunConfig, ctx.installTargetPath]);

  // Callbacks
  const openRemoveDialog = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return;
    store.getState().setPendingRunAction({ kind: "remove", itemIds });
  }, []);

  const openRemoveSelected = useCallback(() => {
    openRemoveDialog(Array.from(selectedInstalledIds));
  }, [openRemoveDialog, selectedInstalledIds]);

  const openCheckDialog = useCallback(() => {
    store.getState().setPendingRunAction({ kind: "check" });
  }, []);

  const openUpdateDialog = useCallback(() => {
    store.getState().setPendingRunAction({ kind: "update" });
  }, []);

  const openInstalledDetail = useCallback(
    (item: NpxInstalledSkillInstanceDto) => {
      store.getState().setSelectedInstalledItem(item);
    },
    [],
  );

  const closeInstalledDetail = useCallback(
    () => store.getState().setSelectedInstalledItem(null),
    [],
  );

  const copyInstalledSourceRef = useCallback(
    (value: string) => {
      navigator.clipboard.writeText(value).then(
        () => showNotification(t("npxSkills.copySuccess"), "success"),
        () => showNotification(t("npxSkills.copyFailed"), "error"),
      );
    },
    [showNotification, t],
  );

  return (
    <Stack spacing={3}>
      {/* ── Summary cards ──────────────────────────────────────── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryInstalled")}
            value={installedSummary?.total ?? installedItems.length}
            icon={<InventoryOutlinedIcon sx={{ color: "var(--mcs-panel-accent)" }} />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryCurated")}
            value={installedSummary?.curated ?? 0}
            icon={<StorageIcon sx={{ color: "var(--mcs-panel-accent)" }} />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryManual")}
            value={installedSummary?.manual ?? 0}
            icon={<TrackChangesIcon sx={{ color: "var(--mcs-panel-accent)" }} />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryUpdates")}
            value={installedSummary?.update_available ?? 0}
            icon={<SystemUpdateAltIcon sx={{ color: "warning.main" }} />}
          />
        </Grid>
      </Grid>

      {/* ── Installed section header ───────────────────────────── */}
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "var(--mcs-workbench-muted)" }}
        >
          {t("npxSkills.sectionInstalled")}
        </Typography>
        <Typography
          variant="h6"
          sx={{ mt: 0.45, letterSpacing: "-0.03em" }}
        >
          {t("npxSkills.installedSectionTitle")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, maxWidth: 860 }}
        >
          {t("npxSkills.installedSectionSubtitle")}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {installedSyncedAt
            ? t("npxSkills.inventorySnapshotHint", {
                value: new Date(installedSyncedAt).toLocaleTimeString(),
              })
            : t("npxSkills.inventorySnapshotPending")}
        </Typography>
      </Box>

      {/* ── Installed view ─────────────────────────────────────── */}
      <NpxInstalledView
        t={t}
        isMobile={isMobile}
        installedSearch={installedSearch}
        setInstalledSearch={store.getState().setInstalledSearch}
        fetchInstalled={() => void ctx.requestInstalled()}
        jobRunning={jobRunning}
        installedItems={visibleInstalledItems}
        installedSummary={installedSummary}
        selectedInstalledIds={selectedInstalledIds}
        setSelectedInstalledIds={store.getState().setSelectedInstalledIds}
        openRemoveSelected={openRemoveSelected}
        openRemoveDialog={openRemoveDialog}
        openInstalledDetail={openInstalledDetail}
        installedGroups={installedGroups}
        selectedInstalledCategoryId={selectedInstalledCategoryId}
        setSelectedInstalledCategoryId={
          store.getState().setSelectedInstalledCategoryId
        }
        installedError={installedError}
        installedErrorHint={installedErrorHint}
        installedLoading={installedLoading}
        installTargetLoading={ctx.installTargetLoading}
        filteredInstalledTotal={filteredInstalledTotal}
        installedPage={installedPage}
        setInstalledPage={store.getState().setInstalledPage}
        installedTotalPages={installedTotalPages}
        sourceFilter={installedSourceFilter}
        setSourceFilter={store.getState().setInstalledSourceFilter}
        trackingFilter={installedTrackingFilter}
        setTrackingFilter={store.getState().setInstalledTrackingFilter}
        updateFilter={installedUpdateFilter}
        setUpdateFilter={store.getState().setInstalledUpdateFilter}
        capabilities={installedCapabilities}
      />

      <Divider />

      {/* ── Maintenance section header ─────────────────────────── */}
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "var(--mcs-workbench-muted)" }}
        >
          {t("npxSkills.sectionMaintenance")}
        </Typography>
        <Typography
          variant="h6"
          sx={{ mt: 0.45, letterSpacing: "-0.03em" }}
        >
          {t("npxSkills.maintenanceSectionTitle")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, maxWidth: 860 }}
        >
          {t("npxSkills.maintenanceSectionSubtitle")}
        </Typography>
      </Box>

      {/* ── Maintenance view ───────────────────────────────────── */}
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
        toggleJobItemExpanded={store.getState().toggleJobItemExpanded}
        runConfigSummary={runConfigSummary}
        runConfigPath={runConfigPath}
      />

      {/* ── Installed detail drawer ────────────────────────────── */}
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
  );
}
