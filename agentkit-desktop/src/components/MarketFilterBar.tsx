/**
 * MarketFilterBar Component - Search and filter controls for marketplace
 */

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { MarketplaceCategory, MarketplaceFilters } from "@/types";
import { PLATFORM_DISPLAY_NAMES } from "@/types";

interface MarketFilterBarProps {
  categories: MarketplaceCategory[];
  filters: MarketplaceFilters;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: Partial<MarketplaceFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function MarketFilterBar({
  categories,
  filters,
  searchQuery,
  onSearchChange,
  onFiltersChange,
  onClearFilters,
  onRefresh,
  loading,
}: MarketFilterBarProps) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleSearchInput = useCallback(
    (value: string) => {
      setLocalSearch(value);
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Debounce the actual search
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const hasActiveFilters =
    filters.category || filters.source || filters.platform || searchQuery;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={t("marketplace.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title={t("marketplace.refresh")}
        >
          <svg
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </form>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-2">
        {/* Category filter */}
        <select
          value={filters.category || ""}
          onChange={(e) => onFiltersChange(e.target.value ? { category: e.target.value } : {})}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t("marketplace.allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        {/* Source filter */}
        <select
          value={filters.source || ""}
          onChange={(e) => onFiltersChange(e.target.value ? { source: e.target.value } : {})}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t("marketplace.allSources")}</option>
          <option value="vercel-labs">Vercel Labs</option>
          <option value="community">{t("marketplace.community")}</option>
          <option value="official">{t("marketplace.official")}</option>
        </select>

        {/* Platform filter */}
        <select
          value={filters.platform || ""}
          onChange={(e) => onFiltersChange(e.target.value ? { platform: e.target.value } : {})}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t("marketplace.allPlatforms")}</option>
          {Object.entries(PLATFORM_DISPLAY_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 rounded-lg text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            {t("marketplace.clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}
