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
import RefreshIcon from "@mui/icons-material/Refresh";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { entryPanelSx } from "@/components/common/glassPanel";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useLegacyDirs } from "@/hooks/useLegacyDirs";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformStore } from "@/stores/platformStore";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  })),
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
  border: "1px solid var(--mcs-shell-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-shell-fill-strong) 0%, var(--mcs-shell-fill) 100%)",
  boxShadow: "inset 0 1px 0 0 var(--mcs-glass-highlight)",
};

const sectionLabelSx: SxProps<Theme> = {
  color: "var(--mcs-entry-muted)",
  letterSpacing: "0.12em",
};

const utilityButtonSx: SxProps<Theme> = {
  justifyContent: "flex-start",
  borderColor: "var(--mcs-shell-stroke)",
  backgroundColor: "var(--mcs-shell-fill)",
};

const platformCardSx: SxProps<Theme> = {
  height: "100%",
  background:
    "linear-gradient(180deg, var(--mcs-shell-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
  borderColor: "var(--mcs-shell-stroke)",
  boxShadow: "var(--mcs-shadow-sm)",
  "&:hover": {
    borderColor: "var(--mcs-shell-stroke-strong)",
    backgroundColor: "var(--mcs-shell-fill)",
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

  const firstPlatformId = platforms[0]?.id ?? null;

  const sharedPathCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const platform of platforms) {
      counts.set(
        platform.skills_path,
        (counts.get(platform.skills_path) ?? 0) + 1,
      );
    }
    return counts;
  }, [platforms]);

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
    [platforms.length, t],
  );

  if (loading && platforms.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground variant="entry" />
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          sx={{ mb: 2.5 }}
        >
          <Stack spacing={0.6}>
            <Typography variant="overline" sx={sectionLabelSx}>
              {t("platformSelect.availablePlatforms")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("platformSelect.librarySubtitle")}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                void refreshPlatforms();
                refreshLegacyCount();
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <RefreshIcon />
                )
              }
              disabled={loading}
              sx={utilityButtonSx}
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
            <LanguageToggle />
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                minWidth: 44,
                px: 0.5,
                borderRadius: 999,
                border: "1px solid var(--mcs-shell-stroke)",
                bgcolor: "var(--mcs-shell-fill)",
              }}
            >
              <ThemeToggleButton />
            </Box>
          </Stack>
        </Stack>

        <Box
          sx={[
            entryPanelSx,
            {
              px: { xs: 2.5, sm: 3.5, md: 4.5 },
              py: { xs: 2.5, sm: 3, md: 4 },
              mb: 4,
              background:
                "linear-gradient(180deg, var(--mcs-hero-surface-strong) 0%, var(--mcs-hero-surface) 48%, var(--mcs-shell-fill) 100%)",
              borderColor: "var(--mcs-hero-outline)",
              boxShadow: "var(--mcs-hero-shadow)",
            },
          ]}
        >
          <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack
                spacing={3}
                sx={{ height: "100%", justifyContent: "space-between" }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Typography variant="overline" sx={sectionLabelSx}>
                      {t("platformSelect.heroEyebrow")}
                    </Typography>
                    <Chip
                      label={t("platformSelect.availablePlatforms")}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        borderColor: "var(--mcs-shell-stroke)",
                        backgroundColor: "var(--mcs-shell-fill)",
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

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<InstallDesktopIcon />}
                    onClick={() => navigateDeferred("/install-hub")}
                    sx={{
                      minWidth: { sm: 220 },
                      px: 2.25,
                      bgcolor: "var(--mcs-entry-accent)",
                      color: "var(--mcs-entry-ink)",
                      "&:hover": {
                        bgcolor: "var(--mcs-entry-accent-strong)",
                      },
                    }}
                  >
                    {t("platformSelect.primaryAction")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<DashboardCustomizeIcon />}
                    onClick={() => navigateDeferred("/dashboard")}
                    sx={{ minWidth: { sm: 208 } }}
                  >
                    {t("platformSelect.dashboardAction")}
                  </Button>
                  <Button
                    variant="text"
                    size="large"
                    startIcon={<TerminalIcon />}
                    disabled={!firstPlatformId}
                    onClick={() => {
                      if (firstPlatformId) {
                        navigateDeferred(
                          `/platform/${firstPlatformId}/npx-skills`,
                        );
                      }
                    }}
                    sx={{ justifyContent: "flex-start", px: 0.5 }}
                  >
                    {t("platformSelect.npxAction")}
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={1.5} sx={{ height: "100%" }}>
                <Box
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: "1px solid var(--mcs-shell-stroke-strong)",
                    background:
                      "linear-gradient(180deg, var(--mcs-shell-fill-strong) 0%, var(--mcs-shell-fill) 100%)",
                    display: "grid",
                    gap: 0.75,
                  }}
                >
                  <Typography variant="overline" sx={sectionLabelSx}>
                    {t("platformSelect.unifiedInstallLabel")}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
                  >
                    {t("platformSelect.libraryTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {t("platformSelect.librarySubtitle")}
                  </Typography>
                </Box>

                <Grid container spacing={1.5} sx={{ mt: "auto" }}>
                  {heroStats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 4, lg: 12 }}>
                      <Box sx={heroStatSx}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "var(--mcs-entry-muted)",
                            display: "block",
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant={stat.emphasis === "metric" ? "h3" : "body1"}
                          sx={{
                            fontWeight: stat.emphasis === "metric" ? 750 : 650,
                            letterSpacing:
                              stat.emphasis === "metric"
                                ? "-0.06em"
                                : "-0.015em",
                            color:
                              stat.emphasis === "metric"
                                ? "var(--mcs-entry-accent-strong)"
                                : "var(--mcs-entry-ink)",
                            lineHeight:
                              stat.emphasis === "metric" ? 0.95 : 1.45,
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
          </Grid>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="overline" sx={sectionLabelSx}>
              {t("platformSelect.platformWorkspaceLabel")}
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 0.5, letterSpacing: "-0.05em", lineHeight: 0.95 }}
            >
              {t("platformSelect.libraryTitle")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, maxWidth: 720 }}
            >
              {t("platformSelect.librarySubtitle")}
            </Typography>
          </Box>
          <Chip
            label={t("platformSelect.availablePlatforms")}
            variant="outlined"
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              borderRadius: 1.5,
              borderColor: "var(--mcs-shell-stroke)",
              backgroundColor: "var(--mcs-shell-fill)",
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
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2.5,
                      p: 3,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 62,
                          minWidth: 62,
                          height: 62,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          background:
                            "linear-gradient(180deg, var(--mcs-shell-fill-strong) 0%, var(--mcs-entry-surface-muted) 100%)",
                          border: "1px solid var(--mcs-shell-stroke)",
                          boxShadow:
                            "inset 0 1px 0 0 var(--mcs-glass-highlight)",
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="span"
                          sx={{ lineHeight: 1 }}
                        >
                          {platform.icon}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="overline" sx={sectionLabelSx}>
                          {platform.id}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            wordBreak: "break-word",
                            letterSpacing: "-0.04em",
                            lineHeight: 1.05,
                          }}
                        >
                          {platform.name}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={1.5} sx={{ minWidth: 0, mt: "auto" }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={
                            (sharedPathCounts.get(platform.skills_path) ?? 0) >
                            1
                              ? t("platformSelect.sharedLibrary")
                              : t("platformSelect.dedicatedLibrary")
                          }
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 1.25,
                            borderColor: "var(--mcs-shell-stroke)",
                          }}
                        />
                        {platform.supports_commands && (
                          <Chip
                            label={t("common.commands")}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.25,
                              borderColor: "var(--mcs-shell-stroke)",
                            }}
                          />
                        )}
                        {platform.supports_guidance && (
                          <Chip
                            label={t("common.guidance")}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.25,
                              borderColor: "var(--mcs-shell-stroke)",
                            }}
                          />
                        )}
                        {platform.supports_agents && (
                          <Chip
                            label={t("common.agents")}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.25,
                              borderColor: "var(--mcs-shell-stroke)",
                            }}
                          />
                        )}
                      </Stack>
                      <Box
                        sx={{
                          pt: 1.25,
                          borderTop: "1px solid var(--mcs-shell-divider)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "var(--mcs-entry-muted)",
                            display: "block",
                            mb: 0.75,
                          }}
                        >
                          {t("platformSelect.skillsPathLabel")}
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

      <Suspense
        fallback={
          <CircularProgress
            size={24}
            sx={{ position: "fixed", bottom: 24, right: 24 }}
          />
        }
      >
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
