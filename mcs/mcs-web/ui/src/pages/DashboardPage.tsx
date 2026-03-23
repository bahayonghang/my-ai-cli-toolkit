import { lazy, memo, Suspense, useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { monitorPanelSx } from "@/components/common/glassPanel";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useLegacyDirs } from "@/hooks/useLegacyDirs";
import { useDashboardStore } from "@/stores/dashboardStore";
import type {
  DashboardPlatformStats,
  DashboardSummary,
  DashboardTopCategory,
  DashboardTopSkill,
  DashboardUpdateQueueItem,
} from "@/types";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  })),
);

export default function DashboardPage() {
  const { t } = useI18n();
  const data = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);
  const { legacyCount, refreshLegacyCount } = useLegacyDirs();
  const [legacyOpen, setLegacyOpen] = useState(false);
  const navigateDeferred = useNavigateDeferred();

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const heroStatus = data
    ? data.summary.installedSkills === 0
      ? t("dashboard.heroEmpty")
      : data.summary.outdatedSkills > 0
        ? t("dashboard.heroAttention", { count: data.summary.outdatedSkills })
        : t("dashboard.heroReady")
    : "";

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground variant="monitor" />

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
          <Button
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={() => void fetchDashboard()}
            disabled={loading}
          >
            {t("dashboard.refreshAction")}
          </Button>
          <Button
            variant="contained"
            startIcon={<InstallDesktopIcon />}
            onClick={() => navigateDeferred("/install-hub")}
          >
            {t("dashboard.unifiedInstallHub")}
          </Button>
          <LanguageToggle />
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pt: 11,
          pb: 6,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && !data ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <Stack spacing={3}>
            <HeroSection
              summary={data.summary}
              legacyCount={legacyCount}
              heroStatus={heroStatus}
              onOpenLegacy={() => setLegacyOpen(true)}
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <UpdateQueuePanel
                  updateQueue={data.skillSpotlight.updateQueue}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 8 }}>
                <SkillsSpotlight
                  summary={data.summary}
                  topSkills={data.skillSpotlight.topSkills}
                  topCategories={data.skillSpotlight.topCategories}
                />
              </Grid>
            </Grid>

            <PlatformsMatrix
              platforms={data.platforms}
              onPlatformClick={(platformId) =>
                navigateDeferred(`/platform/${platformId}`)
              }
            />
          </Stack>
        ) : null}
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

function HeroSection({
  summary,
  legacyCount,
  heroStatus,
  onOpenLegacy,
}: {
  summary: DashboardSummary;
  legacyCount: number;
  heroStatus: string;
  onOpenLegacy: () => void;
}) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        p: { xs: 2.25, md: 2.75 },
        borderRadius: 4,
        border: "1px solid var(--mcs-monitor-outline)",
        bgcolor: "var(--mcs-monitor-surface)",
        boxShadow: "var(--mcs-shadow-sm)",
      }}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "var(--mcs-monitor-muted)" }}
              >
                {t("dashboard.heroEyebrow")}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.75,
                  maxWidth: 760,
                  fontSize: {
                    xs: "clamp(1.55rem, 6vw, 2rem)",
                    md: "clamp(1.9rem, 4vw, 2.4rem)",
                  },
                  lineHeight: 1.08,
                  letterSpacing: "-0.035em",
                }}
              >
                {t("dashboard.heroTitle")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  maxWidth: 680,
                  color: "var(--mcs-monitor-muted)",
                  fontSize: { xs: "0.98rem", md: "1rem" },
                }}
              >
                {t("dashboard.heroSubtitle")}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "inline-flex",
                alignSelf: "flex-start",
                px: 1.5,
                py: 0.85,
                borderRadius: 999,
                border: "1px solid var(--mcs-summary-tile-stroke)",
                bgcolor: "var(--mcs-summary-tile-fill)",
                color: "var(--mcs-monitor-ink)",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {heroStatus}
              </Typography>
            </Box>

            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
                <MetricPlate
                  label={t("dashboard.installedSkills")}
                  value={`${summary.installedSkills}/${summary.totalSkills}`}
                  detail={t("dashboard.skillCoverageSub", {
                    installed: summary.installedSkills,
                    total: summary.totalSkills,
                  })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
                <MetricPlate
                  label={t("dashboard.outdated")}
                  value={summary.outdatedSkills}
                  detail={t("dashboard.updatesAvailable", {
                    count: summary.outdatedSkills,
                  })}
                  tone={summary.outdatedSkills > 0 ? "warm" : "neutral"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
                <MetricPlate
                  label={t("dashboard.activePlatforms")}
                  value={`${summary.activePlatforms}/${summary.totalPlatforms}`}
                  detail={t("dashboard.activePlatformsSub", {
                    count: summary.totalPlatforms,
                  })}
                />
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={1.5} sx={{ height: "100%" }}>
            {legacyCount > 0 && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<WarningAmberIcon />}
                onClick={onOpenLegacy}
                sx={{ alignSelf: "flex-start" }}
              >
                {t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
              </Button>
            )}
            <Box
              sx={{
                mt: legacyCount > 0 ? 0 : "auto",
                p: 2.25,
                borderRadius: 3,
                border: "1px solid var(--mcs-summary-tile-stroke)",
                bgcolor: "var(--mcs-summary-tile-fill)",
              }}
            >
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--mcs-monitor-muted)" }}
                  >
                    {t("dashboard.commandsCoverage")}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {summary.commandCoverage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={summary.commandCoverage}
                  aria-label={t("dashboard.commandsCoverage")}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: "var(--mcs-monitor-progress-track)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      bgcolor: "var(--mcs-monitor-warm-strong)",
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "var(--mcs-monitor-muted)" }}
                >
                  {t("dashboard.commandsCoverageSub", {
                    installed: summary.installedCommands,
                    total: summary.totalCommands,
                  })}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function MetricPlate({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  detail: string;
  tone?: "neutral" | "warm";
}) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 2,
        borderRadius: 3,
        border: "1px solid var(--mcs-monitor-outline)",
        background:
          tone === "warm"
            ? "linear-gradient(180deg, var(--mcs-monitor-warm-soft) 0%, transparent 100%)"
            : "var(--mcs-monitor-surface-muted)",
      }}
    >
      <Typography variant="overline" sx={{ color: "var(--mcs-monitor-muted)" }}>
        {label}
      </Typography>
      <Typography
        variant="h3"
        sx={{
          mt: 0.75,
          fontSize: { xs: "2rem", md: "2.25rem" },
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 1, color: "var(--mcs-monitor-muted)" }}
      >
        {detail}
      </Typography>
    </Box>
  );
}

function SkillsSpotlight({
  summary,
  topSkills,
  topCategories,
}: {
  summary: DashboardSummary;
  topSkills: DashboardTopSkill[];
  topCategories: DashboardTopCategory[];
}) {
  const { t } = useI18n();

  return (
    <Box sx={{ ...monitorPanelSx, p: { xs: 2.25, md: 3 } }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="overline"
            component="h2"
            sx={{ color: "var(--mcs-monitor-muted)" }}
          >
            {t("dashboard.skillsSpotlightTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 1, color: "var(--mcs-monitor-muted)" }}
          >
            {t("dashboard.skillsSpotlightSub")}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.25,
            borderRadius: 3,
            border: "1px solid var(--mcs-monitor-outline)",
            bgcolor: "var(--mcs-monitor-surface-muted)",
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography
                variant="body2"
                sx={{ color: "var(--mcs-monitor-muted)" }}
              >
                {t("dashboard.skillCoverageLabel")}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {summary.skillCoverage}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={summary.skillCoverage}
              aria-label={t("dashboard.skillCoverageLabel")}
              sx={{
                height: 12,
                borderRadius: 999,
                bgcolor: "var(--mcs-monitor-progress-track)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: "var(--mcs-monitor-accent-strong)",
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "var(--mcs-monitor-muted)" }}
            >
              {t("dashboard.skillCoverageSub", {
                installed: summary.installedSkills,
                total: summary.totalSkills,
              })}
            </Typography>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {t("dashboard.topSkillsTitle")}
            </Typography>
            {topSkills.length > 0 ? (
              <Grid container spacing={1.25}>
                {topSkills.map((skill) => (
                  <Grid key={skill.name} size={{ xs: 12, sm: 6 }}>
                    <TopSkillToken skill={skill} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyStateMessage message={t("dashboard.noTopSkills")} />
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {t("dashboard.topCategoriesTitle")}
            </Typography>
            {topCategories.length > 0 ? (
              <Stack spacing={1.25}>
                {topCategories.map((category) => (
                  <TopCategoryBar key={category.name} category={category} />
                ))}
              </Stack>
            ) : (
              <EmptyStateMessage message={t("dashboard.noTopCategories")} />
            )}
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

const TopSkillToken = memo(function TopSkillToken({
  skill,
}: {
  skill: DashboardTopSkill;
}) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        height: "100%",
        p: 1.75,
        borderRadius: 3,
        border: "1px solid var(--mcs-monitor-outline)",
        bgcolor: "var(--mcs-monitor-surface-muted)",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
            >
              {skill.name}
            </Typography>
            {skill.category && (
              <Typography
                variant="body2"
                sx={{ color: "var(--mcs-monitor-muted)" }}
              >
                {skill.category}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" fontWeight={700}>
            {skill.installedOn}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "var(--mcs-monitor-muted)" }}>
          {t("dashboard.installedOnPlatforms", { count: skill.installedOn })}
        </Typography>
        {skill.outdatedOn > 0 && (
          <Typography
            variant="body2"
            sx={{ color: "warning.main", fontWeight: 600 }}
          >
            {t("dashboard.outdatedOnPlatforms", { count: skill.outdatedOn })}
          </Typography>
        )}
      </Stack>
    </Box>
  );
});

const TopCategoryBar = memo(function TopCategoryBar({
  category,
}: {
  category: DashboardTopCategory;
}) {
  const { t } = useI18n();
  const progress = percentage(category.installed, category.total);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: "1px solid var(--mcs-monitor-outline)",
        bgcolor: "var(--mcs-monitor-surface-muted)",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="body1" fontWeight={700}>
            {category.name}
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {progress}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label={category.name}
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: "var(--mcs-monitor-progress-track)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              bgcolor: "var(--mcs-monitor-accent)",
            },
          }}
        />
        <Typography variant="body2" sx={{ color: "var(--mcs-monitor-muted)" }}>
          {t("dashboard.categoryCoverage", {
            installed: category.installed,
            total: category.total,
          })}
        </Typography>
      </Stack>
    </Box>
  );
});

function UpdateQueuePanel({
  updateQueue,
}: {
  updateQueue: DashboardUpdateQueueItem[];
}) {
  const { t } = useI18n();

  return (
    <Box sx={{ ...monitorPanelSx, p: { xs: 2.25, md: 3 }, height: "100%" }}>
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="overline"
            component="h2"
            sx={{ color: "var(--mcs-monitor-muted)" }}
          >
            {t("dashboard.updateQueueTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 1, color: "var(--mcs-monitor-muted)" }}
          >
            {t("dashboard.updateQueueSub")}
          </Typography>
        </Box>

        {updateQueue.length > 0 ? (
          <Stack spacing={1.25}>
            {updateQueue.map((item, index) => (
              <Box
                key={item.platformId}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  border: "1px solid var(--mcs-monitor-outline)",
                  bgcolor:
                    index === 0
                      ? "var(--mcs-monitor-warm-soft)"
                      : "var(--mcs-monitor-surface-muted)",
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Typography
                        variant="h5"
                        component="span"
                        sx={{ lineHeight: 1 }}
                      >
                        {item.platformIcon}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.platformName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "var(--mcs-monitor-muted)" }}
                        >
                          {t("dashboard.skillCoverageSub", {
                            installed: item.installedSkills,
                            total: item.totalSkills,
                          })}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="h6" sx={{ color: "warning.main" }}>
                      {item.outdatedSkills}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percentage(item.installedSkills, item.totalSkills)}
                    aria-label={item.platformName}
                    sx={{
                      height: 7,
                      borderRadius: 999,
                      bgcolor: "var(--mcs-monitor-progress-track)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: "var(--mcs-monitor-warm-strong)",
                      },
                    }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <EmptyStateMessage message={t("dashboard.noUpdates")} />
        )}
      </Stack>
    </Box>
  );
}

function PlatformsMatrix({
  platforms,
  onPlatformClick,
}: {
  platforms: DashboardPlatformStats[];
  onPlatformClick: (platformId: string) => void;
}) {
  const { t } = useI18n();
  const featuredPlatforms = platforms.slice(0, 3);
  const compactPlatforms = platforms.slice(3);

  return (
    <Box sx={{ ...monitorPanelSx, p: { xs: 2.25, md: 3 } }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="overline"
            component="h2"
            sx={{ color: "var(--mcs-monitor-muted)" }}
          >
            {t("dashboard.platformMatrixTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 1, color: "var(--mcs-monitor-muted)" }}
          >
            {t("dashboard.platformMatrixSub")}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {featuredPlatforms.map((platform) => (
            <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PlatformCard
                platform={platform}
                emphasized
                onClick={() => onPlatformClick(platform.id)}
              />
            </Grid>
          ))}

          {compactPlatforms.map((platform) => (
            <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <PlatformCard
                platform={platform}
                onClick={() => onPlatformClick(platform.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}

const PlatformCard = memo(function PlatformCard({
  platform,
  emphasized = false,
  onClick,
}: {
  platform: DashboardPlatformStats;
  emphasized?: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const skillCoverage = percentage(
    platform.installed_skills,
    platform.total_skills,
  );
  const commandCoverage = percentage(
    platform.installed_commands,
    platform.total_commands,
  );

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: "1px solid var(--mcs-monitor-outline)",
        background: emphasized
          ? "linear-gradient(180deg, var(--mcs-monitor-accent-soft) 0%, var(--mcs-monitor-surface-strong) 70%)"
          : "linear-gradient(180deg, var(--mcs-monitor-surface-muted) 0%, var(--mcs-monitor-surface) 100%)",
        boxShadow: "none",
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          alignItems: "stretch",
          transition: "transform var(--mcs-duration) var(--mcs-ease)",
          "&:hover": { transform: "translateY(-2px)" },
        }}
      >
        <Stack
          spacing={2}
          sx={{
            p: { xs: 2, md: emphasized ? 2.5 : 2 },
            minHeight: emphasized ? 250 : 212,
            height: "100%",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
                {platform.icon}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant={emphasized ? "h5" : "h6"}
                  noWrap
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {platform.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--mcs-monitor-muted)" }}
                >
                  {platform.id}
                </Typography>
              </Box>
            </Stack>

            {platform.outdated_skills > 0 && (
              <Box
                sx={{
                  px: 1.1,
                  py: 0.55,
                  borderRadius: 999,
                  bgcolor: "var(--mcs-monitor-warm-soft)",
                  color: "warning.dark",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {t("dashboard.updatesAvailable", {
                  count: platform.outdated_skills,
                })}
              </Box>
            )}
          </Stack>

          <Stack spacing={1.5}>
            <MetricRail
              label={t("dashboard.skillCoverageLabel")}
              value={`${platform.installed_skills}/${platform.total_skills}`}
              progress={skillCoverage}
              accent="var(--mcs-monitor-accent-strong)"
            />
            <Divider sx={{ borderColor: "var(--mcs-monitor-outline)" }} />
            <MetricRail
              label={t("dashboard.commandsLabel")}
              value={`${platform.installed_commands}/${platform.total_commands}`}
              progress={commandCoverage}
              accent="var(--mcs-monitor-warm-strong)"
            />
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
});

function MetricRail({
  label,
  value,
  progress,
  accent,
}: {
  label: string;
  value: string;
  progress: number;
  accent: string;
}) {
  return (
    <Stack spacing={0.85}>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography variant="body2" sx={{ color: "var(--mcs-monitor-muted)" }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {value}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label={label}
        sx={{
          height: 7,
          borderRadius: 999,
          bgcolor: "var(--mcs-monitor-progress-track)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: accent,
          },
        }}
      />
    </Stack>
  );
}

function EmptyStateMessage({ message }: { message: string }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px dashed var(--mcs-monitor-outline-strong)",
        bgcolor: "var(--mcs-monitor-surface-muted)",
      }}
    >
      <Typography variant="body2" sx={{ color: "var(--mcs-monitor-muted)" }}>
        {message}
      </Typography>
    </Box>
  );
}

function percentage(part: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}
