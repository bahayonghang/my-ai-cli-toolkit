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

#[derive(Debug, Clone, Copy, Default, Deserialize, Serialize, PartialEq, Eq)]
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
    pub source_path: String,
    pub target_path: String,
    pub source_mtime_ms: Option<u64>,
    pub target_mtime_ms: Option<u64>,
}

#[derive(Serialize)]
pub struct SkillCatalogDto {
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub is_default: bool,
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
pub struct DashboardDto {
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

#[derive(Deserialize)]
pub struct ExternalInstallRequest {
    pub skill_name: String,
    pub method: ExternalInstallMethod,
    #[serde(default)]
    pub install_target: InstallTargetDto,
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExternalInstallMethod {
    Vercel,
    Playbooks,
}

#[derive(Serialize)]
pub struct ExternalInstallResult {
    pub success: bool,
    pub output: String,
}

#[derive(Serialize)]
pub struct ResolvedInstallTargetDto {
    pub scope: InstallTargetScopeDto,
    pub project_path: Option<String>,
    pub base_dir: String,
    pub skills_path: String,
    pub commands_path: String,
}

#[derive(Serialize)]
pub struct SimpleSuccess {
    pub success: bool,
}
