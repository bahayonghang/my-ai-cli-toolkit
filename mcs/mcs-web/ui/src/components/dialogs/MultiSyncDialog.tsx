import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Button,
  Checkbox,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { PlatformDisplay, ItemType } from "@/types";
import { getPlatforms, multiSync } from "@/api/client";
import { useI18n } from "@/i18n";
import { extractInvalidPlatforms } from "@/utils/errorDetails";

interface Props {
  open: boolean;
  itemNames: string[];
  itemType: ItemType;
  currentPlatformId: string;
  onClose: () => void;
  onSynced: (message: string, severity: "success" | "warning" | "error") => void;
}

export function MultiSyncDialog({
  open,
  itemNames,
  itemType,
  currentPlatformId,
  onClose,
  onSynced,
}: Props) {
  const { t } = useI18n();
  const [platforms, setPlatforms] = useState<PlatformDisplay[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setLoadError(null);
    getPlatforms()
      .then((ps) => {
        setPlatforms(ps);
        // Pre-select all except current
        setSelected(new Set(ps.filter((p) => p.id !== currentPlatformId).map((p) => p.id)));
      })
      .catch((error) => setLoadError((error as Error).message))
      .finally(() => setLoading(false));
  }, [open, currentPlatformId]);

  const togglePlatform = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await multiSync({
        platform_names: Array.from(selected),
        items: itemNames,
        item_type: itemType,
      });
      const reusedCount = result.results.filter((item) =>
        item.message.includes("Reused shared-path")
      ).length;
      const reusedSuffix =
        reusedCount > 0 ? t("dialogs.syncReusedSuffix", { count: reusedCount }) : "";
      onSynced(
        t("dialogs.syncSummary", {
          platforms: selected.size,
          success: result.success_count,
          failed: result.failure_count,
          reusedSuffix,
        }),
        result.failure_count > 0 ? "warning" : "success"
      );
      onClose();
    } catch (e) {
      const error = e as Error & { details?: unknown };
      const invalidPlatforms = extractInvalidPlatforms(error.details);
      if (invalidPlatforms.length > 0) {
        onSynced(
          t("dialogs.syncInvalidPlatforms", {
            platforms: invalidPlatforms.join(", "),
          }),
          "error"
        );
        return;
      }
      onSynced(error.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span">
          {t("dialogs.syncPlatformsTitle")}
        </Typography>
        <IconButton aria-label={t("common.close")} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t("dialogs.syncPlatformsDescription", {
            count: itemNames.length,
            itemType: itemType === "skill" ? t("common.skills") : t("common.commands"),
          })}
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Box>
            <Typography color="error" variant="body2" mb={2}>
              {loadError}
            </Typography>
            <Button variant="outlined" onClick={() => {
              setLoading(true);
              setLoadError(null);
              getPlatforms()
                .then((ps) => {
                  setPlatforms(ps);
                  setSelected(new Set(ps.filter((p) => p.id !== currentPlatformId).map((p) => p.id)));
                })
                .catch((error) => setLoadError((error as Error).message))
                .finally(() => setLoading(false));
            }}>
              {t("dialogs.retry")}
            </Button>
          </Box>
        ) : (
          <List dense>
            {platforms.map((p) => (
              <ListItemButton
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                disabled={p.id === currentPlatformId}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    checked={selected.has(p.id)}
                    disabled={p.id === currentPlatformId}
                    edge="start"
                    inputProps={{
                      "aria-label": t("common.selectItem", { name: `${p.name}` }),
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${p.icon} ${p.name}`}
                  secondary={
                    p.id === currentPlatformId
                      ? t("dialogs.syncCurrentTarget", { path: p.skills_path })
                      : p.skills_path
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={syncing || selected.size === 0 || Boolean(loadError)}
          startIcon={syncing ? <CircularProgress size={16} /> : undefined}
        >
          {t("dialogs.syncAction", { count: selected.size })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
