import { alpha, createTheme, type ThemeOptions } from "@mui/material/styles";

type Mode = "light" | "dark";

interface BasePalette {
  accent: string;
  accentStrong: string;
  accentContrast: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  canvas: string;
  canvasSoft: string;
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
  overlay: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
}

// Claude (Anthropic) palette — Parchment canvas, Ivory cards, Terracotta CTAs,
// exclusively warm-toned neutrals. Every gray carries a yellow-brown undertone.
const palettes: Record<Mode, BasePalette> = {
  light: {
    accent: "#C96442", // Terracotta Brand — primary CTA
    accentStrong: "#D97757", // Coral Accent — hover / emphasis
    accentContrast: "#FAF9F5", // Ivory
    success: "#6F8F4D",
    warning: "#C58B31",
    error: "#B53333", // Error Crimson
    info: "#3898EC", // Focus Blue — accessibility only
    canvas: "#F5F4ED", // Parchment
    canvasSoft: "#EFEDE3",
    paper: "#FAF9F5", // Ivory
    panel: "#FAF9F5",
    panelStrong: "#F0EEE6", // Border Cream as elevated container
    panelMuted: "#EFEDE3",
    panelSubtle: "#F5F4ED",
    rail: "#F0EEE6",
    edge: "#E8E6DC", // Warm Sand
    text: "#141413", // Anthropic Near Black
    textSecondary: "#5E5D59", // Olive Gray
    textSoft: "#87867F", // Stone Gray
    border: "#E8E6DC", // Border Warm
    borderSoft: "#F0EEE6", // Border Cream
    borderStrong: alpha("#C96442", 0.32),
    selection: alpha("#C96442", 0.18),
    overlay: alpha("#141413", 0.38),
    shadowSm:
      "0 0 0 1px #F0EEE6, 0 1px 2px rgba(20, 20, 19, 0.04)",
    shadowMd:
      "0 0 0 1px #E8E6DC, 0 4px 24px rgba(20, 20, 19, 0.05)",
    shadowLg:
      "0 0 0 1px #E8E6DC, 0 12px 40px rgba(20, 20, 19, 0.08)",
  },
  dark: {
    accent: "#D97757", // Coral reads warmer on dark canvases
    accentStrong: "#C96442",
    accentContrast: "#FAF9F5",
    success: "#8FAD66",
    warning: "#D69C48",
    error: "#D15454",
    info: "#5FA8F5",
    canvas: "#141413", // Deep Dark
    canvasSoft: "#1A1A18",
    paper: "#1E1E1C",
    panel: "#23221F",
    panelStrong: "#30302E", // Dark Surface
    panelMuted: "#1D1D1B",
    panelSubtle: "#18181611",
    rail: "#141413",
    edge: "#0E0E0D",
    text: "#FAF9F5", // Ivory
    textSecondary: "#B0AEA5", // Warm Silver
    textSoft: "#87867F",
    border: "#30302E", // Border Dark
    borderSoft: alpha("#FAF9F5", 0.06),
    borderStrong: alpha("#D97757", 0.4),
    selection: alpha("#D97757", 0.28),
    overlay: alpha("#000000", 0.82),
    shadowSm:
      "0 0 0 1px #30302E, 0 1px 2px rgba(0, 0, 0, 0.32)",
    shadowMd:
      "0 0 0 1px #30302E, 0 12px 32px rgba(0, 0, 0, 0.44)",
    shadowLg:
      "0 0 0 1px #30302E, 0 24px 56px rgba(0, 0, 0, 0.55)",
  },
} as const;

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fastDuration = "150ms";
const duration = "220ms";
const slowDuration = "320ms";
// Anthropic Serif substitute — editorial weight 500 for headlines.
const serifFont =
  '"Source Serif 4", "Noto Serif SC", Georgia, "Times New Roman", serif';
// Anthropic Sans substitute — Inter covers the warm geometric sans feel.
const sansFont =
  '"Inter", "Noto Sans SC", "PingFang SC", system-ui, sans-serif';
const monoFont =
  '"Berkeley Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace';

function buildTheme(mode: Mode) {
  const tone = palettes[mode];

  const accentSoft = alpha(tone.accent, mode === "dark" ? 0.22 : 0.14);
  const accentFaint = alpha(tone.accent, mode === "dark" ? 0.12 : 0.07);
  const successSoft = alpha(tone.success, mode === "dark" ? 0.18 : 0.12);
  const warningSoft = alpha(tone.warning, mode === "dark" ? 0.18 : 0.12);
  const shellHighlight =
    mode === "dark" ? alpha("#FAF9F5", 0.03) : alpha("#FFFFFF", 0.6);
  const toolbarOverlay =
    mode === "dark" ? alpha(tone.canvas, 0.9) : alpha(tone.canvas, 0.88);
  const controlFill = mode === "dark" ? alpha("#FAF9F5", 0.04) : "#F0EEE6";
  const controlFillStrong =
    mode === "dark" ? alpha("#FAF9F5", 0.08) : "#E8E6DC";
  const ringSubtle = mode === "dark" ? "#30302E" : "#D1CFC5";
  const ringSoft = mode === "dark" ? alpha("#FAF9F5", 0.06) : "#E8E6DC";

  const shared: ThemeOptions = {
    shape: {
      borderRadius: 8, // Claude: comfortably rounded base
    },
    typography: {
      fontFamily: sansFont,
      fontSize: 16,
      // Editorial serif owns h1–h5; sans takes h6 and all UI text.
      h1: {
        fontFamily: serifFont,
        fontWeight: 500,
        lineHeight: 1.1,
        letterSpacing: 0,
      },
      h2: {
        fontFamily: serifFont,
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: 0,
      },
      h3: {
        fontFamily: serifFont,
        fontWeight: 500,
        lineHeight: 1.2,
        letterSpacing: 0,
      },
      h4: {
        fontFamily: serifFont,
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: 0,
      },
      h5: {
        fontFamily: serifFont,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: 0,
      },
      h6: {
        fontFamily: sansFont,
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: "-0.01em",
      },
      subtitle1: {
        fontFamily: sansFont,
        fontWeight: 500,
        letterSpacing: 0,
      },
      subtitle2: {
        fontFamily: sansFont,
        fontWeight: 500,
      },
      body1: {
        lineHeight: 1.6,
      },
      body2: {
        lineHeight: 1.6,
      },
      button: {
        fontFamily: sansFont,
        fontWeight: 500,
        letterSpacing: 0,
        textTransform: "none",
      },
      caption: {
        fontFamily: sansFont,
        fontSize: "0.875rem",
        lineHeight: 1.45,
        letterSpacing: 0,
      },
      overline: {
        fontFamily: sansFont,
        fontWeight: 500,
        fontSize: "0.75rem",
        lineHeight: 1.6,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: () => `
          :root {
            color-scheme: ${mode};
            --mcs-header-height: 64px;
            --mcs-sticky-offset: calc(var(--mcs-header-height) + 28px);
            --mcs-sticky-offset-tight: calc(var(--mcs-header-height) + 24px);
            --font-family-display: ${serifFont};
            --font-family-body: ${sansFont};
            --font-family-mono: ${monoFont};
            --mcs-duration-fast: ${fastDuration};
            --mcs-duration: ${duration};
            --mcs-duration-slow: ${slowDuration};
            --mcs-ease: ${easing};
            --mcs-canvas: ${tone.canvas};
            --mcs-canvas-soft: ${tone.canvasSoft};
            --mcs-surface: ${tone.paper};
            --mcs-surface-elevated: ${tone.panelStrong};
            --mcs-surface-muted: ${tone.panelMuted};
            --mcs-surface-subtle: ${tone.panelSubtle};
            --mcs-divider: ${tone.border};
            --mcs-divider-soft: ${tone.borderSoft};
            --mcs-divider-strong: ${tone.borderStrong};
            --mcs-text: ${tone.text};
            --mcs-muted: ${tone.textSecondary};
            --mcs-muted-soft: ${tone.textSoft};
            --mcs-accent: ${tone.accent};
            --mcs-accent-strong: ${tone.accentStrong};
            --mcs-accent-soft: ${accentSoft};
            --mcs-accent-faint: ${accentFaint};
            --mcs-success: ${tone.success};
            --mcs-success-soft: ${successSoft};
            --mcs-warning: ${tone.warning};
            --mcs-warning-soft: ${warningSoft};
            --mcs-error: ${tone.error};
            --mcs-focus: ${tone.info};
            --mcs-shadow-sm: ${tone.shadowSm};
            --mcs-shadow-md: ${tone.shadowMd};
            --mcs-shadow-lg: ${tone.shadowLg};
            --mcs-overlay: ${tone.overlay};
            --mcs-glass-fill: ${controlFill};
            --mcs-glass-fill-strong: ${controlFillStrong};
            --mcs-glass-stroke: ${tone.border};
            --mcs-glass-stroke-strong: ${tone.borderStrong};
            --mcs-glass-highlight: ${shellHighlight};
            --mcs-glass-shadow: ${tone.shadowSm};
            --mcs-glass-shadow-hover: ${tone.shadowMd};
            --mcs-glass-blur: ${mode === "dark" ? "2px" : "0px"};
            --mcs-shell-fill: ${tone.paper};
            --mcs-shell-fill-strong: ${tone.panelStrong};
            --mcs-shell-stroke: ${tone.border};
            --mcs-shell-stroke-strong: ${tone.borderStrong};
            --mcs-shell-divider: ${tone.borderSoft};
            --mcs-shell-highlight: ${shellHighlight};
            --mcs-shell-shadow: ${tone.shadowSm};
            --mcs-shell-shadow-strong: ${tone.shadowMd};
            --mcs-toolbar-overlay: ${toolbarOverlay};
            --mcs-page-edge: ${tone.edge};
            --mcs-page-rail: ${tone.rail};
            --mcs-control-fill: ${controlFill};
            --mcs-control-fill-strong: ${controlFillStrong};
            --mcs-control-stroke: ${tone.border};
            --mcs-control-stroke-strong: ${tone.borderStrong};
            --mcs-control-divider: ${tone.borderSoft};
            --mcs-panel-fill: ${tone.paper};
            --mcs-panel-fill-strong: ${tone.panelStrong};
            --mcs-panel-fill-emphasis: ${tone.panel};
            --mcs-panel-stroke: ${tone.border};
            --mcs-panel-stroke-soft: ${tone.borderSoft};
            --mcs-panel-accent: ${tone.accent};
            --mcs-panel-accent-soft: ${accentSoft};
            --mcs-panel-highlight: ${shellHighlight};
            --mcs-panel-grid: ${tone.borderSoft};
            --mcs-panel-shadow: ${tone.shadowSm};
            --mcs-summary-tile-fill: ${tone.panelMuted};
            --mcs-summary-tile-fill-strong: ${tone.panelStrong};
            --mcs-summary-tile-stroke: ${tone.borderStrong};
            --mcs-summary-tile-shadow: ${tone.shadowSm};
            --mcs-diff-add-bg: ${alpha(tone.success, mode === "dark" ? 0.18 : 0.12)};
            --mcs-diff-remove-bg: ${alpha(tone.error, mode === "dark" ? 0.18 : 0.12)};
            --mcs-warning-progress: ${warningSoft};
            --mcs-warning-progress-strong: ${tone.warning};
            --mcs-success-surface: ${successSoft};
            --mcs-success-border: ${alpha(tone.success, mode === "dark" ? 0.32 : 0.24)};
            --mcs-error-surface: ${alpha(tone.error, mode === "dark" ? 0.16 : 0.1)};
            --mcs-error-border: ${alpha(tone.error, mode === "dark" ? 0.3 : 0.22)};
            --mcs-error-text: ${tone.error};
            --mcs-entry-accent: ${tone.accent};
            --mcs-entry-accent-strong: ${tone.accentStrong};
            --mcs-entry-accent-soft: ${accentSoft};
            --mcs-entry-band: ${accentFaint};
            --mcs-entry-band-strong: ${accentSoft};
            --mcs-entry-surface: ${tone.paper};
            --mcs-entry-surface-strong: ${tone.panelStrong};
            --mcs-entry-surface-muted: ${tone.panelMuted};
            --mcs-entry-outline: ${tone.border};
            --mcs-entry-outline-strong: ${tone.borderStrong};
            --mcs-entry-shadow: ${tone.shadowLg};
            --mcs-entry-grid: ${tone.borderSoft};
            --mcs-entry-frame: ${accentFaint};
            --mcs-entry-muted: ${tone.textSecondary};
            --mcs-entry-ink: ${tone.text};
            --mcs-entry-panel-fill: ${tone.paper};
            --mcs-entry-panel-fill-strong: ${tone.panelStrong};
            --mcs-entry-panel-fill-emphasis: ${tone.panel};
            --mcs-entry-panel-grid: ${tone.borderSoft};
            --mcs-entry-panel-shadow: ${tone.shadowSm};
            --mcs-monitor-surface: ${tone.paper};
            --mcs-monitor-surface-strong: ${tone.panelStrong};
            --mcs-monitor-surface-muted: ${tone.panelMuted};
            --mcs-monitor-surface-subtle: ${tone.panelSubtle};
            --mcs-monitor-outline: ${tone.border};
            --mcs-monitor-outline-strong: ${tone.borderStrong};
            --mcs-monitor-accent: ${tone.accent};
            --mcs-monitor-accent-strong: ${tone.accentStrong};
            --mcs-monitor-accent-soft: ${accentSoft};
            --mcs-monitor-warm-soft: ${warningSoft};
            --mcs-monitor-warm-strong: ${tone.warning};
            --mcs-monitor-progress-track: ${alpha(tone.text, mode === "dark" ? 0.1 : 0.08)};
            --mcs-monitor-muted: ${tone.textSecondary};
            --mcs-monitor-ink: ${tone.text};
            --mcs-monitor-grid: ${tone.borderSoft};
            --mcs-monitor-panel-fill: ${tone.paper};
            --mcs-monitor-panel-fill-strong: ${tone.panelStrong};
            --mcs-monitor-panel-fill-emphasis: ${tone.panel};
            --mcs-monitor-panel-grid: ${tone.borderSoft};
            --mcs-monitor-panel-shadow: ${tone.shadowSm};
            --mcs-workbench-surface: ${tone.paper};
            --mcs-workbench-surface-strong: ${tone.panelStrong};
            --mcs-workbench-surface-muted: ${tone.panelMuted};
            --mcs-workbench-surface-subtle: ${tone.panelSubtle};
            --mcs-workbench-outline: ${tone.border};
            --mcs-workbench-outline-strong: ${tone.borderStrong};
            --mcs-workbench-accent: ${tone.accent};
            --mcs-workbench-accent-strong: ${tone.accentStrong};
            --mcs-workbench-accent-soft: ${accentSoft};
            --mcs-workbench-warm-soft: ${warningSoft};
            --mcs-workbench-warm-strong: ${tone.warning};
            --mcs-workbench-progress-track: ${alpha(tone.text, mode === "dark" ? 0.1 : 0.08)};
            --mcs-workbench-muted: ${tone.textSecondary};
            --mcs-workbench-ink: ${tone.text};
            --mcs-workbench-grid: ${tone.borderSoft};
            --mcs-workbench-panel-fill: ${tone.paper};
            --mcs-workbench-panel-fill-strong: ${tone.panelStrong};
            --mcs-workbench-panel-fill-emphasis: ${tone.panel};
            --mcs-workbench-panel-grid: ${tone.borderSoft};
            --mcs-workbench-panel-shadow: ${tone.shadowSm};
            --mcs-hero-accent: ${accentSoft};
            --mcs-hero-band: ${accentFaint};
            --mcs-hero-band-strong: ${accentSoft};
            --mcs-hero-surface: ${tone.paper};
            --mcs-hero-surface-strong: ${tone.panelStrong};
            --mcs-hero-outline: ${tone.border};
            --mcs-hero-shadow: ${tone.shadowLg};
            --mcs-hero-grid: ${tone.borderSoft};
            --mcs-hero-frame: ${accentSoft};
            --mcs-dashboard-surface: ${tone.paper};
            --mcs-dashboard-surface-strong: ${tone.panelStrong};
            --mcs-dashboard-surface-muted: ${tone.panelMuted};
            --mcs-dashboard-surface-subtle: ${tone.panelSubtle};
            --mcs-dashboard-outline: ${tone.border};
            --mcs-dashboard-outline-strong: ${tone.borderStrong};
            --mcs-dashboard-accent: ${tone.accent};
            --mcs-dashboard-accent-strong: ${tone.accentStrong};
            --mcs-dashboard-accent-soft: ${accentSoft};
            --mcs-dashboard-warm-soft: ${warningSoft};
            --mcs-dashboard-warm-strong: ${tone.warning};
            --mcs-dashboard-progress-track: ${alpha(tone.text, mode === "dark" ? 0.1 : 0.08)};
            --mcs-dashboard-muted: ${tone.textSecondary};
            --mcs-dashboard-ink: ${tone.text};
            --mcs-dashboard-grid: ${tone.borderSoft};
          }

          @keyframes mcs-shell-rise {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
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
            font-synthesis-weight: none;
            background:
              radial-gradient(circle at 50% -12%, ${alpha(tone.accent, mode === "dark" ? 0.12 : 0.06)} 0, transparent 36%),
              linear-gradient(180deg, ${tone.canvas} 0%, ${tone.canvasSoft} 100%);
            scrollbar-width: thin;
            scrollbar-color: ${alpha(tone.text, mode === "dark" ? 0.22 : 0.16)} transparent;
          }

          button, input, textarea, select {
            font: inherit;
          }

          code, pre, kbd, samp {
            font-family: var(--font-family-mono);
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
            background-color: ${alpha(tone.text, mode === "dark" ? 0.18 : 0.12)};
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

          @media (max-width: 900px) {
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
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 40,
            minHeight: 40,
            borderRadius: 12,
            paddingInline: 16,
            paddingBlock: 8,
            boxShadow: "none",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          contained: {
            backgroundColor: tone.accent,
            color: tone.accentContrast,
            // Ring shadow — Claude's signature border-as-shadow pattern.
            boxShadow: `0 0 0 1px ${tone.accent}, 0 1px 2px ${alpha(tone.accent, 0.18)}`,
            "&:hover": {
              backgroundColor: tone.accentStrong,
              boxShadow: `0 0 0 1px ${tone.accentStrong}, 0 4px 14px ${alpha(tone.accent, 0.28)}`,
            },
          },
          outlined: {
            borderColor: "transparent",
            backgroundColor: controlFill,
            color: tone.text,
            boxShadow: `0 0 0 1px ${ringSubtle}`,
            "&:hover": {
              borderColor: "transparent",
              backgroundColor: controlFillStrong,
              boxShadow: `0 0 0 1px ${tone.borderStrong}`,
            },
          },
          text: {
            color: tone.textSecondary,
            "&:hover": {
              backgroundColor: accentFaint,
              color: tone.text,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: 40,
            minHeight: 40,
            borderRadius: 10,
            border: `1px solid ${tone.borderSoft}`,
            backgroundColor: controlFill,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:hover": {
              borderColor: ringSubtle,
              backgroundColor: controlFillStrong,
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: 2,
            border: `1px solid ${tone.borderSoft}`,
            backgroundColor: controlFill,
          },
          grouped: {
            margin: 0,
            border: 0,
            borderRadius: 10,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: 38,
            textTransform: "none",
            color: tone.textSecondary,
            "&.Mui-selected": {
              backgroundColor: accentSoft,
              color: tone.text,
              boxShadow: `0 0 0 1px ${tone.borderStrong}`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: "none",
            backgroundColor: "var(--mcs-panel-fill)",
            border: `1px solid ${tone.borderSoft}`,
            // Whisper shadow — barely-there lift per Claude's elevation model.
            boxShadow:
              mode === "dark"
                ? "0 0 0 1px rgba(250,249,245,0.04), 0 4px 24px rgba(0,0,0,0.22)"
                : "0 0 0 1px #F0EEE6, 0 4px 24px rgba(20,20,19,0.05)",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "&:hover": {
              borderColor: tone.border,
              boxShadow:
                mode === "dark"
                  ? "0 0 0 1px rgba(217,119,87,0.18), 0 12px 32px rgba(0,0,0,0.34)"
                  : "0 0 0 1px #E8E6DC, 0 12px 32px rgba(20,20,19,0.08)",
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
            borderRadius: 999,
            fontWeight: 500,
            backgroundColor: controlFill,
            borderColor: ringSoft,
            color: tone.textSecondary,
          },
          filled: {
            backgroundColor: accentSoft,
            color: tone.text,
          },
          label: {
            paddingInline: 12,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: tone.paper,
            borderRight: `1px solid ${tone.borderSoft}`,
            boxShadow: tone.shadowMd,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: toolbarOverlay,
            color: tone.text,
            borderBottom: `1px solid ${tone.borderSoft}`,
            boxShadow: "none",
            backdropFilter: "blur(var(--mcs-glass-blur))",
            WebkitBackdropFilter: "blur(var(--mcs-glass-blur))",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundColor: tone.paper,
            border: `1px solid ${tone.borderSoft}`,
            boxShadow: tone.shadowLg,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: serifFont,
            fontWeight: 500,
            borderBottom: `1px solid ${tone.borderSoft}`,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            borderTop: `1px solid ${tone.borderSoft}`,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: tone.overlay,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}`,
            "&:hover": {
              backgroundColor: accentFaint,
            },
            "&.Mui-selected": {
              backgroundColor: accentSoft,
            },
            "&.Mui-selected:hover": {
              backgroundColor: accentSoft,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${duration} ${easing}`,
            "&.MuiTableRow-hover:hover": {
              backgroundColor: accentFaint,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${tone.borderSoft}`,
          },
          head: {
            fontWeight: 500,
            color: tone.textSecondary,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: controlFill,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: ringSubtle,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.info,
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(tone.info, mode === "dark" ? 0.28 : 0.18)}`,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: 999,
            backgroundColor: tone.accent,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 42,
            textTransform: "none",
            fontWeight: 500,
            letterSpacing: 0,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${tone.borderSoft}`,
            backgroundColor: tone.paper,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(tone.text, mode === "dark" ? 0.1 : 0.08),
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
            backgroundColor: alpha(tone.text, mode === "dark" ? 0.1 : 0.06),
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
        default: tone.canvas,
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
