import type { TranslateFn } from "@/i18n";
import type { PlatformDisplay } from "@/types";

type PlatformCommandsShape = Pick<PlatformDisplay, "id" | "commands_path"> | undefined;

export function platformUsesPromptLibrary(platform: PlatformCommandsShape): boolean {
  if (!platform) {
    return false;
  }

  if (platform.id === "codex") {
    return true;
  }

  return /(^|[\\/])prompts$/i.test(platform.commands_path ?? "");
}

export function getPlatformCommandsLabel(
  platform: PlatformCommandsShape,
  t: TranslateFn,
): string {
  return platformUsesPromptLibrary(platform) ? t("common.prompts") : t("common.commands");
}
