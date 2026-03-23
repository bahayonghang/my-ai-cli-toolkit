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
    position: "relative",
    borderRadius: 4,
    border: `1px solid ${tone.outline}`,
    background: `linear-gradient(180deg, ${tone.fillEmphasis} 0%, ${tone.fillStrong} 18%, ${tone.fill} 100%)`,
    boxShadow: `${tone.shadow}, inset 0 1px 0 0 var(--mcs-shell-highlight), inset 0 0 0 1px var(--mcs-panel-stroke-soft)`,
    overflow: "hidden",
    isolation: "isolate",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: `linear-gradient(180deg, var(--mcs-shell-highlight) 0%, transparent 28%), linear-gradient(90deg, ${tone.grid} 0, ${tone.grid} 1px, transparent 1px, transparent 96px)`,
      backgroundSize: "100% 100%, 96px 100%",
      pointerEvents: "none",
      opacity: surface === "workbench" ? 0.52 : 0.72,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      insetInline: 18,
      top: 0,
      height: 2,
      background: `linear-gradient(90deg, transparent 0%, ${tone.accentSoft} 16%, ${tone.accent} 50%, ${tone.accentSoft} 84%, transparent 100%)`,
      opacity: surface === "workbench" ? 0.82 : 0.96,
      pointerEvents: "none",
    },
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
  } as const;
}

export const entryPanelSx = surfacePanelSx("entry");
export const monitorPanelSx = surfacePanelSx("monitor");
export const workbenchPanelSx = surfacePanelSx("workbench");

// Backward-compatible alias for components not yet migrated.
export const glassPanelSx = workbenchPanelSx;
