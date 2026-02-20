use axum::Json;
use axum::extract::{Path, State};

use mcs_core::core::prompt;
use mcs_core::model::InstallResult;

use crate::api::error::AppError;
use crate::dto::{ApiResponse, PromptDiffDto};
use crate::state::AppState;

/// GET /api/platforms/:id/prompt/diff — CLAUDE.md diff
pub async fn diff(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<PromptDiffDto>>, AppError> {
    let platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let root = state.project_root().await;

    let supports = prompt::supports_prompt(&platform);
    if !supports {
        return Ok(Json(ApiResponse::ok(PromptDiffDto {
            has_diff: false,
            diff_text: String::new(),
            supports_prompt: false,
        })));
    }

    let (has_diff, diff_text) = prompt::prompt_diff(&root, &platform);

    Ok(Json(ApiResponse::ok(PromptDiffDto {
        has_diff,
        diff_text,
        supports_prompt: true,
    })))
}

/// POST /api/platforms/:id/prompt/update — update CLAUDE.md
pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<InstallResult>>, AppError> {
    let platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let root = state.project_root().await;

    let result = prompt::prompt_update(&root, &platform);
    Ok(Json(ApiResponse::ok(result)))
}
