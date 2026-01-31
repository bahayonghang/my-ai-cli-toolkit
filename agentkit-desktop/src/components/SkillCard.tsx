/**
 * SkillCard Component - Displays a marketplace skill item
 */

import { useTranslation } from "react-i18next";
import type { MarketplaceSkill } from "@/types";

interface SkillCardProps {
  skill: MarketplaceSkill;
  installing?: boolean;
  onInstall?: () => void;
  onUninstall?: () => void;
}

export function SkillCard({ skill, installing, onInstall, onUninstall }: SkillCardProps) {
  const { t } = useTranslation();

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (skill.installed) {
      onUninstall?.();
    } else {
      onInstall?.();
    }
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
          {skill.name.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {skill.name}
            </h3>
            {skill.installed && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                {t("marketplace.installed")}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {skill.owner}/{skill.repo}
          </p>

          {skill.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
              {skill.description}
            </p>
          )}

          {/* Categories */}
          {skill.categories.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {skill.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Stats & Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {/* Stars */}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {formatNumber(skill.stars)}
              </span>

              {/* Downloads */}
              {skill.downloads !== undefined && skill.downloads !== null && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {formatNumber(skill.downloads)}
                </span>
              )}

              {/* Source badge */}
              <span className={`px-1.5 py-0.5 text-xs rounded ${getSourceBadgeClass(skill.source)}`}>
                {skill.source}
              </span>
            </div>

            {/* Install/Uninstall button */}
            <button
              onClick={handleAction}
              disabled={installing}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                skill.installed
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  : "bg-primary-500 text-white hover:bg-primary-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {installing ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("marketplace.installing")}
                </span>
              ) : skill.installed ? (
                t("marketplace.uninstall")
              ) : (
                t("marketplace.install")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function getSourceBadgeClass(source: string): string {
  switch (source) {
    case "vercel-labs":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    case "official":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
    case "community":
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }
}
