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
  const [platforms, setPlatforms] = useState<PlatformDisplay[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getPlatforms()
      .then((ps) => {
        setPlatforms(ps);
        // Pre-select all except current
        setSelected(new Set(ps.filter((p) => p.id !== currentPlatformId).map((p) => p.id)));
      })
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
      onSynced(
        `Synced to ${selected.size} platforms: ${result.success_count} ok, ${result.failure_count} failed`,
        result.failure_count > 0 ? "warning" : "success"
      );
      onClose();
    } catch (e) {
      onSynced((e as Error).message, "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span">
          Sync to Platforms
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Install {itemNames.length} {itemType}(s) to selected platforms:
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
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
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${p.icon} ${p.name}`}
                  secondary={p.id === currentPlatformId ? "(current)" : p.base_dir}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={syncing || selected.size === 0}
          startIcon={syncing ? <CircularProgress size={16} /> : undefined}
        >
          Sync ({selected.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
