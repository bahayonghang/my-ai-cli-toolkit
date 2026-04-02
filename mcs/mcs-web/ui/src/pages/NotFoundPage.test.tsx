import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import { lightTheme } from "@/theme";

const uiState = {
  colorMode: "light" as const,
  locale: "en" as const,
  toggleColorMode: () => {},
  setLocale: () => {},
  showNotification: () => {},
};

vi.mock("@/stores/uiStore", () => ({
  useUiStore: <T,>(selector: (state: typeof uiState) => T) => selector(uiState),
}));

function renderPage() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("NotFoundPage", () => {
  it("renders a semantic h1 for the not-found state", () => {
    const markup = renderPage();

    expect(markup).toMatch(/<h1[^>]*>404<\/h1>/);
    expect(markup).toContain("Page not found");
  });
});
