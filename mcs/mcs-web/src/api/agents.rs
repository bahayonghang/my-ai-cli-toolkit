use axum::Json;
use axum::extract::{Path, Query, State};
use std::path::PathBuf;
use std::time::Instant;

use mcs_core::activity::{
    ActivityOperation, ActivityRun, ActivitySurface, append_run, generate_run_id,
};
use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};
use mcs_core::core::installer::{install_agent, uninstall_agent};
use mcs_core::model::ItemType;

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, BatchResultDto, DiffDto, EditContentRequest, InstallRequest, InstallTargetQuery,
    InstallTargetScopeDto, ItemDetailDto, ItemDto, ItemQuery, SimpleSuccess,
};
use crate::services::activity_log::{
    activity_status_from_counts, current_time_ms, install_target_to_activity, item_path_lookup,
    local_activity_items,
};
use crate::state::AppState;

/// GET /api/platforms/:id/agents — list agents with optional filters
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

    let agents = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.agents(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.agents_for_platform_config(&resolved.platform).await
    };
    let filtered = filter_items(agents, &query);

    Ok(Json(ApiResponse::ok(filtered)))
}

/// GET /api/platforms/:id/agents/:name — agent detail + content
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

    let agents = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.agents(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.agents_for_platform_config(&resolved.platform).await
    };
    let item = agents
        .into_iter()
        .find(|agent| agent.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Agent '{name}' not found")))?;

    let content = read_file_text(item.source_path.clone(), "Failed to read agent file").await?;

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

/// GET /api/platforms/:id/agents/:name/diff — source vs installed diff
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

    let agents = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.agents(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.agents_for_platform_config(&resolved.platform).await
    };
    let item = agents
        .into_iter()
        .find(|agent| agent.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Agent '{name}' not found")))?;

    if !item.is_installed() {
        return Ok(Json(ApiResponse::ok(DiffDto {
            has_diff: false,
            diff_text: "Not installed".into(),
        })));
    }

    let diff_text =
        build_agent_diff_async(item.source_path.clone(), item.target_path.clone()).await?;
    let has_diff = !diff_text.is_empty();

    Ok(Json(ApiResponse::ok(DiffDto {
        has_diff,
        diff_text,
    })))
}

/// POST /api/platforms/:id/agents/install — install agents by names
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
    let started_at_ms = current_time_ms();
    let activity_run_id = generate_run_id("local-agent-install");
    let path_lookup = item_path_lookup(state.agents_for_platform_config(&platform).await);

    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let root = root.clone();
        let platform = platform.clone();
        set.spawn_blocking(move || {
            let started = Instant::now();
            let result = install_agent(&root, &platform, &name);
            (result, started.elapsed().as_millis() as u64)
        });
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Install task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|(r, _)| r.success).count();
    let failure_count = results.len() - success_count;
    let completed_at_ms = current_time_ms();
    let items = local_activity_items(ItemType::Agent, &results, &path_lookup);
    let mut persisted_run_id = Some(activity_run_id.clone());
    if let Err(error) = append_run(&ActivityRun {
        run_id: activity_run_id,
        surface: ActivitySurface::Local,
        operation: ActivityOperation::Install,
        status: activity_status_from_counts(success_count, failure_count),
        platform_id: id.clone(),
        platform_name: base_platform.name.clone(),
        install_target: install_target_to_activity(&install_target),
        started_at_ms,
        completed_at_ms,
        duration_ms: completed_at_ms.saturating_sub(started_at_ms),
        item_count: items.len(),
        success_count,
        failure_count,
        run_config: None,
        items,
    }) {
        tracing::warn!(
            platform = id.as_str(),
            error = %error,
            "Failed to persist local agent install activity log"
        );
        persisted_run_id = None;
    }

    if should_invalidate_global {
        state.invalidate_platform(&id).await;
    } else {
        state.invalidate_platform_config(&platform).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results: results.into_iter().map(|(result, _)| result).collect(),
        success_count,
        failure_count,
        run_id: persisted_run_id,
    })))
}

/// POST /api/platforms/:id/agents/uninstall — uninstall agents by names
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
    let started_at_ms = current_time_ms();
    let activity_run_id = generate_run_id("local-agent-uninstall");
    let path_lookup = item_path_lookup(state.agents_for_platform_config(&platform).await);

    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let platform = platform.clone();
        set.spawn_blocking(move || {
            let started = Instant::now();
            let result = uninstall_agent(&platform, &name);
            (result, started.elapsed().as_millis() as u64)
        });
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Uninstall task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|(r, _)| r.success).count();
    let failure_count = results.len() - success_count;
    let completed_at_ms = current_time_ms();
    let items = local_activity_items(ItemType::Agent, &results, &path_lookup);
    let mut persisted_run_id = Some(activity_run_id.clone());
    if let Err(error) = append_run(&ActivityRun {
        run_id: activity_run_id,
        surface: ActivitySurface::Local,
        operation: ActivityOperation::Uninstall,
        status: activity_status_from_counts(success_count, failure_count),
        platform_id: id.clone(),
        platform_name: base_platform.name.clone(),
        install_target: install_target_to_activity(&install_target),
        started_at_ms,
        completed_at_ms,
        duration_ms: completed_at_ms.saturating_sub(started_at_ms),
        item_count: items.len(),
        success_count,
        failure_count,
        run_config: None,
        items,
    }) {
        tracing::warn!(
            platform = id.as_str(),
            error = %error,
            "Failed to persist local agent uninstall activity log"
        );
        persisted_run_id = None;
    }

    if should_invalidate_global {
        state.invalidate_platform(&id).await;
    } else {
        state.invalidate_platform_config(&platform).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results: results.into_iter().map(|(result, _)| result).collect(),
        success_count,
        failure_count,
        run_id: persisted_run_id,
    })))
}

/// PUT /api/platforms/:id/agents/:name/content — overwrite agent content
pub async fn edit_content(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
    Json(body): Json<EditContentRequest>,
) -> Result<Json<ApiResponse<SimpleSuccess>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let agents = state.agents(&id).await;
    let item = agents
        .into_iter()
        .find(|agent| agent.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Agent '{name}' not found")))?;

    write_file_text(item.source_path.clone(), body.content).await?;
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(SimpleSuccess { success: true })))
}

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
        })
        .collect()
}

fn build_agent_diff_text(
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

async fn build_agent_diff_async(source: PathBuf, target: PathBuf) -> Result<String, AppError> {
    tokio::task::spawn_blocking(move || build_agent_diff_text(&source, &target))
        .await
        .map_err(|e| AppError::Internal(format!("Failed to execute agent diff task: {e}")))?
        .map_err(|e| AppError::Internal(format!("Failed to build agent diff: {e}")))
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
