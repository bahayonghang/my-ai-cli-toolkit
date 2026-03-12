import { expect, test } from "@playwright/test";

import {
  installMockEventSource,
  maybeSubmitNpxSkillsRunDialog,
  mockNpxSkillsApi,
  seedNpxSkillsRunConfig,
  setNpxSkillsInstallTarget,
} from "./helpers/npxSkillsHarness";

test("managed items are removable and maintenance jobs run", async ({ page }) => {
  const installTarget = {
    scope: "project" as const,
    project_path: "/tmp/npx-skills-maintenance-project",
  };
  const runConfig = {
    agents: ["codex", "gemini"],
    cli_mode: "npx" as const,
  };

  await installMockEventSource(page, [
    {
      match: "remove-job",
      steps: [
        {
          event: "item_started",
          delayMs: 50,
          data: {
            job_id: "remove-job",
            operation: "remove",
            item_id: "0",
            label: "find-skills",
          },
        },
        {
          event: "item_finished",
          delayMs: 100,
          data: {
            job_id: "remove-job",
            operation: "remove",
            item_id: "0",
            label: "find-skills",
            success: true,
            output: "removed",
            error: null,
            duration_ms: 90,
          },
        },
        {
          event: "job_progress",
          delayMs: 120,
          data: {
            job_id: "remove-job",
            operation: "remove",
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
            job_id: "remove-job",
            operation: "remove",
            total: 1,
            success_count: 1,
            failure_count: 0,
            completed_at_ms: 1,
          },
        },
      ],
    },
    {
      match: "check-job",
      steps: [
        {
          event: "item_started",
          delayMs: 50,
          data: {
            job_id: "check-job",
            operation: "check",
            item_id: "0",
            label: "check",
          },
        },
        {
          event: "item_finished",
          delayMs: 100,
          data: {
            job_id: "check-job",
            operation: "check",
            item_id: "0",
            label: "check",
            success: true,
            output: "checked",
            error: null,
            duration_ms: 75,
          },
        },
        {
          event: "job_progress",
          delayMs: 120,
          data: {
            job_id: "check-job",
            operation: "check",
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
            job_id: "check-job",
            operation: "check",
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
  await page.getByRole("tab", { name: /installed/i }).click();

  const unmanagedRow = page.getByRole("row").filter({ hasText: "legacy-unmanaged" });
  await expect(unmanagedRow.getByRole("checkbox")).toBeDisabled();
  await expect(unmanagedRow.getByRole("button", { name: /uninstall/i })).toBeDisabled();

  const managedRow = page.getByRole("row").filter({ hasText: "find-skills" });
  await managedRow.getByRole("button", { name: /uninstall/i }).click();
  await page.getByRole("button", { name: /^uninstall$/i }).click();
  await maybeSubmitNpxSkillsRunDialog(page, {
    installTarget,
    submitButtons: [/^uninstall$/i, /^remove$/i, /^run$/i, /^confirm$/i],
  });
  await expect.poll(() => api.requests.removeJobs.length).toBe(1);
  await expect(page.getByText(/remove finished/i)).toBeVisible();
  expect(api.requests.removeJobs[0]).toEqual({
    names: ["find-skills"],
    config: runConfig,
    install_target: installTarget,
  });

  await page.getByRole("button", { name: /check for updates/i }).click();
  await maybeSubmitNpxSkillsRunDialog(page, {
    installTarget,
    submitButtons: [/^check for updates$/i, /^check$/i, /^run$/i, /^confirm$/i],
  });
  await expect.poll(() => api.requests.checkJobs.length).toBe(1);
  await expect(page.getByText(/check finished/i)).toBeVisible();
  expect(api.requests.checkJobs[0]).toEqual({
    config: runConfig,
    install_target: installTarget,
  });
});
