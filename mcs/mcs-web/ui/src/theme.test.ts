import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme } from "./theme";

describe("theme", () => {
  it("exports the sunny light theme contract", () => {
    expect(lightTheme.palette.background.default).toBe("#FFF8EF");
    expect(lightTheme.palette.background.paper).toBe("#FFFDF8");
    expect(lightTheme.palette.primary.main).toBe("#27B3A7");
    expect(lightTheme.typography.h1?.fontFamily).toContain("Outfit");
    expect(lightTheme.shape.borderRadius).toBe(7);
  });

  it("exports the dusk dark theme contract and shared css variables", () => {
    expect(darkTheme.palette.background.default).toBe("#0E1B2D");
    expect(darkTheme.palette.primary.main).toBe("#66D9CC");

    const styleOverrides = darkTheme.components?.MuiCssBaseline?.styleOverrides;
    expect(typeof styleOverrides).toBe("function");

    const css =
      typeof styleOverrides === "function"
        ? (styleOverrides as unknown as () => string)()
        : "";
    expect(css).toContain('--font-family-display: "Outfit"');
    expect(css).toContain("--mcs-glass-blur");
    expect(css).toContain("--mcs-entry-accent");
  });
});
