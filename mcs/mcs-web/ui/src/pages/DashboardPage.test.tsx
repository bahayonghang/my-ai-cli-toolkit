import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import { lightTheme } from "@/theme";
import type { DashboardDto } from "@/types";

const dashboardState: {
  data: DashboardDto | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
} = {
  data: null,
  loading: false,
  error: null,
  fetchDashboard: async () => {},
};

const uiState = {
  colorMode: "light" as const,
  locale: "en" as const,
  toggleColorMode: () => {},
  setLocale: () => {},
  showNotification: () => {},
};

vi.mock("@/stores/dashboardStore", () => ({
  useDashboardStore: <T,>(selector: (state: typeof dashboardState) => T) => selector(dashboardState),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector: (state: typeof uiState) => T) => selector(uiState),
}));

vi.mock("@/hooks/useNavigateDeferred", () => ({
  useNavigateDeferred: () => () => {},
}));

vi.mock("@/hooks/useLegacyDirs", () => ({
  useLegacyDirs: () => ({ legacyCount: 0, refreshLegacyCount: () => {} }),
}));

const dashboardFixture: DashboardDto = {
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
      {
        platformId: "gemini",
        platformName: "Gemini",
        platformIcon: "G",
        outdatedSkills: 2,
        installedSkills: 4,
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
    {
      id: "qwen",
      name: "Qwen",
      icon: "Q",
      total_skills: 8,
      installed_skills: 3,
      outdated_skills: 0,
      total_commands: 2,
      installed_commands: 1,
    },
  ],
};

function renderPage() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

function resetStores() {
  dashboardState.data = null;
  dashboardState.loading = false;
  dashboardState.error = null;
}

afterEach(() => {
  resetStores();
});

describe("DashboardPage", () => {
  it("renders the bright dashboard sections with spotlight data", () => {
    resetStores();
    dashboardState.data = dashboardFixture;

    const markup = renderPage();

    expect(markup).toContain("Skills Spotlight");
    expect(markup).toContain("Platform Matrix");
    expect(markup).toContain("frontend-design");
    expect(markup).toContain("Claude");
    expect(markup).toContain("Gemini");
    expect(markup).toContain("Codex");
  });

  it("renders an error alert alongside existing dashboard content", () => {
    resetStores();
    dashboardState.data = dashboardFixture;
    dashboardState.error = "Dashboard failed to refresh";

    const markup = renderPage();

    expect(markup).toContain("Dashboard failed to refresh");
    expect(markup).toContain("Update Queue");
  });

  it("renders a loading indicator before data arrives", () => {
    resetStores();
    dashboardState.loading = true;

    const markup = renderPage();

    expect(markup).toContain("MuiCircularProgress-root");
  });
});
