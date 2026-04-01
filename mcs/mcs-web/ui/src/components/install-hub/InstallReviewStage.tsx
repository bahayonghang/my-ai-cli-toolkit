import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useI18n } from "@/i18n";
import { summarizeInstallResults } from "@/pages/installHubLogic";
import type { ExecutionState, PlatformInstallResult } from "./types";
import type { ItemType, PlatformDisplay } from "@/types";
import { PlatformIdentity } from "@/components/platform/PlatformVisuals";
import { getPlatformInstallPath } from "@/utils/installHubContent";

interface InstallReviewStageProps {
  selectedSkillNames: string[];
  itemType: ItemType;
  selectedPlatforms: PlatformDisplay[];
  plannedActionCount: number;
  execution: ExecutionState;
  results: PlatformInstallResult[];
  onInstall: () => void;
  onClearResults: () => void;
}

export function InstallReviewStage({
  selectedSkillNames,
  itemType,
  selectedPlatforms,
  plannedActionCount,
  execution,
  results,
  onInstall,
  onClearResults,
}: InstallReviewStageProps) {
  const { t } = useI18n();
  const canInstall =
    !execution.running &&
    selectedSkillNames.length > 0 &&
    selectedPlatforms.length > 0;
  const progressValue = progressPercent(
    execution.currentStep,
    execution.totalSteps,
  );
  const currentPlatformName = selectedPlatforms.find(
    (platform) => platform.id === execution.activePlatformId,
  )?.name;
  const summary = useMemo(() => summarizeInstallResults(results), [results]);

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={t("installHub.skillsChip", {
              count: selectedSkillNames.length,
            })}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={t("installHub.platformsChip", {
              count: selectedPlatforms.length,
            })}
            color="secondary"
            variant="outlined"
          />
          <Chip
            label={t("installHub.willRunActions", {
              count: plannedActionCount,
            })}
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            variant="contained"
            onClick={onInstall}
            disabled={!canInstall}
            startIcon={<PlayArrowRoundedIcon />}
          >
            {t("installHub.startInstall")}
          </Button>
          <Button
            variant="text"
            onClick={onClearResults}
            disabled={execution.running || results.length === 0}
            startIcon={<ReplayRoundedIcon />}
          >
            {t("installHub.clearResults")}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            xl: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
          },
        }}
      >
        <ReviewPreviewBlock
          selectedSkillNames={selectedSkillNames}
          itemType={itemType}
          selectedPlatforms={selectedPlatforms}
          plannedActionCount={plannedActionCount}
        />
        <ExecutionStatusBlock
          execution={execution}
          progressValue={progressValue}
          currentPlatformName={currentPlatformName}
          results={results}
          summary={summary}
        />
      </Box>

      <ResultsView results={results} />
    </Stack>
  );
}

function ReviewPreviewBlock({
  selectedSkillNames,
  itemType,
  selectedPlatforms,
  plannedActionCount,
}: {
  selectedSkillNames: string[];
  itemType: ItemType;
  selectedPlatforms: PlatformDisplay[];
  plannedActionCount: number;
}) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid var(--mcs-workbench-outline)",
        background:
          "linear-gradient(180deg, var(--mcs-panel-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
        p: { xs: 2, md: 2.4 },
      }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "var(--mcs-workbench-muted)" }}
          >
            {t("installHub.reviewSelection")}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {t("installHub.executionScopeTitle")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.75, color: "var(--mcs-workbench-muted)" }}
          >
            {t("installHub.reviewSelectionHint", { count: plannedActionCount })}
          </Typography>
        </Box>

        <Stack spacing={1.25}>
          <Typography variant="subtitle2">
            {t("installHub.selectedSkillsTitle")}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {selectedSkillNames.length === 0 ? (
              <Chip
                icon={<InfoOutlinedIcon fontSize="small" />}
                label={t("installHub.summaryEmptySkills")}
                variant="outlined"
              />
            ) : (
              selectedSkillNames.map((name) => (
                <Chip key={name} label={name} variant="outlined" />
              ))
            )}
          </Stack>
        </Stack>

        <Stack spacing={1.25}>
          <Typography variant="subtitle2">
            {t("installHub.selectedPlatformsTitle")}
          </Typography>
          <Stack spacing={1}>
            {selectedPlatforms.length === 0 ? (
              <Chip
                icon={<InfoOutlinedIcon fontSize="small" />}
                label={t("installHub.summaryEmptyPlatforms")}
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            ) : (
              selectedPlatforms.map((platform) => (
                <Box
                  key={platform.id}
                  sx={{
                    px: 1.5,
                    py: 1.35,
                    borderRadius: 2.5,
                    border: "1px solid var(--mcs-workbench-outline)",
                    bgcolor: "var(--mcs-workbench-surface-muted)",
                  }}
                >
                  <PlatformIdentity
                    platformId={platform.id}
                    name={platform.name}
                    fallbackIcon={platform.icon}
                    subtitle={getPlatformInstallPath(platform, itemType, t)}
                    size={42}
                  />
                </Box>
              ))
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

function ExecutionStatusBlock({
  execution,
  progressValue,
  currentPlatformName,
  results,
  summary,
}: {
  execution: ExecutionState;
  progressValue: number;
  currentPlatformName?: string;
  results: PlatformInstallResult[];
  summary: ReturnType<typeof summarizeInstallResults>;
}) {
  const { t } = useI18n();
  const phaseLabel =
    execution.phase === "running"
      ? t("installHub.executionRunning")
      : execution.phase === "complete"
        ? t("installHub.executionFinished")
        : t("installHub.executionIdle");

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid var(--mcs-workbench-outline)",
        background:
          "linear-gradient(180deg, var(--mcs-panel-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
        p: { xs: 2, md: 2.4 },
      }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "var(--mcs-workbench-muted)" }}
          >
            {t("installHub.execution")}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {phaseLabel}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={t("installHub.successCount", {
              count: summary.totalSuccess,
            })}
            color="success"
            variant="outlined"
          />
          <Chip
            label={t("installHub.failedCount", { count: summary.totalFailure })}
            color={summary.totalFailure > 0 ? "error" : "default"}
            variant="outlined"
          />
          <Chip
            label={t("common.selectedCount", { count: results.length })}
            variant="outlined"
          />
        </Stack>

        {execution.running ? (
          <Stack spacing={1}>
            <Typography
              variant="body2"
              sx={{ color: "var(--mcs-workbench-muted)" }}
            >
              {t("installHub.installingOnPlatform", {
                current: execution.currentStep,
                total: execution.totalSteps,
              })}
            </Typography>
            {currentPlatformName ? (
              <Typography variant="body2">
                {t("installHub.currentPlatformLabel", {
                  platform: currentPlatformName,
                })}
              </Typography>
            ) : null}
            <LinearProgress variant="determinate" value={progressValue} />
          </Stack>
        ) : results.length === 0 ? (
          <Alert severity="info">{t("installHub.noExecutionResults")}</Alert>
        ) : (
          <Alert severity={summary.totalFailure > 0 ? "warning" : "success"}>
            {t("installHub.installFinished", {
              success: summary.totalSuccess,
              failed: summary.totalFailure,
              suffix: "",
            })}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

function ResultsView({ results }: { results: PlatformInstallResult[] }) {
  if (results.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      {results.map((result) => (
        <PlatformResultBlock key={result.platform.id} result={result} />
      ))}
    </Stack>
  );
}

function PlatformResultBlock({ result }: { result: PlatformInstallResult }) {
  const { t } = useI18n();
  const severity = resolveSeverity(result);
  const failedItems = result.results.filter((item) => !item.success);
  const reusedItems = result.results.filter((item) =>
    item.message.includes("Reused shared-path"),
  );

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor:
          severity === "success"
            ? "var(--mcs-success-border)"
            : severity === "warning"
              ? "var(--mcs-warning-progress-strong)"
              : "var(--mcs-error-border)",
        background:
          severity === "success"
            ? "var(--mcs-success-surface)"
            : severity === "warning"
              ? "var(--mcs-warning-progress)"
              : "var(--mcs-error-surface)",
        p: { xs: 1.75, md: 2 },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <PlatformIdentity
            platformId={result.platform.id}
            name={result.platform.name}
            fallbackIcon={result.platform.icon}
            size={40}
          />
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={t("installHub.successCount", {
                count: result.successCount,
              })}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={t("installHub.failedCount", {
                count: result.failureCount,
              })}
              size="small"
              color={result.failureCount > 0 ? "error" : "default"}
              variant="outlined"
            />
            <Chip
              label={t(`installHub.resultTone.${severity}`)}
              size="small"
              color={severity}
            />
          </Stack>
        </Stack>

        {result.requestError ? (
          <Alert severity="error">{result.requestError}</Alert>
        ) : null}

        {result.results.length === 0 ? (
          <Typography color="text.secondary">
            {t("installHub.noItemLevelResults")}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {failedItems.map((item) => (
              <Alert
                key={`${result.platform.id}-${item.item_name}`}
                severity="error"
              >
                {item.item_name}: {item.error ?? item.message}
              </Alert>
            ))}
            {reusedItems.map((item, index) => (
              <Alert
                key={`${result.platform.id}-reused-${item.item_name}-${index}`}
                severity="info"
              >
                {item.item_name}: {item.message}
              </Alert>
            ))}
            {result.failureCount === 0 && reusedItems.length === 0 ? (
              <Alert severity="success">
                {t("installHub.allSelectedInstalled")}
              </Alert>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function progressPercent(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(100, (currentStep / totalSteps) * 100);
}

function resolveSeverity(
  result: PlatformInstallResult,
): "success" | "warning" | "error" {
  if (result.failureCount === 0 && !result.requestError) return "success";
  if (result.successCount > 0) return "warning";
  return "error";
}
