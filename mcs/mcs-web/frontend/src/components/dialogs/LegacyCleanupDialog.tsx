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
    Stack,
    Typography,
    Zoom,
    alpha,
    useTheme,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
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
    const [items, setItems] = useState<LegacyDirDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [cleaning, setCleaning] = useState(false);
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

        getLegacyDirs()
            .then((data) => {
                setItems(data);
                setSelected(new Set(data.map((d) => d.legacy_path)));
            })
            .catch(console.error)
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
                console.error("Cleanup failed for path", path, e);
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
                旧版技能目录清理
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : items.length === 0 ? (
                    <Fade in timeout={220}>
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                            未检测到旧版技能目录，所有目录均已迁移！
                        </Alert>
                    </Fade>
                ) : (
                    <Stack spacing={2}>
                        <Fade in timeout={220}>
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    以下旧版目录已迁移至共享位置，可以安全删除。
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    删除操作不可恢复，请确认这些目录中没有额外自定义内容。
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
                                            正在异步清理 ({progress.processed}/{progress.total})
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
                                            bgcolor: alpha(theme.palette.warning.main, 0.14),
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 999,
                                                background:
                                                    "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)",
                                                transition: "transform 280ms ease",
                                            },
                                        }}
                                    />
                                    <Box display="flex" justifyContent="space-between" mt={1}>
                                        <Typography variant="caption" color="text.secondary">
                                            已删除 {progress.removed} 项
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={progress.failed > 0 ? "error.main" : "text.secondary"}
                                        >
                                            失败 {progress.failed} 项
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
                                                wordBreak: "break-all",
                                            }}
                                        >
                                            当前：{progress.currentPath}
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
                                        全选 ({selected.size}/{items.length})
                                    </Typography>
                                }
                            />
                        </Box>

                        {items.map((item) => {
                            const isSelected = selected.has(item.legacy_path);
                            const isActive = progress?.currentPath === item.legacy_path;

                            return (
                                <Box
                                    key={item.legacy_path}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: isSelected ? "warning.main" : "divider",
                                        bgcolor: isSelected
                                            ? alpha(theme.palette.warning.main, 0.05)
                                            : "transparent",
                                        transition:
                                            "transform 220ms ease, opacity 220ms ease, background-color 220ms ease, border-color 220ms ease",
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
                                            size="small"
                                            sx={{ p: 0.5 }}
                                            disabled={cleaning}
                                        />
                                        <Box flex={1} minWidth={0}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {item.platform_id}
                                                </Typography>
                                                <Chip
                                                    label="legacy"
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
                                                    wordBreak: "break-all",
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
                                </Box>
                            );
                        })}

                        <Zoom in={Boolean(result)} timeout={260}>
                            <Box>
                                {result ? (
                                    <Alert
                                        severity={result.failed > 0 ? "warning" : "success"}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        已清理 {result.removed} 个目录
                                        {result.failed > 0 && `，${result.failed} 个失败`}
                                    </Alert>
                                ) : null}
                            </Box>
                        </Zoom>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={cleaning}>
                    关闭
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
                        ? `清理中... (${progress.processed}/${progress.total})`
                        : `清理选中目录 (${selected.size})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
