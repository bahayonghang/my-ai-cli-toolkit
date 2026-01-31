/**
 * ResourceCard Component - Displays a single resource item
 */

import type { ResourceItem, Platform, SyncStatus } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface ResourceCardProps {
  resource: ResourceItem;
  selected?: boolean;
  checked?: boolean;
  showCheckbox?: boolean;
  onClick?: () => void;
  onCheckChange?: (checked: boolean) => void;
}

export function ResourceCard({
  resource,
  selected,
  checked,
  showCheckbox,
  onClick,
  onCheckChange,
}: ResourceCardProps) {
  const typeIcon = getTypeIcon(resource.resourceType);
  const statusCounts = getStatusCounts(resource.platformStatus);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        selected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : checked
          ? "border-primary-300 bg-primary-50/50 dark:bg-primary-900/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <div className="pt-1" onClick={handleCheckboxClick}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckChange?.(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500 cursor-pointer"
            />
          </div>
        )}
        <span className="text-2xl">{typeIcon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {resource.name}
          </h3>
          {resource.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {resource.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {statusCounts.synced > 0 && (
              <StatusBadge status="synced" count={statusCounts.synced} />
            )}
            {statusCounts.outdated > 0 && (
              <StatusBadge status="outdated" count={statusCounts.outdated} />
            )}
            {statusCounts.notInstalled > 0 && (
              <StatusBadge status="not_installed" count={statusCounts.notInstalled} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type: string): string {
  switch (type) {
    case "skill":
      return "📦";
    case "command":
      return "⚡";
    case "agent":
      return "🤖";
    default:
      return "📄";
  }
}

function getStatusCounts(platformStatus: Record<Platform, SyncStatus>) {
  const counts = {
    synced: 0,
    outdated: 0,
    notInstalled: 0,
    conflict: 0,
  };

  for (const status of Object.values(platformStatus)) {
    switch (status) {
      case "synced":
        counts.synced++;
        break;
      case "outdated":
        counts.outdated++;
        break;
      case "not_installed":
        counts.notInstalled++;
        break;
      case "conflict":
        counts.conflict++;
        break;
    }
  }

  return counts;
}
