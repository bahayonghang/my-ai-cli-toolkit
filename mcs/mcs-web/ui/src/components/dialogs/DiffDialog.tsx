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
import type { DiffDto } from "@/types";
import { getSkillDiff, getCommandDiff } from "@/api/client";

interface Props {
  open: boolean;
  platformId: string;
  itemName: string | null;
  itemType: "skill" | "command";
  onClose: () => void;
}

export function DiffDialog({ open, platformId, itemName, itemType, onClose }: Props) {
  const [diff, setDiff] = useState<DiffDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemName) return;
    setLoading(true);
    const fetcher = itemType === "skill" ? getSkillDiff : getCommandDiff;
    fetcher(platformId, itemName)
      .then(setDiff)
      .catch(() => setDiff(null))
      .finally(() => setLoading(false));
  }, [open, platformId, itemName, itemType]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span">
          Diff: {itemName}
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
                bgcolor: "background.default",
                borderRadius: 1,
                "& .diff-add": { color: "success.main", bgcolor: "success.main", opacity: 0.1 },
                "& .diff-del": { color: "error.main", bgcolor: "error.main", opacity: 0.1 },
              }}
            >
              {diff.diff_text.split("\n").map((line, i) => {
                let color = "text.primary";
                let bg = "transparent";
                if (line.startsWith("+")) {
                  color = "success.main";
                  bg = "rgba(76, 175, 80, 0.08)";
                } else if (line.startsWith("-")) {
                  color = "error.main";
                  bg = "rgba(244, 67, 54, 0.08)";
                } else if (line.startsWith("@@") || line.startsWith("#")) {
                  color = "info.main";
                }
                return (
                  <Box
                    key={i}
                    component="span"
                    sx={{ display: "block", color, bgcolor: bg, px: 1 }}
                  >
                    {line || "\n"}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography color="text.secondary" py={4} textAlign="center">
              Files are identical — no differences found
            </Typography>
          )
        ) : (
          <Typography color="error" py={4} textAlign="center">
            Failed to load diff
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
