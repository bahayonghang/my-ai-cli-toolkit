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
import type { SxProps, Theme } from "@mui/material/styles";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import RefreshIcon from "@mui/icons-material/Refresh";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { glassPanelSx } from "@/components/common/glassPanel";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useLegacyDirs } from "@/hooks/useLegacyDirs";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformStore } from "@/stores/platformStore";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  }))
);

const heroStatSx: SxProps<Theme> = {
  height: "100%",
  display: "grid",
  alignContent: "space-between",
  gap: 1.5,
  minHeight: 132,
  px: 2.25,
  py: 2,
  borderRadius: 3,
  border: "1px solid var(--mcs-control-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-control-fill-strong) 0%, var(--mcs-control-fill) 100%)",
  boxShadow: "inset 0 1px 0 0 var(--mcs-glass-highlight)",
};

const sectionLabelSx: SxProps<Theme> = {
  color: "var(--mcs-dashboard-muted)",
  letterSpacing: "0.12em",
};

const platformCardSx: SxProps<Theme> = {
  height: "100%",
  background:
    "linear-gradient(180deg, var(--mcs-control-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
  borderColor: "var(--mcs-control-stroke)",
  boxShadow: "var(--mcs-shadow-sm)",
  "&:hover": {
    borderColor: "var(--mcs-control-stroke-strong)",
    backgroundColor: "var(--mcs-control-fill)",
    boxShadow: "var(--mcs-shadow-md)",
  },
};

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
                "linear-gradient(180deg, var(--mcs-hero-surface-strong) 0%, var(--mcs-hero-surface) 48%, var(--mcs-control-fill) 100%)",
              borderColor: "var(--mcs-hero-outline)",
              boxShadow: "var(--mcs-hero-shadow)",
            },
          ]}
        >
          <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3} sx={{ height: "100%", justifyContent: "space-between" }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Typography variant="overline" sx={sectionLabelSx}>
                      {t("platformSelect.quickAccess")}
                    </Typography>
                    <Chip
                      label={t("platformSelect.availablePlatforms")}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        borderColor: "var(--mcs-control-stroke)",
                        backgroundColor: "var(--mcs-control-fill)",
                      }}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography
                    variant="h2"
                    sx={{
                      maxWidth: 860,
                      fontSize: { xs: "2.25rem", sm: "2.9rem", md: "3.6rem" },
                      lineHeight: 0.98,
                      letterSpacing: "-0.06em",
                      textWrap: "balance",
                    }}
                  >
                    {t("platformSelect.title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      maxWidth: 720,
                      fontSize: { xs: "1rem", md: "1.05rem" },
                      lineHeight: 1.8,
                    }}
                  >
                    {t("platformSelect.subtitle")}
                  </Typography>
                </Stack>

                <Grid container spacing={1.5}>
                  {heroStats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                      <Box sx={heroStatSx}>
                        <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)", display: "block" }}>
                          {stat.label}
                        </Typography>
                        <Typography
                          variant={stat.emphasis === "metric" ? "h3" : "body1"}
                          sx={{
                            fontWeight: stat.emphasis === "metric" ? 750 : 650,
                            letterSpacing: stat.emphasis === "metric" ? "-0.06em" : "-0.015em",
                            color:
                              stat.emphasis === "metric"
                                ? "var(--mcs-dashboard-accent-strong)"
                                : "var(--mcs-dashboard-ink)",
                            lineHeight: stat.emphasis === "metric" ? 0.95 : 1.45,
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
                    p: 2.25,
                    borderRadius: 3,
                    border: "1px solid var(--mcs-control-stroke-strong)",
                    background:
                      "linear-gradient(180deg, var(--mcs-control-fill-strong) 0%, var(--mcs-control-fill) 100%)",
                    display: "grid",
                    gap: 0.75,
                  }}
                >
                  <Typography variant="overline" sx={sectionLabelSx}>
                    {t("platformSelect.unifiedInstallLabel")}
                  </Typography>
                  <Typography variant="h6" sx={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                    {t("platformSelect.unifiedInstallTitle")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {t("platformSelect.dashboardTitle")}
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row", lg: "column" }}
                  spacing={1.25}
                  sx={{ mt: "auto" }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <LanguageToggle />
                    <ThemeToggleButton />
                  </Stack>
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
              eyebrow={t("platformSelect.unifiedInstallLabel")}
              title={t("platformSelect.unifiedInstallTitle")}
              description={t("platformSelect.dashboardTitle")}
              icon={<InstallDesktopIcon color="primary" />}
              onClick={() => navigateDeferred("/install-hub")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              eyebrow={t("platformSelect.dashboardLabel")}
              title={t("platformSelect.dashboardTitle")}
              description={t("platformSelect.quickAccess")}
              icon={<DashboardCustomizeIcon color="primary" />}
              onClick={() => navigateDeferred("/dashboard")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              eyebrow={t("platformSelect.npxSkillsLabel")}
              title={t("platformSelect.npxSkillsTitle")}
              description={t("platformSelect.quickAccess")}
              icon={<TerminalIcon color={platforms.length > 0 ? "primary" : "disabled"} />}
              disabled={platforms.length === 0}
              onClick={() => {
                const first = platforms[0];
                if (first) navigateDeferred(`/platform/${first.id}/npx-skills`);
              }}
            />
          </Grid>
        </Grid>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="overline" sx={sectionLabelSx}>
              {t("platformSelect.availablePlatforms")}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5, letterSpacing: "-0.05em", lineHeight: 0.95 }}>
              {platforms.length}
            </Typography>
          </Box>
          <Chip
            label={t("common.selectedCount", { count: platforms.length })}
            variant="outlined"
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              borderRadius: 1.5,
              borderColor: "var(--mcs-control-stroke)",
              backgroundColor: "var(--mcs-control-fill)",
            }}
          />
        </Stack>
        <Grid container spacing={2}>
          {platforms.map((platform) => (
            <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={platformCardSx}>
                <CardActionArea
                  onClick={() => navigateDeferred(`/platform/${platform.id}`)}
                  sx={{ height: "100%", minHeight: 188, alignItems: "stretch" }}
                >
                  <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5, p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 62,
                          minWidth: 62,
                          height: 62,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          background:
                            "linear-gradient(180deg, var(--mcs-control-fill-strong) 0%, var(--mcs-dashboard-surface-muted) 100%)",
                          border: "1px solid var(--mcs-control-stroke)",
                          boxShadow: "inset 0 1px 0 0 var(--mcs-glass-highlight)",
                        }}
                      >
                        <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
                          {platform.icon}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="overline" sx={sectionLabelSx}>
                          {platform.id}
                        </Typography>
                        <Typography variant="h6" sx={{ wordBreak: "break-word", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                          {platform.name}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={1.5} sx={{ minWidth: 0, mt: "auto" }}>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                          label={t("common.platform")}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1.25, borderColor: "var(--mcs-control-stroke)" }}
                        />
                        <Chip
                          label={t("platformSelect.quickAccess")}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1.25, borderColor: "var(--mcs-control-stroke)" }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          pt: 1.25,
                          borderTop: "1px solid var(--mcs-control-divider)",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)", display: "block", mb: 0.75 }}>
                          Path
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere", lineHeight: 1.7 }}
                        >
                          {platform.skills_path}
                        </Typography>
                      </Box>
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
  eyebrow,
  title,
  description,
  icon,
  disabled,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        ...platformCardSx,
        opacity: disabled ? 0.54 : 1,
        flex: 1,
        minWidth: 0,
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={disabled}
        sx={{ height: "100%", minHeight: 160, alignItems: "stretch" }}
      >
        <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" sx={sectionLabelSx}>
                {eyebrow}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 52,
                minWidth: 52,
                height: 52,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(180deg, var(--mcs-control-fill-strong) 0%, var(--mcs-dashboard-surface-muted) 100%)",
                border: "1px solid var(--mcs-control-stroke)",
              }}
            >
              {icon}
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, mt: "auto" }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
