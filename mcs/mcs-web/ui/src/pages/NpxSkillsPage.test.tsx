import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes, Navigate } from "react-router-dom";
import NpxSkillsLayout from "./NpxSkillsLayout";
import NpxDiscoverPage from "./NpxDiscoverPage";
import NpxManagePage from "./NpxManagePage";
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

function renderPage(initialEntry = "/npx-skills?workspace=claude") {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/npx-skills" element={<NpxSkillsLayout />}>
            <Route index element={<Navigate to="discover" replace />} />
            <Route path="discover" element={<NpxDiscoverPage />} />
            <Route path="manage" element={<NpxManagePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("NpxSkillsLayout", () => {
  it("renders the npx skills workspace with navigation pills", () => {
    installTargetState.resolutionError = null;

    const markup = renderPage("/npx-skills/discover?workspace=claude");

    expect(markup).toContain("npx skills install and management");
    expect(markup).toContain("Discover");
    expect(markup).toContain("Manage");
    expect(markup).toContain("Choose skills from the catalog to stage a batch install here.");
  });

  it("renders a blocking alert when the install target cannot be resolved", () => {
    installTargetState.resolutionError = "Project target is invalid";
    installTargetState.resolvedTarget = null;

    const markup = renderPage("/npx-skills/discover?workspace=claude");

    expect(markup).toContain("Project target is invalid");
    expect(markup).toContain("npx skills install and management");

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
