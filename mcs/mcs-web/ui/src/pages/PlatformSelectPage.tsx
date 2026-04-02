import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  ChartPieSlice,
  Command,
  DownloadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useLegacyDirs } from "@/hooks/useLegacyDirs";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformStore } from "@/stores/platformStore";
import {
  AppShell,
  ListSurface,
  SectionHero,
} from "@/components/shell/AppShell";
import {
  PlatformBadge,
  PlatformCapabilityChips,
} from "@/components/platform/PlatformVisuals";
import PageLoadingState from "@/components/common/PageLoadingState";

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

  if (loading && platforms.length === 0) {
    return <PageLoadingState message={t("common.loading")} />;
  }

  return (
    <AppShell
      variant="entry"
      title={t("platformSelect.title")}
      subtitle={t("platformSelect.subtitle")}
      headerMode="hero"
      actions={
        <>
            <Button
              variant="outlined"
              onClick={() => {
                void refreshPlatforms();
                refreshLegacyCount();
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ArrowsClockwise size={16} weight="bold" />
                )
              }
              disabled={loading}
            >
              {t("platformSelect.refreshButton")}
            </Button>
          {legacyCount > 0 ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<WarningCircle size={16} weight="bold" />}
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
          titleComponent="h1"
          description={t("platformSelect.subtitle")}
          actions={
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadSimple size={18} weight="bold" />}
                onClick={() => navigateDeferred("/install-hub")}
              >
                {t("platformSelect.primaryAction")}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ChartPieSlice size={18} weight="bold" />}
                onClick={() => navigateDeferred("/dashboard")}
              >
                {t("platformSelect.dashboardAction")}
              </Button>
              <Button
                variant="text"
                size="large"
                startIcon={<Command size={18} weight="bold" />}
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

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={1.25}>
          <Typography variant="overline" color="text.secondary">
            {t("platformSelect.platformWorkspaceLabel")}
          </Typography>
          <Typography variant="h4" component="h2" sx={{ letterSpacing: "-0.05em" }}>
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
                      gridTemplateColumns: { xs: "1fr", lg: "82px minmax(0, 1fr) minmax(240px, 0.7fr)" },
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
