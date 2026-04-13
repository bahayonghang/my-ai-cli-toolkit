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

const npxSkillsStore = useNpxSkillsStore;

export default function NpxManagePage() {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showNotification } = useUiStore();
  const ctx = useOutletContext<LayoutContext>();

  // Store state
  const installedSearch = npxSkillsStore((s) => s.installedSearch);
  const installedItems = npxSkillsStore((s) => s.installedItems);
  const installedSummary = npxSkillsStore((s) => s.installedSummary);
  const installedCapabilities = npxSkillsStore((s) => s.installedCapabilities);
  const installedGroups = npxSkillsStore((s) => s.installedGroups);
  const installedLoading = npxSkillsStore((s) => s.installedLoading);
  const installedError = npxSkillsStore((s) => s.installedError);
  const installedErrorHint = npxSkillsStore((s) => s.installedErrorHint);
  const installedSyncedAt = npxSkillsStore((s) => s.installedSyncedAt);
  const selectedInstalledCategoryId = npxSkillsStore((s) => s.selectedInstalledCategoryId);
  const selectedInstalledIds = npxSkillsStore((s) => s.selectedInstalledIds);
  const selectedInstalledItem = npxSkillsStore((s) => s.selectedInstalledItem);
  const installedSourceFilter = npxSkillsStore((s) => s.installedSourceFilter);
  const installedTrackingFilter = npxSkillsStore((s) => s.installedTrackingFilter);
  const installedUpdateFilter = npxSkillsStore((s) => s.installedUpdateFilter);
  const installedPage = npxSkillsStore((s) => s.installedPage);
  const jobRunning = npxSkillsStore((s) => s.jobRunning);
  const jobOperation = npxSkillsStore((s) => s.jobOperation);
  const jobStatusMessage = npxSkillsStore((s) => s.jobStatusMessage);
  const jobResultStatus = npxSkillsStore((s) => s.jobResultStatus);
  const jobItems = npxSkillsStore((s) => s.jobItems);
  const jobCompleted = npxSkillsStore((s) => s.jobCompleted);
  const jobTotal = npxSkillsStore((s) => s.jobTotal);
  const jobSuccessCount = npxSkillsStore((s) => s.jobSuccessCount);
  const jobFailureCount = npxSkillsStore((s) => s.jobFailureCount);
  const jobPercent = npxSkillsStore((s) => s.jobPercent);
  const jobId = npxSkillsStore((s) => s.jobId);
  const streamDisconnected = npxSkillsStore((s) => s.streamDisconnected);
  const expandedJobItemIds = npxSkillsStore((s) => s.expandedJobItemIds);
  const jobRunConfig = npxSkillsStore((s) => s.jobRunConfig);

  // Derived state
  const filteredInstalledTotal = selectFilteredInstalledTotal(npxSkillsStore.getState());
  const visibleInstalledItems = selectVisibleInstalledItems(npxSkillsStore.getState());
  const installedTotalPages = selectInstalledTotalPages(npxSkillsStore.getState());

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
    npxSkillsStore.getState().setPendingRunAction({ kind: "remove", itemIds });
  }, []);

  const openRemoveSelected = useCallback(() => {
    openRemoveDialog(Array.from(selectedInstalledIds));
  }, [openRemoveDialog, selectedInstalledIds]);

  const openCheckDialog = useCallback(() => {
    npxSkillsStore.getState().setPendingRunAction({ kind: "check" });
  }, []);

  const openUpdateDialog = useCallback(() => {
    npxSkillsStore.getState().setPendingRunAction({ kind: "update" });
  }, []);

  const openInstalledDetail = useCallback(
    (item: NpxInstalledSkillInstanceDto) => {
      npxSkillsStore.getState().setSelectedInstalledItem(item);
    },
    [],
  );

  const closeInstalledDetail = useCallback(
    () => npxSkillsStore.getState().setSelectedInstalledItem(null),
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
        setInstalledSearch={npxSkillsStore.getState().setInstalledSearch}
        fetchInstalled={() => void ctx.requestInstalled()}
        jobRunning={jobRunning}
        installedItems={visibleInstalledItems}
        installedSummary={installedSummary}
        selectedInstalledIds={selectedInstalledIds}
        setSelectedInstalledIds={npxSkillsStore.getState().setSelectedInstalledIds}
        openRemoveSelected={openRemoveSelected}
        openRemoveDialog={openRemoveDialog}
        openInstalledDetail={openInstalledDetail}
        installedGroups={installedGroups}
        selectedInstalledCategoryId={selectedInstalledCategoryId}
        setSelectedInstalledCategoryId={
          npxSkillsStore.getState().setSelectedInstalledCategoryId
        }
        installedError={installedError}
        installedErrorHint={installedErrorHint}
        installedLoading={installedLoading}
        installTargetLoading={ctx.installTargetLoading}
        filteredInstalledTotal={filteredInstalledTotal}
        installedPage={installedPage}
        setInstalledPage={npxSkillsStore.getState().setInstalledPage}
        installedTotalPages={installedTotalPages}
        sourceFilter={installedSourceFilter}
        setSourceFilter={npxSkillsStore.getState().setInstalledSourceFilter}
        trackingFilter={installedTrackingFilter}
        setTrackingFilter={npxSkillsStore.getState().setInstalledTrackingFilter}
        updateFilter={installedUpdateFilter}
        setUpdateFilter={npxSkillsStore.getState().setInstalledUpdateFilter}
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
        toggleJobItemExpanded={npxSkillsStore.getState().toggleJobItemExpanded}
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
