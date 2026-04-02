import { lazy, memo, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  ArrowsClockwise,
  DownloadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { monitorPanelSx } from "@/components/common/glassPanel";
import PageLoadingState from "@/components/common/PageLoadingState";
import {
  AppShell,
} from "@/components/shell/AppShell";
import { PlatformBadge } from "@/components/platform/PlatformVisuals";
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
  const refreshDashboard = useDashboardStore((state) => state.refreshDashboard);
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
    <AppShell
      variant="monitor"
      title={t("dashboard.systemTitle")}
      subtitle={t("dashboard.heroSubtitle")}
      onBack={() => navigateDeferred("/")}
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <ArrowsClockwise size={16} weight="bold" />
              )
            }
            onClick={() => void refreshDashboard()}
            disabled={loading}
          >
            {t("dashboard.refreshAction")}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadSimple size={18} weight="bold" />}
            onClick={() => navigateDeferred("/install-hub")}
          >
            {t("dashboard.unifiedInstallHub")}
          </Button>
        </>
      }
    >
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && !data ? (
          <PageLoadingState message={t("common.loading")} minHeight={320} />
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
    </AppShell>
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
        ...monitorPanelSx,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              {heroStatus}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "var(--mcs-monitor-muted)" }}
            >
              {t("dashboard.commandsCoverageSub", {
                installed: summary.installedCommands,
                total: summary.totalCommands,
              })}{" "}
              · {summary.commandCoverage}% {t("dashboard.commandsCoverage").toLowerCase()}
            </Typography>
          </Box>
          {legacyCount > 0 ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<WarningCircle size={16} weight="bold" />}
              onClick={onOpenLegacy}
            >
              {t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
            </Button>
          ) : null}
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1, md: 2 }}
          useFlexGap
          flexWrap="wrap"
          divider={<Divider flexItem sx={{ borderColor: "var(--mcs-monitor-outline)" }} />}
        >
          <SummaryStat
            label={t("dashboard.installedSkills")}
            value={`${summary.installedSkills}/${summary.totalSkills}`}
            detail={t("dashboard.skillCoverageSub", {
              installed: summary.installedSkills,
              total: summary.totalSkills,
            })}
          />
          <SummaryStat
            label={t("dashboard.outdated")}
            value={summary.outdatedSkills}
            detail={t("dashboard.updatesAvailable", {
              count: summary.outdatedSkills,
            })}
          />
          <SummaryStat
            label={t("dashboard.activePlatforms")}
            value={`${summary.activePlatforms}/${summary.totalPlatforms}`}
            detail={t("dashboard.activePlatformsSub", {
              count: summary.totalPlatforms,
            })}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

function SummaryStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail: string;
}) {
  return (
    <Box sx={{ minWidth: 0, flex: "1 1 180px" }}>
      <Typography variant="caption" sx={{ color: "var(--mcs-monitor-muted)" }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.2, letterSpacing: "-0.03em" }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: "var(--mcs-monitor-muted)" }}>
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
            <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
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
            <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
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
                      <PlatformBadge
                        platformId={item.platformId}
                        name={item.platformName}
                        fallbackIcon={item.platformIcon}
                        size={40}
                      />
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
        backgroundColor: emphasized
          ? "var(--mcs-monitor-surface-strong)"
          : "var(--mcs-monitor-surface)",
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
              <PlatformBadge
                platformId={platform.id}
                name={platform.name}
                fallbackIcon={platform.icon}
                size={46}
              />
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
