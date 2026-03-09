import { lazy, startTransition, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Button,
  Chip,
} from "@mui/material";
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import RefreshIcon from "@mui/icons-material/Refresh";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useI18n } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { getLegacyDirs } from "@/api/client";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  }))
);



export default function PlatformSelectPage() {
  const { t } = useI18n();
  const { platforms, loading, error, fetchPlatforms, refreshPlatforms } =
    usePlatformStore();
  const navigate = useNavigate();
  const [legacyCount, setLegacyCount] = useState(0);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const navigateDeferred = (to: string) => startTransition(() => navigate(to));
  // 不再需要前端特殊的过滤逻辑，因为后端直接合并了
  const platformCards = useMemo(() => platforms, [platforms]);

  const refreshLegacyCount = () => {
    getLegacyDirs()
      .then((dirs) => setLegacyCount(dirs.length))
      .catch(() => setLegacyCount(0));
  };

  useEffect(() => {
    fetchPlatforms();
    refreshLegacyCount();
  }, [fetchPlatforms]);

  if (loading && platformCards.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", // 让内容偏上，便于显示多内容
        pt: { xs: 8, md: 12 },
        pb: 12, // 为吸底按钮留出空间
        px: { xs: 2, sm: 4, md: 6 },
        position: "relative",
      }}
    >
      <AnimatedBackground />
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <LanguageToggle />
        {legacyCount > 0 && (
          <Tooltip title={t("platformSelect.legacyCleanupTooltip")} arrow placement="left">
            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
              label={t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
              color="warning"
              variant="outlined"
              onClick={() => setLegacyOpen(true)}
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                borderRadius: 3,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.3)" },
                  "70%": { boxShadow: "0 0 0 6px rgba(245,158,11,0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0)" },
                },
              }}
            />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mb: 4, width: '100%' }}>
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontFamily: '"Fira Code", monospace',
            fontWeight: 700,
            background: (theme) => theme.palette.mode === 'dark'
              ? "linear-gradient(135deg, #E0E7FF 0%, #38BDF8 100%)"
              : "linear-gradient(135deg, #001F3F 0%, #00468C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 0.5,
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
            animation: "fadeInDown 0.4s ease-out",
            "@keyframes fadeInDown": {
              "0%": { opacity: 0, transform: "translateY(-20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" }
            }
          }}
        >
          MyClaude Skills
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            fontFamily: '"Fira Sans", sans-serif',
            fontWeight: 500,
            animation: "fadeIn 0.6s ease-out 0.15s both",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 }
            }
          }}
        >
          {t("platformSelect.subtitle")}
        </Typography>
        <Box sx={{ mt: 1.5, display: "flex", gap: 1, justifyContent: "center" }}>
          <Tooltip title={t("platformSelect.refreshTooltip")} arrow placement="top">
            <span>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  void refreshPlatforms();
                  refreshLegacyCount();
                }}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <RefreshIcon fontSize="small" />
                  )
                }
                sx={{
                  borderRadius: 999,
                  px: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {t("platformSelect.refreshButton")}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* 动态网格 */}
      <Box sx={{ width: "100%", maxWidth: 1200, mb: 1, position: "relative", zIndex: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: '"Fira Sans", sans-serif', fontWeight: 600, color: 'text.secondary', pl: 1 }}>
          Available Platforms
        </Typography>
      </Box>
      <Grid container spacing={2.5} sx={{ maxWidth: 1200, position: "relative", zIndex: 1, width: "100%" }}>
        {platformCards.map((card, index) => (
          <Grid
            key={card.id}
            size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                background: (theme) => theme.palette.mode === 'dark'
                  ? "rgba(15, 23, 42, 0.4)"
                  : "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(16px)",
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 70, 140, 0.1)'}`,
                transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
                animation: `slideUp 0.4s ease-out ${0.03 * index}s both`,
                "@keyframes slideUp": {
                  "0%": { opacity: 0, transform: "translateY(30px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" }
                },
                "&:hover": {
                  cursor: "pointer",
                  transform: "translateY(-4px)",
                  background: (theme) => theme.palette.mode === 'dark'
                    ? "rgba(30, 41, 59, 0.6)"
                    : "rgba(255, 255, 255, 0.9)",
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? "0 20px 40px -10px rgba(0, 70, 140, 0.4), 0 0 20px rgba(0, 70, 140, 0.2) inset"
                    : "0 20px 40px -10px rgba(0, 70, 140, 0.15), 0 0 20px rgba(0, 70, 140, 0.05) inset",
                  borderColor: (theme) => theme.palette.mode === 'dark' ? "rgba(56, 189, 248, 0.3)" : "rgba(0, 70, 140, 0.3)",
                  "& .platform-icon": {
                    transform: "scale(1.1) translateY(-2px)",
                    color: (theme) => theme.palette.mode === 'dark' ? "#38BDF8" : "#00468C"
                  }
                },
              }}
            >
              <CardActionArea
                onClick={() => navigateDeferred(`/platform/${card.id}`)}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  pt: { xs: 3, sm: 3.5 },
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}
              >
                <Typography
                  variant="h3"
                  className="platform-icon"
                  sx={{
                    mb: 1.5,
                    transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    display: "inline-block",
                    lineHeight: 1,
                  }}
                >
                  {card.icon}
                </Typography>
                <CardContent sx={{ p: 0, width: '100%' }}>
                  <Typography variant="body1" sx={{ fontFamily: '"Fira Sans", sans-serif', fontWeight: 600, mb: 0.25, lineHeight: 1.2, wordBreak: 'break-word' }}>
                    {card.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Fira Code", monospace', fontSize: "0.65rem", opacity: 0.8, display: 'block', wordBreak: 'break-all' }}>
                    {card.skills_path}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 常驻吸底的流光按钮 */}
      <Box
        sx={{
          position: "fixed",
          bottom: 32,
          zIndex: 10,
          display: "flex",
          gap: 1.5,
          animation: "fadeInUp 0.6s ease-out 0.5s both",
          "@keyframes fadeInUp": {
            "0%": { opacity: 0, transform: "translateY(20px)" },
            "100%": { opacity: 1, transform: "translateY(0)" }
          }
        }}
      >
        <FloatingQuickAction
          title={t("platformSelect.unifiedInstallTitle")}
          label={t("platformSelect.unifiedInstallLabel")}
          icon={<InstallDesktopIcon className="icon" sx={{ fontSize: '1.2rem', transition: "color 0.3s" }} />}
          onClick={() => navigateDeferred("/install-hub")}
        />

        <FloatingQuickAction
          title={t("platformSelect.dashboardTitle")}
          label={t("platformSelect.dashboardLabel")}
          icon={<DashboardCustomizeIcon className="icon" sx={{ fontSize: '1.2rem', transition: "color 0.3s" }} />}
          onClick={() => navigateDeferred("/dashboard")}
        />
      </Box>
      <Suspense fallback={null}>
        <LegacyCleanupDialog
          open={legacyOpen}
          onClose={() => {
            setLegacyOpen(false);
            refreshLegacyCount();
          }}
        />
      </Suspense>
    </Box>
  );
}

interface FloatingQuickActionProps {
  title: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function FloatingQuickAction({ title, label, icon, onClick }: FloatingQuickActionProps) {
  return (
    <Tooltip title={title} arrow placement="top">
      <Box
        onClick={onClick}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 4,
          py: 1.5,
          borderRadius: 8,
          cursor: "pointer",
          background: (theme) => theme.palette.mode === 'dark'
            ? "rgba(15, 23, 42, 0.6)"
            : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          border: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 70, 140, 0.1)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
            : "0 10px 30px -10px rgba(0, 70, 140, 0.2)",
          transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
          "&:hover": {
            transform: "translateY(-4px)",
            background: (theme) => theme.palette.mode === 'dark'
              ? "rgba(30, 41, 59, 0.8)"
              : "#fff",
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(56, 189, 248, 0.4)'
              : '1px solid rgba(0, 70, 140, 0.4)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? "0 15px 40px -10px rgba(0, 70, 140, 0.6)"
              : "0 15px 40px -10px rgba(0, 70, 140, 0.3)",
            "& .glow": { opacity: 1 },
            "& .icon": { color: (theme) => theme.palette.mode === 'dark' ? "#38BDF8" : "#00468C" }
          },
          "&:focus-visible": {
            outline: "2px solid #00468C",
            outlineOffset: 2,
          }
        }}
      >
        <Box
          className="glow"
          sx={{
            position: "absolute",
            inset: -1,
            borderRadius: 8,
            background: "linear-gradient(45deg, #00468C, #0ea5e9)",
            opacity: 0,
            zIndex: -1,
            transition: "opacity 0.25s",
            filter: "blur(8px)",
          }}
        />
        {icon}
        <Typography variant="body2" sx={{ fontFamily: '"Fira Sans", sans-serif', fontWeight: 600, letterSpacing: '0.02em' }}>
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}
