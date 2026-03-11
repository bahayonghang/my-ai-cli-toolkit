import { expect, test } from "@playwright/test";

import { installMockEventSource, mockNpxSkillsApi } from "./helpers/npxSkillsHarness";

test("managed items are removable and maintenance jobs run", async ({ page }) => {
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
  await mockNpxSkillsApi(page);

  await page.goto("/platform/claude/npx-skills");
  await page.getByRole("tab", { name: /installed/i }).click();

  const unmanagedRow = page.getByRole("row").filter({ hasText: "legacy-unmanaged" });
  await expect(unmanagedRow.getByRole("checkbox")).toBeDisabled();
  await expect(unmanagedRow.getByRole("button", { name: /uninstall/i })).toBeDisabled();

  const managedRow = page.getByRole("row").filter({ hasText: "find-skills" });
  await managedRow.getByRole("button", { name: /uninstall/i }).click();
  await page.getByRole("button", { name: /^uninstall$/i }).click();
  await expect(page.getByText(/remove finished/i)).toBeVisible();

  await page.getByRole("button", { name: /check for updates/i }).click();
  await expect(page.getByText(/check finished/i)).toBeVisible();
});
