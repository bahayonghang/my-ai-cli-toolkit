import { createTheme, type ThemeOptions } from "@mui/material/styles";

const shared: ThemeOptions = {
  typography: {
    fontFamily: '"JetBrains Mono", "Noto Sans SC", sans-serif',
    h1: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif' },
    h2: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif' },
    h3: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif' },
    h4: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif' },
    h5: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif' },
    h6: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => `
        body {
          scrollbar-width: thin;
          scrollbar-color: ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2) transparent" : "rgba(0, 0, 0, 0.2) transparent"};
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
        }
      `,
    },
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
        root: ({ theme }) => ({
          borderRadius: 20, // 稍微收紧圆角以适应小体积卡片
          backgroundImage: "none",
          backgroundColor: theme.palette.mode === "dark" ? "rgba(20, 20, 25, 0.45)" : "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: theme.palette.mode === "dark"
            ? "1px solid rgba(255, 255, 255, 0.08)"
            : "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 30px rgba(0, 0, 0, 0.4)"
            : "0 4px 30px rgba(0, 0, 0, 0.05)",
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.mode === "dark" ? "rgba(20, 20, 25, 0.4)" : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === "dark" ? "rgba(5, 5, 5, 0.6)" : "rgba(248, 249, 250, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "none",
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",
          "&.MuiTableRow-hover:hover": {
            backgroundColor: "rgba(139, 92, 246, 0.08)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(139, 92, 246, 0.08)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          margin: "4px 8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.1)",
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.mode === "dark" ? "rgba(167, 139, 250, 0.15)" : "rgba(139, 92, 246, 0.15)",
            "&:hover": {
              backgroundColor: theme.palette.mode === "dark" ? "rgba(167, 139, 250, 0.25)" : "rgba(139, 92, 246, 0.25)",
            },
          },
        }),
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
    primary: { main: "#8B5CF6" }, // Elegant Violet
    secondary: { main: "#3B82F6" }, // Bright Blue
    background: {
      default: "#F8F9FA",
      paper: "rgba(255, 255, 255, 0.8)",
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
    primary: { main: "#A78BFA" }, // Glowing Violet
    secondary: { main: "#60A5FA" }, // Glowing Blue
    background: {
      default: "#09090b", // Deepest black, a bit more neutral
      paper: "rgba(20, 20, 25, 0.4)", // Translucent dark
    },
    success: { main: "#66BB6A" },
    warning: { main: "#FFA726" },
    error: { main: "#EF5350" },
  },
});

