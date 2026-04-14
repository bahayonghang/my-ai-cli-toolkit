import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme } from "./theme";

describe("theme", () => {
  it("exports the light theme contract", () => {
    expect(lightTheme.palette.background.default).toBe("#F7F8F8");
    expect(lightTheme.palette.background.paper).toBe("#FFFFFF");
    expect(lightTheme.palette.primary.main).toBe("#5E6AD2");
    expect(lightTheme.typography.h1?.fontFamily).toContain("Inter");
    expect(lightTheme.shape.borderRadius).toBe(4);
  });

  it("exports the dark theme contract and shared css variables", () => {
    expect(darkTheme.palette.background.default).toBe("#08090A");
    expect(darkTheme.palette.primary.main).toBe("#5E6AD2");

    const styleOverrides = darkTheme.components?.MuiCssBaseline?.styleOverrides;
    expect(typeof styleOverrides).toBe("function");

    const css =
      typeof styleOverrides === "function"
        ? (styleOverrides as unknown as () => string)()
        : "";
    expect(css).toContain('--font-family-display: "Inter"');
    expect(css).toContain("--mcs-canvas");
    expect(css).toContain("--mcs-glass-blur");
    expect(css).toContain("--mcs-workbench-accent");
  });
});
