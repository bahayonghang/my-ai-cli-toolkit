import { describe, expect, it } from "vitest";

import type { NpxSkillsCatalogItemDto } from "@/types";
import { buildTaxonomyGroups } from "@/pages/npx-skills/utils";
import { selectCatalogSections, type NpxSkillsState } from "./npxSkillsStore";

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

describe("npxSkillsStore selectors", () => {
  it("groups discover catalog items into visible sections without category filtering", () => {
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
    const state = {
      catalogItems: items,
      catalogGroups: buildTaxonomyGroups(items),
      catalogSearch: "",
      installedOnly: false,
      selectedCatalogCategoryId: "design",
    } as unknown as NpxSkillsState;

    expect(selectCatalogSections(state).map((section) => section.id)).toEqual([
      "design",
      "engineering",
    ]);
  });

  it("builds discover sections from visible catalog items when catalog groups are not ready yet", () => {
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
    const state = {
      catalogItems: items,
      catalogGroups: [],
      catalogSearch: "",
      installedOnly: false,
      selectedCatalogCategoryId: null,
    } as unknown as NpxSkillsState;

    expect(selectCatalogSections(state).map((section) => section.id)).toEqual([
      "design",
      "engineering",
    ]);
  });
});
