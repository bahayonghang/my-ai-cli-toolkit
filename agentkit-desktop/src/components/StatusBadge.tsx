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
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      };
    case "outdated":
      return {
        icon: "↻",
        label: "Outdated",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
    case "not_installed":
      return {
        icon: "○",
        label: "Not Installed",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
      };
    case "conflict":
      return {
        icon: "!",
        label: "Conflict",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    case "not_supported":
      return {
        icon: "✗",
        label: "Not Supported",
        className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
      };
    default:
      return {
        icon: "?",
        label: "Unknown",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
      };
  }
}
