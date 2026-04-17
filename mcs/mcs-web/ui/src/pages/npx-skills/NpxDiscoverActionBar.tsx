import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import TerminalIcon from "@mui/icons-material/Terminal";
import {
  Box,
  Button,
  Chip,
  Collapse,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import type { NpxSkillsOperation } from "@/types";
import type {
  JobItemState,
  JobLogEntry,
  RunResultStatus,
  TranslationFn,
} from "./types";
import { operationLabel } from "./utils";

export interface NpxDiscoverActionBarProps {
  t: TranslationFn;
  selectedSkillCount: number;
  selectedPackageCount: number;
  selectedNamesPreview: string[];
  installTargetSummary: {
    mode: "global" | "project";
    path: string;
  };
  installDisabled: boolean;
  jobRunning: boolean;
  activityRunId: string | null;
  jobOperation: NpxSkillsOperation | null;
  jobStatusMessage: string | null;
  jobResultStatus: RunResultStatus;
  jobCompleted: number;
  jobTotal: number;
  jobSuccessCount: number;
  jobFailureCount: number;
  jobPercent: number;
  runningItemLabel: string | null;
  streamDisconnected: boolean;
  jobItems: JobItemState[];
  jobLogEntries: JobLogEntry[];
  onInstall: () => void;
  onClearSelection: () => void;
  onViewActivity?: (runId: string) => void;
}

function logLevelStyles(level: JobLogEntry["level"]) {
  switch (level) {
    case "success":
      return {
        color: "success",
        backgroundColor: "var(--mcs-success-soft)",
      } as const;
    case "warning":
      return {
        color: "warning",
        backgroundColor: "var(--mcs-warning-soft)",
      } as const;
    case "error":
      return {
        color: "error",
        backgroundColor: "rgba(211, 93, 110, 0.12)",
      } as const;
    default:
      return {
        color: "info",
        backgroundColor: "var(--mcs-accent-soft)",
      } as const;
  }
}

function formatTimestamp(timestampMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestampMs));
}

export default function NpxDiscoverActionBar({
  t,
  selectedSkillCount,
  selectedPackageCount,
  selectedNamesPreview,
  installTargetSummary,
  installDisabled,
  jobRunning,
  activityRunId,
  jobOperation,
  jobStatusMessage,
  jobResultStatus,
  jobCompleted,
  jobTotal,
  jobSuccessCount,
  jobFailureCount,
  jobPercent,
  runningItemLabel,
  streamDisconnected,
  jobItems,
  jobLogEntries,
  onInstall,
  onClearSelection,
  onViewActivity,
}: NpxDiscoverActionBarProps) {
  const [logPanelOpen, setLogPanelOpen] = useState(
    () => jobRunning || jobLogEntries.length > 0,
  );
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [expandedFailedIds, setExpandedFailedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (jobRunning || jobLogEntries.length > 0) {
      setLogPanelOpen(true);
    }
  }, [jobLogEntries.length, jobRunning]);

  const hasSelection = selectedSkillCount > 0;
  const hasLogs = jobLogEntries.length > 0;
  const failedItems = useMemo(
    () => jobItems.filter((item) => item.status === "error"),
    [jobItems],
  );
  const failurePreview = useMemo(() => failedItems.slice(0, 3), [failedItems]);
  const progressValue = Math.max(0, Math.min(100, jobPercent));
  const statusLabel =
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
              : null;
  const installTargetLabel =
    installTargetSummary.mode === "project"
      ? t("installed.installTargetProject")
      : t("installed.installTargetGlobal");
  const compactNames = useMemo(
    () => selectedNamesPreview.slice(0, 3),
    [selectedNamesPreview],
  );

  return (
    <Box
      sx={{
        position: "fixed",
        left: { xs: 12, md: "calc(280px + 24px)" },
        right: { xs: 12, md: 24 },
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        zIndex: 18,
      }}
    >
      <Box sx={{ maxWidth: 1220, mx: "auto" }}>
        <Box
          sx={{
            borderRadius: 4,
            border: "1px solid var(--mcs-workbench-outline-strong)",
            backgroundColor: "var(--mcs-panel-fill-strong)",
            boxShadow: "var(--mcs-shadow-lg)",
            overflow: "hidden",
          }}
        >
          <Stack spacing={1.4} sx={{ px: { xs: 1.5, md: 2 }, py: 1.35 }}>
            {jobRunning || jobResultStatus !== "idle" ? (
              <Stack spacing={1}>
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", lg: "center" }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {jobOperation
                        ? operationLabel(jobOperation, t)
                        : t("npxSkills.operationInstall")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {jobStatusMessage ?? t("npxSkills.jobEmpty")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {statusLabel ? (
                      <Chip size="small" color="info" variant="outlined" label={statusLabel} />
                    ) : null}
                    <Chip
                      size="small"
                      variant="outlined"
                      label={t("npxSkills.jobCurrent", {
                        completed: jobCompleted,
                        total: jobTotal,
                      })}
                    />
                    <Chip size="small" variant="outlined" label={`${Math.round(progressValue)}%`} />
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
                    {activityRunId && onViewActivity ? (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onViewActivity(activityRunId)}
                      >
                        {t("activity.viewRun")}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{ height: 8, borderRadius: 999 }}
                />

                {runningItemLabel ? (
                  <Typography variant="caption" color="text.secondary">
                    {t("npxSkills.itemStatusRunning")}: {runningItemLabel}
                  </Typography>
                ) : null}

                {failedItems.length > 0 ? (
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: "1px solid rgba(211, 93, 110, 0.35)",
                      backgroundColor: "rgba(211, 93, 110, 0.1)",
                      px: 1.2,
                      py: 1.1,
                    }}
                  >
                    <Stack spacing={0.9}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "error.main" }}>
                            {t("npxSkills.discoverFailureTitle", {
                              count: failedItems.length,
                            })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {streamDisconnected
                              ? t("npxSkills.discoverFailureInterruptedHint")
                              : t("npxSkills.discoverFailureHint")}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setLogPanelOpen(true)}
                        >
                          {t("npxSkills.discoverFailureDetails")}
                        </Button>
                      </Stack>
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                        {failurePreview.map((item) => (
                          <Chip
                            key={item.id}
                            size="small"
                            color="error"
                            variant="outlined"
                            label={item.label}
                          />
                        ))}
                        {failedItems.length > failurePreview.length ? (
                          <Chip
                            size="small"
                            color="error"
                            variant="outlined"
                            label={t("npxSkills.discoverFailureMore", {
                              count: failedItems.length - failurePreview.length,
                            })}
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            ) : null}

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <Stack spacing={0.85} sx={{ minWidth: 0, flexGrow: 1 }}>
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  <Chip
                    size="small"
                    color={hasSelection ? "primary" : "default"}
                    label={t("npxSkills.discoverSelectionSummary", {
                      skills: selectedSkillCount,
                      packages: selectedPackageCount,
                    })}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={t("npxSkills.discoverInstallTargetChip", {
                      mode: installTargetLabel,
                    })}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {hasSelection
                    ? t("npxSkills.discoverSelectionReady")
                    : t("npxSkills.discoverSelectionEmpty")}
                </Typography>

                {compactNames.length > 0 ? (
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {compactNames.map((name) => (
                      <Chip key={name} size="small" variant="outlined" label={name} />
                    ))}
                    {selectedSkillCount > compactNames.length ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t("npxSkills.discoverSelectionMore", {
                          count: selectedSkillCount - compactNames.length,
                        })}
                      />
                    ) : null}
                  </Stack>
                ) : null}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {installTargetSummary.path}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant={hasLogs ? "outlined" : "text"}
                  startIcon={<TerminalIcon />}
                  onClick={() => setLogPanelOpen((previous) => !previous)}
                >
                  {logPanelOpen
                    ? t("npxSkills.discoverHideLogs")
                    : t("npxSkills.discoverShowLogs")}
                  {logPanelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Button>
                {hasSelection ? (
                  <Button
                    variant="text"
                    onClick={onClearSelection}
                    disabled={jobRunning}
                  >
                    {t("common.clear")}
                  </Button>
                ) : null}
                <Button
                  variant="contained"
                  startIcon={<InstallDesktopIcon />}
                  disabled={installDisabled}
                  onClick={onInstall}
                >
                  {t("npxSkills.installSelected")}
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Collapse in={logPanelOpen}>
            <Box
              sx={{
                borderTop: "1px solid var(--mcs-panel-stroke-soft)",
                backgroundColor: "var(--mcs-panel-fill-emphasis)",
                px: { xs: 1.5, md: 2 },
                py: 1.5,
              }}
            >
              <Stack spacing={1.1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {t("npxSkills.discoverLogTitle")}
                </Typography>

                {streamDisconnected ? (
                  <Typography variant="caption" color="warning.main">
                    {t("npxSkills.jobConnectionLost")}
                  </Typography>
                ) : null}

                {failedItems.length > 0 ? (
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>
                      {t("npxSkills.discoverFailureSectionTitle")}
                    </Typography>
                    <Stack spacing={1}>
                      {failedItems.map((item) => {
                        const expanded = expandedFailedIds.has(item.id);
                        return (
                          <Box
                            key={item.id}
                            sx={{
                              borderRadius: 3,
                              border: "1px solid rgba(211, 93, 110, 0.35)",
                              backgroundColor: "rgba(211, 93, 110, 0.06)",
                              p: 1.2,
                            }}
                          >
                            <Stack spacing={0.8}>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={0.8}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                              >
                                <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap">
                                  <Chip
                                    size="small"
                                    color="error"
                                    label={t("npxSkills.itemStatusError")}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {item.label}
                                  </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {item.durationMs != null ? `${item.durationMs}ms` : ""}
                                </Typography>
                              </Stack>

                              {(item.error || item.output) ? (
                                <Box>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() =>
                                      setExpandedFailedIds((previous) => {
                                        const next = new Set(previous);
                                        if (next.has(item.id)) {
                                          next.delete(item.id);
                                        } else {
                                          next.add(item.id);
                                        }
                                        return next;
                                      })
                                    }
                                  >
                                    {expanded
                                      ? t("npxSkills.itemHideDetails")
                                      : t("npxSkills.itemShowDetails")}
                                  </Button>
                                  <Collapse in={expanded}>
                                    <Stack
                                      spacing={1}
                                      sx={{
                                        mt: 1,
                                        p: 1.2,
                                        borderRadius: 2.5,
                                        border: "1px solid var(--mcs-panel-stroke-soft)",
                                        backgroundColor: "var(--mcs-surface-subtle)",
                                        fontFamily: "var(--font-family-mono)",
                                        fontSize: "0.75rem",
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      {item.error ? (
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            color="error.main"
                                            sx={{ display: "block", mb: 0.5 }}
                                          >
                                            {t("npxSkills.itemErrorSummary")}
                                          </Typography>
                                          {item.error}
                                        </Box>
                                      ) : null}
                                      {item.output ? (
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: "block", mb: 0.5 }}
                                          >
                                            {t("npxSkills.itemOutputLabel")}
                                          </Typography>
                                          {item.output}
                                        </Box>
                                      ) : null}
                                    </Stack>
                                  </Collapse>
                                </Box>
                              ) : null}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Stack>
                ) : null}

                {hasLogs ? (
                  <Stack spacing={1} sx={{ maxHeight: 300, overflowY: "auto", pr: 0.25 }}>
                    {jobLogEntries.map((entry) => {
                      const expanded = expandedLogIds.has(entry.id);
                      const styles = logLevelStyles(entry.level);
                      return (
                        <Box
                          key={entry.id}
                          sx={{
                            borderRadius: 3,
                            border: "1px solid var(--mcs-panel-stroke-soft)",
                            backgroundColor: "var(--mcs-panel-fill)",
                            p: 1.25,
                          }}
                        >
                          <Stack spacing={0.9}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={0.8}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "center" }}
                            >
                              <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap">
                                <Chip
                                  size="small"
                                  color={styles.color}
                                  label={entry.message}
                                  sx={{ backgroundColor: styles.backgroundColor }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {entry.label}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(entry.timestampMs)}
                                {entry.durationMs != null ? ` · ${entry.durationMs}ms` : ""}
                              </Typography>
                            </Stack>

                            {(entry.error || entry.output) ? (
                              <Box>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() =>
                                    setExpandedLogIds((previous) => {
                                      const next = new Set(previous);
                                      if (next.has(entry.id)) {
                                        next.delete(entry.id);
                                      } else {
                                        next.add(entry.id);
                                      }
                                      return next;
                                    })
                                  }
                                >
                                  {expanded
                                    ? t("npxSkills.itemHideDetails")
                                    : t("npxSkills.itemShowDetails")}
                                </Button>
                                <Collapse in={expanded}>
                                  <Stack
                                    spacing={1}
                                    sx={{
                                      mt: 1,
                                      p: 1.2,
                                      borderRadius: 2.5,
                                      border: "1px solid var(--mcs-panel-stroke-soft)",
                                      backgroundColor: "var(--mcs-surface-subtle)",
                                      fontFamily: "var(--font-family-mono)",
                                      fontSize: "0.75rem",
                                      whiteSpace: "pre-wrap",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {entry.error ? (
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          color="error.main"
                                          sx={{ display: "block", mb: 0.5 }}
                                        >
                                          {t("npxSkills.itemErrorSummary")}
                                        </Typography>
                                        {entry.error}
                                      </Box>
                                    ) : null}
                                    {entry.output ? (
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block", mb: 0.5 }}
                                        >
                                          {t("npxSkills.itemOutputLabel")}
                                        </Typography>
                                        {entry.output}
                                      </Box>
                                    ) : null}
                                  </Stack>
                                </Collapse>
                              </Box>
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("npxSkills.discoverLogEmpty")}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
}
