import { Chip, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UpdateIcon from "@mui/icons-material/Update";
import type { TranslateFn } from "@/i18n";
import type { AggregatedStatus } from "@/utils/statusAggregation";

interface StatusConfig {
  icon: React.ReactElement | undefined;
  label: string;
  color: "success" | "error" | "warning" | "info" | "default";
  variant: "filled" | "outlined";
}

function getStatusConfig(status: AggregatedStatus, t: TranslateFn): StatusConfig {
  switch (status) {
    case "installed":
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        label: t("installHub.statusInstalled"),
        color: "success",
        variant: "filled",
      };
    case "not_installed":
      return {
        icon: <CancelIcon fontSize="small" />,
        label: t("installHub.statusNotInstalled"),
        color: "error",
        variant: "outlined",
      };
    case "outdated":
      return {
        icon: <UpdateIcon fontSize="small" />,
        label: t("installHub.statusOutdated"),
        color: "warning",
        variant: "filled",
      };
    case "partial":
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        label: t("installHub.statusPartial"),
        color: "info",
        variant: "outlined",
      };
    default:
      return {
        icon: undefined,
        label: "...",
        color: "default",
        variant: "outlined",
      };
  }
}

export interface InstallStatusChipProps {
  status: AggregatedStatus;
  tooltip: string;
  t: TranslateFn;
}

export function InstallStatusChip({ status, tooltip, t }: InstallStatusChipProps) {
  const config = getStatusConfig(status, t);

  return (
    <Tooltip title={tooltip} arrow>
      <Chip
        {...(config.icon != null ? { icon: config.icon } : {})}
        label={config.label}
        size="small"
        color={config.color}
        variant={config.variant}
        sx={{
          fontSize: "0.75rem",
          height: 20,
          "& .MuiChip-icon": {
            fontSize: 14,
          },
        }}
      />
    </Tooltip>
  );
}
