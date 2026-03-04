use axum::Json;
use axum::extract::State;
use serde_json::json;
use std::collections::{HashMap, HashSet};
use std::path::Path;

use mcs_core::config::platform::PlatformConfig;
use mcs_core::core::installer::{install_command, install_skill};
use mcs_core::model::{InstallResult, ItemType, LinkMode};

use crate::api::error::AppError;
use crate::dto::{ApiResponse, BatchResultDto, MultiSyncRequest};
use crate::state::AppState;

/// POST /api/sync — install items across multiple platforms
pub async fn multi_sync(
    State(state): State<AppState>,
    Json(body): Json<MultiSyncRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    let root = state.project_root().await;
    let platforms = state.platforms().await;
    let invalid_platforms = collect_invalid_platforms(&body.platform_names, &platforms);
    if !invalid_platforms.is_empty() {
        return Err(AppError::BadRequestWithDetails {
            message: "One or more platform ids are invalid".into(),
            details: json!({ "invalid_platforms": invalid_platforms }),
        });
    }

    let mut results = Vec::new();
    let mut dedupe_cache: HashMap<String, CachedSkillInstall> = HashMap::new();
    for platform_name in &body.platform_names {
        let platform = platforms
            .get(platform_name)
            .ok_or_else(|| AppError::NotFound(format!("Platform '{platform_name}' not found")))?;

        for item_name in &body.items {
            let result = match body.item_type {
                ItemType::Skill => {
                    let key = skill_target_key(platform, item_name);
                    if let Some(cached) = dedupe_cache.get(&key) {
                        cached.reused_result(item_name, platform_name)
                    } else {
                        let installed = install_skill(&root, platform, item_name, LinkMode::Auto);
                        dedupe_cache.insert(
                            key,
                            CachedSkillInstall {
                                source_platform: platform_name.clone(),
                                result: installed.clone(),
                            },
                        );
                        installed
                    }
                }
                ItemType::Command => install_command(&root, platform, item_name),
            };
            results.push(result);
        }
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache for all affected platforms.
    let invalidate_ids = if body.item_type == ItemType::Skill {
        state
            .related_platform_ids_for_platforms_by_skills_path(&body.platform_names)
            .await
    } else {
        body.platform_names.clone()
    };
    state.invalidate_platforms(&invalidate_ids).await;

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

#[derive(Clone)]
struct CachedSkillInstall {
    source_platform: String,
    result: InstallResult,
}

impl CachedSkillInstall {
    fn reused_result(&self, item_name: &str, target_platform: &str) -> InstallResult {
        InstallResult {
            success: self.result.success,
            item_name: item_name.to_string(),
            message: format!(
                "Reused shared-path result for {target_platform} (source: {}): {}",
                self.source_platform, self.result.message
            ),
            error: self.result.error.clone(),
        }
    }
}

fn skill_target_key(platform: &PlatformConfig, item_name: &str) -> String {
    let item_path = std::path::PathBuf::from(item_name.replace('/', std::path::MAIN_SEPARATOR_STR));
    let target = platform.skills_path().join(item_path);
    normalize_path_key(&target)
}

fn normalize_path_key(path: &Path) -> String {
    let normalized = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let raw = normalized.to_string_lossy().replace('\\', "/");
    if cfg!(windows) {
        raw.to_lowercase()
    } else {
        raw
    }
}

fn collect_invalid_platforms(
    requested: &[String],
    platforms: &std::collections::HashMap<String, mcs_core::config::platform::PlatformConfig>,
) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut invalid = Vec::new();
    for platform_id in requested {
        if platforms.contains_key(platform_id) {
            continue;
        }
        if seen.insert(platform_id.clone()) {
            invalid.push(platform_id.clone());
        }
    }
    invalid
}

#[cfg(test)]
mod tests {
    use super::collect_invalid_platforms;
    use mcs_core::config::platform::default_platforms;

    #[test]
    fn collect_invalid_platforms_deduplicates_and_keeps_order() {
        let platforms = default_platforms();
        let requested = vec![
            "claude".to_string(),
            "invalid".to_string(),
            "invalid".to_string(),
            "missing".to_string(),
        ];
        let invalid = collect_invalid_platforms(&requested, &platforms);
        assert_eq!(invalid, vec!["invalid".to_string(), "missing".to_string()]);
    }
}
