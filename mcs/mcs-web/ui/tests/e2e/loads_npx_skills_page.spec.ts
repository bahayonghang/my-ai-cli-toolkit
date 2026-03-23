import { expect, test } from "@playwright/test";

import { installMockEventSource, mockNpxSkillsApi } from "./helpers/npxSkillsHarness";

test("loads the npx skills page and summary", async ({ page }) => {
  await installMockEventSource(page, []);
  await mockNpxSkillsApi(page);

  await page.goto("/platform/claude/npx-skills");

  await expect(
    page.getByRole("heading", { level: 3, name: /registry workspace/i }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: /find/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /installed/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /maintenance/i })).toBeVisible();
  await expect(page.getByText("Claude Code", { exact: true }).first()).toBeVisible();
  await expect(page.locator("div").filter({ hasText: /^Installed2$/ }).first()).toBeVisible();
  await expect(page.locator("div").filter({ hasText: /^Curated1$/ }).first()).toBeVisible();
});
