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

// ============================================================================
// Marketplace Types
// ============================================================================

/** Marketplace skill source type */
export type MarketplaceSource = "vercel-labs" | "community" | "official";

/** Marketplace sort options */
export type MarketplaceSortBy = "popular" | "trending" | "latest" | "top";

/** Marketplace skill from SkillsMP API */
export interface MarketplaceSkill {
  id: string;
  name: string;
  description?: string;
  owner: string;
  repo: string;
  stars: number;
  downloads?: number;
  categories: string[];
  platforms: string[];
  source: string;
  updatedAt: string;
  installed: boolean;
}

/** Query parameters for marketplace API */
export interface MarketplaceQuery {
  sortBy: string;
  search?: string;
  category?: string;
  source?: string;
  platform?: string;
  page: number;
  perPage: number;
}

/** Filter options for marketplace */
export interface MarketplaceFilters {
  category?: string;
  source?: string;
  platform?: string;
  search?: string;
}

/** Marketplace category */
export interface MarketplaceCategory {
  id: string;
  name: string;
  count: number;
}

/** Skill installation result */
export interface InstallResult {
  success: boolean;
  skillId: string;
  message?: string;
  error?: string;
}

/** Marketplace cache statistics */
export interface CacheStats {
  skillCount: number;
  lastRefresh?: string;
  ttlSeconds: number;
  isValid: boolean;
}

/** Default marketplace query */
export const DEFAULT_MARKETPLACE_QUERY: MarketplaceQuery = {
  sortBy: "popular",
  page: 1,
  perPage: 50,
};

/** Marketplace sort options with display names */
export const MARKETPLACE_SORT_OPTIONS: { value: MarketplaceSortBy; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "top", label: "Top" },
];
