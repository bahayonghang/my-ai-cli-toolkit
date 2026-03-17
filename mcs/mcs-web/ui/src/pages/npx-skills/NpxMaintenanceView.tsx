import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import type { NpxSkillsOperation } from "@/types";
import type { JobItemState, RunResultStatus, TranslationFn } from "./types";
import { operationLabel } from "./utils";

export interface NpxMaintenanceViewProps {
  t: TranslationFn;
  jobRunning: boolean;
  openCheckDialog: () => void;
  openUpdateDialog: () => void;
  jobOperation: NpxSkillsOperation | null;
  jobStatusMessage: string | null;
  jobResultStatus: RunResultStatus;
  jobItems: JobItemState[];
  jobCompleted: number;
  jobTotal: number;
  jobSuccessCount: number;
  jobFailureCount: number;
  jobPercent: number;
  jobId: string | null;
  streamDisconnected: boolean;
  expandedJobItemIds: Set<string>;
  toggleJobItemExpanded: (id: string) => void;
  runConfigSummary: { agentsLabel: string; cliModeLabel: string; installTargetLabel: string } | null;
  runConfigPath: string;
}

export default function NpxMaintenanceView({
  t,
  jobRunning,
  openCheckDialog,
  openUpdateDialog,
  jobOperation,
  jobStatusMessage,
  jobResultStatus,
  jobItems,
  jobCompleted,
  jobTotal,
  jobSuccessCount,
  jobFailureCount,
  jobPercent,
  jobId,
  streamDisconnected,
  expandedJobItemIds,
  toggleJobItemExpanded,
  runConfigSummary,
  runConfigPath,
}: NpxMaintenanceViewProps) {
  const theme = useTheme();

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BuildCircleOutlinedIcon color="info" />
                  <Typography variant="h6">{t("npxSkills.checkUpdates")}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t("npxSkills.runCheckHelp")}
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<RefreshIcon />}
                  disabled={jobRunning}
                  onClick={openCheckDialog}
                >
                  {t("npxSkills.checkUpdates")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <SystemUpdateAltIcon color="warning" />
                  <Typography variant="h6">{t("npxSkills.updateAll")}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t("npxSkills.runUpdateHelp")}
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<SystemUpdateAltIcon />}
                  disabled={jobRunning}
                  onClick={openUpdateDialog}
                >
                  {t("npxSkills.updateAll")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
            >
              <Box>
                <Typography variant="h6">
                  {jobOperation ? operationLabel(jobOperation, t) : t("npxSkills.viewMaintenance")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {jobStatusMessage ?? t("npxSkills.jobEmpty")}
                </Typography>
              </Box>
              <Chip
                color={
                  jobResultStatus === "success"
                    ? "success"
                    : jobResultStatus === "warning"
                    ? "warning"
                    : jobResultStatus === "error" || jobResultStatus === "interrupted"
                    ? "error"
                    : jobResultStatus === "running"
                    ? "info"
                    : "default"
                }
                variant={jobResultStatus === "idle" ? "outlined" : "filled"}
                label={
                  jobResultStatus === "success"
                    ? t("npxSkills.runResultSuccess")
                    : jobResultStatus === "warning"
                    ? t("npxSkills.runResultWarning")
                    : jobResultStatus === "error"
                    ? t("npxSkills.runResultError")
                    : jobResultStatus === "interrupted"
                    ? t("npxSkills.runResultInterrupted")
                    : jobResultStatus === "running"
                    ? t("npxSkills.runResultRunning")
                    : t("npxSkills.viewMaintenance")
                }
              />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                variant="outlined"
                label={t("npxSkills.jobQueue", { count: jobItems.length })}
              />
              <Chip
                size="small"
                variant="outlined"
                label={t("npxSkills.jobCurrent", {
                  completed: jobCompleted,
                  total: jobTotal,
                })}
              />
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={t("npxSkills.jobSuccess", { count: jobSuccessCount })}
              />
              <Chip
                size="small"
                color="error"
                variant="outlined"
                label={t("npxSkills.jobFailed", { count: jobFailureCount })}
              />
            </Stack>

            {runConfigSummary && (
              <Card
                variant="outlined"
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}
              >
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Typography variant="overline" color="text.secondary">
                    {t("npxSkills.runConfigExecutedWith")}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    <Chip size="small" variant="outlined" label={runConfigSummary.agentsLabel} />
                    <Chip size="small" variant="outlined" label={runConfigSummary.cliModeLabel} />
                    <Chip size="small" variant="outlined" label={runConfigSummary.installTargetLabel} />
                    <Chip size="small" color="info" variant="outlined" label={t("npxSkills.runConfigTemporaryOverride")} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
                    {runConfigPath
                      ? t("npxSkills.runConfigCurrentPath", {
                          path: runConfigPath,
                        })
                      : t("npxSkills.runConfigUnknownPath")}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {(jobRunning || jobTotal > 0) && (
            <Box>
              <LinearProgress
                aria-label="job progress"
                variant="determinate"
                value={Math.max(0, Math.min(100, jobPercent))}
                sx={{ height: 8, borderRadius: 999 }}
              />
              {jobId && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                  Job: {jobId}
                </Typography>
              )}
              {streamDisconnected && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {t("npxSkills.jobConnectionLost")}
                </Alert>
              )}
            </Box>
          )}

          {jobItems.length === 0 ? (
            <Alert severity="info">{t("npxSkills.jobEmpty")}</Alert>
          ) : (
            <Stack spacing={1}>
              {jobItems.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{
                    bgcolor:
                      item.status === "running"
                        ? alpha(theme.palette.info.main, 0.06)
                        : item.status === "success"
                        ? alpha(theme.palette.success.main, 0.06)
                        : item.status === "error"
                        ? alpha(theme.palette.error.main, 0.06)
                        : "background.paper",
                  }}
                >
                  <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                      mb={1}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {item.label}
                      </Typography>
                      <Chip
                        size="small"
                        color={
                          item.status === "success"
                            ? "success"
                            : item.status === "error"
                            ? "error"
                            : item.status === "running"
                            ? "info"
                            : "default"
                        }
                        label={
                          item.status === "success"
                            ? t("npxSkills.itemStatusSuccess")
                            : item.status === "error"
                            ? t("npxSkills.itemStatusError")
                            : item.status === "running"
                            ? t("npxSkills.itemStatusRunning")
                            : t("npxSkills.itemStatusPending")
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.durationMs != null ? `${item.durationMs}ms` : ""}
                    </Typography>
                    {item.error && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {t("npxSkills.itemErrorSummary")}: {item.error}
                      </Typography>
                    )}
                    {(item.output || item.error) && (
                      <>
                        <Button
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => toggleJobItemExpanded(item.id)}
                        >
                          {expandedJobItemIds.has(item.id)
                            ? t("npxSkills.itemHideDetails")
                            : t("npxSkills.itemShowDetails")}
                        </Button>
                        {expandedJobItemIds.has(item.id) && (
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "var(--mcs-surface-muted)",
                              border: `1px solid ${theme.palette.divider}`,
                              fontFamily: '"Fira Code", monospace',
                              fontSize: "0.75rem",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.error && (
                              <Box sx={{ mb: item.output ? 1.5 : 0 }}>
                                <Typography variant="caption" color="error" sx={{ display: "block", mb: 0.5 }}>
                                  {t("npxSkills.itemErrorSummary")}
                                </Typography>
                                {item.error}
                              </Box>
                            )}
                            {item.output && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                  {t("npxSkills.itemOutputLabel")}
                                </Typography>
                                {item.output}
                              </Box>
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
