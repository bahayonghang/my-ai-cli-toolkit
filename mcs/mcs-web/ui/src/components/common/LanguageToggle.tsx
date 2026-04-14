import { Translate } from "@phosphor-icons/react";
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
          borderRadius: 2,
          px: 0.25,
          "& .MuiToggleButton-root": {
            border: 0,
            px: 1.25,
            minHeight: 40,
            color: "text.secondary",
            fontSize: "0.78rem",
            fontWeight: 510,
            textTransform: "none",
            gap: 0.5,
          },
          "& .Mui-selected": {
            color: "text.primary",
          },
          ...sx,
        }}
      >
        <ToggleButton value="zh" aria-label={t("common.languageZh")}>
          {t("common.languageZh")}
        </ToggleButton>
        <ToggleButton value="en" aria-label={t("common.languageEn")}>
          <Translate size={14} weight="bold" />
          {t("common.languageEn")}
        </ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
}
