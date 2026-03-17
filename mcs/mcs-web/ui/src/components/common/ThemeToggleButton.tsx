import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
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
      >
        {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
