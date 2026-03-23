import { Box, useMediaQuery, useTheme } from "@mui/material";

interface AnimatedBackgroundProps {
  variant?: "entry" | "monitor" | "workbench" | "subtle" | "hero" | "dashboard";
}

export default function AnimatedBackground({
  variant = "subtle",
}: AnimatedBackgroundProps) {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
    {
      noSsr: true,
    },
  );
  const isCompactViewport = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });
  const normalizedVariant =
    variant === "hero"
      ? "entry"
      : variant === "dashboard"
        ? "monitor"
        : variant;
  const isEntry = normalizedVariant === "entry";
  const isMonitor = normalizedVariant === "monitor";
  const isWorkbench = normalizedVariant === "workbench";
  const softenEffects = prefersReducedMotion || isCompactViewport;

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: (paletteTheme) =>
          isMonitor
            ? softenEffects
              ? `linear-gradient(180deg, var(--mcs-monitor-surface-strong) 0%, var(--mcs-monitor-panel-fill-strong) 24%, ${paletteTheme.palette.background.default} 68%, ${paletteTheme.palette.background.default} 100%)`
              : `linear-gradient(180deg, var(--mcs-monitor-surface-strong) 0%, var(--mcs-monitor-panel-fill-strong) 20%, ${paletteTheme.palette.background.default} 66%, ${paletteTheme.palette.background.default} 100%)`
            : isEntry
              ? softenEffects
                ? `linear-gradient(180deg, var(--mcs-entry-band-strong) 0%, var(--mcs-entry-band) 18%, transparent 36%), ${paletteTheme.palette.background.default}`
                : `linear-gradient(180deg, var(--mcs-entry-band-strong) 0%, var(--mcs-entry-band) 18%, transparent 38%), radial-gradient(circle at 16% 0%, var(--mcs-entry-accent-soft) 0, transparent 30%), ${paletteTheme.palette.background.default}`
              : isWorkbench
                ? softenEffects
                  ? `linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, transparent 18%), ${paletteTheme.palette.background.default}`
                  : `linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, transparent 22%), radial-gradient(circle at 88% 0%, var(--mcs-workbench-accent-soft) 0, transparent 18%), ${paletteTheme.palette.background.default}`
                : softenEffects
                  ? `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 20%), ${paletteTheme.palette.background.default}`
                  : `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 24%), ${paletteTheme.palette.background.default}`,
        "&::before": isMonitor
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 95px, var(--mcs-monitor-grid) 95px, var(--mcs-monitor-grid) 96px), repeating-linear-gradient(180deg, transparent 0, transparent 95px, var(--mcs-monitor-grid) 95px, var(--mcs-monitor-grid) 96px)",
              maskImage: softenEffects
                ? "linear-gradient(180deg, rgba(0, 0, 0, 0.58) 0%, transparent 62%)"
                : "linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 42%, transparent 84%)",
              opacity: softenEffects ? 0.45 : 1,
            }
          : isEntry
            ? {
                content: '""',
                position: "absolute",
                inset: 0,
                background: softenEffects
                  ? "linear-gradient(180deg, var(--mcs-entry-grid) 0%, transparent 30%)"
                  : "repeating-linear-gradient(90deg, transparent 0, transparent 119px, var(--mcs-entry-grid) 119px, var(--mcs-entry-grid) 120px), linear-gradient(180deg, var(--mcs-entry-grid) 0%, transparent 34%)",
                maskImage:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.32) 40%, transparent 72%)",
              }
            : isWorkbench
              ? {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(90deg, transparent 0, transparent 143px, var(--mcs-workbench-grid) 143px, var(--mcs-workbench-grid) 144px), linear-gradient(180deg, var(--mcs-workbench-grid) 0%, transparent 30%)",
                  maskImage:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0.48) 0%, rgba(0, 0, 0, 0.16) 28%, transparent 58%)",
                  opacity: softenEffects ? 0.24 : 0.52,
                }
              : undefined,
        "&::after": isMonitor
          ? softenEffects
            ? undefined
            : {
                content: '""',
                position: "absolute",
                insetInline: "12%",
                top: 54,
                height: 160,
                borderRadius: "28px",
                border: "1px solid var(--mcs-monitor-outline)",
                background:
                  "linear-gradient(180deg, var(--mcs-monitor-accent-soft) 0%, transparent 100%)",
                opacity: 0.5,
              }
          : isEntry
            ? {
                content: '""',
                position: "absolute",
                insetInline: softenEffects ? "5%" : "8%",
                top: softenEffects ? 88 : 72,
                height: softenEffects ? 132 : 188,
                borderRadius: 32,
                border: "1px solid var(--mcs-entry-outline)",
                background:
                  "linear-gradient(180deg, var(--mcs-entry-frame) 0%, transparent 100%)",
                boxShadow: "inset 0 1px 0 0 var(--mcs-shell-highlight)",
                opacity: softenEffects ? 0.7 : 0.9,
              }
            : isWorkbench
              ? softenEffects
                ? undefined
                : {
                    content: '""',
                    position: "absolute",
                    insetInline: "10%",
                    top: 60,
                    height: 118,
                    borderRadius: 28,
                    border: "1px solid var(--mcs-workbench-outline)",
                    background:
                      "linear-gradient(180deg, var(--mcs-workbench-accent-soft) 0%, transparent 100%)",
                    opacity: 0.32,
                  }
              : undefined,
      }}
    />
  );
}
