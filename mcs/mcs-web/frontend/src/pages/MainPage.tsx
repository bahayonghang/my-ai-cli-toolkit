import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemText,
  Badge,
  Drawer,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SyncIcon from "@mui/icons-material/Sync";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useItemStore } from "@/stores/itemStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { installSkills, uninstallSkills, installCommands, uninstallCommands } from "@/api/client";
import { useDebounce } from "@/hooks/useDebounce";
import { StatusChip } from "@/components/common/StatusChip";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { DetailDrawer } from "@/components/dialogs/DetailDrawer";
import { DiffDialog } from "@/components/dialogs/DiffDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { PromptDialog } from "@/components/dialogs/PromptDialog";
import { MultiSyncDialog } from "@/components/dialogs/MultiSyncDialog";
import AnimatedBackground from "@/components/common/AnimatedBackground";

export default function MainPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const platform = usePlatformStore((s) => s.platforms.find((p) => p.id === platformId));
  const { fetchPlatforms } = usePlatformStore();
  const {
    items, categories, activeTab, search, selectedCategory,
    selectedNames, loading, error,
    setTab, setSearch, setCategory, toggleSelection, selectAll,
    clearSelection, fetchItems, fetchCategories, refresh,
  } = useItemStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();

  const debouncedSearch = useDebounce(search, 300);

  // Resizable drawer state
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const saved = localStorage.getItem("mcsDrawerWidth");
    return saved ? parseInt(saved, 10) : 240;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem("mcsDrawerWidth", drawerWidth.toString());
  }, [drawerWidth]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 800) newWidth = 800;
      setDrawerWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Dialog state
  const [detailName, setDetailName] = useState<string | null>(null);
  const [diffName, setDiffName] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"install" | "uninstall" | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    if (platformId) {
      fetchCategories(platformId);
    }
  }, [platformId, fetchCategories]);

  useEffect(() => {
    if (platformId) {
      fetchItems(platformId);
    }
  }, [platformId, activeTab, debouncedSearch, selectedCategory, fetchItems]);

  const handleInstall = async () => {
    if (!platformId || selectedNames.size === 0) return;
    setConfirmAction(null);
    const names = Array.from(selectedNames);
    try {
      const result = activeTab === "skills"
        ? await installSkills(platformId, names)
        : await installCommands(platformId, names);
      showNotification(
        `Installed ${result.success_count} items${result.failure_count > 0 ? `, ${result.failure_count} failed` : ""}`,
        result.failure_count > 0 ? "warning" : "success"
      );
      clearSelection();
      await refresh(platformId);
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

  const handleUninstall = async () => {
    if (!platformId || selectedNames.size === 0) return;
    setConfirmAction(null);
    const names = Array.from(selectedNames);
    try {
      const result = activeTab === "skills"
        ? await uninstallSkills(platformId, names)
        : await uninstallCommands(platformId, names);
      showNotification(
        `Uninstalled ${result.success_count} items`,
        result.failure_count > 0 ? "warning" : "success"
      );
      clearSelection();
      await refresh(platformId);
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

  return (
    <Box sx={{
      display: "flex",
      minHeight: "100vh",
      position: "relative",
    }}>
      <AnimatedBackground />
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          <Tooltip title="CLAUDE.md Prompt">
            <IconButton color="inherit" onClick={() => setPromptOpen(true)}>
              <DescriptionOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sync to other platforms">
            <span>
              <IconButton
                color="inherit"
                onClick={() => setSyncOpen(true)}
                disabled={selectedNames.size === 0}
              >
                <SyncIcon />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflow: "visible",
            transition: isResizing ? "none" : "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Skills" value="skills" />
            <Tab label="Commands" value="commands" />
          </Tabs>

          <Box sx={{ flexGrow: 1, overflow: "auto", pb: 2, pt: 1 }}>
            <List dense disablePadding>
              <ListItemButton
                selected={selectedCategory === null}
                onClick={() => setCategory(null)}
              >
                <ListItemText primary={`All ${activeTab === "skills" ? "Skills" : "Commands"}`} />
                <Badge
                  badgeContent={categories.filter(c => c.item_type === (activeTab === "skills" ? "skill" : "command")).reduce((sum, c) => sum + c.count, 0)}
                  color={selectedCategory === null ? "primary" : "default"}
                  max={999}
                />
              </ListItemButton>
              {categories.filter(c => c.item_type === (activeTab === "skills" ? "skill" : "command")).map((cat) => (
                <ListItemButton
                  key={`${activeTab}-${cat.name}`}
                  selected={selectedCategory === cat.name}
                  onClick={() => setCategory(cat.name)}
                >
                  <ListItemText primary={cat.name} sx={{ pl: 2 }} />
                  <Badge
                    badgeContent={cat.count}
                    color={selectedCategory === cat.name ? "primary" : "default"}
                    max={999}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>

        {/* Drag Handle */}
        <Box
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          sx={{
            position: "absolute",
            top: 0,
            right: -2,
            width: 5,
            height: "100%",
            cursor: "col-resize",
            backgroundColor: isResizing ? "primary.main" : "transparent",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "primary.main",
            },
            transition: "background-color 0.2s ease",
          }}
        />
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, position: "relative", zIndex: 1 }}>
        {/* Toolbar */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 240 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {selectedNames.size > 0 && (
            <>
              <Chip label={`${selectedNames.size} selected`} onDelete={clearSelection} />
              <Tooltip title="Install selected">
                <Button
                  variant="contained"
                  startIcon={<InstallDesktopIcon />}
                  onClick={() => setConfirmAction("install")}
                >
                  Install
                </Button>
              </Tooltip>
              <Tooltip title="Uninstall selected">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setConfirmAction("uninstall")}
                >
                  Uninstall
                </Button>
              </Tooltip>
            </>
          )}
          {selectedNames.size === 0 && (
            <Button size="small" onClick={selectAll}>Select All</Button>
          )}
        </Box>

        {/* Error */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Loading */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          /* Item table */
          <Card elevation={0} sx={{ overflow: "hidden" }}>
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
                  {items.map((item, index) => (
                    <TableRow
                      key={item.name}
                      hover
                      selected={selectedNames.has(item.name)}
                      sx={{
                        cursor: "pointer",
                        animation: `fadeIn 0.3s ease-out ${index * 0.02}s both`,
                        "@keyframes fadeIn": {
                          "0%": { opacity: 0, transform: "translateY(10px)" },
                          "100%": { opacity: 1, transform: "translateY(0)" }
                        }
                      }}
                    >
                      <TableCell padding="checkbox" onClick={() => toggleSelection(item.name)}>
                        <Checkbox checked={selectedNames.has(item.name)} />
                      </TableCell>
                      <TableCell onClick={() => toggleSelection(item.name)}>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={() => toggleSelection(item.name)}>
                        <StatusChip status={item.status} />
                      </TableCell>
                      <TableCell onClick={() => toggleSelection(item.name)}>
                        <Chip size="small" label={item.category ?? "—"} variant="outlined" sx={{ borderRadius: 1 }} />
                      </TableCell>
                      <TableCell onClick={() => toggleSelection(item.name)}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: "block" }}>
                          {item.description ?? ""}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                          {activeTab === "skills" && (
                            <Tooltip title="Detail">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); setDetailName(item.name); }}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(item.status === "installed" || item.status === "outdated") && (
                            <Tooltip title="Diff">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); setDiffName(item.name); }}
                              >
                                <CompareArrowsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={4}>
                          No items found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

      {/* Detail Drawer */}
      {platformId && (
        <DetailDrawer
          open={detailName !== null}
          platformId={platformId}
          skillName={detailName}
          onClose={() => setDetailName(null)}
          onShowDiff={(name) => { setDetailName(null); setDiffName(name); }}
        />
      )}

      {/* Diff Dialog */}
      {platformId && (
        <DiffDialog
          open={diffName !== null}
          platformId={platformId}
          itemName={diffName}
          itemType={activeTab === "skills" ? "skill" : "command"}
          onClose={() => setDiffName(null)}
        />
      )}

      {/* Confirm Install */}
      <ConfirmDialog
        open={confirmAction === "install"}
        title="Install Items"
        message={`Install ${selectedNames.size} ${activeTab} to ${platform?.name ?? platformId}?`}
        confirmLabel="Install"
        onConfirm={handleInstall}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Confirm Uninstall */}
      <ConfirmDialog
        open={confirmAction === "uninstall"}
        title="Uninstall Items"
        message={`Uninstall ${selectedNames.size} ${activeTab} from ${platform?.name ?? platformId}? This cannot be undone.`}
        confirmLabel="Uninstall"
        confirmColor="error"
        onConfirm={handleUninstall}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Prompt Dialog */}
      {platformId && (
        <PromptDialog
          open={promptOpen}
          platformId={platformId}
          onClose={() => setPromptOpen(false)}
          onUpdated={() => showNotification("CLAUDE.md updated successfully", "success")}
        />
      )}

      {/* Multi-Sync Dialog */}
      {platformId && (
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
      )}

      <NotificationSnackbar />
    </Box>
  );
}
