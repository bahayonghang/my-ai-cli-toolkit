import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { useI18n } from "@/i18n";
import {
  useNpxSkillsStore,
  selectCatalogSections,
  selectVisibleCatalogItems,
} from "@/stores/npxSkillsStore";
import type {
  InstallTarget,
  NpxSkillsCatalogItemDto,
  NpxSkillsInstallItemInput,
  ResolvedInstallTarget,
} from "@/types";
import NpxFindView from "./npx-skills/NpxFindView";
import { useUiStore } from "@/stores/uiStore";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { buildActivityRunPath } from "@/utils/activityNavigation";
import { describeInstallItemInput, resolveRepoUrl } from "./npx-skills/utils";

interface LayoutContext {
  currentWorkspaceId: string | null;
  installTarget: InstallTarget;
  installTargetLoading: boolean;
  resolvedTarget: ResolvedInstallTarget | null;
  installTargetPath: string;
  requestCatalog: () => Promise<void>;
  selectedInstallPayload: NpxSkillsInstallItemInput[];
  selectedCatalogItems: NpxSkillsCatalogItemDto[];
  jobRunConfig: { installTarget: InstallTarget } | null;
}

const npxSkillsStore = useNpxSkillsStore;

export default function NpxDiscoverPage() {
  const { t } = useI18n();
  const { showNotification } = useUiStore();
  const navigateDeferred = useNavigateDeferred();
  const ctx = useOutletContext<LayoutContext>();

  // Store state
  const catalogSearch = npxSkillsStore((s) => s.catalogSearch);
  const installedOnly = npxSkillsStore((s) => s.installedOnly);
  const catalogItems = npxSkillsStore((s) => s.catalogItems);
  const catalogLoading = npxSkillsStore((s) => s.catalogLoading);
  const catalogError = npxSkillsStore((s) => s.catalogError);
  const activeCatalogAnchorId = npxSkillsStore((s) => s.activeCatalogAnchorId);
  const selectedCatalogKeys = npxSkillsStore((s) => s.selectedCatalogKeys);
  const packagePreviewInput = npxSkillsStore((s) => s.packagePreviewInput);
  const packagePreviewLoading = npxSkillsStore((s) => s.packagePreviewLoading);
  const packagePreviewError = npxSkillsStore((s) => s.packagePreviewError);
  const packagePreview = npxSkillsStore((s) => s.packagePreview);
  const selectedPreviewSkills = npxSkillsStore((s) => s.selectedPreviewSkills);
  const jobRunning = npxSkillsStore((s) => s.jobRunning);
  const jobId = npxSkillsStore((s) => s.jobId);
  const jobOperation = npxSkillsStore((s) => s.jobOperation);
  const jobStatusMessage = npxSkillsStore((s) => s.jobStatusMessage);
  const jobResultStatus = npxSkillsStore((s) => s.jobResultStatus);
  const jobItems = npxSkillsStore((s) => s.jobItems);
  const jobCompleted = npxSkillsStore((s) => s.jobCompleted);
  const jobTotal = npxSkillsStore((s) => s.jobTotal);
  const jobSuccessCount = npxSkillsStore((s) => s.jobSuccessCount);
  const jobFailureCount = npxSkillsStore((s) => s.jobFailureCount);
  const jobPercent = npxSkillsStore((s) => s.jobPercent);
  const jobLogEntries = npxSkillsStore((s) => s.jobLogEntries);
  const streamDisconnected = npxSkillsStore((s) => s.streamDisconnected);
  const agents = npxSkillsStore((s) => s.agents);
  const cliMode = npxSkillsStore((s) => s.cliMode);

  const visibleCatalogItems = npxSkillsStore(selectVisibleCatalogItems);
  const catalogSections = npxSkillsStore(selectCatalogSections);
  const selectedNamesPreview = useMemo(
    () => ctx.selectedCatalogItems.slice(0, 3).map((item) => item.name),
    [ctx.selectedCatalogItems],
  );
  const effectiveInstallTarget = ctx.jobRunConfig?.installTarget ?? ctx.installTarget;
  const installTargetSummary = useMemo(
    () => ({
      mode: effectiveInstallTarget.scope,
      path:
        effectiveInstallTarget.scope === "project"
          ? effectiveInstallTarget.project_path ?? ctx.installTargetPath
          : ctx.installTargetPath,
    }),
    [ctx.installTargetPath, effectiveInstallTarget],
  );
  const queuedInstallLabels = useMemo(
    () => ctx.selectedInstallPayload.map((item) => describeInstallItemInput(item)),
    [ctx.selectedInstallPayload],
  );

  const openInstallSelectedDialog = useCallback(() => {
    if (ctx.selectedInstallPayload.length === 0) return;
    npxSkillsStore.getState().setPendingRunAction({
      kind: "install",
      items: ctx.selectedInstallPayload,
      labels: queuedInstallLabels,
      itemCount: ctx.selectedCatalogItems.length,
    });
  }, [ctx.selectedCatalogItems.length, ctx.selectedInstallPayload, queuedInstallLabels]);

  const openRepoForItem = useCallback(
    (item: NpxSkillsCatalogItemDto) => {
      const repoUrl = resolveRepoUrl(item.package_ref);
      if (!repoUrl) {
        showNotification(t("npxSkills.openRepoUnavailable"), "warning");
        return;
      }

      const opened = window.open(repoUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        showNotification(t("npxSkills.openRepoFailed"), "error");
      }
    },
    [showNotification, t],
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
      catalogSearch={catalogSearch}
      setCatalogSearch={npxSkillsStore.getState().setCatalogSearch}
      installedOnly={installedOnly}
      setInstalledOnly={npxSkillsStore.getState().setInstalledOnly}
      fetchCatalog={() => void ctx.requestCatalog()}
      openInstallSelectedDialog={openInstallSelectedDialog}
      selectedInstallPayload={ctx.selectedInstallPayload}
      jobRunning={jobRunning}
      activityRunId={jobId}
      jobOperation={jobOperation}
      jobStatusMessage={jobStatusMessage}
      jobResultStatus={jobResultStatus}
      jobItems={jobItems}
      jobCompleted={jobCompleted}
      jobTotal={jobTotal}
      jobSuccessCount={jobSuccessCount}
      jobFailureCount={jobFailureCount}
      jobPercent={jobPercent}
      streamDisconnected={streamDisconnected}
      catalogSections={catalogSections}
      activeCatalogAnchorId={activeCatalogAnchorId}
      setActiveCatalogAnchorId={npxSkillsStore.getState().setActiveCatalogAnchorId}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      installTargetLoading={ctx.installTargetLoading}
      catalogItems={catalogItems}
      visibleCatalogItems={visibleCatalogItems}
      selectedCatalogKeys={selectedCatalogKeys}
      setSelectedCatalogKeys={npxSkillsStore.getState().setSelectedCatalogKeys}
      installTargetScope={ctx.installTarget.scope}
      selectedNamesPreview={selectedNamesPreview}
      selectedPackageCount={ctx.selectedInstallPayload.length}
      selectedSkillCount={ctx.selectedCatalogItems.length}
      installTargetSummary={installTargetSummary}
      jobLogEntries={jobLogEntries}
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
      openRepoForItem={openRepoForItem}
      onViewActivity={(runId) =>
        navigateDeferred(buildActivityRunPath(runId, ctx.currentWorkspaceId))
      }
    />
  );
}
