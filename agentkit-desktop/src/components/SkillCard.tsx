/**
 * SkillCard Component - Displays a marketplace skill item
 */

import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import type { MarketplaceSkill } from "@/types";

interface SkillCardProps {
  skill: MarketplaceSkill;
  installing?: boolean;
  disabled?: boolean; // Disable install/uninstall actions (e.g., when Node.js unavailable)
  onInstall?: () => void;
  onUninstall?: () => void;
}

export function SkillCard({ skill, installing, disabled, onInstall, onUninstall }: SkillCardProps) {
  const { t } = useTranslation();
  const skillSlug = encodeURIComponent(skill.skill ?? skill.name);
  const detailsUrl = `https://skills.sh/${skill.owner}/${skill.repo}/${skillSlug}`;
  const metricLabel = skill.metricLabel ?? (skill.downloads !== undefined ? "Installs" : undefined);
  const metricValue = skill.metricValue
    ?? (skill.downloads !== undefined ? formatNumber(skill.downloads) : undefined);

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
              {metricLabel && metricValue && (
                <span className="font-medium">
                  {metricLabel}: {metricValue}
                </span>
              )}
              {skill.metricDelta && (
                <span className={skill.metricDelta.startsWith("-") ? "text-red-500" : "text-emerald-500"}>
                  {skill.metricDelta}
                </span>
              )}

              {/* Source badge */}
              <span className={`px-1.5 py-0.5 text-xs rounded ${getSourceBadgeClass(skill.source)}`}>
                {formatSource(skill.source)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t("marketplace.openSkill")}
                aria-label={t("a11y.openSkillDetails", { name: skill.name })}
                className="inline-flex items-center justify-center px-2.5 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>

              {/* Install/Uninstall button */}
              <button
                onClick={handleAction}
                disabled={installing || disabled}
                title={disabled ? t("marketplace.nodejsRequired") : undefined}
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
  if (source.startsWith("vercel-labs")) {
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
  }
  switch (source) {
    case "official":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
    case "community":
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }
}

function formatSource(source: string): string {
  if (!source) {
    return "community";
  }
  if (source === "official" || source === "community") {
    return source;
  }
  if (source.includes("/")) {
    return source;
  }
  switch (source) {
    case "vercel-labs":
      return "vercel-labs";
    default:
      return source;
  }
}
