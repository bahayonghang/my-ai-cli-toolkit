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
import { useI18n } from "@/i18n";
import type { PlatformDisplay } from "@/types";

interface PlatformVisualDefinition {
  glyph: string;
  accent: string;
  accentSecondary: string;
  glow: string;
}

const defaultVisual: PlatformVisualDefinition = {
  glyph: "MC",
  accent: "#2563EB",
  accentSecondary: "#14B8A6",
  glow: "#DBEAFE",
};

const platformVisualRegistry: Record<string, PlatformVisualDefinition> = {
  claude: {
    glyph: "CL",
    accent: "#D97706",
    accentSecondary: "#F97316",
    glow: "#FFEDD5",
  },
  codex: {
    glyph: "</>",
    accent: "#2563EB",
    accentSecondary: "#7C3AED",
    glow: "#DBEAFE",
  },
  gemini: {
    glyph: "GM",
    accent: "#0EA5E9",
    accentSecondary: "#10B981",
    glow: "#CCFBF1",
  },
  cursor: {
    glyph: "CS",
    accent: "#1D4ED8",
    accentSecondary: "#22C55E",
    glow: "#DCFCE7",
  },
  copilot: {
    glyph: "CP",
    accent: "#0F172A",
    accentSecondary: "#2563EB",
    glow: "#E2E8F0",
  },
  amp: {
    glyph: "AM",
    accent: "#7C3AED",
    accentSecondary: "#2563EB",
    glow: "#EDE9FE",
  },
  kimi: {
    glyph: "KM",
    accent: "#DB2777",
    accentSecondary: "#8B5CF6",
    glow: "#FCE7F3",
  },
  qwen: {
    glyph: "QW",
    accent: "#0F766E",
    accentSecondary: "#14B8A6",
    glow: "#CCFBF1",
  },
  cline: {
    glyph: "CN",
    accent: "#1D4ED8",
    accentSecondary: "#38BDF8",
    glow: "#E0F2FE",
  },
  opencode: {
    glyph: "OC",
    accent: "#334155",
    accentSecondary: "#0EA5E9",
    glow: "#E2E8F0",
  },
};

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
        border: `1px solid ${alpha(visual.accent, theme.palette.mode === "dark" ? 0.34 : 0.16)}`,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(visual.glow, 0.08)} 0%, ${alpha(visual.accent, 0.16)} 100%)`
            : `linear-gradient(180deg, ${alpha(visual.glow, 0.92)} 0%, ${alpha(visual.accent, 0.16)} 100%)`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 14px 32px ${alpha(visual.accent, 0.22)}`
            : `0 10px 24px ${alpha(visual.accent, 0.14)}`,
        overflow: "hidden",
      }}
    >
      <PlatformBadgeSvg
        glyph={visual.glyph}
        accent={visual.accent}
        accentSecondary={visual.accentSecondary}
        glow={visual.glow}
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
    "supports_agents" | "supports_commands" | "supports_guidance"
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
      label: t("common.commands"),
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
