use axum::Json;
use axum::extract::{Query, State};
use serde::Deserialize;

use mcs_core::activity::{
    ActivityOperation, ActivityRunQuery, ActivityStatus, ActivitySurface, ActivityTargetScope,
    query_runs,
};
use mcs_core::model::ItemType;

use crate::api::error::AppError;
use crate::dto::{ActivityRunsPageDto, ApiResponse};
use crate::state::AppState;

#[derive(Debug, Clone, Default, Deserialize)]
pub struct ActivityRunsQuery {
    pub run_id: Option<String>,
    pub platform_id: Option<String>,
    pub surface: Option<ActivitySurface>,
    pub operation: Option<ActivityOperation>,
    pub item_type: Option<ItemType>,
    pub status: Option<ActivityStatus>,
    pub target_scope: Option<ActivityTargetScope>,
    pub search: Option<String>,
    pub page: Option<usize>,
    pub page_size: Option<usize>,
}

pub async fn runs(
    State(_state): State<AppState>,
    Query(query): Query<ActivityRunsQuery>,
) -> Result<Json<ApiResponse<ActivityRunsPageDto>>, AppError> {
    let result = query_runs(&ActivityRunQuery {
        run_id: query.run_id,
        platform_id: query.platform_id,
        surface: query.surface,
        operation: query.operation,
        item_type: query.item_type,
        status: query.status,
        target_scope: query.target_scope,
        search: query.search,
        page: query.page,
        page_size: query.page_size,
    })
    .map_err(|error| AppError::Internal(error.to_string()))?;

    Ok(Json(ApiResponse::ok(result)))
}
