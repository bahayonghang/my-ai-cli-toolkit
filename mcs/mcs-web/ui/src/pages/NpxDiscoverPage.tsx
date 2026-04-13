import { useCallback } from "react";
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

const npxSkillsStore = useNpxSkillsStore;

export default function NpxDiscoverPage() {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showNotification } = useUiStore();
  const ctx = useOutletContext<LayoutContext>();

  // Store state
  const catalogSearch = npxSkillsStore((s) => s.catalogSearch);
  const installedOnly = npxSkillsStore((s) => s.installedOnly);
  const catalogItems = npxSkillsStore((s) => s.catalogItems);
  const catalogGroups = npxSkillsStore((s) => s.catalogGroups);
  const catalogLoading = npxSkillsStore((s) => s.catalogLoading);
  const catalogError = npxSkillsStore((s) => s.catalogError);
  const selectedCatalogCategoryId = npxSkillsStore((s) => s.selectedCatalogCategoryId);
  const selectedCatalogKeys = npxSkillsStore((s) => s.selectedCatalogKeys);
  const packagePreviewInput = npxSkillsStore((s) => s.packagePreviewInput);
  const packagePreviewLoading = npxSkillsStore((s) => s.packagePreviewLoading);
  const packagePreviewError = npxSkillsStore((s) => s.packagePreviewError);
  const packagePreview = npxSkillsStore((s) => s.packagePreview);
  const selectedPreviewSkills = npxSkillsStore((s) => s.selectedPreviewSkills);
  const jobRunning = npxSkillsStore((s) => s.jobRunning);
  const jobOperation = npxSkillsStore((s) => s.jobOperation);
  const jobStatusMessage = npxSkillsStore((s) => s.jobStatusMessage);
  const jobResultStatus = npxSkillsStore((s) => s.jobResultStatus);
  const jobItems = npxSkillsStore((s) => s.jobItems);
  const jobCompleted = npxSkillsStore((s) => s.jobCompleted);
  const jobTotal = npxSkillsStore((s) => s.jobTotal);
  const jobSuccessCount = npxSkillsStore((s) => s.jobSuccessCount);
  const jobFailureCount = npxSkillsStore((s) => s.jobFailureCount);
  const jobPercent = npxSkillsStore((s) => s.jobPercent);
  const jobId = npxSkillsStore((s) => s.jobId);
  const streamDisconnected = npxSkillsStore((s) => s.streamDisconnected);
  const agents = npxSkillsStore((s) => s.agents);
  const cliMode = npxSkillsStore((s) => s.cliMode);

  const visibleCatalogItems = selectVisibleCatalogItems(npxSkillsStore.getState());

  const openInstallSelectedDialog = useCallback(() => {
    if (ctx.selectedInstallPayload.length === 0) return;
    npxSkillsStore.getState().setPendingRunAction({
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
      void npxSkillsStore
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
    void npxSkillsStore
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
    npxSkillsStore.getState().setPendingRunAction({
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
      setCatalogSearch={npxSkillsStore.getState().setCatalogSearch}
      installedOnly={installedOnly}
      setInstalledOnly={npxSkillsStore.getState().setInstalledOnly}
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
      setSelectedCatalogCategoryId={npxSkillsStore.getState().setSelectedCatalogCategoryId}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      installTargetLoading={ctx.installTargetLoading}
      catalogItems={catalogItems}
      visibleCatalogItems={visibleCatalogItems}
      selectedCatalogKeys={selectedCatalogKeys}
      setSelectedCatalogKeys={npxSkillsStore.getState().setSelectedCatalogKeys}
      installTargetScope={ctx.installTarget.scope}
      showNotification={showNotification}
      packagePreviewInput={packagePreviewInput}
      setPackagePreviewInput={npxSkillsStore.getState().setPackagePreviewInput}
      packagePreviewLoading={packagePreviewLoading}
      packagePreviewError={packagePreviewError}
      packagePreview={packagePreview}
      selectedPreviewSkills={selectedPreviewSkills}
      setSelectedPreviewSkills={npxSkillsStore.getState().setSelectedPreviewSkills}
      previewPackage={previewPackage}
      installPreviewSelection={installPreviewSelection}
      openPackagePreviewForItem={openPackagePreviewForItem}
    />
  );
}
