import type { Locale, TranslateFn } from "@/i18n";
import type { PlatformDisplay } from "@/types";

const FALLBACK_PLATFORM_NAMES: Record<string, string> = {
  amp: "Amp",
  cline: "Cline",
  codex: "Codex",
  copilot: "GitHub Copilot",
  cursor: "Cursor",
  gemini: "Gemini",
  kimi: "Kimi",
  opencode: "OpenCode",
  "trae-cn": "Trae CN",
};

function fallbackPlatformName(platformId: string) {
  return (
    FALLBACK_PLATFORM_NAMES[platformId] ??
    platformId
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function resolveSkillsLibraryPlatformNames(
  platform: Pick<PlatformDisplay, "skills_library_platform_ids">,
  platforms: Array<Pick<PlatformDisplay, "id" | "name">>,
) {
  const namesById = new Map(platforms.map((entry) => [entry.id, entry.name]));
  return platform.skills_library_platform_ids.map(
    (platformId) => namesById.get(platformId) ?? fallbackPlatformName(platformId),
  );
}

export function formatSkillsLibraryPlatformList(
  platform: Pick<PlatformDisplay, "skills_library_platform_ids">,
  platforms: Array<Pick<PlatformDisplay, "id" | "name">>,
  locale: Locale,
) {
  const names = resolveSkillsLibraryPlatformNames(platform, platforms);
  return new Intl.ListFormat(locale === "zh" ? "zh-CN" : "en", {
    style: "long",
    type: "conjunction",
  }).format(names);
}

export function getSkillsLibrarySupportText(args: {
  platform: Pick<PlatformDisplay, "id" | "name" | "skills_library_kind" | "skills_library_platform_ids">;
  platforms: Array<Pick<PlatformDisplay, "id" | "name">>;
  locale: Locale;
  t: TranslateFn;
  variant?: "short" | "long";
}) {
  const { platform, platforms, locale, t, variant = "short" } = args;
  if (platform.skills_library_kind === "shared") {
    const platformsText = formatSkillsLibraryPlatformList(platform, platforms, locale);
    return variant === "long"
      ? t("common.skillsLibrarySharedLong", { platforms: platformsText })
      : t("common.skillsLibrarySharedWith", { platforms: platformsText });
  }

  return variant === "long"
    ? t("common.skillsLibraryDedicatedLong", { platform: platform.name })
    : t("common.skillsLibraryDedicatedShort");
}
