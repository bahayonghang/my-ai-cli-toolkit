import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
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
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExtensionOffIcon from "@mui/icons-material/ExtensionOff";
import HomeIcon from "@mui/icons-material/Home";
import { useI18n } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { useItemStore } from "@/stores/itemStore";
import { uninstallSkills, installSkills } from "@/api/client";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { SkillEditorDrawer } from "@/components/dialogs/SkillEditorDrawer";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";

export default function InstalledSkillsPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const platform = usePlatformStore((s) =>
    s.platforms.find((p) => p.id === platformId)
  );
  const { fetchPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();
  const {
    items,
    categories,
    search,
    selectedCategory,
    loading,
    error,
    setTab,
    setSearch,
    setCategory,
    setStatusFilter,
    fetchItems,
    fetchCategories,
    refresh,
  } = useItemStore();

  // Dialog state
  const [editName, setEditName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    setTab("skills");
    setStatusFilter("installed");
  }, [setTab, setStatusFilter]);

  useEffect(() => {
    setSearch("");
    setCategory(null);
  }, [platformId, setSearch, setCategory]);

  useEffect(() => {
    if (!platformId) {
      return;
    }
    fetchItems(platformId);
    fetchCategories(platformId);
  }, [
    platformId,
    search,
    selectedCategory,
    fetchItems,
    fetchCategories,
  ]);

  const handleDelete = async () => {
    if (!platformId || !deleteName) return;
    const nameToDelete = deleteName;
    setDeleteName(null);
    try {
      await uninstallSkills(platformId, [nameToDelete]);
      showNotification(
        t("installed.uninstalledNotification", { name: nameToDelete }),
        "success"
      );
      await refresh(platformId);
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

  const handleReinstall = async (name: string) => {
    if (!platformId) return;
    try {
      await installSkills(platformId, [name]);
      showNotification(
        t("installed.reinstalledNotification", { name }),
        "success"
      );
      await refresh(platformId);
    } catch (e) {
      showNotification(
        t("installed.reinstallFailed", { error: (e as Error).message }),
        "error"
      );
    }
  };
  const skillCategories = categories
    .filter((category) => category.item_type === "skill")
    .map((category) => category.name);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <AnimatedBackground />

      {/* AppBar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Tooltip title={t("common.home")}>
            <IconButton color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/platform/${platformId}/install`)}
            sx={{ mr: 1, borderRadius: 2 }}
          >
            {t("installed.installSkills")}
          </Button>
          <LanguageToggle sx={{ mr: 1 }} />
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* Categories Sidebar */}
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            position: "sticky",
            top: 88, // 64px AppBar + 24px mt
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ px: 1, mb: 0.5, letterSpacing: 1 }}>
            {t("installed.categories")}
          </Typography>
          <Button
            variant={selectedCategory === null ? "contained" : "text"}
            color={selectedCategory === null ? "primary" : "inherit"}
            onClick={() => setCategory(null)}
            sx={{ justifyContent: "flex-start", borderRadius: 2 }}
          >
            {t("installed.allSkills")}
          </Button>
          {skillCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "contained" : "text"}
              color={selectedCategory === cat ? "primary" : "inherit"}
              onClick={() => setCategory(cat)}
              sx={{ justifyContent: "flex-start", borderRadius: 2 }}
            >
              {cat}
            </Button>
          ))}
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Search */}
          {/* Search Bar only */}
          <Box sx={{ mb: 3 }}>
            <TextField
              size="small"
              placeholder={t("installed.searchPlaceholder")}
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
              sx={{ width: 400, maxWidth: "100%" }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
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
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/platform/${platformId}/install`)}
              >
                {t("installed.installSkills")}
              </Button>
            </Box>
          ) : (
            <Card elevation={0} sx={{ overflow: "hidden" }}>
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
                    {items.map((item, index) => (
                      <TableRow
                        key={item.name}
                        hover
                        sx={{
                          animation: `fadeIn 0.3s ease-out ${index * 0.02}s both`,
                          "@keyframes fadeIn": {
                            "0%": { opacity: 0, transform: "translateY(8px)" },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary.main"
                          >
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={item.category ?? "—"}
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 400, display: "block" }}
                          >
                            {item.description ?? ""}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title={t("installed.editSkillMd")}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => setEditName(item.name)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("common.reinstall")}>
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleReinstall(item.name)}
                              >
                                <SystemUpdateAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("common.uninstall")}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteName(item.name)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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

      {/* Skill Editor Drawer */}
      {platformId && editName && (
        <SkillEditorDrawer
          open={true}
          platformId={platformId}
          skillName={editName}
          onClose={() => setEditName(null)}
          onSaved={() => {
            showNotification(
              t("installed.savedNotification", { name: editName }),
              "success"
            );
            setEditName(null);
            refresh(platformId);
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
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
