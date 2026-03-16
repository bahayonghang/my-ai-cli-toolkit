import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useI18n } from "@/i18n";
import type { TranslateFn } from "@/i18n";
import type {
  ExecutionState,
  InstallHubSelectionSummary,
  InstallHubStage,
  InstallHubStepState,
  PlatformInstallResult,
} from "./types";

interface InstallSummaryRailProps {
  summary: InstallHubSelectionSummary;
  steps: Record<InstallHubStage, InstallHubStepState>;
  activeStage: InstallHubStage;
  execution: ExecutionState;
  results: PlatformInstallResult[];
  onGoStage: (stage: InstallHubStage) => void;
  onInstall: () => void;
}

export function InstallSummaryRail({
  summary,
  steps,
  activeStage,
  execution,
  results,
  onGoStage,
  onInstall,
}: InstallSummaryRailProps) {
  const { t } = useI18n();
  const primaryAction = resolvePrimaryAction({
    activeStage,
    execution,
    steps,
    onGoStage,
    onInstall,
    t,
  });

  return (
    <SummarySurface
      summary={summary}
      steps={steps}
      activeStage={activeStage}
      execution={execution}
      results={results}
      primaryAction={primaryAction}
      onGoStage={onGoStage}
    />
  );
}

export function MobileInstallSummaryBar({
  summary,
  steps,
  activeStage,
  execution,
  results,
  onGoStage,
  onInstall,
}: InstallSummaryRailProps) {
  const { t } = useI18n();
  const primaryAction = resolvePrimaryAction({
    activeStage,
    execution,
    steps,
    onGoStage,
    onInstall,
    t,
  });

  return (
    <Box
      sx={{
        display: { xs: "block", xl: "none" },
        position: "sticky",
        bottom: 12,
        zIndex: 5,
        mt: 2,
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid var(--mcs-dashboard-outline-strong)",
          background:
            "linear-gradient(180deg, rgba(19, 30, 36, 0.98) 0%, rgba(13, 19, 24, 0.98) 100%)",
          boxShadow: "var(--mcs-shadow-md)",
          p: 1.5,
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {t(`installHub.stageTitle.${activeStage}`)}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {t("installHub.willRunActions", { count: summary.plannedActionCount })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75}>
              <Chip label={t("installHub.skillsChip", { count: summary.selectedSkillNames.length })} size="small" />
              <Chip label={t("installHub.platformsChip", { count: summary.selectedPlatforms.length })} size="small" />
            </Stack>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            startIcon={primaryAction.icon}
          >
            {primaryAction.label}
          </Button>

          {execution.phase === "complete" && results.length > 0 ? (
            <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)" }}>
              {t("installHub.summaryResultsHint")}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

function SummarySurface({
  summary,
  steps,
  activeStage,
  execution,
  results,
  primaryAction,
  onGoStage,
}: {
  summary: InstallHubSelectionSummary;
  steps: Record<InstallHubStage, InstallHubStepState>;
  activeStage: InstallHubStage;
  execution: ExecutionState;
  results: PlatformInstallResult[];
  primaryAction: ReturnType<typeof resolvePrimaryAction>;
  onGoStage: (stage: InstallHubStage) => void;
}) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 94,
        borderRadius: 4,
        border: "1px solid var(--mcs-dashboard-outline-strong)",
        background:
          "linear-gradient(180deg, rgba(20, 30, 36, 0.96) 0%, rgba(12, 18, 22, 0.96) 100%)",
        boxShadow: "var(--mcs-shadow-md)",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("installHub.summaryEyebrow")}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>
            {t("installHub.summaryTitle")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: "var(--mcs-dashboard-muted)" }}>
            {t("installHub.summarySubtitle")}
          </Typography>
        </Box>

        <Stack spacing={1}>
          {(["skills", "platforms", "review"] as InstallHubStage[]).map((stage, index) => (
            <Button
              key={stage}
              variant={stage === activeStage ? "contained" : "text"}
              color={stage === activeStage ? "primary" : "inherit"}
              onClick={() => onGoStage(stage)}
              disabled={execution.running && stage !== "review" ? true : stage !== "skills" && !steps[stage].available}
              sx={{
                justifyContent: "space-between",
                px: 1.2,
                py: 1.05,
                bgcolor: stage === activeStage ? "var(--mcs-dashboard-accent-soft)" : "transparent",
                color: "text.primary",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={String(index + 1).padStart(2, "0")}
                  variant={stage === activeStage ? "filled" : "outlined"}
                />
                <Typography variant="body2" fontWeight={700}>
                  {t(`installHub.stageTitle.${stage}`)}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                {t(`installHub.stepStatus.${resolveStepStatusLabel(stage, steps, activeStage)}`)}
              </Typography>
            </Button>
          ))}
        </Stack>

        <Divider />

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={t("installHub.skillsChip", { count: summary.selectedSkillNames.length })} variant="outlined" />
          <Chip label={t("installHub.platformsChip", { count: summary.selectedPlatforms.length })} variant="outlined" />
          <Chip label={t("installHub.willRunActions", { count: summary.plannedActionCount })} variant="outlined" />
        </Stack>

        <Stack spacing={1.25}>
          <SummaryList
            title={t("installHub.selectedSkillsTitle")}
            emptyLabel={t("installHub.summaryEmptySkills")}
            items={summary.selectedSkillNames}
          />
          <SummaryList
            title={t("installHub.selectedPlatformsTitle")}
            emptyLabel={t("installHub.summaryEmptyPlatforms")}
            items={summary.selectedPlatforms.map((platform) => platform.name)}
          />
        </Stack>

        <Divider />

        <Button
          fullWidth
          variant="contained"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          startIcon={primaryAction.icon}
        >
          {primaryAction.label}
        </Button>

        {execution.phase === "complete" && results.length > 0 ? (
          <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("installHub.summaryResultsHint")}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

function SummaryList({
  title,
  emptyLabel,
  items,
}: {
  title: string;
  emptyLabel: string;
  items: string[];
}) {
  const visibleItems = items.slice(0, 4);
  const overflowCount = items.length - visibleItems.length;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.9 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        {items.length === 0 ? (
          <Chip label={emptyLabel} size="small" variant="outlined" />
        ) : (
          <>
            {visibleItems.map((item) => (
              <Chip key={item} label={item} size="small" variant="outlined" />
            ))}
            {overflowCount > 0 ? (
              <Chip label={`+${overflowCount}`} size="small" variant="outlined" />
            ) : null}
          </>
        )}
      </Stack>
    </Box>
  );
}

function resolvePrimaryAction({
  activeStage,
  execution,
  steps,
  onGoStage,
  onInstall,
  t,
}: {
  activeStage: InstallHubStage;
  execution: ExecutionState;
  steps: Record<InstallHubStage, InstallHubStepState>;
  onGoStage: (stage: InstallHubStage) => void;
  onInstall: () => void;
  t: TranslateFn;
}) {
  if (execution.running) {
    return {
      label: t("installHub.executionRunning"),
      disabled: true,
      icon: <PlayArrowRoundedIcon />,
      onClick: () => {},
    };
  }

  if (activeStage === "skills") {
    return {
      label: t("installHub.continueToPlatforms"),
      disabled: !steps.platforms.available,
      icon: <ArrowForwardRoundedIcon />,
      onClick: () => onGoStage("platforms"),
    };
  }

  if (activeStage === "platforms") {
    return {
      label: t("installHub.continueToReview"),
      disabled: !steps.review.available,
      icon: <ArrowForwardRoundedIcon />,
      onClick: () => onGoStage("review"),
    };
  }

  return {
    label: t("installHub.startInstall"),
    disabled: !steps.review.available,
    icon: <PlayArrowRoundedIcon />,
    onClick: onInstall,
  };
}

function resolveStepStatusLabel(
  stage: InstallHubStage,
  steps: Record<InstallHubStage, InstallHubStepState>,
  activeStage: InstallHubStage,
) {
  if (stage === activeStage) {
    return "current";
  }
  if (steps[stage].complete) {
    return "complete";
  }
  if (steps[stage].available) {
    return "ready";
  }
  return "locked";
}
