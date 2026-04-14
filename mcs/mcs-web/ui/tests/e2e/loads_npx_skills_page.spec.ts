import { expect, test } from "@playwright/test";

import { installMockEventSource, mockNpxSkillsApi } from "./helpers/npxSkillsHarness";

test("loads the npx skills page and summary", async ({ page }) => {
  await installMockEventSource(page, []);
  await mockNpxSkillsApi(page);

  await page.goto("/platform/claude/npx-skills");

  await expect(page.getByRole("heading", { name: /^registry$/i })).toBeVisible();
  await expect(page.getByText(/^Install from Repo$/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Discover$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Manage$/i })).toBeVisible();
  await page.getByRole("button", { name: /^Manage$/i }).click();
  await expect(page.getByRole("heading", { name: /^Maintenance$/i })).toBeVisible();
  await expect(page.getByText("Claude Code", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Installed: 2/i)).toBeVisible();
  await expect(page.getByLabel(/workspace anchor/i)).toBeVisible();
});
