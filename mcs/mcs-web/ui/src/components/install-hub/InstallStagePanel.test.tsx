import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@mui/material";
import { renderToStaticMarkup } from "react-dom/server";
import { lightTheme } from "@/theme";
import { InstallStagePanel } from "./InstallStagePanel";

function renderPanel() {
  return renderToStaticMarkup(
    <ThemeProvider theme={lightTheme}>
      <InstallStagePanel
        stepNumber={1}
        title="Choose Skills"
        description="Pick the items to install."
        active
        available
        complete={false}
        statusLabel="Current"
      >
        <div>Stage content</div>
      </InstallStagePanel>
    </ThemeProvider>,
  );
}

describe("InstallStagePanel", () => {
  it("renders the stage title as an h2", () => {
    const markup = renderPanel();

    expect(markup).toMatch(/<h2[^>]*>Choose Skills<\/h2>/);
  });
});
