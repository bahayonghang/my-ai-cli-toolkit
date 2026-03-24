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
              ? `linear-gradient(180deg, var(--mcs-monitor-surface-strong) 0%, var(--mcs-monitor-panel-fill) 28%, ${paletteTheme.palette.background.default} 72%, ${paletteTheme.palette.background.default} 100%)`
              : `linear-gradient(180deg, var(--mcs-monitor-surface-strong) 0%, var(--mcs-monitor-panel-fill) 26%, ${paletteTheme.palette.background.default} 72%, ${paletteTheme.palette.background.default} 100%)`
            : isEntry
              ? softenEffects
                ? `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 22%), ${paletteTheme.palette.background.default}`
                : `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 26%), radial-gradient(circle at 16% 0%, var(--mcs-entry-accent-soft) 0, transparent 34%), ${paletteTheme.palette.background.default}`
              : isWorkbench
                ? softenEffects
                  ? `linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, transparent 18%), ${paletteTheme.palette.background.default}`
                  : `linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, transparent 22%), radial-gradient(circle at 88% 0%, var(--mcs-workbench-accent-soft) 0, transparent 22%), ${paletteTheme.palette.background.default}`
                : softenEffects
                  ? `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 20%), ${paletteTheme.palette.background.default}`
                  : `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 24%), ${paletteTheme.palette.background.default}`,
        "&::before":
          softenEffects || (!isMonitor && !isEntry && !isWorkbench)
            ? undefined
            : {
                content: '""',
                position: "absolute",
                inset: 0,
                background: isMonitor
                  ? "radial-gradient(circle at 20% 0%, var(--mcs-monitor-accent-soft) 0%, transparent 38%)"
                  : isEntry
                    ? "radial-gradient(circle at 14% 0%, var(--mcs-entry-accent-soft) 0%, transparent 36%)"
                    : "radial-gradient(circle at 86% 0%, var(--mcs-workbench-accent-soft) 0%, transparent 30%)",
                opacity: isMonitor ? 0.34 : 0.26,
              },
      }}
    />
  );
}
