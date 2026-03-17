import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
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
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ExtensionOffIcon from "@mui/icons-material/ExtensionOff";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import TuneIcon from "@mui/icons-material/Tune";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import TerminalIcon from "@mui/icons-material/Terminal";
import { installSkills, uninstallSkills } from "@/api/client";
import { useI18n } from "@/i18n";
import { usePlatformItemsData } from "@/hooks/usePlatformItemsData";
import { usePlatformStore } from "@/stores/platformStore";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useUiStore } from "@/stores/uiStore";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useInstallTarget } from "@/hooks/useInstallTarget";

const SkillEditorDrawer = lazy(() =>
  import("@/components/dialogs/SkillEditorDrawer").then((module) => ({
    default: module.SkillEditorDrawer,
  }))
);

export default function InstalledSkillsPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigateDeferred = useNavigateDeferred();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const platform = usePlatformStore((state) =>
    state.platforms.find((entry) => entry.id === platformId)
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

  const {
    items,
    categories,
    loading,
    error,
    refresh,
  } = usePlatformItemsData({
    platformId,
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
      await uninstallSkills(platformId, [nameToDelete], installTarget);
      showNotification(
        t("installed.uninstalledNotification", { name: nameToDelete }),
        "success"
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
      await installSkills(platformId, [name], "auto", installTarget);
      showNotification(
        t("installed.reinstalledNotification", { name }),
        "success"
      );
      await refresh();
    } catch (errorValue) {
      showNotification(
        t("installed.reinstallFailed", { error: (errorValue as Error).message }),
        "error"
      );
    }
  };

  const skillCategories = useMemo(
    () =>
      categories
        .map((category) => category.name),
    [categories]
  );

  const pageLoading = loading && items.length === 0;
  const showInlineProgress = (loading && items.length > 0) || installTargetLoading;

  return (
    <Box component="main" sx={{ minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar sx={{ gap: 0.5, flexWrap: { xs: "wrap", lg: "nowrap" }, alignItems: "center" }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label={t("common.openFilters")}
              onClick={() => setFilterDrawerOpen(true)}
            >
              <TuneIcon />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            aria-label={t("common.back")}
            onClick={() => navigateDeferred("/")}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label={t("common.home")}
            onClick={() => navigateDeferred("/")}
          >
            <HomeIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {platform?.icon} {platform?.name ?? platformId}
            </Typography>
            <Chip
              icon={<FolderOpenOutlinedIcon />}
              variant="outlined"
              color="info"
              clickable
              aria-label={t("common.installTarget")}
              onClick={openInstallTargetDialog}
              label={t("installed.installTargetChip", {
                mode:
                  installTarget.scope === "project"
                    ? t("installed.installTargetProject")
                    : t("installed.installTargetGlobal"),
                path:
                  resolvedTarget?.skills_path ??
                  t("installed.installTargetLoading"),
              })}
              sx={{
                maxWidth: { xs: 220, sm: 360 },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<TerminalIcon />}
            onClick={() => navigateDeferred(`/platform/${platformId}/npx-skills`)}
            sx={{ mr: 1 }}
          >
            {t("npxSkills.pageButton")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigateDeferred(`/platform/${platformId}/install`)}
          >
            {t("installed.installSkills")}
          </Button>
          <LanguageToggle />
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          anchor="left"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { width: 300, p: 2 } }}
        >
          <InstalledFilters
            categories={skillCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setFilterDrawerOpen(false);
            }}
            t={t}
          />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pt: 11,
          pb: 4,
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {!isMobile && (
          <Card sx={{ width: 280, flexShrink: 0, position: "sticky", top: 96 }}>
            <CardContent sx={{ p: 2 }}>
              <InstalledFilters
                categories={skillCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                t={t}
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", lg: "center" }}
            sx={{ mb: 2 }}
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
            <Box sx={{ flexGrow: 1 }} />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {showInlineProgress && <LinearProgress sx={{ mb: 2 }} />}

          {pageLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            /* Empty state */
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 12,
                gap: 2,
              }}
            >
              <ExtensionOffIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h6" color="text.secondary">
                {t("installed.emptyTitle")}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<TerminalIcon />}
                onClick={() => navigateDeferred(`/platform/${platformId}/npx-skills`)}
              >
                {t("npxSkills.pageButton")}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigateDeferred(`/platform/${platformId}/install`)}
              >
                {t("installed.installSkills")}
              </Button>
            </Box>
          ) : isMobile ? (
            <Stack spacing={1.5}>
              {items.map((item) => (
                <Card key={item.name}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        alignItems="center"
                        sx={{ mb: 0.75 }}
                      >
                        <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                          {item.name}
                        </Typography>
                        {item.category && (
                          <Chip size="small" label={item.category} variant="outlined" />
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {item.description || t("common.noDescriptionAvailable")}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditName(item.name)}
                      >
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card>
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
                            {item.description || t("common.noDescriptionAvailable")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <IconButton
                              color="primary"
                              aria-label={`${t("common.edit")} ${item.name}`}
                              onClick={() => setEditName(item.name)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="warning"
                              aria-label={`${t("common.reinstall")} ${item.name}`}
                              onClick={() => handleReinstall(item.name)}
                            >
                              <SystemUpdateAltIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              aria-label={`${t("common.uninstall")} ${item.name}`}
                              onClick={() => setDeleteName(item.name)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Box>
      </Box>

      {platformId && editName && (
        <Suspense fallback={null}>
          <SkillEditorDrawer
            open
            platformId={platformId}
            skillName={editName}
            onClose={() => setEditName(null)}
            onSaved={() => {
              showNotification(
                t("installed.savedNotification", { name: editName }),
                "success"
              );
              setEditName(null);
              void refresh();
            }}
          />
        </Suspense>
      )}

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
    </Box>
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
      <Typography variant="overline" color="text.secondary">
        {t("installed.categories")}
      </Typography>
      <List dense disablePadding sx={{ mt: 1 }}>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
        >
          <ListItemText primary={t("installed.allSkills")} />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        {categories.map((category) => (
          <ListItemButton
            key={category}
            selected={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
          >
            <ListItemText primary={category} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
