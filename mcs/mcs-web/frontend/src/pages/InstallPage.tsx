import { useEffect, useState, useMemo, useCallback } from "react";
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
import FolderIcon from "@mui/icons-material/Folder";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FilterListIcon from "@mui/icons-material/FilterList";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExtensionIcon from "@mui/icons-material/Extension";
import { usePlatformStore } from "@/stores/platformStore";
import { useUiStore } from "@/stores/uiStore";
import {
  getSkills,
  getCategories,
  getSkillDetail,
  installSkills,
  externalInstallSkill,
} from "@/api/client";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import ReactMarkdown from "react-markdown";
import type { ItemDto, InstallStatus, CategoryDto, ItemDetailDto } from "@/types";

// ── Types & Constants ────────────────────────────────────────────────

type SourceMode = "local" | "vercel" | "playbooks";
const SIDEBAR_WIDTH = 260;

// ── Helpers ──────────────────────────────────────────────────────────

function statusLabel(status: InstallStatus): string {
  switch (status) {
    case "installed":
      return "Installed";
    case "outdated":
      return "Outdated";
    case "not_installed":
      return "Not Installed";
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
        SOURCE
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
            primary="Local Repo"
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
            primary="Vercel"
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
            primary="Playbooks"
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
        STATUS
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
            primary={`Installed`}
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
            primary={`Outdated`}
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
            primary={`Not Installed`}
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
        DEFAULT
      </Typography>
      <Box sx={{ px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Switch
          size="small"
          checked={showDefaultOnly}
          onChange={onDefaultToggle}
          color="primary"
        />
        <Typography variant="body2" fontWeight={500}>
          Default Only
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
            Select All Default
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
        CATEGORIES
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
        >
          <ListItemText
            primary="All Skills"
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
            <Tooltip title="View detail">
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
              label={statusLabel(item.status)}
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
          {item.description ?? "No description"}
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
              label="Default"
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
          No skills found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or search query
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
        placeholder="Search skills..."
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
        Select All
      </Button>

      {selectedCount > 0 && (
        <Button
          size="small"
          variant="text"
          onClick={onClearSelection}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Clear
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
          Update All ({outdatedCount})
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
          label={`${count} selected`}
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
          Install / Reinstall
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
              {skillName ?? "Skill Detail"}
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
                label={statusLabel(detail.status)}
                color={statusColor(detail.status)}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5 }}
              />
              {detail.is_default && (
                <Chip
                  label="Default"
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
                  No SKILL.md content available
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
              Failed to load detail
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
  showNotification,
}: {
  platformId: string;
  sourceMode: "vercel" | "playbooks";
  showNotification: (msg: string, sev: "success" | "error" | "warning") => void;
}) {
  const theme = useTheme();
  const [extSkillName, setExtSkillName] = useState("");
  const [extMethod, setExtMethod] = useState<"vercel" | "playbooks">(sourceMode);
  const [extLoading, setExtLoading] = useState(false);
  const [extOutput, setExtOutput] = useState<string | null>(null);
  const [extSuccess, setExtSuccess] = useState<boolean | null>(null);

  // Sync method when source mode changes
  useEffect(() => {
    setExtMethod(sourceMode);
  }, [sourceMode]);

  const handleExternalInstall = async () => {
    if (!extSkillName.trim()) return;
    setExtLoading(true);
    setExtOutput(null);
    setExtSuccess(null);
    try {
      const result = await externalInstallSkill(
        platformId,
        extSkillName.trim(),
        extMethod
      );
      setExtOutput(result.output);
      setExtSuccess(result.success);
      if (result.success) {
        showNotification(
          `Installed "${extSkillName.trim()}" successfully`,
          "success"
        );
      } else {
        showNotification("Installation failed", "error");
      }
    } catch (e) {
      const msg = (e as Error).message;
      setExtOutput(msg);
      setExtSuccess(false);
      showNotification(msg, "error");
    } finally {
      setExtLoading(false);
    }
  };

  return (
    <Fade in>
      <Card
        sx={{
          maxWidth: 640,
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              <CloudDownloadIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                External Install
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Install skills from {sourceMode === "vercel" ? "Vercel registry" : "Playbooks registry"}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={2.5}>
            <TextField
              label="Skill Name"
              placeholder="e.g. find-skills"
              value={extSkillName}
              onChange={(e) => setExtSkillName(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => e.key === "Enter" && handleExternalInstall()}
            />

            <FormControl>
              <FormLabel sx={{ fontSize: "0.85rem" }}>
                Installation Method
              </FormLabel>
              <RadioGroup
                value={extMethod}
                onChange={(e) =>
                  setExtMethod(e.target.value as "vercel" | "playbooks")
                }
                row
              >
                <FormControlLabel
                  value="vercel"
                  control={<Radio size="small" />}
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.8rem",
                      }}
                    >
                      npx skills add
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
                        fontSize: "0.8rem",
                      }}
                    >
                      npx playbooks add skill
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              startIcon={
                extLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <InstallDesktopIcon />
                )
              }
              onClick={handleExternalInstall}
              disabled={!extSkillName.trim() || extLoading}
              sx={{ alignSelf: "flex-start", borderRadius: 2 }}
            >
              Install
            </Button>

            {extOutput !== null && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(0, 0, 0, 0.6)"
                      : "rgba(0, 0, 0, 0.04)",
                  border: "1px solid",
                  borderColor: extSuccess ? "success.main" : "error.main",
                  overflow: "auto",
                  maxHeight: 320,
                }}
              >
                <Typography
                  component="pre"
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: extSuccess ? "success.main" : "error.main",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    m: 0,
                    display: "block",
                  }}
                >
                  {extOutput}
                </Typography>
              </Paper>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export default function InstallPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const platform = usePlatformStore((s) =>
    s.platforms.find((p) => p.id === platformId)
  );
  const { fetchPlatforms } = usePlatformStore();
  const { colorMode, toggleColorMode, showNotification } = useUiStore();

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
    if (!platformId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills(platformId, {
        search: search || undefined,
        category: selectedCategory ?? undefined,
      });
      setSkills(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [platformId, search, selectedCategory]);

  const fetchCats = useCallback(async () => {
    if (!platformId) return;
    try {
      const cats = await getCategories(platformId);
      setCategories(cats.filter((c) => c.item_type === "skill"));
    } catch {
      // non-critical
    }
  }, [platformId]);

  useEffect(() => {
    if (sourceMode === "local") {
      fetchSkills();
      fetchCats();
    }
  }, [sourceMode, fetchSkills, fetchCats]);

  // Clear selection when source changes
  useEffect(() => {
    setSelectedNames(new Set());
  }, [sourceMode]);

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
        outdated.map((s) => s.name)
      );
      showNotification(
        `Updated ${result.success_count} skills${result.failure_count > 0 ? `, ${result.failure_count} failed` : ""}`,
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
          <Tooltip title="Home">
            <IconButton
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Skills Library — {platform?.icon} {platform?.name ?? platformId}
          </Typography>
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

          {/* External sources: inline panel */}
          {sourceMode !== "local" && platformId && (
            <ExternalInstallPanel
              platformId={platformId}
              sourceMode={sourceMode}
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
          onClose={() => setInstallOpen(false)}
          onCompleted={(successCount, failureCount) => {
            showNotification(
              `Installed ${successCount} skills${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
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

      <NotificationSnackbar />
    </Box>
  );
}
