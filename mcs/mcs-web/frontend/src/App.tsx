import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { useUiStore } from "@/stores/uiStore";
import { lightTheme, darkTheme } from "@/theme";
import PlatformSelectPage from "@/pages/PlatformSelectPage";

const MainPage = lazy(() => import("@/pages/MainPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const InstalledSkillsPage = lazy(() => import("@/pages/InstalledSkillsPage"));
const InstallPage = lazy(() => import("@/pages/InstallPage"));

const Fallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

export default function App() {
  const colorMode = useUiStore((s) => s.colorMode);
  const theme = useMemo(
    () => (colorMode === "dark" ? darkTheme : lightTheme),
    [colorMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<PlatformSelectPage />} />
            <Route path="/platform/:platformId" element={<InstalledSkillsPage />} />
            <Route path="/platform/:platformId/install" element={<InstallPage />} />
            <Route path="/platform/:platformId/legacy" element={<MainPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
