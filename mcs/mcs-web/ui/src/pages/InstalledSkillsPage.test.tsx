import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import InstalledSkillsPage from "./InstalledSkillsPage";
import { lightTheme } from "@/theme";
import type { ItemDto, PlatformDisplay } from "@/types";

const platforms: PlatformDisplay[] = [
  {
    id: "codex",
    name: "Codex",
    icon: "X",
    base_dir: "/Users/demo/.codex",
    skills_path: "/Users/demo/.agents/skills",
    commands_path: "/Users/demo/.codex/prompts",
    guidance_path: "/Users/demo/.codex/AGENTS.md",
    supports_commands: true,
    supports_guidance: true,
  },
];

const items: ItemDto[] = [
  {
    name: "frontend-design",
    item_type: "skill",
    description: "Design strong product interfaces",
    status: "installed",
    category: "frontend",
    tags: [],
    is_default: true,
  },
  {
    name: "research",
    item_type: "skill",
    description: "Run grounded research",
    status: "installed",
    category: "workflow",
    tags: [],
    is_default: false,
  },
];

const platformStoreState = {
  platforms,
  fetchPlatforms: async () => {},
};

const uiState = {
  colorMode: "light" as const,
  locale: "en" as const,
  toggleColorMode: () => {},
  setLocale: () => {},
  showNotification: () => {},
};

const platformItemsDataState = {
  items,
  categories: [
    { name: "frontend", count: 1, item_type: "skill" as const },
    { name: "workflow", count: 1, item_type: "skill" as const },
  ],
  loading: false,
  error: null as string | null,
  refresh: async () => {},
};

const installTargetState = {
  loading: false,
  dialogOpen: false,
  target: { scope: "global" as const, project_path: null },
  resolvedTarget: {
    scope: "global" as const,
    project_path: null,
    base_dir: "/Users/demo/.codex",
    skills_path: "/Users/demo/.agents/skills",
    commands_path: "/Users/demo/.codex/prompts",
    agents_path: null,
    guidance_path: "/Users/demo/.codex/AGENTS.md",
  },
  recentProjects: [],
  openDialog: () => {},
  closeDialog: () => {},
  applyTarget: async () => {},
};

vi.mock("@/stores/platformStore", () => ({
  usePlatformStore: <T,>(selector: (state: typeof platformStoreState) => T) =>
    selector(platformStoreState),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector: (state: typeof uiState) => T) => selector(uiState),
}));

vi.mock("@/hooks/useNavigateDeferred", () => ({
  useNavigateDeferred: () => () => {},
}));

vi.mock("@/hooks/usePlatformItemsData", () => ({
  usePlatformItemsData: () => platformItemsDataState,
}));

vi.mock("@/hooks/useInstallTarget", () => ({
  useInstallTarget: () => installTargetState,
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

function renderPage() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={["/platform/codex"]}>
        <Routes>
          <Route path="/platform/:platformId" element={<InstalledSkillsPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

afterEach(() => {
  platformItemsDataState.error = null;
});

describe("InstalledSkillsPage", () => {
  it("renders the workspace summary and focused result controls", () => {
    const markup = renderPage();

    expect(markup).toContain("Manage the installed skills library for Codex");
    expect(markup).toContain("Install target");
    expect(markup).toContain("2 skills in view");
    expect(markup).toContain("2 categories");
    expect(markup).toContain("npx skills");
  });

  it("renders an inline error while keeping the workspace shell", () => {
    platformItemsDataState.error = "Installed skills failed to load";

    const markup = renderPage();

    expect(markup).toContain("Installed skills failed to load");
    expect(markup).toContain("Manage the installed skills library for Codex");
  });
});
