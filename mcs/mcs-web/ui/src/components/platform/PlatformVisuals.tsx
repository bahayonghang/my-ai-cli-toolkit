import type { ReactElement, ReactNode } from "react";
import AutoAwesomeMotionRoundedIcon from "@mui/icons-material/AutoAwesomeMotionRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import {
  alpha,
  Box,
  Chip,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useI18n } from "@/i18n";
import type { PlatformDisplay } from "@/types";
import { getPlatformCommandsLabel } from "@/utils/platformLabels";

interface PlatformVisualDefinition {
  glyph: string;
  tone: "primary" | "warning" | "secondary" | "success" | "info" | "neutral";
  toneSecondary?: "primary" | "warning" | "secondary" | "success" | "info" | "neutral";
}

const defaultVisual: PlatformVisualDefinition = {
  glyph: "MC",
  tone: "primary",
  toneSecondary: "info",
};

const platformVisualRegistry: Record<string, PlatformVisualDefinition> = {
  claude: {
    glyph: "CL",
    tone: "warning",
    toneSecondary: "primary",
  },
  codex: {
    glyph: "</>",
    tone: "primary",
    toneSecondary: "secondary",
  },
  gemini: {
    glyph: "GM",
    tone: "info",
    toneSecondary: "success",
  },
  cursor: {
    glyph: "CS",
    tone: "primary",
    toneSecondary: "success",
  },
  copilot: {
    glyph: "CP",
    tone: "neutral",
    toneSecondary: "primary",
  },
  amp: {
    glyph: "AM",
    tone: "secondary",
    toneSecondary: "primary",
  },
  kimi: {
    glyph: "KM",
    tone: "secondary",
    toneSecondary: "warning",
  },
  qwen: {
    glyph: "QW",
    tone: "success",
    toneSecondary: "info",
  },
  cline: {
    glyph: "CN",
    tone: "primary",
    toneSecondary: "info",
  },
  opencode: {
    glyph: "OC",
    tone: "neutral",
    toneSecondary: "info",
  },
};

function resolveToneColor(
  theme: Theme,
  tone: PlatformVisualDefinition["tone"],
) {
  switch (tone) {
    case "warning":
      return theme.palette.warning.main;
    case "secondary":
      return theme.palette.secondary.main;
    case "success":
      return theme.palette.success.main;
    case "info":
      return theme.palette.info.main;
    case "neutral":
      return theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.78)
        : alpha(theme.palette.text.primary, 0.78);
    case "primary":
    default:
      return theme.palette.primary.main;
  }
}

function getPlatformVisual(platformId: string | null | undefined, fallback?: string) {
  if (platformId) {
    const exact = platformVisualRegistry[platformId.toLowerCase()];
    if (exact) {
      return exact;
    }
  }

  if (fallback?.trim()) {
    const normalized = fallback.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase();
    if (normalized) {
      return { ...defaultVisual, glyph: normalized };
    }
  }

  return defaultVisual;
}

function PlatformBadgeSvg({
  glyph,
  accent,
  accentSecondary,
  glow,
  label,
}: {
  glyph: string;
  accent: string;
  accentSecondary: string;
  glow: string;
  label: string;
}) {
  const safeId = label.replace(/[^a-zA-Z0-9_-]/g, "-");

  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`${safeId}-surface`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={glow} />
          <stop offset="58%" stopColor={alpha(accent, 0.22)} />
          <stop offset="100%" stopColor={alpha(accentSecondary, 0.3)} />
        </linearGradient>
        <linearGradient id={`${safeId}-accent`} x1="6%" y1="6%" x2="94%" y2="94%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accentSecondary} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="18" fill={`url(#${safeId}-surface)`} />
      <path
        d="M14 25C14 17.82 19.82 12 27 12H49C51.7614 12 54 14.2386 54 17V39C54 46.18 48.18 52 41 52H19C16.2386 52 14 49.7614 14 47V25Z"
        fill={`url(#${safeId}-accent)`}
        opacity="0.94"
      />
      <path
        d="M18 14H33C24.1634 15.3053 17.3053 22.1634 16 31V16C16 14.8954 16.8954 14 18 14Z"
        fill="#FFFFFF"
        opacity="0.18"
      />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        fontSize={glyph.length > 2 ? "13" : "16"}
        letterSpacing={glyph.length > 2 ? "-0.06em" : "0.02em"}
      >
        {glyph}
      </text>
    </svg>
  );
}

export function PlatformBadge({
  platformId,
  name,
  fallbackIcon,
  size = 48,
}: {
  platformId?: string | null;
  name: string;
  fallbackIcon?: string | null;
  size?: number;
}) {
  const theme = useTheme();
  const visual = getPlatformVisual(platformId, fallbackIcon ?? name);
  const label = `${platformId ?? name}-badge`;
  const accent = resolveToneColor(theme, visual.tone);
  const accentSecondary = resolveToneColor(
    theme,
    visual.toneSecondary ?? (visual.tone === "primary" ? "secondary" : "primary"),
  );
  const glow = alpha(accent, theme.palette.mode === "dark" ? 0.22 : 0.16);

  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        borderRadius: Math.max(14, Math.round(size * 0.34)),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1px solid ${alpha(accent, theme.palette.mode === "dark" ? 0.26 : 0.18)}`,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(accent, 0.14)} 0%, ${alpha(accentSecondary, 0.08)} 100%)`
            : `linear-gradient(180deg, ${alpha(accent, 0.12)} 0%, ${alpha(accentSecondary, 0.06)} 100%)`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 10px 24px ${alpha(accent, 0.14)}`
            : `0 8px 18px ${alpha(accent, 0.1)}`,
        overflow: "hidden",
      }}
    >
      <PlatformBadgeSvg
        glyph={visual.glyph}
        accent={accent}
        accentSecondary={accentSecondary}
        glow={glow}
        label={label}
      />
    </Box>
  );
}

function CapabilityChip({
  icon,
  label,
  compact = false,
}: {
  icon: ReactElement;
  label: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Tooltip title={label}>
        <Box
          component="span"
          sx={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "1px solid var(--mcs-panel-stroke-soft)",
            backgroundColor: "var(--mcs-panel-fill-emphasis)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          {icon}
        </Box>
      </Tooltip>
    );
  }

  return <Chip size="small" icon={icon} label={label} variant="outlined" />;
}

export function PlatformCapabilityChips({
  platform,
  compact = false,
}: {
  platform: Pick<
    PlatformDisplay,
    "id" | "commands_path" | "supports_agents" | "supports_commands" | "supports_guidance"
  >;
  compact?: boolean;
}) {
  const { t } = useI18n();

  const capabilities = [
    {
      key: "skills",
      label: t("common.skills"),
      icon: <AutoAwesomeMotionRoundedIcon fontSize="inherit" />,
      visible: true,
    },
    {
      key: "commands",
      label: getPlatformCommandsLabel(platform, t),
      icon: <TerminalRoundedIcon fontSize="inherit" />,
      visible: Boolean(platform.supports_commands),
    },
    {
      key: "guidance",
      label: t("common.guidance"),
      icon: <DescriptionOutlinedIcon fontSize="inherit" />,
      visible: Boolean(platform.supports_guidance),
    },
    {
      key: "agents",
      label: t("common.agents"),
      icon: <SmartToyOutlinedIcon fontSize="inherit" />,
      visible: Boolean(platform.supports_agents),
    },
  ].filter((capability) => capability.visible);

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {capabilities.map((capability) => (
        <CapabilityChip
          key={capability.key}
          icon={capability.icon}
          label={capability.label}
          compact={compact}
        />
      ))}
    </Stack>
  );
}

export function PlatformIdentity({
  platformId,
  name,
  fallbackIcon,
  subtitle,
  size = 48,
}: {
  platformId?: string | null;
  name: string;
  fallbackIcon?: string | null;
  subtitle?: ReactNode;
  size?: number;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <PlatformBadge
        platformId={platformId}
        name={name}
        fallbackIcon={fallbackIcon}
        size={size}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{ fontWeight: 700, lineHeight: 1.1, overflowWrap: "anywhere" }}
        >
          {name}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: "anywhere" }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
