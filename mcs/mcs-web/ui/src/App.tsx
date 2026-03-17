import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/stores/uiStore";
import { lightTheme, darkTheme } from "@/theme";
import PlatformSelectPage from "@/pages/PlatformSelectPage";

const MainPage = lazy(() => import("@/pages/MainPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const InstalledSkillsPage = lazy(() => import("@/pages/InstalledSkillsPage"));
const InstallPage = lazy(() => import("@/pages/InstallPage"));
const NpxSkillsPage = lazy(() => import("@/pages/NpxSkillsPage"));
const UnifiedInstallHubPage = lazy(() => import("@/pages/UnifiedInstallHubPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function Fallback() {
  const { t } = useI18n();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      minHeight="100vh"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CircularProgress />
      <Box component="span" sx={{ color: "text.secondary", typography: "body2" }}>
        {t("common.loading")}
      </Box>
    </Box>
  );
}

export default function App() {
  const colorMode = useUiStore((s) => s.colorMode);
  const theme = useMemo(
    () => (colorMode === "dark" ? darkTheme : lightTheme),
    [colorMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<PlatformSelectPage />} />
              <Route path="/platform/:platformId" element={<InstalledSkillsPage />} />
              <Route path="/platform/:platformId/install" element={<InstallPage />} />
              <Route path="/platform/:platformId/npx-skills" element={<NpxSkillsPage />} />
              <Route path="/platform/:platformId/legacy" element={<MainPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/install-hub" element={<UnifiedInstallHubPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
