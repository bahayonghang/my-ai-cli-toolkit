import { expect, test } from "@playwright/test";

import { installMockEventSource, mockNpxSkillsApi } from "./helpers/npxSkillsHarness";

test("loads the npx skills page and summary", async ({ page }) => {
  await installMockEventSource(page, []);
  await mockNpxSkillsApi(page);

  await page.goto("/platform/claude/npx-skills");

  await expect(
    page.getByRole("heading", { name: /manage registry skills for claude code/i }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: /find/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /installed/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /maintenance/i })).toBeVisible();
  await expect(page.getByText("Claude Code", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Installed: 2/i)).toBeVisible();
  await expect(page.getByText(/Scoped to current target/i)).toBeVisible();
});
