import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import LinkIcon from "@mui/icons-material/Link";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

import { SelectableSurfaceCard } from "@/components/common/SelectableSurfaceCard";
import type {
  NpxSkillsCatalogItemDto,
  NpxSkillsInstallItemInput,
  NpxSkillsOperation,
  NpxSkillsPackagePreviewDto,
} from "@/types";
import { summarizeSkillDescription } from "@/utils/skillDescription";
import type { JobItemState, RunResultStatus, TaxonomyGroupSummary, TranslationFn } from "./types";
import { buildInstallKey, formatCategoryLabel, installStatusColor, operationLabel } from "./utils";
import NpxSkillsFilters from "./NpxSkillsFilters";

export interface NpxFindViewProps {
  t: TranslationFn;
  isMobile: boolean;
  catalogSearch: string;
  setCatalogSearch: (value: string) => void;
  installedOnly: boolean;
  setInstalledOnly: (value: boolean) => void;
  fetchCatalog: () => void;
  openInstallSelectedDialog: () => void;
  selectedInstallPayload: NpxSkillsInstallItemInput[];
  jobRunning: boolean;
  jobOperation: NpxSkillsOperation | null;
  jobStatusMessage: string | null;
  jobResultStatus: RunResultStatus;
  jobItems: JobItemState[];
  jobCompleted: number;
  jobTotal: number;
  jobSuccessCount: number;
  jobFailureCount: number;
  jobPercent: number;
  jobId: string | null;
  streamDisconnected: boolean;
  catalogGroups: TaxonomyGroupSummary[];
  selectedCatalogCategoryId: string | null;
  setSelectedCatalogCategoryId: (value: string | null) => void;
  catalogError: string | null;
  catalogLoading: boolean;
  installTargetLoading: boolean;
  catalogItems: NpxSkillsCatalogItemDto[];
  visibleCatalogItems: NpxSkillsCatalogItemDto[];
  selectedCatalogKeys: Set<string>;
  setSelectedCatalogKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  installTargetScope: string;
  showNotification: (message: string, severity: "success" | "error" | "warning" | "info") => void;
  packagePreviewInput: string;
  setPackagePreviewInput: (value: string) => void;
  packagePreviewLoading: boolean;
  packagePreviewError: string | null;
  packagePreview: NpxSkillsPackagePreviewDto | null;
  selectedPreviewSkills: Set<string>;
  setSelectedPreviewSkills: React.Dispatch<React.SetStateAction<Set<string>>>;
  previewPackage: () => void;
  installPreviewSelection: () => void;
  openPackagePreviewForItem: (item: NpxSkillsCatalogItemDto) => void;
}

export default function NpxFindView({
  t,
  isMobile,
  catalogSearch,
  setCatalogSearch,
  installedOnly,
  setInstalledOnly,
  fetchCatalog,
  openInstallSelectedDialog,
  selectedInstallPayload,
  jobRunning,
  jobOperation,
  jobStatusMessage,
  jobResultStatus,
  jobItems,
  jobCompleted,
  jobTotal,
  jobSuccessCount,
  jobFailureCount,
  jobPercent,
  jobId,
  streamDisconnected,
  catalogGroups,
  selectedCatalogCategoryId,
  setSelectedCatalogCategoryId,
  catalogError,
  catalogLoading,
  installTargetLoading,
  catalogItems,
  visibleCatalogItems,
  selectedCatalogKeys,
  setSelectedCatalogKeys,
  installTargetScope,
  showNotification,
  packagePreviewInput,
  setPackagePreviewInput,
  packagePreviewLoading,
  packagePreviewError,
  packagePreview,
  selectedPreviewSkills,
  setSelectedPreviewSkills,
  previewPackage,
  installPreviewSelection,
  openPackagePreviewForItem,
}: NpxFindViewProps) {
  const previewedSkills = packagePreview?.skills ?? [];
  const previewSupportsSelection = packagePreview?.mode === "listed_skills";
  const previewSelectionCount = selectedPreviewSkills.size;
  const allPreviewSelected =
    previewSupportsSelection &&
    previewedSkills.length > 0 &&
    previewSelectionCount === previewedSkills.length;
  const runningItem = jobItems.find((item) => item.status === "running") ?? null;
  const showJobProgress = jobRunning || jobTotal > 0 || jobResultStatus !== "idle";
  const progressValue = Math.max(0, Math.min(100, jobPercent));
  const statusSeverity =
    jobResultStatus === "success"
      ? "success"
      : jobResultStatus === "warning"
        ? "warning"
        : jobResultStatus === "error" || jobResultStatus === "interrupted"
          ? "error"
          : jobResultStatus === "running"
            ? "info"
            : null;
  const statusLabel =
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
              : null;

  return (
    <Stack spacing={2.5}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.5,
          borderColor: "var(--mcs-workbench-outline-strong)",
          background:
            "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill) 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" sx={{ color: "var(--mcs-workbench-muted)" }}>
                  {t("npxSkills.sectionInstallFromRepo")}
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.45, letterSpacing: "-0.03em" }}>
                  {t("npxSkills.repoInstallTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 780 }}>
                  {t("npxSkills.repoInstallSubtitle")}
                </Typography>
              </Box>
              <Chip
                size="small"
                variant="outlined"
                color="info"
                label={t("npxSkills.repoInstallChip")}
              />
            </Stack>

            {showJobProgress ? (
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid var(--mcs-workbench-outline)",
                  background: "var(--mcs-workbench-surface-strong)",
                  p: { xs: 1.5, md: 1.75 },
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {jobOperation ? operationLabel(jobOperation, t) : t("npxSkills.operationInstall")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {jobStatusMessage ?? t("npxSkills.jobEmpty")}
                      </Typography>
                    </Box>
                    {statusLabel ? (
                      <Chip size="small" color={statusSeverity ?? "default"} label={statusLabel} />
                    ) : null}
                  </Stack>

                  <LinearProgress
                    aria-label={
                      jobOperation
                        ? `${operationLabel(jobOperation, t)} ${t("npxSkills.jobProgressLabel")}`
                        : t("npxSkills.jobProgressLabel")
                    }
                    variant="determinate"
                    value={progressValue}
                    sx={{ height: 8, borderRadius: 999 }}
                  />

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip size="small" variant="outlined" label={t("npxSkills.jobCurrent", { completed: jobCompleted, total: jobTotal })} />
                    <Chip size="small" variant="outlined" label={`${Math.round(progressValue)}%`} />
                    <Chip size="small" color="success" variant="outlined" label={t("npxSkills.jobSuccess", { count: jobSuccessCount })} />
                    <Chip size="small" color="error" variant="outlined" label={t("npxSkills.jobFailed", { count: jobFailureCount })} />
                    {jobId ? <Chip size="small" variant="outlined" label={`Job: ${jobId}`} /> : null}
                  </Stack>

                  {runningItem ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("npxSkills.itemStatusRunning")}: {runningItem.label}
                    </Typography>
                  ) : null}

                  {streamDisconnected ? (
                    <Alert severity="warning">{t("npxSkills.jobConnectionLost")}</Alert>
                  ) : null}
                </Stack>
              </Box>
            ) : null}

            <Stack direction={{ xs: "column", lg: "row" }} spacing={1.25}>
              <TextField
                label={t("npxSkills.packageRef")}
                placeholder={t("npxSkills.packageRefPlaceholder")}
                value={packagePreviewInput}
                onChange={(event) => setPackagePreviewInput(event.target.value)}
                fullWidth
                disabled={jobRunning || packagePreviewLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="outlined"
                startIcon={packagePreviewLoading ? <CircularProgress size={16} /> : <TravelExploreIcon />}
                onClick={previewPackage}
                disabled={jobRunning || packagePreviewLoading || !packagePreviewInput.trim()}
                sx={{ minWidth: { xs: "100%", lg: 190 } }}
              >
                {t("npxSkills.previewRepo")}
              </Button>
            </Stack>

            {packagePreviewError ? (
              <Alert severity="error">{packagePreviewError}</Alert>
            ) : null}

            {packagePreview ? (
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid var(--mcs-workbench-outline)",
                  background: "var(--mcs-workbench-surface-strong)",
                  p: { xs: 1.5, md: 1.75 },
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", lg: "center" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {t("npxSkills.repoPreviewTitle")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.4, overflowWrap: "anywhere" }}
                      >
                        {packagePreview.source_ref}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t("npxSkills.repoPreviewPackage", {
                          packageRef: packagePreview.package_ref,
                        })}
                      />
                      <Chip
                        size="small"
                        color={previewSupportsSelection ? "success" : "warning"}
                        variant="outlined"
                        label={
                          previewSupportsSelection
                            ? t("npxSkills.repoPreviewSkillCount", {
                                count: previewedSkills.length,
                              })
                            : t("npxSkills.repoPreviewPackageOnly")
                        }
                      />
                    </Stack>
                  </Stack>

                  {packagePreview.fallback_reason ? (
                    <Alert severity="info">{packagePreview.fallback_reason}</Alert>
                  ) : null}

                  {previewSupportsSelection ? (
                    <>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setSelectedPreviewSkills(new Set(previewedSkills.map((skill) => skill.name)))
                          }
                          disabled={jobRunning || previewedSkills.length === 0 || allPreviewSelected}
                        >
                          {t("npxSkills.selectAllPreviewed")}
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setSelectedPreviewSkills(new Set())}
                          disabled={jobRunning || previewSelectionCount === 0}
                        >
                          {t("npxSkills.clearPreviewSelection")}
                        </Button>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={t("common.selectedCount", { count: previewSelectionCount })}
                        />
                      </Stack>

                      <List dense disablePadding sx={{ borderRadius: 2.5, overflow: "hidden" }}>
                        {previewedSkills.map((skill) => {
                          const selected = selectedPreviewSkills.has(skill.name);
                          return (
                            <ListItemButton
                              key={skill.name}
                              selected={selected}
                              onClick={() =>
                                setSelectedPreviewSkills((previous) => {
                                  const next = new Set(previous);
                                  if (next.has(skill.name)) {
                                    next.delete(skill.name);
                                  } else {
                                    next.add(skill.name);
                                  }
                                  return next;
                                })
                              }
                              sx={{
                                mb: 0.75,
                                borderRadius: 2,
                                border: "1px solid var(--mcs-workbench-outline)",
                                alignItems: "flex-start",
                              }}
                            >
                              <Checkbox checked={selected} tabIndex={-1} sx={{ mt: -0.5 }} />
                              <ListItemText
                                primary={skill.name}
                                secondary={
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    sx={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {skill.description ?? t("npxSkills.noDescription")}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </>
                  ) : null}

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <Button
                      variant="contained"
                      startIcon={<InstallDesktopIcon />}
                      disabled={
                        jobRunning ||
                        (previewSupportsSelection && previewSelectionCount === 0)
                      }
                      onClick={installPreviewSelection}
                    >
                      {previewSupportsSelection
                        ? t("npxSkills.installSelectedFromRepo")
                        : t("npxSkills.installPackage")}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="overline" sx={{ color: "var(--mcs-workbench-muted)" }}>
          {t("npxSkills.sectionDiscover")}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.45, letterSpacing: "-0.03em" }}>
          {t("npxSkills.discoverTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820 }}>
          {t("npxSkills.discoverSubtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
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
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void fetchCatalog()}
        >
          {t("npxSkills.refreshCatalog")}
        </Button>
        <Chip
          size="small"
          variant="outlined"
          label={t("npxSkills.catalogSelectionCount", {
            count: selectedCatalogKeys.size,
          })}
        />
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
            sx={{ width: 280, flexShrink: 0, position: "sticky", top: "var(--mcs-sticky-offset)" }}
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
          {isMobile ? (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <NpxSkillsFilters
                  groups={catalogGroups}
                  selectedCategoryId={selectedCatalogCategoryId}
                  onCategoryChange={setSelectedCatalogCategoryId}
                  t={t}
                />
              </CardContent>
            </Card>
          ) : null}

          {catalogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {catalogError}
            </Alert>
          )}

          {(catalogLoading || installTargetLoading) && (
            <LinearProgress aria-label={t("common.loading")} sx={{ mb: 2, borderRadius: 999 }} />
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
                const isDisabled = item.project_only && installTargetScope === "global";
                const installCommand = item.skill_flag
                  ? `npx skills add ${item.package_ref} --skill ${item.skill_flag}`
                  : `npx skills add ${item.package_ref}`;

                return (
                  <Grid key={key} size={{ xs: 12, sm: 6, xl: 4 }}>
                    <SelectableSurfaceCard
                      selected={isSelected}
                      disabled={isDisabled}
                      onSelect={() => {
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
                      selectionLabel={t("common.selectItem", { name: item.name })}
                      selectedLabel={t("common.selected")}
                      title={item.name}
                      subtitle={item.package_ref}
                      badges={
                        <>
                          <Chip
                            size="small"
                            color={installStatusColor(item.installed_state)}
                            variant="outlined"
                            label={
                              item.installed_state === "installed"
                                ? t("status.installed")
                                : t("status.notInstalled")
                            }
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={formatCategoryLabel(item.category_slug, item.category_label)}
                          />
                          <Chip size="small" variant="outlined" label={item.install_provider} />
                          {item.project_only ? (
                            <Chip
                              size="small"
                              color="warning"
                              variant="outlined"
                              label={t("npxSkills.projectOnly")}
                            />
                          ) : null}
                        </>
                      }
                      description={
                        <Typography
                          variant="body2"
                          color="inherit"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "4.2em",
                          }}
                        >
                          {summarizeSkillDescription(item.description, "list") ||
                            t("npxSkills.noDescription")}
                        </Typography>
                      }
                      meta={
                        item.usage ? (
                          <Typography variant="caption" sx={{ color: "info.main" }}>
                            {item.usage}
                          </Typography>
                        ) : null
                      }
                      footer={
                        <Stack spacing={1.25}>
                          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                            {isDisabled ? t("npxSkills.projectOnly") : installCommand}
                          </Typography>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<TravelExploreIcon />}
                              onClick={() => openPackagePreviewForItem(item)}
                            >
                              {t("npxSkills.openRepoInstall")}
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<ContentCopyIcon />}
                              onClick={() => {
                                navigator.clipboard.writeText(installCommand).then(
                                  () => showNotification(t("npxSkills.copySuccess"), "success"),
                                  () => showNotification(t("npxSkills.copyFailed"), "error"),
                                );
                              }}
                            >
                              {t("npxSkills.copyInstallCommand")}
                            </Button>
                          </Stack>
                        </Stack>
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </Stack>
  );
}
