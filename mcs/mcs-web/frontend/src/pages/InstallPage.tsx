import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Paper,
  Tooltip,
  Grid,
  Switch,
  Slide,
  Fade,
  Drawer,
  Divider,
  Dialog,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import HomeIcon from "@mui/icons-material/Home";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FilterListIcon from "@mui/icons-material/FilterList";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExtensionIcon from "@mui/icons-material/Extension";
import { useI18n } from "@/i18n";
import type { TranslateFn } from "@/i18n";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import {
  getSkills,
  getCategories,
  getSkillDetail,
  installSkills,
  startExternalInstallJob,
  getExternalSkillCatalog,
} from "@/api/client";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { InstallTargetDialog } from "@/components/dialogs/InstallTargetDialog";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { useInstallTarget } from "@/hooks/useInstallTarget";
import ReactMarkdown from "react-markdown";
import type {
  CategoryDto,
  ExternalInstallBatchItemDto,
  ExternalInstallItemFinishedPayload,
  ExternalInstallItemStartedPayload,
  ExternalInstallJobCompletedPayload,
  ExternalInstallJobProgressPayload,
  ExternalInstallMethod,
  ExternalSkillCatalogDto,
  InstallStatus,
  InstallTarget,
  ItemDetailDto,
  ItemDto,
} from "@/types";

// ── Types & Constants ────────────────────────────────────────────────

type SourceMode = "local" | "vercel" | "playbooks";
const SIDEBAR_WIDTH = 260;

// ── Helpers ──────────────────────────────────────────────────────────

function statusLabel(status: InstallStatus, t: TranslateFn): string {
  switch (status) {
    case "installed":
      return t("status.installed");
    case "outdated":
      return t("status.outdated");
    case "not_installed":
      return t("status.notInstalled");
    default:
      return status;
  }
}

function statusColor(status: InstallStatus): "success" | "warning" | "default" {
  switch (status) {
    case "installed":
      return "success";
    case "outdated":
      return "warning";
    default:
      return "default";
  }
}

function StatusIcon({ status }: { status: InstallStatus }) {
  switch (status) {
    case "installed":
      return <CheckCircleOutlineIcon fontSize="small" color="success" />;
    case "outdated":
      return <WarningAmberIcon fontSize="small" color="warning" />;
    default:
      return <RadioButtonUncheckedIcon fontSize="small" color="disabled" />;
  }
}

// ── Sidebar ──────────────────────────────────────────────────────────

interface SidebarProps {
  sourceMode: SourceMode;
  onSourceChange: (mode: SourceMode) => void;
  statusFilter: InstallStatus | null;
  onStatusFilterChange: (status: InstallStatus | null) => void;
  statusCounts: { installed: number; outdated: number; not_installed: number };
  showDefaultOnly: boolean;
  onDefaultToggle: () => void;
  onSelectAllDefault: () => void;
  selectedCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  categories: CategoryDto[];
  totalSkills: number;
}

function SidebarContent({
  sourceMode,
  onSourceChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  showDefaultOnly,
  onDefaultToggle,
  onSelectAllDefault,
  selectedCategory,
  onCategoryChange,
  categories,
  totalSkills,
}: SidebarProps) {
  const { t } = useI18n();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        py: 1,
      }}
    >
      {/* ── SOURCE ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.65rem" }}
      >
        {t("install.source")}
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={sourceMode === "local"}
          onClick={() => onSourceChange("local")}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <FolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("install.sourceLocalRepo")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
        </ListItemButton>
        <ListItemButton
          selected={sourceMode === "vercel"}
          onClick={() => onSourceChange("vercel")}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <CloudDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("install.sourceVercel")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
        </ListItemButton>
        <ListItemButton
          selected={sourceMode === "playbooks"}
          onClick={() => onSourceChange("playbooks")}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <MenuBookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("install.sourcePlaybooks")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
        </ListItemButton>
      </List>

      <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />

      {/* ── STATUS ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.65rem" }}
      >
        {t("install.status")}
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={statusFilter === "installed"}
          onClick={() =>
            onStatusFilterChange(
              statusFilter === "installed" ? null : "installed"
            )
          }
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <CheckCircleOutlineIcon
              fontSize="small"
              color={statusFilter === "installed" ? "success" : "disabled"}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("status.installed")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
          <Chip
            label={statusCounts.installed}
            size="small"
            sx={{
              height: 20,
              minWidth: 28,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: theme.palette.success.main,
            }}
          />
        </ListItemButton>
        <ListItemButton
          selected={statusFilter === "outdated"}
          onClick={() =>
            onStatusFilterChange(
              statusFilter === "outdated" ? null : "outdated"
            )
          }
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <WarningAmberIcon
              fontSize="small"
              color={statusFilter === "outdated" ? "warning" : "disabled"}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("status.outdated")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
          <Chip
            label={statusCounts.outdated}
            size="small"
            sx={{
              height: 20,
              minWidth: 28,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              color: theme.palette.warning.main,
            }}
          />
        </ListItemButton>
        <ListItemButton
          selected={statusFilter === "not_installed"}
          onClick={() =>
            onStatusFilterChange(
              statusFilter === "not_installed" ? null : "not_installed"
            )
          }
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <RadioButtonUncheckedIcon
              fontSize="small"
              color={statusFilter === "not_installed" ? "primary" : "disabled"}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("status.notInstalled")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
          <Chip
            label={statusCounts.not_installed}
            size="small"
            sx={{
              height: 20,
              minWidth: 28,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          />
        </ListItemButton>
      </List>

      <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />

      {/* ── DEFAULT ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.65rem" }}
      >
        {t("install.defaultSection")}
      </Typography>
      <Box sx={{ px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Switch
          size="small"
          checked={showDefaultOnly}
          onChange={onDefaultToggle}
          color="primary"
        />
        <Typography variant="body2" fontWeight={500}>
          {t("install.onlyDefaultSkills")}
        </Typography>
      </Box>
      {showDefaultOnly && (
        <Box sx={{ px: 2, mt: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SelectAllIcon />}
            onClick={onSelectAllDefault}
            fullWidth
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t("install.selectDefaultOnly")}
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />

      {/* ── CATEGORIES ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, mb: 0.5, letterSpacing: 1.5, fontSize: "0.65rem" }}
      >
        {t("install.categories")}
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
        >
          <ListItemText
            primary={t("install.totalSkills")}
            primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
          />
          <Chip
            label={totalSkills}
            size="small"
            sx={{
              height: 20,
              minWidth: 28,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          />
        </ListItemButton>
        {categories.map((cat) => (
          <ListItemButton
            key={cat.name}
            selected={selectedCategory === cat.name}
            onClick={() => onCategoryChange(cat.name)}
          >
            <ListItemText
              primary={cat.name}
              primaryTypographyProps={{
                variant: "body2",
                fontWeight: 500,
                noWrap: true,
              }}
            />
            <Chip
              label={cat.count}
              size="small"
              sx={{
                height: 20,
                minWidth: 28,
                fontSize: "0.7rem",
                fontWeight: 600,
                bgcolor:
                  selectedCategory === cat.name
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.text.primary, 0.08),
                color:
                  selectedCategory === cat.name
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

// ── SkillCard ────────────────────────────────────────────────────────

interface SkillCardProps {
  item: ItemDto;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onShowDetail: () => void;
}

function SkillCard({ item, index, selected, onToggle, onShowDetail }: SkillCardProps) {
  const { t } = useI18n();
  const theme = useTheme();
  const isInstalled = item.status === "installed";
  const isOutdated = item.status === "outdated";

  return (
    <Card
      onClick={onToggle}
      sx={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition:
          "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s",
        animation: `skillFadeIn 0.3s ease-out ${index * 0.03}s both`,
        "@keyframes skillFadeIn": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        ...(selected && {
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
        }),
        ...(isOutdated && {
          borderLeft: `3px solid ${theme.palette.warning.main}`,
        }),
        ...(isInstalled && {
          opacity: 0.7,
        }),
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: selected
            ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}, 0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`
            : `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Top row: Checkbox + Status */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Checkbox
            size="small"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggle}
            sx={{
              p: 0.5,
              opacity: selected ? 1 : 0.4,
              "&:hover": { opacity: 1 },
            }}
          />
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={t("common.viewDetail")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetail();
                }}
                sx={{
                  p: 0.5,
                  opacity: 0.5,
                  "&:hover": { opacity: 1, color: "primary.main" },
                }}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Chip
              icon={<StatusIcon status={item.status} />}
              label={statusLabel(item.status, t)}
              color={statusColor(item.status)}
              variant="outlined"
              size="small"
              sx={{ height: 24, borderRadius: 1.5, fontSize: "0.7rem" }}
            />
          </Box>
        </Box>

        {/* Name */}
        <Typography
          variant="body2"
          fontWeight={600}
          color="primary.main"
          noWrap
          sx={{ mb: 0.5 }}
        >
          {item.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            minHeight: "2.8em",
          }}
        >
          {item.description ?? t("installHub.noDescription")}
        </Typography>

        {/* Bottom: Category + Default badge */}
        <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
          {item.category && (
            <Chip
              label={item.category}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                borderRadius: 1,
                maxWidth: 120,
              }}
            />
          )}
          {item.is_default && (
            <Chip
              label={t("common.default")}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 600,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ── SkillCardGrid ────────────────────────────────────────────────────

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
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 12,
          gap: 2,
        }}
      >
        <ExtensionIcon sx={{ fontSize: 64, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          {t("install.noSkillsFound")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("install.adjustFilters")}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {skills.map((item, index) => (
        <Grid key={item.name} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
          <SkillCard
            item={item}
            index={index}
            selected={selectedNames.has(item.name)}
            onToggle={() => onToggle(item.name)}
            onShowDetail={() => onShowDetail(item.name)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

// ── SearchToolbar ────────────────────────────────────────────────────

function SearchToolbar({
  search,
  onSearchChange,
  onSelectAll,
  onClearSelection,
  selectedCount,
  outdatedCount,
  onUpdateAll,
}: {
  search: string;
  onSearchChange: (val: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectedCount: number;
  outdatedCount: number;
  onUpdateAll: () => void;
}) {
  const { t } = useI18n();
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mb: 3,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <TextField
        size="small"
        placeholder={t("install.searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
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

      <Button
        size="small"
        variant="outlined"
        startIcon={<SelectAllIcon />}
        onClick={onSelectAll}
        sx={{ borderRadius: 2, textTransform: "none" }}
      >
        {t("install.selectAll")}
      </Button>

      {selectedCount > 0 && (
        <Button
          size="small"
          variant="text"
          onClick={onClearSelection}
          sx={{ borderRadius: 2, textTransform: "none" }}
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
          startIcon={<SystemUpdateAltIcon />}
          onClick={onUpdateAll}
          sx={{ borderRadius: 2 }}
        >
          {t("install.updateAll", { count: outdatedCount })}
        </Button>
      )}
    </Box>
  );
}

// ── FloatingActionBar ────────────────────────────────────────────────

function FloatingActionBar({
  count,
  onInstall,
  onClear,
}: {
  count: number;
  onInstall: () => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const theme = useTheme();

  return (
    <Slide direction="down" in={count > 0} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: theme.zIndex.appBar - 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          py: 1.5,
          borderRadius: 4,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(20, 20, 25, 0.85)"
              : "rgba(255, 255, 255, 0.9)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Chip
          label={t("common.selectedCount", { count })}
          color="primary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Button
          variant="contained"
          startIcon={<InstallDesktopIcon />}
          onClick={onInstall}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          {`${t("common.install")} / ${t("common.reinstall")}`}
        </Button>
        <IconButton size="small" onClick={onClear}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Slide>
  );
}

// ── SkillDetailDialog ────────────────────────────────────────────────

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
  const theme = useTheme();
  const [detail, setDetail] = useState<ItemDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !skillName) return;
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
      PaperProps={{
        elevation: 0,
        sx: {
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.06)"
            : "rgba(0, 0, 0, 0.06)"
            }`,
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
            }}
          >
            <ExtensionIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              {skillName ?? t("dialogs.detailFallbackTitle")}
            </Typography>
            {detail?.category && (
              <Typography variant="caption" color="text.secondary">
                {detail.category}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.08)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 3,
          py: 2.5,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : detail ? (
          <>
            {/* Metadata row */}
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" mb={2}>
              <Chip
                icon={<StatusIcon status={detail.status} />}
                label={statusLabel(detail.status, t)}
                color={statusColor(detail.status)}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5 }}
              />
              {detail.is_default && (
                <Chip
                  label={t("common.default")}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                  }}
                />
              )}
              {detail.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 1.5 }}
                />
              ))}
            </Box>

            {/* Description */}
            {detail.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2.5,
                  lineHeight: 1.7,
                  pb: 2,
                  borderBottom: `1px solid ${theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)"
                    }`,
                }}
              >
                {detail.description}
              </Typography>
            )}

            {/* Markdown content */}
            {detail.content ? (
              <Box
                sx={{
                  "& h1": {
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    mt: 3,
                    mb: 1.5,
                    fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
                    background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  },
                  "& h2": {
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    mt: 2.5,
                    mb: 1,
                    fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
                  },
                  "& h3": {
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    mt: 2,
                    mb: 0.5,
                    fontFamily: '"Outfit", "Noto Sans SC", sans-serif',
                  },
                  "& p": { mb: 1.5, lineHeight: 1.8, fontSize: "0.9rem" },
                  "& code": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(139, 92, 246, 0.12)"
                        : "rgba(139, 92, 246, 0.08)",
                    color: theme.palette.primary.main,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: "0.85em",
                    fontFamily: '"JetBrains Mono", monospace',
                  },
                  "& pre": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(0, 0, 0, 0.03)",
                    border: `1px solid ${theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)"
                      }`,
                    p: 2,
                    borderRadius: 3,
                    overflow: "auto",
                    fontSize: "0.85rem",
                    "& code": {
                      bgcolor: "transparent",
                      color: "inherit",
                      px: 0,
                      py: 0,
                    },
                  },
                  "& ul, & ol": { pl: 3, mb: 1.5 },
                  "& li": { mb: 0.5, lineHeight: 1.7, fontSize: "0.9rem" },
                  "& blockquote": {
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    pl: 2,
                    ml: 0,
                    my: 1.5,
                    color: "text.secondary",
                    fontStyle: "italic",
                  },
                  "& a": {
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  },
                  "& hr": {
                    border: "none",
                    borderTop: `1px solid ${theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)"
                      }`,
                    my: 2,
                  },
                  "& table": {
                    width: "100%",
                    borderCollapse: "collapse",
                    mb: 2,
                    fontSize: "0.85rem",
                  },
                  "& th, & td": {
                    border: `1px solid ${theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)"
                      }`,
                    px: 1.5,
                    py: 1,
                    textAlign: "left",
                  },
                  "& th": {
                    fontWeight: 600,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(139,92,246,0.08)"
                        : "rgba(139,92,246,0.04)",
                  },
                }}
              >
                <ReactMarkdown>{detail.content}</ReactMarkdown>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 6,
                  gap: 1,
                }}
              >
                <ExtensionIcon
                  sx={{ fontSize: 48, color: "text.disabled" }}
                />
                <Typography color="text.secondary" fontStyle="italic">
                  {t("dialogs.noSkillContent")}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
              gap: 1,
            }}
          >
            <Typography color="text.secondary">
              {t("dialogs.failedLoadDetail")}
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

// ── ExternalInstallPanel ─────────────────────────────────────────────

function ExternalInstallPanel({
  platformId,
  sourceMode,
  installTarget,
  disabledInProject,
  showNotification,
}: {
  platformId: string;
  sourceMode: "vercel" | "playbooks";
  installTarget: InstallTarget;
  disabledInProject: boolean;
  showNotification: (msg: string, sev: "success" | "error" | "warning") => void;
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const [extMethod, setExtMethod] = useState<ExternalInstallMethod>(sourceMode);
  const [customBatchInput, setCustomBatchInput] = useState("");
  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<Set<string>>(new Set());

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobRunning, setJobRunning] = useState(false);
  const [jobCompleted, setJobCompleted] = useState(0);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobPercent, setJobPercent] = useState(0);
  const [jobSuccessCount, setJobSuccessCount] = useState(0);
  const [jobFailureCount, setJobFailureCount] = useState(0);
  const [streamDisconnected, setStreamDisconnected] = useState(false);

  const [catalogItems, setCatalogItems] = useState<ExternalSkillCatalogDto[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [itemStates, setItemStates] = useState<
    Array<{
      key: string;
      skillName: string;
      method: ExternalInstallMethod;
      status: "pending" | "running" | "success" | "error";
      output: string;
      error: string | null;
      durationMs: number | null;
    }>
  >([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const streamWarnedRef = useRef(false);

  useEffect(() => {
    setExtMethod(sourceMode);
    setSelectedCatalogKeys(new Set());
  }, [sourceMode]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const data = await getExternalSkillCatalog();
        setCatalogItems(data);
      } catch (e) {
        console.error("Failed to load external skills catalog", e);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const visibleCatalogItems = useMemo(
    () => catalogItems.filter((item) => item.method === sourceMode),
    [catalogItems, sourceMode]
  );

  const toSkillName = useCallback((item: ExternalSkillCatalogDto) => {
    return item.skill_flag ? `${item.repo} --skill ${item.skill_flag}` : item.repo;
  }, []);

  const itemKey = useCallback((method: ExternalInstallMethod, skillName: string) => {
    return `${method}::${skillName.trim()}`;
  }, []);

  const parseCustomInput = useCallback((): ExternalInstallBatchItemDto[] => {
    const lines = customBatchInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((skillName) => ({
      skill_name: skillName,
      method: extMethod,
    }));
  }, [customBatchInput, extMethod]);

  const queuedItems = useMemo(() => {
    const dedup = new Map<string, ExternalInstallBatchItemDto>();

    for (const item of visibleCatalogItems) {
      const skillName = toSkillName(item);
      const key = itemKey(item.method as ExternalInstallMethod, skillName);
      if (!selectedCatalogKeys.has(key)) continue;
      dedup.set(key, {
        skill_name: skillName,
        method: item.method as ExternalInstallMethod,
      });
    }

    for (const item of parseCustomInput()) {
      dedup.set(itemKey(item.method, item.skill_name), item);
    }

    return Array.from(dedup.values());
  }, [visibleCatalogItems, toSkillName, selectedCatalogKeys, parseCustomInput, itemKey]);

  const closeEventStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const initializePendingItems = useCallback(
    (items: ExternalInstallBatchItemDto[]) => {
      setItemStates(
        items.map((item) => ({
          key: itemKey(item.method, item.skill_name),
          skillName: item.skill_name,
          method: item.method,
          status: "pending" as const,
          output: "",
          error: null,
          durationMs: null,
        }))
      );
    },
    [itemKey]
  );

  const handleExternalBatchInstall = async () => {
    if (disabledInProject || queuedItems.length === 0 || jobRunning) return;

    streamWarnedRef.current = false;
    setStreamDisconnected(false);
    setJobId(null);
    setJobRunning(true);
    setJobCompleted(0);
    setJobTotal(queuedItems.length);
    setJobPercent(0);
    setJobSuccessCount(0);
    setJobFailureCount(0);
    initializePendingItems(queuedItems);

    closeEventStream();

    try {
      const started = await startExternalInstallJob(platformId, queuedItems, installTarget);
      setJobId(started.job_id);
      setJobTotal(started.total);

      const streamUrl = `/api/platforms/${encodeURIComponent(
        platformId
      )}/skills/external-install/jobs/${encodeURIComponent(started.job_id)}/stream`;

      const source = new EventSource(streamUrl);
      eventSourceRef.current = source;

      source.addEventListener("item_started", (event) => {
        const payload = safeParseEvent<ExternalInstallItemStartedPayload>(event);
        if (!payload) return;
        const key = itemKey(payload.method, payload.skill_name);
        setItemStates((prev) =>
          prev.map((item) => (item.key === key ? { ...item, status: "running" } : item))
        );
      });

      source.addEventListener("item_finished", (event) => {
        const payload = safeParseEvent<ExternalInstallItemFinishedPayload>(event);
        if (!payload) return;
        const key = itemKey(payload.method, payload.skill_name);
        setItemStates((prev) =>
          prev.map((item) =>
            item.key === key
              ? {
                  ...item,
                  status: payload.success ? "success" : "error",
                  output: payload.output ?? "",
                  error: payload.error,
                  durationMs: payload.duration_ms,
                }
              : item
          )
        );
      });

      source.addEventListener("job_progress", (event) => {
        const payload = safeParseEvent<ExternalInstallJobProgressPayload>(event);
        if (!payload) return;
        setJobCompleted(payload.completed);
        setJobTotal(payload.total);
        setJobSuccessCount(payload.success_count);
        setJobFailureCount(payload.failure_count);
        setJobPercent(payload.percent);
      });

      source.addEventListener("job_completed", (event) => {
        const payload = safeParseEvent<ExternalInstallJobCompletedPayload>(event);
        if (!payload) return;

        setJobRunning(false);
        setJobCompleted(payload.total);
        setJobTotal(payload.total);
        setJobSuccessCount(payload.success_count);
        setJobFailureCount(payload.failure_count);
        setJobPercent(100);
        closeEventStream();

        showNotification(
          t("install.externalBatchCompleted", {
            success: payload.success_count,
            failed: payload.failure_count,
          }),
          payload.failure_count > 0 ? "warning" : "success"
        );
      });

      source.addEventListener("job_failed", (event) => {
        const payload = safeParseEvent<{ message: string }>(event);
        const message = payload?.message ?? t("install.installationFailed");
        setJobRunning(false);
        closeEventStream();
        showNotification(t("install.externalBatchFailed", { message }), "error");
      });

      source.onerror = () => {
        setStreamDisconnected(true);
        if (!streamWarnedRef.current) {
          streamWarnedRef.current = true;
          showNotification(t("install.externalBatchConnectionLost"), "warning");
        }
      };
    } catch (e) {
      setJobRunning(false);
      closeEventStream();
      showNotification((e as Error).message, "error");
    }
  };

  const toggleCatalogSelection = (item: ExternalSkillCatalogDto) => {
    if (disabledInProject || jobRunning) return;
    const skillName = toSkillName(item);
    const key = itemKey(item.method as ExternalInstallMethod, skillName);
    setSelectedCatalogKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearBatchSelection = () => {
    if (jobRunning) return;
    setSelectedCatalogKeys(new Set());
    setCustomBatchInput("");
  };

  return (
    <Fade in>
      <Card
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
        }}
        elevation={0}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={4}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <CloudDownloadIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.01em" }}>
                {t("install.externalInstallTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sourceMode === "vercel"
                  ? t("install.externalInstallSubVercel")
                  : t("install.externalInstallSubPlaybooks")}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ display: "flex", flexDirection: "column" }}>
              <Stack spacing={3} sx={{ flex: 1 }}>
                {disabledInProject && (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    {t("install.externalInstallDisabledInProject")}
                  </Alert>
                )}

                {!catalogLoading && catalogItems.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={700}>
                      {t("install.externalBatchRecommended")}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={t("install.externalBatchSelectionCount", {
                          count: selectedCatalogKeys.size,
                        })}
                      />
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {visibleCatalogItems.map((item) => {
                        const disabled = disabledInProject && item.project_only;
                        const skillName = toSkillName(item);
                        const key = itemKey(item.method as ExternalInstallMethod, skillName);
                        const isSelected = selectedCatalogKeys.has(key);

                        return (
                          <Grid size={{ xs: 12, sm: 6, lg: 6 }} key={item.name}>
                            <Card
                              variant="outlined"
                              sx={{
                                cursor: disabled ? "not-allowed" : "pointer",
                                borderColor: isSelected ? "primary.main" : "divider",
                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                                opacity: disabled ? 0.6 : 1,
                                height: "100%",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: isSelected ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` : "none",
                                "&:hover": {
                                  borderColor: disabled ? "divider" : "primary.main",
                                  transform: disabled ? "none" : "translateY(-2px)",
                                  boxShadow: disabled ? "none" : `0 6px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
                                },
                              }}
                              onClick={() => {
                                if (disabled) return;
                                toggleCatalogSelection(item);
                              }}
                            >
                              <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                  <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1, mr: 1 }}>
                                    {item.name}
                                  </Typography>
                                  {item.category && (
                                    <Chip
                                      label={item.category}
                                      size="small"
                                      color={isSelected ? "primary" : "default"}
                                      variant={isSelected ? "filled" : "outlined"}
                                      sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                                  {item.description || item.repo}
                                </Typography>
                                <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontFamily: '"JetBrains Mono", monospace', color: "text.secondary", mr: 1 }}
                                  >
                                    {skillName}
                                  </Typography>
                                  <Checkbox size="small" checked={isSelected} />
                                </Box>
                                {disabled && (
                                  <Typography variant="caption" color="error" sx={{ display: "block", mt: 1, fontWeight: 500 }}>
                                    * only supports global install
                                  </Typography>
                                )}
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  flex: 1,
                  bgcolor: theme.palette.mode === "dark" ? alpha("#000", 0.2) : alpha("#000", 0.02)
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>{t("install.externalBatchCustomInput")}</span>
                  <Chip size="small" label="CLI" sx={{ height: 18, fontSize: "0.6rem" }} />
                </Typography>

                <TextField
                  label={t("install.externalBatchCustomInput")}
                  placeholder={t("install.externalBatchCustomHint")}
                  value={customBatchInput}
                  onChange={(e) => setCustomBatchInput(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  disabled={disabledInProject || jobRunning}
                />

                <FormControl>
                  <FormLabel sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 1 }}>
                    {t("install.installMethod")}
                  </FormLabel>
                  <RadioGroup
                    value={extMethod}
                    onChange={(e) => setExtMethod(e.target.value as ExternalInstallMethod)}
                    row
                    sx={{ opacity: disabledInProject || jobRunning ? 0.6 : 1 }}
                  >
                    <FormControlLabel
                      value="vercel"
                      control={<Radio size="small" />}
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.85rem",
                          }}
                        >
                          {t("install.installMethodVercel")}
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      value="playbooks"
                      control={<Radio size="small" />}
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.85rem",
                          }}
                        >
                          {t("install.installMethodPlaybooks")}
                        </Typography>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    jobRunning ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <InstallDesktopIcon />
                    )
                  }
                  onClick={handleExternalBatchInstall}
                  disabled={queuedItems.length === 0 || jobRunning || disabledInProject}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                  fullWidth
                >
                  {jobRunning ? t("install.externalBatchInProgress") : t("install.externalBatchStart")}
                </Button>

                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={t("install.externalBatchQueueCount", { count: queuedItems.length })}
                  />
                  <Chip
                    size="small"
                    color={jobFailureCount > 0 ? "warning" : "success"}
                    variant="outlined"
                    label={t("install.externalBatchCurrent", {
                      completed: jobCompleted,
                      total: jobTotal,
                    })}
                  />
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label={t("installHub.successCount", { count: jobSuccessCount })}
                  />
                  <Chip
                    size="small"
                    color="error"
                    variant="outlined"
                    label={t("installHub.failedCount", { count: jobFailureCount })}
                  />
                </Stack>

                {(jobRunning || jobTotal > 0) && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, jobPercent))}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
                        },
                      }}
                    />
                    {jobId && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                        Job: {jobId}
                      </Typography>
                    )}
                    {streamDisconnected && (
                      <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                        {t("install.externalBatchConnectionLost")}
                      </Alert>
                    )}
                  </Box>
                )}

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={clearBatchSelection}
                    disabled={jobRunning}
                  >
                    {t("install.externalBatchClear")}
                  </Button>
                </Stack>

                {itemStates.length > 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === "dark" ? "#0d1117" : "#f6f8fa",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.8),
                      overflow: "auto",
                      flex: 1,
                      minHeight: 220,
                    }}
                  >
                    <Stack spacing={0.75}>
                      {itemStates.map((item) => (
                        <Box
                          key={item.key}
                          sx={{
                            px: 1,
                            py: 0.75,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.divider, 0.8),
                            transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                            backgroundColor:
                              item.status === "running"
                                ? alpha(theme.palette.info.main, 0.08)
                                : item.status === "success"
                                ? alpha(theme.palette.success.main, 0.08)
                                : item.status === "error"
                                ? alpha(theme.palette.error.main, 0.08)
                                : "transparent",
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {item.skillName}
                            </Typography>
                            <Chip
                              size="small"
                              color={
                                item.status === "success"
                                  ? "success"
                                  : item.status === "error"
                                  ? "error"
                                  : item.status === "running"
                                  ? "info"
                                  : "default"
                              }
                              label={item.status}
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block", color: "text.secondary", fontFamily: '"JetBrains Mono", monospace' }}
                          >
                            {item.method}
                            {item.durationMs !== null ? ` - ${item.durationMs}ms` : ""}
                          </Typography>
                          {item.error && (
                            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                              {item.error}
                            </Typography>
                          )}
                          {item.output && (
                            <Typography
                              component="pre"
                              variant="caption"
                              sx={{
                                mt: 0.5,
                                mb: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: "0.65rem",
                                color: "text.secondary",
                              }}
                            >
                              {item.output}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                ) : (
                  <Alert severity="info">{t("install.externalBatchNoQueue")}</Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );
}

function safeParseEvent<T>(event: Event): T | null {
  const payload = event as MessageEvent<string>;
  if (!payload?.data) return null;
  try {
    return JSON.parse(payload.data) as T;
  } catch {
    return null;
  }
}
export default function InstallPage() {
  const { t } = useI18n();
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const platform = usePlatformStore((s) =>
    s.platforms.find((p) => p.id === platformId)
  );
  const { fetchPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();
  const {
    loading: installTargetLoading,
    dialogOpen: installTargetDialogOpen,
    target: installTarget,
    resolvedTarget,
    recentProjects,
    openDialog: openInstallTargetDialog,
    closeDialog: closeInstallTargetDialog,
    applyTarget: applyInstallTarget,
  } = useInstallTarget(platformId);

  // Source mode (replaces tabs)
  const [sourceMode, setSourceMode] = useState<SourceMode>("local");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Local skills state
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

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const fetchSkills = useCallback(async () => {
    if (!platformId || !resolvedTarget) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills(platformId, {
        search: search || undefined,
        category: selectedCategory ?? undefined,
        installTarget,
      });
      setSkills(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [platformId, resolvedTarget, installTarget, search, selectedCategory]);

  const fetchCats = useCallback(async () => {
    if (!platformId || !resolvedTarget) return;
    try {
      const cats = await getCategories(platformId, installTarget);
      setCategories(cats.filter((c) => c.item_type === "skill"));
    } catch {
      // non-critical
    }
  }, [platformId, resolvedTarget, installTarget]);

  useEffect(() => {
    if (sourceMode === "local" && resolvedTarget) {
      fetchSkills();
      fetchCats();
    }
  }, [sourceMode, resolvedTarget, fetchSkills, fetchCats]);

  // Clear selection when source changes
  useEffect(() => {
    setSelectedNames(new Set());
  }, [sourceMode]);

  // Clear selection when install target changes.
  useEffect(() => {
    setSelectedNames(new Set());
  }, [installTarget.scope, installTarget.project_path]);

  // Client-side filtering
  const filteredSkills = useMemo(() => {
    let result = statusFilter
      ? skills.filter((s) => s.status === statusFilter)
      : skills;
    if (showDefaultOnly) result = result.filter((s) => s.is_default);
    return result;
  }, [skills, statusFilter, showDefaultOnly]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { installed: 0, outdated: 0, not_installed: 0 };
    for (const s of skills) {
      if (s.status in counts) counts[s.status as keyof typeof counts]++;
    }
    return counts;
  }, [skills]);

  // Selected items (all selected can be installed/reinstalled)
  const selectedInstallable = useMemo(() => {
    return skills.filter(
      (s) => selectedNames.has(s.name)
    );
  }, [skills, selectedNames]);

  const toggleSelection = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSelectAll = () => {
    const names = filteredSkills
      .map((s) => s.name);
    setSelectedNames(new Set(names));
  };

  const handleSelectAllDefault = () => {
    const names = filteredSkills
      .filter((s) => s.is_default)
      .map((s) => s.name);
    setSelectedNames(new Set(names));
  };

  const handleBatchUpdate = async () => {
    if (!platformId) return;
    const outdated = skills.filter((s) => s.status === "outdated");
    if (outdated.length === 0) return;
    try {
      const result = await installSkills(
        platformId,
        outdated.map((s) => s.name),
        "auto",
        installTarget
      );
      showNotification(
        t("install.updatedSkillsNotification", {
          success: result.success_count,
          failedSuffix:
            result.failure_count > 0
              ? `, ${t("installHub.failedCount", { count: result.failure_count })}`
              : "",
        }),
        result.failure_count > 0 ? "warning" : "success"
      );
      fetchSkills();
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

  // Sidebar props
  const sidebarProps: SidebarProps = {
    sourceMode,
    onSourceChange: setSourceMode,
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    statusCounts,
    showDefaultOnly,
    onDefaultToggle: () => setShowDefaultOnly((v) => !v),
    onSelectAllDefault: handleSelectAllDefault,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    categories,
    totalSkills: skills.length,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <AnimatedBackground />

      {/* ── AppBar ── */}
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 0.5 }}
            >
              <FilterListIcon />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            onClick={() => navigate(`/platform/${platformId}`)}
            sx={{ mr: 0.5 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Tooltip title={t("common.home")}>
            <IconButton
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {t("install.pageTitle", {
                platform: `${platform?.icon ?? ""} ${platform?.name ?? platformId}`,
              })}
            </Typography>
            <Tooltip
              title={
                resolvedTarget?.skills_path ??
                t("install.installTargetLoading")
              }
            >
              <Chip
                icon={<FolderOpenOutlinedIcon />}
                variant="outlined"
                size="small"
                color="info"
                clickable
                onClick={openInstallTargetDialog}
                label={t("install.installTargetChip", {
                  mode:
                    installTarget.scope === "project"
                      ? t("install.installTargetProject")
                      : t("install.installTargetGlobal"),
                  path:
                    resolvedTarget?.skills_path ??
                    t("install.installTargetLoading"),
                })}
                sx={{ "& .MuiChip-label": { whiteSpace: "nowrap" } }}
              />
            </Tooltip>
          </Box>
          <LanguageToggle sx={{ mr: 1 }} />
          <IconButton color="inherit" onClick={toggleColorMode}>
            {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ── Mobile Drawer ── */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH, pt: 2 } }}
        >
          <SidebarContent {...sidebarProps} />
        </Drawer>
      )}

      {/* ── Main Layout ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              position: "sticky",
              top: 88,
            }}
          >
            <Card
              elevation={0}
              sx={{ overflow: "hidden", borderRadius: 4 }}
            >
              <SidebarContent {...sidebarProps} />
            </Card>
          </Box>
        )}

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Local source: skill grid */}
          {sourceMode === "local" && (
            <>
              {!resolvedTarget ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <SearchToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onSelectAll={handleSelectAll}
                    onClearSelection={() => setSelectedNames(new Set())}
                    selectedCount={selectedNames.size}
                    outdatedCount={statusCounts.outdated}
                    onUpdateAll={handleBatchUpdate}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <SkillCardGrid
                      skills={filteredSkills}
                      selectedNames={selectedNames}
                      onToggle={toggleSelection}
                      onShowDetail={setDetailName}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* External sources: inline panel */}
          {sourceMode !== "local" && platformId && (
            <ExternalInstallPanel
              platformId={platformId}
              sourceMode={sourceMode}
              installTarget={installTarget}
              disabledInProject={installTarget.scope === "project"}
              showNotification={showNotification}
            />
          )}
        </Box>
      </Box>

      {/* ── Floating Action Bar ── */}
      <FloatingActionBar
        count={selectedInstallable.length}
        onInstall={() => setInstallOpen(true)}
        onClear={() => setSelectedNames(new Set())}
      />

      {/* ── Install Dialog ── */}
      {platformId && (
        <InstallDialog
          open={installOpen}
          platformId={platformId}
          platform={platform}
          itemNames={selectedInstallable.map((s) => s.name)}
          itemCategories={Object.fromEntries(
            selectedInstallable.map((s) => [s.name, s.category])
          )}
          itemType="skills"
          installTarget={installTarget}
          onClose={() => setInstallOpen(false)}
          onCompleted={(successCount, failureCount) => {
            showNotification(
              t("install.installedSkillsNotification", {
                success: successCount,
                failedSuffix:
                  failureCount > 0
                    ? `, ${t("installHub.failedCount", { count: failureCount })}`
                    : "",
              }),
              failureCount > 0 ? "warning" : "success"
            );
            setSelectedNames(new Set());
            fetchSkills();
          }}
        />
      )}

      {/* ── Skill Detail Dialog ── */}
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

      <NotificationSnackbar />
    </Box>
  );
}


