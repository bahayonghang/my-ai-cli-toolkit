import { Chip } from "@mui/material";
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
  const { t } = useI18n();
  const { labelKey, color, icon } = config[status];
  const label = t(labelKey);
  return <Chip label={label} color={color} icon={icon} size="small" variant="outlined" />;
}
