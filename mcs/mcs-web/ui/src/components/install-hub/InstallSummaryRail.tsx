import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
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
        display: { xs: "block", lg: "none" },
        mt: 2.5,
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid var(--mcs-workbench-outline-strong)",
          backgroundColor: "var(--mcs-panel-fill-strong)",
          boxShadow: "var(--mcs-shadow-sm)",
          px: 1.75,
          py: 1.75,
        }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "var(--mcs-workbench-muted)" }}
              >
                {t(`installHub.stageTitle.${activeStage}`)}
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{ letterSpacing: "-0.03em" }}
              >
                {t("installHub.willRunActions", {
                  count: summary.plannedActionCount,
                })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75}>
              <Chip
                label={t("installHub.skillsChip", {
                  count: summary.selectedItemNames.length,
                })}
                size="small"
              />
              <Chip
                label={t("installHub.platformsChip", {
                  count: summary.selectedPlatforms.length,
                })}
                size="small"
              />
            </Stack>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            startIcon={primaryAction.icon}
            sx={{ boxShadow: "none" }}
          >
            {primaryAction.label}
          </Button>

          {execution.phase === "complete" && results.length > 0 ? (
            <Typography
              variant="caption"
              sx={{ color: "var(--mcs-workbench-muted)" }}
            >
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
        top: "var(--mcs-sticky-offset-tight)",
        borderRadius: 3,
        border: "1px solid var(--mcs-workbench-outline-strong)",
        backgroundColor: "var(--mcs-panel-fill-strong)",
        boxShadow: "var(--mcs-shadow-sm)",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "var(--mcs-workbench-muted)" }}
          >
            {t("installHub.summaryEyebrow")}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5, letterSpacing: "-0.04em" }}>
            {t("installHub.summaryTitle")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              color: "var(--mcs-workbench-muted)",
              lineHeight: 1.7,
            }}
          >
            {t("installHub.summarySubtitle")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          <SummaryMetric
            value={summary.selectedItemNames.length}
            label={t("installHub.skillsChip", {
              count: summary.selectedItemNames.length,
            })}
          />
          <SummaryMetric
            value={summary.selectedPlatforms.length}
            label={t("installHub.platformsChip", {
              count: summary.selectedPlatforms.length,
            })}
          />
          <SummaryMetric
            value={summary.plannedActionCount}
            label={t("installHub.willRunActions", {
              count: summary.plannedActionCount,
            })}
          />
        </Box>

        <Stack spacing={1}>
          {(["skills", "platforms", "review"] as InstallHubStage[]).map(
            (stage, index) => {
              const isActive = stage === activeStage;
              const disabled =
                execution.running && stage !== "review"
                  ? true
                  : stage !== "skills" && !steps[stage].available;

              return (
                <Button
                  key={stage}
                  variant="text"
                  color="inherit"
                  onClick={() => onGoStage(stage)}
                  disabled={disabled}
                  sx={{
                    justifyContent: "space-between",
                    px: 1.25,
                    py: 1.15,
                    minHeight: 54,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: isActive
                      ? "var(--mcs-workbench-outline-strong)"
                      : "var(--mcs-workbench-outline)",
                    bgcolor: isActive
                      ? "var(--mcs-workbench-accent-soft)"
                      : "transparent",
                    boxShadow: isActive
                      ? "var(--mcs-summary-tile-shadow)"
                      : "none",
                    color: "text.primary",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={String(index + 1).padStart(2, "0")}
                      variant={isActive ? "filled" : "outlined"}
                      sx={{ minWidth: 42 }}
                    />
                    <Typography variant="body2" fontWeight={700}>
                      {t(`installHub.stageTitle.${stage}`)}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--mcs-workbench-muted)" }}
                  >
                    {t(
                      `installHub.stepStatus.${resolveStepStatusLabel(stage, steps, activeStage)}`,
                    )}
                  </Typography>
                </Button>
              );
            },
          )}
        </Stack>

        <Divider />

        <Stack spacing={1.25}>
          <SummaryList
            title={t("installHub.selectedSkillsTitle")}
            emptyLabel={t("installHub.summaryEmptySkills")}
            items={summary.selectedItemNames}
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
          sx={{ minHeight: 48, boxShadow: "none" }}
        >
          {primaryAction.label}
        </Button>

        {execution.phase === "complete" && results.length > 0 ? (
          <Typography
            variant="caption"
            sx={{ color: "var(--mcs-workbench-muted)" }}
          >
            {t("installHub.summaryResultsHint")}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

function SummaryMetric({ value, label }: { value: number; label: string }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        borderRadius: 3,
        px: 1.25,
        py: 1.1,
        border: "1px solid var(--mcs-workbench-outline)",
        backgroundColor: "var(--mcs-summary-tile-fill-strong)",
        boxShadow: "var(--mcs-shadow-sm)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05 }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "var(--mcs-workbench-muted)", display: "block", mt: 0.35 }}
      >
        {label}
      </Typography>
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
              <Chip
                label={`+${overflowCount}`}
                size="small"
                variant="outlined"
              />
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
