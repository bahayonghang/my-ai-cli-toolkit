import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  externalInstallSkill,
  getCategories,
  getSkills,
  installCommands,
  resolveInstallTarget,
  startExternalInstallJob,
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

  it("keeps external install compatible and forwards target when provided", async () => {
    fetchMock.mockResolvedValue(mockSuccess({ success: true, output: "ok" }));

    await externalInstallSkill("claude", "find-skills", "vercel", {
      scope: "project",
      project_path: "/tmp/project",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/platforms/claude/skills/external-install");
    const body = JSON.parse(String(init.body));
    expect(body.install_target).toEqual({
      scope: "project",
      project_path: "/tmp/project",
    });
  });

  it("starts external install batch job and forwards target when provided", async () => {
    fetchMock.mockResolvedValue(
      mockSuccess({ job_id: "external-1-1", total: 2, status: "running" })
    );

    await startExternalInstallJob(
      "claude",
      [
        { skill_name: "owner/repo-a", method: "vercel" },
        { skill_name: "owner/repo-b --skill b", method: "playbooks" },
      ],
      {
        scope: "project",
        project_path: "/tmp/project",
      }
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/platforms/claude/skills/external-install/jobs");
    const body = JSON.parse(String(init.body));
    expect(body.items).toEqual([
      { skill_name: "owner/repo-a", method: "vercel" },
      { skill_name: "owner/repo-b --skill b", method: "playbooks" },
    ]);
    expect(body.install_target).toEqual({
      scope: "project",
      project_path: "/tmp/project",
    });
  });
});
