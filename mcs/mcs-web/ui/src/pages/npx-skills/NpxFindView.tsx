import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import LinkIcon from "@mui/icons-material/Link";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

import type {
  NpxSkillsCatalogItemDto,
  NpxSkillsInstallItemInput,
  NpxSkillsOperation,
  NpxSkillsPackagePreviewDto,
} from "@/types";
import type {
  CatalogSection,
  JobLogEntry,
  JobItemState,
  RunResultStatus,
  TranslationFn,
} from "./types";
import NpxDiscoverActionBar from "./NpxDiscoverActionBar";
import NpxDiscoverSkillCard from "./NpxDiscoverSkillCard";
import { formatCategoryLabel } from "./utils";

export interface NpxFindViewProps {
  t: TranslationFn;
  catalogSearch: string;
  setCatalogSearch: (value: string) => void;
  installedOnly: boolean;
  setInstalledOnly: (value: boolean) => void;
  fetchCatalog: () => void;
  openInstallSelectedDialog: () => void;
  selectedInstallPayload: NpxSkillsInstallItemInput[];
  jobRunning: boolean;
  activityRunId: string | null;
  jobOperation: NpxSkillsOperation | null;
  jobStatusMessage: string | null;
  jobResultStatus: RunResultStatus;
  jobItems: JobItemState[];
  jobCompleted: number;
  jobTotal: number;
  jobSuccessCount: number;
  jobFailureCount: number;
  jobPercent: number;
  streamDisconnected: boolean;
  catalogSections: CatalogSection[];
  activeCatalogAnchorId: string | null;
  setActiveCatalogAnchorId: (value: string | null) => void;
  catalogError: string | null;
  catalogLoading: boolean;
  installTargetLoading: boolean;
  catalogItems: NpxSkillsCatalogItemDto[];
  visibleCatalogItems: NpxSkillsCatalogItemDto[];
  selectedCatalogKeys: Set<string>;
  setSelectedCatalogKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  installTargetScope: string;
  selectedNamesPreview: string[];
  selectedPackageCount: number;
  selectedSkillCount: number;
  installTargetSummary: {
    mode: "global" | "project";
    path: string;
  };
  jobLogEntries: JobLogEntry[];
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
  openRepoForItem: (item: NpxSkillsCatalogItemDto) => void;
  onViewActivity?: (runId: string) => void;
}

const TOP_ANCHOR_ID = "npx-skills-catalog-top";

export default function NpxFindView({
  t,
  catalogSearch,
  setCatalogSearch,
  installedOnly,
  setInstalledOnly,
  fetchCatalog,
  openInstallSelectedDialog,
  selectedInstallPayload,
  jobRunning,
  activityRunId,
  jobOperation,
  jobStatusMessage,
  jobResultStatus,
  jobItems,
  jobCompleted,
  jobTotal,
  jobSuccessCount,
  jobFailureCount,
  jobPercent,
  streamDisconnected,
  catalogSections,
  activeCatalogAnchorId,
  setActiveCatalogAnchorId,
  catalogError,
  catalogLoading,
  installTargetLoading,
  catalogItems,
  visibleCatalogItems,
  selectedCatalogKeys,
  setSelectedCatalogKeys,
  installTargetScope,
  selectedNamesPreview,
  selectedPackageCount,
  selectedSkillCount,
  installTargetSummary,
  jobLogEntries,
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
  openRepoForItem,
  onViewActivity,
}: NpxFindViewProps) {
  const previewedSkills = packagePreview?.skills ?? [];
  const previewSupportsSelection = packagePreview?.mode === "listed_skills";
  const previewSelectionCount = selectedPreviewSkills.size;
  const allPreviewSelected =
    previewSupportsSelection &&
    previewedSkills.length > 0 &&
    previewSelectionCount === previewedSkills.length;
  const runningItem = jobItems.find((item) => item.status === "running") ?? null;
  const totalVisibleCount = useMemo(
    () => catalogSections.reduce((sum, section) => sum + section.count, 0),
    [catalogSections],
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const topAnchorRef = useRef<HTMLDivElement | null>(null);
  const activeAnchorRef = useRef<string | null>(activeCatalogAnchorId);
  activeAnchorRef.current = activeCatalogAnchorId;

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const nextAnchor =
            entry.target.id === TOP_ANCHOR_ID ? null : entry.target.id;
          if (activeAnchorRef.current === nextAnchor) {
            continue;
          }
          activeAnchorRef.current = nextAnchor;
          setActiveCatalogAnchorId(nextAnchor);
        }
      },
      {
        rootMargin: "-16% 0px -68% 0px",
        threshold: [0.15, 0.45, 0.7],
      },
    );

    if (topAnchorRef.current) {
      observer.observe(topAnchorRef.current);
    }
    for (const section of catalogSections) {
      const node = sectionRefs.current[section.anchorId];
      if (node) {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [catalogSections, setActiveCatalogAnchorId]);

  const scrollToAnchor = (anchorId: string | null) => {
    const target =
      anchorId === null
        ? topAnchorRef.current
        : sectionRefs.current[anchorId] ?? document.getElementById(anchorId);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCatalogAnchorId(anchorId);
  };

  return (
    <Stack spacing={2.5} sx={{ pb: { xs: "9.5rem", md: "10.5rem" } }}>
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
                      disabled={jobRunning || (previewSupportsSelection && previewSelectionCount === 0)}
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

      <Stack spacing={0.75}>
        <Typography variant="h6" sx={{ letterSpacing: "-0.03em" }}>
          {t("npxSkills.discoverTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 860 }}>
          {t("npxSkills.discoverSubtitle")}
        </Typography>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.5,
          borderColor: "var(--mcs-workbench-outline)",
          backgroundColor: "var(--mcs-panel-fill)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", xl: "center" }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ minWidth: 0, flexGrow: 1 }}>
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
                sx={{ width: { xs: "100%", md: 360 }, maxWidth: "100%" }}
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
            </Stack>

            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                label={t("npxSkills.discoverVisibleSummary", {
                  skills: totalVisibleCount,
                  categories: catalogSections.length,
                })}
              />
              <Chip
                size="small"
                variant="outlined"
                label={t("npxSkills.catalogSelectionCount", {
                  count: selectedCatalogKeys.size,
                })}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box ref={topAnchorRef} id={TOP_ANCHOR_ID} sx={{ height: 1, mt: "-1px" }} />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "268px minmax(0, 1fr)" } }}>
        <Card
          variant="outlined"
          sx={{
            display: catalogSections.length === 0 && !catalogLoading ? "none" : "block",
            height: "fit-content",
            position: { lg: "sticky" },
            top: { lg: "var(--mcs-sticky-offset)" },
            borderRadius: 3.5,
            borderColor: "var(--mcs-workbench-outline)",
            backgroundColor: "var(--mcs-panel-fill)",
          }}
        >
          <CardContent sx={{ p: 1.25 }}>
            <Stack spacing={0.9}>
              <Typography variant="overline" color="text.secondary">
                {t("common.category")}
              </Typography>
              <ButtonBase
                onClick={() => scrollToAnchor(null)}
                sx={{
                  px: 1.2,
                  py: 1.05,
                  borderRadius: 2.5,
                  justifyContent: "space-between",
                  border: "1px solid",
                  borderColor:
                    activeCatalogAnchorId === null
                      ? "var(--mcs-workbench-outline-strong)"
                      : "var(--mcs-panel-stroke-soft)",
                  backgroundColor:
                    activeCatalogAnchorId === null
                      ? "var(--mcs-workbench-accent-soft)"
                      : "var(--mcs-panel-fill)",
                }}
              >
                {(catalogLoading || installTargetLoading) && catalogItems.length === 0 ? (
                  <>
                    <Box sx={{ textAlign: "left", width: "100%" }}>
                      <Skeleton variant="text" width="55%" />
                      <Skeleton variant="text" width="72%" />
                    </Box>
                    <Skeleton variant="rounded" width={28} height={20} />
                  </>
                ) : (
                  <>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t("common.all")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("npxSkills.discoverJumpAll")}
                      </Typography>
                    </Box>
                    <Chip size="small" variant="outlined" label={totalVisibleCount} />
                  </>
                )}
              </ButtonBase>

              {(catalogLoading || installTargetLoading) && catalogItems.length === 0
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Box
                      key={`catalog-skeleton-${index}`}
                      sx={{
                        px: 1.2,
                        py: 1.05,
                        borderRadius: 2.5,
                        border: "1px solid var(--mcs-panel-stroke-soft)",
                      }}
                    >
                      <Skeleton variant="text" width="35%" />
                      <Skeleton variant="text" width="78%" />
                    </Box>
                  ))
                : catalogSections.map((section) => (
                <ButtonBase
                  key={section.id}
                  onClick={() => scrollToAnchor(section.anchorId)}
                  sx={{
                    px: 1.2,
                    py: 1.05,
                    borderRadius: 2.5,
                    justifyContent: "space-between",
                    border: "1px solid",
                    borderColor:
                      activeCatalogAnchorId === section.anchorId
                        ? "var(--mcs-workbench-outline-strong)"
                        : "var(--mcs-panel-stroke-soft)",
                    backgroundColor:
                      activeCatalogAnchorId === section.anchorId
                        ? "var(--mcs-workbench-accent-soft)"
                        : "var(--mcs-panel-fill)",
                  }}
                >
                  <Box sx={{ textAlign: "left", minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {section.groupLabel}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                    >
                      {formatCategoryLabel(section.slug, section.label)}
                    </Typography>
                  </Box>
                  <Chip size="small" variant="outlined" label={section.count} />
                </ButtonBase>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          {catalogError ? (
            <Alert severity="error">{catalogError}</Alert>
          ) : null}

          {(catalogLoading || installTargetLoading) && catalogItems.length === 0 ? (
            <Stack spacing={2}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={`discover-card-skeleton-${index}`}
                  variant="outlined"
                  sx={{
                    borderRadius: 3.5,
                    borderColor: "var(--mcs-workbench-outline)",
                    backgroundColor: "var(--mcs-panel-fill)",
                  }}
                >
                  <CardContent sx={{ p: 2.25 }}>
                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton variant="rounded" width={88} height={24} />
                        <Skeleton variant="rounded" width={72} height={24} />
                      </Stack>
                      <Skeleton variant="text" width="42%" height={32} />
                      <Skeleton variant="text" width="88%" />
                      <Skeleton variant="text" width="76%" />
                      <Stack direction="row" spacing={0.75}>
                        <Skeleton variant="rounded" width={90} height={24} />
                        <Skeleton variant="rounded" width={82} height={24} />
                        <Skeleton variant="rounded" width={76} height={24} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : visibleCatalogItems.length === 0 ? (
            <Alert severity="info">{t("npxSkills.noCatalogResults")}</Alert>
          ) : (
            catalogSections.map((section, index) => (
              <Stack
                key={section.id}
                spacing={1.5}
                ref={(node: HTMLDivElement | null) => {
                  sectionRefs.current[section.anchorId] = node;
                }}
                id={section.anchorId}
              >
                {index > 0 ? (
                  <Box sx={{ borderTop: "1px dashed var(--mcs-divider-strong)" }} />
                ) : null}

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "flex-end" }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary">
                      {section.groupLabel}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.25, letterSpacing: "-0.03em" }}>
                      {formatCategoryLabel(section.slug, section.label)}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={t("npxSkills.discoverSectionCount", { count: section.count })}
                  />
                </Stack>

                <Stack spacing={1.25}>
                  {section.items.map((item) => {
                    const key = `${item.package_ref}::${item.skill_flag ?? ""}`;
                    const isSelected = selectedCatalogKeys.has(key);
                    const isDisabled = item.project_only && installTargetScope === "global";

                    return (
                      <NpxDiscoverSkillCard
                        key={key}
                        item={item}
                        selected={isSelected}
                        disabled={isDisabled}
                        t={t}
                        onToggle={() => {
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
                        onOpenRepo={() => openRepoForItem(item)}
                        onCopyInstallCommand={(installCommand) => {
                          navigator.clipboard.writeText(installCommand).then(
                            () => showNotification(t("npxSkills.copySuccess"), "success"),
                            () => showNotification(t("npxSkills.copyFailed"), "error"),
                          );
                        }}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            ))
          )}
        </Stack>
      </Box>

      <NpxDiscoverActionBar
        t={t}
        selectedSkillCount={selectedSkillCount}
        selectedPackageCount={selectedPackageCount}
        selectedNamesPreview={selectedNamesPreview}
        installTargetSummary={installTargetSummary}
        installDisabled={jobRunning || selectedInstallPayload.length === 0 || installTargetLoading}
        jobRunning={jobRunning}
        activityRunId={activityRunId}
        jobOperation={jobOperation}
        jobStatusMessage={jobStatusMessage}
        jobResultStatus={jobResultStatus}
        jobCompleted={jobCompleted}
        jobTotal={jobTotal}
        jobSuccessCount={jobSuccessCount}
        jobFailureCount={jobFailureCount}
        jobPercent={jobPercent}
        runningItemLabel={runningItem?.label ?? null}
        streamDisconnected={streamDisconnected}
        jobItems={jobItems}
        jobLogEntries={jobLogEntries}
        onInstall={openInstallSelectedDialog}
        onClearSelection={() => setSelectedCatalogKeys(new Set())}
        onViewActivity={onViewActivity}
      />
    </Stack>
  );
}
