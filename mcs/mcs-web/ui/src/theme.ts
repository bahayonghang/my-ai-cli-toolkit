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
    rosewater: "#FCE7F3",
    flamingo: "#F9A8D4",
    pink: "#EC4899",
    mauve: "#7C3AED",
    red: "#DC2626",
    maroon: "#C2410C",
    peach: "#F59E0B",
    yellow: "#FBBF24",
    green: "#10B981",
    teal: "#14B8A6",
    sky: "#0EA5E9",
    sapphire: "#2563EB",
    blue: "#1D4ED8",
    lavender: "#6366F1",
    text: "#0F172A",
    subtext1: "#334155",
    subtext0: "#475569",
    overlay2: "#64748B",
    overlay1: "#94A3B8",
    overlay0: "#CBD5E1",
    surface2: "#D7E3F4",
    surface1: "#E2E8F0",
    surface0: "#EEF2FF",
    base: "#F8FAFC",
    mantle: "#FFFFFF",
    crust: "#E2E8F0",
  },
  dark: {
    rosewater: "#FBCFE8",
    flamingo: "#F472B6",
    pink: "#F472B6",
    mauve: "#A78BFA",
    red: "#F87171",
    maroon: "#FB923C",
    peach: "#FBBF24",
    yellow: "#FDE68A",
    green: "#34D399",
    teal: "#2DD4BF",
    sky: "#38BDF8",
    sapphire: "#60A5FA",
    blue: "#3B82F6",
    lavender: "#818CF8",
    text: "#E2E8F0",
    subtext1: "#CBD5E1",
    subtext0: "#94A3B8",
    overlay2: "#64748B",
    overlay1: "#475569",
    overlay0: "#334155",
    surface2: "#334155",
    surface1: "#1E293B",
    surface0: "#111827",
    base: "#0B1120",
    mantle: "#111827",
    crust: "#020617",
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
const fastDuration = "160ms";
const duration = "220ms";
const slowDuration = "280ms";

function buildTheme(mode: Mode) {
  const tone = tokens[mode];
  const palette = catppuccin[mode];

  const shared: ThemeOptions = {
    typography: {
      fontFamily: '"Noto Sans SC", "Plus Jakarta Sans", sans-serif',
      h1: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      h6: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      button: {
        fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif',
        fontWeight: 700,
      },
      overline: {
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        letterSpacing: "0.08em",
      },
      caption: {
        fontFamily: '"JetBrains Mono", monospace',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: () => `
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

          :root {
            color-scheme: ${mode};
            --mcs-duration-fast: ${fastDuration};
            --mcs-surface: ${tone.surface};
            --mcs-surface-subtle: ${tone.surfaceSubtle};
            --mcs-surface-muted: ${alpha(palette.surface0, mode === "dark" ? 0.42 : 0.3)};
            --mcs-border: ${tone.border};
            --mcs-focus: ${tone.focus};
            --mcs-shadow-sm: ${tone.shadowSm};
            --mcs-shadow-md: ${tone.shadowMd};
            --mcs-toolbar-overlay: ${alpha(palette.mantle, mode === "dark" ? 0.9 : 0.82)};
            --mcs-shell-fill: ${alpha(mode === "dark" ? palette.surface0 : palette.surface1, mode === "dark" ? 0.78 : 0.58)};
            --mcs-shell-fill-strong: ${alpha(mode === "dark" ? palette.surface1 : palette.surface0, mode === "dark" ? 0.92 : 0.74)};
            --mcs-shell-stroke: ${alpha(mode === "dark" ? palette.overlay1 : palette.overlay2, mode === "dark" ? 0.38 : 0.3)};
            --mcs-shell-stroke-strong: ${alpha(mode === "dark" ? palette.lavender : palette.sapphire, mode === "dark" ? 0.34 : 0.26)};
            --mcs-shell-divider: ${alpha(mode === "dark" ? palette.overlay0 : palette.overlay1, mode === "dark" ? 0.24 : 0.18)};
            --mcs-shell-highlight: ${alpha(mode === "dark" ? palette.rosewater : "#ffffff", mode === "dark" ? 0.12 : 0.3)};
            --mcs-shell-shadow: ${
              mode === "dark"
                ? `0 14px 36px ${alpha(palette.crust, 0.26)}`
                : `0 12px 32px ${alpha(palette.surface2, 0.14)}`
            };
            --mcs-shell-shadow-strong: ${
              mode === "dark"
                ? `0 18px 44px ${alpha(palette.crust, 0.34)}`
                : `0 16px 40px ${alpha(palette.surface2, 0.18)}`
            };
            --mcs-entry-accent: ${palette.sapphire};
            --mcs-entry-accent-strong: ${mode === "dark" ? palette.lavender : palette.blue};
            --mcs-entry-accent-soft: ${alpha(mode === "dark" ? palette.lavender : palette.sapphire, mode === "dark" ? 0.22 : 0.16)};
            --mcs-entry-band: ${alpha(mode === "dark" ? palette.surface0 : palette.rosewater, mode === "dark" ? 0.24 : 0.16)};
            --mcs-entry-band-strong: ${alpha(mode === "dark" ? palette.surface1 : palette.surface1, mode === "dark" ? 0.52 : 0.34)};
            --mcs-entry-surface: ${alpha(palette.mantle, mode === "dark" ? 0.84 : 0.9)};
            --mcs-entry-surface-strong: ${alpha(mode === "dark" ? palette.surface0 : palette.surface1, mode === "dark" ? 0.92 : 0.74)};
            --mcs-entry-surface-muted: ${alpha(mode === "dark" ? palette.surface0 : palette.surface1, mode === "dark" ? 0.76 : 0.62)};
            --mcs-entry-outline: ${alpha(mode === "dark" ? palette.lavender : palette.sapphire, mode === "dark" ? 0.28 : 0.2)};
            --mcs-entry-outline-strong: ${alpha(mode === "dark" ? palette.blue : palette.lavender, mode === "dark" ? 0.36 : 0.28)};
            --mcs-entry-shadow: ${
              mode === "dark"
                ? `0 26px 72px ${alpha(palette.crust, 0.42)}`
                : `0 22px 56px ${alpha(palette.surface2, 0.18)}`
            };
            --mcs-entry-grid: ${alpha(mode === "dark" ? palette.overlay1 : palette.overlay2, mode === "dark" ? 0.16 : 0.14)};
            --mcs-entry-frame: ${alpha(mode === "dark" ? palette.surface0 : palette.surface1, mode === "dark" ? 0.18 : 0.14)};
            --mcs-entry-muted: ${alpha(palette.text, mode === "dark" ? 0.76 : 0.72)};
            --mcs-entry-ink: ${palette.text};
            --mcs-entry-panel-fill: ${alpha(palette.mantle, mode === "dark" ? 0.84 : 0.9)};
            --mcs-entry-panel-fill-strong: ${alpha(palette.surface0, mode === "dark" ? 0.88 : 0.74)};
            --mcs-entry-panel-fill-emphasis: ${alpha(mode === "dark" ? palette.surface1 : palette.surface0, mode === "dark" ? 0.92 : 0.84)};
            --mcs-entry-panel-grid: ${alpha(mode === "dark" ? palette.overlay0 : palette.overlay1, mode === "dark" ? 0.12 : 0.1)};
            --mcs-entry-panel-shadow: ${
              mode === "dark"
                ? `0 26px 68px ${alpha(palette.crust, 0.42)}`
                : `0 24px 58px ${alpha(palette.surface2, 0.22)}`
            };
            --mcs-monitor-surface: ${alpha(palette.mantle, mode === "dark" ? 0.8 : 0.8)};
            --mcs-monitor-surface-strong: ${alpha(palette.surface0, mode === "dark" ? 0.84 : 0.62)};
            --mcs-monitor-surface-muted: ${alpha(palette.surface0, mode === "dark" ? 0.7 : 0.46)};
            --mcs-monitor-surface-subtle: ${alpha(palette.surface0, mode === "dark" ? 0.54 : 0.3)};
            --mcs-monitor-outline: ${alpha(palette.overlay1, mode === "dark" ? 0.36 : 0.5)};
            --mcs-monitor-outline-strong: ${alpha(palette.lavender, mode === "dark" ? 0.42 : 0.34)};
            --mcs-monitor-accent: ${palette.blue};
            --mcs-monitor-accent-strong: ${mode === "dark" ? palette.lavender : palette.sapphire};
            --mcs-monitor-accent-soft: ${alpha(palette.blue, mode === "dark" ? 0.2 : 0.14)};
            --mcs-monitor-warm-soft: ${alpha(palette.peach, mode === "dark" ? 0.2 : 0.16)};
            --mcs-monitor-warm-strong: ${mode === "dark" ? palette.peach : palette.yellow};
            --mcs-monitor-progress-track: ${alpha(palette.overlay0, mode === "dark" ? 0.28 : 0.22)};
            --mcs-monitor-muted: ${alpha(palette.text, mode === "dark" ? 0.76 : 0.72)};
            --mcs-monitor-ink: ${palette.text};
            --mcs-monitor-grid: ${alpha(palette.overlay0, mode === "dark" ? 0.12 : 0.16)};
            --mcs-monitor-panel-fill: ${alpha(palette.mantle, mode === "dark" ? 0.82 : 0.86)};
            --mcs-monitor-panel-fill-strong: ${alpha(palette.surface0, mode === "dark" ? 0.86 : 0.68)};
            --mcs-monitor-panel-fill-emphasis: ${alpha(mode === "dark" ? palette.surface1 : palette.surface0, mode === "dark" ? 0.9 : 0.8)};
            --mcs-monitor-panel-grid: ${alpha(mode === "dark" ? palette.overlay0 : palette.overlay1, mode === "dark" ? 0.12 : 0.1)};
            --mcs-monitor-panel-shadow: ${
              mode === "dark"
                ? `0 24px 64px ${alpha(palette.crust, 0.4)}`
                : `0 22px 54px ${alpha(palette.surface2, 0.2)}`
            };
            --mcs-page-edge: ${alpha(mode === "dark" ? palette.crust : palette.base, mode === "dark" ? 0.94 : 0.9)};
            --mcs-page-rail: ${alpha(palette.mantle, mode === "dark" ? 0.82 : 0.88)};
            --mcs-workbench-surface: ${alpha(palette.mantle, mode === "dark" ? 0.9 : 0.94)};
            --mcs-workbench-surface-strong: ${alpha(palette.surface0, mode === "dark" ? 0.9 : 0.8)};
            --mcs-workbench-surface-muted: ${alpha(palette.surface0, mode === "dark" ? 0.76 : 0.58)};
            --mcs-workbench-surface-subtle: ${alpha(palette.surface0, mode === "dark" ? 0.62 : 0.4)};
            --mcs-workbench-outline: ${alpha(palette.overlay1, mode === "dark" ? 0.3 : 0.28)};
            --mcs-workbench-outline-strong: ${alpha(mode === "dark" ? palette.teal : palette.sapphire, mode === "dark" ? 0.34 : 0.26)};
            --mcs-workbench-accent: ${mode === "dark" ? palette.teal : palette.sapphire};
            --mcs-workbench-accent-strong: ${mode === "dark" ? palette.sky : palette.blue};
            --mcs-workbench-accent-soft: ${alpha(mode === "dark" ? palette.teal : palette.sapphire, mode === "dark" ? 0.18 : 0.12)};
            --mcs-workbench-warm-soft: ${alpha(palette.peach, mode === "dark" ? 0.18 : 0.14)};
            --mcs-workbench-warm-strong: ${mode === "dark" ? palette.peach : palette.yellow};
            --mcs-workbench-progress-track: ${alpha(palette.overlay0, mode === "dark" ? 0.24 : 0.18)};
            --mcs-workbench-muted: ${alpha(palette.text, mode === "dark" ? 0.74 : 0.68)};
            --mcs-workbench-ink: ${palette.text};
            --mcs-workbench-grid: ${alpha(palette.overlay0, mode === "dark" ? 0.08 : 0.09)};
            --mcs-workbench-panel-fill: ${alpha(palette.mantle, mode === "dark" ? 0.9 : 0.94)};
            --mcs-workbench-panel-fill-strong: ${alpha(palette.surface0, mode === "dark" ? 0.92 : 0.82)};
            --mcs-workbench-panel-fill-emphasis: ${alpha(mode === "dark" ? palette.surface1 : palette.surface0, mode === "dark" ? 0.94 : 0.88)};
            --mcs-workbench-panel-grid: ${alpha(mode === "dark" ? palette.overlay0 : palette.overlay1, mode === "dark" ? 0.08 : 0.08)};
            --mcs-workbench-panel-shadow: ${
              mode === "dark"
                ? `0 18px 44px ${alpha(palette.crust, 0.32)}`
                : `0 16px 36px ${alpha(palette.surface2, 0.14)}`
            };
            --mcs-summary-tile-fill: ${alpha(palette.mantle, mode === "dark" ? 0.8 : 0.84)};
            --mcs-summary-tile-fill-strong: ${alpha(mode === "dark" ? palette.surface0 : palette.surface1, mode === "dark" ? 0.86 : 0.72)};
            --mcs-summary-tile-stroke: ${alpha(mode === "dark" ? palette.teal : palette.sapphire, mode === "dark" ? 0.22 : 0.18)};
            --mcs-summary-tile-shadow: ${
              mode === "dark"
                ? `0 18px 42px ${alpha(palette.crust, 0.32)}`
                : `0 14px 34px ${alpha(palette.surface2, 0.14)}`
            };
            --mcs-diff-add-bg: ${alpha(palette.green, mode === "dark" ? 0.18 : 0.12)};
            --mcs-diff-remove-bg: ${alpha(palette.red, mode === "dark" ? 0.18 : 0.12)};
            --mcs-warning-progress: ${alpha(palette.peach, mode === "dark" ? 0.22 : 0.16)};
            --mcs-warning-progress-strong: ${alpha(palette.peach, mode === "dark" ? 0.78 : 0.72)};
            --mcs-success-surface: ${alpha(palette.green, mode === "dark" ? 0.16 : 0.1)};
            --mcs-success-border: ${alpha(palette.green, mode === "dark" ? 0.32 : 0.22)};
            --mcs-error-surface: ${alpha(palette.red, mode === "dark" ? 0.18 : 0.1)};
            --mcs-error-border: ${alpha(palette.red, mode === "dark" ? 0.34 : 0.22)};
            --mcs-error-text: ${mode === "dark" ? palette.rosewater : palette.maroon};
            --mcs-glass-fill: ${alpha(palette.mantle, mode === "dark" ? 0.36 : 0.44)};
            --mcs-glass-fill-strong: ${alpha(palette.surface0, mode === "dark" ? 0.42 : 0.34)};
            --mcs-glass-stroke: ${alpha(palette.overlay1, mode === "dark" ? 0.18 : 0.26)};
            --mcs-glass-stroke-strong: ${alpha(palette.lavender, mode === "dark" ? 0.34 : 0.28)};
            --mcs-glass-highlight: var(--mcs-shell-highlight);
            --mcs-glass-shadow: var(--mcs-shell-shadow);
            --mcs-glass-shadow-hover: var(--mcs-shell-shadow-strong);
            --mcs-glass-blur: ${mode === "dark" ? "14px" : "10px"};
            --mcs-panel-fill: var(--mcs-workbench-panel-fill);
            --mcs-panel-fill-strong: var(--mcs-workbench-panel-fill-strong);
            --mcs-panel-fill-emphasis: var(--mcs-workbench-panel-fill-emphasis);
            --mcs-panel-stroke: var(--mcs-workbench-outline);
            --mcs-panel-stroke-soft: ${alpha(mode === "dark" ? palette.overlay0 : palette.overlay1, mode === "dark" ? 0.14 : 0.1)};
            --mcs-panel-accent: var(--mcs-workbench-accent-strong);
            --mcs-panel-accent-soft: var(--mcs-workbench-accent-soft);
            --mcs-panel-highlight: var(--mcs-shell-highlight);
            --mcs-panel-grid: var(--mcs-workbench-panel-grid);
            --mcs-blob-blue: ${alpha(palette.blue, mode === "dark" ? 0.18 : 0.14)};
            --mcs-blob-mauve: ${alpha(palette.mauve, mode === "dark" ? 0.16 : 0.12)};
            --mcs-blob-rosewater: ${alpha(palette.rosewater, mode === "dark" ? 0.15 : 0.13)};
            --mcs-blob-teal: ${alpha(palette.teal, mode === "dark" ? 0.14 : 0.1)};
            --mcs-panel-shadow: var(--mcs-workbench-panel-shadow);
            --mcs-control-fill: var(--mcs-shell-fill);
            --mcs-control-fill-strong: var(--mcs-shell-fill-strong);
            --mcs-control-stroke: var(--mcs-shell-stroke);
            --mcs-control-stroke-strong: var(--mcs-shell-stroke-strong);
            --mcs-control-divider: var(--mcs-shell-divider);
            --mcs-hero-accent: var(--mcs-entry-accent-soft);
            --mcs-hero-band: var(--mcs-entry-band);
            --mcs-hero-band-strong: var(--mcs-entry-band-strong);
            --mcs-hero-surface: var(--mcs-entry-surface);
            --mcs-hero-surface-strong: var(--mcs-entry-surface-strong);
            --mcs-hero-outline: var(--mcs-entry-outline);
            --mcs-hero-shadow: var(--mcs-entry-shadow);
            --mcs-hero-grid: var(--mcs-entry-grid);
            --mcs-hero-frame: var(--mcs-entry-frame);
            --mcs-dashboard-surface: var(--mcs-monitor-surface);
            --mcs-dashboard-surface-strong: var(--mcs-monitor-surface-strong);
            --mcs-dashboard-surface-muted: var(--mcs-monitor-surface-muted);
            --mcs-dashboard-surface-subtle: var(--mcs-monitor-surface-subtle);
            --mcs-dashboard-outline: var(--mcs-monitor-outline);
            --mcs-dashboard-outline-strong: var(--mcs-monitor-outline-strong);
            --mcs-dashboard-accent: var(--mcs-monitor-accent);
            --mcs-dashboard-accent-strong: var(--mcs-monitor-accent-strong);
            --mcs-dashboard-accent-soft: var(--mcs-monitor-accent-soft);
            --mcs-dashboard-warm-soft: var(--mcs-monitor-warm-soft);
            --mcs-dashboard-warm-strong: var(--mcs-monitor-warm-strong);
            --mcs-dashboard-progress-track: var(--mcs-monitor-progress-track);
            --mcs-dashboard-muted: var(--mcs-monitor-muted);
            --mcs-dashboard-ink: var(--mcs-monitor-ink);
            --mcs-dashboard-grid: var(--mcs-monitor-grid);
            --mcs-ease: ${easing};
            --mcs-duration: ${duration};
            --mcs-duration-slow: ${slowDuration};
          }

          @keyframes mcs-shell-rise {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
              radial-gradient(circle at 0% 0%, ${alpha(palette.sky, mode === "dark" ? 0.18 : 0.14)} 0, transparent 26%),
              radial-gradient(circle at 100% 0%, ${alpha(palette.mauve, mode === "dark" ? 0.18 : 0.12)} 0, transparent 28%),
              radial-gradient(circle at 50% 100%, ${alpha(palette.teal, mode === "dark" ? 0.14 : 0.08)} 0, transparent 32%),
              linear-gradient(180deg, ${tone.background} 0%, ${tone.background} 100%);
            color: ${tone.textPrimary};
            font-family: "Noto Sans SC", "Plus Jakarta Sans", sans-serif;
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
            borderRadius: 12,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            boxShadow: "none",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            minWidth: 44,
            minHeight: 44,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
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
            backgroundColor: "var(--mcs-panel-fill)",
            border: "1px solid var(--mcs-panel-stroke)",
            boxShadow:
              "var(--mcs-shadow-sm), inset 0 1px 0 0 var(--mcs-panel-highlight)",
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&::before": {
              content: '\"\"',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, var(--mcs-panel-highlight) 0%, transparent 26%), linear-gradient(90deg, var(--mcs-panel-grid) 0, var(--mcs-panel-grid) 1px, transparent 1px, transparent 88px)",
              backgroundSize: "100% 100%, 88px 100%",
              pointerEvents: "none",
              opacity: 0.64,
            },
            "&::after": {
              content: '\"\"',
              position: "absolute",
              insetInline: 18,
              top: 0,
              height: 2,
              background:
                "linear-gradient(90deg, transparent 0%, var(--mcs-panel-accent-soft) 24%, var(--mcs-panel-accent) 50%, var(--mcs-panel-accent-soft) 76%, transparent 100%)",
              opacity: 0.44,
              pointerEvents: "none",
            },
            "& > *": {
              position: "relative",
              zIndex: 1,
            },
            "&:hover": {
              backgroundColor: "var(--mcs-panel-fill-strong)",
              borderColor: "var(--mcs-glass-stroke)",
              boxShadow:
                "var(--mcs-glass-shadow), inset 0 1px 0 0 var(--mcs-panel-highlight)",
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
            backgroundColor: alpha(
              palette.crust,
              mode === "dark" ? 0.64 : 0.28,
            ),
            backdropFilter: "none",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            margin: 0,
            borderRadius: 10,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "&:hover": {
              backgroundColor: alpha(
                palette.blue,
                mode === "dark" ? 0.12 : 0.08,
              ),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(
                palette.blue,
                mode === "dark" ? 0.18 : 0.12,
              ),
            },
            "&.Mui-selected:hover": {
              backgroundColor: alpha(
                palette.blue,
                mode === "dark" ? 0.22 : 0.16,
              ),
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${duration} ${easing}`,
            "&.MuiTableRow-hover:hover": {
              backgroundColor: alpha(
                palette.blue,
                mode === "dark" ? 0.08 : 0.05,
              ),
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
