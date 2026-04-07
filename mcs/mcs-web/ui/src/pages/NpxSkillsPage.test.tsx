import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NpxSkillsPage from "./NpxSkillsPage";
import { lightTheme } from "@/theme";
import type {
  InstallTarget,
  PlatformDisplay,
  ResolvedInstallTarget,
} from "@/types";

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
  ],
  fetchPlatforms: async () => {},
};

const uiState = {
  colorMode: "light" as const,
  locale: "en" as const,
  toggleColorMode: () => {},
  setLocale: () => {},
  showNotification: () => {},
};

const installTargetState: {
  loading: boolean;
  dialogOpen: boolean;
  target: InstallTarget;
  resolvedTarget: ResolvedInstallTarget | null;
  resolutionError: string | null;
  recentProjects: string[];
  openDialog: () => void;
  closeDialog: () => void;
  applyTarget: () => Promise<boolean>;
} = {
  loading: false,
  dialogOpen: false,
  target: { scope: "global" },
  resolvedTarget: {
    scope: "global",
    project_path: null,
    base_dir: "/tmp/claude",
    skills_path: "/tmp/claude/skills",
    commands_path: "/tmp/claude/commands",
    agents_path: null,
    guidance_path: null,
  },
  resolutionError: null,
  recentProjects: [],
  openDialog: () => {},
  closeDialog: () => {},
  applyTarget: async () => true,
};

vi.mock("@/stores/platformStore", () => ({
  usePlatformStore: <T,>(selector: (state: typeof platformState) => T) => selector(platformState),
}));

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector?: (state: typeof uiState) => T) =>
    selector ? selector(uiState) : uiState,
}));

vi.mock("@/hooks/useNavigateDeferred", () => ({
  useNavigateDeferred: () => () => {},
}));

vi.mock("@/hooks/useInstallTarget", () => ({
  useInstallTarget: () => installTargetState,
}));

function renderPage() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={["/registry?workspace=claude"]}>
        <Routes>
          <Route path="/registry" element={<NpxSkillsPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("NpxSkillsPage", () => {
  it("renders the top-level registry workspace and core sections", () => {
    installTargetState.resolutionError = null;

    const markup = renderPage();

    expect(markup).toContain("Registry");
    expect(markup).toContain("Install from Repo");
    expect(markup).toContain("Discover");
    expect(markup).toContain("Installed");
    expect(markup).toContain("Maintenance");
  });

  it("renders a blocking alert when the install target cannot be resolved", () => {
    installTargetState.resolutionError = "Project target is invalid";
    installTargetState.resolvedTarget = null;

    const markup = renderPage();

    expect(markup).toContain("Project target is invalid");
    expect(markup).toContain("Registry");

    installTargetState.resolutionError = null;
    installTargetState.resolvedTarget = {
      scope: "global",
      project_path: null,
      base_dir: "/tmp/claude",
      skills_path: "/tmp/claude/skills",
      commands_path: "/tmp/claude/commands",
      agents_path: null,
      guidance_path: null,
    };
  });
});
