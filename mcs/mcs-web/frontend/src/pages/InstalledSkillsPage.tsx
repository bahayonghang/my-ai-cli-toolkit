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
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExtensionOffIcon from "@mui/icons-material/ExtensionOff";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { getSkills, uninstallSkills } from "@/api/client";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { SkillEditorDrawer } from "@/components/dialogs/SkillEditorDrawer";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import type { ItemDto } from "@/types";

export default function InstalledSkillsPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const platform = usePlatformStore((s) =>
    s.platforms.find((p) => p.id === platformId)
  );
  const { fetchPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();

  const [skills, setSkills] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dialog state
  const [editName, setEditName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const fetchSkills = async () => {
    if (!platformId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills(platformId, {
        status: "installed",
        search: search || undefined,
        category: selectedCategory ?? undefined,
      });
      setSkills(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformId, search, selectedCategory]);

  const handleDelete = async () => {
    if (!platformId || !deleteName) return;
    const nameToDelete = deleteName;
    setDeleteName(null);
    try {
      await uninstallSkills(platformId, [nameToDelete]);
      showNotification(`Uninstalled "${nameToDelete}"`, "success");
      fetchSkills();
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

  // Get unique categories from current skills list
  const categories = Array.from(
    new Set(skills.map((s) => s.category).filter(Boolean))
  ) as string[];

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
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/platform/${platformId}/install`)}
            sx={{ mr: 1, borderRadius: 2 }}
          >
            Install Skills
          </Button>
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
            CATEGORIES
          </Typography>
          <Button
            variant={selectedCategory === null ? "contained" : "text"}
            color={selectedCategory === null ? "primary" : "inherit"}
            onClick={() => setSelectedCategory(null)}
            sx={{ justifyContent: "flex-start", borderRadius: 2 }}
          >
            All Skills
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "contained" : "text"}
              color={selectedCategory === cat ? "primary" : "inherit"}
              onClick={() => setSelectedCategory(cat)}
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
              placeholder="Search installed skills..."
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
          ) : skills.length === 0 ? (
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
                No installed skills found
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/platform/${platformId}/install`)}
              >
                Install Skills
              </Button>
            </Box>
          ) : (
            <Card elevation={0} sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((item, index) => (
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
                            <Tooltip title="Edit SKILL.md">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => setEditName(item.name)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Uninstall">
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
            showNotification(`Saved "${editName}"`, "success");
            setEditName(null);
            fetchSkills();
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteName !== null}
        title="Uninstall Skill"
        message={`Uninstall "${deleteName}" from ${platform?.name ?? platformId}? This cannot be undone.`}
        confirmLabel="Uninstall"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteName(null)}
      />

      <NotificationSnackbar />
    </Box>
  );
}
