import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

interface InstallStagePanelProps {
  stepNumber: number;
  title: string;
  description: string;
  active: boolean;
  available: boolean;
  complete: boolean;
  statusLabel: string;
  preview?: React.ReactNode;
  actionLabel?: string;
  onActivate?: () => void;
  children: React.ReactNode;
}

export function InstallStagePanel({
  stepNumber,
  title,
  description,
  active,
  available,
  complete,
  statusLabel,
  preview,
  actionLabel,
  onActivate,
  children,
}: InstallStagePanelProps) {
  const locked = !available && !active;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        borderRadius: 4,
        border: "1px solid",
        borderColor: active
          ? "var(--mcs-workbench-outline-strong)"
          : complete
            ? "var(--mcs-success-border)"
            : locked
              ? "var(--mcs-workbench-outline)"
              : "var(--mcs-workbench-outline)",
        background: active
          ? "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-panel-fill-strong) 48%, var(--mcs-panel-fill) 100%)"
          : complete
            ? "linear-gradient(180deg, var(--mcs-success-surface) 0%, var(--mcs-summary-tile-fill) 100%)"
            : locked
              ? "linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, var(--mcs-panel-fill) 100%)"
              : "linear-gradient(180deg, var(--mcs-workbench-surface-strong) 0%, var(--mcs-panel-fill) 100%)",
        boxShadow: active
          ? "var(--mcs-summary-tile-shadow)"
          : complete
            ? "0 14px 32px rgba(15, 23, 42, 0.12)"
            : locked
              ? "none"
              : "0 14px 32px rgba(15, 23, 42, 0.1)",
        opacity: locked ? 0.9 : 1,
        overflow: "hidden",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 2,
          background: active
            ? "linear-gradient(90deg, var(--mcs-workbench-accent-strong), var(--mcs-workbench-warm-strong))"
            : complete
              ? "linear-gradient(90deg, var(--mcs-success-border), var(--mcs-workbench-accent-soft))"
              : "transparent",
        },
        "&::after": active
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 26%)",
              pointerEvents: "none",
            }
          : undefined,
      }}
    >
      <Stack spacing={2.5} sx={{ p: { xs: 2, md: 2.75 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: active
                  ? "var(--mcs-workbench-accent-soft)"
                  : complete
                    ? "var(--mcs-success-surface)"
                    : "var(--mcs-workbench-surface-strong)",
                border: "1px solid",
                borderColor: active
                  ? "var(--mcs-workbench-outline-strong)"
                  : complete
                    ? "var(--mcs-success-border)"
                    : "var(--mcs-workbench-outline)",
                boxShadow: active ? "var(--mcs-summary-tile-shadow)" : "none",
                color: "var(--mcs-workbench-ink)",
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                {String(stepNumber).padStart(2, "0")}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                useFlexGap
                flexWrap="wrap"
              >
                <Typography variant="h5" sx={{ letterSpacing: "-0.03em" }}>
                  {title}
                </Typography>
                <Chip
                  size="small"
                  label={statusLabel}
                  color={
                    active
                      ? "primary"
                      : complete
                        ? "success"
                        : locked
                          ? "default"
                          : "info"
                  }
                  variant={active ? "filled" : "outlined"}
                  icon={
                    complete ? (
                      <TaskAltIcon fontSize="small" />
                    ) : locked ? (
                      <LockOutlinedIcon fontSize="small" />
                    ) : undefined
                  }
                />
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  maxWidth: 720,
                  color: "var(--mcs-workbench-muted)",
                }}
              >
                {description}
              </Typography>
            </Box>
          </Stack>

          {actionLabel && onActivate && !active ? (
            <Button
              size="small"
              variant="outlined"
              onClick={onActivate}
              endIcon={<ArrowOutwardIcon fontSize="small" />}
              disabled={locked}
              sx={{
                flexShrink: 0,
                borderColor: active
                  ? "var(--mcs-workbench-outline-strong)"
                  : "var(--mcs-workbench-outline)",
                bgcolor: locked
                  ? "var(--mcs-workbench-surface-subtle)"
                  : "transparent",
              }}
            >
              {actionLabel}
            </Button>
          ) : null}
        </Stack>

        {!active && preview ? (
          <Box
            sx={{
              px: 1.9,
              py: 1.65,
              borderRadius: 3,
              background:
                "linear-gradient(180deg, var(--mcs-workbench-surface-strong) 0%, var(--mcs-workbench-surface-subtle) 100%)",
              border: "1px dashed var(--mcs-workbench-outline)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              color: "var(--mcs-workbench-muted)",
            }}
          >
            {preview}
          </Box>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateRows: active ? "1fr" : "0fr",
            transition:
              "grid-template-rows var(--mcs-duration) var(--mcs-ease)",
          }}
        >
          <Box sx={{ overflow: "hidden" }}>{active ? children : null}</Box>
        </Box>
      </Stack>
    </Box>
  );
}
