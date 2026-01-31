/**
 * AgentKit Desktop - TypeScript Type Definitions
 *
 * These types mirror the Rust data models for type-safe IPC communication.
 */

/** Resource type classification */
export type ResourceType = "skill" | "command" | "agent";

/** Synchronization status for a resource on a specific platform */
export type SyncStatus = "not_installed" | "synced" | "outdated" | "conflict" | "not_supported";

/** Supported AI coding tool platforms */
export type Platform =
  | "claude"
  | "codex"
  | "gemini"
  | "cursor"
  | "windsurf"
  | "antigravity"
  | "qwen"
  | "amp"
  | "cline"
  | "kiro"
  | "trae"
  | "opencode";

/** Link mode for file synchronization */
export type LinkMode = "symlink" | "junction" | "copy";

/** UI theme */
export type Theme = "dark" | "light" | "system";

/** UI language */
export type Language = "english" | "chinese";

/** Resource source information */
export type ResourceSource =
  | { type: "local"; path: string }
  | { type: "git"; url: string; branch: string }
  | { type: "npm"; package: string }
  | { type: "pip"; package: string }
  | { type: "vercel"; skillName: string };

/** A resource item (skill, command, or agent) */
export interface ResourceItem {
  id: string;
  name: string;
  resourceType: ResourceType;
  description?: string;
  source: ResourceSource;
  categories: string[];
  tags: string[];
  platformStatus: Record<Platform, SyncStatus>;
  createdAt: string;
  updatedAt: string;
}

/** Platform detection information */
export interface PlatformInfo {
  platform: Platform;
  detected: boolean;
  basePath?: string;
  hasCli: boolean;
  linkMode: LinkMode;
}

/** Application settings */
export interface Settings {
  defaultLinkMode: LinkMode;
  theme: Theme;
  language: Language;
  autoDetectPlatforms: boolean;
}

/** External skill from registry */
export interface ExternalSkill {
  id: string;
  name: string;
  description?: string;
  sourceType: string;
  package?: string;
  repo?: string;
  branch?: string;
  homepage?: string;
  license?: string;
  supportedPlatforms: Platform[];
}

/** Sync operation result */
export interface SyncResult {
  success: boolean;
  platform: Platform;
  resourceId: string;
  error?: string;
}

/** All supported platforms */
export const ALL_PLATFORMS: Platform[] = [
  "claude",
  "codex",
  "gemini",
  "cursor",
  "windsurf",
  "antigravity",
  "qwen",
  "amp",
  "cline",
  "kiro",
  "trae",
  "opencode",
];

/** Platform display information */
export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  claude: "Claude Code",
  codex: "Codex CLI",
  gemini: "Gemini CLI",
  cursor: "Cursor",
  windsurf: "Windsurf",
  antigravity: "Antigravity",
  qwen: "Qwen Code",
  amp: "Amp",
  cline: "Cline",
  kiro: "Kiro",
  trae: "Trae",
  opencode: "OpenCode",
};
