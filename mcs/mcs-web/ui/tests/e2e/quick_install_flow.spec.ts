import { expect, test } from "@playwright/test";

import { installMockEventSource, mockNpxSkillsApi } from "./helpers/npxSkillsHarness";

test("quick install starts a job and renders progress", async ({ page }) => {
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
  await mockNpxSkillsApi(page);

  await page.goto("/platform/claude/npx-skills");
  await page.getByRole("button", { name: /quick install/i }).click();
  await page.getByLabel(/package/i).fill("vercel-labs/agent-skills");
  await page.getByRole("button", { name: /^install$/i }).click();

  await expect(page.getByRole("tab", { name: /maintenance/i })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(page.getByText(/install finished/i)).toBeVisible();
  await expect(page.getByText("vercel-labs/agent-skills")).toBeVisible();
});
