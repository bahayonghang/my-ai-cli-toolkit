import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import HomeIcon from "@mui/icons-material/Home";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { InstallExecutionPanel } from "@/components/install-hub/InstallExecutionPanel";
import { PlatformTargetPanel } from "@/components/install-hub/PlatformTargetPanel";
import { SkillCatalogPanel } from "@/components/install-hub/SkillCatalogPanel";
import { useI18n } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import type { PlatformDisplay } from "@/types";
import { useUnifiedInstallHub } from "./useUnifiedInstallHub";

export default function UnifiedInstallHubPage() {
  const navigate = useNavigate();
  const { platforms, fetchPlatforms, refreshPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();
  const model = useUnifiedInstallHub({
    platforms,
    fetchPlatforms,
    refreshPlatforms,
    notify: showNotification,
  });

  if (model.loadingCatalog && model.catalog.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground />
      <PageToolbar
        colorMode={colorMode}
        onHome={() => navigate("/")}
        onToggleTheme={toggleColorMode}
      />
      <PageBody model={model} platforms={platforms} />
      <NotificationSnackbar />
    </Box>
  );
}

function LoadingScreen() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}

function PageToolbar({
  colorMode,
  onHome,
  onToggleTheme,
}: {
  colorMode: "light" | "dark";
  onHome: () => void;
  onToggleTheme: () => void;
}) {
  const { t } = useI18n();
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton color="inherit" onClick={onHome}>
          <ArrowBackIcon />
        </IconButton>
        <Tooltip title={t("common.home")}>
          <IconButton color="inherit" onClick={onHome}>
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("installHub.pageTitle")}
        </Typography>
        <LanguageToggle sx={{ mr: 1 }} />
        <IconButton color="inherit" onClick={onToggleTheme}>
          {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

function PageBody({
  model,
  platforms,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
  platforms: PlatformDisplay[];
}) {
  return (
    <Box sx={{ pt: 10, px: 3, pb: 3, position: "relative", zIndex: 1 }}>
      {model.catalogError && <Alert severity="error" sx={{ mb: 2 }}>{model.catalogError}</Alert>}
      <InstallHubGrid model={model} platforms={platforms} />
    </Box>
  );
}

function InstallHubGrid({
  model,
  platforms,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
  platforms: PlatformDisplay[];
}) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 5 }}>
        <SkillCatalogColumn model={model} />
      </Grid>
      <Grid size={{ xs: 12, lg: 3 }}>
        <PlatformColumn model={model} platforms={platforms} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ExecutionColumn model={model} />
      </Grid>
    </Grid>
  );
}

function SkillCatalogColumn({
  model,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
}) {
  return (
    <SkillCatalogPanel
      categories={model.categories}
      defaultOnly={model.defaultOnly}
      search={model.search}
      selectedCategory={model.selectedCategory}
      selectedSkills={model.selectedSkills}
      skills={model.filteredSkills}
      totalCount={model.catalog.length}
      onCategoryChange={model.setSelectedCategory}
      onClearSelection={() => model.setSelectedSkills(new Set())}
      onDefaultOnlyChange={model.setDefaultOnly}
      onSearchChange={model.setSearch}
      onSelectAllFiltered={() =>
        model.setSelectedSkills(new Set(model.filteredSkills.map((skill) => skill.name)))
      }
      onToggleSkill={(name) => model.setSelectedSkills((previous) => toggleInSet(previous, name))}
    />
  );
}

function PlatformColumn({
  model,
  platforms,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
  platforms: PlatformDisplay[];
}) {
  return (
    <PlatformTargetPanel
      disabled={model.execution.running}
      platforms={platforms}
      selectedPlatforms={model.selectedPlatforms}
      onClearSelection={() => model.setSelectedPlatforms(new Set())}
      onSelectAll={() => model.setSelectedPlatforms(new Set(platforms.map((platform) => platform.id)))}
      onTogglePlatform={(platformId) =>
        model.setSelectedPlatforms((previous) => toggleInSet(previous, platformId))
      }
    />
  );
}

function ExecutionColumn({
  model,
}: {
  model: ReturnType<typeof useUnifiedInstallHub>;
}) {
  return (
    <InstallExecutionPanel
      execution={model.execution}
      results={model.results}
      selectedPlatformCount={model.selectedPlatforms.size}
      selectedSkillCount={model.selectedSkills.size}
      onClearResults={() => model.setResults([])}
      onInstall={model.runInstall}
    />
  );
}

function toggleInSet<T>(source: Set<T>, value: T): Set<T> {
  const next = new Set(source);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
