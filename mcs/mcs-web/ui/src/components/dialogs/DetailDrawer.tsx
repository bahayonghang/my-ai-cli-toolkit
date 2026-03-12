import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ReactMarkdown from "react-markdown";
import type { ItemDetailDto } from "@/types";
import { getSkillDetail } from "@/api/client";
import { StatusChip } from "@/components/common/StatusChip";
import { useI18n } from "@/i18n";

interface Props {
  open: boolean;
  platformId: string;
  skillName: string | null;
  onClose: () => void;
  onShowDiff: (name: string) => void;
  onReinstall?: (name: string) => void;
}

export function DetailDrawer({ open, platformId, skillName, onClose, onShowDiff, onReinstall }: Props) {
  const { t } = useI18n();
  const [detail, setDetail] = useState<ItemDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !skillName) return;
    setLoading(true);
    getSkillDetail(platformId, skillName)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [open, platformId, skillName]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 480, md: 560 } } }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            {skillName ?? t("dialogs.detailFallbackTitle")}
          </Typography>
          <IconButton aria-label={t("common.close")} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : detail ? (
          <>
            {/* Metadata */}
            <Stack spacing={1} mb={2}>
              <Box display="flex" gap={1} alignItems="center">
                <StatusChip status={detail.status} />
                {detail.category && (
                  <Chip label={detail.category} size="small" variant="outlined" />
                )}
              </Box>
              {detail.description && (
                <Typography variant="body2" color="text.secondary">
                  {detail.description}
                </Typography>
              )}
              {detail.tags.length > 0 && (
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {detail.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              )}
            </Stack>

            {/* Actions */}
            <Box display="flex" gap={1} mb={2}>
              {(detail.status === "installed" || detail.status === "outdated") && (
                <Button
                  variant="outlined"
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => skillName && onShowDiff(skillName)}
                >
                  {t("dialogs.viewDiff")}
                </Button>
              )}
              {(detail.status === "installed" || detail.status === "outdated") && onReinstall && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => skillName && onReinstall(skillName)}
                >
                  {t("common.reinstall")}
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* SKILL.md content */}
            {detail.content ? (
              <Box
                sx={{
                  "& h1": { fontSize: "1.5rem", mt: 2, mb: 1 },
                  "& h2": { fontSize: "1.25rem", mt: 2, mb: 1 },
                  "& h3": { fontSize: "1.1rem", mt: 1.5, mb: 0.5 },
                  "& p": { mb: 1, lineHeight: 1.7 },
                  "& code": {
                    bgcolor: "action.hover",
                    px: 0.5,
                    borderRadius: 0.5,
                    fontSize: "0.875em",
                    fontFamily: "monospace",
                  },
                  "& pre": {
                    bgcolor: "action.hover",
                    p: 2,
                    borderRadius: 1,
                    overflow: "auto",
                    fontSize: "0.85rem",
                  },
                  "& ul, & ol": { pl: 3 },
                }}
              >
                <ReactMarkdown>{detail.content}</ReactMarkdown>
              </Box>
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                {t("dialogs.noSkillContent")}
              </Typography>
            )}
          </>
        ) : (
          <Typography color="text.secondary">{t("dialogs.failedLoadDetail")}</Typography>
        )}
      </Box>
    </Drawer>
  );
}
