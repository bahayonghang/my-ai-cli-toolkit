import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,

  LinearProgress,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  useTheme,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import type { NpxInstalledSkillDto } from "@/types";
import type { TaxonomyGroupSummary, TranslationFn } from "./types";
import NpxSkillsFilters from "./NpxSkillsFilters";

export interface NpxInstalledViewProps {
  t: TranslationFn;
  isMobile: boolean;
  installedSearch: string;
  setInstalledSearch: (value: string) => void;
  fetchInstalled: () => void;
  jobRunning: boolean;
  installedItems: NpxInstalledSkillDto[];
  selectedInstalledNames: Set<string>;
  setSelectedInstalledNames: React.Dispatch<React.SetStateAction<Set<string>>>;
  openRemoveSelected: () => void;
  openRemoveDialog: (names: string[]) => void;
  installedGroups: TaxonomyGroupSummary[];
  selectedInstalledCategoryId: string | null;
  setSelectedInstalledCategoryId: (value: string | null) => void;
  installedError: string | null;
  installedLoading: boolean;
  installTargetLoading: boolean;
  visibleInstalledItems: NpxInstalledSkillDto[];
}

export default function NpxInstalledView({
  t,
  isMobile,
  installedSearch,
  setInstalledSearch,
  fetchInstalled,
  jobRunning,
  installedItems,
  selectedInstalledNames,
  setSelectedInstalledNames,
  openRemoveSelected,
  openRemoveDialog,
  installedGroups,
  selectedInstalledCategoryId,
  setSelectedInstalledCategoryId,
  installedError,
  installedLoading,
  installTargetLoading,
  visibleInstalledItems,
}: NpxInstalledViewProps) {
  const theme = useTheme();

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
            <LinearProgress aria-label="loading" sx={{ mb: 2, borderRadius: 999 }} />
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
                        {item.description ?? "\u2014"}
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
                          {item.description ?? "\u2014"}
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
}
