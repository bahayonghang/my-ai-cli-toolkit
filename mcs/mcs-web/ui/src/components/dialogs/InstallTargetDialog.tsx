import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import type { InstallTarget, InstallTargetScope } from "@/types";
import { useI18n } from "@/i18n";
import { pickFolder } from "@/api/client";

interface Props {
  open: boolean;
  loading?: boolean;
  currentTarget: InstallTarget;
  recentProjects: string[];
  onClose: () => void;
  onApply: (target: InstallTarget) => Promise<boolean>;
}

export function InstallTargetDialog({
  open,
  loading = false,
  currentTarget,
  recentProjects,
  onClose,
  onApply,
}: Props) {
  const { t } = useI18n();
  const [scope, setScope] = useState<InstallTargetScope>("global");
  const [projectPath, setProjectPath] = useState("");
  const [pickingFolder, setPickingFolder] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setScope(currentTarget.scope);
    setProjectPath(currentTarget.project_path ?? "");
  }, [currentTarget.project_path, currentTarget.scope, open]);

  const handleApply = async () => {
    const nextTarget: InstallTarget =
      scope === "project"
        ? { scope, project_path: projectPath.trim() }
        : { scope: "global" };
    const ok = await onApply(nextTarget);
    if (ok) {
      onClose();
    }
  };

  const handlePickFolder = async () => {
    try {
      setPickingFolder(true);
      const res = await pickFolder();
      if (res.path) {
        setProjectPath(res.path);
      }
    } catch (e) {
      console.error("Failed to pick folder", e);
    } finally {
      setPickingFolder(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("dialogs.installTargetTitle")}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <ToggleButtonGroup
            value={scope}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setScope(value as InstallTargetScope);
              }
            }}
            size="small"
          >
            <ToggleButton value="global">{t("dialogs.installTargetGlobal")}</ToggleButton>
            <ToggleButton value="project">{t("dialogs.installTargetProject")}</ToggleButton>
          </ToggleButtonGroup>

          {scope === "project" && (
            <>
              <TextField
                label={t("dialogs.projectPathLabel")}
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder={t("dialogs.projectPathPlaceholder")}
                fullWidth
                size="small"
                disabled={loading || pickingFolder}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePickFolder} disabled={loading || pickingFolder} size="small" title="Choose local folder">
                        {pickingFolder ? <CircularProgress size={20} /> : <FolderOpenIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("dialogs.recentProjects")}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
                  {recentProjects.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      {t("dialogs.noRecentProjects")}
                    </Typography>
                  ) : (
                    recentProjects.map((path) => (
                      <Chip
                        key={path}
                        label={path}
                        variant="outlined"
                        size="small"
                        onClick={() => setProjectPath(path)}
                      />
                    ))
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={loading || (scope === "project" && !projectPath.trim())}
        >
          {t("common.apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
