import { alpha, createTheme, type ThemeOptions } from "@mui/material/styles";

type Mode = "light" | "dark";

interface BasePalette {
  accent: string;
  accentStrong: string;
  accentContrast: string;
  warm: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  paper: string;
  panel: string;
  panelStrong: string;
  panelMuted: string;
  panelSubtle: string;
  rail: string;
  edge: string;
  text: string;
  textSecondary: string;
  textSoft: string;
  border: string;
  borderSoft: string;
  borderStrong: string;
  selection: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
}

const palettes: Record<Mode, BasePalette> = {
  light: {
    accent: "#27B3A7",
    accentStrong: "#1F8E86",
    accentContrast: "#FFFFFF",
    warm: "#F4B65B",
    success: "#47BC7E",
    warning: "#E6A243",
    error: "#E06F5B",
    info: "#1F8E86",
    background: "#FFF8EF",
    paper: "#FFFDF8",
    panel: "#FFF8EF",
    panelStrong: "#FFF3E4",
    panelMuted: "#F7EBD9",
    panelSubtle: "#FCF3E8",
    rail: "#FFF3E3",
    edge: "#F9EEDF",
    text: "#18324A",
    textSecondary: "#4D667A",
    textSoft: "#70889A",
    border: "#E6D8C4",
    borderSoft: alpha("#C7AF8C", 0.22),
    borderStrong: alpha("#27B3A7", 0.28),
    selection: alpha("#27B3A7", 0.2),
    shadowSm: `0 18px 42px ${alpha("#284663", 0.1)}, 0 3px 10px ${alpha("#27B3A7", 0.06)}`,
    shadowMd: `0 28px 72px ${alpha("#284663", 0.14)}, 0 8px 22px ${alpha("#27B3A7", 0.08)}`,
    shadowLg: `0 36px 96px ${alpha("#284663", 0.16)}, 0 10px 28px ${alpha("#27B3A7", 0.1)}`,
  },
  dark: {
    accent: "#66D9CC",
    accentStrong: "#8DEEE2",
    accentContrast: "#0B241F",
    warm: "#F5BE67",
    success: "#5ED498",
    warning: "#EAB15B",
    error: "#F18A77",
    info: "#66D9CC",
    background: "#0E1B2D",
    paper: "#132841",
    panel: "#17304C",
    panelStrong: "#1E3D5E",
    panelMuted: "#18314D",
    panelSubtle: "#11263C",
    rail: "#102338",
    edge: "#0A1727",
    text: "#ECF7F5",
    textSecondary: "#B9CBDA",
    textSoft: "#8FA7BC",
    border: alpha("#9EC2DB", 0.22),
    borderSoft: alpha("#9EC2DB", 0.14),
    borderStrong: alpha("#66D9CC", 0.34),
    selection: alpha("#66D9CC", 0.24),
    shadowSm: `0 20px 44px ${alpha("#020A16", 0.34)}, 0 4px 12px ${alpha("#66D9CC", 0.08)}`,
    shadowMd: `0 30px 76px ${alpha("#020A16", 0.46)}, 0 8px 18px ${alpha("#66D9CC", 0.12)}`,
    shadowLg: `0 42px 108px ${alpha("#020A16", 0.54)}, 0 12px 24px ${alpha("#66D9CC", 0.14)}`,
  },
} as const;

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fastDuration = "160ms";
const duration = "220ms";
const slowDuration = "320ms";

function buildTheme(mode: Mode) {
  const tone = palettes[mode];

  const entryAccentSoft = alpha(tone.accent, mode === "dark" ? 0.18 : 0.12);
  const warmSoft = alpha(tone.warm, mode === "dark" ? 0.2 : 0.16);
  const shellFill = alpha(tone.paper, mode === "dark" ? 0.68 : 0.78);
  const shellFillStrong = alpha(tone.paper, mode === "dark" ? 0.82 : 0.92);
  const shellHighlight = alpha("#FFFFFF", mode === "dark" ? 0.08 : 0.72);
  const subtleWhite = alpha("#FFFFFF", mode === "dark" ? 0.06 : 0.5);

  const shared: ThemeOptions = {
    typography: {
      fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
      h1: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 800,
        letterSpacing: "-0.06em",
      },
      h2: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 800,
        letterSpacing: "-0.05em",
      },
      h3: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 780,
        letterSpacing: "-0.05em",
      },
      h4: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 760,
        letterSpacing: "-0.04em",
      },
      h5: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 740,
        letterSpacing: "-0.035em",
      },
      h6: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 720,
        letterSpacing: "-0.03em",
      },
      button: {
        fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
        fontWeight: 720,
        letterSpacing: "-0.02em",
      },
      body1: {
        lineHeight: 1.72,
      },
      body2: {
        lineHeight: 1.65,
      },
      overline: {
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        letterSpacing: "0.12em",
      },
      caption: {
        fontFamily: '"JetBrains Mono", monospace',
        letterSpacing: "0.02em",
      },
    },
    shape: {
      borderRadius: 7,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: () => `
          :root {
            color-scheme: ${mode};
            --mcs-header-height: 64px;
            --mcs-sticky-offset: calc(var(--mcs-header-height) + 32px);
            --mcs-sticky-offset-tight: calc(var(--mcs-header-height) + 30px);
            --font-family-display: "Outfit", "Noto Sans SC", sans-serif;
            --font-family-body: "Outfit", "Noto Sans SC", sans-serif;
            --font-family-mono: "JetBrains Mono", monospace;
            --mcs-duration-fast: ${fastDuration};
            --mcs-duration: ${duration};
            --mcs-duration-slow: ${slowDuration};
            --mcs-ease: ${easing};
            --mcs-surface: ${tone.paper};
            --mcs-surface-subtle: ${tone.panelSubtle};
            --mcs-surface-muted: ${alpha(tone.panelMuted, mode === "dark" ? 0.86 : 0.72)};
            --mcs-border: ${tone.border};
            --mcs-focus: ${tone.accent};
            --mcs-shadow-sm: ${tone.shadowSm};
            --mcs-shadow-md: ${tone.shadowMd};
            --mcs-toolbar-overlay: ${alpha(tone.paper, mode === "dark" ? 0.74 : 0.8)};
            --mcs-shell-fill: ${shellFill};
            --mcs-shell-fill-strong: ${shellFillStrong};
            --mcs-shell-stroke: ${tone.border};
            --mcs-shell-stroke-strong: ${tone.borderStrong};
            --mcs-shell-divider: ${tone.borderSoft};
            --mcs-shell-highlight: ${shellHighlight};
            --mcs-shell-shadow: ${tone.shadowSm};
            --mcs-shell-shadow-strong: ${tone.shadowMd};
            --mcs-entry-accent: ${tone.accent};
            --mcs-entry-accent-strong: ${tone.accentStrong};
            --mcs-entry-accent-soft: ${entryAccentSoft};
            --mcs-entry-band: ${warmSoft};
            --mcs-entry-band-strong: ${alpha(tone.warm, mode === "dark" ? 0.28 : 0.26)};
            --mcs-entry-surface: ${alpha(tone.paper, mode === "dark" ? 0.7 : 0.84)};
            --mcs-entry-surface-strong: ${alpha(tone.paper, mode === "dark" ? 0.82 : 0.94)};
            --mcs-entry-surface-muted: ${alpha(tone.panelStrong, mode === "dark" ? 0.88 : 0.7)};
            --mcs-entry-outline: ${tone.border};
            --mcs-entry-outline-strong: ${tone.borderStrong};
            --mcs-entry-shadow: ${tone.shadowLg};
            --mcs-entry-grid: ${alpha(tone.border, mode === "dark" ? 0.24 : 0.34)};
            --mcs-entry-frame: ${alpha(tone.warm, mode === "dark" ? 0.14 : 0.18)};
            --mcs-entry-muted: ${tone.textSecondary};
            --mcs-entry-ink: ${tone.text};
            --mcs-entry-panel-fill: ${alpha(tone.paper, mode === "dark" ? 0.64 : 0.88)};
            --mcs-entry-panel-fill-strong: ${alpha(tone.paper, mode === "dark" ? 0.8 : 0.96)};
            --mcs-entry-panel-fill-emphasis: ${alpha(tone.panel, mode === "dark" ? 0.88 : 0.84)};
            --mcs-entry-panel-grid: ${alpha(tone.border, mode === "dark" ? 0.16 : 0.22)};
            --mcs-entry-panel-shadow: ${tone.shadowMd};
            --mcs-monitor-surface: ${alpha(tone.panel, mode === "dark" ? 0.84 : 0.86)};
            --mcs-monitor-surface-strong: ${alpha(tone.panelStrong, mode === "dark" ? 0.92 : 0.76)};
            --mcs-monitor-surface-muted: ${alpha(tone.panelMuted, mode === "dark" ? 0.92 : 0.74)};
            --mcs-monitor-surface-subtle: ${alpha(tone.panelSubtle, mode === "dark" ? 0.9 : 0.66)};
            --mcs-monitor-outline: ${tone.border};
            --mcs-monitor-outline-strong: ${tone.borderStrong};
            --mcs-monitor-accent: ${tone.accent};
            --mcs-monitor-accent-strong: ${tone.accentStrong};
            --mcs-monitor-accent-soft: ${alpha(tone.accent, mode === "dark" ? 0.2 : 0.12)};
            --mcs-monitor-warm-soft: ${warmSoft};
            --mcs-monitor-warm-strong: ${tone.warm};
            --mcs-monitor-progress-track: ${alpha(tone.text, mode === "dark" ? 0.14 : 0.08)};
            --mcs-monitor-muted: ${tone.textSecondary};
            --mcs-monitor-ink: ${tone.text};
            --mcs-monitor-grid: ${alpha(tone.border, mode === "dark" ? 0.16 : 0.2)};
            --mcs-monitor-panel-fill: ${alpha(tone.paper, mode === "dark" ? 0.68 : 0.9)};
            --mcs-monitor-panel-fill-strong: ${alpha(tone.panelStrong, mode === "dark" ? 0.88 : 0.8)};
            --mcs-monitor-panel-fill-emphasis: ${alpha(tone.panel, mode === "dark" ? 0.94 : 0.86)};
            --mcs-monitor-panel-grid: ${alpha(tone.border, mode === "dark" ? 0.14 : 0.18)};
            --mcs-monitor-panel-shadow: ${tone.shadowMd};
            --mcs-page-edge: ${alpha(tone.edge, mode === "dark" ? 0.96 : 0.92)};
            --mcs-page-rail: ${alpha(tone.rail, mode === "dark" ? 0.9 : 0.88)};
            --mcs-workbench-surface: ${alpha(tone.panel, mode === "dark" ? 0.86 : 0.88)};
            --mcs-workbench-surface-strong: ${alpha(tone.panelStrong, mode === "dark" ? 0.92 : 0.8)};
            --mcs-workbench-surface-muted: ${alpha(tone.panelMuted, mode === "dark" ? 0.92 : 0.74)};
            --mcs-workbench-surface-subtle: ${alpha(tone.panelSubtle, mode === "dark" ? 0.9 : 0.66)};
            --mcs-workbench-outline: ${tone.border};
            --mcs-workbench-outline-strong: ${tone.borderStrong};
            --mcs-workbench-accent: ${tone.accent};
            --mcs-workbench-accent-strong: ${tone.accentStrong};
            --mcs-workbench-accent-soft: ${alpha(tone.accent, mode === "dark" ? 0.18 : 0.1)};
            --mcs-workbench-warm-soft: ${warmSoft};
            --mcs-workbench-warm-strong: ${tone.warm};
            --mcs-workbench-progress-track: ${alpha(tone.text, mode === "dark" ? 0.16 : 0.1)};
            --mcs-workbench-muted: ${tone.textSecondary};
            --mcs-workbench-ink: ${tone.text};
            --mcs-workbench-grid: ${alpha(tone.border, mode === "dark" ? 0.14 : 0.18)};
            --mcs-workbench-panel-fill: ${alpha(tone.paper, mode === "dark" ? 0.68 : 0.9)};
            --mcs-workbench-panel-fill-strong: ${alpha(tone.panelStrong, mode === "dark" ? 0.9 : 0.82)};
            --mcs-workbench-panel-fill-emphasis: ${alpha(tone.panel, mode === "dark" ? 0.94 : 0.88)};
            --mcs-workbench-panel-grid: ${alpha(tone.border, mode === "dark" ? 0.14 : 0.18)};
            --mcs-workbench-panel-shadow: ${tone.shadowMd};
            --mcs-summary-tile-fill: ${alpha(tone.paper, mode === "dark" ? 0.72 : 0.88)};
            --mcs-summary-tile-fill-strong: ${alpha(tone.panelStrong, mode === "dark" ? 0.86 : 0.78)};
            --mcs-summary-tile-stroke: ${tone.borderStrong};
            --mcs-summary-tile-shadow: ${tone.shadowSm};
            --mcs-diff-add-bg: ${alpha(tone.success, mode === "dark" ? 0.16 : 0.1)};
            --mcs-diff-remove-bg: ${alpha(tone.error, mode === "dark" ? 0.18 : 0.1)};
            --mcs-warning-progress: ${alpha(tone.warning, mode === "dark" ? 0.22 : 0.16)};
            --mcs-warning-progress-strong: ${alpha(tone.warning, mode === "dark" ? 0.78 : 0.72)};
            --mcs-success-surface: ${alpha(tone.success, mode === "dark" ? 0.18 : 0.12)};
            --mcs-success-border: ${alpha(tone.success, mode === "dark" ? 0.36 : 0.24)};
            --mcs-error-surface: ${alpha(tone.error, mode === "dark" ? 0.18 : 0.12)};
            --mcs-error-border: ${alpha(tone.error, mode === "dark" ? 0.34 : 0.24)};
            --mcs-error-text: ${tone.error};
            --mcs-glass-fill: ${alpha(tone.paper, mode === "dark" ? 0.54 : 0.64)};
            --mcs-glass-fill-strong: ${alpha(tone.paper, mode === "dark" ? 0.78 : 0.84)};
            --mcs-glass-stroke: ${alpha(tone.border, mode === "dark" ? 0.8 : 0.68)};
            --mcs-glass-stroke-strong: ${tone.borderStrong};
            --mcs-glass-highlight: ${shellHighlight};
            --mcs-glass-shadow: ${tone.shadowSm};
            --mcs-glass-shadow-hover: ${tone.shadowMd};
            --mcs-glass-blur: ${mode === "dark" ? "12px" : "10px"};
            --mcs-panel-fill: var(--mcs-workbench-panel-fill);
            --mcs-panel-fill-strong: var(--mcs-workbench-panel-fill-strong);
            --mcs-panel-fill-emphasis: var(--mcs-workbench-panel-fill-emphasis);
            --mcs-panel-stroke: var(--mcs-workbench-outline);
            --mcs-panel-stroke-soft: ${alpha(tone.border, mode === "dark" ? 0.7 : 0.58)};
            --mcs-panel-accent: var(--mcs-workbench-accent-strong);
            --mcs-panel-accent-soft: var(--mcs-workbench-accent-soft);
            --mcs-panel-highlight: ${shellHighlight};
            --mcs-panel-grid: var(--mcs-workbench-panel-grid);
            --mcs-panel-shadow: var(--mcs-workbench-panel-shadow);
            --mcs-blob-blue: ${alpha(tone.accent, mode === "dark" ? 0.18 : 0.12)};
            --mcs-blob-mauve: ${alpha(tone.warm, mode === "dark" ? 0.16 : 0.12)};
            --mcs-blob-rosewater: ${alpha("#FFFFFF", mode === "dark" ? 0.06 : 0.22)};
            --mcs-blob-teal: ${alpha(tone.accentStrong, mode === "dark" ? 0.14 : 0.1)};
            --mcs-control-fill: ${shellFill};
            --mcs-control-fill-strong: ${shellFillStrong};
            --mcs-control-stroke: ${tone.border};
            --mcs-control-stroke-strong: ${tone.borderStrong};
            --mcs-control-divider: ${tone.borderSoft};
            --mcs-hero-accent: ${entryAccentSoft};
            --mcs-hero-band: ${warmSoft};
            --mcs-hero-band-strong: ${alpha(tone.warm, mode === "dark" ? 0.3 : 0.26)};
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

          @media (max-width: 900px) {
            :root {
              --mcs-glass-blur: 4px;
            }
          }

          @media (max-width: 600px) {
            :root {
              --mcs-glass-blur: 0px;
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
            color: ${tone.text};
            font-family: var(--font-family-body);
            background:
              radial-gradient(circle at 12% 0%, ${alpha(tone.accent, mode === "dark" ? 0.12 : 0.08)} 0, transparent 28%),
              linear-gradient(180deg, ${tone.background} 0%, ${tone.background} 100%);
            scrollbar-width: thin;
            scrollbar-color: ${alpha(tone.text, 0.22)} transparent;
          }

          button, input, textarea, select {
            font: inherit;
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
            background-color: ${alpha(tone.text, 0.18)};
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
            borderRadius: 999,
            paddingInline: 18,
            paddingBlock: 10,
            fontWeight: 720,
            letterSpacing: "-0.02em",
            boxShadow: "none",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:active": {
              transform: "translateY(0) scale(0.98)",
            },
          },
          contained: {
            background: tone.accent,
            color: tone.accentContrast,
            boxShadow: `0 12px 22px ${alpha(tone.accent, mode === "dark" ? 0.16 : 0.12)}`,
            "&:hover": {
              background: tone.accentStrong,
              boxShadow: `0 16px 26px ${alpha(tone.accent, mode === "dark" ? 0.18 : 0.14)}`,
              transform: "translateY(-1px)",
            },
          },
          outlined: {
            borderColor: tone.borderStrong,
            backgroundColor: alpha(tone.paper, mode === "dark" ? 0.16 : 0.5),
            color: tone.text,
            "&:hover": {
              borderColor: tone.accent,
              backgroundColor: alpha(tone.accent, mode === "dark" ? 0.14 : 0.08),
            },
          },
          text: {
            color: tone.textSecondary,
            "&:hover": {
              backgroundColor: alpha(tone.accent, mode === "dark" ? 0.12 : 0.06),
              color: tone.text,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 2.2,
            minWidth: 44,
            minHeight: 44,
            border: `1px solid ${tone.border}`,
            backgroundColor: alpha(tone.paper, mode === "dark" ? 0.18 : 0.54),
            boxShadow: `inset 0 1px 0 ${subtleWhite}`,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:hover": {
              backgroundColor: alpha(tone.paper, mode === "dark" ? 0.28 : 0.72),
              borderColor: tone.borderStrong,
            },
            "&:active": {
              transform: "translateY(0) scale(0.98)",
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            padding: 3,
            border: `1px solid ${tone.border}`,
            backgroundColor: alpha(tone.paper, mode === "dark" ? 0.18 : 0.54),
            boxShadow: `inset 0 1px 0 ${subtleWhite}`,
          },
          grouped: {
            margin: 0,
            border: 0,
            "&:not(:first-of-type)": {
              borderRadius: 999,
            },
            "&:first-of-type": {
              borderRadius: 999,
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
            textTransform: "none",
            borderRadius: 999,
            color: tone.textSecondary,
            "&.Mui-selected": {
              backgroundColor: alpha(tone.paper, mode === "dark" ? 0.52 : 0.84),
              color: tone.text,
              boxShadow: `0 10px 22px ${alpha(tone.accent, mode === "dark" ? 0.14 : 0.08)}`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundImage: "none",
            backgroundColor: "var(--mcs-panel-fill)",
            border: "1px solid var(--mcs-panel-stroke)",
            boxShadow: "var(--mcs-panel-shadow)",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:hover": {
              backgroundColor: "var(--mcs-panel-fill-strong)",
              borderColor: "var(--mcs-panel-accent-soft)",
              boxShadow: "var(--mcs-shadow-md)",
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
            fontWeight: 650,
            borderRadius: 999,
            backgroundColor: alpha(tone.paper, mode === "dark" ? 0.16 : 0.52),
            borderColor: tone.border,
          },
          label: {
            paddingInline: 10,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--mcs-panel-fill-strong)",
            borderRight: "1px solid var(--mcs-panel-stroke)",
            boxShadow: "var(--mcs-shadow-sm)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--mcs-toolbar-overlay)",
            color: tone.text,
            borderBottom: "1px solid var(--mcs-border)",
            boxShadow: "none",
            backdropFilter: "blur(var(--mcs-glass-blur)) saturate(120%)",
            WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(120%)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--mcs-shell-fill-strong)",
            border: "1px solid var(--mcs-shell-stroke)",
            boxShadow: "var(--mcs-shadow-md)",
            backdropFilter: "blur(var(--mcs-glass-blur)) saturate(120%)",
            WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(120%)",
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
            backgroundColor: alpha(tone.edge, mode === "dark" ? 0.58 : 0.22),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            margin: 0,
            borderRadius: 2.4,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "&:hover": {
              backgroundColor: alpha(tone.accent, mode === "dark" ? 0.12 : 0.07),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(tone.accent, mode === "dark" ? 0.18 : 0.11),
            },
            "&.Mui-selected:hover": {
              backgroundColor: alpha(tone.accent, mode === "dark" ? 0.22 : 0.14),
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${duration} ${easing}`,
            "&.MuiTableRow-hover:hover": {
              backgroundColor: alpha(tone.accent, mode === "dark" ? 0.08 : 0.05),
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
            color: tone.textSecondary,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 2.4,
            backgroundColor: alpha(tone.paper, mode === "dark" ? 0.14 : 0.62),
            boxShadow: `inset 0 1px 0 ${subtleWhite}`,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.borderStrong,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.accent,
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${alpha(tone.accent, mode === "dark" ? 0.18 : 0.1)}`,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
            backgroundColor: tone.accent,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            minHeight: 46,
            fontWeight: 680,
            letterSpacing: "-0.02em",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 3.2,
            border: `1px solid ${tone.border}`,
            backgroundColor: alpha(tone.paper, mode === "dark" ? 0.18 : 0.66),
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(tone.text, mode === "dark" ? 0.14 : 0.08),
          },
          bar: {
            borderRadius: 999,
            backgroundColor: tone.accent,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(tone.text, mode === "dark" ? 0.12 : 0.08),
          },
        },
      },
    },
  };

  return createTheme({
    ...shared,
    palette: {
      mode,
      primary: {
        main: tone.accent,
        dark: tone.accentStrong,
        contrastText: tone.accentContrast,
      },
      secondary: {
        main: tone.accentStrong,
      },
      info: {
        main: tone.info,
      },
      background: {
        default: tone.background,
        paper: tone.paper,
      },
      text: {
        primary: tone.text,
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
