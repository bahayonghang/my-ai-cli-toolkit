import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import { uninstallAgents, uninstallCommands, uninstallSkills } from "@/api/client";
import { useI18n } from "@/i18n";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import {
  AppShell,
  MobileFilterButton,
  PlatformShellIdentity,
} from "@/components/shell/AppShell";
import { StatusChip } from "@/components/common/StatusChip";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformItemsData } from "@/hooks/usePlatformItemsData";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import type { PlatformDisplay } from "@/types";
import { summarizeSkillDescription } from "@/utils/skillDescription";
import { getPlatformCommandsLabel } from "@/utils/platformLabels";
import {
  PlatformBadge,
  PlatformCapabilityChips,
} from "@/components/platform/PlatformVisuals";
const DetailDrawer = lazy(() =>
  import("@/components/dialogs/DetailDrawer").then((module) => ({
    default: module.DetailDrawer,
  }))
);
const DiffDialog = lazy(() =>
  import("@/components/dialogs/DiffDialog").then((module) => ({
    default: module.DiffDialog,
  }))
);
const PromptDialog = lazy(() =>
  import("@/components/dialogs/PromptDialog").then((module) => ({
    default: module.PromptDialog,
  }))
);
const MultiSyncDialog = lazy(() =>
  import("@/components/dialogs/MultiSyncDialog").then((module) => ({
    default: module.MultiSyncDialog,
  }))
);

type TabValue = "skills" | "commands" | "agents";

export default function MainPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigateDeferred = useNavigateDeferred();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const platform = usePlatformStore((state) =>
    state.platforms.find((entry) => entry.id === platformId)
  );
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const showNotification = useUiStore((state) => state.showNotification);
  const [activeTab, setActiveTab] = useState<TabValue>("skills");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(search, 300);
  const itemType =
    activeTab === "skills" ? "skill" : activeTab === "commands" ? "command" : "agent";
  const selectedCount = selectedNames.size;
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [detailName, setDetailName] = useState<string | null>(null);
  const [diffName, setDiffName] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"uninstall" | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    setSelectedNames(new Set());
    setSelectedCategory(null);
    setSearch("");
  }, [platformId]);

  useEffect(() => {
    if (!isMobile) {
      setFilterDrawerOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (activeTab === "commands" && platform?.supports_commands === false) {
      setActiveTab("skills");
    }
    if (activeTab === "agents" && platform?.supports_agents === false) {
      setActiveTab("skills");
    }
  }, [activeTab, platform?.supports_agents, platform?.supports_commands]);

  const {
    items,
    categories,
    loading,
    error,
    refresh,
  } = usePlatformItemsData({
    platformId,
    activeTab,
    search: debouncedSearch,
    selectedCategory,
  });

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.item_type === itemType),
    [categories, itemType]
  );
  const currentTabLabel =
    activeTab === "skills"
      ? t("common.skills")
      : activeTab === "commands"
        ? getPlatformCommandsLabel(platform, t)
        : t("common.agents");
  const totalVisibleCount = items.length;
  const totalCategoryCount = visibleCategories.reduce((sum, category) => sum + category.count, 0);
  const activeFilterLabel = selectedCategory ?? t("common.all");

  const toggleSelection = (name: string) => {
    setSelectedNames((previous) => {
      const next = new Set(previous);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedNames(new Set());
  const selectAll = () => setSelectedNames(new Set(items.map((item) => item.name)));
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    clearSelection();
    setSearch("");
    setSelectedCategory(null);
  };

  const handleUninstall = async () => {
    if (!platformId || selectedCount === 0) {
      return;
    }

    setConfirmAction(null);
    const names = Array.from(selectedNames);

    try {
      const result =
        activeTab === "skills"
          ? await uninstallSkills(platformId, names)
          : activeTab === "commands"
            ? await uninstallCommands(platformId, names)
            : await uninstallAgents(platformId, names);
      showNotification(
        t("dialogs.uninstallCompletedSummary", {
          success: result.success_count,
          failedSuffix:
            result.failure_count > 0
              ? `, ${t("npxSkills.jobFailed", { count: result.failure_count })}`
              : "",
        }),
        result.failure_count > 0 ? "warning" : "success"
      );
      clearSelection();
      await refresh();
    } catch (errorValue) {
      showNotification((errorValue as Error).message, "error");
    }
  };

  const pageLoading = loading && items.length === 0;
  const showInlineProgress = loading && items.length > 0;

  return (
    <AppShell
      variant="workbench"
      title={
        <PlatformShellIdentity
          platformId={platform?.id ?? platformId}
          name={platform?.name ?? platformId ?? t("common.unknown")}
          fallbackIcon={platform?.icon}
          subtitle={currentTabLabel}
        />
      }
      subtitle={currentTabLabel}
      onBack={() => navigateDeferred("/")}
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          {isMobile ? <MobileFilterButton onClick={() => setFilterDrawerOpen(true)} /> : null}
          <IconButton
            color="inherit"
            aria-label={t("common.openGuidance")}
            onClick={() => setPromptOpen(true)}
          >
            <DescriptionOutlinedIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label={t("common.syncSelection")}
            onClick={() => setSyncOpen(true)}
            disabled={selectedCount === 0}
          >
            <SyncIcon />
          </IconButton>
        </>
      }
    >

      {isMobile && (
        <Drawer
          anchor="left"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { width: 300, p: 2 } }}
        >
          <FiltersPanel
            activeTab={activeTab}
            categories={visibleCategories}
            selectedCategory={selectedCategory}
            platform={platform}
            onTabChange={handleTabChange}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setFilterDrawerOpen(false);
            }}
            t={t}
          />
        </Drawer>
      )}

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {!isMobile && (
          <Card
            sx={{
              width: 292,
              flexShrink: 0,
              position: "sticky",
              top: 96,
              overflow: "hidden",
              backgroundColor: "var(--mcs-panel-fill)",
              borderColor: "var(--mcs-control-stroke)",
              boxShadow: "var(--mcs-shadow-sm)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <FiltersPanel
                activeTab={activeTab}
                categories={visibleCategories}
                selectedCategory={selectedCategory}
                platform={platform}
                onTabChange={handleTabChange}
                onCategoryChange={setSelectedCategory}
                t={t}
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Card
            sx={{
              mb: 2,
              overflow: "hidden",
              backgroundColor: "var(--mcs-panel-fill)",
              borderColor: "var(--mcs-control-stroke)",
              boxShadow: "var(--mcs-shadow-sm)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.5 } }}>
                <Stack spacing={2.25}>
                  <Stack
                    direction={{ xs: "column", xl: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", xl: "flex-start" }}
                  >
                    <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                        <Typography
                          variant="overline"
                          sx={{ color: "var(--mcs-dashboard-muted)", letterSpacing: "0.14em" }}
                        >
                          {platformId} · {currentTabLabel}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <PlatformBadge
                          platformId={platform?.id ?? platformId}
                          name={platform?.name ?? platformId ?? t("common.unknown")}
                          fallbackIcon={platform?.icon}
                          size={54}
                        />
                        <Typography
                          variant="h4"
                          sx={{ letterSpacing: "-0.05em", lineHeight: 0.98 }}
                        >
                          {currentTabLabel}
                        </Typography>
                      </Stack>
                      {platform ? <PlatformCapabilityChips platform={platform} /> : null}
                      <Typography variant="body2" color="text.secondary">
                        {t("common.resultsCount", { count: totalVisibleCount })} · {activeFilterLabel} ·{" "}
                        {t("common.categoryCount", { count: totalCategoryCount })}
                      </Typography>
                    </Stack>

                    <Stack spacing={1} alignItems={{ xs: "flex-start", xl: "flex-end" }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("common.selectedCount", { count: selectedCount })}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent={{ xl: "flex-end" }}>
                        <Button
                          variant="contained"
                          startIcon={<InstallDesktopIcon />}
                          onClick={() => setInstallOpen(true)}
                          disabled={selectedCount === 0}
                        >
                          {t("common.install")}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<SyncIcon />}
                          onClick={() => setSyncOpen(true)}
                          disabled={selectedCount === 0}
                        >
                          {t("common.syncSelection")}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => setConfirmAction("uninstall")}
                          disabled={selectedCount === 0}
                        >
                          {t("common.uninstall")}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={selectAll}
                          disabled={items.length === 0}
                        >
                          {t("install.selectAll")}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              <Box
                sx={{
                  px: { xs: 2, md: 2.5 },
                  py: 1.5,
                  backgroundColor: "var(--mcs-panel-fill-emphasis)",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", lg: "center" }}
                  >
                    <TextField
                      label={t("common.search")}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ width: { xs: "100%", lg: 360 } }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {t("common.filters")}: {activeFilterLabel}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {showInlineProgress && <LinearProgress sx={{ mb: 2 }} />}

          <Box
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              border: "1px solid var(--mcs-control-stroke)",
              backgroundColor: "var(--mcs-panel-fill)",
              boxShadow: "var(--mcs-shadow-sm)",
            }}
          >
            {pageLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary">{t("common.noItemsFound")}</Typography>
              </Box>
            ) : isMobile ? (
              <Box sx={{ p: 1.5 }}>
                <Stack spacing={1.5}>
                  {items.map((item) => (
                    <Card key={item.name}>
                      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Checkbox
                            checked={selectedNames.has(item.name)}
                            onChange={() => toggleSelection(item.name)}
                            inputProps={{ "aria-label": t("common.selectItem", { name: item.name }) }}
                          />
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                                {item.name}
                              </Typography>
                              <StatusChip status={item.status} />
                              {item.category && <Chip size="small" label={item.category} variant="outlined" />}
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                              {summarizeSkillDescription(item.description, "list") ||
                                t("common.noDescriptionAvailable")}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {activeTab === "skills" && (
                            <Button
                              variant="outlined"
                              startIcon={<InfoOutlinedIcon />}
                              onClick={() => setDetailName(item.name)}
                            >
                              {t("common.viewDetail")}
                            </Button>
                          )}
                          {(item.status === "installed" || item.status === "outdated") && (
                            <Button
                              variant="outlined"
                              startIcon={<CompareArrowsIcon />}
                              onClick={() => setDiffName(item.name)}
                            >
                              {t("common.showDiff")}
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>{t("common.name")}</TableCell>
                      <TableCell>{t("install.status")}</TableCell>
                      <TableCell>{t("common.category")}</TableCell>
                      <TableCell>{t("common.description")}</TableCell>
                      <TableCell align="right">{t("common.actions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.name} hover selected={selectedNames.has(item.name)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedNames.has(item.name)}
                            onChange={() => toggleSelection(item.name)}
                            inputProps={{ "aria-label": t("common.selectItem", { name: item.name }) }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={item.status} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={item.category ?? "—"} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {summarizeSkillDescription(item.description, "list") ||
                              t("common.noDescriptionAvailable")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {activeTab === "skills" && (
                              <IconButton
                                aria-label={`${t("common.viewDetail")} ${item.name}`}
                                onClick={() => setDetailName(item.name)}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            )}
                            {(item.status === "installed" || item.status === "outdated") && (
                              <IconButton
                                aria-label={`${t("common.showDiff")} ${item.name}`}
                                onClick={() => setDiffName(item.name)}
                              >
                                <CompareArrowsIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>

      {platformId && (
        <Suspense fallback={null}>
          <DetailDrawer
            open={detailName !== null}
            platformId={platformId}
            skillName={detailName}
            onClose={() => setDetailName(null)}
            onShowDiff={(name) => {
              setDetailName(null);
              setDiffName(name);
            }}
          />
        </Suspense>
      )}

      {platformId && (
        <Suspense fallback={null}>
          <DiffDialog
            open={diffName !== null}
            platformId={platformId}
            itemName={diffName}
            itemType={itemType}
            onClose={() => setDiffName(null)}
          />
        </Suspense>
      )}

      {platformId && (
        <InstallDialog
          open={installOpen}
          platformId={platformId}
          platform={platform}
          itemNames={Array.from(selectedNames)}
          itemCategories={Object.fromEntries(
            items
              .filter((item) => selectedNames.has(item.name))
              .map((item) => [item.name, item.category])
          )}
          itemType={activeTab}
          onClose={() => setInstallOpen(false)}
          onCompleted={(successCount, failureCount) => {
            showNotification(
              t("dialogs.installCompletedSummary", {
                success: successCount,
                failedSuffix:
                  failureCount > 0
                    ? `, ${t("npxSkills.jobFailed", { count: failureCount })}`
                    : "",
              }),
              failureCount > 0 ? "warning" : "success"
            );
            clearSelection();
            void refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmAction === "uninstall"}
        title={t("dialogs.uninstallItemsTitle")}
        message={t("dialogs.uninstallItemsMessage", {
          count: selectedCount,
          itemType:
            activeTab === "skills"
              ? t("common.skills")
              : activeTab === "commands"
                ? getPlatformCommandsLabel(platform, t)
                : t("common.agents"),
          platform: platform?.name ?? platformId ?? "",
        })}
        confirmLabel={t("common.uninstall")}
        confirmColor="error"
        onConfirm={handleUninstall}
        onCancel={() => setConfirmAction(null)}
      />

      {platformId && (
        <Suspense fallback={null}>
          <PromptDialog
            open={promptOpen}
            platformId={platformId}
            onClose={() => setPromptOpen(false)}
            onUpdated={() =>
              showNotification(t("dialogs.guidanceUpdatedSuccess"), "success")
            }
          />
        </Suspense>
      )}

      {platformId && (
        <Suspense fallback={null}>
          <MultiSyncDialog
            open={syncOpen}
            itemNames={Array.from(selectedNames)}
            itemType={itemType}
            currentPlatformId={platformId}
            onClose={() => setSyncOpen(false)}
            onSynced={(message, severity) => {
              showNotification(message, severity);
              clearSelection();
            }}
          />
        </Suspense>
      )}

      <NotificationSnackbar />
    </AppShell>
  );
}

function FiltersPanel({
  activeTab,
  categories,
  selectedCategory,
  platform,
  onTabChange,
  onCategoryChange,
  t,
}: {
  activeTab: TabValue;
  categories: { name: string; count: number }[];
  selectedCategory: string | null;
  platform?: PlatformDisplay;
  onTabChange: (tab: TabValue) => void;
  onCategoryChange: (category: string | null) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <Box>
      <Box
        sx={{
          px: 2.25,
          py: 2,
          borderBottom: "1px solid var(--mcs-control-divider)",
          backgroundColor: "var(--mcs-panel-fill-emphasis)",
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {t("common.filters")}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, letterSpacing: "-0.04em" }}>
          {platform?.name ?? t("common.platform")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {platform?.id ?? "—"}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          variant="fullWidth"
          sx={{
            mb: 2,
            p: 0.5,
            borderRadius: 2,
            backgroundColor: "var(--mcs-control-fill)",
            minHeight: 0,
            ".MuiTab-root": {
              minHeight: 44,
              borderRadius: 1.5,
            },
          }}
        >
          <Tab label={t("common.skills")} value="skills" />
          <Tab
            label={getPlatformCommandsLabel(platform, t)}
            value="commands"
            disabled={platform?.supports_commands === false}
          />
          <Tab
            label={t("common.agents")}
            value="agents"
            disabled={platform?.supports_agents === false}
          />
        </Tabs>

        <Typography variant="overline" color="text.secondary">
          {t("common.category")}
        </Typography>
        <List dense disablePadding sx={{ mt: 1, display: "grid", gap: 0.75 }}>
          <ListItemButton
            selected={selectedCategory === null}
            onClick={() => onCategoryChange(null)}
            sx={{
              px: 1.25,
              py: 1,
              minHeight: 44,
              border: "1px solid var(--mcs-control-divider)",
            }}
          >
            <ListItemText
              primary={t("common.all")}
              secondary={t("common.categoryCount", { count: categories.length })}
            />
            <Badge
              badgeContent={categories.reduce((sum, category) => sum + category.count, 0)}
              color="primary"
            />
          </ListItemButton>
          {categories.map((category) => (
            <ListItemButton
              key={category.name}
              selected={selectedCategory === category.name}
              onClick={() => onCategoryChange(category.name)}
              sx={{
                px: 1.25,
                py: 1,
                minHeight: 44,
                border: "1px solid var(--mcs-control-divider)",
              }}
            >
              <ListItemText primary={category.name} />
              <Badge
                badgeContent={category.count}
                color={selectedCategory === category.name ? "primary" : "default"}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
}
