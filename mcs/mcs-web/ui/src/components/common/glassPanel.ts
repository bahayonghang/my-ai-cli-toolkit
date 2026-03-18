export const glassPanelSx = {
  position: "relative",
  borderRadius: 4,
  border: "1px solid var(--mcs-panel-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill-strong) 22%, var(--mcs-panel-fill) 100%)",
  boxShadow:
    "var(--mcs-panel-shadow), inset 0 1px 0 0 var(--mcs-glass-highlight), inset 0 0 0 1px var(--mcs-panel-stroke-soft)",
  backdropFilter: "blur(var(--mcs-glass-blur)) saturate(170%)",
  WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(170%)",
  overflow: "hidden",
  isolation: "isolate",
  "&::before": {
    content: '\"\"',
    position: "absolute",
    inset: 0,
    borderTop: "1px solid var(--mcs-glass-highlight)",
    background:
      "linear-gradient(180deg, var(--mcs-glass-highlight) 0%, var(--mcs-panel-stroke-soft) 26%, transparent 46%)",
    pointerEvents: "none",
  },
  "&::after": {
    content: '\"\"',
    position: "absolute",
    insetInline: 18,
    top: 0,
    height: 1,
    background:
      "linear-gradient(90deg, transparent 0%, var(--mcs-panel-accent-soft) 18%, var(--mcs-panel-accent) 50%, var(--mcs-panel-accent-soft) 82%, transparent 100%)",
    opacity: 0.92,
    pointerEvents: "none",
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
} as const;
