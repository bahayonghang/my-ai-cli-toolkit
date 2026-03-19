use axum::Json;
use axum::extract::State;
use serde_json::json;
use std::collections::{HashMap, HashSet};
use std::path::Path;

use mcs_core::config::platform::PlatformConfig;
use mcs_core::core::installer::{install_agent, install_command, install_skill};
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

    // 第一阶段：收集去重后的实际安装任务和复用映射
    // (index, platform_name, item_name) → 需实际执行安装的任务
    // (index) → 复用某个已安装结果的任务
    struct InstallTask {
        index: usize,
        platform: PlatformConfig,
        item_name: String,
    }
    struct ReusedTask {
        index: usize,
        item_name: String,
        platform_name: String,
        source_index: usize,
    }

    let mut install_tasks: Vec<InstallTask> = Vec::new();
    let mut reused_tasks: Vec<ReusedTask> = Vec::new();
    // skill 去重：相同 target_key 只安装一次
    let mut dedupe_map: HashMap<String, usize> = HashMap::new();
    let total_count = body.platform_names.len() * body.items.len();
    let mut result_index = 0;

    for platform_name in &body.platform_names {
        let platform = platforms
            .get(platform_name)
            .ok_or_else(|| AppError::NotFound(format!("Platform '{platform_name}' not found")))?;

        for item_name in &body.items {
            match body.item_type {
                ItemType::Skill => {
                    let key = skill_target_key(platform, item_name);
                    if let Some(&source_idx) = dedupe_map.get(&key) {
                        reused_tasks.push(ReusedTask {
                            index: result_index,
                            item_name: item_name.clone(),
                            platform_name: platform_name.clone(),
                            source_index: source_idx,
                        });
                    } else {
                        dedupe_map.insert(key, result_index);
                        install_tasks.push(InstallTask {
                            index: result_index,
                            platform: platform.clone(),
                            item_name: item_name.clone(),
                        });
                    }
                }
                ItemType::Command => {
                    install_tasks.push(InstallTask {
                        index: result_index,
                        platform: platform.clone(),
                        item_name: item_name.clone(),
                    });
                }
                ItemType::Agent => {
                    install_tasks.push(InstallTask {
                        index: result_index,
                        platform: platform.clone(),
                        item_name: item_name.clone(),
                    });
                }
            }
            result_index += 1;
        }
    }

    // 第二阶段：并行执行所有实际安装任务
    let item_type = body.item_type;
    let mut set = tokio::task::JoinSet::new();
    for task in install_tasks {
        let root = root.clone();
        set.spawn_blocking(move || {
            let result = match item_type {
                ItemType::Skill => {
                    install_skill(&root, &task.platform, &task.item_name, LinkMode::Auto)
                }
                ItemType::Command => install_command(&root, &task.platform, &task.item_name),
                ItemType::Agent => install_agent(&root, &task.platform, &task.item_name),
            };
            (task.index, result)
        });
    }

    // 收集并行执行的结果
    let mut results: Vec<Option<InstallResult>> = vec![None; total_count];
    while let Some(res) = set.join_next().await {
        let (idx, install_result) =
            res.map_err(|e| AppError::Internal(format!("Sync task failed: {e}")))?;
        results[idx] = Some(install_result);
    }

    // 第三阶段：填充复用结果
    for reused in &reused_tasks {
        if let Some(source_result) = results[reused.source_index].as_ref() {
            let cached = CachedSkillInstall {
                source_platform: String::new(), // 不需要 source_platform 因为下面直接用了
                result: source_result.clone(),
            };
            results[reused.index] =
                Some(cached.reused_result(&reused.item_name, &reused.platform_name));
        }
    }

    let results: Vec<InstallResult> = results.into_iter().flatten().collect();
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
