use axum::Json;
use axum::extract::State;

use mcs_core::core::installer::{install_command, install_skill};
use mcs_core::model::ItemType;

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

    let mut results = Vec::new();
    for platform_name in &body.platform_names {
        let Some(platform) = platforms.get(platform_name) else {
            continue;
        };

        for item_name in &body.items {
            let result = match body.item_type {
                ItemType::Skill => install_skill(&root, platform, item_name),
                ItemType::Command => install_command(&root, platform, item_name),
            };
            results.push(result);
        }
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache for all affected platforms
    state.invalidate_platforms(&body.platform_names).await;

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}
