import type { Locale } from "./locale";
import { messagesByLocale, type MessageKey } from "./messages";

export type MessageVars = Record<string, string | number | boolean>;
export type TranslateFn = (key: MessageKey, vars?: MessageVars) => string;

const missingKeys = new Set<string>();
const missingVars = new Set<string>();

function reportMissingKey(locale: Locale, key: string) {
  const cacheKey = `${locale}:${key}`;
  if (missingKeys.has(cacheKey)) {
    return;
  }
  missingKeys.add(cacheKey);
  console.error(`[i18n] Missing translation key "${key}" for locale "${locale}"`);
}

function reportMissingVar(locale: Locale, key: string, varName: string) {
  const cacheKey = `${locale}:${key}:${varName}`;
  if (missingVars.has(cacheKey)) {
    return;
  }
  missingVars.add(cacheKey);
  console.error(
    `[i18n] Missing interpolation var "{${varName}}" for key "${key}" in locale "${locale}"`
  );
}

function interpolate(
  locale: Locale,
  key: string,
  template: string,
  vars?: MessageVars
): string {
  return template.replace(/\{(\w+)\}/g, (_, varName: string) => {
    const value = vars?.[varName];
    if (value === undefined) {
      reportMissingVar(locale, key, varName);
      return `{${varName}}`;
    }
    return String(value);
  });
}

export function translate(
  locale: Locale,
  key: MessageKey | string,
  vars?: MessageVars
): string {
  const table = messagesByLocale[locale] as Record<string, string>;
  const template = table[key];
  if (template === undefined) {
    reportMissingKey(locale, key);
    return `__MISSING_I18N__:${key}`;
  }
  return interpolate(locale, key, template, vars);
}

export function createTranslator(locale: Locale): TranslateFn {
  return (key, vars) => translate(locale, key, vars);
}
