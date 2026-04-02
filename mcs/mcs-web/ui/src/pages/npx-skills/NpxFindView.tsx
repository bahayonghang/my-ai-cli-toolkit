import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";

import { SelectableSurfaceCard } from "@/components/common/SelectableSurfaceCard";
import type { NpxSkillsCatalogItemDto, NpxSkillsInstallItemInput } from "@/types";
import { summarizeSkillDescription } from "@/utils/skillDescription";
import type { TaxonomyGroupSummary, TranslationFn } from "./types";
import { buildInstallKey, installStatusColor } from "./utils";
import NpxSkillsFilters from "./NpxSkillsFilters";

export interface NpxFindViewProps {
  t: TranslationFn;
  isMobile: boolean;
  catalogSearch: string;
  setCatalogSearch: (value: string) => void;
  installedOnly: boolean;
  setInstalledOnly: (value: boolean) => void;
  setFiltersOpen: (value: boolean) => void;
  fetchCatalog: () => void;
  openQuickInstallDialog: () => void;
  openInstallSelectedDialog: () => void;
  selectedInstallPayload: NpxSkillsInstallItemInput[];
  jobRunning: boolean;
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
}

export default function NpxFindView({
  t,
  isMobile,
  catalogSearch,
  setCatalogSearch,
  installedOnly,
  setInstalledOnly,
  setFiltersOpen: _setFiltersOpen,
  fetchCatalog,
  openQuickInstallDialog,
  openInstallSelectedDialog,
  selectedInstallPayload,
  jobRunning,
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
}: NpxFindViewProps) {
  return (
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
                  <Grid key={key} size={{ xs: 12, sm: 6, lg: 4 }}>
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
                          <Chip size="small" variant="outlined" label={item.category_label} />
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
                        <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                            {isDisabled ? t("npxSkills.projectOnly") : installCommand}
                          </Typography>
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
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
}
