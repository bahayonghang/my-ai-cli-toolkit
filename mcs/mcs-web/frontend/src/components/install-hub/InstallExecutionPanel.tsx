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
  const totalTasks = selectedSkillCount * selectedPlatformCount;
  const canInstall =
    !execution.running && selectedSkillCount > 0 && selectedPlatformCount > 0;
  const progressValue = progressPercent(execution.currentStep, execution.totalSteps);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="Execution" subheader={`Will run ${totalTasks} install actions`} />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Chip label={`${selectedSkillCount} skills`} color="primary" variant="outlined" />
            <Chip label={`${selectedPlatformCount} platforms`} color="secondary" variant="outlined" />
          </Stack>

          {execution.running && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Installing on platform {execution.currentStep} / {execution.totalSteps}
              </Typography>
              <LinearProgress variant="determinate" value={progressValue} />
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={onInstall} disabled={!canInstall}>
              Start Install
            </Button>
            <Button variant="text" onClick={onClearResults} disabled={execution.running || results.length === 0}>
              Clear Results
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
  if (results.length === 0) {
    return <Alert severity="info">No execution results yet.</Alert>;
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
  const severity = resolveSeverity(result);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
          <Typography fontWeight={600}>{`${result.platform.icon} ${result.platform.name}`}</Typography>
          <Chip label={`${result.successCount} success`} size="small" color="success" variant="outlined" />
          <Chip label={`${result.failureCount} failed`} size="small" color="error" variant="outlined" />
          <Chip label={severity.toUpperCase()} size="small" color={severity} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {result.requestError && <Alert severity="error" sx={{ mb: 1 }}>{result.requestError}</Alert>}
        {result.results.length === 0 ? (
          <Typography color="text.secondary">No item-level results.</Typography>
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
              <Alert severity="success">All selected skills installed successfully.</Alert>
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
