import { createTheme, type ThemeOptions } from "@mui/material/styles";

type Mode = "light" | "dark";

const tokens = {
  light: {
    primary: "#165d66",
    secondary: "#4d6c87",
    background: "#f4f6f8",
    paper: "#ffffff",
    surface: "#ffffff",
    surfaceSubtle: "#edf1f4",
    border: "#d8e0e6",
    textPrimary: "#16202a",
    textSecondary: "#55636f",
    focus: "#2b7a85",
    success: "#2f7d57",
    warning: "#a86b1f",
    error: "#b2534a",
    selection: "rgba(22, 93, 102, 0.16)",
    shadowSm: "0 1px 2px rgba(15, 23, 42, 0.05)",
    shadowMd: "0 12px 28px rgba(15, 23, 42, 0.08)",
  },
  dark: {
    primary: "#7dbab2",
    secondary: "#8fa9c2",
    background: "#11181d",
    paper: "#182127",
    surface: "#182127",
    surfaceSubtle: "#202b33",
    border: "#30404a",
    textPrimary: "#e8eef2",
    textSecondary: "#a8b6c0",
    focus: "#9cd4cb",
    success: "#74c494",
    warning: "#d0a969",
    error: "#dc8c84",
    selection: "rgba(125, 186, 178, 0.22)",
    shadowSm: "0 1px 2px rgba(0, 0, 0, 0.24)",
    shadowMd: "0 16px 36px rgba(0, 0, 0, 0.3)",
  },
} as const;

function buildTheme(mode: Mode) {
  const tone = tokens[mode];

  const shared: ThemeOptions = {
    typography: {
      fontFamily: '"Noto Sans SC", sans-serif',
      h1: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif', fontWeight: 700 },
      h2: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif', fontWeight: 700 },
      h6: { fontFamily: '"Outfit", "Noto Sans SC", sans-serif', fontWeight: 700 },
      button: { fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: "0.08em" },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: () => `
          :root {
            color-scheme: ${mode};
            --mcs-surface: ${tone.surface};
            --mcs-surface-subtle: ${tone.surfaceSubtle};
            --mcs-border: ${tone.border};
            --mcs-focus: ${tone.focus};
            --mcs-shadow-sm: ${tone.shadowSm};
            --mcs-shadow-md: ${tone.shadowMd};
            --mcs-surface-muted: ${mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)"};
            --mcs-toolbar-overlay: ${mode === "dark" ? "rgba(24, 33, 39, 0.92)" : "rgba(255, 255, 255, 0.94)"};
            --mcs-hero-accent: ${mode === "dark" ? "rgba(125, 186, 178, 0.08)" : "rgba(22, 93, 102, 0.06)"};
            --mcs-diff-add-bg: ${mode === "dark" ? "rgba(116, 196, 148, 0.16)" : "rgba(47, 125, 87, 0.1)"};
            --mcs-diff-remove-bg: ${mode === "dark" ? "rgba(220, 140, 132, 0.16)" : "rgba(178, 83, 74, 0.1)"};
            --mcs-warning-progress: ${mode === "dark" ? "rgba(208, 169, 105, 0.18)" : "rgba(168, 107, 31, 0.14)"};
            --mcs-warning-progress-strong: ${mode === "dark" ? "rgba(208, 169, 105, 0.72)" : "rgba(168, 107, 31, 0.72)"};
            --mcs-error-surface: ${mode === "dark" ? "rgba(220, 140, 132, 0.16)" : "rgba(178, 83, 74, 0.08)"};
            --mcs-error-border: ${mode === "dark" ? "rgba(220, 140, 132, 0.32)" : "rgba(178, 83, 74, 0.22)"};
            --mcs-error-text: ${mode === "dark" ? "#ffd2cd" : "#7e342d"};
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            margin: 0;
            background:
              radial-gradient(circle at top left, ${mode === "dark" ? "rgba(125, 186, 178, 0.08)" : "rgba(22, 93, 102, 0.05)"} 0, transparent 34%),
              linear-gradient(180deg, ${tone.background} 0%, ${tone.background} 100%);
            color: ${tone.textPrimary};
            scrollbar-width: thin;
            scrollbar-color: ${mode === "dark" ? "rgba(168, 182, 192, 0.28) transparent" : "rgba(85, 99, 111, 0.26) transparent"};
          }

          ::selection {
            background: ${tone.selection};
          }

          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background-color: ${mode === "dark" ? "rgba(168, 182, 192, 0.28)" : "rgba(85, 99, 111, 0.26)"};
            border-radius: 999px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          :focus-visible {
            outline: 2px solid var(--mcs-focus);
            outline-offset: 2px;
          }

          .cm-editor.cm-focused {
            outline: 2px solid var(--mcs-focus);
            outline-offset: -2px;
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
            textTransform: "none",
            borderRadius: 10,
            fontWeight: 600,
            boxShadow: "none",
            transition:
              "background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            minWidth: 44,
            minHeight: 44,
            transition:
              "background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
            textTransform: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: "var(--mcs-surface)",
            border: "1px solid var(--mcs-border)",
            boxShadow: "var(--mcs-shadow-sm)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 999,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--mcs-surface)",
            borderRight: "1px solid var(--mcs-border)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor:
              "var(--mcs-toolbar-overlay)",
            color: tone.textPrimary,
            borderBottom: "1px solid var(--mcs-border)",
            boxShadow: "none",
            backdropFilter: "none",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--mcs-surface)",
            border: "1px solid var(--mcs-border)",
            boxShadow: "var(--mcs-shadow-md)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            borderBottom: "1px solid var(--mcs-border)",
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            borderTop: "1px solid var(--mcs-border)",
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "rgba(4, 8, 12, 0.56)" : "rgba(18, 24, 31, 0.24)",
            backdropFilter: "none",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            margin: 0,
            borderRadius: 10,
            transition:
              "background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
            "&:hover": {
              backgroundColor: mode === "dark" ? "rgba(125, 186, 178, 0.08)" : "rgba(22, 93, 102, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor: mode === "dark" ? "rgba(125, 186, 178, 0.14)" : "rgba(22, 93, 102, 0.12)",
            },
            "&.Mui-selected:hover": {
              backgroundColor: mode === "dark" ? "rgba(125, 186, 178, 0.18)" : "rgba(22, 93, 102, 0.16)",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 180ms ease",
            "&.MuiTableRow-hover:hover": {
              backgroundColor: mode === "dark" ? "rgba(125, 186, 178, 0.06)" : "rgba(22, 93, 102, 0.05)",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "1px solid var(--mcs-border)",
          },
          head: {
            fontWeight: 700,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  };

  return createTheme({
    ...shared,
    palette: {
      mode,
      primary: { main: tone.primary },
      secondary: { main: tone.secondary },
      background: {
        default: tone.background,
        paper: tone.paper,
      },
      text: {
        primary: tone.textPrimary,
        secondary: tone.textSecondary,
      },
      divider: tone.border,
      success: { main: tone.success },
      warning: { main: tone.warning },
      error: { main: tone.error },
    },
  });
}

export const lightTheme = buildTheme("light");
export const darkTheme = buildTheme("dark");
