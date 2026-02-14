/**
 * MarketFilterBar Component - Search and filter controls for marketplace
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Search } from "lucide-react";
import { IconButton } from "./ui/IconButton";
import { Input } from "./ui/Input";

interface MarketFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function MarketFilterBar({
  searchQuery,
  onSearchChange,
  onClearFilters,
  onRefresh,
  loading,
}: MarketFilterBarProps) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

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

  const hasActiveFilters = localSearch.trim().length > 0;

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setLocalSearch("");
    onClearFilters();
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--ak-text-muted)]"
            aria-hidden="true"
          />
          <Input
            type="text"
            aria-label={t("a11y.searchMarketplace")}
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={t("marketplace.searchPlaceholder")}
            containerClassName="space-y-0"
            className="pl-10 pr-4 py-2 bg-white/5 border-white/10 text-white placeholder-slate-500"
          />
        </div>
        <IconButton
          type="button"
          onClick={onRefresh}
          disabled={loading}
          ariaLabel={t("a11y.refreshMarketplace")}
          icon={<RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />}
          title={t("marketplace.refresh")}
          variant="soft"
        />
      </form>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            {t("marketplace.clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}
