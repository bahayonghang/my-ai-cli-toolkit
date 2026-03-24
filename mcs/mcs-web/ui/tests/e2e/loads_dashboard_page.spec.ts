import { expect, test, type Page } from "@playwright/test";

function trackCssImportErrors(page: Page) {
  const messages: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      messages.push(message.text());
    }
  });
  return messages;
}

async function expectSingleMain(page: Page) {
  await expect(page.locator("main")).toHaveCount(1);
}

const dashboardResponse = {
  summary: {
    activePlatforms: 3,
    totalPlatforms: 4,
    installedSkills: 18,
    totalSkills: 40,
    installedCommands: 12,
    totalCommands: 20,
    outdatedSkills: 5,
    skillCoverage: 45,
    commandCoverage: 60,
  },
  skillSpotlight: {
    topSkills: [
      { name: "frontend-design", installedOn: 3, outdatedOn: 1, category: "frontend" },
      { name: "research", installedOn: 2, outdatedOn: 0, category: "workflow" },
    ],
    topCategories: [
      { name: "workflow", installed: 8, total: 12 },
      { name: "frontend", installed: 5, total: 8 },
    ],
    updateQueue: [
      {
        platformId: "claude",
        platformName: "Claude",
        platformIcon: "C",
        outdatedSkills: 3,
        installedSkills: 8,
        totalSkills: 12,
      },
    ],
  },
  platforms: [
    {
      id: "claude",
      name: "Claude",
      icon: "C",
      total_skills: 12,
      installed_skills: 8,
      outdated_skills: 3,
      total_commands: 8,
      installed_commands: 5,
    },
    {
      id: "gemini",
      name: "Gemini",
      icon: "G",
      total_skills: 12,
      installed_skills: 4,
      outdated_skills: 2,
      total_commands: 6,
      installed_commands: 3,
    },
    {
      id: "codex",
      name: "Codex",
      icon: "X",
      total_skills: 8,
      installed_skills: 3,
      outdated_skills: 0,
      total_commands: 4,
      installed_commands: 3,
    },
  ],
};

const platformsResponse = [
  {
    id: "claude",
    name: "Claude",
    icon: "C",
    base_dir: "/Users/demo/.claude",
    skills_path: "/Users/demo/.claude/skills",
  },
];

const resolvedTargetResponse = {
  scope: "global",
  project_path: null,
  base_dir: "/Users/demo/.claude",
  skills_path: "/Users/demo/.claude/skills",
  commands_path: "/Users/demo/.claude/commands",
};

async function mockDashboardApis(page: Page) {
  await page.route("**/api/dashboard", (route) =>
    route.fulfill({ json: { data: dashboardResponse } })
  );
  await page.route("**/api/system/legacy-dirs", (route) =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route("**/api/platforms", (route) =>
    route.fulfill({ json: { data: platformsResponse } })
  );
  await page.route("**/api/skills/catalog", (route) =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route("**/api/platforms/claude/install-target/resolve", (route) =>
    route.fulfill({ json: { data: resolvedTargetResponse } })
  );
  await page.route("**/api/platforms/claude/skills**", (route) =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route("**/api/platforms/claude/categories**", (route) =>
    route.fulfill({ json: { data: [] } })
  );
}

test("loads the dashboard and keeps main navigation flows working", async ({ page }) => {
  await mockDashboardApis(page);
  const consoleErrors = trackCssImportErrors(page);
  await page.addInitScript(() => {
    window.localStorage.setItem("mcs-locale", "en");
    window.localStorage.setItem("mcs-color-mode", "light");
  });

  await page.goto("/dashboard");
  await expectSingleMain(page);

  await expect(
    page.getByRole("heading", {
      name: /Operations Dashboard/i,
    })
  ).toBeVisible();
  await expect(page.getByText(/updates are waiting for review/i)).toBeVisible();
  await expect(page.getByText("frontend-design")).toBeVisible();
  await expect(page.getByText("Platform Matrix")).toBeVisible();

  await page.getByRole("button", { name: /Unified Install Hub/i }).click();
  await expect(page).toHaveURL(/\/install-hub$/);
  await expectSingleMain(page);
  await expect(page.getByRole("heading", { name: /Unified Skill Install Hub/i })).toBeVisible();

  await page.goto("/dashboard");
  await page.locator(".MuiCardActionArea-root").first().click();
  await expect(page).toHaveURL(/\/platform\/claude$/);
  await expectSingleMain(page);
  await expect(page.getByRole("button", { name: /Install Skills/i }).first()).toBeVisible();
  expect(
    consoleErrors.filter((message) => message.includes("@import rules can't be after other rules"))
  ).toEqual([]);
});
