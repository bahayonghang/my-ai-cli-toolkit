import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import type { SkillCatalogDto } from "@/types";
import type { SkillSelection } from "./types";
import { useI18n } from "@/i18n";

interface Props {
  skills: SkillCatalogDto[];
  totalCount: number;
  selectedSkills: SkillSelection;
  categories: string[];
  search: string;
  selectedCategory: string | null;
  defaultOnly: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string | null) => void;
  onDefaultOnlyChange: (value: boolean) => void;
  onToggleSkill: (name: string) => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
}

export function SkillCatalogPanel({
  skills,
  totalCount,
  selectedSkills,
  categories,
  search,
  selectedCategory,
  defaultOnly,
  onSearchChange,
  onCategoryChange,
  onDefaultOnlyChange,
  onToggleSkill,
  onSelectAllFiltered,
  onClearSelection,
}: Props) {
  const { t } = useI18n();
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title={t("installHub.skillCatalog")}
        subheader={t("installHub.filteredTotal", {
          filtered: skills.length,
          total: totalCount,
        })}
        action={
          <Chip
            color="primary"
            label={t("common.selectedCount", { count: selectedSkills.size })}
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <FilterControls
          categories={categories}
          defaultOnly={defaultOnly}
          search={search}
          selectedCategory={selectedCategory}
          skillsCount={skills.length}
          selectedCount={selectedSkills.size}
          onCategoryChange={onCategoryChange}
          onClearSelection={onClearSelection}
          onDefaultOnlyChange={onDefaultOnlyChange}
          onSearchChange={onSearchChange}
          onSelectAllFiltered={onSelectAllFiltered}
        />
        <SkillListBox selectedSkills={selectedSkills} skills={skills} onToggleSkill={onToggleSkill} />
      </CardContent>
    </Card>
  );
}

interface FilterControlsProps {
  categories: string[];
  search: string;
  selectedCategory: string | null;
  defaultOnly: boolean;
  skillsCount: number;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string | null) => void;
  onDefaultOnlyChange: (value: boolean) => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
}

function FilterControls({
  categories,
  search,
  selectedCategory,
  defaultOnly,
  skillsCount,
  selectedCount,
  onSearchChange,
  onCategoryChange,
  onDefaultOnlyChange,
  onSelectAllFiltered,
  onClearSelection,
}: FilterControlsProps) {
  const { t } = useI18n();
  return (
    <Stack spacing={2}>
      <TextField
        label={t("installHub.searchSkills")}
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <FormControl size="small">
        <InputLabel id="install-hub-category-label">{t("installHub.category")}</InputLabel>
        <Select
          label={t("installHub.category")}
          labelId="install-hub-category-label"
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
        control={<Checkbox checked={defaultOnly} onChange={(_, checked) => onDefaultOnlyChange(checked)} />}
        label={t("installHub.onlyDefaultSkills")}
      />
      <Stack direction="row" spacing={1} mb={2}>
        <Button size="small" variant="outlined" onClick={onSelectAllFiltered} disabled={skillsCount === 0}>
          {t("installHub.selectAllFiltered")}
        </Button>
        <Button size="small" variant="text" onClick={onClearSelection} disabled={selectedCount === 0}>
          {t("installHub.clearSelection")}
        </Button>
      </Stack>
    </Stack>
  );
}

interface SkillListBoxProps {
  skills: SkillCatalogDto[];
  selectedSkills: SkillSelection;
  onToggleSkill: (name: string) => void;
}

function SkillListBox({ skills, selectedSkills, onToggleSkill }: SkillListBoxProps) {
  const { t } = useI18n();
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        maxHeight: 420,
        overflow: "auto",
      }}
    >
      {skills.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary">{t("installHub.noSkillsFound")}</Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {skills.map((skill) => (
            <SkillRow
              key={skill.name}
              selected={selectedSkills.has(skill.name)}
              skill={skill}
              onToggle={() => onToggleSkill(skill.name)}
            />
          ))}
        </List>
      )}
    </Box>
  );
}

interface SkillRowProps {
  skill: SkillCatalogDto;
  selected: boolean;
  onToggle: () => void;
}

function SkillRow({ skill, selected, onToggle }: SkillRowProps) {
  const { t } = useI18n();
  return (
    <ListItem disablePadding divider>
      <ListItemButton selected={selected} onClick={onToggle}>
        <Checkbox edge="start" checked={selected} tabIndex={-1} />
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                {skill.name}
              </Typography>
              {skill.is_default && (
                <Chip
                  label={t("installHub.defaultTag")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {skill.category && (
                <Chip label={skill.category} size="small" variant="outlined" />
              )}
            </Stack>
          }
          secondary={skill.description ?? t("installHub.noDescription")}
        />
      </ListItemButton>
    </ListItem>
  );
}
