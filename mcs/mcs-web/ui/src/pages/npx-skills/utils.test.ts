import { describe, expect, it } from "vitest";
import type {
  NpxInstalledSkillInstanceDto,
  NpxSkillsCatalogItemDto,
} from "@/types";
import {
  buildCatalogSections,
  describeInstallItemInput,
  buildTaxonomyGroups,
  filterCatalogItems,
  filterInstalledItems,
  paginateItems,
  resolveRepoUrl,
  shouldLoadCatalog,
  shouldLoadInstalled,
} from "./utils";

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

function installedItem(
  overrides: Partial<NpxInstalledSkillInstanceDto> = {},
): NpxInstalledSkillInstanceDto {
  return {
    id: overrides.id ?? "find-skills",
    name: overrides.name ?? "find-skills",
    scope: overrides.scope ?? "global",
    agents: overrides.agents ?? ["codex"],
    group_id: overrides.group_id ?? "engineering",
    group_label: overrides.group_label ?? "Engineering",
    group_order: overrides.group_order ?? 10,
    category_id: overrides.category_id ?? "engineering",
    category_slug: overrides.category_slug ?? "engineering",
    category_label: overrides.category_label ?? "Engineering",
    category_order: overrides.category_order ?? 10,
    tags: overrides.tags ?? ["search"],
    description: overrides.description ?? "Search and discovery helpers",
    source:
      overrides.source ?? {
        kind: "curated",
        ref: "vercel-labs/skills",
        display: "vercel-labs/skills",
      },
    catalog_match:
      overrides.catalog_match ?? {
        id: "find-skills",
        name: "Find Skills",
        category_label: "Engineering",
      },
    tracking:
      overrides.tracking ?? {
        kind: "tracked",
        source_type: "github",
        installed_at: null,
        updated_at: null,
        reason: null,
      },
    update:
      overrides.update ?? {
        kind: "not_checked",
        last_checked_at_ms: null,
        reason: null,
      },
    actions:
      overrides.actions ?? {
        removable: true,
        reinstallable: true,
        batch_updatable: true,
      },
  };
}

describe("npx-skills utils", () => {
  it("loads only the relevant dataset for each view state", () => {
    expect(shouldLoadCatalog("installed", false, true)).toBe(false);
    expect(shouldLoadCatalog("find", false, false)).toBe(true);
    expect(shouldLoadCatalog("find", true, false)).toBe(false);
    expect(shouldLoadCatalog("find", true, true)).toBe(true);

    expect(shouldLoadInstalled("installed", false, false)).toBe(true);
    expect(shouldLoadInstalled("maintenance", true, true)).toBe(true);
    expect(shouldLoadInstalled("find", false, true)).toBe(false);
  });

  it("filters catalog items locally by search, category, and installed state", () => {
    const items = [
      catalogItem({
        id: "find-skills",
        name: "Find Skills",
        installed_state: "installed",
      }),
      catalogItem({
        id: "unknown-skill",
        name: "Unknown Skill",
        installed_state: "unknown",
      }),
      catalogItem({
        id: "theme-factory",
        name: "Theme Factory",
        category_id: "design",
        category_slug: "design",
        category_label: "Design",
        tags: ["branding"],
      }),
    ];

    expect(
      filterCatalogItems(items, {
        search: "theme",
        categoryId: null,
        installedOnly: false,
      }).map((item) => item.id),
    ).toEqual(["theme-factory"]);

    expect(
      filterCatalogItems(items, {
        search: "",
        categoryId: "engineering",
        installedOnly: true,
      }).map((item) => item.id),
    ).toEqual(["find-skills"]);
  });

  it("filters installed items locally without refetching", () => {
    const items = [
      installedItem({
        id: "find-skills",
        update: {
          kind: "update_available",
          last_checked_at_ms: 1,
          reason: null,
        },
      }),
      installedItem({
        id: "local-debug",
        name: "local-debug",
        source: {
          kind: "manual_local",
          ref: "./skills/local-debug",
          display: "./skills/local-debug",
        },
        tracking: {
          kind: "untracked",
          source_type: null,
          installed_at: null,
          updated_at: null,
          reason: "No lock entry",
        },
        update: {
          kind: "unsupported",
          last_checked_at_ms: null,
          reason: "Local path",
        },
      }),
    ];

    expect(
      filterInstalledItems(items, {
        search: "local",
        categoryId: null,
        sourceFilter: "manual",
        trackingFilter: "untracked",
        updateFilter: "unsupported",
      }).map((item) => item.id),
    ).toEqual(["local-debug"]);
  });

  it("aggregates taxonomy counts without linear category scans", () => {
    const groups = buildTaxonomyGroups([
      catalogItem({ id: "a" }),
      catalogItem({ id: "b" }),
      catalogItem({
        id: "c",
        category_id: "design",
        category_slug: "design",
        category_label: "Design",
        category_order: 5,
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.categories[0]?.slug).toBe("design");
    expect(groups[0]?.categories.map((category) => [category.id, category.count])).toEqual([
      ["design", 1],
      ["engineering", 2],
    ]);
  });

  it("builds visible catalog sections in taxonomy order", () => {
    const visible = [
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
      catalogItem({
        id: "learn",
        name: "Learn",
        group_id: "research",
        group_label: "Research",
        group_order: 20,
        category_id: "research",
        category_slug: "research",
        category_label: "Research",
        category_order: 5,
      }),
    ];
    const groups = buildTaxonomyGroups(visible);

    expect(buildCatalogSections(visible, groups).map((section) => section.id)).toEqual([
      "design",
      "engineering",
      "research",
    ]);
  });

  it("describes grouped install payloads without duplicating package runs", () => {
    expect(
      describeInstallItemInput({
        package_ref: "vercel-labs/skills",
        skill_flags: ["find-skills", "learn"],
      }),
    ).toBe("vercel-labs/skills · 2 skills");

    expect(
      describeInstallItemInput({
        package_ref: "vercel-labs/skills",
        skill_flags: ["find-skills"],
      }),
    ).toBe("vercel-labs/skills --skill find-skills");
  });

  it("resolves package refs into openable repository urls", () => {
    expect(resolveRepoUrl("laurigates/claude-plugins")).toBe(
      "https://github.com/laurigates/claude-plugins",
    );
    expect(resolveRepoUrl("https://github.com/vercel-labs/skills.git")).toBe(
      "https://github.com/vercel-labs/skills",
    );
    expect(resolveRepoUrl("git@github.com:vercel-labs/skills.git")).toBe(
      "https://github.com/vercel-labs/skills",
    );
    expect(resolveRepoUrl("not a repo ref")).toBeNull();
  });

  it("paginates the filtered installed slice on the client", () => {
    expect(paginateItems([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
  });
});
