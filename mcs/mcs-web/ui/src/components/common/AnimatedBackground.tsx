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
              ? `linear-gradient(180deg, var(--mcs-monitor-surface-strong) 0%, var(--mcs-monitor-panel-fill) 26%, ${paletteTheme.palette.background.default} 74%, ${paletteTheme.palette.background.default} 100%)`
              : `radial-gradient(circle at 16% -4%, var(--mcs-monitor-warm-soft) 0%, transparent 30%), radial-gradient(circle at 88% 0%, var(--mcs-monitor-accent-soft) 0%, transparent 26%), linear-gradient(180deg, var(--mcs-monitor-surface-strong) 0%, var(--mcs-monitor-panel-fill) 26%, ${paletteTheme.palette.background.default} 74%, ${paletteTheme.palette.background.default} 100%)`
            : isEntry
              ? softenEffects
                ? `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 22%), ${paletteTheme.palette.background.default}`
                : `radial-gradient(circle at 14% -6%, var(--mcs-entry-band) 0%, transparent 34%), radial-gradient(circle at 86% 0%, var(--mcs-entry-accent-soft) 0%, transparent 28%), linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 26%), ${paletteTheme.palette.background.default}`
              : isWorkbench
                ? softenEffects
                  ? `linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, transparent 18%), ${paletteTheme.palette.background.default}`
                  : `radial-gradient(circle at 14% 0%, var(--mcs-workbench-warm-soft) 0%, transparent 30%), linear-gradient(180deg, var(--mcs-workbench-surface-subtle) 0%, transparent 22%), ${paletteTheme.palette.background.default}`
                : softenEffects
                  ? `linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 20%), ${paletteTheme.palette.background.default}`
                  : `radial-gradient(circle at 16% -4%, var(--mcs-entry-band) 0%, transparent 32%), radial-gradient(circle at 84% 0%, var(--mcs-entry-accent-soft) 0%, transparent 26%), linear-gradient(180deg, var(--mcs-entry-band) 0%, transparent 24%), ${paletteTheme.palette.background.default}`,
        "&::before":
          softenEffects || isWorkbench || (!isMonitor && !isEntry && !isWorkbench)
            ? undefined
            : {
                content: '""',
                position: "absolute",
                inset: 0,
                background: isMonitor
                  ? "radial-gradient(circle at 24% 10%, var(--mcs-monitor-accent-soft) 0%, transparent 40%)"
                  : isEntry
                    ? "radial-gradient(circle at 20% 8%, var(--mcs-entry-accent-soft) 0%, transparent 38%)"
                    : "radial-gradient(circle at 82% 6%, var(--mcs-workbench-accent-soft) 0%, transparent 30%)",
                opacity: isMonitor ? 0.3 : 0.24,
              },
        "&::after":
          softenEffects || isWorkbench || (!isMonitor && !isEntry && !isWorkbench)
            ? undefined
            : {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 28%)",
                opacity: theme.palette.mode === "dark" ? 1 : 0.9,
              },
      }}
    />
  );
}
