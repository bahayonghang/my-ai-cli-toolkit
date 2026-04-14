import { lazy, Suspense, useEffect, useState } from "react";
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
import { getSkillsLibrarySupportText } from "@/utils/platformLibrary";
import {
  AppShell,
  ListSurface,
  MetricStrip,
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
  const { locale, t } = useI18n();
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
          meta={
            <MetricStrip
              tone="entry"
              density="compact"
              items={[
                {
                  key: "platforms",
                  label: t("common.platformWorkspaces"),
                  value: platforms.length,
                  detail: t("common.controlPlaneLabel"),
                  emphasis: true,
                },
                {
                  key: "shared",
                  label: t("common.skillsLibraryLabel"),
                  value: platforms.filter((platform) => platform.skills_library_kind === "shared").length,
                  detail: t("platformSelect.sharedLibrary"),
                },
                {
                  key: "legacy",
                  label: t("dialogs.legacyCleanupTitle"),
                  value: legacyCount,
                  detail:
                    legacyCount > 0
                      ? t("platformSelect.legacyCleanupTooltip")
                      : t("dialogs.legacyCleanupEmpty"),
                },
              ]}
            />
          }
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
                    navigateDeferred(`/npx-skills?workspace=${encodeURIComponent(firstPlatformId)}`);
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
              platform.skills_library_kind === "shared"
                ? t("platformSelect.sharedLibrary")
                : t("platformSelect.dedicatedLibrary");
            const librarySupport = getSkillsLibrarySupportText({
              platform,
              platforms,
              locale,
              t,
            });

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
                      gridTemplateColumns: {
                        xs: "1fr",
                        lg: "72px minmax(0, 1.1fr) minmax(240px, 0.7fr) auto",
                      },
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
                        size={60}
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
                      <PlatformCapabilityChips platform={platform} />
                    </Stack>

                    <Stack spacing={0.75} sx={{ minWidth: 0, textAlign: "left" }}>
                      <Typography variant="caption" color="text.secondary">
                        {t("platformSelect.skillsPathLabel")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                        {platform.skills_path}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {t("common.skillsLibraryLabel")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                        {librarySupport}
                      </Typography>
                    </Stack>

                    <Stack
                      spacing={0.6}
                      sx={{
                        minWidth: 0,
                        alignItems: { xs: "flex-start", lg: "flex-end" },
                        textAlign: { xs: "left", lg: "right" },
                      }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        {t("common.platform")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 590 }}>
                        {t("common.platformWorkspaces")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("common.platformWorkspaceTitle", {
                          content: t("common.skills"),
                          platform: platform.name,
                        })}
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
