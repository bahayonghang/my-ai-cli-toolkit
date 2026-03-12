import { Box } from "@mui/material";

interface AnimatedBackgroundProps {
  variant?: "hero" | "subtle";
}

export default function AnimatedBackground({
  variant = "subtle",
}: AnimatedBackgroundProps) {
  const isHero = variant === "hero";

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `radial-gradient(circle at top left, ${isHero ? "var(--mcs-hero-accent)" : "rgba(125, 186, 178, 0.06)"} 0, transparent 34%), ${theme.palette.background.default}`
            : `radial-gradient(circle at top left, ${isHero ? "var(--mcs-hero-accent)" : "rgba(22, 93, 102, 0.04)"} 0, transparent 34%), ${theme.palette.background.default}`,
        "&::before": isHero
          ? {
              content: '""',
              position: "absolute",
              insetInline: 0,
              top: 0,
              height: 240,
              background: "linear-gradient(180deg, var(--mcs-hero-accent) 0%, transparent 100%)",
            }
          : undefined,
      }}
    />
  );
}
