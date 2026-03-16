import { expect, test } from "@playwright/test";

const platformsResponse = [
  {
    id: "claude",
    name: "Claude",
    icon: "C",
    base_dir: "/Users/demo/.claude",
    skills_path: "/Users/demo/.claude/skills",
  },
  {
    id: "codex",
    name: "Codex",
    icon: "X",
    base_dir: "/Users/demo/.codex",
    skills_path: "/Users/demo/.codex/skills",
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

  await expect(
    page.getByRole("heading", { name: /guide every skill install with one clear path/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /continue to targets/i })).toBeDisabled();

  await page.getByRole("button", { name: /frontend-design/i }).click();
  await expect(page.getByRole("button", { name: /continue to targets/i })).toBeEnabled();

  await page.getByRole("button", { name: /continue to targets/i }).click();
  await expect(page.getByRole("heading", { name: /choose targets/i }).last()).toBeVisible();

  await page.getByRole("button", { name: /claude/i }).click();
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
});
