// ── Enums matching Rust backend ─────────────────────────────────────

export type ItemType = "skill" | "command";
export type InstallStatus = "installed" | "not_installed" | "outdated";
export type InstallTargetScope = "global" | "project";

export interface InstallTarget {
  scope: InstallTargetScope;
  project_path?: string | null;
}

export interface ResolvedInstallTarget {
  scope: InstallTargetScope;
  project_path: string | null;
  base_dir: string;
  skills_path: string;
  commands_path: string;
}

// ── API Response Types ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ── Platform ───────────────────────────────────────────────────────

export interface PlatformDisplay {
  id: string;
  name: string;
  icon: string;
  base_dir: string;
  skills_path: string;
}

export interface PlatformConfig {
  name: string;
  base_dir: string;
  skills_base_dir: string | null;
  skills_subdir: string;
  commands_subdir: string;
  prompt_file: string | null;
  commands_source: string;
  fallback_commands_source: string | null;
}

// ── Items (Skills / Commands) ──────────────────────────────────────

export interface ItemDto {
  name: string;
  item_type: ItemType;
  description: string | null;
  status: InstallStatus;
  category: string | null;
  tags: string[];
  is_default: boolean;
}

export interface SkillCatalogDto {
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  is_default: boolean;
}

export interface ItemDetailDto {
  name: string;
  item_type: ItemType;
  description: string | null;
  status: InstallStatus;
  category: string | null;
  tags: string[];
  is_default: boolean;
  content: string | null;
  source_path: string;
  target_path: string;
  source_mtime_ms: number | null;
  target_mtime_ms: number | null;
}

export interface DiffDto {
  has_diff: boolean;
  diff_text: string;
}

export interface CategoryDto {
  name: string;
  count: number;
  item_type: ItemType;
}

// ── Dashboard ──────────────────────────────────────────────────────

export interface DashboardPlatformStats {
  id: string;
  name: string;
  icon: string;
  total_skills: number;
  installed_skills: number;
  outdated_skills: number;
  total_commands: number;
  installed_commands: number;
}

export interface DashboardDto {
  platforms: DashboardPlatformStats[];
}

// ── Batch Operations ───────────────────────────────────────────────

export interface InstallResult {
  success: boolean;
  item_name: string;
  message: string;
  error: string | null;
}

export interface BatchResultDto {
  results: InstallResult[];
  success_count: number;
  failure_count: number;
}

// ── Prompt ─────────────────────────────────────────────────────────

export interface PromptDiffDto {
  has_diff: boolean;
  diff_text: string;
  supports_prompt: boolean;
}

// ── External Skill Catalog ────────────────────────────────────────

export interface ExternalSkillCatalogDto {
  name: string;
  repo: string;
  skill_flag: string | null;
  method: "vercel" | "playbooks";
  category: string | null;
  description: string | null;
  stars: number | null;
  project_only: boolean;
  usage: string | null;
}

export type ExternalInstallMethod = "vercel" | "playbooks";
export type ExternalInstallCliMode = "auto" | "npx";

export interface ExternalInstallConfig {
  agents: string[];
  cli_mode: ExternalInstallCliMode;
}

export interface ExternalInstallBatchItemDto {
  skill_name: string;
  method: ExternalInstallMethod;
}

export interface ExternalInstallJobStartDto {
  job_id: string;
  total: number;
  status: string;
}

export interface ExternalInstallJobStartedPayload {
  job_id: string;
  total: number;
  max_concurrency: number;
  started_at_ms: number;
}

export interface ExternalInstallItemStartedPayload {
  job_id: string;
  item_id: string;
  skill_name: string;
  method: ExternalInstallMethod;
}

export interface ExternalInstallItemFinishedPayload {
  job_id: string;
  item_id: string;
  skill_name: string;
  method: ExternalInstallMethod;
  success: boolean;
  output: string;
  error: string | null;
  duration_ms: number;
}

export interface ExternalInstallJobProgressPayload {
  job_id: string;
  completed: number;
  total: number;
  success_count: number;
  failure_count: number;
  percent: number;
}

export interface ExternalInstallJobCompletedPayload {
  job_id: string;
  total: number;
  success_count: number;
  failure_count: number;
  completed_at_ms: number;
}

export interface ExternalInstallJobFailedPayload {
  job_id: string;
  message: string;
}

// ── System Operations ──────────────────────────────────────────────

export interface PickedFolderDto {
  path: string | null;
}

// ── Legacy Skill Directory Cleanup ────────────────────────────────

export interface LegacyDirDto {
  platform_id: string;
  legacy_path: string;
  shared_path: string;
}

export interface CleanupResultDto {
  removed: string[];
  failed: { path: string; error: string }[];
}
