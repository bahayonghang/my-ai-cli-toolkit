import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCategories,
  getNpxInstalledSkills,
  previewNpxSkillsPackage,
  getNpxSkillsCatalog,
  getSkills,
  installCommands,
  resolveInstallTarget,
  startNpxSkillsCheckJob,
  startNpxSkillsInstallJob,
  startNpxSkillsRemoveJob,
  startNpxSkillsUpdateJob,
} from "./client";

type MockResponseData = {
  ok: boolean;
  status?: number;
  statusText?: string;
  json: () => Promise<unknown>;
};

function mockSuccess(data: unknown): MockResponseData {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ data }),
  };
}

describe("api/client install target", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds install target query params for getSkills", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess([
        {
          name: "demo",
          item_type: "skill",
          description: null,
          status: "not_installed",
          category: null,
          tags: [],
          is_default: false,
        },
      ])
    );

    await getSkills("claude", {
      search: "demo",
      category: "ai",
      status: "installed",
      installTarget: { scope: "project", project_path: "/tmp/project" },
    });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/platforms/claude/skills?");
    expect(String(url)).toContain("search=demo");
    expect(String(url)).toContain("category=ai");
    expect(String(url)).toContain("status=installed");
    expect(String(url)).toContain("target_scope=project");
    expect(String(url)).toContain("project_path=%2Ftmp%2Fproject");
  });

  it("adds install target query params for getCategories", async () => {
    fetchMock.mockResolvedValue(mockSuccess([]));

    await getCategories("claude", { scope: "global" }, "skill");

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/platforms/claude/categories?target_scope=global");
    expect(String(url)).toContain("item_type=skill");
  });

  it("sends install_target in install body", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({ results: [], success_count: 0, failure_count: 0 })
    );

    await installCommands("claude", ["cmd-a"], {
      scope: "project",
      project_path: "/tmp/project",
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      names: ["cmd-a"],
      install_target: { scope: "project", project_path: "/tmp/project" },
    });
  });

  it("posts install target to resolve endpoint", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({
        scope: "global",
        project_path: null,
        base_dir: "/Users/demo/.claude",
        skills_path: "/Users/demo/.claude/skills",
        commands_path: "/Users/demo/.claude/commands",
      })
    );

    await resolveInstallTarget("claude", { scope: "global" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/platforms/claude/install-target/resolve");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ scope: "global" });
  });

  it("queries npx skills catalog with install target", async () => {
    fetchMock.mockResolvedValue(mockSuccess([]));

    await getNpxSkillsCatalog("claude", {
      search: "find",
      installedOnly: true,
      installTarget: { scope: "project", project_path: "/tmp/project" },
    });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/platforms/claude/npx-skills/catalog?");
    expect(String(url)).toContain("search=find");
    expect(String(url)).toContain("installed_only=true");
    expect(String(url)).toContain("target_scope=project");
  });

  it("queries npx installed skills with install target", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({
        target: {
          scope: "global",
          project_path: null,
          base_dir: "/tmp/claude",
          skills_path: "/tmp/claude/skills",
          commands_path: null,
          agents_path: null,
          guidance_path: null,
        },
        capabilities: {
          list: { supported: true, reason: null },
          remove: { supported: true, reason: null },
          check: { supported: true, reason: null },
          update: { supported: true, reason: null },
        },
        summary: {
          total: 0,
          curated: 0,
          manual: 0,
          tracked: 0,
          update_available: 0,
        },
        groups: [],
        filtered_total: 0,
        page: 1,
        page_size: 50,
        total_pages: 1,
        items: [],
      })
    );

    await getNpxInstalledSkills("claude", {
      search: "find",
      sourceFilter: "manual",
      trackingFilter: "tracked",
      updateFilter: "unsupported",
      page: 2,
      pageSize: 20,
      installTarget: { scope: "global" },
    });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/platforms/claude/npx-skills/installed?");
    expect(String(url)).toContain("search=find");
    expect(String(url)).toContain("source_filter=manual");
    expect(String(url)).toContain("tracking_filter=tracked");
    expect(String(url)).toContain("update_filter=unsupported");
    expect(String(url)).toContain("page=2");
    expect(String(url)).toContain("page_size=20");
    expect(String(url)).toContain("target_scope=global");
  });

  it("normalizes partial npx installed inventory payloads", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({
        target: {
          scope: "global",
          project_path: null,
          base_dir: "/tmp/claude",
          skills_path: "/tmp/claude/skills",
          commands_path: null,
          agents_path: null,
          guidance_path: null,
        },
        capabilities: {
          list: { supported: true, reason: null },
          remove: { supported: true, reason: null },
          check: { supported: true, reason: null },
          update: { supported: true, reason: null },
        },
        summary: {
          total: 1,
          curated: 1,
          manual: 0,
          tracked: 1,
          update_available: 0,
        },
        items: [
          {
            id: "find-skills",
            name: "find-skills",
            scope: "global",
            agents: ["codex"],
            group_id: "engineering",
            group_label: "Engineering",
            group_order: 10,
            category_id: "engineering",
            category_slug: "engineering",
            category_label: "Engineering",
            category_order: 10,
            tags: [],
            description: "Find skills quickly",
            source: {
              kind: "curated",
              ref: "vercel-labs/agent-skills",
              display: "vercel-labs/agent-skills",
            },
            catalog_match: null,
            tracking: {
              kind: "tracked",
              source_type: "well-known",
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
          },
        ],
      })
    );

    const inventory = await getNpxInstalledSkills("claude");

    expect(inventory.groups).toEqual([]);
    expect(inventory.filtered_total).toBe(1);
    expect(inventory.page).toBe(1);
    expect(inventory.page_size).toBe(1);
    expect(inventory.total_pages).toBe(1);
  });

  it("starts npx install job and forwards config and target", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({ job_id: "npx-skills-1", operation: "install", total: 1, status: "running" })
    );

    await startNpxSkillsInstallJob(
      "claude",
      [{ package_ref: "vercel-labs/agent-skills", skill_flags: ["find-skills"] }],
      { scope: "project", project_path: "/tmp/project" },
      { agents: ["codex"], cli_mode: "npx" }
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/platforms/claude/npx-skills/install/jobs");
    const body = JSON.parse(String(init.body));
    expect(body.items).toEqual([
      { package_ref: "vercel-labs/agent-skills", skill_flags: ["find-skills"] },
    ]);
    expect(body.config).toEqual({ agents: ["codex"], cli_mode: "npx" });
    expect(body.install_target).toEqual({
      scope: "project",
      project_path: "/tmp/project",
    });
  });

  it("starts npx maintenance jobs", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({ job_id: "npx-skills-2", operation: "check", total: 1, status: "running" })
    );

    await startNpxSkillsCheckJob("claude", { scope: "global" });
    await startNpxSkillsUpdateJob("claude", { scope: "global" });
    await startNpxSkillsRemoveJob("claude", ["find-skills"], { scope: "global" });

    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/platforms/claude/npx-skills/check/jobs");
    expect(String(fetchMock.mock.calls[1][0])).toBe("/api/platforms/claude/npx-skills/update/jobs");
    expect(String(fetchMock.mock.calls[2][0])).toBe("/api/platforms/claude/npx-skills/remove/jobs");
    const removeBody = JSON.parse(String(fetchMock.mock.calls[2][1]?.body));
    expect(removeBody.item_ids).toEqual(["find-skills"]);
  });

  it("previews package skills with install target and config", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({
        package_ref: "vercel-labs/skills",
        source_ref: "https://github.com/vercel-labs/skills.git",
        mode: "listed_skills",
        skills: [{ name: "find-skills", description: "Find skills quickly" }],
        fallback_reason: null,
      }),
    );

    await previewNpxSkillsPackage("claude", {
      packageRef: "vercel-labs/skills",
      installTarget: { scope: "project", project_path: "/tmp/project" },
      config: { agents: ["codex"], cli_mode: "auto" },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/platforms/claude/npx-skills/packages/preview");
    expect(JSON.parse(String(init.body))).toEqual({
      package_ref: "vercel-labs/skills",
      config: { agents: ["codex"], cli_mode: "auto" },
      install_target: { scope: "project", project_path: "/tmp/project" },
    });
  });
});
