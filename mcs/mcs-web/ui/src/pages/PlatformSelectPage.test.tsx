import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import PlatformSelectPage from "./PlatformSelectPage";
import { lightTheme } from "@/theme";
import type { PlatformDisplay } from "@/types";

const platformState: {
  platforms: PlatformDisplay[];
  loading: boolean;
  error: string | null;
  fetchPlatforms: () => Promise<void>;
  refreshPlatforms: () => Promise<void>;
} = {
  platforms: [],
  loading: false,
  error: null,
  fetchPlatforms: async () => {},
  refreshPlatforms: async () => {},
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

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector: (state: typeof uiState) => T) => selector(uiState),
}));

vi.mock("@/hooks/useNavigateDeferred", () => ({
  useNavigateDeferred: () => () => {},
}));

vi.mock("@/hooks/useLegacyDirs", () => ({
  useLegacyDirs: () => ({ legacyCount: 1, refreshLegacyCount: () => {} }),
}));

const platformsFixture: PlatformDisplay[] = [
  {
    id: "codex",
    name: "Codex",
    icon: "C",
    base_dir: "~/.codex",
    skills_path: "~/.agents/skills",
    commands_path: "~/.codex/prompts",
    guidance_path: "~/.codex/AGENTS.md",
    supports_commands: true,
    supports_guidance: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "G",
    base_dir: "~/.agents",
    skills_path: "~/.agents/skills",
    commands_path: "~/.agents/commands",
    supports_commands: true,
  },
  {
    id: "claude",
    name: "Claude",
    icon: "A",
    base_dir: "~/.claude",
    skills_path: "~/.claude/skills",
    commands_path: "~/.claude/commands",
    agents_path: "~/.claude/agents",
    supports_commands: true,
    supports_agents: true,
  },
];

function renderPage() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <PlatformSelectPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

function resetStores() {
  platformState.platforms = [];
  platformState.loading = false;
  platformState.error = null;
}

afterEach(() => {
  resetStores();
});

describe("PlatformSelectPage", () => {
  it("renders a single dominant primary action with platform workspace copy", () => {
    resetStores();
    platformState.platforms = platformsFixture;

    const markup = renderPage();

    expect(markup).toContain("Open install hub");
    expect(markup).toContain("Choose a platform workspace");
    expect(markup).toContain("Shared library");
    expect(markup).toContain("Dedicated library");
    expect(markup).toContain("Skills path");
  });

  it("renders an error alert while keeping the page shell", () => {
    resetStores();
    platformState.platforms = platformsFixture;
    platformState.error = "Platform refresh failed";

    const markup = renderPage();

    expect(markup).toContain("Platform refresh failed");
    expect(markup).toContain("MyClaude Skills");
  });
});
