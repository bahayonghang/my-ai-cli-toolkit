import { Box, useMediaQuery, useTheme } from "@mui/material";

interface AnimatedBackgroundProps {
  variant?: "hero" | "subtle" | "dashboard";
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
  const isHero = variant === "hero";
  const isDashboard = variant === "dashboard";
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
          isDashboard
            ? softenEffects
              ? `linear-gradient(180deg, var(--mcs-dashboard-surface-strong) 0%, var(--mcs-panel-fill-strong) 24%, ${paletteTheme.palette.background.default} 68%, ${paletteTheme.palette.background.default} 100%)`
              : `linear-gradient(180deg, var(--mcs-dashboard-surface-strong) 0%, var(--mcs-panel-fill-strong) 20%, ${paletteTheme.palette.background.default} 66%, ${paletteTheme.palette.background.default} 100%)`
            : isHero
              ? softenEffects
                ? `linear-gradient(180deg, var(--mcs-hero-band-strong) 0%, var(--mcs-hero-band) 18%, transparent 36%), ${paletteTheme.palette.background.default}`
                : `linear-gradient(180deg, var(--mcs-hero-band-strong) 0%, var(--mcs-hero-band) 18%, transparent 38%), radial-gradient(circle at 16% 0%, var(--mcs-hero-accent) 0, transparent 30%), ${paletteTheme.palette.background.default}`
              : softenEffects
                ? `linear-gradient(180deg, var(--mcs-hero-band) 0%, transparent 20%), ${paletteTheme.palette.background.default}`
                : `linear-gradient(180deg, var(--mcs-hero-band) 0%, transparent 24%), ${paletteTheme.palette.background.default}`,
        "&::before": isDashboard
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 95px, var(--mcs-dashboard-grid) 95px, var(--mcs-dashboard-grid) 96px), repeating-linear-gradient(180deg, transparent 0, transparent 95px, var(--mcs-dashboard-grid) 95px, var(--mcs-dashboard-grid) 96px)",
              maskImage: softenEffects
                ? "linear-gradient(180deg, rgba(0, 0, 0, 0.58) 0%, transparent 62%)"
                : "linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 42%, transparent 84%)",
              opacity: softenEffects ? 0.45 : 1,
            }
          : isHero
            ? {
                content: '""',
                position: "absolute",
                inset: 0,
                background: softenEffects
                  ? "linear-gradient(180deg, var(--mcs-hero-grid) 0%, transparent 30%)"
                  : "repeating-linear-gradient(90deg, transparent 0, transparent 119px, var(--mcs-hero-grid) 119px, var(--mcs-hero-grid) 120px), linear-gradient(180deg, var(--mcs-hero-grid) 0%, transparent 34%)",
                maskImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.32) 40%, transparent 72%)",
              }
            : undefined,
        "&::after": isDashboard
          ? softenEffects
            ? undefined
            : {
                content: '""',
                position: "absolute",
                insetInline: "12%",
                top: 54,
                height: 160,
                borderRadius: "28px",
                border: "1px solid var(--mcs-dashboard-outline)",
                background:
                  "linear-gradient(180deg, var(--mcs-dashboard-accent-soft) 0%, transparent 100%)",
                opacity: 0.5,
              }
          : isHero
            ? {
                content: '""',
                position: "absolute",
                insetInline: softenEffects ? "5%" : "8%",
                top: softenEffects ? 88 : 72,
                height: softenEffects ? 132 : 188,
                borderRadius: 32,
                border: "1px solid var(--mcs-hero-outline)",
                background:
                  "linear-gradient(180deg, var(--mcs-hero-frame) 0%, transparent 100%)",
                boxShadow: "inset 0 1px 0 0 var(--mcs-panel-highlight)",
                opacity: softenEffects ? 0.7 : 0.9,
              }
            : undefined,
      }}
    />
  );
}
