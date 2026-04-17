import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

import ActivityPage from "./ActivityPage";
import { lightTheme } from "@/theme";
import type { ActivityRunsPageDto, PlatformDisplay } from "@/types";

const platformState: {
  platforms: PlatformDisplay[];
  fetchPlatforms: () => Promise<void>;
} = {
  platforms: [
    {
      id: "claude",
      name: "Claude Code",
      icon: "C",
      base_dir: "/tmp/claude",
      skills_path: "/tmp/claude/skills",
      skills_library_kind: "dedicated",
      skills_library_platform_ids: ["claude"],
    },
    {
      id: "codex",
      name: "Codex",
      icon: "X",
      base_dir: "/tmp/codex",
      skills_path: "/tmp/agents/skills",
      skills_library_kind: "shared",
      skills_library_platform_ids: ["codex"],
    },
  ],
  fetchPlatforms: async () => {},
};

const activityState: {
  data: ActivityRunsPageDto | null;
  loading: boolean;
  error: string | null;
  fetchRuns: () => Promise<void>;
  refreshRuns: () => Promise<void>;
} = {
  data: null,
  loading: false,
  error: null,
  fetchRuns: async () => {},
  refreshRuns: async () => {},
};

const uiState = {
  colorMode: "light" as const,
  locale: "en" as const,
  toggleColorMode: () => {},
  setLocale: () => {},
  showNotification: () => {},
};

vi.mock("@/stores/platformStore", () => ({
  usePlatformStore: <T,>(selector: (state: typeof platformState) => T) => selector(platformState),
}));

vi.mock("@/stores/activityStore", () => ({
  useActivityStore: <T,>(selector: (state: typeof activityState) => T) => selector(activityState),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector: (state: typeof uiState) => T) => selector(uiState),
}));

vi.mock("@/hooks/useNavigateDeferred", () => ({
  useNavigateDeferred: () => () => {},
}));

const activityFixture: ActivityRunsPageDto = {
  summary: {
    total_runs: 3,
    success_runs: 2,
    warning_runs: 0,
    error_runs: 1,
    local_runs: 2,
    npx_runs: 1,
  },
  filtered_total: 3,
  page: 1,
  page_size: 20,
  total_pages: 1,
  runs: [
    {
      run_id: "local-skill-install-1",
      surface: "local",
      operation: "install",
      status: "success",
      platform_id: "claude",
      platform_name: "Claude Code",
      install_target: { scope: "global", project_path: null },
      started_at_ms: 1_720_000_000_000,
      completed_at_ms: 1_720_000_001_200,
      duration_ms: 1200,
      item_count: 2,
      success_count: 2,
      failure_count: 0,
      run_config: { link_mode: "auto", agents: [], cli_mode: null },
      items: [
        {
          label: "frontend-design",
          item_type: "skill",
          success: true,
          message: "Installed frontend-design",
          duration_ms: 500,
          source_path: "/repo/content/skills/frontend-design",
          target_path: "/tmp/claude/skills/frontend-design",
          skill_flags: [],
        },
      ],
    },
    {
      run_id: "npx-skills-9",
      surface: "npx_skills",
      operation: "install",
      status: "error",
      platform_id: "claude",
      platform_name: "Claude Code",
      install_target: { scope: "project", project_path: "/tmp/project" },
      started_at_ms: 1_720_000_010_000,
      completed_at_ms: 1_720_000_011_000,
      duration_ms: 1000,
      item_count: 1,
      success_count: 0,
      failure_count: 1,
      run_config: { agents: ["codex"], cli_mode: "npx" },
      items: [
        {
          label: "vercel-labs/skills --skill find-skills",
          item_type: "skill",
          success: false,
          message: "Failed vercel-labs/skills --skill find-skills",
          error: "network timeout",
          output: "stderr",
          duration_ms: 1000,
          package_ref: "vercel-labs/skills",
          skill_flags: ["find-skills"],
        },
      ],
    },
  ],
};

function renderPage(initialEntry = "/activity?platform_id=claude") {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ActivityPage />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

afterEach(() => {
  activityState.data = null;
  activityState.loading = false;
  activityState.error = null;
});

describe("ActivityPage", () => {
  it("renders the activity center with summary metrics and run cards", () => {
    activityState.data = activityFixture;

    const markup = renderPage();

    expect(markup).toContain("Activity Center");
    expect(markup).toContain("Recorded runs");
    expect(markup).toContain("Claude Code");
    expect(markup).toContain("local-skill-install-1");
    expect(markup).toContain("npx-skills-9");
    expect(markup).toContain("Runs");
    expect(markup).toContain("Error runs");
    expect(markup).toMatch(/<h1[^>]*>Operations Dashboard<\/h1>|<h1[^>]*>Activity Center<\/h1>/);
  });

  it("renders the loading state before data arrives", () => {
    activityState.loading = true;

    const markup = renderPage();

    expect(markup).toContain("MuiCircularProgress-root");
  });
});
