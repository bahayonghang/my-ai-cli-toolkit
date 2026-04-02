import { type ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { lightTheme } from "@/theme";
import type { PlatformDisplay } from "@/types";

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
    },
    {
      id: "codex",
      name: "Codex",
      icon: "X",
      base_dir: "/tmp/codex",
      skills_path: "/tmp/codex/skills",
    },
  ],
  fetchPlatforms: async () => {},
};

vi.mock("@/stores/platformStore", () => ({
  usePlatformStore: <T,>(selector: (state: typeof platformState) => T) => selector(platformState),
}));

vi.mock("@/hooks/useNavigateDeferred", () => ({
  useNavigateDeferred: () => () => {},
}));

function renderShell(
  initialEntries: string[],
  props?: Partial<ComponentProps<typeof AppShell>>,
) {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={initialEntries}>
        <AppShell variant="workbench" title="Demo" subtitle="Demo subtitle" {...props}>
          <div>content</div>
        </AppShell>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("AppShell", () => {
  it("marks the active top-level navigation item with aria-current", () => {
    const markup = renderShell(["/dashboard"]);

    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Dashboard");
    expect(markup).toContain('href="/dashboard"');
  });

  it("marks the active platform workspace with aria-current location", () => {
    const markup = renderShell(["/platform/claude/npx-skills"]);

    expect(markup).toContain('aria-current="location"');
    expect(markup).toContain("Claude Code");
    expect(markup).toContain('href="/platform/claude"');
  });

  it("renders a visible h1 when the shell title is a plain string", () => {
    const markup = renderShell(["/dashboard"]);

    expect(markup).toMatch(/<h1[^>]*>Demo<\/h1>/);
  });

  it("renders a hidden semantic h1 when the visual title is custom content", () => {
    const markup = renderShell(["/dashboard"], {
      title: <span>Custom header</span>,
      pageHeading: "Semantic dashboard title",
    });

    expect(markup).toContain("Semantic dashboard title");
    expect(markup).toContain("Custom header");
    expect(markup).toMatch(/<h1[^>]*>Semantic dashboard title<\/h1>/);
  });
});
