import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

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
          ? "var(--mcs-dashboard-outline-strong)"
          : "var(--mcs-dashboard-outline)",
        background: active
          ? "linear-gradient(180deg, rgba(21, 32, 39, 0.96) 0%, rgba(16, 24, 29, 0.92) 100%)"
          : complete
            ? "linear-gradient(180deg, rgba(19, 31, 36, 0.92) 0%, rgba(15, 22, 27, 0.9) 100%)"
            : "linear-gradient(180deg, rgba(17, 24, 29, 0.84) 0%, rgba(14, 20, 24, 0.82) 100%)",
        boxShadow: active ? "var(--mcs-shadow-md)" : "var(--mcs-shadow-sm)",
        overflow: "hidden",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 2,
          background: active
            ? "linear-gradient(90deg, var(--mcs-dashboard-accent-strong), rgba(217, 177, 115, 0.72))"
            : complete
              ? "linear-gradient(90deg, rgba(116, 196, 148, 0.72), rgba(143, 197, 187, 0.52))"
              : "transparent",
        },
      }}
    >
      <Stack spacing={2.5} sx={{ p: { xs: 2, md: 2.75 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: active
                  ? "var(--mcs-dashboard-accent-soft)"
                  : complete
                    ? "rgba(116, 196, 148, 0.12)"
                    : "rgba(255, 255, 255, 0.04)",
                border: "1px solid",
                borderColor: active
                  ? "var(--mcs-dashboard-outline-strong)"
                  : "rgba(255, 255, 255, 0.08)",
                color: "var(--mcs-dashboard-ink)",
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                {String(stepNumber).padStart(2, "0")}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="h5" sx={{ letterSpacing: "-0.03em" }}>
                  {title}
                </Typography>
                <Chip
                  size="small"
                  label={statusLabel}
                  color={active ? "primary" : complete ? "success" : locked ? "default" : "info"}
                  variant={active ? "filled" : "outlined"}
                  icon={
                    complete ? <TaskAltIcon fontSize="small" /> : locked ? <LockOutlinedIcon fontSize="small" /> : undefined
                  }
                />
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  maxWidth: 720,
                  color: "var(--mcs-dashboard-muted)",
                }}
              >
                {description}
              </Typography>
            </Box>
          </Stack>

          {actionLabel && onActivate && !active ? (
            <Button
              size="small"
              variant="text"
              onClick={onActivate}
              endIcon={<ArrowOutwardIcon fontSize="small" />}
              disabled={locked}
              sx={{ flexShrink: 0 }}
            >
              {actionLabel}
            </Button>
          ) : null}
        </Stack>

        {!active && preview ? (
          <Box
            sx={{
              px: 1.75,
              py: 1.5,
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed rgba(255, 255, 255, 0.08)",
              color: "var(--mcs-dashboard-muted)",
            }}
          >
            {preview}
          </Box>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateRows: active ? "1fr" : "0fr",
            transition: "grid-template-rows var(--mcs-duration) var(--mcs-ease)",
          }}
        >
          <Box sx={{ overflow: "hidden" }}>
            {active ? children : null}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
