import TranslateIcon from "@mui/icons-material/Translate";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useI18n } from "@/i18n";
import type { Locale } from "@/i18n";

interface LanguageToggleProps {
  sx?: SxProps<Theme>;
}

export function LanguageToggle({ sx }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();

  const handleLocaleChange = (_: React.MouseEvent<HTMLElement>, value: Locale | null) => {
    if (!value) {
      return;
    }
    setLocale(value);
  };

  return (
    <Tooltip title={t("common.languageSwitch")}>
      <ToggleButtonGroup
        value={locale}
        exclusive
        onChange={handleLocaleChange}
        aria-label={t("common.languageSwitch")}
        color="primary"
        sx={{
          bgcolor: "action.hover",
          borderRadius: 999,
          "& .MuiToggleButton-root": {
            border: "none",
            px: 1.5,
            minHeight: 44,
            color: "inherit",
            fontSize: "0.85rem",
            fontWeight: 600,
            textTransform: "none",
          },
          "& .Mui-selected": {
            bgcolor: "background.paper",
          },
          ...sx,
        }}
      >
        <ToggleButton value="zh" aria-label={t("common.languageZh")}>
          {t("common.languageZh")}
        </ToggleButton>
        <ToggleButton value="en" aria-label={t("common.languageEn")}>
          <TranslateIcon fontSize="inherit" sx={{ mr: 0.5 }} />
          {t("common.languageEn")}
        </ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
}
