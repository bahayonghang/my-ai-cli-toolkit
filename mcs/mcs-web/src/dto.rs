use serde::{Deserialize, Serialize};
use serde_json::Value;

use mcs_core::model::{InstallResult, InstallStatus, ItemType};

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
pub struct SimpleSuccess {
    pub success: bool,
}
