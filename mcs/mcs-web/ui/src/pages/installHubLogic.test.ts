import { describe, expect, it, vi, beforeEach } from "vitest";
import type { PlatformInstallResult } from "@/components/install-hub/types";
import type { TranslateFn } from "@/i18n";
import type { PlatformDisplay } from "@/types";
import {
  collectSkillCategories,
  filterSkillCatalog,
  summarizeInstallResults,
} from "./installHubLogic";
import { installAcrossPlatforms } from "./useUnifiedInstallHub";

const { installSkillsMock } = vi.hoisted(() => ({
  installSkillsMock: vi.fn(),
}));

vi.mock("@/api/client", () => ({
  getSkillCatalog: vi.fn(),
  installSkills: installSkillsMock,
}));

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

const SHARED_PATH_PLATFORMS: PlatformDisplay[] = [
  {
    id: "claude",
    name: "Claude",
    icon: "🤖",
    base_dir: "~/.claude",
    skills_path: "~/.shared/skills",
  },
  {
    id: "codex",
    name: "Codex",
    icon: "📦",
    base_dir: "~/.codex",
    skills_path: "~/.shared/skills",
  },
];

const translate: TranslateFn = (key, vars) => {
  if (key === "installHub.failedToInstallItem") {
    return `failed:${String(vars?.name ?? "")}`;
  }
  return String(key);
};

beforeEach(() => {
  installSkillsMock.mockReset();
});

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
        platform: {
          id: "claude",
          name: "Claude",
          icon: "🤖",
          base_dir: "~/.claude",
          skills_path: "~/.claude/skills",
        },
        successCount: 2,
        failureCount: 0,
        results: [],
        requestError: null,
      },
      {
        platform: {
          id: "codex",
          name: "Codex",
          icon: "📦",
          base_dir: "~/.codex",
          skills_path: "~/.agents/skills",
        },
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

describe("installAcrossPlatforms", () => {
  it("installs each selected platform even when skills_path is shared", async () => {
    installSkillsMock
      .mockResolvedValueOnce({
        success_count: 1,
        failure_count: 0,
        results: [
          { success: true, item_name: "alpha", message: "installed for claude", error: null },
        ],
      })
      .mockResolvedValueOnce({
        success_count: 0,
        failure_count: 1,
        results: [
          { success: false, item_name: "alpha", message: "install failed", error: "disk full" },
        ],
      });

    const setExecution = vi.fn();
    const setResults = vi.fn();

    const results = await installAcrossPlatforms(
      { platforms: SHARED_PATH_PLATFORMS, skills: ["alpha"] },
      setExecution,
      setResults,
      translate
    );

    expect(installSkillsMock).toHaveBeenCalledTimes(2);
    expect(installSkillsMock).toHaveBeenNthCalledWith(1, "claude", ["alpha"]);
    expect(installSkillsMock).toHaveBeenNthCalledWith(2, "codex", ["alpha"]);
    expect(setExecution).toHaveBeenNthCalledWith(1, {
      running: true,
      currentStep: 0,
      totalSteps: 2,
    });
    expect(setExecution).toHaveBeenNthCalledWith(2, {
      running: true,
      currentStep: 1,
      totalSteps: 2,
    });
    expect(setExecution).toHaveBeenNthCalledWith(3, {
      running: true,
      currentStep: 2,
      totalSteps: 2,
    });
    expect(results).toEqual([
      {
        platform: SHARED_PATH_PLATFORMS[0],
        successCount: 1,
        failureCount: 0,
        results: [
          { success: true, item_name: "alpha", message: "installed for claude", error: null },
        ],
        requestError: null,
      },
      {
        platform: SHARED_PATH_PLATFORMS[1],
        successCount: 0,
        failureCount: 1,
        results: [
          { success: false, item_name: "alpha", message: "install failed", error: "disk full" },
        ],
        requestError: null,
      },
    ]);
    expect(setResults).toHaveBeenLastCalledWith(results);
    expect(results[1].results[0].message).not.toContain("Reused shared-path");
  });

  it("reports request errors for the actual failing platform", async () => {
    installSkillsMock
      .mockResolvedValueOnce({
        success_count: 1,
        failure_count: 0,
        results: [
          { success: true, item_name: "alpha", message: "installed for claude", error: null },
        ],
      })
      .mockRejectedValueOnce(new Error("permission denied"));

    const results = await installAcrossPlatforms(
      { platforms: SHARED_PATH_PLATFORMS, skills: ["alpha"] },
      vi.fn(),
      vi.fn(),
      translate
    );

    expect(results[0]).toMatchObject({
      platform: SHARED_PATH_PLATFORMS[0],
      successCount: 1,
      failureCount: 0,
      requestError: null,
    });
    expect(results[1]).toEqual({
      platform: SHARED_PATH_PLATFORMS[1],
      successCount: 0,
      failureCount: 1,
      results: [
        {
          success: false,
          item_name: "alpha",
          message: "failed:alpha",
          error: "permission denied",
        },
      ],
      requestError: "permission denied",
    });
  });
});
