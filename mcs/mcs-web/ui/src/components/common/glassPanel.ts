export const glassPanelSx = {
  position: "relative",
  borderRadius: 4,
  border: "1px solid var(--mcs-panel-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill-strong) 18%, var(--mcs-panel-fill) 100%)",
  boxShadow:
    "var(--mcs-panel-shadow), inset 0 1px 0 0 var(--mcs-panel-highlight), inset 0 0 0 1px var(--mcs-panel-stroke-soft)",
  overflow: "hidden",
  isolation: "isolate",
  "&::before": {
    content: '\"\"',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, var(--mcs-panel-highlight) 0%, transparent 28%), linear-gradient(90deg, var(--mcs-panel-grid) 0, var(--mcs-panel-grid) 1px, transparent 1px, transparent 96px)",
    backgroundSize: "100% 100%, 96px 100%",
    pointerEvents: "none",
    opacity: 0.72,
  },
  "&::after": {
    content: '\"\"',
    position: "absolute",
    insetInline: 18,
    top: 0,
    height: 2,
    background:
      "linear-gradient(90deg, transparent 0%, var(--mcs-panel-accent-soft) 16%, var(--mcs-panel-accent) 50%, var(--mcs-panel-accent-soft) 84%, transparent 100%)",
    opacity: 0.96,
    pointerEvents: "none",
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
} as const;
