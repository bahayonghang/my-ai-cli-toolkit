import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getLegacyDirs } from "@/api/client";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useDashboardStore } from "@/stores/dashboardStore";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  }))
);

export default function DashboardPage() {
  const { t } = useI18n();
  const data = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);
  const [legacyCount, setLegacyCount] = useState(0);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const navigateDeferred = useNavigateDeferred();

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    getLegacyDirs()
      .then((dirs) => setLegacyCount(dirs.length))
      .catch(() => setLegacyCount(0));
  }, []);

  const stats = useMemo(() => {
    if (!data) {
      return null;
    }

    const totalSkills = data.platforms.reduce((sum, platform) => sum + platform.total_skills, 0);
    const installedSkills = data.platforms.reduce((sum, platform) => sum + platform.installed_skills, 0);
    const totalCommands = data.platforms.reduce((sum, platform) => sum + platform.total_commands, 0);
    const installedCommands = data.platforms.reduce((sum, platform) => sum + platform.installed_commands, 0);
    const outdatedSkills = data.platforms.reduce((sum, platform) => sum + platform.outdated_skills, 0);
    const activePlatforms = data.platforms.filter(
      (platform) => platform.installed_skills > 0 || platform.installed_commands > 0
    ).length;

    return {
      totalSkills,
      installedSkills,
      totalCommands,
      installedCommands,
      outdatedSkills,
      activePlatforms,
      totalPlatforms: data.platforms.length,
      skillCoverage: totalSkills === 0 ? 0 : Math.round((installedSkills / totalSkills) * 100),
      commandCoverage: totalCommands === 0 ? 0 : Math.round((installedCommands / totalCommands) * 100),
    };
  }, [data]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label={t("common.back")}
            onClick={() => navigateDeferred("/")}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label={t("common.home")}
            onClick={() => navigateDeferred("/")}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {t("dashboard.systemTitle")}
          </Typography>
          {legacyCount > 0 && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<WarningAmberIcon />}
              onClick={() => setLegacyOpen(true)}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              {t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<InstallDesktopIcon />}
            onClick={() => navigateDeferred("/install-hub")}
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            {t("dashboard.unifiedInstallHub")}
          </Button>
          <LanguageToggle />
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, pt: 11, pb: 5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && !data ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {stats && (
              <Box sx={{ mb: 5 }}>
                <Typography variant="overline" color="text.secondary">
                  {t("dashboard.summaryTitle")}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <SummaryCard
                      label={t("dashboard.platforms")}
                      value={`${stats.activePlatforms}/${stats.totalPlatforms}`}
                      detail={t("dashboard.platformsSub", { count: stats.totalPlatforms })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <SummaryCard
                      label={t("dashboard.installedSkills")}
                      value={stats.installedSkills}
                      detail={t("dashboard.installedSkillsSub", { count: stats.totalSkills })}
                      progress={stats.skillCoverage}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <SummaryCard
                      label={t("dashboard.cliCommands")}
                      value={stats.installedCommands}
                      detail={t("dashboard.cliCommandsSub")}
                      progress={stats.commandCoverage}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <SummaryCard
                      label={t("dashboard.outdated")}
                      value={stats.outdatedSkills}
                      detail={t("dashboard.outdatedSub")}
                      tone={stats.outdatedSkills > 0 ? "warning" : "success"}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {t("dashboard.platformListTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.integrationHub")}
                </Typography>
              </Box>
              {loading && data && <LinearProgress sx={{ width: { xs: "100%", sm: 200 } }} />}
            </Stack>

            <Grid container spacing={2}>
              {data?.platforms.map((platform) => (
                <Grid key={platform.id} size={{ xs: 12, md: 6, xl: 4 }}>
                  <PlatformCard
                    platform={platform}
                    onClick={() => navigateDeferred(`/platform/${platform.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>

      <Suspense fallback={null}>
        <LegacyCleanupDialog
          open={legacyOpen}
          onClose={() => {
            setLegacyOpen(false);
            getLegacyDirs()
              .then((dirs) => setLegacyCount(dirs.length))
              .catch(() => setLegacyCount(0));
          }}
        />
      </Suspense>
    </Box>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  progress,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  detail: string;
  progress?: number;
  tone?: "primary" | "success" | "warning";
}) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, minHeight: 148 }}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" color={`${tone}.main`}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
        {typeof progress === "number" && (
          <Box sx={{ pt: 0.5 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
              {progress}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

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
  const { t } = useI18n();
  const skillCoverage =
    platform.total_skills === 0 ? 0 : Math.round((platform.installed_skills / platform.total_skills) * 100);
  const commandCoverage =
    platform.total_commands === 0 ? 0 : Math.round((platform.installed_commands / platform.total_commands) * 100);

  return (
    <Card>
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, minHeight: 220 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
                {platform.icon}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                  {platform.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {platform.id}
                </Typography>
              </Box>
            </Stack>
            {platform.outdated_skills > 0 && (
              <Chip
                color="warning"
                size="small"
                label={t("dashboard.updatesAvailable", { count: platform.outdated_skills })}
              />
            )}
          </Stack>

          <MetricRow
            label={t("dashboard.skillsShort")}
            value={`${platform.installed_skills}/${platform.total_skills}`}
            progress={skillCoverage}
          />
          <MetricRow
            label={t("dashboard.commandsShort")}
            value={`${platform.installed_commands}/${platform.total_commands}`}
            progress={commandCoverage}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function MetricRow({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
}
