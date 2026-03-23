import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import type { NpxInstalledSkillInstanceDto } from "@/types";
import type { TranslationFn } from "./types";

export interface NpxInstalledSkillDrawerProps {
  t: TranslationFn;
  item: NpxInstalledSkillInstanceDto | null;
  open: boolean;
  onClose: () => void;
  onRemove: (itemId: string) => void;
  onCopySource: (value: string) => void;
}

function updateChipColor(kind: NpxInstalledSkillInstanceDto["update"]["kind"]) {
  switch (kind) {
    case "update_available":
      return "warning" as const;
    case "up_to_date":
      return "success" as const;
    case "unsupported":
      return "default" as const;
    default:
      return "info" as const;
  }
}

function trackingChipColor(kind: NpxInstalledSkillInstanceDto["tracking"]["kind"]) {
  return kind === "tracked" ? ("success" as const) : ("default" as const);
}

export default function NpxInstalledSkillDrawer({
  t,
  item,
  open,
  onClose,
  onRemove,
  onCopySource,
}: NpxInstalledSkillDrawerProps) {
  const lastChecked =
    item?.update.last_checked_at_ms != null
      ? new Date(item.update.last_checked_at_ms).toLocaleString()
      : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 420 }, p: 2.5 }}>
        {item ? (
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 3,
                border: "1px solid var(--mcs-workbench-outline)",
                background:
                  "linear-gradient(180deg, var(--mcs-summary-tile-fill-strong) 0%, var(--mcs-panel-fill) 100%)",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                {t("npxSkills.installedDetail")}
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.75, letterSpacing: "-0.03em" }}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
                {item.description ?? t("npxSkills.noDescription")}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={item.category_label} variant="outlined" />
              <Chip
                size="small"
                label={t(
                  item.tracking.kind === "tracked"
                    ? "npxSkills.filterTracked"
                    : "npxSkills.filterUntracked"
                )}
                color={trackingChipColor(item.tracking.kind)}
                variant="outlined"
              />
              <Chip
                size="small"
                label={t(`npxSkills.updateState.${item.update.kind}`)}
                color={updateChipColor(item.update.kind)}
                variant="outlined"
              />
            </Stack>

            <Divider />

            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                background:
                  "linear-gradient(180deg, var(--mcs-workbench-surface-muted) 0%, var(--mcs-summary-tile-fill) 100%)",
                border: "1px solid var(--mcs-workbench-outline)",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                {t("npxSkills.installedUpdate")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.65 }}>
                {item.update.reason || t(`npxSkills.updateState.${item.update.kind}`)}
              </Typography>
              {lastChecked ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.9 }}>
                  {t("npxSkills.lastCheckedAt", { value: lastChecked })}
                </Typography>
              ) : null}
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("npxSkills.installedSource")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                {item.source.display}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("npxSkills.installedAgents")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {item.agents.length > 0 ? item.agents.join(", ") : t("npxSkills.noAgents")}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("npxSkills.installedScope")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {item.scope === "project"
                  ? t("installed.installTargetProject")
                  : t("installed.installTargetGlobal")}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("npxSkills.installedCatalogMatch")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {item.catalog_match
                  ? `${item.catalog_match.name} · ${item.catalog_match.category_label}`
                  : t("npxSkills.installedCatalogMatchNone")}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("npxSkills.installedTracking")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {item.tracking.reason ||
                  t(
                    item.tracking.kind === "tracked"
                      ? "npxSkills.filterTracked"
                      : "npxSkills.filterUntracked"
                  )}
              </Typography>
              {item.tracking.installed_at ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                  {t("npxSkills.installedAt", { value: item.tracking.installed_at })}
                </Typography>
              ) : null}
              {item.tracking.updated_at ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35 }}>
                  {t("npxSkills.updatedAt", { value: item.tracking.updated_at })}
                </Typography>
              ) : null}
            </Box>

            <Stack direction="row" spacing={1.25}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => onCopySource(item.source.ref)}
              >
                {t("npxSkills.copySourceRef")}
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineIcon />}
                disabled={!item.actions.removable}
                onClick={() => onRemove(item.id)}
              >
                {t("common.uninstall")}
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
}
