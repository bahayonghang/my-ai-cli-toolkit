import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useUiStore } from "@/stores/uiStore";

export default function DashboardPage() {
  const { data, loading, error, fetchDashboard } = useDashboardStore();
  const { colorMode, toggleColorMode } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate("/")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 10, p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {data?.platforms.map((p) => {
              const skillPct = p.total_skills > 0
                ? (p.installed_skills / p.total_skills) * 100
                : 0;
              const cmdPct = p.total_commands > 0
                ? (p.installed_commands / p.total_commands) * 100
                : 0;

              return (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card
                    elevation={2}
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                    }}
                    onClick={() => navigate(`/platform/${p.id}`)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h5">{p.icon}</Typography>
                        <Typography variant="h6" fontWeight={600}>{p.name}</Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Skills: {p.installed_skills}/{p.total_skills}
                        {p.outdated_skills > 0 && (
                          <Typography component="span" color="warning.main">
                            {" "}({p.outdated_skills} outdated)
                          </Typography>
                        )}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={skillPct}
                        sx={{ mb: 1, height: 6, borderRadius: 3 }}
                      />

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Commands: {p.installed_commands}/{p.total_commands}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={cmdPct}
                        color="secondary"
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
