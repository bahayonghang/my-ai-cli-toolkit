import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useI18n } from "@/i18n";
import type { SkillCatalogDto } from "@/types";
import type { SkillSelection } from "./types";
import { getAggregatedStatus } from "@/utils/statusAggregation";
import { InstallStatusChip } from "./InstallStatusChip";

interface SkillCatalogStageProps {
  skills: SkillCatalogDto[];
  totalCount: number;
  selectedSkills: SkillSelection;
  categories: string[];
  search: string;
  selectedCategory: string | null;
  defaultOnly: boolean;
  disabled?: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string | null) => void;
  onDefaultOnlyChange: (value: boolean) => void;
  onToggleSkill: (name: string) => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
}

export function SkillCatalogStage({
  skills,
  totalCount,
  selectedSkills,
  categories,
  search,
  selectedCategory,
  defaultOnly,
  disabled = false,
  onSearchChange,
  onCategoryChange,
  onDefaultOnlyChange,
  onToggleSkill,
  onSelectAllFiltered,
  onClearSelection,
}: SkillCatalogStageProps) {
  const { t } = useI18n();
  const groupedSkills = useMemo(
    () => groupSkillsByCategory(skills, t("installHub.uncategorizedCategory")),
    [skills, t],
  );
  const activeGroupLabel =
    groupedSkills.find(([, groupSkills]) =>
      groupSkills.some((skill) => selectedSkills.has(skill.name)),
    )?.[0] ?? groupedSkills[0]?.[0] ?? null;

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", xl: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", xl: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={t("installHub.filteredTotal", {
              filtered: skills.length,
              total: totalCount,
            })}
            variant="outlined"
          />
          <Chip
            label={t("common.selectedCount", { count: selectedSkills.size })}
            color="primary"
            variant="outlined"
          />
          {defaultOnly ? (
            <Chip label={t("installHub.onlyDefaultSkills")} color="info" variant="outlined" />
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            onClick={onSelectAllFiltered}
            disabled={disabled || skills.length === 0}
          >
            {t("installHub.selectAllFiltered")}
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={onClearSelection}
            disabled={disabled || selectedSkills.size === 0}
          >
            {t("installHub.clearSelection")}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 1.25,
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.4fr) minmax(220px, 0.9fr)",
            xl: "minmax(0, 1.8fr) minmax(240px, 0.9fr) auto",
          },
          alignItems: "center",
        }}
      >
        <TextField
          label={t("installHub.searchSkills")}
          size="small"
          value={search}
          disabled={disabled}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <FormControl size="small" disabled={disabled}>
          <InputLabel id="install-hub-stage-category-label">{t("installHub.category")}</InputLabel>
          <Select
            label={t("installHub.category")}
            labelId="install-hub-stage-category-label"
            value={selectedCategory ?? ""}
            onChange={(event) => onCategoryChange(event.target.value || null)}
          >
            <MenuItem value="">{t("installHub.allCategories")}</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={defaultOnly}
              disabled={disabled}
              onChange={(_, checked) => onDefaultOnlyChange(checked)}
            />
          }
          label={t("installHub.onlyDefaultSkills")}
          sx={{ ml: { xs: 0.5, xl: 0 } }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", lg: "220px minmax(0, 1fr)" },
          alignItems: "start",
        }}
      >
        <CategoryQuickNav
          activeLabel={activeGroupLabel}
          categories={groupedSkills.map(([category, categorySkills]) => ({
            label: category,
            count: categorySkills.length,
            targetId: toCategoryAnchor(category),
          }))}
          disabled={disabled}
          onJump={(category) => {
            const target = globalThis.document?.getElementById(toCategoryAnchor(category));
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />

        <Box
          sx={{
            borderRadius: 3,
            border: "1px solid var(--mcs-dashboard-outline)",
            background:
              "linear-gradient(180deg, rgba(16, 24, 29, 0.95) 0%, rgba(12, 18, 22, 0.94) 100%)",
            overflow: "hidden",
          }}
        >
          {skills.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">{t("installHub.noSkillsFound")}</Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {groupedSkills.map(([category, categorySkills]) => (
                <Box key={category} id={toCategoryAnchor(category)}>
                  <Box
                    sx={{
                      px: 2.25,
                      py: 1.15,
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      scrollMarginTop: 112,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                        {category}
                      </Typography>
                      <Chip label={categorySkills.length} size="small" variant="outlined" />
                    </Stack>
                  </Box>
                  <List dense disablePadding>
                    {categorySkills.map((skill) => (
                      <SkillRow
                        key={skill.name}
                        skill={skill}
                        selected={selectedSkills.has(skill.name)}
                        disabled={disabled}
                        onToggle={() => onToggleSkill(skill.name)}
                      />
                    ))}
                  </List>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

function CategoryQuickNav({
  categories,
  activeLabel,
  disabled,
  onJump,
}: {
  categories: Array<{ label: string; count: number; targetId: string }>;
  activeLabel: string | null;
  disabled: boolean;
  onJump: (category: string) => void;
}) {
  const { t } = useI18n();

  if (categories.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: { xs: "static", lg: "sticky" },
        top: { lg: 108 },
        borderRadius: 3,
        border: "1px solid var(--mcs-dashboard-outline)",
        bgcolor: "rgba(255, 255, 255, 0.03)",
        p: 1.25,
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ px: 0.75, pt: 0.5, pb: 0.25 }}>
          <Typography variant="overline" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("installHub.categoryRailTitle")}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--mcs-dashboard-muted)" }}>
            {t("installHub.categoryRailHint")}
          </Typography>
        </Box>

        <Stack spacing={0.5}>
          {categories.map((category) => {
            const active = category.label === activeLabel;

            return (
              <ButtonBase
                key={category.label}
                disabled={disabled}
                onClick={() => onJump(category.label)}
                sx={{
                  width: "100%",
                  borderRadius: 2.5,
                  px: 1,
                  py: 0.9,
                  justifyContent: "space-between",
                  textAlign: "left",
                  border: "1px solid",
                  borderColor: active
                    ? "var(--mcs-dashboard-outline-strong)"
                    : "rgba(255, 255, 255, 0.06)",
                  bgcolor: active
                    ? "var(--mcs-dashboard-accent-soft)"
                    : "rgba(255, 255, 255, 0.02)",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={active ? 700 : 600}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {category.label}
                </Typography>
                <Chip label={category.count} size="small" variant="outlined" />
              </ButtonBase>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}

function SkillRow({
  skill,
  selected,
  disabled,
  onToggle,
}: {
  skill: SkillCatalogDto;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  const statusInfo = getAggregatedStatus(skill.platform_status, t);
  const installedOnCount = Object.values(skill.platform_status ?? {}).filter(
    (status) => status === "installed",
  ).length;

  return (
    <ListItem disablePadding divider sx={{ borderColor: "rgba(255, 255, 255, 0.04)" }}>
      <ListItemButton
        selected={selected}
        disabled={disabled}
        onClick={onToggle}
        sx={{
          alignItems: "flex-start",
          px: { xs: 1.25, md: 1.75 },
          py: 1.35,
          "&.Mui-selected": {
            backgroundColor: "rgba(143, 197, 187, 0.12)",
            boxShadow: "inset 0 0 0 1px rgba(143, 197, 187, 0.18)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(143, 197, 187, 0.16)",
          },
        }}
      >
        <Checkbox edge="start" checked={selected} disableRipple tabIndex={-1} />
        <ListItemText
          primary={
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="body1" fontWeight={700}>
                  {skill.name}
                </Typography>
                {skill.is_default ? (
                  <Chip
                    label={t("installHub.defaultTag")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ) : null}
                {skill.category ? <Chip label={skill.category} size="small" variant="outlined" /> : null}
                <InstallStatusChip status={statusInfo.status} tooltip={statusInfo.tooltip} t={t} />
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: "var(--mcs-dashboard-muted)",
                  maxWidth: 920,
                }}
              >
                {skill.description ?? t("installHub.noDescription")}
              </Typography>

              {installedOnCount > 0 ? (
                <Typography variant="caption" sx={{ color: "var(--mcs-dashboard-muted)" }}>
                  {t("installHub.installedOnCount", { count: installedOnCount })}
                </Typography>
              ) : null}
            </Stack>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

function groupSkillsByCategory(skills: SkillCatalogDto[], uncategorizedLabel: string) {
  const groups = new Map<string, SkillCatalogDto[]>();
  for (const skill of skills) {
    const category = skill.category ?? uncategorizedLabel;
    const group = groups.get(category);
    if (group) {
      group.push(skill);
    } else {
      groups.set(category, [skill]);
    }
  }

  return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right));
}

function toCategoryAnchor(category: string) {
  return `install-hub-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
