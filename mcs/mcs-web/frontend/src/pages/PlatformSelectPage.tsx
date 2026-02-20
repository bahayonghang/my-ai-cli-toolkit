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
      }}
    >
      <Typography variant="h3" fontWeight={700} gutterBottom>
        MyClaude Skills
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Select a platform to manage
      </Typography>

      <Grid container spacing={2} maxWidth={900} justifyContent="center">
        {platforms.map((p) => (
          <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3 }}>
            <Card
              elevation={2}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/platform/${p.id}`)}
                sx={{ p: 2, textAlign: "center" }}
              >
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {p.icon}
                </Typography>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.base_dir}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate("/dashboard")}
        >
          View Dashboard →
        </Typography>
      </Box>
    </Box>
  );
}
