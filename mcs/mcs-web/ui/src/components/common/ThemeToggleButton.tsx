import { IconButton, Tooltip } from "@mui/material";
import { MoonStars, SunDim } from "@phosphor-icons/react";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/stores/uiStore";

export function ThemeToggleButton() {
  const { t } = useI18n();
  const colorMode = useUiStore((state) => state.colorMode);
  const toggleColorMode = useUiStore((state) => state.toggleColorMode);

  const label = colorMode === "dark"
    ? t("common.toggleThemeToLight")
    : t("common.toggleThemeToDark");

  return (
    <Tooltip title={label}>
      <IconButton
        color="inherit"
        aria-label={label}
        onClick={toggleColorMode}
        sx={{
          borderRadius: 2,
          minWidth: 40,
          minHeight: 40,
        }}
      >
        {colorMode === "dark" ? <SunDim size={18} weight="bold" /> : <MoonStars size={18} weight="bold" />}
      </IconButton>
    </Tooltip>
  );
}
