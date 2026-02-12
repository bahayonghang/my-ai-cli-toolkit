/**
 * AgentKit Desktop - Main Application Component
 */

import { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useResourceStore, usePlatformStore, useSettingsStore } from "@/stores";
import { useToast, useResourceFilters, useBatchOperations } from "@/hooks";
import type { Platform, ResourceType } from "@/types";
import type { TabType } from "@/components/Sidebar";
import { ResourceDetail } from "@/components/ResourceDetail";
import { ToastContainer } from "@/components/Toast";
import { ComponentErrorBoundary } from "@/components/ComponentErrorBoundary";
import { Sidebar } from "@/components/Sidebar";
import { ResourceListPanel } from "@/components/ResourceListPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const TAB_TO_TYPE: Record<string, ResourceType | null> = {
  skills: "skill", commands: "command", agents: "agent",
};

const APP_BOOT_MARK = "agentkit:boot:start";
const APP_FIRST_DATA_MARK = "agentkit:first_data";
const APP_FIRST_RENDER_MARK = "agentkit:first_render";
const APP_BOOT_TO_FIRST_DATA_MEASURE = "agentkit:boot_to_first_data";
const APP_BOOT_TO_FIRST_RENDER_MEASURE = "agentkit:boot_to_first_render";

let appInitPromise: Promise<void> | null = null;
let firstDataMeasured = false;
let firstRenderMeasured = false;

if (typeof performance !== "undefined" && performance.getEntriesByName(APP_BOOT_MARK).length === 0) {
  performance.mark(APP_BOOT_MARK);
}

function logPerfMeasure(measureName: string) {
  if (typeof performance === "undefined") {
    return;
  }
  const entries = performance.getEntriesByName(measureName);
  const latest = entries[entries.length - 1];
  if (latest) {
    console.debug(`[perf] ${measureName}: ${latest.duration.toFixed(1)}ms`);
  }
}

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("skills");
  const { toasts, removeToast, success, error } = useToast();

  const {
    resources, selectedResource, loading: resourcesLoading,
    fetchResources, refreshResources, selectResource,
    installResource, uninstallResource, updateResource,
  } = useResourceStore();

  const { platforms, loading: platformsLoading, fetchPlatforms } = usePlatformStore();
  const { fetchSettings } = useSettingsStore();

  const {
    filtered, counts, searchQuery, setSearchQuery,
    selectedCategories, setSelectedCategories,
    selectedTags, setSelectedTags,
    availableCategories, availableTags,
    hasActiveFilters, clearFilters, clearAll, resourcesByType,
  } = useResourceFilters(resources, TAB_TO_TYPE[activeTab] ?? null);

  const detectedPlatforms = platforms.filter(p => p.detected);
  const targetPlatforms = detectedPlatforms.map(p => p.platform);

  const batch = useBatchOperations({
    installResource, uninstallResource,
    onSuccess: success, onError: error,
  });
  const { exitBatchMode } = batch;

  const initializeApp = useCallback(() => {
    if (appInitPromise) {
      return appInitPromise;
    }

    appInitPromise = Promise.allSettled([
      fetchSettings(),
      fetchPlatforms(),
      fetchResources(),
    ]).then(() => {
      if (!firstDataMeasured && typeof performance !== "undefined") {
        performance.mark(APP_FIRST_DATA_MARK);
        performance.measure(APP_BOOT_TO_FIRST_DATA_MEASURE, APP_BOOT_MARK, APP_FIRST_DATA_MARK);
        logPerfMeasure(APP_BOOT_TO_FIRST_DATA_MEASURE);
        firstDataMeasured = true;
      }
    });

    return appInitPromise;
  }, [fetchPlatforms, fetchResources, fetchSettings]);

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  // Clear state when changing tabs
  useEffect(() => {
    exitBatchMode();
    clearAll();
  }, [activeTab, exitBatchMode, clearAll]);

  useEffect(() => {
    if (firstRenderMeasured) {
      return;
    }
    if ((resources.length === 0 && platforms.length === 0) || resourcesLoading || platformsLoading) {
      return;
    }
    if (typeof performance !== "undefined") {
      performance.mark(APP_FIRST_RENDER_MARK);
      performance.measure(APP_BOOT_TO_FIRST_RENDER_MEASURE, APP_BOOT_MARK, APP_FIRST_RENDER_MARK);
      logPerfMeasure(APP_BOOT_TO_FIRST_RENDER_MEASURE);
    }
    firstRenderMeasured = true;
  }, [resources.length, platforms.length, resourcesLoading, platformsLoading]);

  const isResourceTab = ["skills", "commands", "agents"].includes(activeTab);

  return (
    <div className="h-screen w-screen overflow-hidden flex text-slate-100 font-sans selection:bg-primary-500/30">
      <ComponentErrorBoundary componentName="Sidebar">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
          platforms={platforms}
          platformsLoading={platformsLoading}
        />
      </ComponentErrorBoundary>

      {/* Main Content */}
      <main className="flex-1 flex relative overflow-hidden">
        <ComponentErrorBoundary componentName="ResourceList">
          <ResourceListPanel
            activeTab={activeTab}
            isResourceTab={isResourceTab}
            filtered={filtered}
            resourcesLoading={resourcesLoading}
            resourcesByType={resourcesByType}
            selectedResource={selectedResource}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            selectedTags={selectedTags}
            availableCategories={availableCategories}
            availableTags={availableTags}
            hasActiveFilters={hasActiveFilters}
            onCategoryChange={setSelectedCategories}
            onTagChange={setSelectedTags}
            onClearFilters={clearFilters}
            onClearAll={clearAll}
            batch={batch}
            targetPlatforms={targetPlatforms}
            onRefresh={refreshResources}
            onSelectResource={selectResource}
          />
        </ComponentErrorBoundary>

        {/* Detail Panel */}
        {selectedResource && (
          <div className="w-96">
            <ComponentErrorBoundary componentName="ResourceDetail">
              <ResourceDetail resource={selectedResource} platforms={platforms}
                onInstall={async (p: Platform[]) => { await installResource(selectedResource.id, p); }}
                onUninstall={async (p: Platform[]) => { await uninstallResource(selectedResource.id, p); }}
                onUpdate={async () => { await updateResource(selectedResource.id); }}
                onClose={() => selectResource(null)} />
            </ComponentErrorBoundary>
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Confirm Dialog */}
      {batch.confirmDialog && (
        <ConfirmDialog
          open={true}
          title={batch.confirmDialog.action === "install" ? t('batch.confirmInstall') : t('batch.confirmUninstall')}
          message={t('batch.confirmMessage', { action: batch.confirmDialog.action, count: batch.checkedIds.size, platforms: batch.confirmDialog.platforms.join(", ") })}
          confirmLabel={batch.confirmDialog.action === "install" ? t('action.install') : t('action.uninstall')}
          variant={batch.confirmDialog.action === "install" ? "info" : "danger"}
          onConfirm={() => batch.confirmBatchAction?.()}
          onCancel={() => batch.cancelBatchAction?.()}
        />
      )}
    </div>
  );
}

export default App;
