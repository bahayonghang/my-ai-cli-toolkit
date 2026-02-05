/**
 * AgentKit Desktop - Main Application Component
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useResourceStore, usePlatformStore, useSettingsStore } from "@/stores";
import { useToast } from "@/hooks";
import { ResourceCard, ResourceDetail, ExternalPanel, ToastContainer, FilterPanel, MarketplacePanel, SettingsPage } from "@/components";
import type { Platform } from "@/types";

type TabType = "skills" | "commands" | "agents" | "external" | "marketplace" | "settings";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("skills");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { toasts, removeToast, success, error } = useToast();

  // Stores
  const {
    resources,
    selectedResource,
    loading: resourcesLoading,
    fetchResources,
    refreshResources,
    selectResource,
    installResource,
    uninstallResource,
    updateResource,
  } = useResourceStore();

  const {
    platforms,
    loading: platformsLoading,
    fetchPlatforms,
  } = usePlatformStore();

  const { fetchSettings } = useSettingsStore();

  // Memoize fetch functions to avoid useEffect dependency warnings
  const initializeApp = useCallback(async () => {
    // Priority 1: Fetch settings first (theme/language) - critical for UX
    await fetchSettings();
    // Priority 2: Fetch platforms and resources in parallel (non-blocking)
    fetchPlatforms();
    fetchResources();
  }, [fetchPlatforms, fetchResources, fetchSettings]);

  // Initialize on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Clear batch selection and filters when changing tabs
  useEffect(() => {
    setCheckedIds(new Set());
    setBatchMode(false);
    setSelectedCategories(new Set());
    setSelectedTags(new Set());
    setSearchQuery("");
  }, [activeTab]);

  // Get resources filtered by type (for current tab)
  const resourcesByType = useMemo(() => {
    return resources.filter((r) => {
      if (activeTab === "skills") return r.resourceType === "skill";
      if (activeTab === "commands") return r.resourceType === "command";
      if (activeTab === "agents") return r.resourceType === "agent";
      return true;
    });
  }, [resources, activeTab]);

  // Extract unique categories and tags from current tab's resources
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    resourcesByType.forEach((r) => r.categories.forEach((c) => cats.add(c)));
    return Array.from(cats).sort();
  }, [resourcesByType]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    resourcesByType.forEach((r) => r.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [resourcesByType]);

  // Filter resources by type, search, categories, and tags
  const filteredResources = useMemo(() => {
    return resourcesByType.filter((r) => {
      // Filter by search
      const searchMatch =
        searchQuery === "" ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by categories (OR logic - match any selected category)
      const categoryMatch =
        selectedCategories.size === 0 ||
        r.categories.some((c) => selectedCategories.has(c));

      // Filter by tags (OR logic - match any selected tag)
      const tagMatch =
        selectedTags.size === 0 ||
        r.tags.some((t) => selectedTags.has(t));

      return searchMatch && categoryMatch && tagMatch;
    });
  }, [resourcesByType, searchQuery, selectedCategories, selectedTags]);

  // Count resources by type
  const skillCount = resources.filter((r) => r.resourceType === "skill").length;
  const commandCount = resources.filter((r) => r.resourceType === "command").length;
  const agentCount = resources.filter((r) => r.resourceType === "agent").length;

  // Detected platforms
  const detectedPlatforms = platforms.filter((p) => p.detected);

  // Batch operations
  const handleToggleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setCheckedIds(new Set(filteredResources.map((r) => r.id)));
  };

  const handleDeselectAll = () => {
    setCheckedIds(new Set());
  };

  const handleBatchInstall = async () => {
    if (checkedIds.size === 0 || detectedPlatforms.length === 0) return;

    const targetPlatforms = detectedPlatforms.map((p) => p.platform);
    let successCount = 0;
    let failCount = 0;

    for (const id of checkedIds) {
      try {
        await installResource(id, targetPlatforms);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      success("Batch Install Complete", `Installed ${successCount} resource(s)`);
    }
    if (failCount > 0) {
      error("Some Installations Failed", `${failCount} resource(s) failed to install`);
    }

    setCheckedIds(new Set());
    setBatchMode(false);
  };

  const handleBatchUninstall = async () => {
    if (checkedIds.size === 0 || detectedPlatforms.length === 0) return;

    const targetPlatforms = detectedPlatforms.map((p) => p.platform);
    let successCount = 0;
    let failCount = 0;

    for (const id of checkedIds) {
      try {
        await uninstallResource(id, targetPlatforms);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      success("Batch Uninstall Complete", `Uninstalled ${successCount} resource(s)`);
    }
    if (failCount > 0) {
      error("Some Uninstalls Failed", `${failCount} resource(s) failed to uninstall`);
    }

    setCheckedIds(new Set());
    setBatchMode(false);
  };

  const handleInstall = async (targetPlatforms: Platform[]) => {
    if (!selectedResource) return;
    await installResource(selectedResource.id, targetPlatforms);
  };

  const handleUninstall = async (targetPlatforms: Platform[]) => {
    if (!selectedResource) return;
    await uninstallResource(selectedResource.id, targetPlatforms);
  };

  const handleUpdate = async () => {
    if (!selectedResource) return;
    await updateResource(selectedResource.id);
  };

  const handleClearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedTags(new Set());
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategories.size > 0 || selectedTags.size > 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex text-slate-100 font-sans selection:bg-primary-500/30">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-64 flex flex-col frosted-glass-heavy border-r-0 z-20">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2 filter drop-shadow-sm">
            <span className="text-3xl">🤖</span>
            <span>AgentKit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
            AI TOOL RESOURCE MANAGER
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <NavItem
            icon="📦"
            label="Skills"
            count={skillCount}
            active={activeTab === "skills"}
            onClick={() => setActiveTab("skills")}
          />
          <NavItem
            icon="⚡"
            label="Commands"
            count={commandCount}
            active={activeTab === "commands"}
            onClick={() => setActiveTab("commands")}
          />
          <NavItem
            icon="🤖"
            label="Agents"
            count={agentCount}
            active={activeTab === "agents"}
            onClick={() => setActiveTab("agents")}
          />
          <NavItem
            icon="🌐"
            label="External"
            active={activeTab === "external"}
            onClick={() => setActiveTab("external")}
          />
          <NavItem
            icon="🛒"
            label="Marketplace"
            active={activeTab === "marketplace"}
            onClick={() => setActiveTab("marketplace")}
          />

          <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

          <NavItem
            icon="⚙️"
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        {/* Platform Status */}
        <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Detected Platforms
          </h3>
          {platformsLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              Detecting...
            </div>
          ) : detectedPlatforms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detectedPlatforms.slice(0, 6).map((p) => (
                <span
                  key={p.platform}
                  className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md shadow-sm backdrop-blur-md"
                >
                  {p.platform}
                </span>
              ))}
              {detectedPlatforms.length > 6 && (
                <span className="px-2 py-0.5 text-xs text-slate-500">
                  +{detectedPlatforms.length - 6}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No platforms detected</p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Background Blobs (Optional, via CSS or here) */}

        {/* Resource List */}
        <div className="flex-1 flex flex-col min-w-0 z-10">
          {/* Header */}
          <header className="p-6 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold text-white capitalize tracking-tight drop-shadow-md transition-opacity duration-300 ${activeTab === "marketplace" ? "opacity-0 invisible w-0" : "opacity-100"
                }`}>
                {activeTab}
              </h2>
              <div className="flex items-center gap-3 ml-auto">
                {/* Batch Mode Toggle */}
                {["skills", "commands", "agents"].includes(activeTab) && (
                  <button
                    onClick={() => {
                      setBatchMode(!batchMode);
                      if (batchMode) setCheckedIds(new Set());
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${batchMode
                      ? "bg-primary-500 text-white border-primary-400 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                  >
                    {batchMode ? "✓ Batch Active" : "☐ Batch Select"}
                  </button>
                )}
                <button
                  onClick={() => refreshResources()}
                  disabled={resourcesLoading}
                  className="px-4 py-2 text-sm font-medium bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className={resourcesLoading ? "animate-spin" : ""}>↻</span>
                  {resourcesLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Batch Actions Bar */}
            {batchMode && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="text-sm text-primary-700 dark:text-primary-300">
                  {checkedIds.size} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                >
                  Clear
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleBatchInstall}
                  disabled={checkedIds.size === 0}
                  className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                >
                  Install All
                </button>
                <button
                  onClick={handleBatchUninstall}
                  disabled={checkedIds.size === 0}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Uninstall All
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-75 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-slate-900 rounded-xl border border-white/10">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                  🔍
                </span>
                {/* Clear search button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Filter Panel - Only show for resource tabs */}
          {["skills", "commands", "agents"].includes(activeTab) && (
            <FilterPanel
              categories={availableCategories}
              tags={availableTags}
              selectedCategories={selectedCategories}
              selectedTags={selectedTags}
              onCategoryChange={setSelectedCategories}
              onTagChange={setSelectedTags}
              onClear={handleClearFilters}
            />
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && ["skills", "commands", "agents"].includes(activeTab) && (
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                {Array.from(selectedCategories).map((cat) => (
                  <span
                    key={`cat-${cat}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    📁 {cat}
                    <button
                      onClick={() => {
                        const next = new Set(selectedCategories);
                        next.delete(cat);
                        setSelectedCategories(next);
                      }}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {Array.from(selectedTags).map((tag) => (
                  <span
                    key={`tag-${tag}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                  >
                    🏷️ {tag}
                    <button
                      onClick={() => {
                        const next = new Set(selectedTags);
                        next.delete(tag);
                        setSelectedTags(next);
                      }}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2"
                >
                  Clear all
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Showing {filteredResources.length} of {resourcesByType.length} {activeTab}
              </p>
            </div>
          )}

          {/* Resource Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "settings" ? (
              <SettingsPage />
            ) : activeTab === "external" ? (
              <ExternalPanel />
            ) : activeTab === "marketplace" ? (
              <MarketplacePanel />
            ) : resourcesLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading resources...</p>
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid gap-3">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    selected={selectedResource?.id === resource.id}
                    showCheckbox={batchMode}
                    checked={checkedIds.has(resource.id)}
                    onCheckChange={(checked) => handleToggleCheck(resource.id, checked)}
                    onClick={() => selectResource(resource)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3">📭</span>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || hasActiveFilters
                    ? "No resources match your filters"
                    : `No ${activeTab} found`}
                </p>
                {(searchQuery || hasActiveFilters) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleClearFilters();
                    }}
                    className="mt-3 text-primary-500 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
                {!searchQuery && !hasActiveFilters && (
                  <button
                    onClick={() => refreshResources()}
                    className="mt-3 text-primary-500 hover:underline"
                  >
                    Scan for resources
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedResource && (
          <div className="w-96">
            <ResourceDetail
              resource={selectedResource}
              platforms={platforms}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              onUpdate={handleUpdate}
              onClose={() => selectResource(null)}
            />
          </div>
        )}
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

interface NavItemProps {
  icon: string;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, count, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${active
        ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white shadow-lg border border-primary-500/20"
        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full shadow-[0_0_10px_#0ea5e9]" />
      )}
      <span className={`text-xl transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>{icon}</span>
      <span className={`flex-1 font-medium tracking-wide ${active ? "text-primary-100" : ""}`}>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 text-xs rounded-full ${active
          ? "bg-primary-500/30 text-primary-200"
          : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
          }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// SettingsPanel removed in favor of SettingsPage component


export default App;
