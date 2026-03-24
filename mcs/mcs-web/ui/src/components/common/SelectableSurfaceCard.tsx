import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Box, ButtonBase, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface SelectableSurfaceCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  selectionLabel: string;
  selectedLabel?: ReactNode;
}

export function SelectableSurfaceCard({
  title,
  subtitle,
  badges,
  description,
  meta,
  footer,
  selected,
  disabled = false,
  onSelect,
  selectionLabel,
  selectedLabel,
}: SelectableSurfaceCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderColor: selected ? "var(--mcs-panel-accent)" : "var(--mcs-panel-stroke)",
        backgroundColor: selected ? "var(--mcs-panel-fill-strong)" : "var(--mcs-panel-fill)",
        boxShadow: selected ? "var(--mcs-shadow-sm)" : "none",
        opacity: disabled ? 0.62 : 1,
        transition:
          "border-color var(--mcs-duration) var(--mcs-ease), background-color var(--mcs-duration) var(--mcs-ease), box-shadow var(--mcs-duration) var(--mcs-ease), transform var(--mcs-duration) var(--mcs-ease)",
      }}
    >
      <ButtonBase
        onClick={onSelect}
        disabled={disabled}
        role="checkbox"
        aria-checked={selected}
        aria-label={selectionLabel}
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "block",
          borderRadius: "inherit",
          textAlign: "left",
          alignItems: "stretch",
          justifyContent: "stretch",
          "&:hover": {
            transform: disabled ? "none" : "translateY(-1px)",
          },
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, height: "100%" }}>
          <Stack direction="row" spacing={1.25} justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="body1" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                {title}
              </Typography>
              {subtitle ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.35, overflowWrap: "anywhere" }}
                >
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
              {selected && selectedLabel ? (
                <Typography variant="caption" sx={{ color: "var(--mcs-panel-accent)", fontWeight: 700 }}>
                  {selectedLabel}
                </Typography>
              ) : null}
              <Box
                aria-hidden="true"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: selected ? "var(--mcs-panel-accent)" : "var(--mcs-panel-stroke-soft)",
                  backgroundColor: selected ? "var(--mcs-panel-accent-soft)" : "transparent",
                  color: selected ? "var(--mcs-panel-accent)" : "text.secondary",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {selected ? <TaskAltIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
              </Box>
            </Stack>
          </Stack>

          {badges ? (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {badges}
            </Stack>
          ) : null}

          {description ? (
            <Box sx={{ color: "text.secondary", minWidth: 0 }}>
              {description}
            </Box>
          ) : null}

          {meta ? <Box sx={{ minWidth: 0 }}>{meta}</Box> : null}
        </CardContent>
      </ButtonBase>

      {footer ? (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderTop: "1px solid var(--mcs-panel-stroke-soft)",
            backgroundColor: "var(--mcs-panel-fill-emphasis)",
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Card>
  );
}
