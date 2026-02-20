import { createTheme, type ThemeOptions } from "@mui/material/styles";

const shared: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
    primary: { main: "#6750A4" },
    secondary: { main: "#625B71" },
    background: {
      default: "#FEF7FF",
      paper: "#FFFFFF",
    },
    success: { main: "#4CAF50" },
    warning: { main: "#FF9800" },
    error: { main: "#F44336" },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    primary: { main: "#D0BCFF" },
    secondary: { main: "#CCC2DC" },
    background: {
      default: "#141218",
      paper: "#1D1B20",
    },
    success: { main: "#66BB6A" },
    warning: { main: "#FFA726" },
    error: { main: "#EF5350" },
  },
});
