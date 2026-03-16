import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { InstallReviewStage } from "@/components/install-hub/InstallReviewStage";
import { InstallStagePanel } from "@/components/install-hub/InstallStagePanel";
import {
  InstallSummaryRail,
  MobileInstallSummaryBar,
} from "@/components/install-hub/InstallSummaryRail";
import { PlatformTargetStage } from "@/components/install-hub/PlatformTargetStage";
import { SkillCatalogStage } from "@/components/install-hub/SkillCatalogStage";
import { useI18n } from "@/i18n";
import type { TranslateFn } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import type { PlatformDisplay } from "@/types";
import type { InstallHubStage } from "@/components/install-hub/types";
import { useUnifiedInstallHub } from "./useUnifiedInstallHub";

const sectionShellSx = {
  position: "relative",
  borderRadius: 4,
  border: "1px solid var(--mcs-dashboard-outline)",
  background:
    "linear-gradient(180deg, var(--mcs-dashboard-surface-strong) 0%, var(--mcs-dashboard-surface) 100%)",
  boxShadow: "var(--mcs-shadow-md)",
  overflow: "hidden",
} as const;

export default function UnifiedInstallHubPage() {
  const navigate = useNavigate();
  const platforms = usePlatformStore((state) => state.platforms);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const refreshPlatforms = usePlatformStore((state) => state.refreshPlatforms);
  const showNotification = useUiStore((state) => state.showNotification);
  const model = useUnifiedInstallHub({
    platforms,
    fetchPlatforms,
    refreshPlatforms,
    notify: showNotification,
  });

  if (model.loadingCatalog && model.catalog.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground variant="dashboard" />
      <PageToolbar onBack={() => navigate(-1)} onHome={() => navigate("/")} />
      <PageBody model={model} platforms={platforms} />
      <NotificationSnackbar />
    </Box>
  );
}

function LoadingScreen() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}

function PageToolbar({
  onBack,
  onHome,
}: {
  onBack: () => void;
  onHome: () => void;
}) {
  const { t } = useI18n();

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ gap: 1 }}>
        <IconButton color="inherit" aria-label={t("common.back")} onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton color="inherit" aria-label={t("common.home")} onClick={onHome}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          {t("installHub.pageTitle")}
        </Typography>
        <LanguageToggle sx={{ mr: 0.5 }} />
        <ThemeToggleButton />
      </Toolbar>
    </AppBar>
  );
}

function PageBody({
  model,
  platforms,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
  platforms: PlatformDisplay[];
}) {
  return (
    <Box
      sx={{
        maxWidth: 1560,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        pt: 11,
        pb: { xs: 4, md: 6 },
      }}
    >
      {model.catalogError ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {model.catalogError}
        </Alert>
      ) : null}

      <Stack spacing={3}>
        <InstallHero model={model} platformCount={platforms.length} />
        <InstallWorkbench model={model} platforms={platforms} />
      </Stack>
    </Box>
  );
}

function InstallHero({
  model,
  platformCount,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
  platformCount: number;
}) {
  const { t } = useI18n();
  const activeStageTitle = t(`installHub.stageTitle.${model.activeStage}`);

  return (
    <Box sx={{ ...sectionShellSx, p: { xs: 2.5, md: 3.25 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {t("installHub.heroEyebrow")}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1,
                  fontSize: {
                    xs: "clamp(2rem, 7vw, 2.8rem)",
                    md: "clamp(2.7rem, 5vw, 3.8rem)",
                  },
                  lineHeight: 1.03,
                  letterSpacing: "-0.045em",
                  maxWidth: 820,
                }}
              >
                {t("installHub.heroTitle")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1.5,
                  maxWidth: 740,
                  color: "var(--mcs-dashboard-muted)",
                }}
              >
                {t("installHub.heroSubtitle")}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {(["skills", "platforms", "review"] as InstallHubStage[]).map((stage, index) => (
                <Box
                  key={stage}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.85,
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor:
                      stage === model.activeStage
                        ? "var(--mcs-dashboard-outline-strong)"
                        : "var(--mcs-dashboard-outline)",
                    bgcolor:
                      stage === model.activeStage
                        ? "var(--mcs-dashboard-accent-soft)"
                        : "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {t(`installHub.stageTitle.${stage}`)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "space-between" }}>
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid var(--mcs-dashboard-outline-strong)",
                bgcolor: "var(--mcs-dashboard-accent-soft)",
                px: 2,
                py: 1.5,
              }}
            >
              <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {t("installHub.summaryEyebrow")}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.4 }}>
                {activeStageTitle}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, color: "var(--mcs-dashboard-muted)" }}>
                {t(`installHub.stageDescription.${model.activeStage}`)}
              </Typography>
            </Box>

            <Grid container spacing={1.25}>
              <Grid size={{ xs: 6, sm: 3, lg: 6 }}>
                <MetricPlate
                  icon={<Inventory2OutlinedIcon fontSize="small" />}
                  label={t("installHub.metricCatalog")}
                  value={model.summary.totalSkillCount}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3, lg: 6 }}>
                <MetricPlate
                  icon={<LayersOutlinedIcon fontSize="small" />}
                  label={t("installHub.metricCategories")}
                  value={model.categories.length}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3, lg: 6 }}>
                <MetricPlate
                  icon={<TravelExploreOutlinedIcon fontSize="small" />}
                  label={t("installHub.metricTargets")}
                  value={platformCount}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3, lg: 6 }}>
                <MetricPlate
                  icon={<PlayCircleOutlineRoundedIcon fontSize="small" />}
                  label={t("installHub.metricActions")}
                  value={model.summary.plannedActionCount}
                  tone="accent"
                />
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function MetricPlate({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "neutral" | "accent";
}) {
  return (
    <Box
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor:
          tone === "accent"
            ? "var(--mcs-dashboard-outline-strong)"
            : "var(--mcs-dashboard-outline)",
        bgcolor:
          tone === "accent"
            ? "rgba(143, 197, 187, 0.12)"
            : "rgba(255, 255, 255, 0.04)",
        p: 1.5,
      }}
    >
      <Stack spacing={1.1}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: tone === "accent" ? "var(--mcs-dashboard-accent-soft)" : "rgba(255, 255, 255, 0.04)",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.3 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function InstallWorkbench({
  model,
  platforms,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
  platforms: PlatformDisplay[];
}) {
  const { t } = useI18n();

  return (
    <>
      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, xl: 8 }}>
          <Stack spacing={2}>
            <InstallStagePanel
              stepNumber={1}
              title={t("installHub.stageTitle.skills")}
              description={t("installHub.stageDescription.skills")}
              active={model.activeStage === "skills"}
              available
              complete={model.steps.skills.complete}
              statusLabel={resolveStepStatusLabel(model, "skills", t)}
              preview={buildSkillsPreview(model, t)}
            >
              <SkillCatalogStage
                categories={model.categories}
                defaultOnly={model.defaultOnly}
                disabled={model.execution.running}
                search={model.search}
                selectedCategory={model.selectedCategory}
                selectedSkills={model.selectedSkills}
                skills={model.filteredSkills}
                totalCount={model.catalog.length}
                onCategoryChange={model.setSelectedCategory}
                onClearSelection={() => model.setSelectedSkills(new Set())}
                onDefaultOnlyChange={model.setDefaultOnly}
                onSearchChange={model.setSearch}
                onSelectAllFiltered={() =>
                  model.setSelectedSkills(new Set(model.filteredSkills.map((skill) => skill.name)))
                }
                onToggleSkill={(name) =>
                  model.setSelectedSkills((previous) => toggleInSet(previous, name))
                }
              />
            </InstallStagePanel>

            <InstallStagePanel
              stepNumber={2}
              title={t("installHub.stageTitle.platforms")}
              description={t("installHub.stageDescription.platforms")}
              active={model.activeStage === "platforms"}
              available={model.steps.platforms.available}
              complete={model.steps.platforms.complete}
              statusLabel={resolveStepStatusLabel(model, "platforms", t)}
              actionLabel={t("installHub.openStage")}
              onActivate={() => model.goToStage("platforms")}
              preview={buildPlatformsPreview(model, t)}
            >
              <PlatformTargetStage
                disabled={model.execution.running}
                locked={!model.steps.platforms.available}
                platforms={platforms}
                selectedPlatforms={model.selectedPlatforms}
                onClearSelection={() => model.setSelectedPlatforms(new Set())}
                onSelectAll={() =>
                  model.setSelectedPlatforms(new Set(platforms.map((platform) => platform.id)))
                }
                onTogglePlatform={(platformId) =>
                  model.setSelectedPlatforms((previous) => toggleInSet(previous, platformId))
                }
              />
            </InstallStagePanel>

            <InstallStagePanel
              stepNumber={3}
              title={t("installHub.stageTitle.review")}
              description={t("installHub.stageDescription.review")}
              active={model.activeStage === "review"}
              available={model.steps.review.available || model.execution.running || model.results.length > 0}
              complete={model.execution.phase === "complete"}
              statusLabel={resolveStepStatusLabel(model, "review", t)}
              actionLabel={t("installHub.openStage")}
              onActivate={() => model.goToStage("review")}
              preview={buildReviewPreview(model, t)}
            >
              <InstallReviewStage
                execution={model.execution}
                plannedActionCount={model.summary.plannedActionCount}
                results={model.results}
                selectedPlatforms={model.summary.selectedPlatforms}
                selectedSkillNames={model.summary.selectedSkillNames}
                onClearResults={() => model.setResults([])}
                onInstall={model.runInstall}
              />
            </InstallStagePanel>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }} sx={{ display: { xs: "none", xl: "block" } }}>
          <InstallSummaryRail
            summary={model.summary}
            steps={model.steps}
            activeStage={model.activeStage}
            execution={model.execution}
            results={model.results}
            onGoStage={model.goToStage}
            onInstall={model.runInstall}
          />
        </Grid>
      </Grid>

      <MobileInstallSummaryBar
        summary={model.summary}
        steps={model.steps}
        activeStage={model.activeStage}
        execution={model.execution}
        results={model.results}
        onGoStage={model.goToStage}
        onInstall={model.runInstall}
      />
    </>
  );
}

function resolveStepStatusLabel(
  model: ReturnType<typeof useUnifiedInstallHub>,
  stage: InstallHubStage,
  t: TranslateFn,
) {
  if (stage === model.activeStage) {
    return t("installHub.stepStatus.current");
  }
  if (stage === "review" && model.execution.phase === "complete") {
    return t("installHub.stepStatus.complete");
  }
  if (model.steps[stage].complete) {
    return t("installHub.stepStatus.complete");
  }
  if (model.steps[stage].available) {
    return t("installHub.stepStatus.ready");
  }
  return t("installHub.stepStatus.locked");
}

function buildSkillsPreview(
  model: ReturnType<typeof useUnifiedInstallHub>,
  t: TranslateFn,
) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="body2">
        {t("installHub.filteredTotal", {
          filtered: model.summary.filteredSkillCount,
          total: model.summary.totalSkillCount,
        })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {model.summary.selectedSkillNames.length > 0
          ? t("installHub.selectedSkillsPreview", { count: model.summary.selectedSkillNames.length })
          : t("installHub.summaryEmptySkills")}
      </Typography>
    </Stack>
  );
}

function buildPlatformsPreview(
  model: ReturnType<typeof useUnifiedInstallHub>,
  t: TranslateFn,
) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="body2">
        {model.summary.selectedPlatforms.length > 0
          ? t("installHub.selectedPlatformsPreview", { count: model.summary.selectedPlatforms.length })
          : t("installHub.summaryEmptyPlatforms")}
      </Typography>
      {!model.steps.platforms.available ? (
        <Typography variant="body2" color="text.secondary">
          {t("installHub.selectSkillToUnlockPlatforms")}
        </Typography>
      ) : null}
    </Stack>
  );
}

function buildReviewPreview(
  model: ReturnType<typeof useUnifiedInstallHub>,
  t: TranslateFn,
) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="body2">
        {t("installHub.willRunActions", { count: model.summary.plannedActionCount })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {model.steps.review.available
          ? t("installHub.reviewSelectionHint", { count: model.summary.plannedActionCount })
          : t("installHub.reviewLockedHint")}
      </Typography>
    </Stack>
  );
}

function toggleInSet<T>(source: Set<T>, value: T): Set<T> {
  const next = new Set(source);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
