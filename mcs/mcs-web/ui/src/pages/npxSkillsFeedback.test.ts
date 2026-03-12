import { describe, expect, it } from "vitest";
import type { TranslateFn } from "@/i18n";
import { buildNpxJobNotification, buildNpxRunConfigSummary } from "./npxSkillsFeedback";

const t: TranslateFn = (key, vars) => {
  const suffix =
    vars && Object.keys(vars).length > 0 ? JSON.stringify(vars) : "";
  return `${key}${suffix}`;
};

describe("buildNpxJobNotification", () => {
  it("returns warning partial install summary", () => {
    expect(buildNpxJobNotification("install", 2, 1, t)).toEqual({
      message: 'npxSkills.toastInstallPartial{"success":2,"failed":1}',
      severity: "warning",
    });
  });

  it("returns error for failed remove run", () => {
    expect(buildNpxJobNotification("remove", 0, 2, t)).toEqual({
      message: "npxSkills.toastRemoveFailed",
      severity: "error",
    });
  });

  it("returns success for check with no failures", () => {
    expect(buildNpxJobNotification("check", 1, 0, t)).toEqual({
      message: "npxSkills.toastCheckSuccess",
      severity: "success",
    });
  });

  it("returns error for failed check run", () => {
    expect(buildNpxJobNotification("check", 0, 1, t)).toEqual({
      message: "npxSkills.toastCheckFailed",
      severity: "error",
    });
  });
});

describe("buildNpxRunConfigSummary", () => {
  it("summarizes project scoped config", () => {
    expect(
      buildNpxRunConfigSummary(
        {
          agents: ["codex", "claude-code"],
          cliMode: "npx",
          installTarget: { scope: "project", project_path: "/tmp/demo" },
        },
        t
      )
    ).toEqual({
      agentsLabel: 'npxSkills.runConfigAgentsSummary{"count":2}',
      cliModeLabel: "npxSkills.runConfigCliSummaryNpx",
      installTargetLabel: "npxSkills.runConfigTargetSummaryProject",
      installTargetPath: "/tmp/demo",
    });
  });
});
