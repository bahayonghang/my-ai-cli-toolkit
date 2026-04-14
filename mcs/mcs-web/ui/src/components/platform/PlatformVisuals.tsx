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
  type TypographyProps,
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
          <stop offset="100%" stopColor={alpha(accentSecondary, 0.08)} />
        </linearGradient>
        <linearGradient id={`${safeId}-accent`} x1="6%" y1="6%" x2="94%" y2="94%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accentSecondary} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${safeId}-surface)`} />
      <path
        d="M12 18C12 14.6863 14.6863 12 18 12H46C50.4183 12 54 15.5817 54 20V46C54 50.4183 50.4183 54 46 54H18C14.6863 54 12 51.3137 12 48V18Z"
        fill={`url(#${safeId}-accent)`}
        opacity="0.92"
      />
      <path
        d="M17 13H33C26.461 14.132 21.132 19.461 20 26H15V15C15 13.8954 15.8954 13 17 13Z"
        fill="#FFFFFF"
        opacity="0.12"
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
        borderRadius: Math.max(12, Math.round(size * 0.26)),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1px solid ${alpha(accent, theme.palette.mode === "dark" ? 0.3 : 0.2)}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.03)
            : alpha(theme.palette.common.white, 0.96),
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 1px 0 ${alpha(theme.palette.common.white, 0.04)} inset`
            : `0 1px 0 ${alpha(theme.palette.common.white, 0.96)} inset`,
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
            borderRadius: 2,
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
  titleComponent = "div",
  size = 48,
}: {
  platformId?: string | null;
  name: string;
  fallbackIcon?: string | null;
  subtitle?: ReactNode;
  titleComponent?: TypographyProps["component"];
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
          component={titleComponent}
          sx={{ fontWeight: 590, lineHeight: 1.1, overflowWrap: "anywhere" }}
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
