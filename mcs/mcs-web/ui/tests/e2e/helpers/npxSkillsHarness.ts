import { expect } from "@playwright/test";
import type { Locator, Page, Route } from "@playwright/test";

type EventPlan = {
  match: string;
  steps: Array<{ event: string; data: unknown; delayMs?: number }>;
};

type ManagedSkill = {
  id: string;
  name: string;
  scope: "global" | "project";
  agents: string[];
  group_id: string;
  group_label: string;
  group_order: number;
  category_id: string;
  category_slug: string;
  category_label: string;
  category_order: number;
  tags: string[];
  description: string | null;
  source: {
    kind: "curated" | "manual_github" | "manual_git" | "manual_local" | "manual_unknown";
    ref: string;
    display: string;
  };
  catalog_match: { id: string; name: string; category_label: string } | null;
  tracking: {
    kind: "tracked" | "untracked";
    source_type: string | null;
    installed_at: string | null;
    updated_at: string | null;
    reason: string | null;
  };
  update: {
    kind: "not_checked" | "up_to_date" | "update_available" | "unsupported";
    last_checked_at_ms: number | null;
    reason: string | null;
  };
  actions: {
    removable: boolean;
    reinstallable: boolean;
    batch_updatable: boolean;
  };
};

type InstallTarget = {
  scope: "global" | "project";
  project_path?: string | null;
};

type NpxSkillsCliConfig = {
  agents: string[];
  cli_mode: "auto" | "npx";
};

type InstallJobRequest = {
  items: Array<{ package_ref: string; skill_flags?: string[]; catalog_entry_id?: string | null }>;
  config?: NpxSkillsCliConfig;
  install_target?: InstallTarget;
};

type RemoveJobRequest = {
  item_ids: string[];
  config?: NpxSkillsCliConfig;
  install_target?: InstallTarget;
};

type MaintenanceJobRequest = {
  config?: NpxSkillsCliConfig;
  install_target?: InstallTarget;
};

export type NpxSkillsCapturedRequests = {
  resolveInstallTarget: InstallTarget[];
  installJobs: InstallJobRequest[];
  removeJobs: RemoveJobRequest[];
  checkJobs: MaintenanceJobRequest[];
  updateJobs: MaintenanceJobRequest[];
};

function jsonResponse(route: Route, data: unknown) {
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

function parseRequestBody<T>(route: Route): T {
  const raw = route.request().postData() ?? "{}";
  return JSON.parse(raw) as T;
}

function resolvedPathsForTarget(target: InstallTarget) {
  if (target.scope === "project" && target.project_path?.trim()) {
    const baseDir = target.project_path.trim();
    return {
      scope: "project" as const,
      project_path: baseDir,
      base_dir: baseDir,
      skills_path: `${baseDir}/.claude/skills`,
      commands_path: `${baseDir}/.claude/commands`,
    };
  }

  return {
    scope: "global" as const,
    project_path: null,
    base_dir: "/tmp/claude",
    skills_path: "/tmp/claude/skills",
    commands_path: "/tmp/claude/commands",
  };
}

function buildInstalledGroups(items: ManagedSkill[]) {
  const groups = new Map<
    string,
    {
      id: string;
      label: string;
      order: number;
      categories: Map<
        string,
        {
          id: string;
          slug: string;
          label: string;
          count: number;
          group_id: string;
          group_order: number;
          category_order: number;
        }
      >;
    }
  >();

  for (const item of items) {
    const group =
      groups.get(item.group_id)
      ?? {
        id: item.group_id,
        label: item.group_label,
        order: item.group_order,
        categories: new Map(),
      };
    groups.set(item.group_id, group);

    const category =
      group.categories.get(item.category_id)
      ?? {
        id: item.category_id,
        slug: item.category_slug,
        label: item.category_label,
        count: 0,
        group_id: item.group_id,
        group_order: item.group_order,
        category_order: item.category_order,
      };
    category.count += 1;
    group.categories.set(item.category_id, category);
  }

  return Array.from(groups.values())
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))
    .map((group) => ({
      id: group.id,
      label: group.label,
      order: group.order,
      categories: Array.from(group.categories.values()).sort(
        (left, right) =>
          left.category_order - right.category_order || left.label.localeCompare(right.label),
      ),
    }));
}

function buildInstalledInventoryResponse(items: ManagedSkill[]) {
  return {
    target: {
      scope: "global" as const,
      project_path: null,
      base_dir: "/tmp/claude",
      skills_path: "/tmp/claude/skills",
      commands_path: "/tmp/claude/commands",
      agents_path: null,
      guidance_path: null,
    },
    capabilities: {
      list: { supported: true, reason: null },
      remove: { supported: true, reason: null },
      check: { supported: true, reason: null },
      update: { supported: true, reason: null },
    },
    summary: {
      total: items.length,
      curated: items.filter((item) => item.source.kind === "curated").length,
      manual: items.filter((item) => item.source.kind !== "curated").length,
      tracked: items.filter((item) => item.tracking.kind === "tracked").length,
      update_available: items.filter((item) => item.update.kind === "update_available").length,
    },
    groups: buildInstalledGroups(items),
    filtered_total: items.length,
    page: 1,
    page_size: Math.max(items.length, 1),
    total_pages: 1,
    items,
  };
}

async function clickFirstVisible(dialog: Locator, names: RegExp[]) {
  for (const name of names) {
    const button = dialog.getByRole("button", { name }).first();
    const isVisible = await button.isVisible().catch(() => false);
    const isEnabled = await button.isEnabled().catch(() => false);
    if (isVisible && isEnabled) {
      await button.click();
      return true;
    }
  }

  return false;
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

export async function seedNpxSkillsRunConfig(page: Page, config: NpxSkillsCliConfig) {
  await page.addInitScript((nextConfig: NpxSkillsCliConfig) => {
    window.localStorage.setItem("mcs-npx-skills-agents", JSON.stringify(nextConfig.agents));
    window.localStorage.setItem("mcs-npx-skills-cli-mode", nextConfig.cli_mode);
  }, config);
}

export async function setNpxSkillsInstallTarget(page: Page, target: InstallTarget) {
  await page.getByLabel(/install target/i).click();

  const dialog = page.locator('[role="dialog"]:visible').last();
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: target.scope === "project" ? /project/i : /global/i }).click();
  if (target.scope === "project") {
    await dialog.getByLabel(/project path/i).fill(target.project_path ?? "");
  }

  await dialog.getByRole("button", { name: /^apply$/i }).click();
  await expect(dialog).not.toBeVisible();
}

export async function maybeSubmitNpxSkillsRunDialog(
  page: Page,
  options: {
    installTarget?: InstallTarget;
    submitButtons: RegExp[];
  }
) {
  const dialogs = page.locator('[role="dialog"]:visible');
  if ((await dialogs.count()) === 0) {
    return false;
  }

  const dialog = dialogs.last();
  if (options.installTarget) {
    const targetButton = dialog
      .getByRole("button", {
        name: options.installTarget.scope === "project" ? /project/i : /global/i,
      })
      .first();
    if (await targetButton.isVisible().catch(() => false)) {
      await targetButton.click();
      if (options.installTarget.scope === "project") {
        const projectPathField = dialog.getByLabel(/project path/i).first();
        if (await projectPathField.isVisible().catch(() => false)) {
          await projectPathField.fill(options.installTarget.project_path ?? "");
        }
      }
    }
  }

  return clickFirstVisible(dialog, options.submitButtons);
}

export async function mockNpxSkillsApi(page: Page) {
  let installedItems: ManagedSkill[] = [
    {
      id: "find-skills",
      name: "find-skills",
      scope: "global",
      agents: ["Claude Code"],
      group_id: "engineering",
      group_label: "Engineering",
      group_order: 10,
      category_id: "discovery",
      category_slug: "dev-tools",
      category_label: "Discovery",
      category_order: 10,
      tags: ["search"],
      description: "Find skills quickly",
      source: {
        kind: "curated",
        ref: "vercel-labs/agent-skills",
        display: "vercel-labs/agent-skills",
      },
      catalog_match: {
        id: "find-skills",
        name: "find-skills",
        category_label: "Discovery",
      },
      tracking: {
        kind: "tracked",
        source_type: "well-known",
        installed_at: null,
        updated_at: null,
        reason: null,
      },
      update: {
        kind: "not_checked",
        last_checked_at_ms: null,
        reason: null,
      },
      actions: {
        removable: true,
        reinstallable: true,
        batch_updatable: true,
      },
    },
    {
      id: "legacy-unmanaged",
      name: "legacy-unmanaged",
      scope: "global",
      agents: [],
      group_id: "manual",
      group_label: "Manual",
      group_order: 999,
      category_id: "manual_local",
      category_slug: "manual-local",
      category_label: "Local",
      category_order: 999,
      tags: [],
      description: "Found on filesystem only",
      source: {
        kind: "manual_local",
        ref: "/tmp/claude/skills/legacy-unmanaged",
        display: "/tmp/claude/skills/legacy-unmanaged",
      },
      catalog_match: null,
      tracking: {
        kind: "untracked",
        source_type: null,
        installed_at: null,
        updated_at: null,
        reason: "No lock metadata found for this installed skill.",
      },
      update: {
        kind: "unsupported",
        last_checked_at_ms: null,
        reason: "No lock metadata found for this installed skill.",
      },
      actions: {
        removable: false,
        reinstallable: false,
        batch_updatable: false,
      },
    },
  ];
  const requests: NpxSkillsCapturedRequests = {
    resolveInstallTarget: [],
    installJobs: [],
    removeJobs: [],
    checkJobs: [],
    updateJobs: [],
  };

  await page.route("**/api/platforms", (route) =>
    jsonResponse(route, [
      {
        id: "claude",
        name: "Claude Code",
        icon: "C",
        base_dir: "/tmp/claude",
        skills_path: "/tmp/claude/skills",
        skills_library_kind: "dedicated",
        skills_library_platform_ids: ["claude"],
      },
    ])
  );

  await page.route("**/api/platforms/claude/install-target/resolve", (route) => {
    const body = parseRequestBody<InstallTarget>(route);
    requests.resolveInstallTarget.push(body);
    return jsonResponse(route, resolvedPathsForTarget(body));
  });

  await page.route("**/api/platforms/claude/npx-skills/catalog**", (route) =>
    jsonResponse(route, [
      {
        id: "find-skills",
        name: "find-skills",
        package_ref: "vercel-labs/agent-skills",
        skill_flag: "find-skills",
        group_id: "engineering",
        group_label: "Engineering",
        group_order: 10,
        category_id: "discovery",
        category_slug: "dev-tools",
        category_label: "Discovery",
        category_order: 10,
        tags: ["search"],
        install_kind: "skills_cli",
        install_provider: "vercel",
        description: "Find skills quickly",
        stars: 5,
        project_only: false,
        usage: "Use /find-skills",
        installed_state: "installed",
        installed_instance_id: "find-skills",
      },
      {
        id: "review",
        name: "review",
        package_ref: "vercel-labs/agent-skills",
        skill_flag: "review",
        group_id: "engineering",
        group_label: "Engineering",
        group_order: 10,
        category_id: "quality",
        category_slug: "code-quality",
        category_label: "Quality",
        category_order: 20,
        tags: ["review"],
        install_kind: "skills_cli",
        install_provider: "vercel",
        description: "Review code and changes",
        stars: 5,
        project_only: false,
        usage: "Use /review",
        installed_state: "not_installed",
        installed_instance_id: null,
      },
    ])
  );

  await page.route("**/api/platforms/claude/npx-skills/installed**", (route) =>
    jsonResponse(route, buildInstalledInventoryResponse(installedItems))
  );

  await page.route("**/api/platforms/claude/npx-skills/packages/preview", async (route) => {
    const body = parseRequestBody<{ package_ref: string }>(route);
    if (body.package_ref === "vercel-labs/agent-skills") {
      return jsonResponse(route, {
        package_ref: body.package_ref,
        source_ref: "https://github.com/vercel-labs/agent-skills.git",
        mode: "listed_skills",
        skills: [
          { name: "find-skills", description: "Find skills quickly" },
          { name: "review", description: "Review code and changes" },
        ],
        fallback_reason: null,
      });
    }

    return jsonResponse(route, {
      package_ref: body.package_ref,
      source_ref: body.package_ref,
      mode: "package_only",
      skills: [],
      fallback_reason:
        "Unable to enumerate skills from this package; install will target the whole package.",
    });
  });

  await page.route("**/api/platforms/claude/npx-skills/install/jobs", async (route) => {
    requests.installJobs.push(parseRequestBody<InstallJobRequest>(route));
    installedItems = [
      ...installedItems,
      {
        id: "review",
        name: "review",
        scope: "global",
        agents: ["Claude Code"],
        group_id: "engineering",
        group_label: "Engineering",
        group_order: 10,
        category_id: "quality",
        category_slug: "code-quality",
        category_label: "Quality",
        category_order: 20,
        tags: ["review"],
        description: "Review code and changes",
        source: {
          kind: "curated",
          ref: "vercel-labs/agent-skills",
          display: "vercel-labs/agent-skills",
        },
        catalog_match: {
          id: "review",
          name: "review",
          category_label: "Quality",
        },
        tracking: {
          kind: "tracked",
          source_type: "well-known",
          installed_at: null,
          updated_at: null,
          reason: null,
        },
        update: {
          kind: "not_checked",
          last_checked_at_ms: null,
          reason: null,
        },
        actions: {
          removable: true,
          reinstallable: true,
          batch_updatable: true,
        },
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
    requests.removeJobs.push(parseRequestBody<RemoveJobRequest>(route));
    installedItems = installedItems.filter((item) => item.id !== "find-skills");
    await jsonResponse(route, {
      job_id: "remove-job",
      operation: "remove",
      total: 1,
      status: "running",
    });
  });

  await page.route("**/api/platforms/claude/npx-skills/check/jobs", (route) => {
    requests.checkJobs.push(parseRequestBody<MaintenanceJobRequest>(route));
    return jsonResponse(route, {
      job_id: "check-job",
      operation: "check",
      total: 1,
      status: "running",
    });
  });

  await page.route("**/api/platforms/claude/npx-skills/update/jobs", (route) => {
    requests.updateJobs.push(parseRequestBody<MaintenanceJobRequest>(route));
    return jsonResponse(route, {
      job_id: "update-job",
      operation: "update",
      total: 1,
      status: "running",
    });
  });

  return { requests };
}
