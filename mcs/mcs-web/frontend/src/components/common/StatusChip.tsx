import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { InstallStatus } from "@/types";

const config: Record<InstallStatus, { label: string; color: "success" | "default" | "warning"; icon: React.ReactElement }> = {
  installed: { label: "Installed", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
  not_installed: { label: "Missing", color: "default", icon: <RemoveCircleOutlineIcon fontSize="small" /> },
  outdated: { label: "Outdated", color: "warning", icon: <WarningAmberIcon fontSize="small" /> },
};

export function StatusChip({ status }: { status: InstallStatus }) {
  const { label, color, icon } = config[status];
  return <Chip label={label} color={color} icon={icon} size="small" variant="outlined" />;
}
