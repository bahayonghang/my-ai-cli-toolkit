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
    >
      {/* Ambient color blobs — give backdrop-filter something to blur through */}
      {isHero && (
        <>
          <Box
            sx={{
              position: "absolute",
              width: "45vw",
              height: "45vw",
              maxWidth: 680,
              maxHeight: 680,
              top: "-8%",
              left: "-6%",
              borderRadius: "50%",
              background: "var(--mcs-blob-blue)",
              filter: "blur(72px)",
              willChange: "transform",
              contain: "strict",
              animation: "blobDrift1 36s ease-in-out infinite alternate",
              "@keyframes blobDrift1": {
                "0%": { transform: "translate(0, 0) scale(1)" },
                "100%": { transform: "translate(3vw, 2vh) scale(1.08)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: "38vw",
              height: "38vw",
              maxWidth: 580,
              maxHeight: 580,
              top: "12%",
              right: "-4%",
              borderRadius: "50%",
              background: "var(--mcs-blob-mauve)",
              filter: "blur(68px)",
              willChange: "transform",
              contain: "strict",
              animation: "blobDrift2 32s ease-in-out infinite alternate",
              "@keyframes blobDrift2": {
                "0%": { transform: "translate(0, 0) scale(1)" },
                "100%": { transform: "translate(-2vw, 3vh) scale(1.06)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: "32vw",
              height: "32vw",
              maxWidth: 480,
              maxHeight: 480,
              bottom: "4%",
              left: "18%",
              borderRadius: "50%",
              background: "var(--mcs-blob-rosewater)",
              filter: "blur(64px)",
              willChange: "transform",
              contain: "strict",
              animation: "blobDrift3 40s ease-in-out infinite alternate",
              "@keyframes blobDrift3": {
                "0%": { transform: "translate(0, 0) scale(1)" },
                "100%": { transform: "translate(2vw, -2vh) scale(1.05)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: "28vw",
              height: "28vw",
              maxWidth: 420,
              maxHeight: 420,
              bottom: "16%",
              right: "10%",
              borderRadius: "50%",
              background: "var(--mcs-blob-teal)",
              filter: "blur(60px)",
              willChange: "transform",
              contain: "strict",
              animation: "blobDrift4 34s ease-in-out infinite alternate",
              "@keyframes blobDrift4": {
                "0%": { transform: "translate(0, 0) scale(1)" },
                "100%": { transform: "translate(-1.5vw, 1.5vh) scale(1.04)" },
              },
            }}
          />
        </>
      )}
    </Box>
  );
}
