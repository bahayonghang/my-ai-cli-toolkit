import { alpha, createTheme, type ThemeOptions } from "@mui/material/styles";

type Mode = "light" | "dark";

interface CatppuccinPalette {
  rosewater: string;
  flamingo: string;
  pink: string;
  mauve: string;
  red: string;
  maroon: string;
  peach: string;
  yellow: string;
  green: string;
  teal: string;
  sky: string;
  sapphire: string;
  blue: string;
  lavender: string;
  text: string;
  subtext1: string;
  subtext0: string;
  overlay2: string;
  overlay1: string;
  overlay0: string;
  surface2: string;
  surface1: string;
  surface0: string;
  base: string;
  mantle: string;
  crust: string;
}

const catppuccin: Record<Mode, CatppuccinPalette> = {
  light: {
    rosewater: "#dc8a78",
    flamingo: "#dd7878",
    pink: "#ea76cb",
    mauve: "#8839ef",
    red: "#d20f39",
    maroon: "#e64553",
    peach: "#fe640b",
    yellow: "#df8e1d",
    green: "#40a02b",
    teal: "#179299",
    sky: "#04a5e5",
    sapphire: "#209fb5",
    blue: "#1e66f5",
    lavender: "#7287fd",
    text: "#4c4f69",
    subtext1: "#5c5f77",
    subtext0: "#6c6f85",
    overlay2: "#7c7f93",
    overlay1: "#8c8fa1",
    overlay0: "#9ca0b0",
    surface2: "#acb0be",
    surface1: "#bcc0cc",
    surface0: "#ccd0da",
    base: "#eff1f5",
    mantle: "#e6e9ef",
    crust: "#dce0e8",
  },
  dark: {
    rosewater: "#f5e0dc",
    flamingo: "#f2cdcd",
    pink: "#f5c2e7",
    mauve: "#cba6f7",
    red: "#f38ba8",
    maroon: "#eba0ac",
    peach: "#fab387",
    yellow: "#f9e2af",
    green: "#a6e3a1",
    teal: "#94e2d5",
    sky: "#89dceb",
    sapphire: "#74c7ec",
    blue: "#89b4fa",
    lavender: "#b4befe",
    text: "#cdd6f4",
    subtext1: "#bac2de",
    subtext0: "#a6adc8",
    overlay2: "#9399b2",
    overlay1: "#7f849c",
    overlay0: "#6c7086",
    surface2: "#585b70",
    surface1: "#45475a",
    surface0: "#313244",
    base: "#1e1e2e",
    mantle: "#181825",
    crust: "#11111b",
  },
} as const;

const tokens = {
  light: {
    primary: catppuccin.light.blue,
    secondary: catppuccin.light.lavender,
    background: catppuccin.light.base,
    paper: catppuccin.light.mantle,
    surface: catppuccin.light.mantle,
    surfaceSubtle: alpha(catppuccin.light.surface0, 0.46),
    border: catppuccin.light.surface1,
    textPrimary: catppuccin.light.text,
    textSecondary: catppuccin.light.subtext1,
    focus: catppuccin.light.lavender,
    success: catppuccin.light.green,
    warning: catppuccin.light.peach,
    error: catppuccin.light.red,
    selection: alpha(catppuccin.light.blue, 0.22),
    shadowSm: `0 12px 32px ${alpha(catppuccin.light.surface2, 0.18)}`,
    shadowMd: `0 24px 60px ${alpha(catppuccin.light.surface2, 0.22)}`,
  },
  dark: {
    primary: catppuccin.dark.blue,
    secondary: catppuccin.dark.lavender,
    background: catppuccin.dark.base,
    paper: catppuccin.dark.mantle,
    surface: catppuccin.dark.mantle,
    surfaceSubtle: alpha(catppuccin.dark.surface0, 0.72),
    border: catppuccin.dark.surface1,
    textPrimary: catppuccin.dark.text,
    textSecondary: catppuccin.dark.subtext1,
    focus: catppuccin.dark.lavender,
    success: catppuccin.dark.green,
    warning: catppuccin.dark.peach,
    error: catppuccin.dark.red,
    selection: alpha(catppuccin.dark.blue, 0.24),
    shadowSm: `0 14px 36px ${alpha(catppuccin.dark.crust, 0.38)}`,
    shadowMd: `0 26px 72px ${alpha(catppuccin.dark.crust, 0.5)}`,
  },
} as const;

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const duration = "180ms";

function buildTheme(mode: Mode) {
  const tone = tokens[mode];
  const palette = catppuccin[mode];

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
            --mcs-surface-muted: ${alpha(palette.surface0, mode === "dark" ? 0.42 : 0.3)};
            --mcs-border: ${tone.border};
            --mcs-focus: ${tone.focus};
            --mcs-shadow-sm: ${tone.shadowSm};
            --mcs-shadow-md: ${tone.shadowMd};
            --mcs-toolbar-overlay: ${alpha(palette.mantle, mode === "dark" ? 0.92 : 0.84)};
            --mcs-hero-accent: ${alpha(palette.lavender, mode === "dark" ? 0.14 : 0.12)};
            --mcs-dashboard-surface: ${alpha(palette.mantle, mode === "dark" ? 0.78 : 0.76)};
            --mcs-dashboard-surface-strong: ${alpha(palette.surface0, mode === "dark" ? 0.76 : 0.56)};
            --mcs-dashboard-surface-muted: ${alpha(palette.surface0, mode === "dark" ? 0.66 : 0.42)};
            --mcs-dashboard-outline: ${alpha(palette.overlay1, mode === "dark" ? 0.34 : 0.5)};
            --mcs-dashboard-outline-strong: ${alpha(palette.lavender, mode === "dark" ? 0.4 : 0.34)};
            --mcs-dashboard-accent: ${palette.blue};
            --mcs-dashboard-accent-strong: ${mode === "dark" ? palette.lavender : palette.sapphire};
            --mcs-dashboard-accent-soft: ${alpha(palette.blue, mode === "dark" ? 0.18 : 0.14)};
            --mcs-dashboard-warm-soft: ${alpha(palette.peach, mode === "dark" ? 0.18 : 0.16)};
            --mcs-dashboard-warm-strong: ${mode === "dark" ? palette.peach : palette.yellow};
            --mcs-dashboard-progress-track: ${alpha(palette.overlay0, mode === "dark" ? 0.28 : 0.22)};
            --mcs-dashboard-muted: ${alpha(palette.text, mode === "dark" ? 0.76 : 0.72)};
            --mcs-dashboard-ink: ${palette.text};
            --mcs-dashboard-grid: ${alpha(palette.overlay0, mode === "dark" ? 0.12 : 0.16)};
            --mcs-diff-add-bg: ${alpha(palette.green, mode === "dark" ? 0.18 : 0.12)};
            --mcs-diff-remove-bg: ${alpha(palette.red, mode === "dark" ? 0.18 : 0.12)};
            --mcs-warning-progress: ${alpha(palette.peach, mode === "dark" ? 0.22 : 0.16)};
            --mcs-warning-progress-strong: ${alpha(palette.peach, mode === "dark" ? 0.78 : 0.72)};
            --mcs-success-surface: ${alpha(palette.green, mode === "dark" ? 0.16 : 0.1)};
            --mcs-success-border: ${alpha(palette.green, mode === "dark" ? 0.32 : 0.22)};
            --mcs-error-surface: ${alpha(palette.red, mode === "dark" ? 0.18 : 0.1)};
            --mcs-error-border: ${alpha(palette.red, mode === "dark" ? 0.34 : 0.22)};
            --mcs-error-text: ${mode === "dark" ? palette.rosewater : palette.maroon};
            --mcs-glass-fill: ${alpha(palette.mantle, mode === "dark" ? 0.48 : 0.56)};
            --mcs-glass-fill-strong: ${alpha(palette.surface0, mode === "dark" ? 0.52 : 0.44)};
            --mcs-glass-stroke: ${alpha(palette.overlay1, mode === "dark" ? 0.24 : 0.34)};
            --mcs-glass-stroke-strong: ${alpha(palette.lavender, mode === "dark" ? 0.50 : 0.40)};
            --mcs-glass-highlight: ${alpha(mode === "dark" ? palette.rosewater : "#ffffff", mode === "dark" ? 0.20 : 0.52)};
            --mcs-glass-shadow: ${mode === "dark"
              ? `0 18px 48px ${alpha(palette.crust, 0.34)}`
              : `0 16px 44px ${alpha(palette.surface2, 0.2)}`};
            --mcs-glass-shadow-hover: ${mode === "dark"
              ? `0 24px 58px ${alpha(palette.crust, 0.42)}`
              : `0 22px 54px ${alpha(palette.surface2, 0.24)}`};
            --mcs-glass-blur: ${mode === "dark" ? "22px" : "18px"};
            --mcs-panel-fill: ${alpha(palette.mantle, mode === "dark" ? 0.46 : 0.54)};
            --mcs-panel-fill-strong: ${alpha(palette.surface0, mode === "dark" ? 0.50 : 0.42)};
            --mcs-blob-blue: ${alpha(palette.blue, mode === "dark" ? 0.18 : 0.14)};
            --mcs-blob-mauve: ${alpha(palette.mauve, mode === "dark" ? 0.16 : 0.12)};
            --mcs-blob-rosewater: ${alpha(palette.rosewater, mode === "dark" ? 0.15 : 0.13)};
            --mcs-blob-teal: ${alpha(palette.teal, mode === "dark" ? 0.14 : 0.10)};
            --mcs-panel-shadow: ${mode === "dark"
              ? `0 26px 68px ${alpha(palette.crust, 0.42)}`
              : `0 24px 58px ${alpha(palette.surface2, 0.22)}`};
            --mcs-ease: ${easing};
            --mcs-duration: ${duration};
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              transform: none !important;
            }
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
              radial-gradient(circle at 12% 0%, ${alpha(palette.rosewater, mode === "dark" ? 0.14 : 0.16)} 0, transparent 28%),
              radial-gradient(circle at 85% 8%, ${alpha(palette.blue, mode === "dark" ? 0.14 : 0.12)} 0, transparent 30%),
              radial-gradient(circle at 50% 100%, ${alpha(palette.yellow, mode === "dark" ? 0.1 : 0.08)} 0, transparent 34%),
              linear-gradient(180deg, ${tone.background} 0%, ${tone.background} 100%);
            color: ${tone.textPrimary};
            scrollbar-width: thin;
            scrollbar-color: ${alpha(palette.overlay1, 0.48)} transparent;
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
            background-color: ${alpha(palette.overlay1, 0.48)};
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
              `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
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
              `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
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
            backgroundColor: "var(--mcs-glass-fill)",
            border: "1px solid var(--mcs-glass-stroke)",
            boxShadow:
              "var(--mcs-glass-shadow), inset 0 1px 0 0 var(--mcs-glass-highlight)",
            backdropFilter: "blur(var(--mcs-glass-blur)) saturate(170%)",
            WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(170%)",
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
            willChange: "transform, box-shadow",
            transition:
              `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderTop: "1px solid var(--mcs-glass-highlight)",
              background:
                "linear-gradient(180deg, var(--mcs-glass-highlight) 0%, transparent 38%)",
              pointerEvents: "none",
            },
            "& > *": {
              position: "relative",
              zIndex: 1,
            },
            "&:hover": {
              backgroundColor: "var(--mcs-glass-fill-strong)",
              borderColor: "var(--mcs-glass-stroke-strong)",
              boxShadow:
                "var(--mcs-glass-shadow-hover), inset 0 1px 0 0 var(--mcs-glass-highlight)",
              transform: "translateY(-1px)",
            },
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
            boxShadow: "var(--mcs-shadow-sm)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--mcs-toolbar-overlay)",
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
            backgroundColor: alpha(palette.crust, mode === "dark" ? 0.64 : 0.28),
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
              `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "&:hover": {
              backgroundColor: alpha(palette.blue, mode === "dark" ? 0.12 : 0.08),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(palette.blue, mode === "dark" ? 0.18 : 0.12),
            },
            "&.Mui-selected:hover": {
              backgroundColor: alpha(palette.blue, mode === "dark" ? 0.22 : 0.16),
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${duration} ${easing}`,
            "&.MuiTableRow-hover:hover": {
              backgroundColor: alpha(palette.blue, mode === "dark" ? 0.08 : 0.05),
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
