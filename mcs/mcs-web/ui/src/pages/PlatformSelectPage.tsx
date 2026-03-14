import { lazy, Suspense, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import RefreshIcon from "@mui/icons-material/Refresh";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { getLegacyDirs } from "@/api/client";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformStore } from "@/stores/platformStore";

const LegacyCleanupDialog = lazy(() =>
  import("@/components/dialogs/LegacyCleanupDialog").then((module) => ({
    default: module.LegacyCleanupDialog,
  }))
);

export default function PlatformSelectPage() {
  const { t } = useI18n();
  const navigateDeferred = useNavigateDeferred();
  const platforms = usePlatformStore((state) => state.platforms);
  const loading = usePlatformStore((state) => state.loading);
  const error = usePlatformStore((state) => state.error);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const refreshPlatforms = usePlatformStore((state) => state.refreshPlatforms);
  const [legacyCount, setLegacyCount] = useState(0);
  const [legacyOpen, setLegacyOpen] = useState(false);

  const refreshLegacyCount = () => {
    getLegacyDirs()
      .then((dirs) => setLegacyCount(dirs.length))
      .catch(() => setLegacyCount(0));
  };

  useEffect(() => {
    void fetchPlatforms();
    refreshLegacyCount();
  }, [fetchPlatforms]);

  if (loading && platforms.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground variant="hero" />
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
          gap={3}
          sx={{ mb: 5 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              {t("platformSelect.quickAccess")}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 1 }}>
              {t("platformSelect.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              {t("platformSelect.subtitle")}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
            <LanguageToggle />
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
            {legacyCount > 0 && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<WarningAmberIcon />}
                onClick={() => setLegacyOpen(true)}
              >
                {t("platformSelect.legacyCleanupLabel", { count: legacyCount })}
              </Button>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4, alignItems: "stretch" }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              title={t("platformSelect.unifiedInstallLabel")}
              description={t("platformSelect.unifiedInstallTitle")}
              icon={<InstallDesktopIcon color="primary" />}
              onClick={() => navigateDeferred("/install-hub")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              title={t("platformSelect.dashboardLabel")}
              description={t("platformSelect.dashboardTitle")}
              icon={<DashboardCustomizeIcon color="primary" />}
              onClick={() => navigateDeferred("/dashboard")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <ShortcutCard
              title={t("platformSelect.npxSkillsLabel")}
              description={t("platformSelect.npxSkillsTitle")}
              icon={<TerminalIcon color={platforms.length > 0 ? "primary" : "disabled"} />}
              disabled={platforms.length === 0}
              onClick={() => {
                const first = platforms[0];
                if (first) navigateDeferred(`/platform/${first.id}/npx-skills`);
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" color="text.secondary">
            {t("platformSelect.availablePlatforms")}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {platforms.map((platform) => (
            <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card>
                <CardActionArea
                  onClick={() => navigateDeferred(`/platform/${platform.id}`)}
                  sx={{ height: "100%", minHeight: 156, alignItems: "stretch" }}
                >
                  <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5, p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
                        {platform.icon}
                      </Typography>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                          {platform.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {platform.id}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ minWidth: 0 }}>
                      <Chip
                        label={t("common.platform")}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {platform.skills_path}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Suspense fallback={null}>
        <LegacyCleanupDialog
          open={legacyOpen}
          onClose={() => {
            setLegacyOpen(false);
            refreshLegacyCount();
          }}
        />
      </Suspense>
    </Box>
  );
}

function ShortcutCard({
  title,
  description,
  icon,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        opacity: disabled ? 0.5 : 1,
        flex: 1,
        minWidth: 0,
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={disabled}
        sx={{ height: "100%", minHeight: 128, alignItems: "stretch" }}
      >
        <CardContent sx={{ height: "100%", display: "flex", alignItems: "center", gap: 2, p: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0, display: "grid", alignContent: "center" }}>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
