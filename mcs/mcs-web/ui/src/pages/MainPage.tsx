import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { StatusChip } from "@/components/common/StatusChip";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useItemStore } from "@/stores/itemStore";
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
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const platform = usePlatformStore((state) =>
    state.platforms.find((entry) => entry.id === platformId)
  );
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const items = useItemStore((state) => state.items);
  const categories = useItemStore((state) => state.categories);
  const activeTab = useItemStore((state) => state.activeTab);
  const search = useItemStore((state) => state.search);
  const selectedCategory = useItemStore((state) => state.selectedCategory);
  const selectedNames = useItemStore((state) => state.selectedNames);
  const loading = useItemStore((state) => state.loading);
  const error = useItemStore((state) => state.error);
  const setTab = useItemStore((state) => state.setTab);
  const setSearch = useItemStore((state) => state.setSearch);
  const setCategory = useItemStore((state) => state.setCategory);
  const toggleSelection = useItemStore((state) => state.toggleSelection);
  const selectAll = useItemStore((state) => state.selectAll);
  const clearSelection = useItemStore((state) => state.clearSelection);
  const fetchItems = useItemStore((state) => state.fetchItems);
  const fetchCategories = useItemStore((state) => state.fetchCategories);
  const refresh = useItemStore((state) => state.refresh);
  const colorMode = useUiStore((state) => state.colorMode);
  const toggleColorMode = useUiStore((state) => state.toggleColorMode);
  const showNotification = useUiStore((state) => state.showNotification);

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

  useLayoutEffect(() => {
    clearSelection();
    setCategory(null);
    setSearch("");
  }, [platformId, clearSelection, setCategory, setSearch]);

  useEffect(() => {
    if (!platformId) {
      return;
    }
    void fetchCategories(platformId, undefined, itemType);
  }, [platformId, itemType, fetchCategories]);

  useEffect(() => {
    if (!platformId) {
      return;
    }
    void fetchItems(platformId);
  }, [platformId, activeTab, debouncedSearch, selectedCategory, fetchItems]);

  useEffect(() => {
    if (!isMobile) {
      setFilterDrawerOpen(false);
    }
  }, [isMobile]);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.item_type === itemType),
    [categories, itemType]
  );

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
        `Uninstalled ${result.success_count} items`,
        result.failure_count > 0 ? "warning" : "success"
      );
      clearSelection();
      await refresh(platformId);
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
              aria-label="Open filters"
              onClick={() => setFilterDrawerOpen(true)}
            >
              <TuneIcon />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            aria-label="Back"
            onClick={() => navigateDeferred("/")}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="Home"
            onClick={() => navigateDeferred("/")}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          <IconButton
            color="inherit"
            aria-label="Open prompt"
            onClick={() => setPromptOpen(true)}
          >
            <DescriptionOutlinedIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="Sync selection"
            onClick={() => setSyncOpen(true)}
            disabled={selectedCount === 0}
          >
            <SyncIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label={colorMode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
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
            onTabChange={setTab}
            onCategoryChange={(value) => {
              setCategory(value);
              setFilterDrawerOpen(false);
            }}
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
                onTabChange={setTab}
                onCategoryChange={setCategory}
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
              label="Search"
              size="small"
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
                  <Chip label={`${selectedCount} selected`} onDelete={clearSelection} />
                  <Button
                    variant="contained"
                    startIcon={<InstallDesktopIcon />}
                    onClick={() => setInstallOpen(true)}
                  >
                    Install
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setConfirmAction("uninstall")}
                  >
                    Uninstall
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  onClick={selectAll}
                  disabled={items.length === 0}
                >
                  Select All
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
                <Typography color="text.secondary">No items found</Typography>
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
                        inputProps={{ "aria-label": `Select ${item.name}` }}
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
                          {item.description || "No description available"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {activeTab === "skills" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<InfoOutlinedIcon />}
                          onClick={() => setDetailName(item.name)}
                        >
                          Detail
                        </Button>
                      )}
                      {(item.status === "installed" || item.status === "outdated") && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CompareArrowsIcon />}
                          onClick={() => setDiffName(item.name)}
                        >
                          Diff
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
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.name} hover selected={selectedNames.has(item.name)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedNames.has(item.name)}
                            onChange={() => toggleSelection(item.name)}
                            inputProps={{ "aria-label": `Select ${item.name}` }}
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
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {item.description || "No description available"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {activeTab === "skills" && (
                              <IconButton
                                size="small"
                                aria-label={`View detail for ${item.name}`}
                                onClick={() => setDetailName(item.name)}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            )}
                            {(item.status === "installed" || item.status === "outdated") && (
                              <IconButton
                                size="small"
                                aria-label={`Show diff for ${item.name}`}
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
              `Installed ${successCount} items${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
              failureCount > 0 ? "warning" : "success"
            );
            clearSelection();
            void refresh(platformId);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmAction === "uninstall"}
        title="Uninstall Items"
        message={`Uninstall ${selectedCount} ${activeTab} from ${platform?.name ?? platformId}? This cannot be undone.`}
        confirmLabel="Uninstall"
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
            onUpdated={() => showNotification("CLAUDE.md updated successfully", "success")}
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
}: {
  activeTab: TabValue;
  categories: { name: string; count: number }[];
  selectedCategory: string | null;
  onTabChange: (tab: TabValue) => void;
  onCategoryChange: (category: string | null) => void;
}) {
  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Skills" value="skills" />
        <Tab label="Commands" value="commands" />
      </Tabs>

      <Typography variant="overline" color="text.secondary">
        Filters
      </Typography>
      <List dense disablePadding sx={{ mt: 1 }}>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
        >
          <ListItemText primary="All" />
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
