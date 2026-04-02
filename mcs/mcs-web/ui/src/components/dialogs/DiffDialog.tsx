import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { DiffDto, InstallTarget } from "@/types";
import { getAgentDiff, getCommandDiff, getSkillDiff } from "@/api/client";
import { useI18n } from "@/i18n";

interface Props {
  open: boolean;
  platformId: string;
  itemName: string | null;
  itemType: "skill" | "command" | "agent";
  installTarget?: InstallTarget;
  onClose: () => void;
}

export function DiffDialog({
  open,
  platformId,
  itemName,
  itemType,
  installTarget,
  onClose,
}: Props) {
  const { t } = useI18n();
  const [diff, setDiff] = useState<DiffDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemName) return;
    setLoading(true);
    const fetcher =
      itemType === "skill"
        ? getSkillDiff
        : itemType === "command"
          ? getCommandDiff
          : getAgentDiff;
    fetcher(platformId, itemName, installTarget)
      .then(setDiff)
      .catch(() => setDiff(null))
      .finally(() => setLoading(false));
  }, [open, platformId, itemName, itemType, installTarget]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth aria-labelledby="diff-dialog-title">
      <DialogTitle id="diff-dialog-title" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span">
          {t("dialogs.diffTitle", { name: itemName ?? "" })}
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
        ) : diff ? (
          diff.has_diff ? (
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
              {diff.diff_text.split("\n").map((line, i) => {
                let color = "text.primary";
                let bg = "transparent";
                if (line.startsWith("+")) {
                  color = "success.main";
                  bg = "var(--mcs-diff-add-bg)";
                } else if (line.startsWith("-")) {
                  color = "error.main";
                  bg = "var(--mcs-diff-remove-bg)";
                } else if (line.startsWith("@@") || line.startsWith("#")) {
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
              {t("dialogs.noDiff")}
            </Typography>
          )
        ) : (
          <Typography color="error" py={4} textAlign="center">
            {t("dialogs.failedLoadDiff")}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
