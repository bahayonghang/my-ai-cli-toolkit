import { lazy, startTransition, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HomeIcon from "@mui/icons-material/Home";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import TuneIcon from "@mui/icons-material/Tune";
import { uninstallCommands, uninstallSkills } from "@/api/client";
import { useI18n } from "@/i18n";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { StatusChip } from "@/components/common/StatusChip";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlatformItemsData } from "@/hooks/usePlatformItemsData";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";

const DetailDrawer = lazy(() =>
  import("@/components/dialogs/DetailDrawer").then((module) => ({
    default: module.DetailDrawer,
  }))
);
const DiffDialog = lazy(() =>
  import("@/components/dialogs/DiffDialog").then((module) => ({
    default: module.DiffDialog,
  }))
);
const PromptDialog = lazy(() =>
  import("@/components/dialogs/PromptDialog").then((module) => ({
    default: module.PromptDialog,
  }))
);
const MultiSyncDialog = lazy(() =>
  import("@/components/dialogs/MultiSyncDialog").then((module) => ({
    default: module.MultiSyncDialog,
  }))
);

type TabValue = "skills" | "commands";

export default function MainPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const platform = usePlatformStore((state) =>
    state.platforms.find((entry) => entry.id === platformId)
  );
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const colorMode = useUiStore((state) => state.colorMode);
  const toggleColorMode = useUiStore((state) => state.toggleColorMode);
  const showNotification = useUiStore((state) => state.showNotification);
  const [activeTab, setActiveTab] = useState<TabValue>("skills");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(search, 300);
  const itemType = activeTab === "skills" ? "skill" : "command";
  const selectedCount = selectedNames.size;
  const navigateDeferred = (to: string) => startTransition(() => navigate(to));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [detailName, setDetailName] = useState<string | null>(null);
  const [diffName, setDiffName] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"uninstall" | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    setSelectedNames(new Set());
    setSelectedCategory(null);
    setSearch("");
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
    activeTab,
    search: debouncedSearch,
    selectedCategory,
  });

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.item_type === itemType),
    [categories, itemType]
  );

  const toggleSelection = (name: string) => {
    setSelectedNames((previous) => {
      const next = new Set(previous);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedNames(new Set());
  const selectAll = () => setSelectedNames(new Set(items.map((item) => item.name)));
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    clearSelection();
    setSearch("");
    setSelectedCategory(null);
  };

  const handleUninstall = async () => {
    if (!platformId || selectedCount === 0) {
      return;
    }

    setConfirmAction(null);
    const names = Array.from(selectedNames);

    try {
      const result =
        activeTab === "skills"
          ? await uninstallSkills(platformId, names)
          : await uninstallCommands(platformId, names);
      showNotification(
        t("dialogs.uninstallCompletedSummary", {
          success: result.success_count,
          failedSuffix:
            result.failure_count > 0
              ? `, ${t("npxSkills.jobFailed", { count: result.failure_count })}`
              : "",
        }),
        result.failure_count > 0 ? "warning" : "success"
      );
      clearSelection();
      await refresh();
    } catch (errorValue) {
      showNotification((errorValue as Error).message, "error");
    }
  };

  const pageLoading = loading && items.length === 0;
  const showInlineProgress = loading && items.length > 0;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar sx={{ gap: 0.5, flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "center" }}>
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
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          <IconButton
            color="inherit"
            aria-label={t("common.openPrompt")}
            onClick={() => setPromptOpen(true)}
          >
            <DescriptionOutlinedIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label={t("common.syncSelection")}
            onClick={() => setSyncOpen(true)}
            disabled={selectedCount === 0}
          >
            <SyncIcon />
          </IconButton>
          <LanguageToggle />
          <IconButton
            color="inherit"
            aria-label={
              colorMode === "dark"
                ? t("common.toggleThemeToLight")
                : t("common.toggleThemeToDark")
            }
            onClick={toggleColorMode}
          >
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          anchor="left"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { width: 300, p: 2 } }}
        >
          <FiltersPanel
            activeTab={activeTab}
            categories={visibleCategories}
            selectedCategory={selectedCategory}
            onTabChange={handleTabChange}
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
              <FiltersPanel
                activeTab={activeTab}
                categories={visibleCategories}
                selectedCategory={selectedCategory}
                onTabChange={handleTabChange}
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
              label={t("common.search")}
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
              sx={{ width: { xs: "100%", lg: 320 } }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
              {selectedCount > 0 ? (
                <>
                  <Chip
                    label={t("common.selectedCount", { count: selectedCount })}
                    onDelete={clearSelection}
                  />
                  <Button
                    variant="contained"
                    startIcon={<InstallDesktopIcon />}
                    onClick={() => setInstallOpen(true)}
                  >
                    {t("common.install")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setConfirmAction("uninstall")}
                  >
                    {t("common.uninstall")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  onClick={selectAll}
                  disabled={items.length === 0}
                >
                  {t("install.selectAll")}
                </Button>
              )}
            </Stack>
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
            <Card>
              <CardContent sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary">{t("common.noItemsFound")}</Typography>
              </CardContent>
            </Card>
          ) : isMobile ? (
            <Stack spacing={1.5}>
              {items.map((item) => (
                <Card key={item.name}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Checkbox
                        checked={selectedNames.has(item.name)}
                        onChange={() => toggleSelection(item.name)}
                        inputProps={{ "aria-label": t("common.selectItem", { name: item.name }) }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                            {item.name}
                          </Typography>
                          <StatusChip status={item.status} />
                          {item.category && (
                            <Chip size="small" label={item.category} variant="outlined" />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                          {item.description || t("common.noDescriptionAvailable")}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {activeTab === "skills" && (
                        <Button
                          variant="outlined"
                          startIcon={<InfoOutlinedIcon />}
                          onClick={() => setDetailName(item.name)}
                        >
                          {t("common.viewDetail")}
                        </Button>
                      )}
                      {(item.status === "installed" || item.status === "outdated") && (
                        <Button
                          variant="outlined"
                          startIcon={<CompareArrowsIcon />}
                          onClick={() => setDiffName(item.name)}
                        >
                          {t("common.showDiff")}
                        </Button>
                      )}
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
                      <TableCell padding="checkbox" />
                      <TableCell>{t("common.name")}</TableCell>
                      <TableCell>{t("install.status")}</TableCell>
                      <TableCell>{t("common.category")}</TableCell>
                      <TableCell>{t("common.description")}</TableCell>
                      <TableCell align="right">{t("common.actions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.name} hover selected={selectedNames.has(item.name)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedNames.has(item.name)}
                            onChange={() => toggleSelection(item.name)}
                            inputProps={{ "aria-label": t("common.selectItem", { name: item.name }) }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={item.status} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={item.category ?? "—"} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>
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
                            {activeTab === "skills" && (
                              <IconButton
                                aria-label={`${t("common.viewDetail")} ${item.name}`}
                                onClick={() => setDetailName(item.name)}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            )}
                            {(item.status === "installed" || item.status === "outdated") && (
                              <IconButton
                                aria-label={`${t("common.showDiff")} ${item.name}`}
                                onClick={() => setDiffName(item.name)}
                              >
                                <CompareArrowsIcon fontSize="small" />
                              </IconButton>
                            )}
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

      {platformId && (
        <Suspense fallback={null}>
          <DetailDrawer
            open={detailName !== null}
            platformId={platformId}
            skillName={detailName}
            onClose={() => setDetailName(null)}
            onShowDiff={(name) => {
              setDetailName(null);
              setDiffName(name);
            }}
          />
        </Suspense>
      )}

      {platformId && (
        <Suspense fallback={null}>
          <DiffDialog
            open={diffName !== null}
            platformId={platformId}
            itemName={diffName}
            itemType={activeTab === "skills" ? "skill" : "command"}
            onClose={() => setDiffName(null)}
          />
        </Suspense>
      )}

      {platformId && (
        <InstallDialog
          open={installOpen}
          platformId={platformId}
          platform={platform}
          itemNames={Array.from(selectedNames)}
          itemCategories={Object.fromEntries(
            items
              .filter((item) => selectedNames.has(item.name))
              .map((item) => [item.name, item.category])
          )}
          itemType={activeTab}
          onClose={() => setInstallOpen(false)}
          onCompleted={(successCount, failureCount) => {
            showNotification(
              t("dialogs.installCompletedSummary", {
                success: successCount,
                failedSuffix:
                  failureCount > 0
                    ? `, ${t("npxSkills.jobFailed", { count: failureCount })}`
                    : "",
              }),
              failureCount > 0 ? "warning" : "success"
            );
            clearSelection();
            void refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmAction === "uninstall"}
        title={t("dialogs.uninstallItemsTitle")}
        message={t("dialogs.uninstallItemsMessage", {
          count: selectedCount,
          itemType: activeTab === "skills" ? t("common.skills") : t("common.commands"),
          platform: platform?.name ?? platformId ?? "",
        })}
        confirmLabel={t("common.uninstall")}
        confirmColor="error"
        onConfirm={handleUninstall}
        onCancel={() => setConfirmAction(null)}
      />

      {platformId && (
        <Suspense fallback={null}>
          <PromptDialog
            open={promptOpen}
            platformId={platformId}
            onClose={() => setPromptOpen(false)}
            onUpdated={() =>
              showNotification(t("dialogs.promptUpdatedSuccess"), "success")
            }
          />
        </Suspense>
      )}

      {platformId && (
        <Suspense fallback={null}>
          <MultiSyncDialog
            open={syncOpen}
            itemNames={Array.from(selectedNames)}
            itemType={activeTab === "skills" ? "skill" : "command"}
            currentPlatformId={platformId}
            onClose={() => setSyncOpen(false)}
            onSynced={(message, severity) => {
              showNotification(message, severity);
              clearSelection();
            }}
          />
        </Suspense>
      )}

      <NotificationSnackbar />
    </Box>
  );
}

function FiltersPanel({
  activeTab,
  categories,
  selectedCategory,
  onTabChange,
  onCategoryChange,
  t,
}: {
  activeTab: TabValue;
  categories: { name: string; count: number }[];
  selectedCategory: string | null;
  onTabChange: (tab: TabValue) => void;
  onCategoryChange: (category: string | null) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label={t("common.skills")} value="skills" />
        <Tab label={t("common.commands")} value="commands" />
      </Tabs>

      <Typography variant="overline" color="text.secondary">
        {t("common.filters")}
      </Typography>
      <List dense disablePadding sx={{ mt: 1 }}>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
        >
          <ListItemText primary={t("common.all")} />
          <Badge badgeContent={categories.reduce((sum, category) => sum + category.count, 0)} color="primary" />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        {categories.map((category) => (
          <ListItemButton
            key={category.name}
            selected={selectedCategory === category.name}
            onClick={() => onCategoryChange(category.name)}
          >
            <ListItemText primary={category.name} />
            <Badge badgeContent={category.count} color={selectedCategory === category.name ? "primary" : "default"} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
