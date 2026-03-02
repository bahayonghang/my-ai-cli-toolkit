import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HomeIcon from "@mui/icons-material/Home";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useUiStore } from "@/stores/uiStore";
import AnimatedBackground from "@/components/common/AnimatedBackground";

// ── Pure SVG Graphics for Stat Cards ──────────────────────────────────
function MiniWave() {
  return (
    <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.15, pointerEvents: "none", zIndex: 0 }}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "40px", display: "block" }}>
        <path d="M0 40L0 20C10 30 20 10 30 20C40 30 50 15 60 25C70 35 80 15 90 20L100 15L100 40Z" fill="currentColor" />
      </svg>
    </Box>
  );
}

function MiniBarChart() {
  return (
    <Box sx={{ position: "absolute", bottom: 5, right: 10, display: "flex", gap: 0.5, alignItems: "flex-end", height: 25, opacity: 0.2, zIndex: 0 }}>
      {[40, 70, 45, 90, 60, 100, 50].map((h, i) => (
        <Box key={i} sx={{ width: 4, height: `${h}%`, bgcolor: "currentColor", borderRadius: "2px 2px 0 0" }} />
      ))}
    </Box>
  );
}

// ── Redesigned Modern Stat Card ────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  colorHex: string; // The primary accent color for this card (e.g. #8B5CF6)
  icon: string; // emoji or string
  tooltipText: string;
  chartType?: "wave" | "bar" | "none";
}

function ModernStatCard({ label, value, sub, colorHex, icon, tooltipText, chartType = "none" }: StatCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: isDark ? "rgba(20, 20, 26, 0.45)" : "rgba(255, 255, 255, 0.6)",
        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"}`,
        backdropFilter: "blur(20px)",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        "&:hover": {
          transform: "translateY(-4px)",
          bgcolor: isDark ? "rgba(24, 24, 32, 0.65)" : "rgba(255, 255, 255, 0.9)",
          borderColor: alpha(colorHex, 0.3),
          boxShadow: `0 16px 32px ${alpha(colorHex, isDark ? 0.15 : 0.08)}, 0 0 0 1px ${alpha(colorHex, 0.1)}`,
          "& .stat-icon-wrapper": {
            transform: "scale(1.1) rotate(5deg)",
            color: colorHex,
            background: alpha(colorHex, 0.1),
          },
          "& .stat-value": {
            textShadow: `0 0 20px ${alpha(colorHex, 0.4)}`,
          },
          "& .accent-line": {
            width: "100%",
            opacity: 1,
          }
        },
      }}
    >
      {/* Top Accent Line */}
      <Box className="accent-line" sx={{ position: "absolute", top: 0, left: 0, width: "30%", height: 3, background: `linear-gradient(90deg, ${colorHex}, transparent)`, transition: "all 0.4s ease", opacity: 0.7 }} />

      {/* Decorative Chart Background */}
      <Box sx={{ color: colorHex }}>
        {chartType === "wave" && <MiniWave />}
        {chartType === "bar" && <MiniBarChart />}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

        {/* Header Row */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: "0.1em", lineHeight: 1, color: "text.secondary" }}>
                {label}
              </Typography>
              <Tooltip title={tooltipText} placement="top" arrow>
                <InfoOutlinedIcon sx={{ fontSize: 13, color: "text.secondary", cursor: "help", opacity: 0.6, "&:hover": { opacity: 1, color: colorHex } }} />
              </Tooltip>
            </Box>
          </Box>
          <Box
            className="stat-icon-wrapper"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)",
              color: "text.primary",
              transition: "all 0.3s ease",
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Value and Sub */}
        <Box mt="auto">
          <Typography
            className="stat-value"
            variant="h3"
            sx={{
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: "-0.02em",
              lineHeight: 1,
              transition: "all 0.3s ease",
            }}
          >
            {value}
          </Typography>
          {sub && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: "text.secondary", fontSize: "0.75rem" }}>
              {sub}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}


// ── Redesigned Platform Card ───────────────────────────────────────
function ModernPlatformCard({
  platform,
  onClick,
}: {
  platform: {
    id: string;
    name: string;
    icon: string;
    total_skills: number;
    installed_skills: number;
    outdated_skills: number;
    total_commands: number;
    installed_commands: number;
  };
  onClick: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const p = platform;
  const skillPct = p.total_skills > 0 ? (p.installed_skills / p.total_skills) * 100 : 0;
  const cmdPct = p.total_commands > 0 ? (p.installed_commands / p.total_commands) * 100 : 0;
  const isActive = p.installed_skills > 0 || p.installed_commands > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: isDark ? "rgba(20, 20, 26, 0.3)" : "rgba(255, 255, 255, 0.5)",
        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"}`,
        backdropFilter: "blur(20px)",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        "&:hover": {
          transform: "translateY(-4px)",
          bgcolor: isDark ? "rgba(28, 28, 36, 0.6)" : "rgba(255, 255, 255, 0.9)",
          borderColor: isDark ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.2)",
          boxShadow: isDark
            ? "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.15)"
            : "0 20px 40px rgba(139,92,246,0.08)",
          "& .platform-icon": {
            transform: "scale(1.1)",
          }
        },
      }}
    >
      {/* Active Indicator Glow */}
      {isActive && (
        <Box sx={{
          position: "absolute",
          top: -20, left: -20,
          width: 100, height: 100,
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
      )}

      <Box sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box className="platform-icon" sx={{ fontSize: "1.6rem", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)", lineHeight: 1 }}>
              {p.icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em", fontFamily: '"Outfit", sans-serif' }}>
              {p.name}
            </Typography>
          </Box>

          {/* Outdated Badge */}
          {p.outdated_skills > 0 && (
            <Tooltip title={`${p.outdated_skills} updates available`}>
              <Box sx={{
                px: 1, py: 0.25, borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                display: "flex", alignItems: "center", gap: 0.5,
                fontSize: "0.65rem", fontWeight: 700
              }}>
                <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "currentColor" }} />
                UPDATE
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Data Grid: Skills & Commands */}
        <Grid container spacing={2}>
          {/* Skills Block */}
          <Grid size={{ xs: 6 }}>
            <Box sx={{
              p: 1.5, borderRadius: 3,
              bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"}`,
              display: "flex", flexDirection: "column", gap: 1
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.6rem" }}>
                  Skills
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                  {p.installed_skills}<Box component="span" sx={{ color: "text.secondary", opacity: 0.6 }}>/{p.total_skills}</Box>
                </Typography>
              </Box>
              <Box sx={{ position: "relative", height: 6, borderRadius: 3, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <Box sx={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${skillPct}%`, background: "linear-gradient(90deg, #8B5CF6, #A78BFA)", borderRadius: 3, transition: "width 0.5s ease" }} />
              </Box>
            </Box>
          </Grid>

          {/* Commands Block */}
          <Grid size={{ xs: 6 }}>
            <Box sx={{
              p: 1.5, borderRadius: 3,
              bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"}`,
              display: "flex", flexDirection: "column", gap: 1
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.6rem" }}>
                  Cmds
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                  {p.installed_commands}<Box component="span" sx={{ color: "text.secondary", opacity: 0.6 }}>/{p.total_commands}</Box>
                </Typography>
              </Box>
              <Box sx={{ position: "relative", height: 6, borderRadius: 3, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <Box sx={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${cmdPct}%`, background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: 3, transition: "width 0.5s ease" }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────
export default function DashboardPage() {
  const { data, loading, error, fetchDashboard } = useDashboardStore();
  const { colorMode, toggleColorMode } = useUiStore();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Aggregated stats
  const stats = useMemo(() => {
    if (!data) return null;
    const platforms = data.platforms;
    const totalSkills = platforms.reduce((s, p) => s + p.total_skills, 0);
    const installedSkills = platforms.reduce((s, p) => s + p.installed_skills, 0);
    const outdatedSkills = platforms.reduce((s, p) => s + p.outdated_skills, 0);
    const totalCommands = platforms.reduce((s, p) => s + p.total_commands, 0);
    const installedCommands = platforms.reduce((s, p) => s + p.installed_commands, 0);
    const activePlatforms = platforms.filter(
      (p) => p.installed_skills > 0 || p.installed_commands > 0
    ).length;
    return {
      totalSkills,
      installedSkills,
      outdatedSkills,
      totalCommands,
      installedCommands,
      activePlatforms,
      totalPlatforms: platforms.length,
    };
  }, [data]);

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "transparent",
          backdropFilter: "blur(0px)",
          borderBottom: "none",
          paddingTop: 1,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <Box sx={{
            display: "flex", alignItems: "center", px: 1, py: 0.5, borderRadius: 4,
            bgcolor: theme.palette.mode === "dark" ? "rgba(20, 20, 26, 0.6)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)", border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            mx: { xs: 1, sm: 2 }
          }}>
            <IconButton size="small" color="inherit" onClick={() => navigate("/")} sx={{ mr: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }} title="Home">
              <HomeIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontWeight: 800,
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: "-0.01em",
                pr: 2,
                borderRight: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                mr: 2
              }}
            >
              System Dashboard
            </Typography>
            <Tooltip title="Unified Install Hub">
              <IconButton size="small" color="inherit" onClick={() => navigate("/install-hub")} sx={{ mr: 0.5 }}>
                <InstallDesktopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" color="inherit" onClick={toggleColorMode}>
              {colorMode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ pt: 12, px: { xs: 2, sm: 3, md: 4 }, pb: 8, maxWidth: 1400, mx: "auto" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ── Key Metrics Overview (Creative Bento Grid) ──────────────── */}
            {stats && (
              <Box sx={{ mb: 6 }}>
                {/* Large/Medium asymmetric grid layout */}
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ModernStatCard
                      label="Platforms"
                      value={`${stats.activePlatforms}`}
                      sub={`out of ${stats.totalPlatforms} total environments`}
                      colorHex="#8B5CF6"
                      icon="🖥️"
                      tooltipText="已配置或安装技能的活跃平台数量"
                      chartType="wave"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ModernStatCard
                      label="Installed Skills"
                      value={stats.installedSkills}
                      sub={`from ${stats.totalSkills} available repository`}
                      colorHex="#3B82F6"
                      icon="🧩"
                      tooltipText="用户已本地安装的技能总量"
                      chartType="bar"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ModernStatCard
                      label="CLI Commands"
                      value={stats.installedCommands}
                      sub={`connected across active skills`}
                      colorHex="#06B6D4"
                      icon="⚡"
                      tooltipText="已挂载到系统的终端命令总数"
                      chartType="wave"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ModernStatCard
                      label="Outdated"
                      value={stats.outdatedSkills}
                      sub="require updates"
                      colorHex={stats.outdatedSkills > 0 ? "#F59E0B" : "#10B981"}
                      icon={stats.outdatedSkills > 0 ? "⚠️" : "✨"}
                      tooltipText="检测到有远程更新的技能数目"
                      chartType="none"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ModernStatCard
                      label="Coverage"
                      value={stats.totalSkills > 0 ? `${Math.round((stats.installedSkills / stats.totalSkills) * 100)}%` : "–"}
                      sub="global installation rate"
                      colorHex="#EC4899"
                      icon="📊"
                      tooltipText="技能库的整体安装覆盖比值"
                      chartType="none"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ModernStatCard
                      label="Health Status"
                      value={stats.outdatedSkills === 0 ? "Optimal" : stats.outdatedSkills <= 5 ? "Normal" : "Warning"}
                      sub={stats.outdatedSkills === 0 ? "all systems operational" : "maintenance suggested"}
                      colorHex={stats.outdatedSkills === 0 ? "#10B981" : stats.outdatedSkills <= 5 ? "#F59E0B" : "#EF4444"}
                      icon={stats.outdatedSkills === 0 ? "💚" : stats.outdatedSkills <= 5 ? "💛" : "❤️"}
                      tooltipText="系统版本整齐度评估评级"
                      chartType="bar"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ── Section Header ─────────────────────────────── */}
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 800,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 2,
                "&::after": {
                  content: '""',
                  flexGrow: 1,
                  height: "1px",
                  background: theme.palette.mode === 'dark'
                    ? "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)"
                    : "linear-gradient(90deg, rgba(0,0,0,0.06), transparent)",
                }
              }}
            >
              Integration Hub
            </Typography>

            {/* ── Platform Grid ──────────────────────────────── */}
            <Grid container spacing={2.5}>
              {data?.platforms.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ModernPlatformCard
                    platform={p}
                    onClick={() => navigate(`/platform/${p.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}
