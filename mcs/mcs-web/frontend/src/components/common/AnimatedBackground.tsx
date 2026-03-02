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
                        ? "radial-gradient(ellipse at 50% 0%, rgba(0,70,140,0.6) 0%, transparent 60%), #050505"
                        : "radial-gradient(ellipse at 50% 0%, rgba(0,70,140,0.08) 0%, transparent 60%), #F8F9FA",

                "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    borderRadius: "50%",
                    filter: "blur(120px)",
                    opacity: 0.5,
                },

                "&::before": {
                    width: 600,
                    height: 600,
                    top: "-10%",
                    left: "-5%",
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "radial-gradient(circle, rgba(0,70,140,0.45) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(0,70,140,0.18) 0%, transparent 70%)",
                    animation: "orbFloat 22s ease-in-out infinite alternate",
                },

                "&::after": {
                    width: 500,
                    height: 500,
                    bottom: "-10%",
                    right: "-5%",
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
                    animation: "orbFloat 28s ease-in-out infinite alternate-reverse",
                },

                "@keyframes orbFloat": {
                    "0%": { transform: "translate(0, 0) scale(1)" },
                    "50%": { transform: "translate(30px, 20px) scale(1.05)" },
                    "100%": { transform: "translate(-20px, 40px) scale(0.96)" },
                },
            }}
        />
    );
}
