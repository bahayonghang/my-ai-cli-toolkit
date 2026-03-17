import { lazy, Suspense, useEffect, useState } from "react";
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
import HomeIcon from "@mui/icons-material/Home";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { getLegacyDirs } from "@/api/client";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
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
  }))
);

const sectionShellSx = {
  position: "relative",
  borderRadius: 4,
  border: "1px solid var(--mcs-glass-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-panel-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
  boxShadow: "var(--mcs-panel-shadow)",
  backdropFilter: "blur(var(--mcs-glass-blur)) saturate(140%)",
  WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(140%)",
  overflow: "hidden",
  isolation: "isolate",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, var(--mcs-glass-highlight) 0%, transparent 42%)",
    pointerEvents: "none",
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
} as const;

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

  const heroStatus = data
    ? data.summary.installedSkills === 0
      ? t("dashboard.heroEmpty")
      : data.summary.outdatedSkills > 0
        ? t("dashboard.heroAttention", { count: data.summary.outdatedSkills })
        : t("dashboard.heroReady")
    : "";

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground variant="dashboard" />

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
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          maxWidth: 1440,
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
              onOpenInstallHub={() => navigateDeferred("/install-hub")}
              onOpenLegacy={() => setLegacyOpen(true)}
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <SkillsSpotlight
                  summary={data.summary}
                  topSkills={data.skillSpotlight.topSkills}
                  topCategories={data.skillSpotlight.topCategories}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <UpdateQueuePanel updateQueue={data.skillSpotlight.updateQueue} />
              </Grid>
            </Grid>

            <PlatformsMatrix
              platforms={data.platforms}
              onPlatformClick={(platformId) => navigateDeferred(`/platform/${platformId}`)}
            />
          </Stack>
        ) : null}
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

function HeroSection({
  summary,
  legacyCount,
  heroStatus,
  onOpenInstallHub,
  onOpenLegacy,
}: {
  summary: DashboardSummary;
  legacyCount: number;
  heroStatus: string;
  onOpenInstallHub: () => void;
  onOpenLegacy: () => void;
}) {
  const { t } = useI18n();

  return (
    <Box sx={{ ...sectionShellSx, p: { xs: 2.5, md: 3.5 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {t("dashboard.heroEyebrow")}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1.25,
                  maxWidth: 720,
                  fontSize: {
                    xs: "clamp(2rem, 7vw, 2.8rem)",
                    md: "clamp(2.6rem, 5vw, 3.6rem)",
                  },
                  lineHeight: 1.04,
                  letterSpacing: "-0.04em",
                }}
              >
                {t("dashboard.heroTitle")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1.5,
                  maxWidth: 640,
                  color: "var(--mcs-dashboard-muted)",
                  fontSize: { xs: "1rem", md: "1.05rem" },
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
                border: "1px solid var(--mcs-dashboard-outline-strong)",
                bgcolor: "var(--mcs-dashboard-accent-soft)",
                color: "var(--mcs-dashboard-ink)",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {heroStatus}
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MetricPlate
                  label={t("dashboard.installedSkills")}
                  value={`${summary.installedSkills}/${summary.totalSkills}`}
                  detail={t("dashboard.skillCoverageSub", {
                    installed: summary.installedSkills,
                    total: summary.totalSkills,
                  })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MetricPlate
                  label={t("dashboard.outdated")}
                  value={summary.outdatedSkills}
                  detail={t("dashboard.updatesAvailable", { count: summary.outdatedSkills })}
                  tone={summary.outdatedSkills > 0 ? "warm" : "neutral"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack
            spacing={2}
            sx={{
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              justifyContent="flex-end"
              alignItems={{ xs: "stretch", sm: "center" }}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="contained"
                startIcon={<InstallDesktopIcon />}
                onClick={onOpenInstallHub}
                sx={{
                  px: 2,
                  bgcolor: "var(--mcs-dashboard-accent)",
                  color: "var(--mcs-dashboard-ink)",
                  "&:hover": {
                    bgcolor: "var(--mcs-dashboard-accent-strong)",
                  },
                }}
              >
                {t("dashboard.unifiedInstallHub")}
              </Button>
              {legacyCount > 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<WarningAmberIcon />}
                  onClick={onOpenLegacy}
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
                  border: "1px solid var(--mcs-dashboard-outline)",
                  bgcolor: "var(--mcs-dashboard-surface-muted)",
                }}
              >
                <ThemeToggleButton />
              </Box>
            </Stack>

            <Box
              sx={{
                p: 2.25,
                borderRadius: 3,
                border: "1px solid var(--mcs-dashboard-outline)",
                bgcolor: "var(--mcs-dashboard-warm-soft)",
              }}
            >
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                    {t("dashboard.commandsCoverage")}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {summary.commandCoverage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={summary.commandCoverage}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: "var(--mcs-dashboard-progress-track)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      bgcolor: "var(--mcs-dashboard-warm-strong)",
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
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
        border: "1px solid var(--mcs-dashboard-outline)",
        background:
          tone === "warm"
            ? "linear-gradient(180deg, var(--mcs-dashboard-warm-soft) 0%, transparent 100%)"
            : "var(--mcs-dashboard-surface-muted)",
      }}
    >
      <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
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
      <Typography variant="body2" sx={{ mt: 1, color: "var(--mcs-dashboard-muted)" }}>
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
    <Box sx={{ ...sectionShellSx, p: { xs: 2.25, md: 3 } }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("dashboard.skillsSpotlightTitle")}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: "var(--mcs-dashboard-muted)" }}>
            {t("dashboard.skillsSpotlightSub")}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.25,
            borderRadius: 3,
            border: "1px solid var(--mcs-dashboard-outline)",
            bgcolor: "var(--mcs-dashboard-surface-muted)",
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {t("dashboard.skillCoverageLabel")}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {summary.skillCoverage}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={summary.skillCoverage}
              sx={{
                height: 12,
                borderRadius: 999,
                bgcolor: "var(--mcs-dashboard-progress-track)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: "var(--mcs-dashboard-accent-strong)",
                },
              }}
            />
            <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
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

function TopSkillToken({ skill }: { skill: DashboardTopSkill }) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        height: "100%",
        p: 1.75,
        borderRadius: 3,
        border: "1px solid var(--mcs-dashboard-outline)",
        bgcolor: "var(--mcs-dashboard-surface-muted)",
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
              {skill.name}
            </Typography>
            {skill.category && (
              <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {skill.category}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" fontWeight={700}>
            {skill.installedOn}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
          {t("dashboard.installedOnPlatforms", { count: skill.installedOn })}
        </Typography>
        {skill.outdatedOn > 0 && (
          <Typography variant="body2" sx={{ color: "warning.main", fontWeight: 600 }}>
            {t("dashboard.outdatedOnPlatforms", { count: skill.outdatedOn })}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function TopCategoryBar({ category }: { category: DashboardTopCategory }) {
  const { t } = useI18n();
  const progress = percentage(category.installed, category.total);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: "1px solid var(--mcs-dashboard-outline)",
        bgcolor: "var(--mcs-dashboard-surface-muted)",
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
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: "var(--mcs-dashboard-progress-track)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              bgcolor: "var(--mcs-dashboard-accent)",
            },
          }}
        />
        <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
          {t("dashboard.categoryCoverage", {
            installed: category.installed,
            total: category.total,
          })}
        </Typography>
      </Stack>
    </Box>
  );
}

function UpdateQueuePanel({ updateQueue }: { updateQueue: DashboardUpdateQueueItem[] }) {
  const { t } = useI18n();

  return (
    <Box sx={{ ...sectionShellSx, p: { xs: 2.25, md: 3 }, height: "100%" }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("dashboard.updateQueueTitle")}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: "var(--mcs-dashboard-muted)" }}>
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
                  border: "1px solid var(--mcs-dashboard-outline)",
                  bgcolor:
                    index === 0
                      ? "var(--mcs-dashboard-warm-soft)"
                      : "var(--mcs-dashboard-surface-muted)",
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Typography variant="h5" component="span" sx={{ lineHeight: 1 }}>
                        {item.platformIcon}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.platformName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
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
                    sx={{
                      height: 7,
                      borderRadius: 999,
                      bgcolor: "var(--mcs-dashboard-progress-track)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: "var(--mcs-dashboard-warm-strong)",
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
    <Box sx={{ ...sectionShellSx, p: { xs: 2.25, md: 3 } }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("dashboard.platformMatrixTitle")}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: "var(--mcs-dashboard-muted)" }}>
            {t("dashboard.platformMatrixSub")}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {featuredPlatforms.map((platform, index) => (
            <Grid
              key={platform.id}
              size={
                index === 0
                  ? { xs: 12, lg: 6 }
                  : { xs: 12, sm: 6, lg: 3 }
              }
            >
              <PlatformCard
                platform={platform}
                emphasized
                onClick={() => onPlatformClick(platform.id)}
              />
            </Grid>
          ))}

          {compactPlatforms.map((platform) => (
            <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <PlatformCard platform={platform} onClick={() => onPlatformClick(platform.id)} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}

function PlatformCard({
  platform,
  emphasized = false,
  onClick,
}: {
  platform: DashboardPlatformStats;
  emphasized?: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const skillCoverage = percentage(platform.installed_skills, platform.total_skills);
  const commandCoverage = percentage(platform.installed_commands, platform.total_commands);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: "1px solid var(--mcs-dashboard-outline)",
        background: emphasized
          ? "linear-gradient(180deg, var(--mcs-dashboard-accent-soft) 0%, var(--mcs-dashboard-surface-strong) 70%)"
          : "linear-gradient(180deg, var(--mcs-dashboard-surface-muted) 0%, var(--mcs-dashboard-surface) 100%)",
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
                {platform.icon}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={emphasized ? "h5" : "h6"} sx={{ wordBreak: "break-word" }}>
                  {platform.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
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
                  bgcolor: "var(--mcs-dashboard-warm-soft)",
                  color: "warning.dark",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {t("dashboard.updatesAvailable", { count: platform.outdated_skills })}
              </Box>
            )}
          </Stack>

          <Stack spacing={1.5}>
            <MetricRail
              label={t("dashboard.skillCoverageLabel")}
              value={`${platform.installed_skills}/${platform.total_skills}`}
              progress={skillCoverage}
              accent="var(--mcs-dashboard-accent-strong)"
            />
            <Divider sx={{ borderColor: "var(--mcs-dashboard-outline)" }} />
            <MetricRail
              label={t("dashboard.commandsLabel")}
              value={`${platform.installed_commands}/${platform.total_commands}`}
              progress={commandCoverage}
              accent="var(--mcs-dashboard-warm-strong)"
            />
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

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
        <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {value}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 7,
          borderRadius: 999,
          bgcolor: "var(--mcs-dashboard-progress-track)",
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
        border: "1px dashed var(--mcs-dashboard-outline-strong)",
        bgcolor: "var(--mcs-dashboard-surface-muted)",
      }}
    >
      <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
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
