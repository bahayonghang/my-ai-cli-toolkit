import { expect, test } from "@playwright/test";

import {
  installMockEventSource,
  maybeSubmitNpxSkillsRunDialog,
  mockNpxSkillsApi,
  seedNpxSkillsRunConfig,
  setNpxSkillsInstallTarget,
} from "./helpers/npxSkillsHarness";

test("quick install starts a job and renders progress", async ({ page }) => {
  const installTarget = {
    scope: "project" as const,
    project_path: "/tmp/npx-skills-install-project",
  };
  const runConfig = {
    agents: ["codex", "gemini"],
    cli_mode: "npx" as const,
  };

  await installMockEventSource(page, [
    {
      match: "install-job",
      steps: [
        {
          event: "item_started",
          delayMs: 50,
          data: {
            job_id: "install-job",
            operation: "install",
            item_id: "0",
            label: "vercel-labs/agent-skills",
          },
        },
        {
          event: "item_finished",
          delayMs: 100,
          data: {
            job_id: "install-job",
            operation: "install",
            item_id: "0",
            label: "vercel-labs/agent-skills",
            success: true,
            output: "installed",
            error: null,
            duration_ms: 120,
          },
        },
        {
          event: "job_progress",
          delayMs: 120,
          data: {
            job_id: "install-job",
            operation: "install",
            completed: 1,
            total: 1,
            success_count: 1,
            failure_count: 0,
            percent: 100,
          },
        },
        {
          event: "job_completed",
          delayMs: 140,
          data: {
            job_id: "install-job",
            operation: "install",
            total: 1,
            success_count: 1,
            failure_count: 0,
            completed_at_ms: 1,
          },
        },
      ],
    },
  ]);
  const api = await mockNpxSkillsApi(page);
  await seedNpxSkillsRunConfig(page, runConfig);

  await page.goto("/platform/claude/npx-skills");
  await setNpxSkillsInstallTarget(page, installTarget);
  await page.getByRole("button", { name: /quick install/i }).click();
  const dialog = page.locator('[role="dialog"]:visible').last();
  await dialog.getByLabel(/package/i).fill("vercel-labs/agent-skills");
  await dialog.getByLabel(/skill flags/i).fill("find-skills\nreview");
  await maybeSubmitNpxSkillsRunDialog(page, {
    installTarget,
    submitButtons: [/^start quick install$/i, /^start install$/i, /^install$/i, /^run$/i, /^confirm$/i],
  });

  await expect(page.getByRole("tab", { name: /maintenance/i })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect.poll(() => api.requests.installJobs.length).toBe(1);
  await expect(page.getByText("vercel-labs/agent-skills")).toBeVisible();
  expect(api.requests.installJobs[0]).toEqual({
    items: [
      {
        package_ref: "vercel-labs/agent-skills",
        skill_flags: ["find-skills", "review"],
      },
    ],
    config: runConfig,
    install_target: installTarget,
  });
});
