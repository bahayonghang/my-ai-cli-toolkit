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
import { getPromptDiff, updatePrompt } from "@/api/client";
import type { PromptDiffDto } from "@/types";

interface Props {
  open: boolean;
  platformId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function PromptDialog({ open, platformId, onClose, onUpdated }: Props) {
  const [data, setData] = useState<PromptDiffDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getPromptDiff(platformId)
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [open, platformId]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const result = await updatePrompt(platformId);
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
          CLAUDE.md Prompt Diff
        </Typography>
        <IconButton onClick={onClose}>
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
              Prompt management is only supported for the Claude platform
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
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            >
              {data.diff_text.split("\n").map((line, i) => {
                let color = "text.primary";
                let bg = "transparent";
                if (line.startsWith("+")) {
                  color = "success.main";
                  bg = "rgba(76, 175, 80, 0.08)";
                } else if (line.startsWith("-")) {
                  color = "error.main";
                  bg = "rgba(244, 67, 54, 0.08)";
                } else if (line.startsWith("@@")) {
                  color = "info.main";
                }
                return (
                  <Box key={i} component="span" sx={{ display: "block", color, bgcolor: bg, px: 1 }}>
                    {line || "\n"}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography color="text.secondary" py={4} textAlign="center">
              CLAUDE.md is up to date — no changes needed
            </Typography>
          )
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {data?.has_diff && (
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updating}
            startIcon={updating ? <CircularProgress size={16} /> : undefined}
          >
            Update CLAUDE.md
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
