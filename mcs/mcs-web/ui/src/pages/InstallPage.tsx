import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import SearchIcon from "@mui/icons-material/Search";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import TerminalIcon from "@mui/icons-material/Terminal";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import PageLoadingState from "@/components/common/PageLoadingState";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import {
  AppShell,
  ListSurface,
  MobileFilterButton,
  PlatformShellIdentity,
  ResponsiveFilterRail,
  StickyActionBar,
} from "@/components/shell/AppShell";
import { SelectableSurfaceCard } from "@/components/common/SelectableSurfaceCard";
import { getCategories, getSkillDetail, getSkills, installSkills } from "@/api/client";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useDebounce } from "@/hooks/useDebounce";
import { useI18n } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import type { CategoryDto, InstallStatus, ItemDetailDto, ItemDto } from "@/types";
import { summarizeSkillDescription } from "@/utils/skillDescription";

const Markdown = lazy(() => import("react-markdown"));

function statusLabel(status: InstallStatus, t: ReturnType<typeof useI18n>["t"]): string {
  switch (status) {
    case "installed":
      return t("status.installed");
    case "outdated":
      return t("status.outdated");
    case "not_installed":
      return t("status.notInstalled");
  }
}

function statusColor(status: InstallStatus): "success" | "warning" | "default" {
  switch (status) {
    case "installed":
      return "success";
    case "outdated":
      return "warning";
    case "not_installed":
      return "default";
  }
}

function StatusIcon({ status }: { status: InstallStatus }) {
  switch (status) {
    case "installed":
      return <CheckCircleOutlineIcon fontSize="small" color="success" />;
    case "outdated":
      return <WarningAmberIcon fontSize="small" color="warning" />;
    case "not_installed":
      return <RadioButtonUncheckedIcon fontSize="small" color="disabled" />;
  }
}

function FiltersSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  showDefaultOnly,
  onDefaultToggle,
  totalSkills,
}: {
  categories: CategoryDto[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  statusFilter: InstallStatus | null;
  onStatusFilterChange: (status: InstallStatus | null) => void;
  statusCounts: { installed: number; outdated: number; not_installed: number };
  showDefaultOnly: boolean;
  onDefaultToggle: () => void;
  totalSkills: number;
}) {
  const { t } = useI18n();
  const theme = useTheme();

  const chipSx = (selected = false) => ({
    height: 20,
    minWidth: 28,
    fontSize: "0.75rem",
    fontWeight: 600,
    bgcolor: selected
      ? alpha(theme.palette.primary.main, 0.18)
      : alpha(theme.palette.text.primary, 0.08),
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 1 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.75rem" }}
      >
        {t("install.status")}
      </Typography>
      <List dense disablePadding>
        {(["installed", "outdated", "not_installed"] as const).map((status) => (
          <ListItemButton
            key={status}
            selected={statusFilter === status}
            onClick={() =>
              onStatusFilterChange(statusFilter === status ? null : status)
            }
            sx={{ minHeight: 44 }}
          >
            <ListItemText
              primary={statusLabel(status, t)}
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
            />
            <Chip
              label={statusCounts[status]}
              size="small"
              sx={chipSx(statusFilter === status)}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />

      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.75rem" }}
      >
        {t("install.defaultSection")}
      </Typography>
      <Box sx={{ px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Switch size="small" checked={showDefaultOnly} onChange={onDefaultToggle} />
        <Typography variant="body2" fontWeight={500}>
          {t("install.onlyDefaultSkills")}
        </Typography>
      </Box>

      <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />

      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.75rem" }}
      >
        {t("install.categories")}
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
          sx={{ minHeight: 44 }}
        >
          <ListItemText
            primary={t("install.totalSkills")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
          />
          <Chip label={totalSkills} size="small" sx={chipSx(selectedCategory === null)} />
        </ListItemButton>
        {categories.map((category) => (
          <ListItemButton
            key={category.name}
            selected={selectedCategory === category.name}
            onClick={() => onCategoryChange(category.name)}
            sx={{ minHeight: 44 }}
          >
            <ListItemText
              primary={category.name}
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
            />
            <Chip
              label={category.count}
              size="small"
              sx={chipSx(selectedCategory === category.name)}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

function SearchToolbar({
  search,
  onSearchChange,
  onSelectAll,
  onClearSelection,
  selectedCount,
  outdatedCount,
  visibleCount,
  categoryCount,
  onUpdateAll,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectedCount: number;
  outdatedCount: number;
  visibleCount: number;
  categoryCount: number;
  onUpdateAll: () => void;
}) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <TextField
        label={t("common.search")}
        size="small"
        placeholder={t("install.searchPlaceholder")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: 400, maxWidth: "100%" }}
      />
      <Typography variant="body2" color="text.secondary">
        {t("common.resultsCount", { count: visibleCount })} ·{" "}
        {t("common.categoryCount", { count: categoryCount })}
      </Typography>

      <Button
        size="small"
        variant="outlined"
        startIcon={<SelectAllIcon />}
        onClick={onSelectAll}
      >
        {t("install.selectAll")}
      </Button>

      {selectedCount > 0 && (
        <Button
          size="small"
          variant="text"
          onClick={onClearSelection}
        >
          {t("install.clear")}
        </Button>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {outdatedCount > 0 && (
        <Button
          variant="contained"
          color="warning"
          size="small"
          onClick={onUpdateAll}
        >
          {t("install.updateAll", { count: outdatedCount })}
        </Button>
      )}
    </Box>
  );
}

function SkillCard({
  item,
  selected,
  onToggle,
  onShowDetail,
}: {
  item: ItemDto;
  selected: boolean;
  onToggle: () => void;
  onShowDetail: () => void;
}) {
  const { t } = useI18n();

  return (
    <SelectableSurfaceCard
      selected={selected}
      onSelect={onToggle}
      selectionLabel={t("common.selectItem", { name: item.name })}
      selectedLabel={t("common.selected")}
      title={item.name}
      badges={
        <>
          <Chip
            size="small"
            variant="outlined"
            color={statusColor(item.status)}
            icon={<StatusIcon status={item.status} />}
            label={statusLabel(item.status, t)}
          />
          {item.category ? <Chip size="small" variant="outlined" label={item.category} /> : null}
          {item.is_default ? <Chip size="small" variant="outlined" color="info" label={t("common.default")} /> : null}
        </>
      }
      description={
        <Typography
          variant="body2"
          color="inherit"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "4.2em",
          }}
        >
          {summarizeSkillDescription(item.description, "list") ||
            t("common.noDescriptionAvailable")}
        </Typography>
      }
      footer={
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            variant="text"
            startIcon={<InfoOutlinedIcon />}
            onClick={onShowDetail}
          >
            {t("common.viewDetail")}
          </Button>
        </Stack>
      }
    />
  );
}

function SkillCardGrid({
  skills,
  selectedNames,
  onToggle,
  onShowDetail,
}: {
  skills: ItemDto[];
  selectedNames: Set<string>;
  onToggle: (name: string) => void;
  onShowDetail: (name: string) => void;
}) {
  const { t } = useI18n();

  if (skills.length === 0) {
    return <Alert severity="info">{t("install.noSkillsFound")}</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {skills.map((item) => (
        <Grid key={item.name} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
          <SkillCard
            item={item}
            selected={selectedNames.has(item.name)}
            onToggle={() => onToggle(item.name)}
            onShowDetail={() => onShowDetail(item.name)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function SkillInventoryTable({
  skills,
  selectedNames,
  onToggle,
  onShowDetail,
}: {
  skills: ItemDto[];
  selectedNames: Set<string>;
  onToggle: (name: string) => void;
  onShowDetail: (name: string) => void;
}) {
  const { t } = useI18n();

  if (skills.length === 0) {
    return <Alert severity="info">{t("install.noSkillsFound")}</Alert>;
  }

  return (
    <ListSurface tone="workbench" padded={false}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>{t("install.status")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.category")}</TableCell>
              <TableCell>{t("common.description")}</TableCell>
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skills.map((item) => (
              <TableRow
                key={item.name}
                hover
                selected={selectedNames.has(item.name)}
                sx={{ cursor: "pointer" }}
                onClick={() => onToggle(item.name)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedNames.has(item.name)}
                    onChange={() => onToggle(item.name)}
                    onClick={(event) => event.stopPropagation()}
                    inputProps={{ "aria-label": t("common.selectItem", { name: item.name }) }}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={statusColor(item.status)}
                    icon={<StatusIcon status={item.status} />}
                    label={statusLabel(item.status, t)}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 220 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Typography variant="body2" fontWeight={700}>
                      {item.name}
                    </Typography>
                    {item.is_default ? (
                      <Chip size="small" label={t("common.default")} color="info" variant="outlined" />
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Chip size="small" variant="outlined" label={item.category ?? "—"} />
                </TableCell>
                <TableCell sx={{ maxWidth: 440 }}>
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
                  <Tooltip title={t("common.viewDetail")}>
                    <IconButton
                      aria-label={t("common.viewDetail")}
                      onClick={(event) => {
                        event.stopPropagation();
                        onShowDetail(item.name);
                      }}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ListSurface>
  );
}

function SkillDetailDialog({
  open,
  platformId,
  skillName,
  onClose,
}: {
  open: boolean;
  platformId: string;
  skillName: string | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [detail, setDetail] = useState<ItemDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !skillName) {
      return;
    }
    setLoading(true);
    setDetail(null);
    getSkillDetail(platformId, skillName)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [open, platformId, skillName]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="install-skill-detail-title"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography id="install-skill-detail-title" variant="h6" fontWeight={700}>
          {skillName ?? "SKILL.md"}
        </Typography>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </Box>
      <Box sx={{ px: 3, py: 2.5, maxHeight: "70vh", overflowY: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : detail?.content ? (
          <Suspense fallback={<CircularProgress size={20} />}>
            <Markdown>{detail.content}</Markdown>
          </Suspense>
        ) : (
          <Alert severity="error">{t("dialogs.failedLoadDetail")}</Alert>
        )}
      </Box>
    </Dialog>
  );
}

export default function InstallPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigateDeferred = useNavigateDeferred();

  const platform = usePlatformStore((state) =>
    state.platforms.find((item) => item.id === platformId)
  );
  const fetchPlatforms = usePlatformStore((s) => s.fetchPlatforms);
  const showNotification = useUiStore((s) => s.showNotification);
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
  } = useInstallTarget(platformId);
  const installTargetBlocked = Boolean(resolutionError);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [skills, setSkills] = useState<ItemDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InstallStatus | null>(null);
  const [showDefaultOnly, setShowDefaultOnly] = useState(false);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [installOpen, setInstallOpen] = useState(false);
  const [detailName, setDetailName] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const skillsAbortRef = useRef<AbortController | null>(null);
  const categoriesAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    return () => {
      skillsAbortRef.current?.abort();
      categoriesAbortRef.current?.abort();
    };
  }, []);

  const fetchSkills = useCallback(async () => {
    if (!platformId || !resolvedTarget || installTargetLoading || installTargetBlocked) {
      setSkills([]);
      setLoading(false);
      setError(null);
      return;
    }
    skillsAbortRef.current?.abort();
    const controller = new AbortController();
    skillsAbortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills(
        platformId,
        {
          search: debouncedSearch || undefined,
          category: selectedCategory ?? undefined,
          installTarget,
        },
        controller.signal
      );
      setSkills(data);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      setError((error as Error).message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    debouncedSearch,
    installTarget,
    installTargetBlocked,
    installTargetLoading,
    platformId,
    resolvedTarget,
    selectedCategory,
  ]);

  const fetchCategories = useCallback(async () => {
    if (!platformId || !resolvedTarget || installTargetLoading || installTargetBlocked) {
      setCategories([]);
      return;
    }
    categoriesAbortRef.current?.abort();
    const controller = new AbortController();
    categoriesAbortRef.current = controller;
    try {
      const data = await getCategories(platformId, installTarget, "skill", controller.signal);
      setCategories(data);
    } catch {
      // non-critical
    }
  }, [installTarget, installTargetBlocked, installTargetLoading, platformId, resolvedTarget]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    setSelectedNames(new Set());
  }, [installTarget.scope, installTarget.project_path]);

  const filteredSkills = useMemo(() => {
    let result = statusFilter ? skills.filter((skill) => skill.status === statusFilter) : skills;
    if (showDefaultOnly) {
      result = result.filter((skill) => skill.is_default);
    }
    return result;
  }, [skills, statusFilter, showDefaultOnly]);

  const statusCounts = useMemo(() => {
    const counts = { installed: 0, outdated: 0, not_installed: 0 };
    for (const skill of skills) {
      counts[skill.status]++;
    }
    return counts;
  }, [skills]);

  const selectedInstallable = useMemo(
    () => skills.filter((skill) => selectedNames.has(skill.name)),
    [skills, selectedNames]
  );

  const handleBatchUpdate = async () => {
    if (!platformId) {
      return;
    }
    const outdated = skills.filter((skill) => skill.status === "outdated");
    if (outdated.length === 0) {
      return;
    }
    try {
      const result = await installSkills(
        platformId,
        outdated.map((skill) => skill.name),
        "auto",
        installTarget
      );
      showNotification(
        t("install.updatedSkillsNotification", {
          success: result.success_count,
          failedSuffix:
            result.failure_count > 0
              ? `, ${t("common.uninstall")} ${result.failure_count}`
              : "",
        }),
        result.failure_count > 0 ? "warning" : "success"
      );
      void fetchSkills();
    } catch (error) {
      showNotification((error as Error).message, "error");
    }
  };

  const installTargetPath = resolvedTarget?.skills_path
    ?? (installTargetBlocked
      ? t("installed.installTargetUnavailable")
      : t("install.installTargetLoading"));
  const installTargetLabel = t("install.installTargetChip", {
    mode:
      installTarget.scope === "project"
        ? t("install.installTargetProject")
        : t("install.installTargetGlobal"),
    path: installTargetPath,
  });

  return (
    <AppShell
      variant="workbench"
      title={
        <PlatformShellIdentity
          platformId={platform?.id ?? platformId}
          name={platform?.name ?? platformId ?? t("common.unknown")}
          fallbackIcon={platform?.icon}
          subtitle={t("common.install")}
        />
      }
      pageHeading={t("install.pageTitle", {
        platform: platform?.name ?? platformId ?? t("common.unknown"),
      })}
      subtitle={installTargetLabel}
      onBack={() => navigateDeferred(`/platform/${platformId}`)}
      onHome={() => navigateDeferred("/")}
      actions={
        <>
          {isMobile ? (
            <MobileFilterButton onClick={() => setDrawerOpen(true)} />
          ) : null}
          <Tooltip title={installTargetPath}>
            <Chip
              icon={<FolderOpenOutlinedIcon />}
              variant="outlined"
              color="info"
              clickable
              aria-label={t("common.installTarget")}
              onClick={openInstallTargetDialog}
              label={installTargetLabel}
              sx={{
                maxWidth: { xs: 220, sm: 420 },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<TerminalIcon />}
            onClick={() => navigateDeferred(`/platform/${platformId}/npx-skills`)}
          >
            {t("npxSkills.pageButton")}
          </Button>
        </>
      }
      filterRail={
        <ResponsiveFilterRail
          title={t("install.categories")}
          sections={[
            {
              id: "install-filters-desktop",
              content: (
                <FiltersSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  statusCounts={statusCounts}
                  showDefaultOnly={showDefaultOnly}
                  onDefaultToggle={() => setShowDefaultOnly((value) => !value)}
                  totalSkills={skills.length}
                />
              ),
            },
          ]}
        />
      }
    >
      {isMobile ? (
        <ResponsiveFilterRail
          title={t("install.categories")}
          mobileOpen={drawerOpen}
          onCloseMobile={() => setDrawerOpen(false)}
          sections={[
            {
              id: "install-filters-mobile",
              content: (
                <FiltersSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  statusCounts={statusCounts}
                  showDefaultOnly={showDefaultOnly}
                  onDefaultToggle={() => setShowDefaultOnly((value) => !value)}
                  totalSkills={skills.length}
                />
              ),
            },
          ]}
        />
      ) : null}

      <Stack spacing={2.5}>
        <ListSurface tone="workbench">
          <SearchToolbar
            search={search}
            onSearchChange={setSearch}
            onSelectAll={() =>
              setSelectedNames(new Set(filteredSkills.map((skill) => skill.name)))
            }
            onClearSelection={() => setSelectedNames(new Set())}
            selectedCount={selectedNames.size}
            outdatedCount={statusCounts.outdated}
            visibleCount={filteredSkills.length}
            categoryCount={categories.length}
            onUpdateAll={() => void handleBatchUpdate()}
          />
        </ListSurface>

        {installTargetBlocked ? (
          <Alert severity="error">{resolutionError}</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        {(loading || installTargetLoading) ? (
          <LinearProgress aria-label={t("common.loading")} />
        ) : null}

        {loading && skills.length === 0 ? (
          <PageLoadingState message={t("common.loading")} minHeight={320} />
        ) : isMobile ? (
          <SkillCardGrid
            skills={filteredSkills}
            selectedNames={selectedNames}
            onToggle={(name) =>
              setSelectedNames((previous) => {
                const next = new Set(previous);
                if (next.has(name)) {
                  next.delete(name);
                } else {
                  next.add(name);
                }
                return next;
              })
            }
            onShowDetail={setDetailName}
          />
        ) : (
          <SkillInventoryTable
            skills={filteredSkills}
            selectedNames={selectedNames}
            onToggle={(name) =>
              setSelectedNames((previous) => {
                const next = new Set(previous);
                if (next.has(name)) {
                  next.delete(name);
                } else {
                  next.add(name);
                }
                return next;
              })
            }
            onShowDetail={setDetailName}
          />
        )}

        {selectedInstallable.length > 0 ? (
          <StickyActionBar
            summary={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={t("common.selectedCount", { count: selectedInstallable.length })}
                  color="primary"
                />
                <Chip label={installTargetLabel} variant="outlined" />
              </Stack>
            }
          >
            <Button
              variant="contained"
              startIcon={<InstallDesktopIcon />}
              onClick={() => setInstallOpen(true)}
            >
              {t("common.install")}
            </Button>
            <Button variant="text" onClick={() => setSelectedNames(new Set())}>
              {t("install.clear")}
            </Button>
          </StickyActionBar>
        ) : null}
      </Stack>

      <InstallDialog
        open={installOpen}
        platformId={platformId ?? ""}
        platform={platform}
        itemNames={selectedInstallable.map((skill) => skill.name)}
        itemCategories={Object.fromEntries(
          selectedInstallable.map((skill) => [skill.name, skill.category])
        )}
        itemType="skills"
        installTarget={installTarget}
        onClose={() => setInstallOpen(false)}
        onCompleted={(successCount, failureCount) => {
          showNotification(
            t("install.installedSkillsNotification", {
              success: successCount,
              failedSuffix: failureCount > 0 ? `, ${failureCount}` : "",
            }),
            failureCount > 0 ? "warning" : "success"
          );
          setSelectedNames(new Set());
          void fetchSkills();
        }}
      />

      {platformId && (
        <SkillDetailDialog
          open={detailName !== null}
          platformId={platformId}
          skillName={detailName}
          onClose={() => setDetailName(null)}
        />
      )}

      <InstallTargetDialog
        open={installTargetDialogOpen}
        loading={installTargetLoading}
        currentTarget={installTarget}
        recentProjects={recentProjects}
        onClose={closeInstallTargetDialog}
        onApply={applyInstallTarget}
      />

      {selectedInstallable.length > 0 && (
        null
      )}

      <NotificationSnackbar />
    </AppShell>
  );
}
