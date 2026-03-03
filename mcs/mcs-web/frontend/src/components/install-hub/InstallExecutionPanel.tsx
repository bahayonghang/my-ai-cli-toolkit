import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { ExecutionState, PlatformInstallResult } from "./types";
import { useI18n } from "@/i18n";

interface Props {
  selectedSkillCount: number;
  selectedPlatformCount: number;
  execution: ExecutionState;
  results: PlatformInstallResult[];
  onInstall: () => void;
  onClearResults: () => void;
}

export function InstallExecutionPanel({
  selectedSkillCount,
  selectedPlatformCount,
  execution,
  results,
  onInstall,
  onClearResults,
}: Props) {
  const { t } = useI18n();
  const totalTasks = selectedSkillCount * selectedPlatformCount;
  const canInstall =
    !execution.running && selectedSkillCount > 0 && selectedPlatformCount > 0;
  const progressValue = progressPercent(execution.currentStep, execution.totalSteps);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title={t("installHub.execution")}
        subheader={t("installHub.willRunActions", { count: totalTasks })}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Chip
              label={t("installHub.skillsChip", { count: selectedSkillCount })}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={t("installHub.platformsChip", { count: selectedPlatformCount })}
              color="secondary"
              variant="outlined"
            />
          </Stack>

          {execution.running && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("installHub.installingOnPlatform", {
                  current: execution.currentStep,
                  total: execution.totalSteps,
                })}
              </Typography>
              <LinearProgress variant="determinate" value={progressValue} />
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={onInstall} disabled={!canInstall}>
              {t("installHub.startInstall")}
            </Button>
            <Button variant="text" onClick={onClearResults} disabled={execution.running || results.length === 0}>
              {t("installHub.clearResults")}
            </Button>
          </Stack>

          <ResultsView results={results} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function progressPercent(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(100, (currentStep / totalSteps) * 100);
}

interface ResultsViewProps {
  results: PlatformInstallResult[];
}

function ResultsView({ results }: ResultsViewProps) {
  const { t } = useI18n();
  if (results.length === 0) {
    return <Alert severity="info">{t("installHub.noExecutionResults")}</Alert>;
  }

  return (
    <Stack spacing={1}>
      {results.map((result) => (
        <PlatformResultAccordion key={result.platform.id} result={result} />
      ))}
    </Stack>
  );
}

interface PlatformResultAccordionProps {
  result: PlatformInstallResult;
}

function PlatformResultAccordion({ result }: PlatformResultAccordionProps) {
  const { t } = useI18n();
  const severity = resolveSeverity(result);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
          <Typography fontWeight={600}>{`${result.platform.icon} ${result.platform.name}`}</Typography>
          <Chip
            label={t("installHub.successCount", { count: result.successCount })}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={t("installHub.failedCount", { count: result.failureCount })}
            size="small"
            color="error"
            variant="outlined"
          />
          <Chip label={severity.toUpperCase()} size="small" color={severity} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {result.requestError && <Alert severity="error" sx={{ mb: 1 }}>{result.requestError}</Alert>}
        {result.results.length === 0 ? (
          <Typography color="text.secondary">{t("installHub.noItemLevelResults")}</Typography>
        ) : (
          <Stack spacing={0.5}>
            {result.results
              .filter((item) => !item.success)
              .map((item) => (
                <Alert key={`${result.platform.id}-${item.item_name}`} severity="error">
                  {item.item_name}: {item.error ?? item.message}
                </Alert>
              ))}
            {result.failureCount === 0 && (
              <Alert severity="success">{t("installHub.allSelectedInstalled")}</Alert>
            )}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

function resolveSeverity(
  result: PlatformInstallResult
): "success" | "warning" | "error" {
  if (result.failureCount === 0 && !result.requestError) return "success";
  if (result.successCount > 0) return "warning";
  return "error";
}
