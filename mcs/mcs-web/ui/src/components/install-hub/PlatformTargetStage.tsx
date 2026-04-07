import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useI18n } from "@/i18n";
import type { ItemType, PlatformDisplay } from "@/types";
import type { PlatformSelection } from "./types";
import { PlatformIdentity } from "@/components/platform/PlatformVisuals";
import { getPlatformInstallPath } from "@/utils/installHubContent";
import { getSkillsLibrarySupportText } from "@/utils/platformLibrary";

interface PlatformTargetStageProps {
  platforms: PlatformDisplay[];
  itemType: ItemType;
  selectedPlatforms: PlatformSelection;
  disabled?: boolean;
  locked?: boolean;
  onTogglePlatform: (platformId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function PlatformTargetStage({
  platforms,
  itemType,
  selectedPlatforms,
  disabled = false,
  locked = false,
  onTogglePlatform,
  onSelectAll,
  onClearSelection,
}: PlatformTargetStageProps) {
  const { locale, t } = useI18n();
  const stageDisabled = disabled || locked;

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={t("installHub.availableCount", { count: platforms.length })}
            variant="outlined"
          />
          <Chip
            label={t("common.selectedCount", { count: selectedPlatforms.size })}
            color="primary"
            variant="outlined"
          />
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<SelectAllIcon />}
            onClick={onSelectAll}
            disabled={stageDisabled || platforms.length === 0}
          >
            {t("installHub.selectAll")}
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<LayersClearIcon />}
            onClick={onClearSelection}
            disabled={stageDisabled || selectedPlatforms.size === 0}
          >
            {t("installHub.clearSelection")}
          </Button>
        </Stack>
      </Stack>

      {locked ? (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 3,
            border: "1px dashed var(--mcs-workbench-outline)",
            bgcolor: "var(--mcs-workbench-surface-muted)",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("installHub.selectSkillToUnlockPlatforms")}
          </Typography>
        </Box>
      ) : null}

      {platforms.length === 0 ? (
        <Box
          sx={{
            px: 2,
            py: 3,
            borderRadius: 3,
            border: "1px solid var(--mcs-workbench-outline)",
          }}
        >
          <Typography color="text.secondary">
            {t("installHub.noPlatformsFound")}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {platforms.map((platform) => {
            const selected = selectedPlatforms.has(platform.id);
            const platformDomId = `install-hub-platform-${platform.id}`;
            const titleId = `${platformDomId}-title`;
            const pathId = `${platformDomId}-path`;
            const statusId = `${platformDomId}-status`;
            const supportId = `${platformDomId}-support`;
            const librarySupport = getSkillsLibrarySupportText({
              platform,
              platforms,
              locale,
              t,
            });

            return (
              <Grid key={platform.id} size={{ xs: 12, md: 6 }}>
                <ButtonBase
                  onClick={() => onTogglePlatform(platform.id)}
                  disabled={stageDisabled}
                  aria-pressed={selected}
                  aria-labelledby={titleId}
                  aria-describedby={`${statusId} ${pathId} ${supportId}`}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: selected
                      ? "var(--mcs-workbench-outline-strong)"
                      : "var(--mcs-workbench-outline)",
                    background: selected
                      ? "linear-gradient(180deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-panel-fill) 100%)"
                      : "linear-gradient(180deg, var(--mcs-workbench-surface-muted) 0%, var(--mcs-panel-fill) 100%)",
                    boxShadow: selected
                      ? "var(--mcs-panel-shadow)"
                      : "var(--mcs-glass-shadow)",
                    p: 2.25,
                    alignItems: "stretch",
                    justifyContent: "stretch",
                    opacity: stageDisabled ? 0.72 : 1,
                    transition:
                      "transform var(--mcs-duration) var(--mcs-ease), border-color var(--mcs-duration) var(--mcs-ease), background-color var(--mcs-duration) var(--mcs-ease), box-shadow var(--mcs-duration) var(--mcs-ease)",
                    "&:hover": {
                      transform: stageDisabled ? "none" : "translateY(-1px)",
                    },
                  }}
                >
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{ minWidth: 0 }}
                      >
                        <Box id={titleId}>
                          <PlatformIdentity
                            platformId={platform.id}
                            name={platform.name}
                            fallbackIcon={platform.icon}
                            subtitle={platform.id}
                            size={44}
                          />
                        </Box>
                      </Stack>
                      {selected ? (
                        <Chip
                          icon={<CheckCircleIcon fontSize="small" />}
                          label={t("installHub.platformSelected")}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label={t("installHub.platformReady")}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>

                    <Box>
                      <Typography
                        id={statusId}
                        variant="body2"
                        sx={{
                          color: "var(--mcs-workbench-muted)",
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {selected
                          ? t("installHub.platformSelected")
                          : t("installHub.platformReady")}
                      </Typography>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "var(--mcs-workbench-muted)",
                          display: "block",
                        }}
                      >
                        {t("installHub.platformPathLabel")}
                      </Typography>
                      <Typography
                        id={pathId}
                        variant="body2"
                        sx={{
                          color: "var(--mcs-workbench-muted)",
                          overflowWrap: "anywhere",
                          fontFamily: "var(--font-family-mono, inherit)",
                        }}
                      >
                        {getPlatformInstallPath(platform, itemType, t)}
                      </Typography>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "var(--mcs-workbench-muted)",
                          display: "block",
                          mt: 1.1,
                        }}
                      >
                        {t("installHub.platformLibraryLabel")}
                      </Typography>
                      <Typography
                        id={supportId}
                        variant="body2"
                        sx={{
                          color: "var(--mcs-workbench-muted)",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {librarySupport}
                      </Typography>
                    </Box>
                  </Stack>
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
