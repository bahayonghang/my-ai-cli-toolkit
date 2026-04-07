import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { lightTheme } from "@/theme";
import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCapabilitiesDto,
} from "@/types";
import NpxInstalledView from "./NpxInstalledView";

function installedItem(
  id: string,
  name: string,
): NpxInstalledSkillInstanceDto {
  return {
    id,
    name,
    scope: "global",
    agents: ["codex"],
    group_id: "engineering",
    group_label: "Engineering",
    group_order: 10,
    category_id: "tools",
    category_slug: "dev-tools",
    category_label: "Tools",
    category_order: 20,
    tags: ["search"],
    description: `${name} description`,
    source: {
      kind: "curated",
      ref: "vercel-labs/skills",
      display: "vercel-labs/skills",
    },
    catalog_match: {
      id,
      name,
      category_label: "Tools",
    },
    tracking: {
      kind: "tracked",
      source_type: "github",
      installed_at: null,
      updated_at: null,
      reason: null,
    },
    update: {
      kind: "not_checked",
      last_checked_at_ms: null,
      reason: null,
    },
    actions: {
      removable: true,
      reinstallable: true,
      batch_updatable: true,
    },
  };
}

const capabilities: NpxSkillsCapabilitiesDto = {
  list: { supported: true, reason: null },
  remove: { supported: true, reason: null },
  check: { supported: true, reason: null },
  update: { supported: true, reason: null },
};

function t(
  key: string,
  values?: Record<string, string | number | boolean | null | undefined>,
) {
  switch (key) {
    case "npxSkills.inventoryVisible":
      return `${values?.count ?? 0} visible`;
    case "npxSkills.inventorySelected":
      return `${values?.count ?? 0} selected`;
    case "npxSkills.summaryInstalled":
      return "Installed";
    case "npxSkills.summaryCurated":
      return "Curated";
    case "npxSkills.summaryManual":
      return "Manual";
    case "npxSkills.summaryUpdates":
      return "Updates";
    case "npxSkills.filterTracked":
      return "Tracked";
    case "npxSkills.inventoryScopedToCurrentTarget":
      return "Scoped to current target";
    case "npxSkills.refreshInstalled":
      return "Refresh Installed";
    case "npxSkills.removeSelected":
      return "Remove Selected";
    case "npxSkills.searchInstalledPlaceholder":
      return "Search installed skills...";
    case "npxSkills.filterSource":
      return "Source";
    case "npxSkills.filterTracking":
      return "Tracking";
    case "npxSkills.filterUpdate":
      return "Update";
    case "npxSkills.filterCurated":
      return "Curated";
    case "npxSkills.filterManual":
      return "Manual";
    case "common.all":
      return "All";
    case "npxSkills.updateState.update_available":
      return "Update available";
    case "npxSkills.updateState.up_to_date":
      return "Up to date";
    case "npxSkills.updateState.not_checked":
      return "Not checked";
    case "npxSkills.updateState.unsupported":
      return "Unsupported";
    case "common.name":
      return "Name";
    case "npxSkills.installedSource":
      return "Source";
    case "npxSkills.installedCatalogMatch":
      return "Catalog Match";
    case "npxSkills.installedAgents":
      return "Agents";
    case "common.actions":
      return "Actions";
    case "installed.installTargetGlobal":
      return "Global";
    case "common.viewDetail":
      return "View";
    case "common.uninstall":
      return "Uninstall";
    case "common.selectItem":
      return `Select ${values?.name ?? ""}`;
    case "npxSkills.noAgents":
      return "No agents";
    case "npxSkills.installedCatalogMatchNone":
      return "No catalog match";
    default:
      return key;
  }
}

describe("NpxInstalledView", () => {
  it("renders only the current page slice while keeping the full filtered summary", () => {
    const third = installedItem("third", "third-skill");
    const markup = renderToStaticMarkup(
      <ThemeProvider theme={lightTheme}>
        <NpxInstalledView
          t={t}
          isMobile={false}
          installedSearch=""
          setInstalledSearch={() => {}}
          fetchInstalled={() => {}}
          jobRunning={false}
          installedItems={[third]}
          installedSummary={{
            total: 3,
            curated: 3,
            manual: 0,
            tracked: 3,
            update_available: 0,
          }}
          selectedInstalledIds={new Set()}
          setSelectedInstalledIds={() => new Set()}
          openRemoveSelected={() => {}}
          openRemoveDialog={() => {}}
          openInstalledDetail={() => {}}
          installedGroups={[]}
          selectedInstalledCategoryId={null}
          setSelectedInstalledCategoryId={() => {}}
          installedError={null}
          installedErrorHint={null}
          installedLoading={false}
          installTargetLoading={false}
          filteredInstalledTotal={3}
          installedPage={2}
          setInstalledPage={() => {}}
          installedTotalPages={2}
          sourceFilter="all"
          setSourceFilter={() => {}}
          trackingFilter="all"
          setTrackingFilter={() => {}}
          updateFilter="all"
          setUpdateFilter={() => {}}
          capabilities={capabilities}
        />
      </ThemeProvider>,
    );

    expect(markup).toContain("3 visible");
    expect(markup).toContain("third-skill");
    expect(markup).not.toContain("first-skill");
    expect(markup).not.toContain("second-skill");
  });
});
