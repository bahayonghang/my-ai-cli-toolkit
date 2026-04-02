import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import type { InstallCatalogItemDto, ItemType } from "@/types";
import {
  sanitizeSkillDescription,
  summarizeSkillDescription,
} from "@/utils/skillDescription";
import type { SkillSelection } from "./types";
import { getAggregatedStatus } from "@/utils/statusAggregation";
import { InstallStatusChip } from "./InstallStatusChip";
import { getInstallHubItemTypeLabel } from "@/utils/installHubContent";

interface SkillCatalogStageProps {
  skills: InstallCatalogItemDto[];
  itemType: ItemType;
  availableItemTypes: ItemType[];
  totalCount: number;
  selectedSkills: SkillSelection;
  categories: string[];
  search: string;
  selectedCategory: string | null;
  defaultOnly: boolean;
  disabled?: boolean;
  onItemTypeChange: (itemType: ItemType) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string | null) => void;
  onDefaultOnlyChange: (value: boolean) => void;
  onToggleSkill: (name: string) => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
}

export function SkillCatalogStage({
  skills,
  itemType,
  availableItemTypes,
  totalCount,
  selectedSkills,
  categories,
  search,
  selectedCategory,
  defaultOnly,
  disabled = false,
  onItemTypeChange,
  onSearchChange,
  onCategoryChange,
  onDefaultOnlyChange,
  onToggleSkill,
  onSelectAllFiltered,
  onClearSelection,
}: SkillCatalogStageProps) {
  const { t } = useI18n();
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const itemTypeLabel = getInstallHubItemTypeLabel(itemType, t);
  const groupedSkills = useMemo(
    () => groupSkillsByCategory(skills, t("installHub.uncategorizedCategory")),
    [skills, t],
  );
  const selectedSkillNames = useMemo(
    () =>
      skills
        .filter((skill) => selectedSkills.has(skill.name))
        .map((skill) => skill.name),
    [selectedSkills, skills],
  );
  const activeGroupLabel =
    groupedSkills.find(([, groupSkills]) =>
      groupSkills.some((skill) => selectedSkills.has(skill.name)),
    )?.[0] ??
    groupedSkills[0]?.[0] ??
    null;

  const scrollCategoryIntoView = (category: string) => {
    const target = globalThis.document?.getElementById(
      toCategoryAnchor(category),
    );
    if (!target) {
      return;
    }
    const prefersReducedMotion =
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
      false;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

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
            <Chip
              label={t("installHub.onlyDefaultSkills")}
              color="info"
              variant="outlined"
            />
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

      {availableItemTypes.length > 1 ? (
        <Box
          sx={{
            borderRadius: 3,
            border: "1px solid var(--mcs-workbench-outline)",
            background: "var(--mcs-panel-fill)",
            boxShadow: "var(--mcs-shadow-sm)",
            p: { xs: 1.25, md: 1.5 },
          }}
        >
          <Stack spacing={1.1}>
            <Typography
              variant="overline"
              sx={{ color: "var(--mcs-workbench-muted)" }}
            >
              {t("installHub.itemTypeLabel")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={itemType}
              size="small"
              onChange={(_event, nextValue: ItemType | null) => {
                if (nextValue) {
                  onItemTypeChange(nextValue);
                }
              }}
              sx={{ alignSelf: "flex-start", flexWrap: "wrap" }}
            >
              {(["skill", "command", "agent"] as ItemType[]).map((candidate) => (
                <ToggleButton
                  key={candidate}
                  value={candidate}
                  disabled={!availableItemTypes.includes(candidate) || disabled}
                >
                  {getInstallHubItemTypeLabel(candidate, t)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Box>
      ) : null}

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gap: 1.25,
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.4fr) minmax(220px, 0.9fr)",
            xl: "minmax(0, 1.8fr) minmax(240px, 0.9fr) auto",
          },
          alignItems: "center",
          borderRadius: 3,
          border: "1px solid var(--mcs-workbench-outline)",
          background: "var(--mcs-panel-fill)",
          boxShadow: "var(--mcs-shadow-sm)",
          p: { xs: 1.25, md: 1.5 },
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
          <InputLabel id="install-hub-stage-category-label">
            {t("installHub.category")}
          </InputLabel>
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
        {itemType === "skill" ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={defaultOnly}
                disabled={disabled}
                onChange={(_event, checked) => onDefaultOnlyChange(checked)}
              />
            }
            label={t("installHub.onlyDefaultSkills")}
            sx={{ ml: { xs: 0.5, xl: 0 } }}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          borderRadius: 3.5,
          border: "1px solid var(--mcs-workbench-outline)",
          background: "var(--mcs-workbench-surface-strong)",
          boxShadow: "var(--mcs-shadow-sm)",
          px: { xs: 1.5, md: 2 },
          py: 1.5,
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: "var(--mcs-workbench-muted)" }}
            >
              {t("installHub.selectedBundleTitle")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "var(--mcs-workbench-muted)" }}
            >
              {selectedSkillNames.length > 0
                ? t("installHub.selectedBundleHint")
                : t("installHub.selectedBundleEmpty")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {selectedSkillNames.length === 0 ? (
              <Chip
                label={t("installHub.summaryEmptySkills")}
                size="small"
                variant="outlined"
              />
            ) : (
              <>
                {selectedSkillNames.slice(0, 6).map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {selectedSkillNames.length > 6 ? (
                  <Chip
                    label={`+${selectedSkillNames.length - 6}`}
                    size="small"
                    variant="outlined"
                  />
                ) : null}
              </>
            )}
          </Stack>
        </Stack>
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
          onJump={scrollCategoryIntoView}
        />

        <Box
          sx={{
            borderRadius: 3.5,
            border: "1px solid var(--mcs-workbench-outline)",
            background: "var(--mcs-panel-fill)",
            boxShadow: "var(--mcs-shadow-sm)",
            overflow: "hidden",
          }}
        >
          {skills.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">
                {t("installHub.noSkillsFound")}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  px: 2.25,
                  py: 1,
                  borderBottom: "1px solid var(--mcs-workbench-outline)",
                  bgcolor: "var(--mcs-workbench-surface-subtle)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "var(--mcs-workbench-muted)" }}
                >
                  {itemTypeLabel} · {t("installHub.catalogScrollHint")}
                </Typography>
              </Box>
              <Box
                sx={{
                  maxHeight: {
                    xs: "none",
                    lg: "min(980px, calc(100dvh - 280px))",
                  },
                  overflowY: { xs: "visible", lg: "auto" },
                }}
              >
                <Stack spacing={0}>
                  {groupedSkills.map(([category, categorySkills]) => (
                    <Box key={category} id={toCategoryAnchor(category)}>
                      <Box
                        sx={{
                          px: 2.25,
                          py: 1.15,
                          background: "var(--mcs-workbench-surface-subtle)",
                          borderTop: "1px solid var(--mcs-workbench-outline)",
                          borderBottom:
                            "1px solid var(--mcs-workbench-outline)",
                          scrollMarginTop: 112,
                          position: { lg: "sticky" },
                          top: { lg: 0 },
                          zIndex: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="overline"
                            sx={{ color: "var(--mcs-workbench-muted)" }}
                          >
                            {category}
                          </Typography>
                          <Chip
                            label={categorySkills.length}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                      <List dense disablePadding>
                        {categorySkills.map((skill) => (
                          <SkillRow
                            key={skill.name}
                            skill={skill}
                            selected={selectedSkills.has(skill.name)}
                            expanded={expandedSkills.has(skill.name)}
                            disabled={disabled}
                            onToggle={() => onToggleSkill(skill.name)}
                            onToggleExpanded={() =>
                              setExpandedSkills((previous) =>
                                toggleInSet(previous, skill.name),
                              )
                            }
                          />
                        ))}
                      </List>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
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
        top: { lg: "var(--mcs-sticky-offset)" },
        borderRadius: 3.5,
        border: "1px solid var(--mcs-workbench-outline)",
        background: "var(--mcs-panel-fill)",
        boxShadow: "var(--mcs-shadow-sm)",
        p: 1.25,
        overflow: "hidden",
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ px: 0.75, pt: 0.5, pb: 0.25 }}>
          <Typography
            variant="overline"
            sx={{ color: "var(--mcs-workbench-muted)" }}
          >
            {t("installHub.categoryRailTitle")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--mcs-workbench-muted)" }}
          >
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
                aria-current={active ? "location" : undefined}
                sx={{
                  width: "100%",
                  borderRadius: 2.5,
                  px: 1,
                  py: 1,
                  minHeight: 44,
                  justifyContent: "space-between",
                  textAlign: "left",
                  border: "1px solid",
                  borderColor: active
                    ? "var(--mcs-workbench-outline-strong)"
                    : "var(--mcs-workbench-outline)",
                  bgcolor: active
                    ? "var(--mcs-workbench-accent-soft)"
                    : "var(--mcs-workbench-surface-muted)",
                  boxShadow: active ? "var(--mcs-summary-tile-shadow)" : "none",
                  transition:
                    "background-color var(--mcs-duration) var(--mcs-ease), box-shadow var(--mcs-duration) var(--mcs-ease), border-color var(--mcs-duration) var(--mcs-ease)",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={active ? 700 : 600}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
  expanded,
  disabled,
  onToggle,
  onToggleExpanded,
}: {
  skill: InstallCatalogItemDto;
  selected: boolean;
  expanded: boolean;
  disabled: boolean;
  onToggle: () => void;
  onToggleExpanded: () => void;
}) {
  const { t } = useI18n();
  const statusInfo = getAggregatedStatus(skill.platform_status, t);
  const installedOnCount = Object.values(skill.platform_status ?? {}).filter(
    (status) => status === "installed",
  ).length;
  const description =
    sanitizeSkillDescription(skill.description) ?? t("installHub.noDescription");
  const summaryDescription =
    summarizeSkillDescription(skill.description, "list") || t("installHub.noDescription");
  const hasLongDescription = description.length > summaryDescription.length;
  const skillDomId = toSafeDomId(skill.name);
  const titleId = `${skillDomId}-title`;
  const descriptionId = `${skillDomId}-description`;
  const metaId = `${skillDomId}-meta`;

  return (
      <ListItem
        disablePadding
        divider
        sx={{ borderColor: "var(--mcs-workbench-outline)", display: "block" }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: hasLongDescription ? "minmax(0, 1fr) auto" : "1fr",
            alignItems: "stretch",
          }}
        >
          <ListItemButton
            selected={selected}
            disabled={disabled}
            onClick={onToggle}
            role="checkbox"
            aria-checked={selected}
            aria-labelledby={titleId}
            aria-describedby={`${descriptionId} ${metaId}`}
            sx={{
              alignItems: "flex-start",
              px: { xs: 1.25, md: 1.75 },
              py: 1.35,
              minHeight: 44,
              transition:
                "background-color var(--mcs-duration) var(--mcs-ease), box-shadow var(--mcs-duration) var(--mcs-ease), transform var(--mcs-duration) var(--mcs-ease)",
              "&:hover": {
                backgroundColor: "var(--mcs-workbench-surface-muted)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--mcs-workbench-accent-soft)",
                boxShadow: "inset 0 0 0 1px var(--mcs-workbench-outline-strong)",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "var(--mcs-workbench-accent-soft)",
              },
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 28,
                height: 28,
                mt: 0.25,
                mr: 1.5,
                borderRadius: 999,
                border: "1px solid",
                borderColor: selected ? "var(--mcs-workbench-accent-strong)" : "var(--mcs-workbench-outline)",
                backgroundColor: selected ? "var(--mcs-workbench-accent-soft)" : "transparent",
                color: selected ? "var(--mcs-workbench-accent-strong)" : "var(--mcs-workbench-muted)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {selected ? <TaskAltIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
            </Box>
            <ListItemText
              primary={
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Typography id={titleId} variant="body1" fontWeight={700}>
                      {skill.name}
                    </Typography>
                    {skill.item_type === "skill" && skill.is_default ? (
                      <Chip
                        label={t("installHub.defaultTag")}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : null}
                    {skill.category ? (
                      <Chip
                        label={skill.category}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                    <InstallStatusChip
                      status={statusInfo.status}
                      tooltip={statusInfo.tooltip}
                      t={t}
                    />
                  </Stack>

                  <Typography
                    id={descriptionId}
                    variant="body2"
                    sx={{
                      color: "var(--mcs-workbench-muted)",
                      maxWidth: 920,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {summaryDescription}
                  </Typography>

                  <Stack
                    id={metaId}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {installedOnCount > 0 ? (
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--mcs-workbench-muted)" }}
                      >
                        {t("installHub.installedOnCount", {
                          count: installedOnCount,
                        })}
                      </Typography>
                    ) : null}
                    {hasLongDescription ? (
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--mcs-workbench-muted)" }}
                      >
                        {expanded
                          ? t("installHub.hideDetails")
                          : t("installHub.skillDetails")}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              }
            />
          </ListItemButton>
          {hasLongDescription ? (
            <Box sx={{ px: 1, display: "flex", alignItems: "flex-start", pt: 1.2 }}>
              <IconButton
                size="small"
                onClick={onToggleExpanded}
                aria-label={
                  expanded
                    ? t("installHub.hideDetails")
                    : t("installHub.skillDetails")
                }
                sx={{
                  color: "var(--mcs-workbench-muted)",
                }}
              >
                <ExpandMoreRoundedIcon
                  fontSize="small"
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition:
                      "transform var(--mcs-duration) var(--mcs-ease)",
                  }}
                />
              </IconButton>
            </Box>
          ) : null}
        </Box>
        {hasLongDescription ? (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ px: { xs: 1.25, md: 1.75 }, pb: 1.35, ml: { xs: 5.5, md: 5.5 } }}>
              <Typography
                variant="caption"
                sx={{ color: "var(--mcs-workbench-muted)" }}
              >
                {description}
              </Typography>
            </Box>
          </Collapse>
        ) : null}
      </ListItem>
  );
}

function groupSkillsByCategory(
  skills: InstallCatalogItemDto[],
  uncategorizedLabel: string,
) {
  const groups = new Map<string, InstallCatalogItemDto[]>();
  for (const skill of skills) {
    const category = skill.category ?? uncategorizedLabel;
    const group = groups.get(category);
    if (group) {
      group.push(skill);
    } else {
      groups.set(category, [skill]);
    }
  }

  return Array.from(groups.entries()).sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function toCategoryAnchor(category: string) {
  return `install-hub-category-${toSafeDomId(category)}`;
}

function toSafeDomId(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function toggleInSet<T>(source: Set<T>, value: T): Set<T> {
  const next = new Set(source);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
