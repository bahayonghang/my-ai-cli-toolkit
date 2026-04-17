import {
  Alert,
  Box,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
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
import type { InstallHubStage } from "@/components/install-hub/types";
import { AppShell } from "@/components/shell/AppShell";
import PageLoadingState from "@/components/common/PageLoadingState";
import { buildActivityRunPath } from "@/utils/activityNavigation";
import { useUnifiedInstallHub } from "./useUnifiedInstallHub";

export default function UnifiedInstallHubPage() {
  const { t } = useI18n();
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
    <AppShell
      variant="workbench"
      title={t("installHub.pageTitle")}
      subtitle={t("installHub.heroSubtitle")}
      onBack={() => navigate(-1)}
      onHome={() => navigate("/")}
      summaryMode="rail"
    >
      <PageBody model={model} />
      <NotificationSnackbar />
    </AppShell>
  );
}

function LoadingScreen() {
  const { t } = useI18n();
  return <PageLoadingState message={t("common.loading")} />;
}

function PageBody({
  model,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
}) {
  return (
    <Box sx={{ pb: { xs: 2, md: 0 } }}>
      {model.catalogError ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {model.catalogError}
        </Alert>
      ) : null}

      <InstallWorkbench model={model} />
    </Box>
  );
}

function InstallWorkbench({
  model,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
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
                itemType={"skill"}
                availableItemTypes={["skill"]}
                categories={model.categories}
                defaultOnly={model.defaultOnly}
                disabled={model.execution.running}
                search={model.search}
                selectedCategory={model.selectedCategory}
                selectedSkills={model.selectedSkills}
                skills={model.filteredSkills}
                totalCount={model.catalog.length}
                onItemTypeChange={model.setItemType}
                onCategoryChange={model.setSelectedCategory}
                onClearSelection={() => model.setSelectedSkills(new Set())}
                onDefaultOnlyChange={model.setDefaultOnly}
                onSearchChange={model.setSearch}
                onSelectAllFiltered={() =>
                  model.setSelectedSkills(
                    new Set(model.filteredSkills.map((skill) => skill.name)),
                  )
                }
                onToggleSkill={(name) =>
                  model.setSelectedSkills((previous) =>
                    toggleInSet(previous, name),
                  )
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
                itemType={model.itemType}
                platforms={model.availablePlatforms}
                selectedPlatforms={model.selectedPlatforms}
                onClearSelection={() => model.setSelectedPlatforms(new Set())}
                onSelectAll={() =>
                  model.setSelectedPlatforms(
                    new Set(
                      model.availablePlatforms.map((platform) => platform.id),
                    ),
                  )
                }
                onTogglePlatform={(platformId) =>
                  model.setSelectedPlatforms((previous) =>
                    toggleInSet(previous, platformId),
                  )
                }
              />
            </InstallStagePanel>

            <InstallStagePanel
              stepNumber={3}
              title={t("installHub.stageTitle.review")}
              description={t("installHub.stageDescription.review")}
              active={model.activeStage === "review"}
              available={
                model.steps.review.available ||
                model.execution.running ||
                model.results.length > 0
              }
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
                itemType={model.itemType}
                allPlatforms={model.availablePlatforms}
                selectedPlatforms={model.summary.selectedPlatforms}
                selectedSkillNames={model.summary.selectedItemNames}
                onClearResults={() => model.setResults([])}
                onInstall={model.runInstall}
                onViewActivity={(runId, platformId) =>
                  navigate(buildActivityRunPath(runId, platformId))
                }
              />
            </InstallStagePanel>
          </Stack>
        </Grid>

        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{ display: { xs: "none", lg: "block" } }}
        >
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
          filtered: model.summary.filteredItemCount,
          total: model.summary.totalItemCount,
        })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {model.summary.selectedItemNames.length > 0
          ? t("installHub.selectedSkillsPreview", {
              count: model.summary.selectedItemNames.length,
            })
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
          ? t("installHub.selectedPlatformsPreview", {
              count: model.summary.selectedPlatforms.length,
            })
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
        {t("installHub.willRunActions", {
          count: model.summary.plannedActionCount,
        })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {model.steps.review.available
          ? t("installHub.reviewSelectionHint", {
              count: model.summary.plannedActionCount,
            })
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
