import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import RefreshIcon from "@mui/icons-material/Refresh";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { glassPanelSx } from "@/components/common/glassPanel";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLegacyDirs } from "@/hooks/useLegacyDirs";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformStore } from "@/stores/platformStore";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  }))
);

export default function PlatformSelectPage() {
  const { t } = useI18n();
  const navigateDeferred = useNavigateDeferred();
  const platforms = usePlatformStore((state) => state.platforms);
  const loading = usePlatformStore((state) => state.loading);
  const error = usePlatformStore((state) => state.error);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const refreshPlatforms = usePlatformStore((state) => state.refreshPlatforms);
  const { legacyCount, refreshLegacyCount } = useLegacyDirs();
  const [legacyOpen, setLegacyOpen] = useState(false);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  const heroStats = useMemo(
    () => [
      {
        label: t("platformSelect.availablePlatforms"),
        value: platforms.length,
        emphasis: "metric" as const,
      },
      {
        label: t("platformSelect.unifiedInstallLabel"),
        value: t("platformSelect.unifiedInstallTitle"),
        emphasis: "note" as const,
      },
      {
        label: t("platformSelect.npxSkillsLabel"),
        value: t("platformSelect.npxSkillsTitle"),
        emphasis: "note" as const,
      },
    ],
    [platforms.length, t]
  );

  if (loading && platforms.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground variant="hero" />
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Box
          sx={[
            glassPanelSx,
            {
              px: { xs: 2.5, sm: 3.5, md: 4.5 },
              py: { xs: 2.5, sm: 3, md: 4 },
              mb: 4,
              background:
                "linear-gradient(180deg, var(--mcs-hero-surface-strong) 0%, var(--mcs-hero-surface) 52%, var(--mcs-panel-fill) 100%)",
              borderColor: "var(--mcs-hero-outline)",
              boxShadow: "var(--mcs-hero-shadow), inset 0 1px 0 0 var(--mcs-glass-highlight)",
            },
          ]}
        >
          <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3} sx={{ height: "100%", justifyContent: "space-between" }}>
                <Stack spacing={1.5}>
                  <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-accent-strong)" }}>
                    {t("platformSelect.quickAccess")}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      maxWidth: 860,
                      fontSize: { xs: "2.2rem", sm: "2.75rem", md: "3.35rem" },
                      lineHeight: 1.02,
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {t("platformSelect.title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 720, fontSize: { xs: "1rem", md: "1.06rem" }, lineHeight: 1.75 }}
                  >
                    {t("platformSelect.subtitle")}
                  </Typography>
                </Stack>

                <Grid container spacing={1.5}>
                  {heroStats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{
                          height: "100%",
                          borderRadius: 3,
                          px: 2,
                          py: 1.75,
                          border: "1px solid var(--mcs-summary-tile-stroke)",
                          background: "var(--mcs-summary-tile-fill)",
                          boxShadow: "none",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)", display: "block", mb: 0.75 }}>
                          {stat.label}
                        </Typography>
                        <Typography
                          variant={stat.emphasis === "metric" ? "h5" : "body1"}
                          sx={{
                            fontWeight: stat.emphasis === "metric" ? 700 : 600,
                            letterSpacing: stat.emphasis === "metric" ? "-0.04em" : "-0.01em",
                            color:
                              stat.emphasis === "metric"
                                ? "var(--mcs-dashboard-accent-strong)"
                                : "var(--mcs-dashboard-ink)",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={1.5} sx={{ height: "100%" }}>
                <Box
                  sx={{
                    borderRadius: 3.5,
                    p: 2,
                    border: "1px solid var(--mcs-dashboard-outline)",
                    background:
                      "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-summary-tile-fill) 100%)",
                    boxShadow: "var(--mcs-summary-tile-shadow)",
                  }}
                >
                  <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                    {t("platformSelect.quickAccess")}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, mb: 0.75, letterSpacing: "-0.03em" }}>
                    {t("platformSelect.unifiedInstallTitle")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("platformSelect.dashboardTitle")}
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1.25}>
                  <LanguageToggle />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      void refreshPlatforms();
                      refreshLegacyCount();
                    }}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                    disabled={loading}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {t("platformSelect.refreshButton")}
                  </Button>
                  {legacyCount > 0 && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<WarningAmberIcon />}
                      onClick={() => setLegacyOpen(true)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4, alignItems: "stretch" }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              title={t("platformSelect.unifiedInstallLabel")}
              description={t("platformSelect.unifiedInstallTitle")}
              icon={<InstallDesktopIcon color="primary" />}
              onClick={() => navigateDeferred("/install-hub")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              title={t("platformSelect.dashboardLabel")}
              description={t("platformSelect.dashboardTitle")}
              icon={<DashboardCustomizeIcon color="primary" />}
              onClick={() => navigateDeferred("/dashboard")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              title={t("platformSelect.npxSkillsLabel")}
              description={t("platformSelect.npxSkillsTitle")}
              icon={<TerminalIcon color={platforms.length > 0 ? "primary" : "disabled"} />}
              disabled={platforms.length === 0}
              onClick={() => {
                const first = platforms[0];
                if (first) navigateDeferred(`/platform/${first.id}/npx-skills`);
              }}
            />
          </Grid>
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {t("platformSelect.availablePlatforms")}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5, letterSpacing: "-0.03em" }}>
              {platforms.length}
            </Typography>
          </Box>
          <Chip
            label={t("common.selectedCount", { count: platforms.length })}
            variant="outlined"
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        </Stack>
        <Grid container spacing={2}>
          {platforms.map((platform) => (
            <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
                }}
              >
                <CardActionArea
                  onClick={() => navigateDeferred(`/platform/${platform.id}`)}
                  sx={{ height: "100%", minHeight: 176, alignItems: "stretch" }}
                >
                  <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5, p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          display: "grid",
                          placeItems: "center",
                          background:
                            "linear-gradient(180deg, var(--mcs-dashboard-accent-soft) 0%, var(--mcs-dashboard-surface-muted) 100%)",
                          border: "1px solid var(--mcs-dashboard-outline)",
                          boxShadow: "var(--mcs-summary-tile-shadow)",
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
                          {platform.icon}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ wordBreak: "break-word", letterSpacing: "-0.03em" }}>
                          {platform.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {platform.id}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1.25} sx={{ minWidth: 0, mt: "auto" }}>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label={t("common.platform")} size="small" variant="outlined" />
                        <Chip label={t("platformSelect.quickAccess")} size="small" variant="outlined" />
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere", lineHeight: 1.7 }}
                      >
                        {platform.skills_path}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Suspense fallback={<CircularProgress size={24} sx={{ position: "fixed", bottom: 24, right: 24 }} />}>
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

function ShortcutCard({
  title,
  description,
  icon,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        opacity: disabled ? 0.54 : 1,
        flex: 1,
        minWidth: 0,
        background:
          "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={disabled}
        sx={{ height: "100%", minHeight: 152, alignItems: "stretch" }}
      >
        <CardContent sx={{ height: "100%", display: "flex", alignItems: "center", gap: 2.25, p: 3 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(180deg, var(--mcs-dashboard-accent-soft) 0%, var(--mcs-dashboard-surface-muted) 100%)",
              border: "1px solid var(--mcs-dashboard-outline)",
              boxShadow: "var(--mcs-summary-tile-shadow)",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0, display: "grid", alignContent: "center", gap: 0.5 }}>
            <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
              {title}
            </Typography>
            <Typography variant="h6" sx={{ letterSpacing: "-0.03em" }}>
              {description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
