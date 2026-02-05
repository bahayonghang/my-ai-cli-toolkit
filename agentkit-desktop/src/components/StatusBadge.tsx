/**
 * StatusBadge Component - Displays sync status with count
 */

import type { SyncStatus } from "@/types";

interface StatusBadgeProps {
  status: SyncStatus;
  count?: number;
}

export function StatusBadge({ status, count }: StatusBadgeProps) {
  const { icon, label, className } = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${className}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-0.5 opacity-75">({count})</span>
      )}
    </span>
  );
}

function getStatusConfig(status: SyncStatus) {
  switch (status) {
    case "synced":
      return {
        icon: "✓",
        label: "Synced",
        className: "bg-green-500/20 text-green-300 border border-green-500/20",
      };
    case "outdated":
      return {
        icon: "↻",
        label: "Outdated",
        className: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20",
      };
    case "not_installed":
      return {
        icon: "○",
        label: "Not Installed",
        className: "bg-slate-500/20 text-slate-400 border border-slate-500/20",
      };
    case "conflict":
      return {
        icon: "!",
        label: "Conflict",
        className: "bg-red-500/20 text-red-300 border border-red-500/20",
      };
    case "not_supported":
      return {
        icon: "✗",
        label: "Not Supported",
        className: "bg-slate-700/30 text-slate-500 border border-slate-700/30",
      };
    default:
      return {
        icon: "?",
        label: "Unknown",
        className: "bg-slate-500/10 text-slate-400",
      };
  }
}
