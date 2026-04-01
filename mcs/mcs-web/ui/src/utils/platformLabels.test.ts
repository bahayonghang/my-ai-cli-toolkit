import { describe, expect, it } from "vitest";
import type { TranslateFn } from "@/i18n";
import { enCommonMessages } from "@/i18n/messages/common";
import { getPlatformCommandsLabel, platformUsesPromptLibrary } from "./platformLabels";

const t = ((key: keyof typeof enCommonMessages) => enCommonMessages[key]) as TranslateFn;

describe("platformLabels", () => {
  it("treats Codex prompt paths as prompt libraries", () => {
    const platform = {
      id: "codex",
      commands_path: "~/.codex/prompts",
    };

    expect(platformUsesPromptLibrary(platform)).toBe(true);
    expect(getPlatformCommandsLabel(platform, t)).toBe("Prompts");
  });

  it("keeps standard command libraries labeled as commands", () => {
    const platform = {
      id: "claude",
      commands_path: "~/.claude/commands",
    };

    expect(platformUsesPromptLibrary(platform)).toBe(false);
    expect(getPlatformCommandsLabel(platform, t)).toBe("Commands");
  });
});
