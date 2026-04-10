import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useI18n } from "@/i18n";
import { useNpxSkillsStore, selectVisibleCatalogItems } from "@/stores/npxSkillsStore";
import type {
  InstallTarget,
  NpxSkillsCatalogItemDto,
  NpxSkillsInstallItemInput,
  ResolvedInstallTarget,
} from "@/types";
import NpxFindView from "./npx-skills/NpxFindView";
import { useUiStore } from "@/stores/uiStore";

interface LayoutContext {
  currentWorkspaceId: string | null;
  installTarget: InstallTarget;
  installTargetLoading: boolean;
  resolvedTarget: ResolvedInstallTarget | null;
  isMobile: boolean;
  requestCatalog: () => Promise<void>;
  selectedInstallPayload: NpxSkillsInstallItemInput[];
  selectedCatalogItems: NpxSkillsCatalogItemDto[];
}

export default function NpxDiscoverPage() {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showNotification } = useUiStore();
  const ctx = useOutletContext<LayoutContext>();

  const store = useNpxSkillsStore;

  // Store state
  const catalogSearch = store((s) => s.catalogSearch);
  const installedOnly = store((s) => s.installedOnly);
  const catalogItems = store((s) => s.catalogItems);
  const catalogGroups = store((s) => s.catalogGroups);
  const catalogLoading = store((s) => s.catalogLoading);
  const catalogError = store((s) => s.catalogError);
  const selectedCatalogCategoryId = store((s) => s.selectedCatalogCategoryId);
  const selectedCatalogKeys = store((s) => s.selectedCatalogKeys);
  const packagePreviewInput = store((s) => s.packagePreviewInput);
  const packagePreviewLoading = store((s) => s.packagePreviewLoading);
  const packagePreviewError = store((s) => s.packagePreviewError);
  const packagePreview = store((s) => s.packagePreview);
  const selectedPreviewSkills = store((s) => s.selectedPreviewSkills);
  const jobRunning = store((s) => s.jobRunning);
  const jobOperation = store((s) => s.jobOperation);
  const jobStatusMessage = store((s) => s.jobStatusMessage);
  const jobResultStatus = store((s) => s.jobResultStatus);
  const jobItems = store((s) => s.jobItems);
  const jobCompleted = store((s) => s.jobCompleted);
  const jobTotal = store((s) => s.jobTotal);
  const jobSuccessCount = store((s) => s.jobSuccessCount);
  const jobFailureCount = store((s) => s.jobFailureCount);
  const jobPercent = store((s) => s.jobPercent);
  const jobId = store((s) => s.jobId);
  const streamDisconnected = store((s) => s.streamDisconnected);
  const agents = store((s) => s.agents);
  const cliMode = store((s) => s.cliMode);

  const visibleCatalogItems = useMemo(
    () => selectVisibleCatalogItems(store.getState()),
    [catalogItems, catalogSearch, installedOnly, selectedCatalogCategoryId],
  );

  const openInstallSelectedDialog = useCallback(() => {
    if (ctx.selectedInstallPayload.length === 0) return;
    store.getState().setPendingRunAction({
      kind: "install",
      items: ctx.selectedInstallPayload,
      labels: ctx.selectedCatalogItems.map((item) => {
        let label = item.package_ref;
        if (item.skill_flag) label += ` --skill ${item.skill_flag}`;
        return label;
      }),
      itemCount: ctx.selectedCatalogItems.length,
    });
  }, [ctx.selectedInstallPayload, ctx.selectedCatalogItems]);

  const openPackagePreviewForItem = useCallback(
    (item: NpxSkillsCatalogItemDto) => {
      if (!ctx.currentWorkspaceId || !ctx.resolvedTarget || ctx.installTargetLoading) return;
      void store
        .getState()
        .loadPackagePreview(
          ctx.currentWorkspaceId,
          item.package_ref,
          ctx.installTarget,
          agents,
          cliMode,
          item.skill_flag ? [item.skill_flag] : null,
        );
    },
    [ctx.currentWorkspaceId, ctx.resolvedTarget, ctx.installTargetLoading, ctx.installTarget, agents, cliMode],
  );

  const previewPackage = useCallback(() => {
    if (
      !packagePreviewInput.trim() ||
      !ctx.currentWorkspaceId ||
      !ctx.resolvedTarget ||
      ctx.installTargetLoading
    ) return;
    void store
      .getState()
      .loadPackagePreview(
        ctx.currentWorkspaceId,
        packagePreviewInput.trim(),
        ctx.installTarget,
        agents,
        cliMode,
        null,
      );
  }, [
    packagePreviewInput,
    ctx.currentWorkspaceId,
    ctx.resolvedTarget,
    ctx.installTargetLoading,
    ctx.installTarget,
    agents,
    cliMode,
  ]);

  const installPreviewSelection = useCallback(() => {
    if (!packagePreview) return;
    store.getState().setPendingRunAction({
      kind: "quick-install",
      packageRef: packagePreview.package_ref,
      skillFlagsInput:
        packagePreview.mode === "listed_skills"
          ? Array.from(selectedPreviewSkills).join("\n")
          : "",
    });
  }, [packagePreview, selectedPreviewSkills]);

  return (
    <NpxFindView
      t={t}
      isMobile={isMobile}
      catalogSearch={catalogSearch}
      setCatalogSearch={store.getState().setCatalogSearch}
      installedOnly={installedOnly}
      setInstalledOnly={store.getState().setInstalledOnly}
      fetchCatalog={() => void ctx.requestCatalog()}
      openInstallSelectedDialog={openInstallSelectedDialog}
      selectedInstallPayload={ctx.selectedInstallPayload}
      jobRunning={jobRunning}
      jobOperation={jobOperation}
      jobStatusMessage={jobStatusMessage}
      jobResultStatus={jobResultStatus}
      jobItems={jobItems}
      jobCompleted={jobCompleted}
      jobTotal={jobTotal}
      jobSuccessCount={jobSuccessCount}
      jobFailureCount={jobFailureCount}
      jobPercent={jobPercent}
      jobId={jobId}
      streamDisconnected={streamDisconnected}
      catalogGroups={catalogGroups}
      selectedCatalogCategoryId={selectedCatalogCategoryId}
      setSelectedCatalogCategoryId={store.getState().setSelectedCatalogCategoryId}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      installTargetLoading={ctx.installTargetLoading}
      catalogItems={catalogItems}
      visibleCatalogItems={visibleCatalogItems}
      selectedCatalogKeys={selectedCatalogKeys}
      setSelectedCatalogKeys={store.getState().setSelectedCatalogKeys}
      installTargetScope={ctx.installTarget.scope}
      showNotification={showNotification}
      packagePreviewInput={packagePreviewInput}
      setPackagePreviewInput={store.getState().setPackagePreviewInput}
      packagePreviewLoading={packagePreviewLoading}
      packagePreviewError={packagePreviewError}
      packagePreview={packagePreview}
      selectedPreviewSkills={selectedPreviewSkills}
      setSelectedPreviewSkills={store.getState().setSelectedPreviewSkills}
      previewPackage={previewPackage}
      installPreviewSelection={installPreviewSelection}
      openPackagePreviewForItem={openPackagePreviewForItem}
    />
  );
}
