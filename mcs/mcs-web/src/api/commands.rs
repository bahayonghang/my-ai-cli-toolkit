use axum::Json;
use axum::extract::{Path, Query, State};
use std::path::PathBuf;

use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};
use mcs_core::core::installer::{install_command, uninstall_command};

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, BatchResultDto, DiffDto, InstallRequest, InstallTargetQuery,
    InstallTargetScopeDto, ItemDetailDto, ItemDto, ItemQuery,
};
use crate::state::AppState;

/// GET /api/platforms/:id/commands — list commands with optional filters
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

    let commands = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.commands(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.commands_for_platform_config(&resolved.platform).await
    };
    let filtered: Vec<ItemDto> = commands
        .into_iter()
        .filter(|item| {
            if let Some(ref search) = query.search {
                let s = search.to_lowercase();
                if !item.name.to_lowercase().contains(&s) {
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
        })
        .collect();

    Ok(Json(ApiResponse::ok(filtered)))
}

/// GET /api/platforms/:id/commands/:name — command detail + content
pub async fn detail(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
    Query(query): Query<InstallTargetQuery>,
) -> Result<Json<ApiResponse<ItemDetailDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = query.to_install_target();

    let commands = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.commands(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.commands_for_platform_config(&resolved.platform).await
    };
    let item = commands
        .into_iter()
        .find(|command| command.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Command '{name}' not found")))?;

    let content = read_file_text(item.source_path.clone(), "Failed to read command file").await?;

    Ok(Json(ApiResponse::ok(ItemDetailDto {
        name: item.name,
        item_type: item.item_type,
        description: item.description,
        status: item.status,
        category: item.category,
        tags: item.tags,
        is_default: item.is_default,
        content: Some(content),
        source_path: item.source_path.to_string_lossy().into_owned(),
        target_path: item.target_path.to_string_lossy().into_owned(),
        source_mtime_ms: item.source_mtime_ms,
        target_mtime_ms: item.target_mtime_ms,
    })))
}

/// GET /api/platforms/:id/commands/:name/diff — source vs installed diff
pub async fn diff(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
    Query(query): Query<InstallTargetQuery>,
) -> Result<Json<ApiResponse<DiffDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = query.to_install_target();

    let commands = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.commands(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.commands_for_platform_config(&resolved.platform).await
    };
    let item = commands
        .into_iter()
        .find(|c| c.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Command '{name}' not found")))?;

    if !item.is_installed() {
        return Ok(Json(ApiResponse::ok(DiffDto {
            has_diff: false,
            diff_text: "Not installed".into(),
        })));
    }

    let diff_text =
        build_command_diff_async(item.source_path.clone(), item.target_path.clone()).await?;
    let has_diff = !diff_text.is_empty();

    Ok(Json(ApiResponse::ok(DiffDto {
        has_diff,
        diff_text,
    })))
}

/// POST /api/platforms/:id/commands/install — install commands by names
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

    // 并行安装
    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let root = root.clone();
        let platform = platform.clone();
        set.spawn_blocking(move || install_command(&root, &platform, &name));
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Install task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache after mutation
    if should_invalidate_global {
        state.invalidate_platform(&id).await;
    } else {
        state.invalidate_platform_config(&platform).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

/// POST /api/platforms/:id/commands/uninstall — uninstall commands by names
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
        set.spawn_blocking(move || uninstall_command(&platform, &name));
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Uninstall task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache after mutation
    if should_invalidate_global {
        state.invalidate_platform(&id).await;
    } else {
        state.invalidate_platform_config(&platform).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

fn build_command_diff_text(
    source: &std::path::Path,
    target: &std::path::Path,
) -> Result<String, std::io::Error> {
    let src = std::fs::read_to_string(source)?;
    let tgt = std::fs::read_to_string(target)?;
    let diff = similar::TextDiff::from_lines(&tgt, &src)
        .unified_diff()
        .header("installed", "source")
        .to_string();
    Ok(diff)
}

async fn build_command_diff_async(source: PathBuf, target: PathBuf) -> Result<String, AppError> {
    tokio::task::spawn_blocking(move || build_command_diff_text(&source, &target))
        .await
        .map_err(|e| AppError::Internal(format!("Failed to execute command diff task: {e}")))?
        .map_err(|e| AppError::Internal(format!("Failed to build command diff: {e}")))
}

async fn read_file_text(path: PathBuf, label: &'static str) -> Result<String, AppError> {
    let display = path.display().to_string();
    tokio::task::spawn_blocking(move || std::fs::read_to_string(&path))
        .await
        .map_err(|e| AppError::Internal(format!("{label} ({display}): {e}")))?
        .map_err(|e| AppError::Internal(format!("{label} ({display}): {e}")))
}
