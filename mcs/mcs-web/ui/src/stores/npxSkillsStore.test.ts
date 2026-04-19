import { describe, expect, it } from "vitest";

import type { NpxSkillsCatalogItemDto } from "@/types";
import { buildTaxonomyGroups } from "@/pages/npx-skills/utils";
import {
  selectCatalogSections,
  useNpxSkillsStore,
  type NpxSkillsState,
} from "./npxSkillsStore";

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

describe("npxSkillsStore referential stability", () => {
  it("keeps catalogSections reference when unrelated state updates occur", () => {
    const items: NpxSkillsCatalogItemDto[] = [
      {
        id: "find-skills",
        name: "Find Skills",
        package_ref: "vercel-labs/skills",
        skill_flag: "find-skills",
        group_id: "engineering",
        group_label: "Engineering",
        group_order: 10,
        category_id: "engineering",
        category_slug: "engineering",
        category_label: "Engineering",
        category_order: 10,
        tags: [],
        install_kind: "skills_cli",
        install_provider: "vercel",
        description: null,
        stars: 0,
        project_only: false,
        usage: null,
        installed_state: "not_installed",
        installed_instance_id: null,
      },
    ];
    const store = useNpxSkillsStore;
    store.setState({
      catalogItems: items,
      catalogGroups: buildTaxonomyGroups(items),
      catalogSections: selectCatalogSections({
        catalogItems: items,
        catalogGroups: buildTaxonomyGroups(items),
        catalogSearch: "",
        installedOnly: false,
      } as NpxSkillsState),
    });

    const initial = store.getState().catalogSections;
    expect(initial).not.toHaveLength(0);

    // Unrelated updates must not rebuild catalogSections
    store.getState().setSelectedCatalogKeys(new Set(["vercel-labs/skills::find-skills"]));
    store.getState().setSettingsOpen(true);
    store.getState().setSettingsOpen(false);

    expect(store.getState().catalogSections).toBe(initial);
  });

  it("setActiveCatalogAnchorId short-circuits when value is unchanged", () => {
    const store = useNpxSkillsStore;
    store.setState({ activeCatalogAnchorId: "section-a" });
    const snapshot = store.getState();

    store.getState().setActiveCatalogAnchorId("section-a");
    expect(store.getState()).toBe(snapshot);

    store.getState().setActiveCatalogAnchorId("section-b");
    expect(store.getState().activeCatalogAnchorId).toBe("section-b");
  });

  it("recomputes catalogSections when catalogSearch changes", () => {
    const items: NpxSkillsCatalogItemDto[] = [
      {
        id: "find-skills",
        name: "Find Skills",
        package_ref: "vercel-labs/skills",
        skill_flag: "find-skills",
        group_id: "engineering",
        group_label: "Engineering",
        group_order: 10,
        category_id: "engineering",
        category_slug: "engineering",
        category_label: "Engineering",
        category_order: 10,
        tags: ["search"],
        install_kind: "skills_cli",
        install_provider: "vercel",
        description: null,
        stars: 0,
        project_only: false,
        usage: null,
        installed_state: "not_installed",
        installed_instance_id: null,
      },
    ];
    const store = useNpxSkillsStore;
    store.setState({
      catalogItems: items,
      catalogGroups: buildTaxonomyGroups(items),
      catalogSearch: "",
      installedOnly: false,
    });

    store.getState().setCatalogSearch("find");
    expect(store.getState().catalogSections).toHaveLength(1);

    store.getState().setCatalogSearch("no-such-skill");
    expect(store.getState().catalogSections).toHaveLength(0);
  });
});
