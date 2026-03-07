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
        size="small"
        onChange={handleLocaleChange}
        aria-label={t("common.languageSwitch")}
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.08)",
          "& .MuiToggleButton-root": {
            border: "none",
            px: 1,
            py: 0.25,
            color: "inherit",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "none",
          },
          "& .Mui-selected": {
            bgcolor: "rgba(255, 255, 255, 0.2)",
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
