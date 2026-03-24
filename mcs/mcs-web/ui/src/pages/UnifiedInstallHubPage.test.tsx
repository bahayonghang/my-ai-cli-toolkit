import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import UnifiedInstallHubPage from "./UnifiedInstallHubPage";
import { lightTheme } from "@/theme";
import type { PlatformDisplay, SkillCatalogDto } from "@/types";

const platforms: PlatformDisplay[] = [
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

const catalog: SkillCatalogDto[] = [
  {
    name: "frontend-design",
    description: "Design distinctive UIs",
    category: "frontend",
    tags: ["ui"],
    is_default: true,
    platform_status: { claude: "installed", codex: "outdated" },
  },
  {
    name: "research",
    description: "Run grounded research",
    category: "workflow",
    tags: ["research"],
    is_default: false,
    platform_status: { claude: "not_installed", codex: "installed" },
  },
];

const platformStoreState = {
  platforms,
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

const modelState: {
  loadingCatalog: boolean;
  catalog: SkillCatalogDto[];
  catalogError: string | null;
  categories: string[];
  defaultOnly: boolean;
  search: string;
  selectedCategory: string | null;
  selectedSkills: Set<string>;
  filteredSkills: SkillCatalogDto[];
  selectedPlatforms: Set<string>;
  activeStage: "skills" | "platforms" | "review";
  steps: {
    skills: { stage: "skills"; available: boolean; complete: boolean };
    platforms: { stage: "platforms"; available: boolean; complete: boolean };
    review: { stage: "review"; available: boolean; complete: boolean };
  };
  summary: {
    selectedSkillNames: string[];
    selectedPlatforms: PlatformDisplay[];
    filteredSkillCount: number;
    totalSkillCount: number;
    plannedActionCount: number;
  };
  execution: {
    running: boolean;
    currentStep: number;
    totalSteps: number;
    phase: "idle" | "running" | "complete";
    activePlatformId: string | null;
  };
  results: Array<{
    platform: PlatformDisplay;
    successCount: number;
    failureCount: number;
    results: Array<{ success: boolean; item_name: string; message: string; error: string | null }>;
    requestError: string | null;
  }>;
  setSelectedCategory: () => void;
  setSelectedSkills: () => void;
  setDefaultOnly: () => void;
  setSearch: () => void;
  setSelectedPlatforms: () => void;
  setResults: () => void;
  goToStage: () => void;
  runInstall: () => void;
} = {
  loadingCatalog: false,
  catalog,
  catalogError: null as string | null,
  categories: ["frontend", "workflow"],
  defaultOnly: false,
  search: "",
  selectedCategory: null as string | null,
  selectedSkills: new Set<string>(["frontend-design"]),
  filteredSkills: catalog,
  selectedPlatforms: new Set<string>(["claude"]),
  activeStage: "skills",
  steps: {
    skills: { stage: "skills" as const, available: true, complete: true },
    platforms: { stage: "platforms" as const, available: true, complete: true },
    review: { stage: "review" as const, available: true, complete: false },
  },
  summary: {
    selectedSkillNames: ["frontend-design"],
    selectedPlatforms: [platforms[0]],
    filteredSkillCount: 2,
    totalSkillCount: 2,
    plannedActionCount: 1,
  },
  execution: {
    running: false,
    currentStep: 0,
    totalSteps: 0,
    phase: "idle",
    activePlatformId: null,
  },
  results: [],
  setSelectedCategory: () => {},
  setSelectedSkills: () => {},
  setDefaultOnly: () => {},
  setSearch: () => {},
  setSelectedPlatforms: () => {},
  setResults: () => {},
  goToStage: () => {},
  runInstall: () => {},
};

vi.mock("@/stores/platformStore", () => ({
  usePlatformStore: <T,>(selector: (state: typeof platformStoreState) => T) =>
    selector(platformStoreState),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector: (state: typeof uiState) => T) => selector(uiState),
}));

vi.mock("./useUnifiedInstallHub", () => ({
  useUnifiedInstallHub: () => modelState,
}));

function renderPage() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <UnifiedInstallHubPage />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

afterEach(() => {
  modelState.activeStage = "skills";
  modelState.execution = {
    running: false,
    currentStep: 0,
    totalSteps: 0,
    phase: "idle",
    activePlatformId: null,
  };
  modelState.results = [];
});

describe("UnifiedInstallHubPage", () => {
  it("renders the staged workbench with one summary rail and three guided steps", () => {
    const markup = renderPage();

    expect(markup).toContain("Unified Skill Install Hub");
    expect(markup).toContain("Keep the run in view");
    expect(markup).toContain("Choose Skills");
    expect(markup).toContain("Choose Targets");
    expect(markup).toContain("Review &amp; Execute");
    expect(markup).toContain("Category Jump");
    expect(markup).toContain("frontend-design");
  });

  it("renders running execution context when the review stage is active", () => {
    modelState.activeStage = "review";
    modelState.execution = {
      running: true,
      currentStep: 1,
      totalSteps: 2,
      phase: "running",
      activePlatformId: "claude",
    };

    const markup = renderPage();

    expect(markup).toContain("Install in progress");
    expect(markup).toContain("Current target: Claude");
    expect(markup).toContain("Installing on platform 1 / 2");
  });
});
