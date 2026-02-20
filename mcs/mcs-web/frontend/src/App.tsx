import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useUiStore } from "@/stores/uiStore";
import { lightTheme, darkTheme } from "@/theme";
import PlatformSelectPage from "@/pages/PlatformSelectPage";
import MainPage from "@/pages/MainPage";
import DashboardPage from "@/pages/DashboardPage";

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
        <Routes>
          <Route path="/" element={<PlatformSelectPage />} />
          <Route path="/platform/:platformId" element={<MainPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
