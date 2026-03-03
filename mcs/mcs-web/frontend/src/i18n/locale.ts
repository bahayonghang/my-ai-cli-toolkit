export type Locale = "zh" | "en";

const SUPPORTED_LOCALES = new Set<Locale>(["zh", "en"]);

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) {
    return false;
  }
  return SUPPORTED_LOCALES.has(value as Locale);
}

export function resolveInitialLocale(
  storedLocale: string | null | undefined,
  browserLanguage?: string
): Locale {
  if (isLocale(storedLocale)) {
    return storedLocale;
  }
  if (browserLanguage?.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}
