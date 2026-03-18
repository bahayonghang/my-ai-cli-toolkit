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
  const showAmbientBlobs = isHero && !prefersReducedMotion && !isCompactViewport;
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
              ? `linear-gradient(180deg, var(--mcs-dashboard-surface-strong) 0%, var(--mcs-panel-fill-strong) 26%, ${paletteTheme.palette.background.default} 68%, ${paletteTheme.palette.background.default} 100%)`
              : `radial-gradient(circle at 12% 0%, var(--mcs-dashboard-accent-soft) 0, transparent 30%), radial-gradient(circle at 92% 8%, var(--mcs-warning-progress) 0, transparent 24%), linear-gradient(180deg, var(--mcs-dashboard-surface-strong) 0%, var(--mcs-panel-fill-strong) 28%, ${paletteTheme.palette.background.default} 62%, ${paletteTheme.palette.background.default} 100%)`
            : softenEffects
              ? `linear-gradient(180deg, var(--mcs-hero-band) 0%, transparent 20%), ${paletteTheme.palette.background.default}`
              : `radial-gradient(circle at top left, ${isHero ? "var(--mcs-hero-accent)" : "var(--mcs-dashboard-accent-soft)"} 0, transparent 34%), linear-gradient(180deg, var(--mcs-hero-band) 0%, transparent 24%), ${paletteTheme.palette.background.default}`,
        "&::before": isDashboard
          ? softenEffects
            ? undefined
            : {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(90deg, transparent 0, transparent 95px, var(--mcs-dashboard-grid) 95px, var(--mcs-dashboard-grid) 96px), repeating-linear-gradient(180deg, transparent 0, transparent 95px, var(--mcs-dashboard-grid) 95px, var(--mcs-dashboard-grid) 96px)",
                maskImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.56) 48%, transparent 88%)",
              }
          : isHero
            ? {
                content: '""',
                position: "absolute",
                insetInline: 0,
                top: 0,
                height: softenEffects ? 200 : 280,
                background:
                  "linear-gradient(180deg, var(--mcs-hero-band) 0%, transparent 100%)",
              }
            : undefined,
        "&::after": isDashboard
          ? softenEffects
            ? undefined
            : {
                content: '""',
                position: "absolute",
                insetInline: "10%",
                top: 56,
                height: 300,
                borderRadius: "999px",
                background:
                  "radial-gradient(circle, var(--mcs-dashboard-accent-soft) 0%, transparent 72%)",
                filter: "blur(34px)",
                opacity: 0.8,
              }
          : isHero && !softenEffects
            ? {
                content: '""',
                position: "absolute",
                insetInline: "12%",
                top: 116,
                height: 120,
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, transparent 0%, var(--mcs-panel-accent-soft) 24%, var(--mcs-panel-accent) 50%, var(--mcs-panel-accent-soft) 76%, transparent 100%)",
                opacity: 0.22,
                filter: "blur(16px)",
              }
            : undefined,
      }}
    >
      {showAmbientBlobs && (
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
