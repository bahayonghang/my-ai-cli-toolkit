import { Chip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { InstallStatus } from "@/types";
import { useI18n } from "@/i18n";
import type { MessageKey } from "@/i18n";

const config: Record<
  InstallStatus,
  {
    labelKey: MessageKey;
    color: "success" | "default" | "warning";
    icon: React.ReactElement;
  }
> = {
  installed: {
    labelKey: "status.installed",
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  not_installed: {
    labelKey: "status.notInstalled",
    color: "default",
    icon: <RemoveCircleOutlineIcon fontSize="small" />,
  },
  outdated: {
    labelKey: "status.outdated",
    color: "warning",
    icon: <WarningAmberIcon fontSize="small" />,
  },
};

export function StatusChip({ status }: { status: InstallStatus }) {
  const theme = useTheme();
  const { t } = useI18n();
  const { labelKey, color, icon } = config[status];
  const label = t(labelKey);
  const tone =
    color === "success"
      ? theme.palette.success.main
      : color === "warning"
        ? theme.palette.warning.main
        : theme.palette.text.secondary;

  return (
    <Chip
      label={label}
      icon={icon}
      size="small"
      variant="outlined"
      sx={{
        borderColor: alpha(tone, theme.palette.mode === "dark" ? 0.32 : 0.2),
        backgroundColor: alpha(tone, theme.palette.mode === "dark" ? 0.12 : 0.08),
        color: color === "default" ? "text.secondary" : tone,
        "& .MuiChip-icon": {
          color: "inherit",
        },
      }}
    />
  );
}
