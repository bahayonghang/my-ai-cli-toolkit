/**
 * MarketplacePanel Component - Main panel for skill marketplace
 */

import { useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Inbox, X } from "lucide-react";
import { useMarketplaceStore } from "@/stores";
import type { MarketplaceSkill } from "@/types";
import { SkillCard } from "./SkillCard";
import { MarketFilterBar } from "./MarketFilterBar";
import { SortTabs } from "./SortTabs";
import { IconButton } from "./ui/IconButton";

const VIRTUALIZATION_THRESHOLD = 60;
const ESTIMATED_CARD_HEIGHT = 168;
const SCROLL_CONTAINER_ID = "resource-list-scroll-container";

let marketplaceInitPromise: Promise<void> | null = null;

export function MarketplacePanel() {
  const { t } = useTranslation();

  const {
    skills,
    loading,
    installing,
    error,
    sortBy,
    searchQuery,
    filters,
    nodejsAvailable,
    nodejsVersion,
    cacheStats,
    fetchSkills,
    refreshCache,
    installSkill,
    uninstallSkill,
    checkNodejs,
    fetchCacheStats,
    setSortBy,
    setSearchQuery,
    clearFilters,
    clearError,
  } = useMarketplaceStore();

  // Initialize on mount
  const initialize = useCallback(() => {
    if (marketplaceInitPromise) {
      return marketplaceInitPromise;
    }

    const tasks: Promise<unknown>[] = [];
    if (nodejsAvailable === null || !nodejsVersion) {
      tasks.push(checkNodejs());
    }
    if (!cacheStats) {
      tasks.push(fetchCacheStats());
    }
    if (skills.length === 0) {
      tasks.push(fetchSkills());
    }

    if (tasks.length === 0) {
      return Promise.resolve();
    }

    marketplaceInitPromise = Promise.allSettled(tasks)
      .then(() => undefined)
      .finally(() => {
        marketplaceInitPromise = null;
      });
    return marketplaceInitPromise;
  }, [
    cacheStats,
    checkNodejs,
    fetchCacheStats,
    fetchSkills,
    nodejsAvailable,
    nodejsVersion,
    skills.length,
  ]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const handleInstall = async (owner: string, repo: string, skill: string) => {
    try {
      const result = await installSkill(owner, repo, skill);
      if (!result.success) {
        console.error("Install failed:", result.error);
      }
    } catch (err) {
      console.error("Install error:", err);
    }
  };

  const handleUninstall = async (owner: string, repo: string, skill: string) => {
    try {
      const result = await uninstallSkill(owner, repo, skill);
      if (!result.success) {
        console.error("Uninstall failed:", result.error);
      }
    } catch (err) {
      console.error("Uninstall error:", err);
    }
  };

  // Check if Node.js is available for installation
  const canInstall = nodejsAvailable === true;

  return (
    <div className="space-y-0">
      {/* Node.js Warning Banner (shown when unavailable but doesn't block UI) */}
      {nodejsAvailable === false && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500 h-6 w-6 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t("marketplace.nodejsRequired")}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t("marketplace.nodejsRequiredDesc")}
              </p>
            </div>
            <a
              href="https://nodejs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              {t("marketplace.downloadNodejs")}
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {t("marketplace.title")}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t("marketplace.subtitle")}
            </p>
          </div>
          {/* Cache stats */}
          {cacheStats && (
            <div className="text-xs text-slate-500 text-right font-medium">
              <p>
                {t("marketplace.skillCount", { count: cacheStats.skillCount })}
              </p>
              {cacheStats.lastRefresh && (
                <p>
                  {t("marketplace.lastRefresh", {
                    time: new Date(cacheStats.lastRefresh).toLocaleString(),
                  })}
                </p>
              )}
              {nodejsVersion && (
                <p className="text-emerald-400">
                  Node.js {nodejsVersion}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sort Tabs */}
        <div className="mb-4">
          <SortTabs value={sortBy} onChange={setSortBy} />
        </div>

        {/* Filter Bar */}
        <MarketFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearFilters={clearFilters}
          onRefresh={refreshCache}
          loading={loading}
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <IconButton
              onClick={clearError}
              ariaLabel={t("a11y.closeError")}
              icon={<X className="h-4 w-4" />}
              size="sm"
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            />
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="p-6">
        {loading && skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("marketplace.loading")}
            </p>
          </div>
        ) : skills.length > 0 ? (
          skills.length > VIRTUALIZATION_THRESHOLD ? (
            <VirtualizedMarketplaceList
              items={skills}
              canInstall={canInstall}
              installing={installing}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
            />
          ) : (
            <div className="grid gap-3">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  installing={installing === skill.id}
                  disabled={!canInstall}
                  onInstall={() => handleInstall(skill.owner, skill.repo, skill.skill ?? skill.name)}
                  onUninstall={() => handleUninstall(skill.owner, skill.repo, skill.skill ?? skill.name)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Inbox className="h-10 w-10 text-slate-400 mb-3" aria-hidden="true" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filters.category || filters.source || filters.platform
                ? t("marketplace.noMatch")
                : t("marketplace.noSkills")}
            </p>
            {(searchQuery || filters.category || filters.source || filters.platform) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-primary-500 hover:underline"
              >
                {t("marketplace.clearFilters")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with skill count */}
      {skills.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("marketplace.showingSkills", { count: skills.length })}
          </p>
        </div>
      )}
    </div>
  );
}

interface VirtualizedMarketplaceListProps {
  items: MarketplaceSkill[];
  canInstall: boolean;
  installing: string | null;
  onInstall: (owner: string, repo: string, skill: string) => Promise<void>;
  onUninstall: (owner: string, repo: string, skill: string) => Promise<void>;
}

function VirtualizedMarketplaceList({
  items,
  canInstall,
  installing,
  onInstall,
  onUninstall,
}: VirtualizedMarketplaceListProps) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => document.getElementById(SCROLL_CONTAINER_ID),
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 6,
    gap: 12,
  });

  return (
    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
        const skill = items[virtualItem.index];
        if (!skill) {
          return null;
        }
        const skillName = skill.skill ?? skill.name;
        return (
          <div
            key={skill.id}
            ref={rowVirtualizer.measureElement}
            data-index={virtualItem.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <SkillCard
              skill={skill}
              installing={installing === skill.id}
              disabled={!canInstall}
              onInstall={() => onInstall(skill.owner, skill.repo, skillName)}
              onUninstall={() => onUninstall(skill.owner, skill.repo, skillName)}
            />
          </div>
        );
      })}
    </div>
  );
}
