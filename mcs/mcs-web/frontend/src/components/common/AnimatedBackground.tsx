import { Box } from "@mui/material";

/**
 * Animated background with slowly-moving gradient orbs.
 * Renders behind the main content via position: fixed + z-index: -1.
 */
export default function AnimatedBackground() {
    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                overflow: "hidden",
                pointerEvents: "none",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "radial-gradient(ellipse at 50% 0%, rgba(30,10,60,0.6) 0%, transparent 60%), #050505"
                        : "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 60%), #F8F9FA",

                "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    borderRadius: "50%",
                    filter: "blur(100px)",
                    opacity: 0.5,
                },

                "&::before": {
                    width: 600,
                    height: 600,
                    top: "-10%",
                    left: "-5%",
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
                    animation: "orbFloat 18s ease-in-out infinite alternate",
                },

                "&::after": {
                    width: 500,
                    height: 500,
                    bottom: "-10%",
                    right: "-5%",
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "radial-gradient(circle, rgba(96,165,250,0.30) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                    animation: "orbFloat 22s ease-in-out infinite alternate-reverse",
                },

                "@keyframes orbFloat": {
                    "0%": { transform: "translate(0, 0) scale(1)" },
                    "50%": { transform: "translate(40px, 30px) scale(1.08)" },
                    "100%": { transform: "translate(-30px, 50px) scale(0.95)" },
                },
            }}
        />
    );
}
