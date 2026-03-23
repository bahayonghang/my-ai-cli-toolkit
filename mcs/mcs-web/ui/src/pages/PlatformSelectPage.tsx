import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import { useLegacyDirs } from "@/hooks/useLegacyDirs";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformStore } from "@/stores/platformStore";
import {
  AppShell,
  ListSurface,
  MetaChips,
  MetricStrip,
  SectionHero,
} from "@/components/shell/AppShell";
import {
  PlatformBadge,
  PlatformCapabilityChips,
} from "@/components/platform/PlatformVisuals";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  })),
);

export default function PlatformSelectPage() {
  const { t } = useI18n();
  const navigateDeferred = useNavigateDeferred();
  const platforms = usePlatformStore((state) => state.platforms);
  const loading = usePlatformStore((state) => state.loading);
  const error = usePlatformStore((state) => state.error);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const refreshPlatforms = usePlatformStore((state) => state.refreshPlatforms);
  const { legacyCount, refreshLegacyCount } = useLegacyDirs();
  const [legacyOpen, setLegacyOpen] = useState(false);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  const firstPlatformId = platforms[0]?.id ?? null;
  const sharedPathCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const platform of platforms) {
      counts.set(
        platform.skills_path,
        (counts.get(platform.skills_path) ?? 0) + 1,
      );
    }
    return counts;
  }, [platforms]);

  const metricItems = [
    {
      key: "platforms",
      label: t("platformSelect.availablePlatforms"),
      value: platforms.length,
      detail: t("platformSelect.libraryTitle"),
      emphasis: true,
    },
    {
      key: "hub",
      label: t("platformSelect.unifiedInstallLabel"),
      value: t("platformSelect.unifiedInstallTitle"),
      detail: t("platformSelect.subtitle"),
    },
    {
      key: "npx",
      label: t("platformSelect.npxSkillsLabel"),
      value: t("platformSelect.npxSkillsTitle"),
      detail: t("platformSelect.librarySubtitle"),
    },
  ];

  if (loading && platforms.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppShell
      variant="entry"
      title={t("platformSelect.title")}
      subtitle={t("platformSelect.subtitle")}
      actions={
        <>
          <Button
            variant="outlined"
            onClick={() => {
              void refreshPlatforms();
              refreshLegacyCount();
            }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            disabled={loading}
          >
            {t("platformSelect.refreshButton")}
          </Button>
          {legacyCount > 0 ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<WarningAmberIcon />}
              onClick={() => setLegacyOpen(true)}
            >
              {t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
            </Button>
          ) : null}
        </>
      }
      maxWidth={1480}
    >
      <Stack spacing={3}>
        <SectionHero
          variant="entry"
          eyebrow={t("platformSelect.heroEyebrow")}
          title={t("platformSelect.title")}
          description={t("platformSelect.subtitle")}
          meta={
            <MetaChips
              items={[
                t("platformSelect.availablePlatforms"),
                t("platformSelect.unifiedInstallLabel"),
                t("platformSelect.npxSkillsLabel"),
              ]}
            />
          }
          actions={
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<InstallDesktopIcon />}
                onClick={() => navigateDeferred("/install-hub")}
              >
                {t("platformSelect.primaryAction")}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DashboardCustomizeIcon />}
                onClick={() => navigateDeferred("/dashboard")}
              >
                {t("platformSelect.dashboardAction")}
              </Button>
              <Button
                variant="text"
                size="large"
                startIcon={<TerminalIcon />}
                disabled={!firstPlatformId}
                onClick={() => {
                  if (firstPlatformId) {
                    navigateDeferred(`/platform/${firstPlatformId}/npx-skills`);
                  }
                }}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("platformSelect.npxAction")}
              </Button>
            </>
          }
        />

        <MetricStrip items={metricItems} tone="entry" />

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={1.25}>
          <Typography variant="overline" color="text.secondary">
            {t("platformSelect.platformWorkspaceLabel")}
          </Typography>
          <Typography variant="h4" sx={{ letterSpacing: "-0.05em" }}>
            {t("platformSelect.libraryTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t("platformSelect.librarySubtitle")}
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {platforms.map((platform) => {
            const libraryScope =
              (sharedPathCounts.get(platform.skills_path) ?? 0) > 1
                ? t("platformSelect.sharedLibrary")
                : t("platformSelect.dedicatedLibrary");

            return (
              <ListSurface key={platform.id} tone="entry">
                <Button
                  fullWidth
                  color="inherit"
                  onClick={() => navigateDeferred(`/platform/${platform.id}`)}
                  sx={{
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    textTransform: "none",
                    p: 0,
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: { xs: "1fr", lg: "82px minmax(0, 1fr) minmax(300px, 0.7fr)" },
                      alignItems: "start",
                    }}
                  >
                    <Box
                      sx={{
                        pt: 0.2,
                      }}
                    >
                      <PlatformBadge
                        platformId={platform.id}
                        name={platform.name}
                        fallbackIcon={platform.icon}
                        size={68}
                      />
                    </Box>

                    <Stack spacing={1.1} sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                        <Typography variant="overline" color="text.secondary">
                          {platform.id}
                        </Typography>
                        <Chip label={libraryScope} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="h5" sx={{ letterSpacing: "-0.04em", textAlign: "left" }}>
                        {platform.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                        {t("platformSelect.librarySubtitle")}
                      </Typography>
                      <PlatformCapabilityChips platform={platform} />
                    </Stack>

                    <Stack spacing={0.75} sx={{ minWidth: 0, textAlign: "left" }}>
                      <Typography variant="caption" color="text.secondary">
                        {t("platformSelect.skillsPathLabel")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                        {platform.skills_path}
                      </Typography>
                    </Stack>
                  </Box>
                </Button>
              </ListSurface>
            );
          })}
        </Stack>
      </Stack>

      <Suspense
        fallback={
          <CircularProgress size={24} sx={{ position: "fixed", bottom: 24, right: 24 }} />
        }
      >
        <LegacyCleanupDialog
          open={legacyOpen}
          onClose={() => {
            setLegacyOpen(false);
            refreshLegacyCount();
          }}
        />
      </Suspense>
    </AppShell>
  );
}
