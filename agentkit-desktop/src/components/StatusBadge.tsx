/**
 * StatusBadge Component - Displays sync status with count
 */

import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  HelpCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { SyncStatus } from "@/types";
import { Badge } from "./ui/Badge";

interface StatusBadgeProps {
  status: SyncStatus;
  count?: number;
}

export function StatusBadge({ status, count }: StatusBadgeProps) {
  const { t } = useTranslation();
  const { icon, label, className } = getStatusConfig(status);

  return (
    <Badge className={className} icon={icon}>
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-0.5 opacity-75">({count})</span>
      )}
    </Badge>
  );
  function getStatusConfig(currentStatus: SyncStatus) {
    switch (currentStatus) {
      case "synced":
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
          label: t("status.synced"),
          className: "text-emerald-300 border-emerald-400/35 bg-emerald-500/15",
        };
      case "outdated":
        return {
          icon: <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />,
          label: t("status.outdated"),
          className: "text-amber-300 border-amber-400/35 bg-amber-500/15",
        };
      case "not_installed":
        return {
          icon: <Circle className="h-3.5 w-3.5" aria-hidden="true" />,
          label: t("status.notInstalled"),
          className: "text-slate-300 border-slate-400/35 bg-slate-500/15",
        };
      case "conflict":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />,
          label: t("status.conflict"),
          className: "text-red-300 border-red-400/35 bg-red-500/15",
        };
      case "not_supported":
        return {
          icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
          label: t("status.notSupported"),
          className: "text-slate-400 border-slate-500/35 bg-slate-600/10",
        };
      default:
        return {
          icon: <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />,
          label: t("status.unknown"),
          className: "text-slate-400 border-slate-500/35 bg-slate-600/10",
        };
    }
  }
}
