type SurfaceTone = "entry" | "monitor" | "workbench";

const surfaceTokens: Record<
  SurfaceTone,
  {
    outline: string;
    fill: string;
    fillStrong: string;
    fillEmphasis: string;
    grid: string;
    accent: string;
    accentSoft: string;
    shadow: string;
  }
> = {
  entry: {
    outline: "var(--mcs-entry-outline)",
    fill: "var(--mcs-entry-panel-fill)",
    fillStrong: "var(--mcs-entry-panel-fill-strong)",
    fillEmphasis: "var(--mcs-entry-panel-fill-emphasis)",
    grid: "var(--mcs-entry-panel-grid)",
    accent: "var(--mcs-entry-accent-strong)",
    accentSoft: "var(--mcs-entry-accent-soft)",
    shadow: "var(--mcs-entry-panel-shadow)",
  },
  monitor: {
    outline: "var(--mcs-monitor-outline)",
    fill: "var(--mcs-monitor-panel-fill)",
    fillStrong: "var(--mcs-monitor-panel-fill-strong)",
    fillEmphasis: "var(--mcs-monitor-panel-fill-emphasis)",
    grid: "var(--mcs-monitor-panel-grid)",
    accent: "var(--mcs-monitor-accent-strong)",
    accentSoft: "var(--mcs-monitor-accent-soft)",
    shadow: "var(--mcs-monitor-panel-shadow)",
  },
  workbench: {
    outline: "var(--mcs-workbench-outline)",
    fill: "var(--mcs-workbench-panel-fill)",
    fillStrong: "var(--mcs-workbench-panel-fill-strong)",
    fillEmphasis: "var(--mcs-workbench-panel-fill-emphasis)",
    grid: "var(--mcs-workbench-panel-grid)",
    accent: "var(--mcs-workbench-accent-strong)",
    accentSoft: "var(--mcs-workbench-accent-soft)",
    shadow: "var(--mcs-workbench-panel-shadow)",
  },
};

export function surfacePanelSx(surface: SurfaceTone) {
  const tone = surfaceTokens[surface];

  return {
    borderRadius: 4,
    border: `1px solid ${tone.outline}`,
    background: tone.fill,
    boxShadow: tone.shadow,
  } as const;
}

export const entryPanelSx = surfacePanelSx("entry");
export const monitorPanelSx = surfacePanelSx("monitor");
export const workbenchPanelSx = surfacePanelSx("workbench");

// Backward-compatible alias for components not yet migrated.
export const glassPanelSx = workbenchPanelSx;
