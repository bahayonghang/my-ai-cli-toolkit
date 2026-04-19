import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { KeyboardEvent, MouseEvent } from "react";

import type { NpxSkillsCatalogItemDto } from "@/types";
import { summarizeSkillDescription } from "@/utils/skillDescription";
import type { TranslationFn } from "./types";
import { formatCategoryLabel, installStatusColor } from "./utils";

export interface NpxDiscoverSkillCardProps {
  item: NpxSkillsCatalogItemDto;
  selected: boolean;
  disabled?: boolean;
  t: TranslationFn;
  onToggle: () => void;
  onOpenRepo: () => void;
  onCopyInstallCommand: (command: string) => void;
}

export default function NpxDiscoverSkillCard({
  item,
  selected,
  disabled = false,
  t,
  onToggle,
  onOpenRepo,
  onCopyInstallCommand,
}: NpxDiscoverSkillCardProps) {
  const installCommand = item.skill_flag
    ? `npx skills add ${item.package_ref} --skill ${item.skill_flag}`
    : `npx skills add ${item.package_ref}`;

  const handleToggleFromKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  const stopPropagation =
    (callback: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      callback();
    };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3.5,
        borderColor: selected
          ? "var(--mcs-workbench-outline-strong)"
          : "var(--mcs-panel-stroke)",
        backgroundColor: selected
          ? "var(--mcs-panel-fill-strong)"
          : "var(--mcs-panel-fill)",
        boxShadow: selected ? "var(--mcs-shadow-sm)" : "none",
        opacity: disabled ? 0.58 : 1,
        transition:
          "border-color var(--mcs-duration) var(--mcs-ease), background-color var(--mcs-duration) var(--mcs-ease), box-shadow var(--mcs-duration) var(--mcs-ease), transform var(--mcs-duration) var(--mcs-ease)",
      }}
    >
      <Box
        role="checkbox"
        aria-checked={selected}
        aria-disabled={disabled}
        aria-label={t("common.selectItem", { name: item.name })}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            onToggle();
          }
        }}
        onKeyDown={handleToggleFromKey}
        sx={{
          cursor: disabled ? "not-allowed" : "pointer",
          px: { xs: 1.5, md: 2 },
          py: { xs: 1.5, md: 1.8 },
          borderRadius: "inherit",
          outline: "none",
          "&:hover": disabled
            ? undefined
            : {
                transform: "translateY(-1px)",
              },
          "&:focus-visible": {
            boxShadow: "0 0 0 3px var(--mcs-accent-soft)",
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, md: 2 },
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1.05fr) minmax(0, 0.95fr) auto",
            },
            alignItems: "start",
          }}
        >
          <Stack spacing={1.1} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.1} justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, letterSpacing: "-0.03em", overflowWrap: "anywhere" }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.35, overflowWrap: "anywhere" }}
                >
                  {item.package_ref}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                {selected ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--mcs-panel-accent)", fontWeight: 700 }}
                  >
                    {t("common.selected")}
                  </Typography>
                ) : null}
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: selected
                      ? "var(--mcs-panel-accent)"
                      : "var(--mcs-panel-stroke-soft)",
                    backgroundColor: selected
                      ? "var(--mcs-panel-accent-soft)"
                      : "transparent",
                    color: selected ? "var(--mcs-panel-accent)" : "text.secondary",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {selected ? (
                    <TaskAltIcon fontSize="small" />
                  ) : (
                    <RadioButtonUncheckedIcon fontSize="small" />
                  )}
                </Box>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                color={installStatusColor(item.installed_state)}
                variant="outlined"
                label={
                  item.installed_state === "installed"
                    ? t("status.installed")
                    : item.installed_state === "unknown"
                    ? t("npxSkills.packageState.unknown")
                    : t("status.notInstalled")
                }
              />
              <Chip
                size="small"
                variant="outlined"
                label={formatCategoryLabel(item.category_slug, item.category_label)}
              />
              <Chip size="small" variant="outlined" label={item.install_provider} />
              {item.project_only ? (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={t("npxSkills.projectOnly")}
                />
              ) : null}
            </Stack>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "4.8em",
              }}
            >
              {summarizeSkillDescription(item.description, "list") ||
                t("npxSkills.noDescription")}
            </Typography>
            <Box
              sx={{
                borderRadius: 2.5,
                border: "1px solid var(--mcs-panel-stroke-soft)",
                backgroundColor: "var(--mcs-panel-fill-emphasis)",
                px: 1.2,
                py: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: item.project_only && disabled ? "warning.main" : "text.secondary",
                  overflowWrap: "anywhere",
                }}
              >
                {item.project_only && disabled
                  ? t("npxSkills.projectOnly")
                  : item.usage || installCommand}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: { xs: 0, lg: 210 } }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TravelExploreIcon />}
              onClick={stopPropagation(onOpenRepo)}
            >
              {t("npxSkills.openRepoInstall")}
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<ContentCopyIcon />}
              onClick={stopPropagation(() => onCopyInstallCommand(installCommand))}
            >
              {t("npxSkills.copyInstallCommand")}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
