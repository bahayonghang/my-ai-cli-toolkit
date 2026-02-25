import { useEffect, useState, useMemo } from "react";
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
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import { getSkills, installSkills, externalInstallSkill } from "@/api/client";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import type { ItemDto, InstallStatus } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────

function formatDate(epochMs: number | null): string {
  if (!epochMs) return "—";
  const d = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLabel(status: InstallStatus): string {
  switch (status) {
    case "installed":
      return "Installed";
    case "outdated":
      return "Outdated";
    case "not_installed":
      return "Not Installed";
    default:
      return status;
  }
}

function statusColor(status: InstallStatus): "success" | "warning" | "default" {
  switch (status) {
    case "installed":
      return "success";
    case "outdated":
      return "warning";
    default:
      return "default";
  }
}

function StatusIcon({ status }: { status: InstallStatus }) {
  switch (status) {
    case "installed":
      return <CheckCircleOutlineIcon fontSize="small" color="success" />;
    case "outdated":
      return <WarningAmberIcon fontSize="small" color="warning" />;
    default:
      return <RadioButtonUncheckedIcon fontSize="small" color="disabled" />;
  }
}

// ── Main Component ──────────────────────────────────────────────────

export default function InstallPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const platform = usePlatformStore((s) =>
    s.platforms.find((p) => p.id === platformId)
  );
  const { fetchPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();

  const [activeTab, setActiveTab] = useState(0);

  // Tab 0: Local repository (ALL skills)
  const [skills, setSkills] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InstallStatus | null>(null);
  const [showDefaultOnly, setShowDefaultOnly] = useState(false);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [installOpen, setInstallOpen] = useState(false);

  // Tab 1: External install
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
      // No status filter here — fetch ALL skills
      const data = await getSkills(platformId, {
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

  // Client-side status + default filtering
  const filteredSkills = useMemo(() => {
    let result = statusFilter ? skills.filter((s) => s.status === statusFilter) : skills;
    if (showDefaultOnly) result = result.filter((s) => s.is_default);
    return result;
  }, [skills, statusFilter, showDefaultOnly]);

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

  // Summary counts
  const statusCounts = useMemo(() => {
    const counts = { installed: 0, outdated: 0, not_installed: 0 };
    for (const s of skills) {
      if (s.status in counts) counts[s.status as keyof typeof counts]++;
    }
    return counts;
  }, [skills]);

  // Selected items that can be installed or updated
  const selectedInstallable = useMemo(() => {
    return skills.filter(
      (s) =>
        selectedNames.has(s.name) &&
        (s.status === "not_installed" || s.status === "outdated")
    );
  }, [skills, selectedNames]);

  const handleBatchUpdate = async () => {
    if (!platformId) return;
    const outdated = skills.filter((s) => s.status === "outdated");
    if (outdated.length === 0) return;
    try {
      const result = await installSkills(
        platformId,
        outdated.map((s) => s.name)
      );
      showNotification(
        `Updated ${result.success_count} skills${result.failure_count > 0 ? `, ${result.failure_count} failed` : ""}`,
        result.failure_count > 0 ? "warning" : "success"
      );
      fetchSkills();
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

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
            Skills Library — {platform?.icon} {platform?.name ?? platformId}
          </Typography>
          {statusCounts.outdated > 0 && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<SystemUpdateAltIcon />}
              onClick={handleBatchUpdate}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Update All ({statusCounts.outdated})
            </Button>
          )}
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
            {/* ── Tab 0: Local repository (ALL skills) ── */}
            {activeTab === 0 && (
              <Box>
                {/* Search + Category Chips + Status Chips + Batch button */}
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
                    placeholder="Search skills..."
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

                  {/* Category filter */}
                  <Chip
                    label="All"
                    color={selectedCategory === null ? "primary" : "default"}
                    variant={selectedCategory === null ? "filled" : "outlined"}
                    onClick={() => setSelectedCategory(null)}
                    sx={{ cursor: "pointer" }}
                  />
                  <Chip
                    label="Default"
                    color={showDefaultOnly ? "secondary" : "default"}
                    variant={showDefaultOnly ? "filled" : "outlined"}
                    onClick={() => setShowDefaultOnly((v) => !v)}
                    sx={{ cursor: "pointer" }}
                  />
                  {showDefaultOnly && (
                    <Button size="small" variant="outlined" onClick={() => {
                      const names = filteredSkills
                        .filter((s) => s.status !== "installed")
                        .map((s) => s.name);
                      setSelectedNames(new Set(names));
                    }}>
                      Select All
                    </Button>
                  )}
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

                  {/* Spacer */}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* Status filter chips */}
                  <Stack direction="row" spacing={0.5}>
                    <Chip
                      icon={<CheckCircleOutlineIcon />}
                      label={`${statusCounts.installed}`}
                      color={statusFilter === "installed" ? "success" : "default"}
                      variant={statusFilter === "installed" ? "filled" : "outlined"}
                      size="small"
                      onClick={() =>
                        setStatusFilter(
                          statusFilter === "installed" ? null : "installed"
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    />
                    <Chip
                      icon={<WarningAmberIcon />}
                      label={`${statusCounts.outdated}`}
                      color={statusFilter === "outdated" ? "warning" : "default"}
                      variant={statusFilter === "outdated" ? "filled" : "outlined"}
                      size="small"
                      onClick={() =>
                        setStatusFilter(
                          statusFilter === "outdated" ? null : "outdated"
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    />
                    <Chip
                      icon={<RadioButtonUncheckedIcon />}
                      label={`${statusCounts.not_installed}`}
                      color={statusFilter === "not_installed" ? "primary" : "default"}
                      variant={statusFilter === "not_installed" ? "filled" : "outlined"}
                      size="small"
                      onClick={() =>
                        setStatusFilter(
                          statusFilter === "not_installed"
                            ? null
                            : "not_installed"
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    />
                  </Stack>
                </Box>

                {/* Batch install/update button */}
                {selectedInstallable.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<InstallDesktopIcon />}
                      onClick={() => setInstallOpen(true)}
                    >
                      Install / Update Selected ({selectedInstallable.length})
                    </Button>
                  </Box>
                )}

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
                          <TableCell>Status</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Source Date</TableCell>
                          <TableCell>Installed Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSkills.map((item, index) => {
                          const isOutdated = item.status === "outdated";
                          const isInstalled = item.status === "installed";
                          return (
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
                                ...(isOutdated && {
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === "dark"
                                      ? "rgba(255, 152, 0, 0.08)"
                                      : "rgba(255, 152, 0, 0.05)",
                                }),
                              }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedNames.has(item.name)}
                                  disabled={isInstalled}
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
                                <Tooltip title={statusLabel(item.status)}>
                                  <Chip
                                    icon={<StatusIcon status={item.status} />}
                                    label={statusLabel(item.status)}
                                    color={statusColor(item.status)}
                                    variant="outlined"
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                  />
                                </Tooltip>
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
                                  sx={{ maxWidth: 300, display: "block" }}
                                >
                                  {item.description ?? ""}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {formatDate(item.source_mtime_ms)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="caption"
                                  noWrap
                                  color={
                                    isOutdated
                                      ? "warning.main"
                                      : "text.secondary"
                                  }
                                  fontWeight={isOutdated ? 700 : 400}
                                >
                                  {formatDate(item.target_mtime_ms)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredSkills.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography color="text.secondary" py={4}>
                                {statusFilter
                                  ? `No ${statusLabel(statusFilter).toLowerCase()} skills`
                                  : "No skills found"}
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
          itemNames={selectedInstallable.map((s) => s.name)}
          itemCategories={Object.fromEntries(
            selectedInstallable.map((s) => [s.name, s.category])
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
