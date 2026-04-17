import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import SearchIcon from "@mui/icons-material/Search";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import PageLoadingState from "@/components/common/PageLoadingState";
import { StatusChip } from "@/components/common/StatusChip";
import { SelectableSurfaceCard } from "@/components/common/SelectableSurfaceCard";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { DiffDialog } from "@/components/dialogs/DiffDialog";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { uninstallAgents, uninstallCommands } from "@/api/client";
import {
  AppShell,
  ListSurface,
  MobileFilterButton,
  ResponsiveFilterRail,
  StickyActionBar,
} from "@/components/shell/AppShell";
import { PlatformIdentity } from "@/components/platform/PlatformVisuals";
import { useDebounce } from "@/hooks/useDebounce";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { usePlatformItemsData } from "@/hooks/usePlatformItemsData";
import { useI18n } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import type { InstallStatus, ItemType } from "@/types";
import {
  getPlatformInstallPath,
  getPlatformScopedItemTypeLabel,
  platformSupportsItemType,
} from "@/utils/installHubContent";
import { buildActivityRunPath } from "@/utils/activityNavigation";
import { summarizeSkillDescription } from "@/utils/skillDescription";

const ManagedItemDetailDrawer = lazy(() =>
  import("@/components/dialogs/ManagedItemDetailDrawer").then((module) => ({
    default: module.ManagedItemDetailDrawer,
  })),
);

const AgentEditorDrawer = lazy(() =>
  import("@/components/dialogs/AgentEditorDrawer").then((module) => ({
    default: module.AgentEditorDrawer,
  })),
);

type ManagedContentType = Extract<ItemType, "command" | "agent">;

const contentTypeToTab = {
  command: "commands",
  agent: "agents",
} as const;

interface Props {
  contentType: ManagedContentType;
}

export default function PlatformManagedContentPage({ contentType }: Props) {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigateDeferred = useNavigateDeferred();
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);
  const platforms = usePlatformStore((state) => state.platforms);
  const showNotification = useUiStore((state) => state.showNotification);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InstallStatus | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [detailName, setDetailName] = useState<string | null>(null);
  const [diffName, setDiffName] = useState<string | null>(null);
  const [editName, setEditName] = useState<string | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  const availablePlatforms = useMemo(
    () =>
      platforms.filter(
        (platform) =>
          (platform.id === "claude" || platform.id === "codex") &&
          platformSupportsItemType(platform, contentType),
      ),
    [platforms, contentType],
  );

  const requestedPlatformId = params.get("platform");
  const activePlatform =
    availablePlatforms.find((platform) => platform.id === requestedPlatformId) ??
    availablePlatforms[0] ??
    null;

  useEffect(() => {
    if (!activePlatform) return;
    if (requestedPlatformId === activePlatform.id) return;
    const next = new URLSearchParams(params);
    next.set("platform", activePlatform.id);
    setParams(next, { replace: true });
  }, [activePlatform, params, requestedPlatformId, setParams]);

  useEffect(() => {
    setSearch("");
    setSelectedCategory(null);
    setStatusFilter(null);
    setSelectedNames(new Set());
    setDetailName(null);
    setDiffName(null);
    setEditName(null);
  }, [activePlatform?.id, contentType]);

  useEffect(() => {
    if (!isMobile) setFilterDrawerOpen(false);
  }, [isMobile]);

  const {
    loading: installTargetLoading,
    dialogOpen: installTargetDialogOpen,
    target: installTarget,
    resolvedTarget,
    resolutionError,
    recentProjects,
    openDialog: openInstallTargetDialog,
    closeDialog: closeInstallTargetDialog,
    applyTarget: applyInstallTarget,
  } = useInstallTarget(activePlatform?.id);

  const installTargetBlocked = Boolean(resolutionError);
  const {
    items,
    categories,
    loading,
    error,
    refresh,
  } = usePlatformItemsData({
    platformId: activePlatform?.id,
    enabled:
      Boolean(activePlatform) &&
      Boolean(resolvedTarget) &&
      !installTargetLoading &&
      !installTargetBlocked,
    activeTab: contentTypeToTab[contentType],
    search: debouncedSearch,
    selectedCategory,
    statusFilter,
    installTarget,
    itemTypeOverride: contentType,
  });

  const itemLabel = getPlatformScopedItemTypeLabel(activePlatform ?? undefined, contentType, t);
  const installPath = activePlatform
    ? resolvedTarget
      ? contentType === "command"
        ? resolvedTarget.commands_path ?? t("dialogs.syncUnsupportedTarget")
        : resolvedTarget.agents_path ?? t("dialogs.syncUnsupportedTarget")
      : installTargetBlocked
        ? t("installed.installTargetUnavailable")
        : t("installed.installTargetLoading")
    : t("common.none");

  const pageCopy =
    contentType === "command"
      ? {
          title: t("manageContent.commandsTitle"),
          subtitle: t("manageContent.commandsSubtitle"),
          emptyTitle: t("manageContent.emptyTitle.commands"),
          emptyDescription: t("manageContent.emptyDescription.commands"),
          searchLabel: t("manageContent.searchPlaceholder.commands"),
        }
      : {
          title: t("manageContent.agentsTitle"),
          subtitle: t("manageContent.agentsSubtitle"),
          emptyTitle: t("manageContent.emptyTitle.agents"),
          emptyDescription: t("manageContent.emptyDescription.agents"),
          searchLabel: t("manageContent.searchPlaceholder.agents"),
        };

  const summaryText = t("manageContent.selectionSummary", {
    selected: selectedNames.size,
    visible: items.length,
    categories: categories.length,
  });

  const pageLoading = loading && items.length === 0;
  const showInlineProgress = (loading && items.length > 0) || installTargetLoading;

  const toggleSelection = (name: string) => {
    setSelectedNames((previous) => {
      const next = new Set(previous);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!activePlatform?.id || selectedNames.size === 0) {
      return;
    }

    setConfirmDelete(false);
    const names = Array.from(selectedNames);

    try {
      const response =
        contentType === "command"
          ? await uninstallCommands(activePlatform.id, names, installTarget)
          : await uninstallAgents(activePlatform.id, names, installTarget);
      showNotification(
        t("dialogs.uninstallCompletedSummary", {
          success: response.success_count,
          failedSuffix:
            response.failure_count > 0
              ? `, ${t("npxSkills.jobFailed", { count: response.failure_count })}`
              : "",
        }),
        response.failure_count > 0 ? "warning" : "success",
        response.run_id
          ? {
              label: t("activity.viewRun"),
              onClick: () =>
                navigateDeferred(buildActivityRunPath(response.run_id!, activePlatform.id)),
            }
          : undefined,
      );
      setSelectedNames(new Set());
      await refresh();
    } catch (errorValue) {
      showNotification((errorValue as Error).message, "error");
    }
  };

  return (
    <AppShell
      variant="workbench"
      title={pageCopy.title}
      subtitle={pageCopy.subtitle}
      onBack={() => navigateDeferred("/")}
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          {isMobile ? <MobileFilterButton onClick={() => setFilterDrawerOpen(true)} /> : null}
          <Chip
            icon={<FolderOpenOutlinedIcon />}
            variant="outlined"
            color="info"
            clickable
            aria-label={t("common.installTarget")}
            onClick={openInstallTargetDialog}
            label={t("installed.installTargetChip", {
              mode:
                installTarget.scope === "project"
                  ? t("installed.installTargetProject")
                  : t("installed.installTargetGlobal"),
              path: installPath,
            })}
          />
        </>
      }
      filterRail={
        <ResponsiveFilterRail
          title={t("common.filters")}
          sections={[
            {
              id: "content-filters",
              content: (
                <ManagedContentFilters
                  categories={categories.map((category) => category.name)}
                  selectedCategory={selectedCategory}
                  statusFilter={statusFilter}
                  onCategoryChange={setSelectedCategory}
                  onStatusFilterChange={setStatusFilter}
                />
              ),
            },
          ]}
        />
      }
    >
      {isMobile ? (
        <ResponsiveFilterRail
          title={t("common.filters")}
          mobileOpen={filterDrawerOpen}
          onCloseMobile={() => setFilterDrawerOpen(false)}
          sections={[
            {
              id: "content-filters-mobile",
              content: (
                <ManagedContentFilters
                  categories={categories.map((category) => category.name)}
                  selectedCategory={selectedCategory}
                  statusFilter={statusFilter}
                  onCategoryChange={(value) => {
                    setSelectedCategory(value);
                    setFilterDrawerOpen(false);
                  }}
                  onStatusFilterChange={(value) => {
                    setStatusFilter(value);
                    setFilterDrawerOpen(false);
                  }}
                />
              ),
            },
          ]}
        />
      ) : null}

      {!activePlatform ? (
        <PageLoadingState message={t("manageContent.platformUnavailable")} minHeight={280} />
      ) : (
        <Stack spacing={2.5}>
          <ListSurface tone="workbench">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", xl: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", xl: "center" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="text.secondary">
                    {t("manageContent.platformSwitcher")}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.4, letterSpacing: "-0.04em" }}>
                    {itemLabel}
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={activePlatform.id}
                  onChange={(_event, nextValue: string | null) => {
                    if (!nextValue) return;
                    const next = new URLSearchParams(params);
                    next.set("platform", nextValue);
                    setParams(next);
                  }}
                >
                  {availablePlatforms.map((platform) => (
                    <ToggleButton key={platform.id} value={platform.id}>
                      {platform.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                }}
              >
                {availablePlatforms.map((platform) => (
                  <SelectableSurfaceCard
                    key={platform.id}
                    title={
                      <PlatformIdentity
                        platformId={platform.id}
                        name={platform.name}
                        fallbackIcon={platform.icon}
                        subtitle={platform.id}
                        size={42}
                      />
                    }
                    description={
                      <Typography variant="body2" color="text.secondary">
                        {getPlatformScopedItemTypeLabel(platform, contentType, t)}
                      </Typography>
                    }
                    meta={
                      <Stack spacing={0.4}>
                        <Typography variant="overline" color="text.secondary">
                          {t("manageContent.currentTargetPath")}
                        </Typography>
                        <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                          {platform.id === activePlatform.id
                            ? installPath
                            : getPlatformInstallPath(platform, contentType, t)}
                        </Typography>
                      </Stack>
                    }
                    selected={platform.id === activePlatform.id}
                    onSelect={() => {
                      const next = new URLSearchParams(params);
                      next.set("platform", platform.id);
                      setParams(next);
                    }}
                    selectionLabel={platform.name}
                    selectedLabel={t("common.current")}
                  />
                ))}
              </Box>
            </Stack>
          </ListSurface>

          <ListSurface tone="workbench">
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <TextField
                label={pageCopy.searchLabel}
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
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {summaryText}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={() => setSelectedNames(new Set(items.map((item) => item.name)))}
                disabled={items.length === 0}
              >
                {t("manageContent.selectAllVisible")}
              </Button>
            </Stack>
          </ListSurface>

          {installTargetBlocked ? <Alert severity="error">{resolutionError}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {showInlineProgress ? <LinearProgress /> : null}

          {pageLoading ? (
            <PageLoadingState message={t("common.loading")} minHeight={320} />
          ) : items.length === 0 ? (
            <ListSurface tone="workbench">
              <Box sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  {pageCopy.emptyTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {pageCopy.emptyDescription}
                </Typography>
              </Box>
            </ListSurface>
          ) : (
            <ListSurface tone="workbench" padded={false}>
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
                          <Checkbox checked={selectedNames.has(item.name)} onChange={() => toggleSelection(item.name)} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={item.status} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={item.category ?? "—"} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 420 }}>
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
                            {summarizeSkillDescription(item.description, "list") || t("common.noDescriptionAvailable")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <IconButton onClick={() => setDetailName(item.name)}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                            {(item.status === "installed" || item.status === "outdated") ? (
                              <IconButton onClick={() => setDiffName(item.name)}>
                                <CompareArrowsIcon fontSize="small" />
                              </IconButton>
                            ) : null}
                            <IconButton
                              onClick={() => {
                                setSelectedNames(new Set([item.name]));
                                setInstallOpen(true);
                              }}
                            >
                              <InstallDesktopIcon fontSize="small" />
                            </IconButton>
                            {contentType === "agent" ? (
                              <IconButton onClick={() => setEditName(item.name)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            ) : null}
                            {(item.status === "installed" || item.status === "outdated") ? (
                              <IconButton
                                color="error"
                                onClick={() => {
                                  setSelectedNames(new Set([item.name]));
                                  setConfirmDelete(true);
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ListSurface>
          )}
        </Stack>
      )}

      <StickyActionBar summary={summaryText}>
        <Button
          variant="contained"
          startIcon={<InstallDesktopIcon />}
          onClick={() => setInstallOpen(true)}
          disabled={selectedNames.size === 0 || !activePlatform || installTargetBlocked}
        >
          {t("manageContent.installSelected")}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => setConfirmDelete(true)}
          disabled={selectedNames.size === 0 || !activePlatform}
        >
          {t("manageContent.uninstallSelected")}
        </Button>
      </StickyActionBar>

      {activePlatform && detailName ? (
        <Suspense fallback={null}>
          <ManagedItemDetailDrawer
            open
            platformId={activePlatform.id}
            itemType={contentType}
            itemName={detailName}
            installTarget={installTarget}
            onClose={() => setDetailName(null)}
            onShowDiff={(name) => {
              setDetailName(null);
              setDiffName(name);
            }}
            onEdit={
              contentType === "agent"
                ? (name) => {
                    setDetailName(null);
                    setEditName(name);
                  }
                : undefined
            }
          />
        </Suspense>
      ) : null}

      {activePlatform && diffName ? (
        <DiffDialog
          open
          platformId={activePlatform.id}
          itemName={diffName}
          itemType={contentType}
          installTarget={installTarget}
          onClose={() => setDiffName(null)}
        />
      ) : null}

      {activePlatform ? (
        <InstallDialog
          open={installOpen}
          platformId={activePlatform.id}
          platform={activePlatform}
          itemNames={Array.from(selectedNames)}
          itemCategories={Object.fromEntries(items.map((item) => [item.name, item.category]))}
          itemType={contentType === "command" ? "commands" : "agents"}
          installTarget={installTarget}
          onClose={() => setInstallOpen(false)}
          onCompleted={async ({ successCount, failureCount, runId }) => {
            showNotification(
              t("dialogs.installCompletedSummary", {
                success: successCount,
                failedSuffix:
                  failureCount > 0
                    ? `, ${t("npxSkills.jobFailed", { count: failureCount })}`
                    : "",
              }),
              failureCount > 0 ? "warning" : "success",
              runId
                ? {
                    label: t("activity.viewRun"),
                    onClick: () =>
                      navigateDeferred(buildActivityRunPath(runId, activePlatform.id)),
                  }
                : undefined,
            );
            setSelectedNames(new Set());
            await refresh();
          }}
          onViewActivity={(runId) =>
            navigateDeferred(buildActivityRunPath(runId, activePlatform.id))
          }
        />
      ) : null}

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={applyInstallTarget}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={t("dialogs.uninstallItemsTitle")}
        message={t("dialogs.uninstallItemsMessage", {
          count: selectedNames.size,
          itemType: itemLabel,
          platform: activePlatform?.name ?? "",
        })}
        confirmLabel={t("common.uninstall")}
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {activePlatform && contentType === "agent" && editName ? (
        <Suspense fallback={null}>
          <AgentEditorDrawer
            open
            platformId={activePlatform.id}
            agentName={editName}
            onClose={() => setEditName(null)}
            onSaved={async () => {
              showNotification(t("installed.savedNotification", { name: editName }), "success");
              setEditName(null);
              await refresh();
            }}
          />
        </Suspense>
      ) : null}

      <NotificationSnackbar />
    </AppShell>
  );
}

function ManagedContentFilters({
  categories,
  selectedCategory,
  statusFilter,
  onCategoryChange,
  onStatusFilterChange,
}: {
  categories: string[];
  selectedCategory: string | null;
  statusFilter: InstallStatus | null;
  onCategoryChange: (category: string | null) => void;
  onStatusFilterChange: (status: InstallStatus | null) => void;
}) {
  const { t } = useI18n();
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t("install.status")}
        </Typography>
        <List dense disablePadding>
          {[
            { value: null, label: t("manageContent.statusAll") },
            { value: "installed" as InstallStatus, label: t("manageContent.statusInstalled") },
            { value: "outdated" as InstallStatus, label: t("manageContent.statusOutdated") },
            { value: "not_installed" as InstallStatus, label: t("manageContent.statusNotInstalled") },
          ].map((option) => (
            <ListItemButton
              key={String(option.value)}
              selected={statusFilter === option.value}
              onClick={() =>
                onStatusFilterChange(statusFilter === option.value ? null : option.value)
              }
              sx={{ minHeight: 44 }}
            >
              <ListItemText primary={option.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t("common.category")}
        </Typography>
        <List dense disablePadding>
          <ListItemButton
            selected={selectedCategory === null}
            onClick={() => onCategoryChange(null)}
            sx={{ minHeight: 44 }}
          >
            <ListItemText primary={t("common.all")} />
          </ListItemButton>
          {categories.map((category) => (
            <ListItemButton
              key={category}
              selected={selectedCategory === category}
              onClick={() => onCategoryChange(category)}
              sx={{ minHeight: 44 }}
            >
              <ListItemText primary={category} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Stack>
  );
}
