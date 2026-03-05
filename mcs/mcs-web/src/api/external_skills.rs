use axum::Json;
use axum::extract::State;

use crate::dto::{ApiResponse, ExternalSkillCatalogDto};
use crate::state::AppState;

/// GET /api/external-skills/catalog — list external skills from TOML registry
pub async fn catalog(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<ExternalSkillCatalogDto>>> {
    let entries = state.external_skill_catalog().await;
    Json(ApiResponse::ok(entries))
}
