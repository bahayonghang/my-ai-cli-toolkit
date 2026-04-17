import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ExtensionOffIcon from "@mui/icons-material/ExtensionOff";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import TerminalIcon from "@mui/icons-material/Terminal";
import { installSkills, uninstallSkills } from "@/api/client";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import {
  AppShell,
  ListSurface,
  MobileFilterButton,
  PlatformShellIdentity,
  ResponsiveFilterRail,
} from "@/components/shell/AppShell";
import { useI18n } from "@/i18n";
import { usePlatformItemsData } from "@/hooks/usePlatformItemsData";
import { usePlatformStore } from "@/stores/platformStore";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useUiStore } from "@/stores/uiStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { buildActivityRunPath } from "@/utils/activityNavigation";
import { summarizeSkillDescription } from "@/utils/skillDescription";
import PageLoadingState from "@/components/common/PageLoadingState";

const SkillEditorDrawer = lazy(() =>
  import("@/components/dialogs/SkillEditorDrawer").then((module) => ({
    default: module.SkillEditorDrawer,
  })),
);

export default function InstalledSkillsPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigateDeferred = useNavigateDeferred();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const platform = usePlatformStore((state) =>
    state.platforms.find((entry) => entry.id === platformId),
  );
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const showNotification = useUiStore((state) => state.showNotification);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [editName, setEditName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);
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
  } = useInstallTarget(platformId);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    setSearch("");
    setSelectedCategory(null);
  }, [platformId]);

  useEffect(() => {
    if (!isMobile) {
      setFilterDrawerOpen(false);
    }
  }, [isMobile]);

  const installTargetBlocked = Boolean(resolutionError);
  const { items, categories, loading, error, refresh } = usePlatformItemsData({
    platformId,
    enabled: Boolean(resolvedTarget) && !installTargetLoading && !installTargetBlocked,
    activeTab: "skills",
    itemTypeOverride: "skill",
    search: debouncedSearch,
    selectedCategory,
    statusFilter: "installed",
    installTarget,
  });

  const handleDelete = async () => {
    if (!platformId || !deleteName) {
      return;
    }

    const nameToDelete = deleteName;
    setDeleteName(null);

    try {
      const result = await uninstallSkills(platformId, [nameToDelete], installTarget);
      showNotification(
        t("installed.uninstalledNotification", { name: nameToDelete }),
        "success",
        result.run_id
          ? {
              label: t("activity.viewRun"),
              onClick: () => navigateDeferred(buildActivityRunPath(result.run_id!, platformId)),
            }
          : undefined,
      );
      await refresh();
    } catch (errorValue) {
      showNotification((errorValue as Error).message, "error");
    }
  };

  const handleReinstall = async (name: string) => {
    if (!platformId) {
      return;
    }

    try {
      const result = await installSkills(platformId, [name], "auto", installTarget);
      showNotification(
        t("installed.reinstalledNotification", { name }),
        "success",
        result.run_id
          ? {
              label: t("activity.viewRun"),
              onClick: () => navigateDeferred(buildActivityRunPath(result.run_id!, platformId)),
            }
          : undefined,
      );
      await refresh();
    } catch (errorValue) {
      showNotification(
        t("installed.reinstallFailed", {
          error: (errorValue as Error).message,
        }),
        "error",
      );
    }
  };

  const skillCategories = useMemo(
    () => categories.map((category) => category.name),
    [categories],
  );
  const activeFilterLabel = selectedCategory
    ? t("installed.activeFilter", { category: selectedCategory })
    : null;
  const pageLoading = loading && items.length === 0;
  const showInlineProgress =
    (loading && items.length > 0) || installTargetLoading;
  const installTargetPath = resolvedTarget?.skills_path
    ?? (installTargetBlocked
      ? t("installed.installTargetUnavailable")
      : t("installed.installTargetLoading"));
  const installTargetLabel = t("installed.installTargetChip", {
    mode:
      installTarget.scope === "project"
        ? t("installed.installTargetProject")
        : t("installed.installTargetGlobal"),
    path: installTargetPath,
  });

  return (
    <AppShell
      variant="workbench"
      title={
        <PlatformShellIdentity
          platformId={platform?.id ?? platformId}
          name={platform?.name ?? platformId ?? t("common.unknown")}
          fallbackIcon={platform?.icon}
          subtitle={t("common.skills")}
        />
      }
      pageHeading={t("installed.workspaceTitle", {
        platform: platform?.name ?? platformId ?? t("common.unknown"),
      })}
      subtitle={installTargetLabel}
      onBack={() => navigateDeferred("/")}
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          {isMobile ? (
            <MobileFilterButton onClick={() => setFilterDrawerOpen(true)} />
          ) : null}
          <Chip
            icon={<FolderOpenOutlinedIcon />}
            variant="outlined"
            color="info"
            clickable
            aria-label={t("common.installTarget")}
            onClick={openInstallTargetDialog}
            label={installTargetLabel}
            sx={{
              maxWidth: { xs: 220, sm: 420 },
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<TerminalIcon />}
            onClick={() =>
              navigateDeferred(`/npx-skills?workspace=${encodeURIComponent(platformId ?? "")}`)
            }
          >
            {t("installed.openRegistry")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigateDeferred(`/platform/${platformId}/install`)}
          >
            {t("installed.installSkills")}
          </Button>
        </>
      }
      filterRail={
        <ResponsiveFilterRail
          title={t("installed.categories")}
          sections={[
            {
              id: "installed-filters",
              content: (
                <InstalledFilters
                  categories={skillCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  t={t}
                />
              ),
            },
          ]}
        />
      }
    >
      {isMobile ? (
        <ResponsiveFilterRail
          title={t("installed.categories")}
          mobileOpen={filterDrawerOpen}
          onCloseMobile={() => setFilterDrawerOpen(false)}
          sections={[
            {
              id: "installed-filters-mobile",
              content: (
                <InstalledFilters
                  categories={skillCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(value) => {
                    setSelectedCategory(value);
                    setFilterDrawerOpen(false);
                  }}
                  t={t}
                />
              ),
            },
          ]}
        />
      ) : null}

      <Stack spacing={2.5}>
        <ListSurface tone="workbench">
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", lg: "center" }}
          >
            <TextField
              label={t("installed.searchLabel")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: "100%", lg: 360 } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              {t("installed.filteredSummary", { count: items.length })} ·{" "}
              {t("installed.categoriesSummary", {
                count: skillCategories.length,
              })}
              {activeFilterLabel ? ` · ${activeFilterLabel}` : ""}
            </Typography>
            {search || selectedCategory ? (
              <Button
                variant="text"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                }}
              >
                {t("installed.clearFilters")}
              </Button>
            ) : null}
          </Stack>
        </ListSurface>

        {installTargetBlocked ? (
          <Alert severity="error">{resolutionError}</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {showInlineProgress ? <LinearProgress /> : null}

        {pageLoading ? (
          <PageLoadingState message={t("common.loading")} minHeight={320} />
        ) : items.length === 0 ? (
          <ListSurface tone="workbench">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 10,
                gap: 2,
                textAlign: "center",
              }}
            >
              <ExtensionOffIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h6" color="text.secondary">
                {t("installed.emptyTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("installed.emptyDescription")}
              </Typography>
            </Box>
          </ListSurface>
        ) : isMobile ? (
          <Stack spacing={1.25}>
            {items.map((item) => (
              <ListSurface key={item.name} tone="workbench">
                <Stack spacing={1.5}>
                  <Box>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mb: 0.75 }}>
                      <Typography variant="subtitle1" sx={{ wordBreak: "break-word" }}>
                        {item.name}
                      </Typography>
                      {item.category ? (
                        <Chip size="small" label={item.category} variant="outlined" />
                      ) : null}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                      {summarizeSkillDescription(item.description, "list") ||
                        t("common.noDescriptionAvailable")}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditName(item.name)}>
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<SystemUpdateAltIcon />}
                      onClick={() => handleReinstall(item.name)}
                    >
                      {t("common.reinstall")}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => setDeleteName(item.name)}
                    >
                      {t("common.uninstall")}
                    </Button>
                  </Stack>
                </Stack>
              </ListSurface>
            ))}
          </Stack>
        ) : (
          <ListSurface tone="workbench" padded={false}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("common.name")}</TableCell>
                    <TableCell>{t("common.category")}</TableCell>
                    <TableCell>{t("common.description")}</TableCell>
                    <TableCell align="right">{t("common.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.name} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={item.category ?? "—"} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {summarizeSkillDescription(item.description, "list") ||
                            t("common.noDescriptionAvailable")}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton color="primary" aria-label={`${t("common.edit")} ${item.name}`} onClick={() => setEditName(item.name)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton color="warning" aria-label={`${t("common.reinstall")} ${item.name}`} onClick={() => handleReinstall(item.name)}>
                            <SystemUpdateAltIcon fontSize="small" />
                          </IconButton>
                          <IconButton color="error" aria-label={`${t("common.uninstall")} ${item.name}`} onClick={() => setDeleteName(item.name)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ListSurface>
        )}
      </Stack>

      {platformId && editName ? (
        <Suspense fallback={null}>
          <SkillEditorDrawer
            open
            platformId={platformId}
            skillName={editName}
            onClose={() => setEditName(null)}
            onSaved={() => {
              showNotification(
                t("installed.savedNotification", { name: editName }),
                "success",
              );
              setEditName(null);
              void refresh();
            }}
          />
        </Suspense>
      ) : null}

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={applyInstallTarget}
      />

      <ConfirmDialog
        open={deleteName !== null}
        title={t("installed.uninstallSkillTitle")}
        message={t("installed.uninstallSkillMessage", {
          name: deleteName ?? "",
          platform: platform?.name ?? platformId ?? "",
        })}
        confirmLabel={t("common.uninstall")}
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteName(null)}
      />

      <NotificationSnackbar />
    </AppShell>
  );
}

function InstalledFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  t,
}: {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <Box>
      <List dense disablePadding>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
          sx={{ minHeight: 44 }}
        >
          <ListItemText primary={t("installed.allSkills")} />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        {categories.map((category) => (
          <ListItemButton
            key={category}
            selected={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
            sx={{ minHeight: 44 }}
          >
            <ListItemText primary={category} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
