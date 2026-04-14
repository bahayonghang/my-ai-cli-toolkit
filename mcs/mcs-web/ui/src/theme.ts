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

const palettes: Record<Mode, BasePalette> = {
  light: {
    accent: "#5E6AD2",
    accentStrong: "#7170FF",
    accentContrast: "#FFFFFF",
    success: "#10B981",
    warning: "#C8822F",
    error: "#D35D6E",
    info: "#5E6AD2",
    canvas: "#F7F8F8",
    canvasSoft: "#F3F4F5",
    paper: "#FFFFFF",
    panel: "#F5F6F7",
    panelStrong: "#ECEEF3",
    panelMuted: "#E7E9EE",
    panelSubtle: "#F1F2F5",
    rail: "#F3F4F6",
    edge: "#E8EAF0",
    text: "#111318",
    textSecondary: "#4E5561",
    textSoft: "#707681",
    border: "#D9DEE8",
    borderSoft: alpha("#111318", 0.08),
    borderStrong: alpha("#5E6AD2", 0.28),
    selection: alpha("#7170FF", 0.18),
    overlay: alpha("#0A0B0F", 0.22),
    shadowSm:
      "0 1px 1px rgba(15, 17, 21, 0.04), 0 8px 20px rgba(15, 17, 21, 0.06)",
    shadowMd:
      "0 1px 1px rgba(15, 17, 21, 0.06), 0 16px 36px rgba(15, 17, 21, 0.1)",
    shadowLg:
      "0 1px 1px rgba(15, 17, 21, 0.08), 0 24px 56px rgba(15, 17, 21, 0.12)",
  },
  dark: {
    accent: "#5E6AD2",
    accentStrong: "#7170FF",
    accentContrast: "#FFFFFF",
    success: "#10B981",
    warning: "#C58B31",
    error: "#E06C7B",
    info: "#7170FF",
    canvas: "#08090A",
    canvasSoft: "#0B0C0E",
    paper: "#0F1011",
    panel: "#141516",
    panelStrong: "#191A1B",
    panelMuted: "#15171A",
    panelSubtle: "#111214",
    rail: "#0C0D0F",
    edge: "#050607",
    text: "#F7F8F8",
    textSecondary: "#D0D6E0",
    textSoft: "#8A8F98",
    border: alpha("#FFFFFF", 0.08),
    borderSoft: alpha("#FFFFFF", 0.05),
    borderStrong: alpha("#7170FF", 0.34),
    selection: alpha("#7170FF", 0.28),
    overlay: alpha("#000000", 0.85),
    shadowSm:
      "0 0 0 1px rgba(255, 255, 255, 0.03), 0 16px 36px rgba(0, 0, 0, 0.28)",
    shadowMd:
      "0 0 0 1px rgba(255, 255, 255, 0.04), 0 20px 48px rgba(0, 0, 0, 0.36)",
    shadowLg:
      "0 0 0 1px rgba(255, 255, 255, 0.04), 0 28px 72px rgba(0, 0, 0, 0.46)",
  },
} as const;

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fastDuration = "150ms";
const duration = "220ms";
const slowDuration = "320ms";
const displayFont = '"Inter", "Noto Sans SC", "PingFang SC", sans-serif';
const monoFont =
  '"Berkeley Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace';

function buildTheme(mode: Mode) {
  const tone = palettes[mode];

  const accentSoft = alpha(tone.accentStrong, mode === "dark" ? 0.18 : 0.12);
  const accentFaint = alpha(tone.accentStrong, mode === "dark" ? 0.1 : 0.08);
  const successSoft = alpha(tone.success, mode === "dark" ? 0.14 : 0.1);
  const warningSoft = alpha(tone.warning, mode === "dark" ? 0.16 : 0.1);
  const shellHighlight =
    mode === "dark" ? alpha("#FFFFFF", 0.04) : alpha("#FFFFFF", 0.72);
  const toolbarOverlay =
    mode === "dark" ? alpha(tone.paper, 0.9) : alpha(tone.paper, 0.92);
  const subtleWhite = alpha("#FFFFFF", mode === "dark" ? 0.04 : 0.9);
  const controlFill =
    mode === "dark" ? alpha("#FFFFFF", 0.03) : alpha("#111318", 0.03);
  const controlFillStrong =
    mode === "dark" ? alpha("#FFFFFF", 0.05) : alpha("#111318", 0.05);

  const shared: ThemeOptions = {
    shape: {
      borderRadius: 4,
    },
    typography: {
      fontFamily: displayFont,
      fontSize: 16,
      allVariants: {
        fontFeatureSettings: '"cv01", "ss03"',
      },
      h1: {
        fontFamily: displayFont,
        fontWeight: 510,
        lineHeight: 1,
        letterSpacing: "-0.099em",
      },
      h2: {
        fontFamily: displayFont,
        fontWeight: 510,
        lineHeight: 1,
        letterSpacing: "-0.088em",
      },
      h3: {
        fontFamily: displayFont,
        fontWeight: 510,
        lineHeight: 1.04,
        letterSpacing: "-0.066em",
      },
      h4: {
        fontFamily: displayFont,
        fontWeight: 400,
        lineHeight: 1.13,
        letterSpacing: "-0.044em",
      },
      h5: {
        fontFamily: displayFont,
        fontWeight: 590,
        lineHeight: 1.2,
        letterSpacing: "-0.03em",
      },
      h6: {
        fontFamily: displayFont,
        fontWeight: 590,
        lineHeight: 1.28,
        letterSpacing: "-0.02em",
      },
      subtitle1: {
        fontWeight: 590,
        letterSpacing: "-0.015em",
      },
      subtitle2: {
        fontWeight: 510,
      },
      body1: {
        lineHeight: 1.5,
      },
      body2: {
        lineHeight: 1.6,
      },
      button: {
        fontFamily: displayFont,
        fontWeight: 510,
        letterSpacing: "-0.01em",
        textTransform: "none",
      },
      caption: {
        fontFamily: displayFont,
        fontSize: "0.8125rem",
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
      },
      overline: {
        fontFamily: monoFont,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: "0.04em",
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
            --font-family-display: ${displayFont};
            --font-family-body: ${displayFont};
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
            --mcs-focus: ${tone.accentStrong};
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
            --mcs-glass-blur: ${mode === "dark" ? "6px" : "4px"};
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
            --mcs-panel-accent: ${tone.accentStrong};
            --mcs-panel-accent-soft: ${accentSoft};
            --mcs-panel-highlight: ${shellHighlight};
            --mcs-panel-grid: ${tone.borderSoft};
            --mcs-panel-shadow: ${tone.shadowSm};
            --mcs-summary-tile-fill: ${tone.panelMuted};
            --mcs-summary-tile-fill-strong: ${tone.panelStrong};
            --mcs-summary-tile-stroke: ${tone.borderStrong};
            --mcs-summary-tile-shadow: ${tone.shadowSm};
            --mcs-diff-add-bg: ${alpha(tone.success, mode === "dark" ? 0.16 : 0.1)};
            --mcs-diff-remove-bg: ${alpha(tone.error, mode === "dark" ? 0.16 : 0.1)};
            --mcs-warning-progress: ${warningSoft};
            --mcs-warning-progress-strong: ${tone.warning};
            --mcs-success-surface: ${successSoft};
            --mcs-success-border: ${alpha(tone.success, mode === "dark" ? 0.3 : 0.22)};
            --mcs-error-surface: ${alpha(tone.error, mode === "dark" ? 0.14 : 0.1)};
            --mcs-error-border: ${alpha(tone.error, mode === "dark" ? 0.28 : 0.2)};
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
            --mcs-monitor-progress-track: ${alpha(tone.text, mode === "dark" ? 0.08 : 0.08)};
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
            --mcs-workbench-progress-track: ${alpha(tone.text, mode === "dark" ? 0.08 : 0.08)};
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
            --mcs-dashboard-progress-track: ${alpha(tone.text, mode === "dark" ? 0.08 : 0.08)};
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
            font-feature-settings: "cv01", "ss03";
            font-synthesis-weight: none;
            background:
              radial-gradient(circle at 50% -12%, ${alpha(tone.accentStrong, mode === "dark" ? 0.12 : 0.08)} 0, transparent 32%),
              linear-gradient(180deg, ${tone.canvas} 0%, ${tone.canvasSoft} 100%);
            scrollbar-width: thin;
            scrollbar-color: ${alpha(tone.text, mode === "dark" ? 0.24 : 0.18)} transparent;
          }

          button, input, textarea, select {
            font: inherit;
            font-feature-settings: "cv01", "ss03";
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
              --mcs-glass-blur: 2px;
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
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 40,
            minHeight: 40,
            borderRadius: 8,
            paddingInline: 14,
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
            boxShadow: `0 8px 22px ${alpha(tone.accent, mode === "dark" ? 0.24 : 0.16)}`,
            "&:hover": {
              backgroundColor: tone.accentStrong,
              boxShadow: `0 12px 28px ${alpha(tone.accentStrong, mode === "dark" ? 0.28 : 0.18)}`,
            },
          },
          outlined: {
            borderColor: tone.border,
            backgroundColor: controlFill,
            color: tone.text,
            "&:hover": {
              borderColor: tone.borderStrong,
              backgroundColor: controlFillStrong,
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
            border: `1px solid ${tone.border}`,
            backgroundColor: controlFill,
            boxShadow: `inset 0 1px 0 ${subtleWhite}`,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, color ${duration} ${easing}, box-shadow ${duration} ${easing}, transform ${duration} ${easing}`,
            "&:hover": {
              borderColor: tone.borderStrong,
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
            borderRadius: 10,
            padding: 2,
            border: `1px solid ${tone.border}`,
            backgroundColor: controlFill,
            boxShadow: `inset 0 1px 0 ${subtleWhite}`,
          },
          grouped: {
            margin: 0,
            border: 0,
            borderRadius: 8,
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
              boxShadow: `0 1px 1px ${alpha(tone.text, 0.06)}`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: "none",
            backgroundColor: "var(--mcs-panel-fill)",
            border: "1px solid var(--mcs-panel-stroke)",
            boxShadow: "var(--mcs-panel-shadow)",
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "&:hover": {
              borderColor: "var(--mcs-panel-stroke-soft)",
              boxShadow: "var(--mcs-shadow-md)",
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
            fontWeight: 510,
            backgroundColor: controlFill,
            borderColor: tone.border,
            color: tone.textSecondary,
          },
          filled: {
            backgroundColor: accentSoft,
            color: tone.text,
          },
          label: {
            paddingInline: 10,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: tone.paper,
            borderRight: `1px solid ${tone.border}`,
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
            backdropFilter: "blur(var(--mcs-glass-blur)) saturate(120%)",
            WebkitBackdropFilter: "blur(var(--mcs-glass-blur)) saturate(120%)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: tone.panelStrong,
            border: `1px solid ${tone.border}`,
            boxShadow: tone.shadowLg,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
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
              backgroundColor: alpha(tone.accentStrong, mode === "dark" ? 0.08 : 0.05),
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
              backgroundColor: alpha(tone.accentStrong, mode === "dark" ? 0.06 : 0.04),
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
            fontWeight: 510,
            color: tone.textSecondary,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: controlFill,
            boxShadow: `inset 0 1px 0 ${subtleWhite}`,
            transition: `background-color ${duration} ${easing}, border-color ${duration} ${easing}, box-shadow ${duration} ${easing}`,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.borderStrong,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tone.accentStrong,
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${alpha(tone.accentStrong, mode === "dark" ? 0.18 : 0.1)}`,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: 999,
            backgroundColor: tone.accentStrong,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 42,
            textTransform: "none",
            fontWeight: 510,
            letterSpacing: "-0.01em",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            border: `1px solid ${tone.border}`,
            backgroundColor: tone.panelStrong,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(tone.text, mode === "dark" ? 0.08 : 0.08),
          },
          bar: {
            borderRadius: 999,
            backgroundColor: tone.accentStrong,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(tone.text, mode === "dark" ? 0.1 : 0.08),
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
