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
  Card,
  Tabs,
  Tab,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { getSkills, externalInstallSkill } from "@/api/client";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import type { ItemDto } from "@/types";

export default function InstallPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const platform = usePlatformStore((s) =>
    s.platforms.find((p) => p.id === platformId)
  );
  const { fetchPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();

  const [activeTab, setActiveTab] = useState(0);

  // Tab 1: Local repository
  const [skills, setSkills] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [installOpen, setInstallOpen] = useState(false);

  // Tab 2: External install
  const [extSkillName, setExtSkillName] = useState("");
  const [extMethod, setExtMethod] = useState<"vercel" | "playbooks">("vercel");
  const [extLoading, setExtLoading] = useState(false);
  const [extOutput, setExtOutput] = useState<string | null>(null);
  const [extSuccess, setExtSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const fetchSkills = async () => {
    if (!platformId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills(platformId, {
        status: "not_installed",
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
    if (activeTab === 0) fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformId, search, selectedCategory, activeTab]);

  const toggleSelection = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const categories = Array.from(
    new Set(skills.map((s) => s.category).filter(Boolean))
  ) as string[];

  const handleExternalInstall = async () => {
    if (!platformId || !extSkillName.trim()) return;
    setExtLoading(true);
    setExtOutput(null);
    setExtSuccess(null);
    try {
      const result = await externalInstallSkill(
        platformId,
        extSkillName.trim(),
        extMethod
      );
      setExtOutput(result.output);
      setExtSuccess(result.success);
      if (result.success) {
        showNotification(
          `Installed "${extSkillName.trim()}" successfully`,
          "success"
        );
      } else {
        showNotification("Installation failed", "error");
      }
    } catch (e) {
      const msg = (e as Error).message;
      setExtOutput(msg);
      setExtSuccess(false);
      showNotification(msg, "error");
    } finally {
      setExtLoading(false);
    }
  };

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
          <IconButton
            color="inherit"
            onClick={() => navigate(`/platform/${platformId}`)}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Install Skills — {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8, position: "relative", zIndex: 1 }}
      >
        <Card elevation={0} sx={{ overflow: "visible" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Local Repository" />
            <Tab label="Vercel / Playbooks" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {/* ── Tab 0: Local repository ── */}
            {activeTab === 0 && (
              <Box>
                {/* Search + Category Chips + Install button */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search available skills..."
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
                  <Chip
                    label="All"
                    color={selectedCategory === null ? "primary" : "default"}
                    variant={selectedCategory === null ? "filled" : "outlined"}
                    onClick={() => setSelectedCategory(null)}
                    sx={{ cursor: "pointer" }}
                  />
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      color={selectedCategory === cat ? "primary" : "default"}
                      variant={
                        selectedCategory === cat ? "filled" : "outlined"
                      }
                      onClick={() => setSelectedCategory(cat)}
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                  <Box sx={{ flexGrow: 1 }} />
                  {selectedNames.size > 0 && (
                    <Button
                      variant="contained"
                      startIcon={<InstallDesktopIcon />}
                      onClick={() => setInstallOpen(true)}
                    >
                      Install Selected ({selectedNames.size})
                    </Button>
                  )}
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
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" />
                          <TableCell>Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {skills.map((item, index) => (
                          <TableRow
                            key={item.name}
                            hover
                            selected={selectedNames.has(item.name)}
                            onClick={() => toggleSelection(item.name)}
                            sx={{
                              cursor: "pointer",
                              animation: `fadeIn 0.3s ease-out ${index * 0.02}s both`,
                              "@keyframes fadeIn": {
                                "0%": {
                                  opacity: 0,
                                  transform: "translateY(8px)",
                                },
                                "100%": {
                                  opacity: 1,
                                  transform: "translateY(0)",
                                },
                              },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedNames.has(item.name)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleSelection(item.name)}
                              />
                            </TableCell>
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
                          </TableRow>
                        ))}
                        {skills.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography color="text.secondary" py={4}>
                                All skills are already installed
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* ── Tab 1: Vercel / Playbooks ── */}
            {activeTab === 1 && (
              <Box sx={{ maxWidth: 600 }}>
                <Stack spacing={3}>
                  <TextField
                    label="Skill Name"
                    placeholder="e.g. find-skills"
                    value={extSkillName}
                    onChange={(e) => setExtSkillName(e.target.value)}
                    fullWidth
                    size="small"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleExternalInstall()
                    }
                  />

                  <FormControl>
                    <FormLabel>Installation Method</FormLabel>
                    <RadioGroup
                      value={extMethod}
                      onChange={(e) =>
                        setExtMethod(e.target.value as "vercel" | "playbooks")
                      }
                      row
                    >
                      <FormControlLabel
                        value="vercel"
                        control={<Radio />}
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            npx skills add
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="playbooks"
                        control={<Radio />}
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            npx playbooks add skill
                          </Typography>
                        }
                      />
                    </RadioGroup>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={
                      extLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <InstallDesktopIcon />
                      )
                    }
                    onClick={handleExternalInstall}
                    disabled={!extSkillName.trim() || extLoading}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Install
                  </Button>

                  {extOutput !== null && (
                    <Paper
                      elevation={0}
                      sx={(theme) => ({
                        p: 2,
                        borderRadius: 2,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(0, 0, 0, 0.6)"
                            : "rgba(0, 0, 0, 0.04)",
                        border: "1px solid",
                        borderColor: extSuccess ? "success.main" : "error.main",
                        overflow: "auto",
                        maxHeight: 320,
                      })}
                    >
                      <Typography
                        component="pre"
                        variant="caption"
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          color: extSuccess ? "success.main" : "error.main",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          m: 0,
                          display: "block",
                        }}
                      >
                        {extOutput}
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* Install Dialog for local repo skills */}
      {platformId && (
        <InstallDialog
          open={installOpen}
          platformId={platformId}
          platform={platform}
          itemNames={Array.from(selectedNames)}
          itemCategories={Object.fromEntries(
            skills
              .filter((s) => selectedNames.has(s.name))
              .map((s) => [s.name, s.category])
          )}
          itemType="skills"
          onClose={() => setInstallOpen(false)}
          onCompleted={(successCount, failureCount) => {
            showNotification(
              `Installed ${successCount} skills${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
              failureCount > 0 ? "warning" : "success"
            );
            setSelectedNames(new Set());
            fetchSkills();
          }}
        />
      )}

      <NotificationSnackbar />
    </Box>
  );
}
