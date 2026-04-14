import { Box, useMediaQuery, useTheme } from "@mui/material";

interface AnimatedBackgroundProps {
  variant?: "entry" | "monitor" | "workbench" | "subtle" | "hero" | "dashboard";
}

export default function AnimatedBackground({
  variant = "subtle",
}: AnimatedBackgroundProps) {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    noSsr: true,
  });
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

  const primaryAccent = isMonitor
    ? "var(--mcs-monitor-accent-soft)"
    : isEntry
      ? "var(--mcs-entry-accent-soft)"
      : "var(--mcs-workbench-accent-soft)";
  const secondaryAccent = isMonitor
    ? "var(--mcs-monitor-warm-soft)"
    : isEntry
      ? "var(--mcs-entry-band)"
      : "var(--mcs-workbench-surface-subtle)";

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: softenEffects
          ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, var(--mcs-canvas-soft) 100%)`
          : `
            radial-gradient(circle at 50% -18%, ${primaryAccent} 0%, transparent 28%),
            radial-gradient(circle at 18% 8%, ${secondaryAccent} 0%, transparent 24%),
            linear-gradient(180deg, ${theme.palette.background.default} 0%, var(--mcs-canvas-soft) 100%)
          `,
        "&::before": softenEffects
          ? undefined
          : {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 18%)",
              opacity: theme.palette.mode === "dark" ? 1 : 0.5,
            },
        "&::after":
          softenEffects || (!isEntry && !isMonitor && !isWorkbench)
            ? undefined
            : {
                content: '""',
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 80% 0%, ${primaryAccent} 0%, transparent 24%)`,
                opacity: 0.45,
              },
      }}
    />
  );
}
