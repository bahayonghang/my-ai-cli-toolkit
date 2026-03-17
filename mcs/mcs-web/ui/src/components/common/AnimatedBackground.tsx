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
            ? `radial-gradient(circle at top left, var(--mcs-dashboard-accent-soft) 0, transparent 34%), radial-gradient(circle at top right, var(--mcs-warning-progress) 0, transparent 28%), linear-gradient(180deg, var(--mcs-panel-fill-strong) 0%, ${theme.palette.background.default} 100%)`
            : `radial-gradient(circle at top left, ${isHero ? "var(--mcs-hero-accent)" : "var(--mcs-dashboard-accent-soft)"} 0, transparent 34%), ${theme.palette.background.default}`,
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
