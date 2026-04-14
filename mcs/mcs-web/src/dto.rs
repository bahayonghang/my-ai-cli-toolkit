use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use mcs_core::core::install_target::{InstallTarget, InstallTargetScope};
use mcs_core::model::{InstallResult, InstallStatus, ItemType, LinkMode};

// ── Response envelope ──────────────────────────────────────────────

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub data: T,
}

#[derive(Serialize)]
pub struct ApiError {
    pub error: ErrorDetail,
}

#[derive(Serialize)]
pub struct ErrorDetail {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Value>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self { data }
    }
}

// ── Request DTOs ───────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct InstallRequest {
    pub names: Vec<String>,
    #[serde(default)]
    pub link_mode: LinkMode,
    #[serde(default)]
    pub install_target: InstallTargetDto,
}

#[derive(Debug, Clone, Copy, Default, Deserialize, Serialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum InstallTargetScopeDto {
    #[default]
    Global,
    Project,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct InstallTargetDto {
    #[serde(default)]
    pub scope: InstallTargetScopeDto,
    #[serde(default)]
    pub project_path: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct InstallTargetQuery {
    pub target_scope: Option<InstallTargetScopeDto>,
    pub project_path: Option<String>,
}

impl InstallTargetQuery {
    pub fn to_install_target(&self) -> InstallTargetDto {
        let scope = match self.target_scope {
            Some(scope) => scope,
            None if self.project_path.is_some() => InstallTargetScopeDto::Project,
            None => InstallTargetScopeDto::Global,
        };
        InstallTargetDto {
            scope,
            project_path: self.project_path.clone(),
        }
    }
}

impl InstallTargetDto {
    pub fn to_core(&self) -> InstallTarget {
        InstallTarget {
            scope: self.scope.to_core(),
            project_path: self.project_path.clone(),
        }
    }
}

impl InstallTargetScopeDto {
    pub fn to_core(self) -> InstallTargetScope {
        match self {
            InstallTargetScopeDto::Global => InstallTargetScope::Global,
            InstallTargetScopeDto::Project => InstallTargetScope::Project,
        }
    }

    pub fn from_core(scope: InstallTargetScope) -> Self {
        match scope {
            InstallTargetScope::Global => InstallTargetScopeDto::Global,
            InstallTargetScope::Project => InstallTargetScopeDto::Project,
        }
    }
}

#[derive(Deserialize)]
pub struct MultiSyncRequest {
    pub platform_names: Vec<String>,
    pub items: Vec<String>,
    pub item_type: ItemType,
}

// ── Query DTOs ─────────────────────────────────────────────────────

#[derive(Deserialize, Default)]
pub struct ItemQuery {
    pub search: Option<String>,
    pub category: Option<String>,
    pub status: Option<InstallStatus>,
    #[serde(flatten)]
    pub install_target: InstallTargetQuery,
}

#[derive(Deserialize, Default)]
pub struct CategoryQuery {
    #[serde(flatten)]
    pub install_target: InstallTargetQuery,
    pub item_type: Option<ItemType>,
}

// ── Response DTOs ──────────────────────────────────────────────────

#[derive(Serialize)]
pub struct ItemDto {
    pub name: String,
    pub item_type: ItemType,
    pub description: Option<String>,
    pub status: InstallStatus,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub is_default: bool,
}

#[derive(Serialize)]
pub struct SkillCatalogDto {
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub is_default: bool,
    /// Installation status per platform (platform_id -> status)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform_status: Option<HashMap<String, InstallStatus>>,
}

#[derive(Serialize)]
pub struct ItemDetailDto {
    pub name: String,
    pub item_type: ItemType,
    pub description: Option<String>,
    pub status: InstallStatus,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub is_default: bool,
    pub content: Option<String>,
    pub source_path: String,
    pub target_path: String,
    pub source_mtime_ms: Option<u64>,
    pub target_mtime_ms: Option<u64>,
}

#[derive(Serialize)]
pub struct DiffDto {
    pub has_diff: bool,
    pub diff_text: String,
}

#[derive(Serialize)]
pub struct CategoryDto {
    pub name: String,
    pub count: usize,
    pub item_type: ItemType,
}

#[derive(Serialize)]
pub struct DashboardPlatformStats {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub total_skills: usize,
    pub installed_skills: usize,
    pub outdated_skills: usize,
    pub total_commands: usize,
    pub installed_commands: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardSummary {
    pub active_platforms: usize,
    pub total_platforms: usize,
    pub installed_skills: usize,
    pub total_skills: usize,
    pub installed_commands: usize,
    pub total_commands: usize,
    pub outdated_skills: usize,
    pub skill_coverage: usize,
    pub command_coverage: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardTopSkill {
    pub name: String,
    pub installed_on: usize,
    pub outdated_on: usize,
    pub category: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardTopCategory {
    pub name: String,
    pub installed: usize,
    pub total: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardUpdateQueueItem {
    pub platform_id: String,
    pub platform_name: String,
    pub platform_icon: String,
    pub outdated_skills: usize,
    pub installed_skills: usize,
    pub total_skills: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardSkillSpotlight {
    pub top_skills: Vec<DashboardTopSkill>,
    pub top_categories: Vec<DashboardTopCategory>,
    pub update_queue: Vec<DashboardUpdateQueueItem>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardDto {
    pub summary: DashboardSummary,
    pub skill_spotlight: DashboardSkillSpotlight,
    pub platforms: Vec<DashboardPlatformStats>,
}

#[derive(Serialize)]
pub struct BatchResultDto {
    pub results: Vec<InstallResult>,
    pub success_count: usize,
    pub failure_count: usize,
}

#[derive(Serialize)]
pub struct PromptDiffDto {
    pub has_diff: bool,
    pub diff_text: String,
    pub supports_prompt: bool,
}

#[derive(Deserialize)]
pub struct EditContentRequest {
    pub content: String,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum NpxSkillsCliMode {
    #[default]
    Auto,
    Npx,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct NpxSkillsCliConfigDto {
    #[serde(default)]
    pub agents: Vec<String>,
    #[serde(default)]
    pub cli_mode: NpxSkillsCliMode,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxSkillsOperation {
    Install,
    Remove,
    Check,
    Update,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsInstallItemRequest {
    pub package_ref: String,
    #[serde(default)]
    pub skill_flags: Vec<String>,
    #[serde(default)]
    pub catalog_entry_id: Option<String>,
}

#[derive(Deserialize)]
pub struct NpxSkillsInstallJobRequest {
    pub items: Vec<NpxSkillsInstallItemRequest>,
    #[serde(default)]
    pub install_target: InstallTargetDto,
    #[serde(default)]
    pub config: NpxSkillsCliConfigDto,
}

#[derive(Deserialize)]
pub struct NpxSkillsPackagePreviewRequest {
    pub package_ref: String,
    #[serde(default)]
    pub install_target: InstallTargetDto,
    #[serde(default)]
    pub config: NpxSkillsCliConfigDto,
}

#[derive(Deserialize)]
pub struct NpxSkillsRemoveJobRequest {
    pub item_ids: Vec<String>,
    #[serde(default)]
    pub install_target: InstallTargetDto,
    #[serde(default)]
    pub config: NpxSkillsCliConfigDto,
}

#[derive(Deserialize)]
pub struct NpxSkillsMaintenanceJobRequest {
    #[serde(default)]
    pub install_target: InstallTargetDto,
    #[serde(default)]
    pub config: NpxSkillsCliConfigDto,
}

#[derive(Deserialize)]
pub struct NpxSkillsPackageUpdateJobRequest {
    pub item_ids: Vec<String>,
    #[serde(default)]
    pub install_target: InstallTargetDto,
    #[serde(default)]
    pub config: NpxSkillsCliConfigDto,
}

#[derive(Clone, Debug, Serialize)]
pub struct NpxSkillsCatalogItemDto {
    pub id: String,
    pub name: String,
    pub package_ref: String,
    pub skill_flag: Option<String>,
    pub group_id: String,
    pub group_label: String,
    pub group_order: i32,
    pub category_id: String,
    pub category_slug: String,
    pub category_label: String,
    pub category_order: i32,
    pub tags: Vec<String>,
    pub install_kind: String,
    pub install_provider: String,
    pub description: Option<String>,
    pub stars: Option<u8>,
    pub project_only: bool,
    pub usage: Option<String>,
    pub installed_state: NpxCatalogInstalledStateDto,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub installed_instance_id: Option<String>,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxCatalogInstalledStateDto {
    Installed,
    NotInstalled,
}

#[derive(Clone, Debug, Serialize)]
pub struct NpxSkillsInstalledInventoryDto {
    pub target: ResolvedInstallTargetDto,
    pub capabilities: NpxSkillsCapabilitiesDto,
    pub summary: NpxSkillsInstalledSummaryDto,
    pub groups: Vec<NpxTaxonomyGroupDto>,
    pub filtered_total: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
    pub items: Vec<NpxInstalledSkillInstanceDto>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct NpxTaxonomyCategoryDto {
    pub id: String,
    pub slug: String,
    pub label: String,
    pub count: usize,
    pub group_id: String,
    pub group_order: i32,
    pub category_order: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct NpxTaxonomyGroupDto {
    pub id: String,
    pub label: String,
    pub order: i32,
    pub categories: Vec<NpxTaxonomyCategoryDto>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsCapabilityDto {
    pub supported: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsCapabilitiesDto {
    pub list: NpxSkillsCapabilityDto,
    pub remove: NpxSkillsCapabilityDto,
    pub check: NpxSkillsCapabilityDto,
    pub update: NpxSkillsCapabilityDto,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxSkillsCliVersionStatusDto {
    UpToDate,
    UpdateAvailable,
    Unknown,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsCliVersionDto {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub latest: Option<String>,
    pub status: NpxSkillsCliVersionStatusDto,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub checked_at_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsInstalledSummaryDto {
    pub total: usize,
    pub curated: usize,
    pub manual: usize,
    pub tracked: usize,
    pub update_available: usize,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxInstalledSourceKindDto {
    Curated,
    ManualGithub,
    ManualGit,
    ManualLocal,
    ManualUnknown,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxInstalledSourceDto {
    pub kind: NpxInstalledSourceKindDto,
    #[serde(rename = "ref")]
    pub r#ref: String,
    pub display: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxCatalogMatchDto {
    pub id: String,
    pub name: String,
    pub category_label: String,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxInstalledTrackingKindDto {
    Tracked,
    Untracked,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxInstalledTrackingDto {
    pub kind: NpxInstalledTrackingKindDto,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub installed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxInstalledUpdateKindDto {
    NotChecked,
    UpToDate,
    UpdateAvailable,
    Unsupported,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxInstalledUpdateDto {
    pub kind: NpxInstalledUpdateKindDto,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_checked_at_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxInstalledActionsDto {
    pub removable: bool,
    pub reinstallable: bool,
    pub batch_updatable: bool,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxPackageComparisonStatusDto {
    UpToDate,
    UpdateAvailable,
    NotRecorded,
    Incomparable,
    Unknown,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxInstalledPackageActionsDto {
    pub removable: bool,
    pub reinstallable: bool,
    pub updatable: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxInstalledPackageDto {
    pub id: String,
    pub package_ref: String,
    pub source_ref: String,
    pub source_kind: NpxInstalledSourceKindDto,
    pub installed_skill_names: Vec<String>,
    pub installed_skill_count: usize,
    pub agents: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub remote_version: Option<String>,
    pub comparison_status: NpxPackageComparisonStatusDto,
    pub version_basis: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub checked_at_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub installed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    pub actions: NpxInstalledPackageActionsDto,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsPackagesSummaryDto {
    pub total_packages: usize,
    pub total_skills: usize,
    pub update_available: usize,
    pub incomparable: usize,
    pub not_recorded: usize,
}

#[derive(Clone, Debug, Serialize)]
pub struct NpxSkillsPackagesInventoryDto {
    pub target: ResolvedInstallTargetDto,
    pub capabilities: NpxSkillsCapabilitiesDto,
    pub summary: NpxSkillsPackagesSummaryDto,
    pub filtered_total: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
    pub items: Vec<NpxInstalledPackageDto>,
}

#[derive(Clone, Debug, Serialize)]
pub struct NpxInstalledSkillInstanceDto {
    pub id: String,
    pub name: String,
    pub scope: InstallTargetScopeDto,
    pub agents: Vec<String>,
    pub group_id: String,
    pub group_label: String,
    pub group_order: i32,
    pub category_id: String,
    pub category_slug: String,
    pub category_label: String,
    pub category_order: i32,
    pub tags: Vec<String>,
    pub description: Option<String>,
    pub source: NpxInstalledSourceDto,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub catalog_match: Option<NpxCatalogMatchDto>,
    pub tracking: NpxInstalledTrackingDto,
    pub update: NpxInstalledUpdateDto,
    pub actions: NpxInstalledActionsDto,
}

#[derive(Serialize)]
pub struct NpxSkillsCliResult {
    pub success: bool,
    pub output: String,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NpxSkillsPackagePreviewModeDto {
    ListedSkills,
    PackageOnly,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct NpxSkillsPackagePreviewSkillDto {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NpxSkillsPackagePreviewDto {
    pub package_ref: String,
    pub source_ref: String,
    pub mode: NpxSkillsPackagePreviewModeDto,
    pub skills: Vec<NpxSkillsPackagePreviewSkillDto>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback_reason: Option<String>,
}

#[derive(Serialize)]
pub struct NpxSkillsJobStartDto {
    pub job_id: String,
    pub operation: NpxSkillsOperation,
    pub total: usize,
    pub status: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct ResolvedInstallTargetDto {
    pub scope: InstallTargetScopeDto,
    pub project_path: Option<String>,
    pub base_dir: String,
    pub skills_path: String,
    pub commands_path: Option<String>,
    pub agents_path: Option<String>,
    pub guidance_path: Option<String>,
}

#[derive(Serialize)]
pub struct SimpleSuccess {
    pub success: bool,
}

#[derive(Serialize)]
pub struct PickedFolderDto {
    pub path: Option<String>,
}

// ── Legacy Skill Directory Cleanup ────────────────────────────────

#[derive(Serialize)]
pub struct LegacyDirDto {
    pub platform_id: String,
    pub legacy_path: String,
    pub shared_path: String,
}

#[derive(Deserialize)]
pub struct CleanupRequest {
    pub paths: Vec<String>,
}

#[derive(Serialize)]
pub struct CleanupResultDto {
    pub removed: Vec<String>,
    pub failed: Vec<CleanupFailureDto>,
}

#[derive(Serialize)]
pub struct CleanupFailureDto {
    pub path: String,
    pub error: String,
}
