// ── Enums matching Rust backend ─────────────────────────────────────

export type ItemType = "skill" | "command" | "agent";
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
  commands_path: string | null;
  agents_path: string | null;
  guidance_path: string | null;
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
  commands_path?: string | null;
  agents_path?: string | null;
  guidance_path?: string | null;
  supports_commands?: boolean;
  supports_agents?: boolean;
  supports_guidance?: boolean;
}

export interface PlatformConfig {
  name: string;
  base_dir: string;
  skills_base_dir: string | null;
  skills_subdir: string;
  commands_subdir: string;
  commands_source: string;
  fallback_commands_source: string | null;
  agents_subdir: string;
  agents_source: string;
  fallback_agents_source: string | null;
  guidance_file: string | null;
  guidance_source: string;
  fallback_guidance_source: string | null;
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
  /** Installation status per platform (platform_id -> status) */
  platform_status?: Record<string, InstallStatus>;
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

export interface DashboardSummary {
  activePlatforms: number;
  totalPlatforms: number;
  installedSkills: number;
  totalSkills: number;
  installedCommands: number;
  totalCommands: number;
  outdatedSkills: number;
  skillCoverage: number;
  commandCoverage: number;
}

export interface DashboardTopSkill {
  name: string;
  installedOn: number;
  outdatedOn: number;
  category: string | null;
}

export interface DashboardTopCategory {
  name: string;
  installed: number;
  total: number;
}

export interface DashboardUpdateQueueItem {
  platformId: string;
  platformName: string;
  platformIcon: string;
  outdatedSkills: number;
  installedSkills: number;
  totalSkills: number;
}

export interface DashboardSkillSpotlight {
  topSkills: DashboardTopSkill[];
  topCategories: DashboardTopCategory[];
  updateQueue: DashboardUpdateQueueItem[];
}

export interface DashboardDto {
  summary: DashboardSummary;
  skillSpotlight: DashboardSkillSpotlight;
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

// ── npx skills ─────────────────────────────────────────────────────

export type NpxSkillsCliMode = "auto" | "npx";
export type NpxSkillsOperation = "install" | "remove" | "check" | "update";

export interface NpxSkillsCliConfig {
  agents: string[];
  cli_mode: NpxSkillsCliMode;
}

export interface NpxSkillsRunConfig {
  agents: string[];
  cliMode: NpxSkillsCliMode;
  installTarget: InstallTarget;
}

export interface NpxSkillsCatalogItemDto {
  id: string;
  name: string;
  package_ref: string;
  skill_flag: string | null;
  group_id: string;
  group_label: string;
  group_order: number;
  category_id: string;
  category_label: string;
  category_order: number;
  tags: string[];
  install_kind: string;
  install_provider: string;
  description: string | null;
  stars: number | null;
  project_only: boolean;
  usage: string | null;
  installed_state: "installed" | "not_installed";
  installed_instance_id: string | null;
}

export interface NpxSkillsCapabilityDto {
  supported: boolean;
  reason: string | null;
}

export interface NpxSkillsCapabilitiesDto {
  list: NpxSkillsCapabilityDto;
  remove: NpxSkillsCapabilityDto;
  check: NpxSkillsCapabilityDto;
  update: NpxSkillsCapabilityDto;
}

export interface NpxSkillsInstalledSummaryDto {
  total: number;
  curated: number;
  manual: number;
  tracked: number;
  update_available: number;
}

export interface NpxInstalledSourceDto {
  kind: "curated" | "manual_github" | "manual_git" | "manual_local" | "manual_unknown";
  ref: string;
  display: string;
}

export interface NpxCatalogMatchDto {
  id: string;
  name: string;
  category_label: string;
}

export interface NpxInstalledTrackingDto {
  kind: "tracked" | "untracked";
  source_type: string | null;
  installed_at: string | null;
  updated_at: string | null;
  reason: string | null;
}

export interface NpxInstalledUpdateDto {
  kind: "not_checked" | "up_to_date" | "update_available" | "unsupported";
  last_checked_at_ms: number | null;
  reason: string | null;
}

export interface NpxInstalledActionsDto {
  removable: boolean;
  reinstallable: boolean;
  batch_updatable: boolean;
}

export interface NpxInstalledSkillInstanceDto {
  id: string;
  name: string;
  scope: "global" | "project";
  agents: string[];
  group_id: string;
  group_label: string;
  group_order: number;
  category_id: string;
  category_label: string;
  category_order: number;
  tags: string[];
  description: string | null;
  source: NpxInstalledSourceDto;
  catalog_match: NpxCatalogMatchDto | null;
  tracking: NpxInstalledTrackingDto;
  update: NpxInstalledUpdateDto;
  actions: NpxInstalledActionsDto;
}

export interface NpxSkillsInstalledInventoryDto {
  target: ResolvedInstallTarget;
  capabilities: NpxSkillsCapabilitiesDto;
  summary: NpxSkillsInstalledSummaryDto;
  items: NpxInstalledSkillInstanceDto[];
}

export interface NpxSkillsInstallItemInput {
  package_ref: string;
  skill_flags?: string[];
  catalog_entry_id?: string | null;
}

export interface NpxSkillsJobStartDto {
  job_id: string;
  operation: NpxSkillsOperation;
  total: number;
  status: string;
}

export interface NpxSkillsJobStartedPayload {
  job_id: string;
  operation: NpxSkillsOperation;
  total: number;
  max_concurrency: number;
  started_at_ms: number;
}

export interface NpxSkillsItemStartedPayload {
  job_id: string;
  operation: NpxSkillsOperation;
  item_id: string;
  label: string;
}

export interface NpxSkillsItemFinishedPayload {
  job_id: string;
  operation: NpxSkillsOperation;
  item_id: string;
  label: string;
  success: boolean;
  output: string;
  error: string | null;
  duration_ms: number;
}

export interface NpxSkillsJobProgressPayload {
  job_id: string;
  operation: NpxSkillsOperation;
  completed: number;
  total: number;
  success_count: number;
  failure_count: number;
  percent: number;
}

export interface NpxSkillsJobCompletedPayload {
  job_id: string;
  operation: NpxSkillsOperation;
  total: number;
  success_count: number;
  failure_count: number;
  completed_at_ms: number;
}

export interface NpxSkillsJobFailedPayload {
  job_id: string;
  operation: NpxSkillsOperation;
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
