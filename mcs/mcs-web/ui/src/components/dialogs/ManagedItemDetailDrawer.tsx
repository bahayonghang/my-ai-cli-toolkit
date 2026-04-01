import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import EditIcon from "@mui/icons-material/Edit";
import type { InstallTarget, ItemDetailDto, ItemType } from "@/types";
import { getAgentDetail, getCommandDetail } from "@/api/client";
import { StatusChip } from "@/components/common/StatusChip";
import { useI18n } from "@/i18n";

interface Props {
  open: boolean;
  platformId: string;
  itemType: Extract<ItemType, "command" | "agent">;
  itemName: string | null;
  installTarget?: InstallTarget;
  onClose: () => void;
  onShowDiff: (name: string) => void;
  onEdit?: (name: string) => void;
}

export function ManagedItemDetailDrawer({
  open,
  platformId,
  itemType,
  itemName,
  installTarget,
  onClose,
  onShowDiff,
  onEdit,
}: Props) {
  const { t } = useI18n();
  const [detail, setDetail] = useState<ItemDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemName) return;
    setLoading(true);
    const fetcher = itemType === "command" ? getCommandDetail : getAgentDetail;
    fetcher(platformId, itemName, installTarget)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [open, itemName, platformId, itemType, installTarget]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 520, md: 620 } } }}
    >
      <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            {itemName ?? t("dialogs.detailFallbackTitle")}
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
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <StatusChip status={detail.status} />
                {detail.category ? (
                  <Chip label={detail.category} size="small" variant="outlined" />
                ) : null}
              </Stack>
              {detail.description ? (
                <Typography variant="body2" color="text.secondary">
                  {detail.description}
                </Typography>
              ) : null}
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {detail.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {(detail.status === "installed" || detail.status === "outdated") ? (
                <Button
                  variant="outlined"
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => itemName && onShowDiff(itemName)}
                >
                  {t("dialogs.viewDiff")}
                </Button>
              ) : null}
              {itemType === "agent" && onEdit ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => itemName && onEdit(itemName)}
                >
                  {t("manageContent.editAgent")}
                </Button>
              ) : null}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                Source
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                {detail.source_path}
              </Typography>
              <Typography variant="overline" color="text.secondary">
                Target
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                {detail.target_path}
              </Typography>
            </Stack>

            <Divider />

            {detail.content ? (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "var(--mcs-surface-muted)",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.82rem",
                  lineHeight: 1.7,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {detail.content}
              </Box>
            ) : (
              <Typography color="text.secondary">{t("dialogs.failedLoadDetail")}</Typography>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">{t("dialogs.failedLoadDetail")}</Typography>
        )}
      </Box>
    </Drawer>
  );
}
