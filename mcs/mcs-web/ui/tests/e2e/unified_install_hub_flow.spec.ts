import { expect, test } from "@playwright/test";

function trackCssImportErrors(page: import("@playwright/test").Page) {
  const messages: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      messages.push(message.text());
    }
  });
  return messages;
}

const platformsResponse = [
  {
    id: "claude",
    name: "Claude",
    icon: "C",
    base_dir: "/Users/demo/.claude",
    skills_path: "/Users/demo/.claude/skills",
    skills_library_kind: "dedicated",
    skills_library_platform_ids: ["claude"],
  },
  {
    id: "codex",
    name: "Codex",
    icon: "X",
    base_dir: "/Users/demo/.codex",
    skills_path: "/Users/demo/.agents/skills",
    skills_library_kind: "shared",
    skills_library_platform_ids: ["codex", "gemini"],
  },
];

const catalogResponse = [
  {
    name: "frontend-design",
    description: "Design distinctive interfaces",
    category: "frontend",
    tags: ["ui"],
    is_default: true,
    platform_status: {
      claude: "not_installed",
      codex: "not_installed",
    },
  },
  {
    name: "research",
    description: "Grounded research workflows",
    category: "workflow",
    tags: ["research"],
    is_default: false,
    platform_status: {
      claude: "installed",
      codex: "not_installed",
    },
  },
];

test("unified install hub walks through the staged install flow", async ({ page }) => {
  const installRequests: Array<{ platformId: string; names: string[] }> = [];
  const consoleErrors = trackCssImportErrors(page);

  await page.route("**/api/platforms", (route) =>
    route.fulfill({ json: { data: platformsResponse } }),
  );
  await page.route("**/api/skills/catalog", (route) =>
    route.fulfill({ json: { data: catalogResponse } }),
  );
  await page.route("**/api/refresh", (route) =>
    route.fulfill({ json: { data: { success: true } } }),
  );
  await page.route("**/api/platforms/*/skills/install", async (route) => {
    const url = new URL(route.request().url());
    const platformId = url.pathname.split("/")[3];
    const body = route.request().postDataJSON() as { names: string[] };
    installRequests.push({ platformId, names: body.names });

    await route.fulfill({
      json: {
        data: {
          success_count: body.names.length,
          failure_count: 0,
          results: body.names.map((name) => ({
            success: true,
            item_name: name,
            message: `installed on ${platformId}`,
            error: null,
          })),
        },
      },
    });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem("mcs-locale", "en");
    window.localStorage.setItem("mcs-color-mode", "light");
  });
  await page.setViewportSize({ width: 1600, height: 1100 });

  await page.goto("/install-hub");
  await expect(page.locator("main")).toHaveCount(1);

  await expect(page.getByRole("heading", { name: /Local Skill Install Hub/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Choose Skills/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /continue to targets/i })).toBeDisabled();

  await page.getByRole("checkbox", { name: /frontend-design/i }).click();
  await expect(page.getByRole("button", { name: /continue to targets/i })).toBeEnabled();

  await page.getByRole("button", { name: /continue to targets/i }).click();
  await expect(page.getByRole("heading", { name: /choose targets/i }).last()).toBeVisible();

  await page
    .locator('[aria-labelledby="install-hub-platform-claude-title"]')
    .click();
  await expect(page.getByRole("button", { name: /continue to review/i })).toBeEnabled();

  await page.getByRole("button", { name: /continue to review/i }).click();
  await expect(page.getByText(/this run will execute 1 install actions/i)).toBeVisible();

  await page.getByRole("button", { name: /^start install$/i }).first().click();

  await expect(page.getByText(/run finished/i)).toBeVisible();
  await expect(page.getByText(/all clear/i)).toBeVisible();

  expect(installRequests).toEqual([
    {
      platformId: "claude",
      names: ["frontend-design"],
    },
  ]);
  expect(
    consoleErrors.filter((message) => message.includes("@import rules can't be after other rules"))
  ).toEqual([]);
});

test("unified install hub keeps the mobile summary in flow without covering the first step", async ({
  page,
}) => {
  const consoleErrors = trackCssImportErrors(page);
  await page.route("**/api/platforms", (route) =>
    route.fulfill({ json: { data: platformsResponse } }),
  );
  await page.route("**/api/skills/catalog", (route) =>
    route.fulfill({ json: { data: catalogResponse } }),
  );
  await page.addInitScript(() => {
    window.localStorage.setItem("mcs-locale", "en");
    window.localStorage.setItem("mcs-color-mode", "light");
  });
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/install-hub");
  await expect(page.locator("main")).toHaveCount(1);

  const stageHeading = page.getByRole("heading", { name: /Choose Skills/i }).first();
  const primaryAction = page.getByRole("button", { name: /select all filtered/i });
  const summaryText = page.getByText(/will run 0 install actions/i).last();
  await expect(stageHeading).toBeVisible();
  await expect(primaryAction).toBeVisible();
  await expect(summaryText).not.toBeInViewport();

  const categoryJumpHeights = await page.locator("button").evaluateAll((elements) =>
    elements
      .filter((element) => /frontend|workflow/i.test(element.textContent ?? ""))
      .map((element) => Math.round(element.getBoundingClientRect().height))
  );
  expect(categoryJumpHeights.length).toBeGreaterThan(0);
  expect(Math.min(...categoryJumpHeights)).toBeGreaterThanOrEqual(44);
  expect(
    consoleErrors.filter((message) => message.includes("@import rules can't be after other rules"))
  ).toEqual([]);
});
