import { describe, expect, it } from "vitest";
import type { PlatformInstallResult } from "@/components/install-hub/types";
import {
  collectSkillCategories,
  filterSkillCatalog,
  summarizeInstallResults,
} from "./installHubLogic";

const SKILLS = [
  {
    name: "alpha",
    description: "Alpha skill",
    category: "core",
    tags: ["tag-1"],
    is_default: true,
  },
  {
    name: "beta",
    description: "Beta utility",
    category: null,
    tags: ["tag-2"],
    is_default: false,
  },
];

describe("collectSkillCategories", () => {
  it("collects and sorts categories with fallback", () => {
    const categories = collectSkillCategories(SKILLS);
    expect(categories).toEqual(["core", "uncategorized"]);
  });
});

describe("filterSkillCatalog", () => {
  it("filters by search and default flag", () => {
    const filtered = filterSkillCatalog(SKILLS, "alpha", null, true);
    expect(filtered.map((s) => s.name)).toEqual(["alpha"]);
  });

  it("filters by category with uncategorized fallback", () => {
    const filtered = filterSkillCatalog(SKILLS, "", "uncategorized", false);
    expect(filtered.map((s) => s.name)).toEqual(["beta"]);
  });
});

describe("summarizeInstallResults", () => {
  it("sums success/failure and captures failed platforms", () => {
    const input: PlatformInstallResult[] = [
      {
        platform: { id: "claude", name: "Claude", icon: "🤖", base_dir: "~/.claude" },
        successCount: 2,
        failureCount: 0,
        results: [],
        requestError: null,
      },
      {
        platform: { id: "codex", name: "Codex", icon: "📦", base_dir: "~/.codex" },
        successCount: 1,
        failureCount: 1,
        results: [],
        requestError: null,
      },
    ];

    expect(summarizeInstallResults(input)).toEqual({
      totalSuccess: 3,
      totalFailure: 1,
      failedPlatforms: ["codex"],
    });
  });
});
