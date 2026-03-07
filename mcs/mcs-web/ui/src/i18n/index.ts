import { useMemo } from "react";
import { useUiStore } from "@/stores/uiStore";
import type { Locale } from "./locale";
import type { MessageKey } from "./messages";
import {
  createTranslator,
  type TranslateFn,
} from "./translator";

export type { Locale } from "./locale";
export type { MessageKey } from "./messages";
export type { MessageVars, TranslateFn } from "./translator";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

export function useI18n(): I18nContextValue {
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);
  const t = useMemo(() => createTranslator(locale), [locale]);
  return { locale, setLocale, t };
}

export function messageKey<K extends MessageKey>(key: K): K {
  return key;
}
