import type { Page, Route } from "@playwright/test";

type EventPlan = {
  match: string;
  steps: Array<{ event: string; data: unknown; delayMs?: number }>;
};

type ManagedSkill = {
  name: string;
  repo: string | null;
  description: string | null;
  category: string | null;
  source: "managed" | "filesystem_unmanaged";
  manageable: boolean;
  package_ref: string | null;
  skill_flags: string[] | null;
};

function jsonResponse(route: Route, data: unknown) {
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

export async function installMockEventSource(page: Page, plans: EventPlan[]) {
  await page.addInitScript((eventPlans: EventPlan[]) => {
    class MockEventSource {
      url: string;
      onerror: ((event: Event) => void) | null;
      private listeners: Map<string, Set<(event: MessageEvent<string>) => void>>;
      private closed: boolean;

      constructor(url: string) {
        this.url = url;
        this.onerror = null;
        this.listeners = new Map();
        this.closed = false;
        const plan = eventPlans.find((item) => url.includes(item.match));
        if (!plan) {
          return;
        }

        let elapsed = 0;
        for (const step of plan.steps) {
          elapsed += step.delayMs ?? 0;
          window.setTimeout(() => {
            if (this.closed) {
              return;
            }
            const listeners = this.listeners.get(step.event);
            if (!listeners) {
              return;
            }
            const message = new MessageEvent(step.event, {
              data: JSON.stringify(step.data),
            });
            for (const listener of listeners) {
              listener(message);
            }
          }, elapsed);
        }
      }

      addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
        if (!this.listeners.has(type)) {
          this.listeners.set(type, new Set());
        }
        this.listeners.get(type)?.add(listener);
      }

      removeEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
        this.listeners.get(type)?.delete(listener);
      }

      close() {
        this.closed = true;
      }
    }

    Object.defineProperty(window, "EventSource", {
      value: MockEventSource,
      configurable: true,
      writable: true,
    });
  }, plans);
}

export async function mockNpxSkillsApi(page: Page) {
  let installedItems: ManagedSkill[] = [
    {
      name: "find-skills",
      repo: "vercel-labs/agent-skills",
      description: "Find skills quickly",
      category: "discovery",
      source: "managed",
      manageable: true,
      package_ref: "vercel-labs/agent-skills",
      skill_flags: ["find-skills"],
    },
    {
      name: "legacy-unmanaged",
      repo: null,
      description: "Found on filesystem only",
      category: null,
      source: "filesystem_unmanaged",
      manageable: false,
      package_ref: null,
      skill_flags: null,
    },
  ];

  await page.route("**/api/platforms", (route) =>
    jsonResponse(route, [
      {
        id: "claude",
        name: "Claude Code",
        icon: "C",
        base_dir: "/tmp/claude",
        skills_path: "/tmp/claude/skills",
      },
    ])
  );

  await page.route("**/api/platforms/claude/install-target/resolve", (route) =>
    jsonResponse(route, {
      scope: "global",
      project_path: null,
      base_dir: "/tmp/claude",
      skills_path: "/tmp/claude/skills",
      commands_path: "/tmp/claude/commands",
    })
  );

  await page.route("**/api/platforms/claude/npx-skills/catalog**", (route) =>
    jsonResponse(route, [
      {
        name: "find-skills",
        repo: "vercel-labs/agent-skills",
        skill_flag: "find-skills",
        category: "discovery",
        description: "Find skills quickly",
        stars: 5,
        project_only: false,
        usage: "Use /find-skills",
        install_status: "installed",
      },
      {
        name: "review",
        repo: "vercel-labs/agent-skills",
        skill_flag: "review",
        category: "quality",
        description: "Review code and changes",
        stars: 5,
        project_only: false,
        usage: "Use /review",
        install_status: "not_installed",
      },
    ])
  );

  await page.route("**/api/platforms/claude/npx-skills/installed**", (route) =>
    jsonResponse(route, installedItems)
  );

  await page.route("**/api/platforms/claude/npx-skills/install/jobs", async (route) => {
    installedItems = [
      ...installedItems,
      {
        name: "review",
        repo: "vercel-labs/agent-skills",
        description: "Review code and changes",
        category: "quality",
        source: "managed",
        manageable: true,
        package_ref: "vercel-labs/agent-skills",
        skill_flags: ["review"],
      },
    ];
    await jsonResponse(route, {
      job_id: "install-job",
      operation: "install",
      total: 1,
      status: "running",
    });
  });

  await page.route("**/api/platforms/claude/npx-skills/remove/jobs", async (route) => {
    installedItems = installedItems.filter((item) => item.name !== "find-skills");
    await jsonResponse(route, {
      job_id: "remove-job",
      operation: "remove",
      total: 1,
      status: "running",
    });
  });

  await page.route("**/api/platforms/claude/npx-skills/check/jobs", (route) =>
    jsonResponse(route, {
      job_id: "check-job",
      operation: "check",
      total: 1,
      status: "running",
    })
  );

  await page.route("**/api/platforms/claude/npx-skills/update/jobs", (route) =>
    jsonResponse(route, {
      job_id: "update-job",
      operation: "update",
      total: 1,
      status: "running",
    })
  );
}
