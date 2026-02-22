use axum::Json;
use axum::extract::{Path, Query, State};

use mcs_core::core::installer::{install_command, uninstall_command};

use crate::api::error::AppError;
use crate::dto::{ApiResponse, BatchResultDto, DiffDto, InstallRequest, ItemDto, ItemQuery};
use crate::state::AppState;

/// GET /api/platforms/:id/commands — list commands with optional filters
pub async fn list(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ItemQuery>,
) -> Result<Json<ApiResponse<Vec<ItemDto>>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let commands = state.commands(&id).await;
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
            source_path: item.source_path.to_string_lossy().into_owned(),
            target_path: item.target_path.to_string_lossy().into_owned(),
            source_mtime_ms: item.source_mtime_ms,
            target_mtime_ms: item.target_mtime_ms,
        })
        .collect();

    Ok(Json(ApiResponse::ok(filtered)))
}

/// GET /api/platforms/:id/commands/:name/diff — source vs installed diff
pub async fn diff(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<DiffDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let commands = state.commands(&id).await;
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

    let src = std::fs::read_to_string(&item.source_path).unwrap_or_default();
    let tgt = std::fs::read_to_string(&item.target_path).unwrap_or_default();
    let diff_text = similar::TextDiff::from_lines(&tgt, &src)
        .unified_diff()
        .header("installed", "source")
        .to_string();
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
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }
    let root = state.project_root().await;
    let platform = state.platform(&id).await.unwrap();

    let mut results = Vec::new();
    for name in &body.names {
        results.push(install_command(&root, &platform, name));
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache after mutation
    state.invalidate_platform(&id).await;

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
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }
    let platform = state.platform(&id).await.unwrap();

    let mut results = Vec::new();
    for name in &body.names {
        results.push(uninstall_command(&platform, name));
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache after mutation
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}
