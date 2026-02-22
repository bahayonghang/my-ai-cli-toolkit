// ── Enums matching Rust backend ─────────────────────────────────────

export type ItemType = "skill" | "command";
export type InstallStatus = "installed" | "not_installed" | "outdated";

// ── API Response Types ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ── Platform ───────────────────────────────────────────────────────

export interface PlatformDisplay {
  id: string;
  name: string;
  icon: string;
  base_dir: string;
}

export interface PlatformConfig {
  name: string;
  base_dir: string;
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
  source_path: string;
  target_path: string;
  source_mtime_ms: number | null;
  target_mtime_ms: number | null;
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
