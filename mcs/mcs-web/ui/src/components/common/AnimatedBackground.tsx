import { Box } from "@mui/material";

interface AnimatedBackgroundProps {
  variant?: "hero" | "subtle" | "dashboard";
}

export default function AnimatedBackground({
  variant = "subtle",
}: AnimatedBackgroundProps) {
  const isHero = variant === "hero";
  const isDashboard = variant === "dashboard";

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
          isDashboard
            ? theme.palette.mode === "dark"
              ? `radial-gradient(circle at top left, rgba(143, 197, 187, 0.14) 0, transparent 34%), radial-gradient(circle at top right, rgba(208, 169, 105, 0.09) 0, transparent 28%), linear-gradient(180deg, rgba(10, 15, 19, 0.92) 0%, ${theme.palette.background.default} 100%)`
              : `radial-gradient(circle at top left, rgba(120, 168, 159, 0.18) 0, transparent 36%), radial-gradient(circle at top right, rgba(218, 177, 96, 0.12) 0, transparent 30%), linear-gradient(180deg, rgba(251, 247, 240, 0.98) 0%, ${theme.palette.background.default} 100%)`
            : theme.palette.mode === "dark"
              ? `radial-gradient(circle at top left, ${isHero ? "var(--mcs-hero-accent)" : "rgba(125, 186, 178, 0.06)"} 0, transparent 34%), ${theme.palette.background.default}`
              : `radial-gradient(circle at top left, ${isHero ? "var(--mcs-hero-accent)" : "rgba(22, 93, 102, 0.04)"} 0, transparent 34%), ${theme.palette.background.default}`,
        "&::before": isDashboard
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 95px, var(--mcs-dashboard-grid) 95px, var(--mcs-dashboard-grid) 96px), repeating-linear-gradient(180deg, transparent 0, transparent 95px, var(--mcs-dashboard-grid) 95px, var(--mcs-dashboard-grid) 96px)",
              maskImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, transparent 85%)",
            }
          : isHero
          ? {
              content: '""',
              position: "absolute",
              insetInline: 0,
              top: 0,
              height: 240,
              background: "linear-gradient(180deg, var(--mcs-hero-accent) 0%, transparent 100%)",
            }
          : undefined,
        "&::after": isDashboard
          ? {
              content: '""',
              position: "absolute",
              insetInline: "8%",
              top: 72,
              height: 220,
              borderRadius: "999px",
              background:
                "radial-gradient(circle, var(--mcs-dashboard-accent-soft) 0%, transparent 70%)",
              filter: "blur(24px)",
              opacity: 0.8,
            }
          : undefined,
      }}
    />
  );
}
