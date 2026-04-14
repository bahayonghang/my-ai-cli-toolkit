import { useCallback, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useDebounce } from "@/hooks/useDebounce";
import { useI18n } from "@/i18n";
import { useNpxSkillsStore } from "@/stores/npxSkillsStore";
import { useUiStore } from "@/stores/uiStore";
import type {
  InstallTarget,
  NpxInstalledPackageDto,
  NpxSkillsCliVersionDto,
  NpxSkillsRunConfig,
  ResolvedInstallTarget,
} from "@/types";
import { buildNpxRunConfigSummary } from "./npxSkillsFeedback";
import NpxSummaryCard from "./npx-skills/NpxSummaryCard";

interface LayoutContext {
  currentWorkspaceId: string | null;
  installTarget: InstallTarget;
  installTargetLoading: boolean;
  resolvedTarget: ResolvedInstallTarget | null;
  isMobile: boolean;
  requestPackages: (refreshRemote?: boolean) => Promise<void>;
  installTargetPath: string;
  jobRunConfig: NpxSkillsRunConfig | null;
  cliVersionInfo: NpxSkillsCliVersionDto | null;
}

const npxSkillsStore = useNpxSkillsStore;

function packageSourceLabel(item: NpxInstalledPackageDto, t: ReturnType<typeof useI18n>["t"]) {
  switch (item.source_kind) {
    case "curated":
      return t("npxSkills.filterCurated");
    case "manual_github":
      return t("npxSkills.sourceManualGithub");
    case "manual_git":
      return t("npxSkills.sourceManualGit");
    case "manual_local":
      return t("npxSkills.sourceManualLocal");
    default:
      return t("npxSkills.sourceManualUnknown");
  }
}

function comparisonColor(status: NpxInstalledPackageDto["comparison_status"]) {
  switch (status) {
    case "up_to_date":
      return "success" as const;
    case "update_available":
      return "warning" as const;
    case "unknown":
      return "info" as const;
    default:
      return "default" as const;
  }
}

function comparisonLabel(
  status: NpxInstalledPackageDto["comparison_status"],
  t: ReturnType<typeof useI18n>["t"],
) {
  switch (status) {
    case "up_to_date":
      return t("npxSkills.packageState.up_to_date");
    case "update_available":
      return t("npxSkills.packageState.update_available");
    case "not_recorded":
      return t("npxSkills.packageState.not_recorded");
    case "incomparable":
      return t("npxSkills.packageState.incomparable");
    default:
      return t("npxSkills.packageState.unknown");
  }
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function jobOperationLabel(
  value: "install" | "remove" | "check" | "update" | null,
  t: ReturnType<typeof useI18n>["t"],
) {
  switch (value) {
    case "install":
      return t("npxSkills.jobOperation.install");
    case "remove":
      return t("npxSkills.jobOperation.remove");
    case "check":
      return t("npxSkills.jobOperation.check");
    case "update":
      return t("npxSkills.jobOperation.update");
    default:
      return t("npxSkills.viewMaintenance");
  }
}

function jobResultLabel(
  value: "idle" | "running" | "success" | "warning" | "error" | "interrupted",
  t: ReturnType<typeof useI18n>["t"],
) {
  switch (value) {
    case "idle":
      return t("npxSkills.jobResult.idle");
    case "running":
      return t("npxSkills.jobResult.running");
    case "success":
      return t("npxSkills.jobResult.success");
    case "warning":
      return t("npxSkills.jobResult.warning");
    case "error":
      return t("npxSkills.jobResult.error");
    case "interrupted":
      return t("npxSkills.jobResult.interrupted");
  }
}

function PackageVersions({
  item,
  t,
}: {
  item: NpxInstalledPackageDto;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" fontWeight={600}>
        {item.local_version ?? t("npxSkills.packageVersionUnknown")}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t("npxSkills.packageVersionLatestLabel", {
          value: item.remote_version ?? t("npxSkills.packageVersionUnknown"),
        })}
      </Typography>
    </Stack>
  );
}

export default function NpxManagePage() {
  const { t } = useI18n();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("lg"));
  const { showNotification } = useUiStore();
  const ctx = useOutletContext<LayoutContext>();
  const currentWorkspaceId = ctx.currentWorkspaceId;
  const installTargetLoading = ctx.installTargetLoading;
  const resolvedTarget = ctx.resolvedTarget;
  const requestPackages = ctx.requestPackages;
  const cliVersionInfo = ctx.cliVersionInfo;
  const pageJobRunConfig = ctx.jobRunConfig;

  const packageItems = npxSkillsStore((s) => s.packageItems);
  const packageCapabilities = npxSkillsStore((s) => s.packageCapabilities);
  const packageSummary = npxSkillsStore((s) => s.packageSummary);
  const packageLoading = npxSkillsStore((s) => s.packageLoading);
  const packageError = npxSkillsStore((s) => s.packageError);
  const packageSyncedAt = npxSkillsStore((s) => s.packageSyncedAt);
  const packageSearch = npxSkillsStore((s) => s.packageSearch);
  const packagePage = npxSkillsStore((s) => s.packagePage);
  const packageTotalPages = npxSkillsStore((s) => s.packageTotalPages);
  const packageFilteredTotal = npxSkillsStore((s) => s.packageFilteredTotal);
  const selectedPackageIds = npxSkillsStore((s) => s.selectedPackageIds);
  const selectedPackageItem = npxSkillsStore((s) => s.selectedPackageItem);
  const jobRunning = npxSkillsStore((s) => s.jobRunning);
  const jobOperation = npxSkillsStore((s) => s.jobOperation);
  const jobStatusMessage = npxSkillsStore((s) => s.jobStatusMessage);
  const jobResultStatus = npxSkillsStore((s) => s.jobResultStatus);
  const jobCompleted = npxSkillsStore((s) => s.jobCompleted);
  const jobTotal = npxSkillsStore((s) => s.jobTotal);
  const jobSuccessCount = npxSkillsStore((s) => s.jobSuccessCount);
  const jobFailureCount = npxSkillsStore((s) => s.jobFailureCount);
  const jobPercent = npxSkillsStore((s) => s.jobPercent);
  const streamDisconnected = npxSkillsStore((s) => s.streamDisconnected);

  const debouncedSearch = useDebounce(packageSearch, 250);

  useEffect(() => {
    if (!currentWorkspaceId || !resolvedTarget || installTargetLoading) {
      return;
    }
    void requestPackages();
  }, [
    currentWorkspaceId,
    installTargetLoading,
    requestPackages,
    resolvedTarget,
    debouncedSearch,
    packagePage,
  ]);

  const selectedPackages = useMemo(
    () => packageItems.filter((item) => selectedPackageIds.has(item.id)),
    [packageItems, selectedPackageIds],
  );

  const selectedPackageSkillIds = useMemo(() => {
    const next = new Set<string>();
    for (const item of selectedPackages) {
      for (const skillName of item.installed_skill_names) {
        next.add(skillName);
      }
    }
    return [...next];
  }, [selectedPackages]);

  const runConfigSummary = useMemo(
    () => (pageJobRunConfig ? buildNpxRunConfigSummary(pageJobRunConfig, t) : null),
    [pageJobRunConfig, t],
  );

  const togglePackageSelection = useCallback((id: string) => {
    npxSkillsStore.getState().setSelectedPackageIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openPackageDrawer = useCallback((item: NpxInstalledPackageDto) => {
    npxSkillsStore.getState().setSelectedPackageItem(item);
  }, []);

  const closePackageDrawer = useCallback(() => {
    npxSkillsStore.getState().setSelectedPackageItem(null);
  }, []);

  const refreshRemoteVersions = useCallback(() => {
    void requestPackages(true);
  }, [requestPackages]);

  const openUpdatePackagesDialog = useCallback((items: NpxInstalledPackageDto[]) => {
    const actionable = items.filter((item) => item.actions.updatable);
    if (actionable.length === 0) return;
    npxSkillsStore.getState().setPendingRunAction({
      kind: "update-packages",
      itemIds: actionable.map((item) => item.id),
      labels: actionable.map((item) => item.package_ref),
    });
  }, []);

  const openRemovePackagesDialog = useCallback((items: NpxInstalledPackageDto[]) => {
    const skillNames = new Set<string>();
    for (const item of items) {
      if (!item.actions.removable) continue;
      for (const name of item.installed_skill_names) {
        skillNames.add(name);
      }
    }
    if (skillNames.size === 0) return;
    npxSkillsStore.getState().setPendingRunAction({
      kind: "remove",
      itemIds: [...skillNames],
    });
  }, []);

  const copyValue = useCallback(
    (value: string) => {
      navigator.clipboard.writeText(value).then(
        () => showNotification(t("npxSkills.copySuccess"), "success"),
        () => showNotification(t("npxSkills.copyFailed"), "error"),
      );
    },
    [showNotification, t],
  );

  const canBulkUpdate = selectedPackages.some((item) => item.actions.updatable);
  const canBulkRemove = selectedPackages.some((item) => item.actions.removable);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryPackages")}
            value={packageSummary?.total_packages ?? packageFilteredTotal}
            icon={<InventoryOutlinedIcon sx={{ color: "var(--mcs-panel-accent)" }} />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryInstalledSkills")}
            value={packageSummary?.total_skills ?? 0}
            icon={<StorageIcon sx={{ color: "var(--mcs-panel-accent)" }} />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryUpdates")}
            value={packageSummary?.update_available ?? 0}
            icon={<SystemUpdateAltIcon sx={{ color: "warning.main" }} />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NpxSummaryCard
            label={t("npxSkills.summaryIncomparable")}
            value={packageSummary?.incomparable ?? 0}
            icon={<WarningAmberIcon sx={{ color: "var(--mcs-panel-accent)" }} />}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="overline" sx={{ color: "var(--mcs-workbench-muted)" }}>
          {t("npxSkills.sectionInstalled")}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.45, letterSpacing: "-0.03em" }}>
          {t("npxSkills.packagesSectionTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 920 }}>
          {t("npxSkills.packagesSectionSubtitle")}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {packageSyncedAt
            ? t("npxSkills.inventorySnapshotHint", {
                value: new Date(packageSyncedAt).toLocaleTimeString(),
              })
            : t("npxSkills.inventorySnapshotPending")}
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }}>
              <TextField
                size="small"
                label={t("common.search")}
                placeholder={t("npxSkills.packagesSearchPlaceholder")}
                value={packageSearch}
                onChange={(event) => npxSkillsStore.getState().setPackageSearch(event.target.value)}
                sx={{ width: { xs: "100%", lg: 420 } }}
              />
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <Chip size="small" variant="outlined" label={t("npxSkills.packagesVisible", { count: packageFilteredTotal })} />
                <Chip size="small" variant="outlined" label={t("npxSkills.packagesSelected", { count: selectedPackages.length })} />
                <Chip
                  size="small"
                  variant="outlined"
                  color={
                    cliVersionInfo?.status === "update_available"
                      ? "warning"
                      : cliVersionInfo?.status === "up_to_date"
                      ? "success"
                      : "default"
                  }
                  label={t("npxSkills.manageCliStatus", {
                    current: cliVersionInfo?.current ?? t("npxSkills.packageVersionUnknown"),
                    latest: cliVersionInfo?.latest ?? t("npxSkills.packageVersionUnknown"),
                  })}
                />
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                disabled={packageLoading || installTargetLoading}
                onClick={refreshRemoteVersions}
              >
                {t("npxSkills.checkUpdates")}
              </Button>
            </Stack>

            {(packageLoading || installTargetLoading) ? <LinearProgress aria-label={t("common.loading")} /> : null}
            {packageError ? <Alert severity="error">{packageError}</Alert> : null}
            {packageItems.length === 0 && !packageLoading ? <Alert severity="info">{t("npxSkills.packageNoResults")}</Alert> : null}

            {packageItems.length > 0 ? (
              compact ? (
                <Stack spacing={1.25}>
                  {packageItems.map((item) => (
                    <Card key={item.id} variant="outlined">
                      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                        <Stack spacing={1.25}>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Checkbox
                              checked={selectedPackageIds.has(item.id)}
                              onChange={() => togglePackageSelection(item.id)}
                              inputProps={{ "aria-label": t("common.selectItem", { name: item.package_ref }) }}
                            />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                                  {item.package_ref}
                                </Typography>
                                <Chip size="small" color={comparisonColor(item.comparison_status)} variant="outlined" label={comparisonLabel(item.comparison_status, t)} />
                                <Chip size="small" variant="outlined" label={packageSourceLabel(item, t)} />
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                                {item.source_ref}
                              </Typography>
                            </Box>
                          </Stack>

                          <Grid container spacing={1.25}>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary">{t("npxSkills.packageColumnCurrent")}</Typography>
                              <Typography variant="body2" fontWeight={600}>{item.local_version ?? t("npxSkills.packageVersionUnknown")}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary">{t("npxSkills.packageColumnRemote")}</Typography>
                              <Typography variant="body2" fontWeight={600}>{item.remote_version ?? t("npxSkills.packageVersionUnknown")}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary">{t("npxSkills.packageColumnCount")}</Typography>
                              <Typography variant="body2">{item.installed_skill_count}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary">{t("npxSkills.packageColumnAgents")}</Typography>
                              <Typography variant="body2">{item.agents.length === 0 ? t("npxSkills.noAgents") : item.agents.join(", ")}</Typography>
                            </Grid>
                          </Grid>

                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Button size="small" variant="outlined" startIcon={<InfoOutlinedIcon />} onClick={() => openPackageDrawer(item)}>
                              {t("common.viewDetail")}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<SystemUpdateAltIcon />}
                              disabled={jobRunning || !item.actions.updatable}
                              onClick={() => openUpdatePackagesDialog([item])}
                            >
                              {t("npxSkills.packageUpdateOne")}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon />}
                              disabled={jobRunning || !item.actions.removable}
                              onClick={() => openRemovePackagesDialog([item])}
                            >
                              {t("npxSkills.packageRemoveOne")}
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>{t("npxSkills.packageColumnPackage")}</TableCell>
                        <TableCell>{t("npxSkills.packageColumnCount")}</TableCell>
                        <TableCell>{t("npxSkills.packageColumnSource")}</TableCell>
                        <TableCell>{t("npxSkills.packageColumnCurrent")}</TableCell>
                        <TableCell>{t("npxSkills.packageColumnRemote")}</TableCell>
                        <TableCell>{t("npxSkills.packageColumnStatus")}</TableCell>
                        <TableCell>{t("npxSkills.packageColumnAgents")}</TableCell>
                        <TableCell align="right">{t("npxSkills.packageColumnActions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {packageItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedPackageIds.has(item.id)}
                              onChange={() => togglePackageSelection(item.id)}
                              inputProps={{ "aria-label": t("common.selectItem", { name: item.package_ref }) }}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 260 }}>
                            <Stack spacing={0.6}>
                              <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{item.package_ref}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{item.source_ref}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{item.installed_skill_count}</TableCell>
                          <TableCell><Chip size="small" variant="outlined" label={packageSourceLabel(item, t)} /></TableCell>
                          <TableCell><PackageVersions item={item} t={t} /></TableCell>
                          <TableCell><Typography variant="body2" fontWeight={600}>{item.remote_version ?? t("npxSkills.packageVersionUnknown")}</Typography></TableCell>
                          <TableCell><Chip size="small" color={comparisonColor(item.comparison_status)} variant="outlined" label={comparisonLabel(item.comparison_status, t)} /></TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.agents.length === 0 ? t("npxSkills.noAgents") : item.agents.join(", ")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <Tooltip title={t("common.viewDetail")}><span><IconButton aria-label={t("common.viewDetail")} onClick={() => openPackageDrawer(item)}><InfoOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                            <Tooltip title={t("npxSkills.packageUpdateOne")}><span><IconButton color="warning" aria-label={t("npxSkills.packageUpdateOne")} disabled={jobRunning || !item.actions.updatable} onClick={() => openUpdatePackagesDialog([item])}><SystemUpdateAltIcon fontSize="small" /></IconButton></span></Tooltip>
                            <Tooltip title={t("npxSkills.packageRemoveOne")}><span><IconButton color="error" aria-label={t("npxSkills.packageRemoveOne")} disabled={jobRunning || !item.actions.removable} onClick={() => openRemovePackagesDialog([item])}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : null}

            {packageTotalPages > 1 ? (
              <Stack direction="row" justifyContent="center" sx={{ pt: 0.5 }}>
                <Pagination page={packagePage} count={packageTotalPages} onChange={(_, page) => npxSkillsStore.getState().setPackagePage(page)} />
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
          <Stack spacing={2}>
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <RefreshIcon color="info" />
                        <Typography variant="h6">{t("npxSkills.checkUpdates")}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">{t("npxSkills.runCheckHelp")}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<RefreshIcon />}
                        disabled={packageLoading || installTargetLoading}
                        onClick={refreshRemoteVersions}
                      >
                        {t("npxSkills.checkUpdates")}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SyncAltIcon color="warning" />
                        <Typography variant="h6">{t("npxSkills.updateAll")}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">{t("npxSkills.runUpdateHelp")}</Typography>
                      {packageCapabilities?.update.supported === false && packageCapabilities.update.reason ? (
                        <Typography variant="caption" color="text.secondary">
                          {packageCapabilities.update.reason}
                        </Typography>
                      ) : null}
                      <Box sx={{ flexGrow: 1 }} />
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<SystemUpdateAltIcon />}
                          disabled={jobRunning || !canBulkUpdate}
                          onClick={() => openUpdatePackagesDialog(selectedPackages)}
                        >
                          {t("npxSkills.packageUpdateSelected")}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<SystemUpdateAltIcon />}
                          disabled={jobRunning || packageCapabilities?.update.supported === false}
                          onClick={() => npxSkillsStore.getState().setPendingRunAction({ kind: "update" })}
                        >
                          {t("npxSkills.updateAll")}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {selectedPackages.length > 0 ? (
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<SystemUpdateAltIcon />}
                  disabled={jobRunning || !canBulkUpdate}
                  onClick={() => openUpdatePackagesDialog(selectedPackages)}
                >
                  {t("npxSkills.packageUpdateSelected")}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  disabled={jobRunning || !canBulkRemove}
                  onClick={() => openRemovePackagesDialog(selectedPackages)}
                >
                  {t("npxSkills.packageRemoveSelected")}
                </Button>
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("npxSkills.packageBulkSelectionSummary", {
                    packages: selectedPackages.length,
                    skills: selectedPackageSkillIds.length,
                  })}
                />
              </Stack>
            ) : null}

            {(jobRunning || jobTotal > 0) ? (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                      <Box>
                        <Typography variant="h6">{jobOperationLabel(jobOperation, t)}</Typography>
                        <Typography variant="body2" color="text.secondary">{jobStatusMessage ?? t("npxSkills.jobEmpty")}</Typography>
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
                        label={jobResultLabel(jobResultStatus, t)}
                      />
                    </Box>

                    {runConfigSummary ? (
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip size="small" variant="outlined" label={runConfigSummary.agentsLabel} />
                        <Chip size="small" variant="outlined" label={runConfigSummary.cliModeLabel} />
                        <Chip size="small" variant="outlined" label={runConfigSummary.installTargetLabel} />
                      </Stack>
                    ) : null}

                    <LinearProgress
                      aria-label={t("npxSkills.jobProgressLabel")}
                      variant="determinate"
                      value={Math.max(0, Math.min(100, jobPercent))}
                      sx={{ height: 8, borderRadius: 999 }}
                    />

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip size="small" variant="outlined" label={t("npxSkills.jobCurrent", { completed: jobCompleted, total: jobTotal })} />
                      <Chip size="small" variant="outlined" color="success" label={t("npxSkills.jobSuccess", { count: jobSuccessCount })} />
                      <Chip size="small" variant="outlined" color="error" label={t("npxSkills.jobFailed", { count: jobFailureCount })} />
                    </Stack>

                    {streamDisconnected ? <Alert severity="warning">{t("npxSkills.jobConnectionLost")}</Alert> : null}
                  </Stack>
                </CardContent>
              </Card>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedPackageItem)}
        onClose={closePackageDrawer}
        PaperProps={{ sx: { width: { xs: "100vw", sm: 460 }, p: 2.5 } }}
      >
        {selectedPackageItem ? (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" fontWeight={700}>{selectedPackageItem.package_ref}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, overflowWrap: "anywhere" }}>
                {selectedPackageItem.source_ref}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" variant="outlined" color={comparisonColor(selectedPackageItem.comparison_status)} label={comparisonLabel(selectedPackageItem.comparison_status, t)} />
              <Chip size="small" variant="outlined" label={packageSourceLabel(selectedPackageItem, t)} />
              <Chip size="small" variant="outlined" label={t("npxSkills.packageSkillCount", { count: selectedPackageItem.installed_skill_count })} />
            </Stack>

            <Divider />

            <Stack spacing={1.25}>
              <Typography variant="overline" color="text.secondary">{t("npxSkills.packageDetails")}</Typography>
              <Typography variant="body2">{t("npxSkills.packageVersionCurrentLabel", { value: selectedPackageItem.local_version ?? t("npxSkills.packageVersionUnknown") })}</Typography>
              <Typography variant="body2">{t("npxSkills.packageVersionLatestLabel", { value: selectedPackageItem.remote_version ?? t("npxSkills.packageVersionUnknown") })}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedPackageItem.version_basis}</Typography>
              {selectedPackageItem.checked_at_ms ? <Typography variant="body2">{t("npxSkills.lastCheckedAt", { value: new Date(selectedPackageItem.checked_at_ms).toLocaleString() })}</Typography> : null}
              {selectedPackageItem.installed_at ? <Typography variant="body2">{t("npxSkills.installedAt", { value: formatTimestamp(selectedPackageItem.installed_at) ?? selectedPackageItem.installed_at })}</Typography> : null}
              {selectedPackageItem.updated_at ? <Typography variant="body2">{t("npxSkills.updatedAt", { value: formatTimestamp(selectedPackageItem.updated_at) ?? selectedPackageItem.updated_at })}</Typography> : null}
              {selectedPackageItem.reason ? <Alert severity="info">{selectedPackageItem.reason}</Alert> : null}
            </Stack>

            <Divider />

            <Stack spacing={1.25}>
              <Typography variant="overline" color="text.secondary">{t("npxSkills.packageContainsSkills")}</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {selectedPackageItem.installed_skill_names.map((name) => (
                  <Chip key={name} size="small" label={name} variant="outlined" />
                ))}
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={1.25}>
              <Typography variant="overline" color="text.secondary">{t("npxSkills.installedAgents")}</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {selectedPackageItem.agents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">{t("npxSkills.noAgents")}</Typography>
                ) : (
                  selectedPackageItem.agents.map((agent) => <Chip key={agent} size="small" label={agent} variant="outlined" />)
                )}
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
              <Button variant="outlined" startIcon={<ContentCopyOutlinedIcon />} onClick={() => copyValue(selectedPackageItem.source_ref)}>
                {t("npxSkills.copySourceRef")}
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<SystemUpdateAltIcon />}
                disabled={jobRunning || !selectedPackageItem.actions.updatable}
                onClick={() => {
                  closePackageDrawer();
                  openUpdatePackagesDialog([selectedPackageItem]);
                }}
              >
                {t("npxSkills.packageUpdateOne")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                disabled={jobRunning || !selectedPackageItem.actions.removable}
                onClick={() => {
                  closePackageDrawer();
                  openRemovePackagesDialog([selectedPackageItem]);
                }}
              >
                {t("npxSkills.packageRemoveOne")}
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>
    </Stack>
  );
}
