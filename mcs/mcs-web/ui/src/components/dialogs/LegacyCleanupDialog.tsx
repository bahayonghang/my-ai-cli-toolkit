import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fade,
    FormControlLabel,
    LinearProgress,
    ListItemButton,
    Stack,
    Typography,
    Zoom,
    alpha,
    useTheme,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import { useI18n } from "@/i18n";
import type { LegacyDirDto } from "@/types";
import { cleanupLegacyDirs, getLegacyDirs } from "@/api/client";

interface Props {
    open: boolean;
    onClose: () => void;
}

interface CleanupProgress {
    total: number;
    processed: number;
    removed: number;
    failed: number;
    currentPath: string | null;
}

export function LegacyCleanupDialog({ open, onClose }: Props) {
    const theme = useTheme();
    const { t } = useI18n();
    const [items, setItems] = useState<LegacyDirDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [cleaning, setCleaning] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [progress, setProgress] = useState<CleanupProgress | null>(null);
    const [result, setResult] = useState<{
        removed: number;
        failed: number;
    } | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setResult(null);
        setProgress(null);
        setLoading(true);
        setLoadError(null);

        getLegacyDirs()
            .then((data) => {
                setItems(data);
                setSelected(new Set(data.map((d) => d.legacy_path)));
            })
            .catch((error) => {
                setItems([]);
                setSelected(new Set());
                setLoadError((error as Error).message);
            })
            .finally(() => setLoading(false));
    }, [open]);

    const toggleItem = (path: string) => {
        if (cleaning) {
            return;
        }

        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (cleaning) {
            return;
        }

        if (selected.size === items.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(items.map((d) => d.legacy_path)));
        }
    };

    const handleCleanup = async () => {
        const targets = Array.from(selected);
        if (targets.length === 0) {
            return;
        }

        setCleaning(true);
        setResult(null);
        setProgress({
            total: targets.length,
            processed: 0,
            removed: 0,
            failed: 0,
            currentPath: null,
        });

        const removedPaths: string[] = [];
        let failedCount = 0;

        for (const path of targets) {
            setProgress((prev) =>
                prev
                    ? {
                        ...prev,
                        currentPath: path,
                    }
                    : prev
            );

            try {
                const res = await cleanupLegacyDirs([path]);
                removedPaths.push(...res.removed);
                failedCount += res.failed.length;
            } catch (e) {
                failedCount += 1;
            } finally {
                setProgress((prev) =>
                    prev
                        ? {
                            ...prev,
                            processed: prev.processed + 1,
                            removed: removedPaths.length,
                            failed: failedCount,
                        }
                        : prev
                );
            }
        }

        const removedSet = new Set(removedPaths);
        setItems((prev) => prev.filter((d) => !removedSet.has(d.legacy_path)));
        setSelected(new Set(targets.filter((path) => !removedSet.has(path))));
        setResult({ removed: removedPaths.length, failed: failedCount });
        setProgress((prev) => (prev ? { ...prev, currentPath: null } : prev));
        setCleaning(false);
    };

    const progressPercent =
        progress && progress.total > 0
            ? Math.round((progress.processed / progress.total) * 100)
            : 0;

    return (
        <Dialog
            open={open}
            onClose={cleaning ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <FolderDeleteIcon color="warning" />
                {t("dialogs.legacyCleanupTitle")}
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : loadError ? (
                    <Stack spacing={2}>
                        <Alert severity="error">{loadError}</Alert>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setLoading(true);
                                setLoadError(null);
                                getLegacyDirs()
                                    .then((data) => {
                                        setItems(data);
                                        setSelected(new Set(data.map((d) => d.legacy_path)));
                                    })
                                    .catch((error) => setLoadError((error as Error).message))
                                    .finally(() => setLoading(false));
                            }}
                        >
                            {t("dialogs.retry")}
                        </Button>
                    </Stack>
                ) : items.length === 0 ? (
                        <Fade in timeout={220}>
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                            {t("dialogs.legacyCleanupEmpty")}
                        </Alert>
                    </Fade>
                ) : (
                    <Stack spacing={2}>
                        <Fade in timeout={220}>
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    {t("dialogs.legacyCleanupWarningTitle")}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t("dialogs.legacyCleanupWarningBody")}
                                </Typography>
                            </Alert>
                        </Fade>

                        <Collapse in={Boolean(progress)} timeout={260}>
                            {progress ? (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "warning.main",
                                        bgcolor: alpha(theme.palette.warning.main, 0.06),
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1}
                                    >
                                        <Typography variant="body2" fontWeight={700}>
                                            {t("dialogs.legacyCleanupProgress", {
                                                processed: progress.processed,
                                                total: progress.total,
                                            })}
                                        </Typography>
                                        <Chip
                                            label={`${progressPercent}%`}
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                        />
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progressPercent}
                                        sx={{
                                            height: 8,
                                            borderRadius: 999,
                                            bgcolor: "var(--mcs-warning-progress)",
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 999,
                                                background: "var(--mcs-warning-progress-strong)",
                                                transition: "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
                                            },
                                        }}
                                    />
                                    <Box display="flex" justifyContent="space-between" mt={1}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t("dialogs.legacyCleanupRemoved", { count: progress.removed })}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={progress.failed > 0 ? "error.main" : "text.secondary"}
                                        >
                                            {t("dialogs.legacyCleanupFailed", { count: progress.failed })}
                                        </Typography>
                                    </Box>
                                    {progress.currentPath && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 0.5,
                                                display: "block",
                                                fontFamily: '"JetBrains Mono", monospace',
                                                color: "text.secondary",
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {t("dialogs.legacyCleanupCurrent", { path: progress.currentPath })}
                                        </Typography>
                                    )}
                                </Box>
                            ) : null}
                        </Collapse>

                        <Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selected.size === items.length}
                                        indeterminate={
                                            selected.size > 0 && selected.size < items.length
                                        }
                                        onChange={toggleAll}
                                        size="small"
                                        disabled={cleaning}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={600}>
                                        {t("dialogs.legacyCleanupSelectAll", {
                                            selected: selected.size,
                                            total: items.length,
                                        })}
                                    </Typography>
                                }
                            />
                        </Box>

                        {items.map((item) => {
                            const isSelected = selected.has(item.legacy_path);
                            const isActive = progress?.currentPath === item.legacy_path;

                            return (
                                <ListItemButton
                                    key={item.legacy_path}
                                    component="div"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: isSelected ? "warning.main" : "divider",
                                        bgcolor: isSelected
                                            ? alpha(theme.palette.warning.main, 0.05)
                                            : "transparent",
                                        transition:
                                            "transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                                        transform: isActive ? "translateY(-1px) scale(1.01)" : "none",
                                        opacity:
                                            cleaning && !isActive ? 0.72 : 1,
                                        cursor: cleaning ? "not-allowed" : "pointer",
                                        boxShadow: isActive
                                            ? `0 0 0 1px ${alpha(theme.palette.warning.main, 0.35)}`
                                            : "none",
                                    }}
                                    onClick={() => toggleItem(item.legacy_path)}
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Checkbox
                                            checked={isSelected}
                                            sx={{ p: 0.5 }}
                                            disabled={cleaning}
                                            inputProps={{
                                                "aria-label": t("common.selectItem", { name: item.platform_id }),
                                            }}
                                        />
                                        <Box flex={1} minWidth={0}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {item.platform_id}
                                                </Typography>
                                                <Chip
                                                    label={t("dialogs.legacyTag")}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                    sx={{ height: 18, fontSize: "0.6rem" }}
                                                />
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontFamily: '"JetBrains Mono", monospace',
                                                    fontSize: "0.7rem",
                                                    display: "block",
                                                    mt: 0.5,
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {item.legacy_path}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="success.main"
                                                sx={{
                                                    fontFamily: '"JetBrains Mono", monospace',
                                                    fontSize: "0.65rem",
                                                    display: "block",
                                                }}
                                            >
                                                → {item.shared_path}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </ListItemButton>
                            );
                        })}

                        <Zoom in={Boolean(result)} timeout={260}>
                            <Box>
                                {result ? (
                                    <Alert
                                        severity={result.failed > 0 ? "warning" : "success"}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {t("dialogs.legacyCleanupResult", {
                                            removed: result.removed,
                                            failedSuffix:
                                                result.failed > 0
                                                    ? t("dialogs.legacyCleanupFailedSuffix", {
                                                        count: result.failed,
                                                    })
                                                    : "",
                                        })}
                                    </Alert>
                                ) : null}
                            </Box>
                        </Zoom>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={cleaning}>
                    {t("common.close")}
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    startIcon={
                        cleaning ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <DeleteSweepIcon />
                        )
                    }
                    onClick={handleCleanup}
                    disabled={cleaning || selected.size === 0 || items.length === 0}
                >
                    {cleaning && progress
                        ? t("dialogs.legacyCleanupRunning", {
                            processed: progress.processed,
                            total: progress.total,
                        })
                        : t("dialogs.legacyCleanupAction", { count: selected.size })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
