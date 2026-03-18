export const glassPanelSx = {
  position: "relative",
  borderRadius: 4,
  border: "1px solid var(--mcs-glass-stroke)",
  background:
    "linear-gradient(180deg, var(--mcs-panel-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
  boxShadow:
    "var(--mcs-panel-shadow), inset 0 1px 0 0 var(--mcs-glass-highlight)",
  backdropFilter: "blur(var(--mcs-glass-blur)) saturate(170%)",
  WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(170%)",
  overflow: "hidden",
  isolation: "isolate",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderTop: "1px solid var(--mcs-glass-highlight)",
    background: "linear-gradient(180deg, var(--mcs-glass-highlight) 0%, transparent 42%)",
    pointerEvents: "none",
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
} as const;
