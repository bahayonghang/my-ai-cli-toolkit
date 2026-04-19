import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme } from "./theme";

describe("theme", () => {
  it("exports the light theme contract", () => {
    // Claude brand: Parchment canvas, Ivory paper, Terracotta accent.
    expect(lightTheme.palette.background.default).toBe("#F5F4ED");
    expect(lightTheme.palette.background.paper).toBe("#FAF9F5");
    expect(lightTheme.palette.primary.main).toBe("#C96442");
    expect(lightTheme.typography.h1?.fontFamily).toContain("Source Serif 4");
    expect(lightTheme.shape.borderRadius).toBe(8);
  });

  it("exports the dark theme contract and shared css variables", () => {
    expect(darkTheme.palette.background.default).toBe("#141413");
    // Dark reads Coral as accent — the warmer variant on dark canvases.
    expect(darkTheme.palette.primary.main).toBe("#D97757");

    const styleOverrides = darkTheme.components?.MuiCssBaseline?.styleOverrides;
    expect(typeof styleOverrides).toBe("function");

    const css =
      typeof styleOverrides === "function"
        ? (styleOverrides as unknown as () => string)()
        : "";
    expect(css).toContain('--font-family-display: "Source Serif 4"');
    expect(css).toContain('--font-family-body: "Inter"');
    expect(css).toContain("--mcs-canvas");
    expect(css).toContain("--mcs-glass-blur");
    expect(css).toContain("--mcs-workbench-accent");
  });
});
