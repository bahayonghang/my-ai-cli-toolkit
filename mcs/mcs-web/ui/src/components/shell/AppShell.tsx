import { useEffect, useMemo, useState, type ReactNode } from "react";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InstallDesktopRoundedIcon from "@mui/icons-material/InstallDesktopRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { entryPanelSx, monitorPanelSx, workbenchPanelSx } from "@/components/common/glassPanel";
import {
  PlatformBadge,
  PlatformIdentity,
} from "@/components/platform/PlatformVisuals";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useI18n } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";

export type ShellVariant = "entry" | "workbench" | "monitor";
export type PageSectionTone = ShellVariant | "subtle";
export type HeaderMode = "hero" | "compact";
export type SummaryMode = "none" | "strip" | "rail";

export interface MetricItem {
  key: string;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  emphasis?: boolean;
}

export interface FilterRailSection {
  id: string;
  title?: string;
  content: ReactNode;
}

export interface StickyActionBarProps {
  summary?: ReactNode;
  children: ReactNode;
}

const surfaceMap = {
  entry: entryPanelSx,
  workbench: workbenchPanelSx,
  monitor: monitorPanelSx,
} as const;

const backgroundMap = {
  entry: "entry",
  workbench: "workbench",
  monitor: "monitor",
} as const;

const headerAccentMap = {
  entry: "var(--mcs-entry-accent-strong)",
  workbench: "var(--mcs-workbench-accent-strong)",
  monitor: "var(--mcs-monitor-accent-strong)",
} as const;

function toneSurface(tone: PageSectionTone) {
  if (tone === "subtle") {
    return {
      border: "1px solid var(--mcs-shell-divider)",
      background:
        "linear-gradient(180deg, var(--mcs-shell-fill-strong) 0%, var(--mcs-shell-fill) 100%)",
      boxShadow: "var(--mcs-shadow-sm)",
    } as const;
  }

  return surfaceMap[tone];
}

function inferRouteSection(
  pathname: string,
): keyof typeof routeSectionMessageKey {
  if (pathname === "/") {
    return "overview";
  }
  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }
  if (pathname.startsWith("/install-hub")) {
    return "installHub";
  }
  if (pathname.includes("/npx-skills")) {
    return "registry";
  }
  if (pathname.includes("/legacy")) {
    return "legacy";
  }
  if (pathname.includes("/install")) {
    return "install";
  }
  if (pathname.startsWith("/platform/")) {
    return "workspace";
  }
  return "workspace";
}

const routeSectionMessageKey = {
  overview: "common.routeSection.overview",
  dashboard: "common.routeSection.dashboard",
  installHub: "common.routeSection.installHub",
  registry: "common.routeSection.registry",
  legacy: "common.routeSection.legacy",
  install: "common.routeSection.install",
  workspace: "common.routeSection.workspace",
} as const;

function renderHeading(
  title: ReactNode,
  subtitle?: ReactNode,
  eyebrow?: ReactNode,
) {
  const titleNode =
    typeof title === "string" ? (
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          letterSpacing: "-0.04em",
          textWrap: "balance",
          overflowWrap: "anywhere",
        }}
      >
        {title}
      </Typography>
    ) : (
      title
    );

  const subtitleNode =
    typeof subtitle === "string" ? (
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
        {subtitle}
      </Typography>
    ) : (
      subtitle
    );

  return (
    <Stack spacing={0.45} sx={{ minWidth: 0 }}>
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            letterSpacing: "0.14em",
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      {titleNode}
      {subtitle ? subtitleNode : null}
    </Stack>
  );
}

function ShellNavButton({
  label,
  subtitle,
  icon,
  active,
  onClick,
}: {
  label: ReactNode;
  subtitle?: ReactNode;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        borderRadius: 3,
        alignItems: "stretch",
        justifyContent: "stretch",
        border: "1px solid",
        borderColor: active
          ? "var(--mcs-workbench-outline-strong)"
          : "var(--mcs-shell-divider)",
        background: active
          ? "linear-gradient(180deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-panel-fill) 100%)"
          : "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill) 100%)",
        boxShadow: active ? "var(--mcs-shadow-sm)" : "none",
        px: 1.4,
        py: 1.25,
        transition:
          "transform var(--mcs-duration) var(--mcs-ease), border-color var(--mcs-duration) var(--mcs-ease), box-shadow var(--mcs-duration) var(--mcs-ease), background-color var(--mcs-duration) var(--mcs-ease)",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: active
            ? "var(--mcs-workbench-outline-strong)"
            : "var(--mcs-control-stroke-strong)",
        },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ width: "100%" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            border: "1px solid var(--mcs-panel-stroke-soft)",
            background:
              active
                ? "linear-gradient(180deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-panel-fill-emphasis) 100%)"
                : "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill) 100%)",
            color: active ? "var(--mcs-panel-accent)" : "text.secondary",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {label}
          </Typography>
          {subtitle ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <KeyboardArrowRightRoundedIcon
          fontSize="small"
          sx={{ color: active ? "var(--mcs-panel-accent)" : "text.disabled" }}
        />
      </Stack>
    </ButtonBase>
  );
}

export function AppShell({
  variant,
  title,
  subtitle,
  onBack,
  onHome,
  actions,
  children,
  maxWidth = 1520,
  filterRail,
  headerMode = "compact",
  summaryMode = "none",
}: {
  variant: ShellVariant;
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  onHome?: () => void;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: number;
  filterRail?: ReactNode;
  headerMode?: HeaderMode;
  summaryMode?: SummaryMode;
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigateDeferred = useNavigateDeferred();
  const location = useLocation();
  const platforms = usePlatformStore((state) => state.platforms);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const [navOpen, setNavOpen] = useState(false);
  const [backgroundVariant] = [backgroundMap[variant]];

  useEffect(() => {
    if (platforms.length === 0) {
      void fetchPlatforms();
    }
  }, [fetchPlatforms, platforms.length]);

  const routeSection = inferRouteSection(location.pathname);
  const activePlatformId = useMemo(() => {
    const match = location.pathname.match(/^\/platform\/([^/]+)/);
    return match?.[1] ?? null;
  }, [location.pathname]);

  const navContent = (
    <Stack spacing={2.25} sx={{ height: "100%" }}>
      <Box
        sx={{
          borderRadius: 4,
          border: "1px solid var(--mcs-control-stroke)",
          background:
            "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill) 100%)",
          boxShadow: "var(--mcs-shadow-sm)",
          p: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <PlatformBadge platformId="myclaude" name="MyClaude Skills" size={46} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
                MyClaude Skills
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t("common.controlPlaneSubtitle")}
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={t("common.controlPlaneLabel")}
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          />
        </Stack>
      </Box>

      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          {t("common.navigation")}
        </Typography>
        <ShellNavButton
          label={t("common.overview")}
          subtitle={t("common.overviewSubtitle")}
          icon={<WidgetsRoundedIcon fontSize="small" />}
          active={location.pathname === "/"}
          onClick={() => {
            navigateDeferred("/");
            setNavOpen(false);
          }}
        />
        <ShellNavButton
          label={t("common.dashboard")}
          subtitle={t("common.dashboardSubtitle")}
          icon={<DashboardRoundedIcon fontSize="small" />}
          active={location.pathname.startsWith("/dashboard")}
          onClick={() => {
            navigateDeferred("/dashboard");
            setNavOpen(false);
          }}
        />
        <ShellNavButton
          label={t("common.installHub")}
          subtitle={t("common.installHubSubtitle")}
          icon={<InstallDesktopRoundedIcon fontSize="small" />}
          active={location.pathname.startsWith("/install-hub")}
          onClick={() => {
            navigateDeferred("/install-hub");
            setNavOpen(false);
          }}
        />
      </Stack>

      <Divider sx={{ borderColor: "var(--mcs-shell-divider)" }} />

      <Stack spacing={1.1} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Typography variant="overline" color="text.secondary">
          {t("common.platformWorkspaces")}
        </Typography>
        <Stack spacing={0.9} sx={{ overflowY: "auto", pr: 0.25 }}>
          {platforms.map((platform) => (
            <ButtonBase
              key={platform.id}
              onClick={() => {
                navigateDeferred(`/platform/${platform.id}`);
                setNavOpen(false);
              }}
              sx={{
                width: "100%",
                textAlign: "left",
                borderRadius: 3,
                alignItems: "stretch",
                justifyContent: "stretch",
                border: "1px solid",
                borderColor:
                  activePlatformId === platform.id
                    ? "var(--mcs-workbench-outline-strong)"
                    : "var(--mcs-shell-divider)",
                background:
                  activePlatformId === platform.id
                    ? "linear-gradient(180deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-panel-fill) 100%)"
                    : "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill) 100%)",
                px: 1.2,
                py: 1.05,
                transition:
                  "transform var(--mcs-duration) var(--mcs-ease), border-color var(--mcs-duration) var(--mcs-ease)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  borderColor:
                    activePlatformId === platform.id
                      ? "var(--mcs-workbench-outline-strong)"
                      : "var(--mcs-control-stroke-strong)",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
                <PlatformBadge
                  platformId={platform.id}
                  name={platform.name}
                  fallbackIcon={platform.icon}
                  size={36}
                />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {platform.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {platform.id}
                  </Typography>
                </Box>
              </Stack>
            </ButtonBase>
          ))}
        </Stack>
      </Stack>

    </Stack>
  );

  return (
    <Box sx={{ minHeight: "100dvh", position: "relative" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1000,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          textDecoration: "none",
          transform: "translateY(-160%)",
          transition: "transform var(--mcs-duration) var(--mcs-ease)",
          "&:focus": {
            transform: "translateY(0)",
          },
        }}
      >
        {t("common.skipToContent")}
      </Box>

      <AnimatedBackground variant={backgroundVariant} />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: { md: "grid" },
          gridTemplateColumns: { md: "280px minmax(0, 1fr)" },
        }}
      >
        {!isMobile ? (
          <Box
            component="aside"
            sx={{
              position: "sticky",
              top: 0,
              height: "100dvh",
              px: 2,
              py: 2.5,
              borderRight: "1px solid var(--mcs-shell-divider)",
              background:
                "linear-gradient(180deg, var(--mcs-page-rail) 0%, var(--mcs-page-edge) 100%)",
            }}
          >
            {navContent}
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={navOpen}
            onClose={() => setNavOpen(false)}
            PaperProps={{
              sx: {
                width: 320,
                p: 2,
                bgcolor: "background.default",
                backgroundImage: "none",
              },
            }}
          >
            {navContent}
          </Drawer>
        )}

        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1.35, md: 1.75 },
              borderBottom: "1px solid var(--mcs-shell-divider)",
              backgroundColor: alpha(
                theme.palette.background.default,
                theme.palette.mode === "dark" ? 0.96 : 0.92,
              ),
            }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={{ xs: 1.25, lg: 2 }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
                {isMobile ? (
                  <IconButton
                    color="inherit"
                    aria-label={t("common.openNavigation")}
                    onClick={() => setNavOpen(true)}
                  >
                    <MenuRoundedIcon />
                  </IconButton>
                ) : null}
                {onBack ? (
                  <IconButton color="inherit" aria-label={t("common.back")} onClick={onBack}>
                    <KeyboardArrowRightRoundedIcon sx={{ transform: "rotate(180deg)" }} />
                  </IconButton>
                ) : null}
                {onHome ? (
                  <IconButton color="inherit" aria-label={t("common.home")} onClick={onHome}>
                    <HomeRoundedIcon />
                  </IconButton>
                ) : null}
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  {headerMode === "hero" ? (
                    <Typography
                      variant="overline"
                      sx={{
                        color: "text.secondary",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {t(routeSectionMessageKey[routeSection])}
                    </Typography>
                  ) : (
                    renderHeading(title, subtitle, t(routeSectionMessageKey[routeSection]))
                  )}
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
                sx={{ justifyContent: { xs: "flex-start", lg: "flex-end" } }}
              >
                {actions}
                <LanguageToggle />
                <ThemeToggleButton />
              </Stack>
            </Stack>
          </Box>

          <Box
            id="main-content"
            component="main"
            tabIndex={-1}
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 2.25, md: 3 },
              outline: "none",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth,
                mx: "auto",
                display: "grid",
                gap: summaryMode === "rail" ? 2.5 : 3,
                gridTemplateColumns:
                  filterRail && !isMobile
                    ? "minmax(250px, 290px) minmax(0, 1fr)"
                    : "minmax(0, 1fr)",
                alignItems: "start",
              }}
            >
              {filterRail && !isMobile ? (
                <Box sx={{ position: "sticky", top: 112 }}>{filterRail}</Box>
              ) : null}
              <Box sx={{ minWidth: 0 }}>{children}</Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function SectionHero({
  variant,
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  variant: ShellVariant;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <Box
      sx={{
        ...surfaceMap[variant],
        px: { xs: 2.5, md: 3.2 },
        py: { xs: 2.4, md: 3 },
        animation: "mcs-shell-rise 260ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Stack
        direction={{ xs: "column", xl: "row" }}
        spacing={2.2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", xl: "flex-start" }}
      >
        <Stack spacing={1.1} sx={{ minWidth: 0, maxWidth: 860 }}>
          {eyebrow ? (
            <Typography
              variant="overline"
              sx={{
                color: headerAccentMap[variant],
                letterSpacing: "0.14em",
              }}
            >
              {eyebrow}
            </Typography>
          ) : null}
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "2.1rem", md: "3rem" },
              lineHeight: 1.02,
              letterSpacing: "-0.06em",
              textWrap: "balance",
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 760, lineHeight: 1.75 }}
            >
              {description}
            </Typography>
          ) : null}
          {meta ? <Box>{meta}</Box> : null}
        </Stack>

        {actions ? (
          <Stack
            spacing={1}
            useFlexGap
            sx={{
              minWidth: { xs: "100%", xl: 280 },
              width: { xs: "100%", xl: "auto" },
            }}
          >
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export function MetricStrip({
  items,
  tone = "subtle",
  density = "feature",
}: {
  items: MetricItem[];
  tone?: PageSectionTone;
  density?: "feature" | "compact";
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          xl: `repeat(${Math.min(Math.max(items.length, 1), 4)}, minmax(0, 1fr))`,
        },
      }}
    >
      {items.map((item) => (
        <Box
          key={item.key}
          sx={{
            ...toneSurface(tone),
            borderRadius: 3.25,
            px: density === "compact" ? 1.6 : 2,
            py: density === "compact" ? 1.25 : 1.8,
            minHeight: density === "compact" ? 84 : 124,
          }}
        >
          {density === "compact" ? (
            <Stack spacing={0.75} sx={{ height: "100%", justifyContent: "space-between" }}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: item.emphasis ? 800 : 700,
                    letterSpacing: "-0.04em",
                    overflowWrap: "anywhere",
                    textAlign: "right",
                  }}
                >
                  {item.value}
                </Typography>
              </Stack>
              {item.detail ? (
                <Typography variant="caption" color="text.secondary">
                  {item.detail}
                </Typography>
              ) : null}
            </Stack>
          ) : (
            <Stack spacing={0.75} justifyContent="space-between" sx={{ height: "100%" }}>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: item.emphasis ? 800 : 700,
                  letterSpacing: "-0.04em",
                  overflowWrap: "anywhere",
                }}
              >
                {item.value}
              </Typography>
              {item.detail ? (
                <Typography variant="body2" color="text.secondary">
                  {item.detail}
                </Typography>
              ) : null}
            </Stack>
          )}
        </Box>
      ))}
    </Box>
  );
}

export function ListSurface({
  children,
  tone = "subtle",
  padded = true,
}: {
  children: ReactNode;
  tone?: PageSectionTone;
  padded?: boolean;
}) {
  return (
    <Box
      sx={{
        ...toneSurface(tone),
        borderRadius: 3.5,
        overflow: "hidden",
        p: padded ? { xs: 1.5, md: 2 } : 0,
      }}
    >
      {children}
    </Box>
  );
}

export function FilterRail({
  title,
  sections,
  mobileOpen = false,
  onCloseMobile,
}: {
  title?: ReactNode;
  sections: FilterRailSection[];
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const content = (
    <ListSurface tone="workbench">
      <Stack spacing={2}>
        {title ? (
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
        ) : null}
        {sections.map((section) => (
          <Stack key={section.id} spacing={1}>
            {section.title ? (
              <Typography variant="caption" color="text.secondary">
                {section.title}
              </Typography>
            ) : null}
            {section.content}
          </Stack>
        ))}
      </Stack>
    </ListSurface>
  );

  if (!isMobile) {
    return content;
  }

  return (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={onCloseMobile}
      PaperProps={{ sx: { width: 320, p: 2, bgcolor: "background.default" } }}
    >
      {content}
    </Drawer>
  );
}

export function ResponsiveFilterRail(props: {
  title?: ReactNode;
  sections: FilterRailSection[];
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  return <FilterRail {...props} />;
}

export function MobileFilterButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <IconButton color="inherit" aria-label="open filters" onClick={onClick}>
      <TuneRoundedIcon />
    </IconButton>
  );
}

export function MetaChips({ items }: { items: ReactNode[] }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {items.map((item, index) => (
        <Chip key={index} label={item} variant="outlined" />
      ))}
    </Stack>
  );
}

export function StickyActionBar({
  summary,
  children,
}: StickyActionBarProps) {
  return (
    <Box
      sx={{
        position: "sticky",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        zIndex: 6,
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Box
        sx={{
          ...workbenchPanelSx,
          px: { xs: 1.5, md: 2 },
          py: 1.35,
          borderColor: "var(--mcs-workbench-outline-strong)",
          background:
            "linear-gradient(180deg, var(--mcs-panel-fill-emphasis) 0%, var(--mcs-panel-fill-strong) 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          {summary ? (
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              {typeof summary === "string" ? (
                <Typography variant="body2" color="text.secondary">
                  {summary}
                </Typography>
              ) : (
                summary
              )}
            </Box>
          ) : null}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ justifyContent: { xs: "stretch", md: "flex-end" } }}
          >
            {children}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export function PlatformShellIdentity({
  platformId,
  name,
  fallbackIcon,
  subtitle,
}: {
  platformId?: string | null;
  name: string;
  fallbackIcon?: string | null;
  subtitle?: ReactNode;
}) {
  return (
    <PlatformIdentity
      platformId={platformId}
      name={name}
      fallbackIcon={fallbackIcon}
      subtitle={subtitle}
      size={42}
    />
  );
}
