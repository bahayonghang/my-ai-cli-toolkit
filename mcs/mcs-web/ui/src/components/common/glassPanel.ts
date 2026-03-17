export const glassPanelSx = {
  position: "relative",
  borderRadius: 4,
  border: "1px solid var(--mcs-glass-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-panel-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
  boxShadow: "var(--mcs-panel-shadow)",
  backdropFilter: "blur(var(--mcs-glass-blur)) saturate(140%)",
  WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(140%)",
  overflow: "hidden",
  isolation: "isolate",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, var(--mcs-glass-highlight) 0%, transparent 42%)",
    pointerEvents: "none",
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
} as const;
