import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HomeIcon from "@mui/icons-material/Home";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useUiStore } from "@/stores/uiStore";
import AnimatedBackground from "@/components/common/AnimatedBackground";

// ── Stat Card (top overview) ───────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  gradient: string;
  icon: string;
}

function StatCard({ label, value, sub, gradient, icon }: StatCardProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        p: "1px",
        background: gradient,
        overflow: "hidden",
        transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
      }}
    >
      <Box
        sx={{
          borderRadius: 4,
          p: 2.5,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(10, 10, 15, 0.85)"
              : "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          height: "100%",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            {label}
          </Typography>
          <Typography fontSize="1.4rem">{icon}</Typography>
        </Box>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mt: 0.5,
            background: gradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── Platform Card ──────────────────────────────────────────────────
function PlatformCard({
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
  const p = platform;
  const skillPct = p.total_skills > 0 ? (p.installed_skills / p.total_skills) * 100 : 0;
  const cmdPct = p.total_commands > 0 ? (p.installed_commands / p.total_commands) * 100 : 0;

  const isActive = p.installed_skills > 0 || p.installed_commands > 0;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        borderRadius: 5,
        transition:
          "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s cubic-bezier(0.16,1,0.3,1)",
        "&:hover": {
          transform: "translateY(-4px) scale(1.01)",
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 16px 48px ${alpha(theme.palette.primary.main, 0.3)}`
              : `0 16px 48px ${alpha(theme.palette.primary.main, 0.12)}`,
          "& .card-glow": {
            opacity: 1,
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: isActive
            ? "linear-gradient(90deg, #8B5CF6, #3B82F6, #06B6D4)"
            : theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
          borderRadius: "12px 12px 0 0",
        },
      }}
    >
      {/* Hover glow overlay */}
      <Box
        className="card-glow"
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          transition: "opacity 0.3s",
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)"
              : "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1.2} mb={2}>
          <Typography fontSize="1.6rem" lineHeight={1}>
            {p.icon}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.01em" }}>
            {p.name}
          </Typography>
        </Box>

        {/* Skills Progress */}
        <Box mb={1.5}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Skills
            </Typography>
            <Box display="flex" alignItems="center" gap={0.8}>
              <Typography variant="body2" fontWeight={600}>
                {p.installed_skills}
                <Typography component="span" variant="body2" color="text.secondary">
                  /{p.total_skills}
                </Typography>
              </Typography>
              {p.outdated_skills > 0 && (
                <Chip
                  label={`${p.outdated_skills} outdated`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    color: theme.palette.warning.main,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={skillPct}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: "linear-gradient(90deg, #8B5CF6, #A78BFA)",
              },
            }}
          />
        </Box>

        {/* Commands Progress */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Commands
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {p.installed_commands}
              <Typography component="span" variant="body2" color="text.secondary">
                /{p.total_commands}
              </Typography>
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={cmdPct}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
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
          background:
            theme.palette.mode === "dark"
              ? "rgba(5, 5, 5, 0.7)"
              : "rgba(248, 249, 250, 0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.06)"
            }`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }} title="Home">
            <HomeIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dashboard
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ pt: 11, px: { xs: 2, sm: 3 }, pb: 6, maxWidth: 1400, mx: "auto" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ── Stats Overview ──────────────────────────────── */}
            {stats && (
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <StatCard
                      label="Platforms"
                      value={`${stats.activePlatforms}/${stats.totalPlatforms}`}
                      sub="Active"
                      gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)"
                      icon="🖥️"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <StatCard
                      label="Skills"
                      value={stats.installedSkills}
                      sub={`of ${stats.totalSkills} total`}
                      gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
                      icon="🧩"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <StatCard
                      label="Commands"
                      value={stats.installedCommands}
                      sub={`of ${stats.totalCommands} total`}
                      gradient="linear-gradient(135deg, #06B6D4, #0891B2)"
                      icon="⚡"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <StatCard
                      label="Outdated"
                      value={stats.outdatedSkills}
                      sub="Need update"
                      gradient={
                        stats.outdatedSkills > 0
                          ? "linear-gradient(135deg, #F59E0B, #D97706)"
                          : "linear-gradient(135deg, #10B981, #059669)"
                      }
                      icon={stats.outdatedSkills > 0 ? "⚠️" : "✅"}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <StatCard
                      label="Coverage"
                      value={
                        stats.totalSkills > 0
                          ? `${Math.round((stats.installedSkills / stats.totalSkills) * 100)}%`
                          : "–"
                      }
                      sub="Skill install rate"
                      gradient="linear-gradient(135deg, #EC4899, #DB2777)"
                      icon="📊"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <StatCard
                      label="Health"
                      value={
                        stats.outdatedSkills === 0
                          ? "Great"
                          : stats.outdatedSkills <= 5
                            ? "Good"
                            : "Warn"
                      }
                      sub={
                        stats.outdatedSkills === 0
                          ? "All up to date"
                          : `${stats.outdatedSkills} need attention`
                      }
                      gradient={
                        stats.outdatedSkills === 0
                          ? "linear-gradient(135deg, #10B981, #059669)"
                          : stats.outdatedSkills <= 5
                            ? "linear-gradient(135deg, #F59E0B, #D97706)"
                            : "linear-gradient(135deg, #EF4444, #DC2626)"
                      }
                      icon={
                        stats.outdatedSkills === 0
                          ? "💚"
                          : stats.outdatedSkills <= 5
                            ? "💛"
                            : "❤️"
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ── Section Header ─────────────────────────────── */}
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                px: 0.5,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              Platforms
            </Typography>

            {/* ── Platform Grid ──────────────────────────────── */}
            <Grid container spacing={2}>
              {data?.platforms.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <PlatformCard
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
