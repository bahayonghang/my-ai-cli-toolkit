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
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getGuidanceDiff, updateGuidance } from "@/api/client";
import { useI18n } from "@/i18n";
import type { PromptDiffDto } from "@/types";

interface Props {
  open: boolean;
  platformId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function PromptDialog({ open, platformId, onClose, onUpdated }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<PromptDiffDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getGuidanceDiff(platformId)
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [open, platformId]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const result = await updateGuidance(platformId);
      if (result.success) {
        onUpdated();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span">
          {t("dialogs.guidanceDiffTitle")}
        </Typography>
        <IconButton aria-label={t("common.close")} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data ? (
          !data.supports_prompt ? (
            <Typography color="text.secondary" py={4} textAlign="center">
              {t("dialogs.guidanceUnsupported")}
            </Typography>
          ) : data.has_diff ? (
            <Box
              component="pre"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                overflow: "auto",
                p: 2,
                m: 0,
                bgcolor: "var(--mcs-surface-muted)",
                borderRadius: 1,
              }}
            >
              {data.diff_text.split("\n").map((line, i) => {
                let color = "text.primary";
                let bg = "transparent";
                if (line.startsWith("+")) {
                  color = "success.main";
                  bg = "var(--mcs-diff-add-bg)";
                } else if (line.startsWith("-")) {
                  color = "error.main";
                  bg = "var(--mcs-diff-remove-bg)";
                } else if (line.startsWith("@@")) {
                  color = "info.main";
                }
                return (
                  <Box
                    key={i}
                    component="span"
                    sx={{ display: "block", color, bgcolor: bg, px: 1, overflowWrap: "anywhere" }}
                  >
                    {line || "\n"}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography color="text.secondary" py={4} textAlign="center">
              {t("dialogs.guidanceNoChanges")}
            </Typography>
          )
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
        {data?.has_diff && (
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updating}
            startIcon={updating ? <CircularProgress size={16} /> : undefined}
          >
            {t("dialogs.guidanceUpdate")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
