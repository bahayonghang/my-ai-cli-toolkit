/**
 * MarketplacePanel Component - Main panel for skill marketplace
 */

import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMarketplaceStore } from "@/stores";
import { SkillCard } from "./SkillCard";
import { MarketFilterBar } from "./MarketFilterBar";
import { SortTabs } from "./SortTabs";

export function MarketplacePanel() {
  const { t } = useTranslation();

  const {
    skills,
    categories,
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
    fetchCategories,
    refreshCache,
    installSkill,
    uninstallSkill,
    checkNodejs,
    fetchCacheStats,
    setSortBy,
    setSearchQuery,
    setFilters,
    clearFilters,
    clearError,
  } = useMarketplaceStore();

  // Initialize on mount
  const initialize = useCallback(() => {
    checkNodejs();
    fetchCategories();
    fetchSkills();
    fetchCacheStats();
  }, [checkNodejs, fetchCategories, fetchSkills, fetchCacheStats]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleInstall = async (owner: string, repo: string) => {
    try {
      const result = await installSkill(owner, repo);
      if (!result.success) {
        console.error("Install failed:", result.error);
      }
    } catch (err) {
      console.error("Install error:", err);
    }
  };

  const handleUninstall = async (owner: string, repo: string) => {
    try {
      const result = await uninstallSkill(owner, repo);
      if (!result.success) {
        console.error("Uninstall failed:", result.error);
      }
    } catch (err) {
      console.error("Uninstall error:", err);
    }
  };

  // Node.js not available warning
  if (nodejsAvailable === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <span className="text-5xl mb-4">⚠️</span>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t("marketplace.nodejsRequired")}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {t("marketplace.nodejsRequiredDesc")}
        </p>
        <a
          href="https://nodejs.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {t("marketplace.downloadNodejs")}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("marketplace.title")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("marketplace.subtitle")}
            </p>
          </div>
          {/* Cache stats */}
          {cacheStats && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
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
                <p className="text-green-600 dark:text-green-400">
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
          categories={categories}
          filters={filters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFiltersChange={setFilters}
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
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("marketplace.loading")}
            </p>
          </div>
        ) : skills.length > 0 ? (
          <div className="grid gap-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                installing={installing === `${skill.owner}/${skill.repo}`}
                onInstall={() => handleInstall(skill.owner, skill.repo)}
                onUninstall={() => handleUninstall(skill.owner, skill.repo)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="text-4xl mb-3">📭</span>
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
