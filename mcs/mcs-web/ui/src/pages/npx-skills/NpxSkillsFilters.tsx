import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import type { TaxonomyGroupSummary, TranslationFn } from "./types";
import { formatCategoryLabel } from "./utils";

export interface NpxSkillsFiltersProps {
  groups: TaxonomyGroupSummary[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  t: TranslationFn;
}

export default function NpxSkillsFilters({
  groups,
  selectedCategoryId,
  onCategoryChange,
  t,
}: NpxSkillsFiltersProps) {
  const totalCount = groups.reduce(
    (sum, group) =>
      sum + group.categories.reduce((groupSum, category) => groupSum + category.count, 0),
    0
  );

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {t("common.category")}
      </Typography>
      <List dense disablePadding sx={{ mt: 1 }}>
        <ListItemButton
          selected={selectedCategoryId === null}
          onClick={() => onCategoryChange(null)}
          sx={{ minHeight: 44 }}
        >
          <ListItemText primary={t("common.all")} secondary={String(totalCount)} />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        {groups.map((group) => (
          <Box key={group.id} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", px: 2, py: 0.5, textTransform: "uppercase" }}
            >
              {group.label}
            </Typography>
            {group.categories.map((category) => (
              <ListItemButton
                key={category.id}
                selected={selectedCategoryId === category.id}
                onClick={() => onCategoryChange(category.id)}
                sx={{ minHeight: 44 }}
              >
                <ListItemText
                  primary={formatCategoryLabel(category.slug, category.label)}
                  secondary={String(category.count)}
                />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );
}
