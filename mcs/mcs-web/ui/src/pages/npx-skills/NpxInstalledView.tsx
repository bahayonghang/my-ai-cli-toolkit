import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCapabilitiesDto,
  NpxSkillsInstalledSummaryDto,
} from "@/types";
import { summarizeSkillDescription } from "@/utils/skillDescription";
import type {
  InstalledSourceFilter,
  InstalledTrackingFilter,
  InstalledUpdateFilter,
  TaxonomyGroupSummary,
  TranslationFn,
} from "./types";
import NpxSkillsFilters from "./NpxSkillsFilters";
import { formatCategoryLabel } from "./utils";

export interface NpxInstalledViewProps {
  t: TranslationFn;
  isMobile: boolean;
  installedSearch: string;
  setInstalledSearch: (value: string) => void;
  fetchInstalled: () => void;
  jobRunning: boolean;
  installedItems: NpxInstalledSkillInstanceDto[];
  installedSummary: NpxSkillsInstalledSummaryDto | null;
  selectedInstalledIds: Set<string>;
  setSelectedInstalledIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  openRemoveSelected: () => void;
  openRemoveDialog: (itemIds: string[]) => void;
  openInstalledDetail: (item: NpxInstalledSkillInstanceDto) => void;
  installedGroups: TaxonomyGroupSummary[];
  selectedInstalledCategoryId: string | null;
  setSelectedInstalledCategoryId: (value: string | null) => void;
  installedError: string | null;
  installedErrorHint: string | null;
  installedLoading: boolean;
  installTargetLoading: boolean;
  filteredInstalledTotal: number;
  installedPage: number;
  setInstalledPage: (page: number) => void;
  installedTotalPages: number;
  sourceFilter: InstalledSourceFilter;
  setSourceFilter: (value: InstalledSourceFilter) => void;
  trackingFilter: InstalledTrackingFilter;
  setTrackingFilter: (value: InstalledTrackingFilter) => void;
  updateFilter: InstalledUpdateFilter;
  setUpdateFilter: (value: InstalledUpdateFilter) => void;
  capabilities: NpxSkillsCapabilitiesDto | null;
}

function sourceLabel(item: NpxInstalledSkillInstanceDto, t: TranslationFn) {
  if (item.source.kind === "curated") {
    return t("npxSkills.filterCurated");
  }
  if (item.source.kind === "manual_github") {
    return t("npxSkills.sourceManualGithub");
  }
  if (item.source.kind === "manual_git") {
    return t("npxSkills.sourceManualGit");
  }
  if (item.source.kind === "manual_local") {
    return t("npxSkills.sourceManualLocal");
  }
  return t("npxSkills.sourceManualUnknown");
}

function updateColor(kind: NpxInstalledSkillInstanceDto["update"]["kind"]) {
  switch (kind) {
    case "update_available":
      return "warning" as const;
    case "up_to_date":
      return "success" as const;
    case "unsupported":
      return "default" as const;
    default:
      return "info" as const;
  }
}

export default function NpxInstalledView({
  t,
  isMobile,
  installedSearch,
  setInstalledSearch,
  fetchInstalled,
  jobRunning,
  installedItems,
  installedSummary,
  selectedInstalledIds,
  setSelectedInstalledIds,
  openRemoveSelected,
  openRemoveDialog,
  openInstalledDetail,
  installedGroups,
  selectedInstalledCategoryId,
  setSelectedInstalledCategoryId,
  installedError,
  installedErrorHint,
  installedLoading,
  installTargetLoading,
  filteredInstalledTotal,
  installedPage,
  setInstalledPage,
  installedTotalPages,
  sourceFilter,
  setSourceFilter,
  trackingFilter,
  setTrackingFilter,
  updateFilter,
  setUpdateFilter,
  capabilities,
}: NpxInstalledViewProps) {
  const theme = useTheme();
  const selectedCount = selectedInstalledIds.size;
  const visibleCount = filteredInstalledTotal;
  const showInitialSkeleton = installedLoading && installedItems.length === 0;

  const renderSkeletonCards = () => (
    <Stack spacing={1.5}>
      {Array.from({ length: isMobile ? 4 : 6 }, (_, index) => (
        <Card key={index} variant="outlined">
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Skeleton variant="text" width="38%" height={28} />
            <Skeleton variant="text" width="56%" />
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Skeleton variant="rounded" width={84} height={24} />
              <Skeleton variant="rounded" width={72} height={24} />
              <Skeleton variant="rounded" width={96} height={24} />
            </Stack>
            <Skeleton variant="text" width="88%" />
            <Skeleton variant="text" width="76%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <>
      <Box
        sx={{
          mb: 2.5,
          px: 1.5,
          py: 1.35,
          borderRadius: 3,
          border: "1px solid var(--mcs-workbench-outline)",
          backgroundColor: "var(--mcs-panel-fill-emphasis)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("npxSkills.summaryInstalled")}: {installedSummary?.total ?? installedItems.length} ·{" "}
            {t("npxSkills.summaryCurated")}: {installedSummary?.curated ?? 0} ·{" "}
            {t("npxSkills.summaryManual")}: {installedSummary?.manual ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("npxSkills.inventoryVisible", { count: visibleCount })} ·{" "}
            {t("npxSkills.inventorySelected", { count: selectedCount })}
            {capabilities?.check.supported === false ? ` · ${t("npxSkills.inventoryGlobalOnlyMaintenance")}` : ""}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        <Chip size="small" variant="outlined" label={t("npxSkills.inventoryScopedToCurrentTarget")} />
        <Chip size="small" variant="outlined" label={t("npxSkills.filterTracked")} />
        <Chip
          size="small"
          variant="outlined"
          label={t("npxSkills.summaryUpdates") + ": " + (installedSummary?.update_available ?? 0)}
        />
      </Box>

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
          sx={{ width: 320, maxWidth: "100%" }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="npx-installed-source-filter">{t("npxSkills.filterSource")}</InputLabel>
          <Select
            labelId="npx-installed-source-filter"
            label={t("npxSkills.filterSource")}
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as InstalledSourceFilter)}
          >
            <MenuItem value="all">{t("common.all")}</MenuItem>
            <MenuItem value="curated">{t("npxSkills.filterCurated")}</MenuItem>
            <MenuItem value="manual">{t("npxSkills.filterManual")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="npx-installed-tracking-filter">{t("npxSkills.filterTracking")}</InputLabel>
          <Select
            labelId="npx-installed-tracking-filter"
            label={t("npxSkills.filterTracking")}
            value={trackingFilter}
            onChange={(event) =>
              setTrackingFilter(event.target.value as InstalledTrackingFilter)
            }
          >
            <MenuItem value="all">{t("common.all")}</MenuItem>
            <MenuItem value="tracked">{t("npxSkills.filterTracked")}</MenuItem>
            <MenuItem value="untracked">{t("npxSkills.filterUntracked")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel id="npx-installed-update-filter">{t("npxSkills.filterUpdate")}</InputLabel>
          <Select
            labelId="npx-installed-update-filter"
            label={t("npxSkills.filterUpdate")}
            value={updateFilter}
            onChange={(event) => setUpdateFilter(event.target.value as InstalledUpdateFilter)}
          >
            <MenuItem value="all">{t("common.all")}</MenuItem>
            <MenuItem value="update_available">{t("npxSkills.updateState.update_available")}</MenuItem>
            <MenuItem value="up_to_date">{t("npxSkills.updateState.up_to_date")}</MenuItem>
            <MenuItem value="not_checked">{t("npxSkills.updateState.not_checked")}</MenuItem>
            <MenuItem value="unsupported">{t("npxSkills.updateState.unsupported")}</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void fetchInstalled()}>
          {t("npxSkills.refreshInstalled")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          disabled={jobRunning || selectedCount === 0 || !capabilities?.remove.supported}
          onClick={openRemoveSelected}
        >
          {t("npxSkills.removeSelected")}
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
                groups={installedGroups}
                selectedCategoryId={selectedInstalledCategoryId}
                onCategoryChange={setSelectedInstalledCategoryId}
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
                  groups={installedGroups}
                  selectedCategoryId={selectedInstalledCategoryId}
                  onCategoryChange={setSelectedInstalledCategoryId}
                  t={t}
                />
              </CardContent>
            </Card>
          ) : null}

          {installedError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">{installedError}</Typography>
              {installedErrorHint ? (
                <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
                  {installedErrorHint}
                </Typography>
              ) : null}
            </Alert>
          )}

          {capabilities?.check.supported === false || capabilities?.update.supported === false ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {capabilities.update.reason || capabilities.check.reason}
            </Alert>
          ) : null}

          {(installedLoading || installTargetLoading) && (
            <LinearProgress aria-label={t("common.loading")} sx={{ mb: 2, borderRadius: 999 }} />
          )}

          {showInitialSkeleton ? (
            renderSkeletonCards()
          ) : visibleCount === 0 ? (
            <Alert severity="info">{t("npxSkills.noInstalledResults")}</Alert>
          ) : isMobile ? (
            <Stack spacing={1.5}>
              {installedItems.map((item) => {
                const selected = selectedInstalledIds.has(item.id);
                return (
                  <Card key={item.id} variant="outlined">
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Checkbox
                          checked={selected}
                          disabled={!item.actions.removable}
                          inputProps={{
                            "aria-label": t("common.selectItem", { name: item.name }),
                          }}
                          onChange={() =>
                            setSelectedInstalledIds((previous) => {
                              const next = new Set(previous);
                              if (next.has(item.id)) {
                                next.delete(item.id);
                              } else {
                                next.add(item.id);
                              }
                              return next;
                            })
                          }
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography
                            variant="body1"
                            fontWeight={700}
                            sx={{ cursor: "pointer" }}
                            onClick={() => openInstalledDetail(item)}
                          >
                            {item.name}
                          </Typography>
                          <Box display="flex" gap={0.75} flexWrap="wrap" mt={0.75} mb={1}>
                            <Chip size="small" variant="outlined" label={sourceLabel(item, t)} />
                            <Chip
                              size="small"
                              variant="outlined"
                              label={
                                item.tracking.kind === "tracked"
                                  ? t("npxSkills.filterTracked")
                                  : t("npxSkills.filterUntracked")
                              }
                            />
                            <Chip
                              size="small"
                              color={updateColor(item.update.kind)}
                              variant="outlined"
                              label={t(`npxSkills.updateState.${item.update.kind}`)}
                            />
                            <Chip
                              size="small"
                              variant="outlined"
                              label={formatCategoryLabel(item.category_slug, item.category_label)}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontFamily: 'var(--font-family-mono)',
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.source.display}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, overflowWrap: "anywhere" }}
                          >
                            {summarizeSkillDescription(item.description, "list") || "\u2014"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        color="error"
                        variant="outlined"
                        disabled={!item.actions.removable}
                        onClick={() => openRemoveDialog([item.id])}
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
                      <Box component="th">{t("npxSkills.installedSource")}</Box>
                      <Box component="th">{t("npxSkills.installedCatalogMatch")}</Box>
                      <Box component="th">{t("npxSkills.installedAgents")}</Box>
                      <Box component="th">{t("npxSkills.filterTracking")}</Box>
                      <Box component="th">{t("npxSkills.filterUpdate")}</Box>
                      <Box component="th">{t("common.actions")}</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {installedItems.map((item) => {
                      const selected = selectedInstalledIds.has(item.id);
                      return (
                        <Box component="tr" key={item.id}>
                          <Box component="td">
                            <Checkbox
                              checked={selected}
                              disabled={!item.actions.removable}
                              inputProps={{
                                "aria-label": t("common.selectItem", { name: item.name }),
                              }}
                              onChange={() =>
                                setSelectedInstalledIds((previous) => {
                                  const next = new Set(previous);
                                  if (next.has(item.id)) {
                                    next.delete(item.id);
                                  } else {
                                    next.add(item.id);
                                  }
                                  return next;
                                })
                              }
                            />
                          </Box>
                          <Box component="td">
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ cursor: "pointer", mb: 0.5 }}
                              onClick={() => openInstalledDetail(item)}
                            >
                              {item.name}
                            </Typography>
                            <Box display="flex" gap={0.75} flexWrap="wrap" mt={0.75}>
                              <Chip size="small" variant="outlined" label={sourceLabel(item, t)} />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={formatCategoryLabel(item.category_slug, item.category_label)}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  item.scope === "project"
                                    ? t("installed.installTargetProject")
                                    : t("installed.installTargetGlobal")
                                }
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.9, maxWidth: 300, overflowWrap: "anywhere" }}
                            >
                              {summarizeSkillDescription(item.description, "list") || "\u2014"}
                            </Typography>
                          </Box>
                          <Box component="td">
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'var(--font-family-mono)',
                                color: "text.secondary",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {item.source.display}
                            </Typography>
                          </Box>
                          <Box component="td">
                            {item.catalog_match ? (
                              <Stack spacing={0.5}>
                                <Typography variant="body2" fontWeight={600}>
                                  {item.catalog_match.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.catalog_match.category_label}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {t("npxSkills.installedCatalogMatchNone")}
                              </Typography>
                            )}
                          </Box>
                          <Box component="td">
                            {item.agents.length > 0 ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {item.agents.slice(0, 2).map((agent) => (
                                  <Chip key={agent} size="small" variant="outlined" label={agent} />
                                ))}
                                {item.agents.length > 2 ? (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={t("npxSkills.inventoryMoreAgents", {
                                      count: item.agents.length - 2,
                                    })}
                                  />
                                ) : null}
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {t("npxSkills.noAgents")}
                              </Typography>
                            )}
                          </Box>
                          <Box component="td">
                            <Stack spacing={0.75}>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  item.tracking.kind === "tracked"
                                    ? t("npxSkills.filterTracked")
                                    : t("npxSkills.filterUntracked")
                                }
                                sx={{
                                  backgroundColor:
                                    item.tracking.kind === "tracked"
                                      ? alpha(theme.palette.success.main, 0.08)
                                      : alpha(theme.palette.warning.main, 0.08),
                                }}
                              />
                              {item.tracking.source_type ? (
                                <Typography variant="caption" color="text.secondary">
                                  {item.tracking.source_type}
                                </Typography>
                              ) : null}
                            </Stack>
                          </Box>
                          <Box component="td">
                            <Stack spacing={0.75}>
                              <Chip
                                size="small"
                                color={updateColor(item.update.kind)}
                                variant="outlined"
                                label={t(`npxSkills.updateState.${item.update.kind}`)}
                              />
                              {item.update.reason ? (
                                <Typography variant="caption" color="text.secondary">
                                  {item.update.reason}
                                </Typography>
                              ) : null}
                            </Stack>
                          </Box>
                          <Box component="td">
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="outlined" onClick={() => openInstalledDetail(item)}>
                                {t("common.viewDetail")}
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                disabled={!item.actions.removable}
                                onClick={() => openRemoveDialog([item.id])}
                              >
                                {t("common.uninstall")}
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Card>
          )}

          {visibleCount > 0 && installedTotalPages > 1 ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("npxSkills.inventoryVisible", { count: visibleCount })}
              </Typography>
              <Pagination
                color="primary"
                count={installedTotalPages}
                page={installedPage}
                onChange={(_, page) => setInstalledPage(page)}
                shape="rounded"
                siblingCount={isMobile ? 0 : 1}
                size={isMobile ? "small" : "medium"}
              />
            </Stack>
          ) : null}
        </Box>
      </Box>
    </>
  );
}
