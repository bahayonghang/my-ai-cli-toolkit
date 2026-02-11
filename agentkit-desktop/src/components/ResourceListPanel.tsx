/**
 * ResourceListPanel - Main content panel with header, filters, and resource grid
 *
 * Uses @tanstack/react-virtual for virtualized rendering when the resource
 * list is large (>50 items), falling back to plain .map() for small lists.
 */

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { FilterPanel, ResourceCard, ExternalPanel, MarketplacePanel, SettingsPage } from "@/components";
import type { ResourceItem, Platform } from "@/types";
import type { TabType } from "./Sidebar";

/** Threshold above which we switch to virtualized rendering */
const VIRTUALIZATION_THRESHOLD = 50;
/** Estimated card height in px (used as initial estimate, dynamic measurement overrides) */
const ESTIMATED_CARD_HEIGHT = 120;

interface ResourceListPanelProps {
  activeTab: TabType;
  isResourceTab: boolean;
  // Resource data
  filtered: ResourceItem[];
  resourcesLoading: boolean;
  resourcesByType: ResourceItem[];
  selectedResource: ResourceItem | null;
  // Search & filters
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategories: Set<string>;
  selectedTags: Set<string>;
  availableCategories: string[];
  availableTags: string[];
  hasActiveFilters: boolean;
  onCategoryChange: (cats: Set<string>) => void;
  onTagChange: (tags: Set<string>) => void;
  onClearFilters: () => void;
  onClearAll: () => void;
  // Batch
  batch: {
    batchMode: boolean;
    setBatchMode: (mode: boolean) => void;
    checkedIds: Set<string>;
    selectAll: (ids: string[]) => void;
    deselectAll: () => void;
    exitBatchMode: () => void;
    toggleCheck: (id: string, checked: boolean) => void;
    requestBatchInstall?: (platforms: Platform[]) => void;
    requestBatchUninstall?: (platforms: Platform[]) => void;
    batchInstall: (platforms: Platform[]) => Promise<void>;
    batchUninstall: (platforms: Platform[]) => Promise<void>;
    confirmDialog?: {
      action: "install" | "uninstall";
      platforms: Platform[];
    } | null;
    confirmBatchAction?: () => Promise<void>;
    cancelBatchAction?: () => void;
  };
  targetPlatforms: Platform[];
  // Actions
  onRefresh: () => void;
  onSelectResource: (r: ResourceItem | null) => void;
}

export const ResourceListPanel = React.memo(function ResourceListPanel({
  activeTab,
  isResourceTab,
  filtered,
  resourcesLoading,
  resourcesByType,
  selectedResource,
  searchQuery,
  onSearchChange,
  selectedCategories,
  selectedTags,
  availableCategories,
  availableTags,
  hasActiveFilters,
  onCategoryChange,
  onTagChange,
  onClearFilters,
  onClearAll,
  batch,
  targetPlatforms,
  onRefresh,
  onSelectResource,
}: ResourceListPanelProps) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex-1 flex flex-col min-w-0 z-10">
      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold text-white capitalize tracking-tight drop-shadow-md transition-opacity duration-300 ${activeTab === "marketplace" ? "opacity-0 invisible w-0" : "opacity-100"}`}>
            {activeTab}
          </h2>
          <div className="flex items-center gap-3 ml-auto">
            {isResourceTab && (
              <button
                onClick={() => batch.batchMode ? batch.exitBatchMode() : batch.setBatchMode(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${batch.batchMode
                  ? "bg-primary-500 text-white border-primary-400 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20"}`}
              >
                {batch.batchMode ? "✓ " + t('batch.active') : "☐ " + t('batch.select')}
              </button>
            )}
            <button
              onClick={() => onRefresh()}
              disabled={resourcesLoading}
              className="px-4 py-2 text-sm font-medium bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className={resourcesLoading ? "animate-spin" : ""}>↻</span>
              {resourcesLoading ? t('resource.refreshing') : t('resource.refresh')}
            </button>
          </div>
        </div>

        {/* Batch Actions Bar */}
        {batch.batchMode && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <span className="text-sm text-primary-700 dark:text-primary-300">{t('batch.selected', { count: batch.checkedIds.size })}</span>
            <button onClick={() => batch.selectAll(filtered.map(r => r.id))} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">{t('batch.selectAll')}</button>
            <button onClick={batch.deselectAll} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">{t('batch.clear')}</button>
            <div className="flex-1" />
            <button 
              onClick={() => batch.requestBatchInstall ? batch.requestBatchInstall(targetPlatforms) : batch.batchInstall(targetPlatforms)} 
              disabled={batch.checkedIds.size === 0} 
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
            >
              {t('batch.installAll')}
            </button>
            <button 
              onClick={() => batch.requestBatchUninstall ? batch.requestBatchUninstall(targetPlatforms) : batch.batchUninstall(targetPlatforms)} 
              disabled={batch.checkedIds.size === 0} 
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {t('batch.uninstallAll')}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-75 transition duration-500 blur"></div>
          <div className="relative flex items-center bg-slate-900 rounded-xl border border-white/10">
            <input type="text" placeholder={t('resource.search')} value={searchQuery} onChange={e => onSearchChange(e.target.value)}
              className="w-full px-5 py-3 pl-12 bg-transparent text-white placeholder-slate-500 focus:outline-none" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">🔍</span>
            {searchQuery && (
              <button onClick={() => onSearchChange("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">✕</button>
            )}
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {isResourceTab && (
        <FilterPanel
          categories={availableCategories} tags={availableTags}
          selectedCategories={selectedCategories} selectedTags={selectedTags}
          onCategoryChange={onCategoryChange} onTagChange={onTagChange}
          onClear={onClearFilters}
        />
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && isResourceTab && (
        <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('filter.activeFilters')}</span>
            {Array.from(selectedCategories).map(cat => (
              <span key={`cat-${cat}`} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                📁 {cat}
                <button onClick={() => { const n = new Set(selectedCategories); n.delete(cat); onCategoryChange(n); }} className="hover:text-blue-900 dark:hover:text-blue-100">✕</button>
              </span>
            ))}
            {Array.from(selectedTags).map(tag => (
              <span key={`tag-${tag}`} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                🏷️ {tag}
                <button onClick={() => { const n = new Set(selectedTags); n.delete(tag); onTagChange(n); }} className="hover:text-green-900 dark:hover:text-green-100">✕</button>
              </span>
            ))}
            <button onClick={onClearFilters} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2">{t('filter.clearAllLink')}</button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('filter.showing', { filtered: filtered.length, total: resourcesByType.length, type: activeTab })}</p>
        </div>
      )}

      {/* Resource Grid */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollContainerRef}>
        {activeTab === "settings" ? <SettingsPage />
          : activeTab === "external" ? <ExternalPanel />
          : activeTab === "marketplace" ? <MarketplacePanel />
          : resourcesLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">{t('resource.loading')}</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.length > VIRTUALIZATION_THRESHOLD ? (
              <VirtualizedResourceList
                items={filtered}
                selectedResource={selectedResource}
                batchMode={batch.batchMode}
                checkedIds={batch.checkedIds}
                onToggleCheck={batch.toggleCheck}
                onSelectResource={onSelectResource}
                scrollContainerRef={scrollContainerRef}
              />
            ) : (
              <div className="grid gap-3">
                {filtered.map(resource => (
                  <ResourceCard key={resource.id} resource={resource}
                    selected={selectedResource?.id === resource.id}
                    showCheckbox={batch.batchMode}
                    checked={batch.checkedIds.has(resource.id)}
                    onCheckChange={checked => batch.toggleCheck(resource.id, checked)}
                    onClick={() => onSelectResource(resource)} />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || hasActiveFilters ? t('resource.noMatchFilters') : t('resource.noFound', { type: activeTab })}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <button onClick={onClearAll} className="mt-3 text-primary-500 hover:underline">{t('resource.clearFilters')}</button>
              )}
              {!searchQuery && !hasActiveFilters && (
                <button onClick={() => onRefresh()} className="mt-3 text-primary-500 hover:underline">{t('resource.scan')}</button>
              )}
            </div>
          )}
      </div>
    </div>
  );
});

// --- Virtualized sub-component ---

interface VirtualizedResourceListProps {
  items: ResourceItem[];
  selectedResource: ResourceItem | null;
  batchMode: boolean;
  checkedIds: Set<string>;
  onToggleCheck: (id: string, checked: boolean) => void;
  onSelectResource: (r: ResourceItem | null) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function VirtualizedResourceList({
  items,
  selectedResource,
  batchMode,
  checkedIds,
  onToggleCheck,
  onSelectResource,
  scrollContainerRef,
}: VirtualizedResourceListProps) {
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 5,
    gap: 12, // matches gap-3 (0.75rem = 12px)
  });

  return (
    <div
      style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
        const resource = items[virtualItem.index]!;
        return (
          <div
            key={resource.id}
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
            <ResourceCard
              resource={resource}
              selected={selectedResource?.id === resource.id}
              showCheckbox={batchMode}
              checked={checkedIds.has(resource.id)}
              onCheckChange={(checked) => onToggleCheck(resource.id, checked)}
              onClick={() => onSelectResource(resource)}
            />
          </div>
        );
      })}
    </div>
  );
}
