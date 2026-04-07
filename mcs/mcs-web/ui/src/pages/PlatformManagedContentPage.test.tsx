import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CommandsWorkspacePage from "./CommandsWorkspacePage";
import AgentsWorkspacePage from "./AgentsWorkspacePage";
import { lightTheme } from "@/theme";
import type { ItemDto, PlatformDisplay } from "@/types";

const platforms: PlatformDisplay[] = [
  {
    id: "claude",
    name: "Claude",
    icon: "C",
    base_dir: "/Users/demo/.claude",
    skills_path: "/Users/demo/.claude/skills",
    skills_library_kind: "dedicated",
    skills_library_platform_ids: ["claude"],
    commands_path: "/Users/demo/.claude/commands",
    agents_path: "/Users/demo/.claude/agents",
    supports_commands: true,
    supports_agents: true,
  },
  {
    id: "codex",
    name: "Codex",
    icon: "X",
    base_dir: "/Users/demo/.codex",
    skills_path: "/Users/demo/.agents/skills",
    skills_library_kind: "shared",
    skills_library_platform_ids: ["codex", "gemini"],
    commands_path: "/Users/demo/.codex/prompts",
    agents_path: "/Users/demo/.codex/agents",
    supports_commands: true,
    supports_agents: true,
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
    agents_path: "/Users/demo/.codex/agents",
    guidance_path: "/Users/demo/.codex/AGENTS.md",
  },
  resolutionError: null as string | null,
  recentProjects: [],
  openDialog: () => {},
  closeDialog: () => {},
  applyTarget: async () => true,
};

const platformItemsDataState: {
  items: ItemDto[];
  categories: Array<{ name: string; count: number; item_type: "command" | "agent" }>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} = {
  items: [
    {
      name: "setup",
      item_type: "command" as const,
      description: "Bootstrap Codex companion",
      status: "installed" as const,
      category: "codex-companion",
      tags: [],
      is_default: false,
    },
  ],
  categories: [{ name: "codex-companion", count: 1, item_type: "command" as const }],
  loading: false,
  error: null as string | null,
  refresh: async () => {},
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

vi.mock("@/hooks/useInstallTarget", () => ({
  useInstallTarget: () => installTargetState,
}));

vi.mock("@/hooks/usePlatformItemsData", () => ({
  usePlatformItemsData: () => platformItemsDataState,
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

function renderRoute(initialEntry: string, element: React.ReactNode) {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="*" element={element} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

afterEach(() => {
  platformItemsDataState.items = [
    {
      name: "setup",
      item_type: "command",
      description: "Bootstrap Codex companion",
      status: "installed",
      category: "codex-companion",
      tags: [],
      is_default: false,
    },
  ];
  platformItemsDataState.categories = [
    { name: "codex-companion", count: 1, item_type: "command" },
  ];
});

describe("PlatformManagedContentPage", () => {
  it("renders the commands workspace with Claude/Codex switching and prompt copy", () => {
    const markup = renderRoute("/manage/commands?platform=codex", <CommandsWorkspacePage />);

    expect(markup).toContain("Manage commands and prompts for Claude and Codex");
    expect(markup).toContain("Prompts");
    expect(markup).toContain("Claude");
    expect(markup).toContain("Codex");
    expect(markup).toContain("setup");
  });

  it("renders the agents workspace with agent editing affordance", () => {
    platformItemsDataState.items = [
      {
        name: "reviewer",
        item_type: "agent",
        description: "Reviews code changes",
        status: "installed",
        category: "quality",
        tags: [],
        is_default: false,
      },
    ];
    platformItemsDataState.categories = [
      { name: "quality", count: 1, item_type: "agent" },
    ];

    const markup = renderRoute("/manage/agents?platform=claude", <AgentsWorkspacePage />);

    expect(markup).toContain("Manage Claude and Codex agents from one control surface");
    expect(markup).toContain("reviewer");
  });
});
