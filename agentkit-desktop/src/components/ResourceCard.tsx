/**
 * ResourceCard Component - Displays a single resource item
 */

import type { ResourceItem, Platform, SyncStatus } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { getTypeIcon } from "@/utils/resourceUtils";

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
      className={`p-5 rounded-xl border transition-all duration-300 group relative overflow-hidden backdrop-blur-md ${selected
          ? "border-primary-500/50 bg-primary-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]"
          : checked
            ? "border-primary-400/30 bg-primary-500/5"
            : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:-translate-y-1"
        }`}
      onClick={onClick}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>

      <div className="relative flex items-start gap-4 z-10">
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
        <span className="text-3xl filter drop-shadow-md">{typeIcon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-white truncate tracking-tight group-hover:text-primary-200 transition-colors">
            {resource.name}
          </h3>
          {resource.description && (
            <p className="text-sm text-slate-400 line-clamp-2 mt-1.5 font-normal leading-relaxed">
              {resource.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium bg-white/5 text-slate-300 border border-white/10 rounded-md backdrop-blur-sm"
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
