import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { usePlatformStore } from "@/stores/platformStore";
import AnimatedBackground from "@/components/common/AnimatedBackground";

export default function PlatformSelectPage() {
  const { platforms, loading, error, fetchPlatforms } = usePlatformStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        position: "relative",
      }}
    >
      <AnimatedBackground />
      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <Typography
          variant="h2"
          fontWeight={800}
          gutterBottom
          sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? "linear-gradient(135deg, #fff 0%, #A78BFA 100%)"
              : "linear-gradient(135deg, #000 0%, #8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            animation: "fadeInDown 0.4s ease-out",
            "@keyframes fadeInDown": {
              "0%": { opacity: 0, transform: "translateY(-20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" }
            }
          }}
        >
          MyClaude Skills
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 6,
            animation: "fadeIn 0.6s ease-out 0.15s both",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 }
            }
          }}
        >
          Select a platform to manage
        </Typography>
      </Box>

      <Grid container spacing={3} maxWidth={1000} justifyContent="center" sx={{ position: "relative", zIndex: 1 }}>
        {platforms.map((p, index) => (
          <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                animation: `slideUp 0.4s ease-out ${0.05 * index}s both`,
                "@keyframes slideUp": {
                  "0%": { opacity: 0, transform: "translateY(40px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" }
                },
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? "0 20px 40px -10px rgba(167, 139, 250, 0.2), 0 0 20px rgba(167, 139, 250, 0.1) inset"
                    : "0 20px 40px -10px rgba(139, 92, 246, 0.15), 0 0 20px rgba(139, 92, 246, 0.05) inset",
                  borderColor: (theme) => theme.palette.mode === 'dark' ? "rgba(167, 139, 250, 0.3)" : "rgba(139, 92, 246, 0.2)",
                  "& .platform-icon": {
                    transform: "scale(1.1) rotate(5deg)",
                  }
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/platform/${p.id}`)}
                sx={{ p: 4, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}
              >
                <Typography
                  variant="h2"
                  className="platform-icon"
                  sx={{
                    mb: 2,
                    transition: "transform 0.3s ease",
                    display: "inline-block"
                  }}
                >
                  {p.icon}
                </Typography>
                <CardContent sx={{ p: 0, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {p.base_dir}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8, position: "relative", zIndex: 1 }}>
        <Typography
          variant="body1"
          fontWeight={500}
          color="primary"
          sx={{
            cursor: "pointer",
            position: "relative",
            display: "inline-block",
            transition: "all 0.3s",
            "&::after": {
              content: '""',
              position: "absolute",
              width: "0%",
              height: "2px",
              bottom: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "currentColor",
              transition: "width 0.3s ease"
            },
            "&:hover": {
              color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000",
              "&::after": { width: "100%" }
            },
            animation: "fadeIn 0.6s ease-out 0.5s both",
          }}
          onClick={() => navigate("/dashboard")}
        >
          View Dashboard →
        </Typography>
      </Box>
    </Box>
  );
}
