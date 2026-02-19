/**
 * PlatformSelector Component - Multi-select platform picker
 */

import { Check, TerminalSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Platform, PlatformInfo } from "@/types";
import { PLATFORM_DISPLAY_NAMES } from "@/types";

interface PlatformSelectorProps {
  platforms: PlatformInfo[];
  selected: Platform[];
  onToggle: (platform: Platform) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
}

export function PlatformSelector({
  platforms,
  selected,
  onToggle,
  onSelectAll,
  onClear,
}: PlatformSelectorProps) {
  const { t } = useTranslation();
  const detectedPlatforms = platforms.filter((p) => p.detected);
  const otherPlatforms = platforms.filter((p) => !p.detected);

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="flex items-center gap-2">
        {onSelectAll && (
          <button
            onClick={onSelectAll}
            className="ak-focus-ring text-xs text-primary-600 dark:text-primary-400 hover:underline rounded-sm"
          >
            {t("platformSelector.selectAll")}
          </button>
        )}
        {onClear && selected.length > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={onClear}
              className="ak-focus-ring text-xs text-gray-500 dark:text-gray-400 hover:underline rounded-sm"
            >
              {t("platformSelector.clear")}
            </button>
          </>
        )}
      </div>

      {/* Detected platforms */}
      {detectedPlatforms.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {t("platformSelector.detected")} ({detectedPlatforms.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {detectedPlatforms.map((p) => (
              <PlatformChip
                key={p.platform}
                platform={p.platform}
                detected={true}
                selected={selected.includes(p.platform)}
                hasCli={p.hasCli}
                cliLabel={t("platformSelector.cliAvailable")}
                onClick={() => onToggle(p.platform)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other platforms */}
      {otherPlatforms.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {t("platformSelector.other")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {otherPlatforms.map((p) => (
              <PlatformChip
                key={p.platform}
                platform={p.platform}
                detected={false}
                selected={selected.includes(p.platform)}
                hasCli={p.hasCli}
                cliLabel={t("platformSelector.cliAvailable")}
                onClick={() => onToggle(p.platform)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PlatformChipProps {
  platform: Platform;
  detected: boolean;
  selected: boolean;
  hasCli: boolean;
  cliLabel: string;
  onClick: () => void;
}

function PlatformChip({
  platform,
  detected,
  selected,
  hasCli,
  cliLabel,
  onClick,
}: PlatformChipProps) {
  const displayName = PLATFORM_DISPLAY_NAMES[platform] || platform;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        selected
          ? "bg-primary-500 text-white"
          : detected
          ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{displayName}</span>
      {hasCli && (
        <span className="text-xs opacity-60 inline-flex" title={cliLabel}>
          <TerminalSquare
            className="h-3.5 w-3.5"
            aria-label={cliLabel}
            role="img"
          />
        </span>
      )}
    </button>
  );
}
