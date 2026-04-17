import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";

import type {
  NpxSkillsCatalogItemDto,
  NpxSkillsInstallItemInput,
} from "@/types";
import { lightTheme } from "@/theme";
import NpxFindView from "./NpxFindView";
import { buildCatalogSections, buildTaxonomyGroups } from "./utils";
import type { JobLogEntry, JobItemState } from "./types";

function catalogItem(
  overrides: Partial<NpxSkillsCatalogItemDto> = {},
): NpxSkillsCatalogItemDto {
  return {
    id: overrides.id ?? "find-skills",
    name: overrides.name ?? "Find Skills",
    package_ref: overrides.package_ref ?? "vercel-labs/skills",
    skill_flag: overrides.skill_flag ?? "find-skills",
    group_id: overrides.group_id ?? "engineering",
    group_label: overrides.group_label ?? "Engineering",
    group_order: overrides.group_order ?? 10,
    category_id: overrides.category_id ?? "engineering",
    category_slug: overrides.category_slug ?? "engineering",
    category_label: overrides.category_label ?? "Engineering",
    category_order: overrides.category_order ?? 10,
    tags: overrides.tags ?? ["search"],
    install_kind: overrides.install_kind ?? "skills_cli",
    install_provider: overrides.install_provider ?? "vercel",
    description: overrides.description ?? "Search and discovery helpers",
    stars: overrides.stars ?? 5,
    project_only: overrides.project_only ?? false,
    usage: overrides.usage ?? "npx skills add",
    installed_state: overrides.installed_state ?? "not_installed",
    installed_instance_id: overrides.installed_instance_id ?? null,
  };
}

function t(
  key: string,
  values?: Record<string, string | number | boolean | null | undefined>,
) {
  switch (key) {
    case "npxSkills.sectionInstallFromRepo":
      return "Install from Repo";
    case "npxSkills.repoInstallTitle":
      return "Preview a package before you install it";
    case "npxSkills.repoInstallSubtitle":
      return "Inspect package contents before installing.";
    case "npxSkills.repoInstallChip":
      return "Visible on first load";
    case "npxSkills.packageRef":
      return "Package";
    case "npxSkills.packageRefPlaceholder":
      return "vercel-labs/skills";
    case "npxSkills.previewRepo":
      return "Preview Repo";
    case "npxSkills.discoverTitle":
      return "Browse recommended skill packages";
    case "npxSkills.discoverSubtitle":
      return "Recommended rows stay grouped by package for execution.";
    case "npxSkills.searchCatalogPlaceholder":
      return "Search skills catalog...";
    case "npxSkills.installedOnly":
      return "Only installed";
    case "npxSkills.refreshCatalog":
      return "Refresh Catalog";
    case "npxSkills.discoverVisibleSummary":
      return `${values?.skills ?? 0} skills across ${values?.categories ?? 0} categories`;
    case "npxSkills.catalogSelectionCount":
      return `${values?.count ?? 0} curated skills selected`;
    case "common.category":
      return "Category";
    case "common.all":
      return "All";
    case "npxSkills.discoverJumpAll":
      return "Jump to top";
    case "npxSkills.discoverSectionCount":
      return `${values?.count ?? 0} skills`;
    case "common.selectItem":
      return `Select ${values?.name ?? ""}`;
    case "common.selected":
      return "Selected";
    case "status.installed":
      return "Installed";
    case "status.notInstalled":
      return "Not installed";
    case "npxSkills.projectOnly":
      return "Project Only";
    case "npxSkills.noDescription":
      return "No description available";
    case "npxSkills.openRepoInstall":
      return "Open GitHub repo";
    case "npxSkills.openRepoUnavailable":
      return "Repo URL is unavailable for this item";
    case "npxSkills.openRepoFailed":
      return "Failed to open the repository page";
    case "npxSkills.copyInstallCommand":
      return "Copy install command";
    case "npxSkills.discoverSelectionSummary":
      return `${values?.skills ?? 0} skills · ${values?.packages ?? 0} packages`;
    case "npxSkills.discoverInstallTargetChip":
      return `Target · ${values?.mode ?? ""}`;
    case "npxSkills.discoverSelectionReady":
      return "Selection stays staged here so install progress and logs never disappear.";
    case "npxSkills.discoverSelectionEmpty":
      return "Choose skills from the catalog to stage a batch install here.";
    case "npxSkills.discoverSelectionMore":
      return `+${values?.count ?? 0} more`;
    case "npxSkills.discoverShowLogs":
      return "Show logs";
    case "npxSkills.discoverHideLogs":
      return "Hide logs";
    case "npxSkills.discoverLogTitle":
      return "Install activity";
    case "npxSkills.discoverLogEmpty":
      return "Logs will appear here when an install job starts.";
    case "npxSkills.discoverFailureTitle":
      return `${values?.count ?? 0} skills need attention`;
    case "npxSkills.discoverFailureHint":
      return "These installs failed or were marked failed before the UI received a final completion event.";
    case "npxSkills.discoverFailureInterruptedHint":
      return "The job stream disconnected before the final confirmation arrived. The remaining skills were marked as failed so you can inspect them explicitly.";
    case "npxSkills.discoverFailureDetails":
      return "View failed details";
    case "npxSkills.discoverFailureSectionTitle":
      return "Failed skills";
    case "npxSkills.discoverFailureMore":
      return `+${values?.count ?? 0} more failed`;
    case "npxSkills.installSelected":
      return "Install Selected";
    case "common.clear":
      return "Clear";
    case "npxSkills.runResultRunning":
      return "Running";
    case "npxSkills.jobCurrent":
      return `${values?.completed ?? 0}/${values?.total ?? 0} complete`;
    case "npxSkills.jobSuccess":
      return `${values?.count ?? 0} succeeded`;
    case "npxSkills.jobFailed":
      return `${values?.count ?? 0} failed`;
    case "npxSkills.itemStatusRunning":
      return "Running";
    case "npxSkills.itemStatusSuccess":
      return "Success";
    case "npxSkills.itemStatusError":
      return "Failed";
    case "npxSkills.itemShowDetails":
      return "Show details";
    case "npxSkills.itemHideDetails":
      return "Hide details";
    case "npxSkills.itemErrorSummary":
      return "Error";
    case "npxSkills.itemOutputLabel":
      return "Output";
    case "npxSkills.jobEmpty":
      return "No job has run yet";
    case "npxSkills.operationInstall":
      return "Install";
    case "installed.installTargetGlobal":
      return "Global";
    case "installed.installTargetProject":
      return "Project";
    case "common.selectedCount":
      return `${values?.count ?? 0} selected`;
    default:
      return key;
  }
}

describe("NpxFindView", () => {
  it("renders grouped discover sections and the fixed install activity bar", () => {
    const items = [
      catalogItem({
        id: "theme-factory",
        name: "Theme Factory",
        category_id: "design",
        category_slug: "design",
        category_label: "Design",
        category_order: 5,
      }),
      catalogItem({
        id: "find-skills",
        name: "Find Skills",
      }),
    ];
    const groups = buildTaxonomyGroups(items);
    const sections = buildCatalogSections(items, groups);
    const jobItems: JobItemState[] = [
      {
        id: "0",
        label: "vercel-labs/skills · 2 skills",
        status: "error",
        output: "install output",
        error: "stream interrupted",
        durationMs: 5400,
      },
    ];
    const logs: JobLogEntry[] = [
      {
        id: "log-1",
        timestampMs: Date.now(),
        level: "info",
        label: "vercel-labs/skills · 2 skills",
        message: "Running",
        output: "install output",
      },
    ];
    const markup = renderToStaticMarkup(
      <ThemeProvider theme={lightTheme}>
        <NpxFindView
          t={t}
          catalogSearch=""
          setCatalogSearch={() => {}}
          installedOnly={false}
          setInstalledOnly={() => {}}
          fetchCatalog={() => {}}
          openInstallSelectedDialog={() => {}}
          selectedInstallPayload={[{ package_ref: "vercel-labs/skills", skill_flags: ["find-skills", "theme-factory"] } as NpxSkillsInstallItemInput]}
          jobRunning={true}
          activityRunId={null}
          jobOperation="install"
          jobStatusMessage="Installing selected skills"
          jobResultStatus="running"
          jobItems={jobItems}
          jobCompleted={0}
          jobTotal={1}
          jobSuccessCount={0}
          jobFailureCount={0}
          jobPercent={40}
          streamDisconnected={true}
          catalogSections={sections}
          activeCatalogAnchorId={null}
          setActiveCatalogAnchorId={() => {}}
          catalogError={null}
          catalogLoading={false}
          installTargetLoading={false}
          catalogItems={items}
          visibleCatalogItems={items}
          selectedCatalogKeys={new Set(["vercel-labs/skills::find-skills", "vercel-labs/skills::theme-factory"])}
          setSelectedCatalogKeys={() => {}}
          installTargetScope="global"
          selectedNamesPreview={["Find Skills", "Theme Factory"]}
          selectedPackageCount={1}
          selectedSkillCount={2}
          installTargetSummary={{ mode: "global", path: "/tmp/claude/skills" }}
          jobLogEntries={logs}
          showNotification={() => {}}
          packagePreviewInput=""
          setPackagePreviewInput={() => {}}
          packagePreviewLoading={false}
          packagePreviewError={null}
          packagePreview={null}
          selectedPreviewSkills={new Set()}
          setSelectedPreviewSkills={() => {}}
          previewPackage={() => {}}
          installPreviewSelection={() => {}}
          openRepoForItem={() => {}}
          onViewActivity={() => {}}
        />
      </ThemeProvider>,
    );

    expect(markup.indexOf("design · Design")).toBeLessThan(markup.indexOf("engineering · Engineering"));
    expect(markup).toContain("2 skills · 1 packages");
    expect(markup).toContain("Install activity");
    expect(markup).toContain("Install Selected");
    expect(markup).toContain("install output");
    expect(markup).toContain("1 skills need attention");
    expect(markup).toContain("Failed skills");
    expect(markup).toContain("stream interrupted");
  });
});
