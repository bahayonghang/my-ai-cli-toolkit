use axum::Json;
use axum::extract::{Path, Query, State};
use std::path::PathBuf;
use std::time::Duration;

use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};
use mcs_core::core::installer::{install_skill, uninstall_skill};

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, BatchResultDto, DiffDto, EditContentRequest, ExternalInstallMethod,
    ExternalInstallRequest, ExternalInstallResult, InstallRequest, InstallTargetScopeDto,
    ItemDetailDto, ItemDto, ItemQuery, SimpleSuccess,
};
use crate::state::AppState;

const EXTERNAL_INSTALL_TIMEOUT_SECS: u64 = 120;

/// GET /api/platforms/:id/skills — list skills with optional filters
pub async fn list(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ItemQuery>,
) -> Result<Json<ApiResponse<Vec<ItemDto>>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = query.install_target.to_install_target();

    let skills = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.skills(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.skills_for_platform_config(&resolved.platform).await
    };
    let filtered = filter_items(skills, &query);

    Ok(Json(ApiResponse::ok(filtered)))
}

/// GET /api/platforms/:id/skills/:name — skill detail + SKILL.md content
pub async fn detail(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<ItemDetailDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    let skill_md_path = item.source_path.join("SKILL.md");
    let content = read_file_text(skill_md_path, "Failed to read SKILL.md").await?;

    Ok(Json(ApiResponse::ok(ItemDetailDto {
        name: item.name,
        item_type: item.item_type,
        description: item.description,
        status: item.status,
        category: item.category,
        tags: item.tags,
        is_default: item.is_default,
        content: Some(content),
    })))
}

/// GET /api/platforms/:id/skills/:name/diff — source vs installed diff
pub async fn diff(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<DiffDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    if !item.is_installed() {
        return Ok(Json(ApiResponse::ok(DiffDto {
            has_diff: false,
            diff_text: "Not installed".into(),
        })));
    }

    let diff_text =
        build_skill_diff_async(item.source_path.clone(), item.target_path.clone()).await?;
    let has_diff = !diff_text.is_empty();

    Ok(Json(ApiResponse::ok(DiffDto {
        has_diff,
        diff_text,
    })))
}

/// POST /api/platforms/:id/skills/install — install skills by names
pub async fn install(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<InstallRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    let root = state.project_root().await;
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = body.install_target.clone();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Write,
    )
    .map_err(AppError::BadRequest)?;
    let platform = resolved.platform;
    let should_invalidate_global = matches!(install_target.scope, InstallTargetScopeDto::Global);

    // 并行安装：每个 skill 使用独立的 spawn_blocking 任务
    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let root = root.clone();
        let platform = platform.clone();
        let link_mode = body.link_mode;
        set.spawn_blocking(move || install_skill(&root, &platform, &name, link_mode));
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Install task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache (including platforms sharing the same skills path)
    if should_invalidate_global {
        invalidate_platform_and_shared_skills(&state, &id).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

/// POST /api/platforms/:id/skills/uninstall — uninstall skills by names
pub async fn uninstall(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<InstallRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = body.install_target.clone();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Write,
    )
    .map_err(AppError::BadRequest)?;
    let platform = resolved.platform;
    let should_invalidate_global = matches!(install_target.scope, InstallTargetScopeDto::Global);

    // 并行卸载
    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let platform = platform.clone();
        set.spawn_blocking(move || uninstall_skill(&platform, &name));
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Uninstall task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache (including platforms sharing the same skills path)
    if should_invalidate_global {
        invalidate_platform_and_shared_skills(&state, &id).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

// ── Helper functions ───────────────────────────────────────────────

fn filter_items(items: Vec<mcs_core::model::ItemInfo>, query: &ItemQuery) -> Vec<ItemDto> {
    items
        .into_iter()
        .filter(|item| {
            if let Some(ref search) = query.search {
                let s = search.to_lowercase();
                let name_match = item.name.to_lowercase().contains(&s);
                let desc_match = item
                    .description
                    .as_ref()
                    .is_some_and(|d| d.to_lowercase().contains(&s));
                if !name_match && !desc_match {
                    return false;
                }
            }
            if let Some(ref cat) = query.category
                && item.category.as_deref() != Some(cat.as_str())
            {
                return false;
            }
            if let Some(status) = query.status
                && item.status != status
            {
                return false;
            }
            true
        })
        .map(|item| ItemDto {
            name: item.name,
            item_type: item.item_type,
            description: item.description,
            status: item.status,
            category: item.category,
            tags: item.tags,
            is_default: item.is_default,
            source_path: item.source_path.to_string_lossy().into_owned(),
            target_path: item.target_path.to_string_lossy().into_owned(),
            source_mtime_ms: item.source_mtime_ms,
            target_mtime_ms: item.target_mtime_ms,
        })
        .collect()
}

fn build_skill_diff_text(
    source_dir: &std::path::Path,
    target_dir: &std::path::Path,
) -> Result<String, std::io::Error> {
    use similar::TextDiff;

    let src_skill_md = std::fs::read_to_string(source_dir.join("SKILL.md"))?;
    let tgt_skill_md = std::fs::read_to_string(target_dir.join("SKILL.md"))?;
    let diff = TextDiff::from_lines(&tgt_skill_md, &src_skill_md)
        .unified_diff()
        .header("installed/SKILL.md", "source/SKILL.md")
        .to_string();
    Ok(diff)
}

async fn build_skill_diff_async(
    source_dir: PathBuf,
    target_dir: PathBuf,
) -> Result<String, AppError> {
    tokio::task::spawn_blocking(move || build_skill_diff_text(&source_dir, &target_dir))
        .await
        .map_err(|e| AppError::Internal(format!("Failed to execute diff task: {e}")))?
        .map_err(|e| AppError::Internal(format!("Failed to build skill diff: {e}")))
}

async fn read_file_text(path: PathBuf, label: &'static str) -> Result<String, AppError> {
    let display = path.display().to_string();
    tokio::task::spawn_blocking(move || std::fs::read_to_string(&path))
        .await
        .map_err(|e| AppError::Internal(format!("{label} ({display}): {e}")))?
        .map_err(|e| AppError::Internal(format!("{label} ({display}): {e}")))
}

async fn write_file_text(path: PathBuf, content: String) -> Result<(), AppError> {
    let display = path.display().to_string();
    tokio::task::spawn_blocking(move || std::fs::write(&path, content))
        .await
        .map_err(|e| AppError::Internal(format!("Failed to execute write task: {e}")))?
        .map_err(|e| AppError::Internal(format!("Failed to write file {display}: {e}")))
}

async fn invalidate_platform_and_shared_skills(state: &AppState, platform_id: &str) {
    let related = state.related_platform_ids_by_skills_path(platform_id).await;
    if related.is_empty() {
        state.invalidate_platform(platform_id).await;
        return;
    }
    state.invalidate_platforms(&related).await;
}

/// PUT /api/platforms/:id/skills/:name/content — overwrite SKILL.md content
pub async fn edit_content(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
    Json(body): Json<EditContentRequest>,
) -> Result<Json<ApiResponse<SimpleSuccess>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    let skill_md_path = item.source_path.join("SKILL.md");
    write_file_text(skill_md_path, body.content).await?;

    // Invalidate cache so next request reflects updated content
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(SimpleSuccess { success: true })))
}

/// POST /api/platforms/:id/skills/external-install — install via npx CLI
pub async fn external_install(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<ExternalInstallRequest>,
) -> Result<Json<ApiResponse<ExternalInstallResult>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    if matches!(body.install_target.scope, InstallTargetScopeDto::Project) {
        return Err(AppError::BadRequest(
            "External install is disabled in project install mode".into(),
        ));
    }

    let args: Vec<String> = match body.method {
        ExternalInstallMethod::Vercel => {
            vec![
                "skills".to_string(),
                "add".to_string(),
                body.skill_name.clone(),
            ]
        }
        ExternalInstallMethod::Playbooks => {
            vec![
                "playbooks".to_string(),
                "add".to_string(),
                "skill".to_string(),
                body.skill_name.clone(),
            ]
        }
    };

    let mut command = tokio::process::Command::new("npx");
    command.args(&args);
    command.kill_on_drop(true);

    let output = tokio::time::timeout(
        Duration::from_secs(EXTERNAL_INSTALL_TIMEOUT_SECS),
        command.output(),
    )
    .await
    .map_err(|_| {
        AppError::Internal(format!(
            "External install timed out after {EXTERNAL_INSTALL_TIMEOUT_SECS}s"
        ))
    })?
    .map_err(|e| AppError::Internal(format!("Failed to execute npx: {e}")))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let combined = if stderr.is_empty() {
        stdout
    } else {
        format!("{stdout}\n{stderr}")
    };
    let success = output.status.success();

    if success {
        invalidate_platform_and_shared_skills(&state, &id).await;
    }

    Ok(Json(ApiResponse::ok(ExternalInstallResult {
        success,
        output: combined,
    })))
}
