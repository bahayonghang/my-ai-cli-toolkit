use std::convert::Infallible;
use std::time::Duration;

use axum::Json;
use axum::extract::{Query, State};
use axum::response::sse::{Event, KeepAlive, Sse};
use serde::Deserialize;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::{Stream, StreamExt};

use mcs_core::activity::{
    ActivityEvent, ActivityOperation, ActivityRunQuery, ActivityStatus, ActivitySurface,
    ActivityTargetScope, query_runs,
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

#[derive(Debug, Clone, Default, Deserialize)]
pub struct ActivityLiveQuery {
    pub platform_id: Option<String>,
    pub surface: Option<ActivitySurface>,
    pub operation: Option<ActivityOperation>,
    pub run_id: Option<String>,
}

fn event_matches_filter(event: &ActivityEvent, filter: &ActivityLiveQuery) -> bool {
    if let Some(ref platform_id) = filter.platform_id
        && event.platform_id.as_deref() != Some(platform_id.as_str())
    {
        return false;
    }
    if let Some(surface) = filter.surface
        && event.surface != surface
    {
        return false;
    }
    if let Some(operation) = filter.operation
        && event.operation != Some(operation)
    {
        return false;
    }
    if let Some(ref run_id) = filter.run_id
        && event.run_id != *run_id
    {
        return false;
    }
    true
}

pub async fn live(
    State(state): State<AppState>,
    Query(filter): Query<ActivityLiveQuery>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let receiver = state.subscribe_activity_events();
    let stream = BroadcastStream::new(receiver).filter_map(move |item| match item {
        Ok(event) => {
            if !event_matches_filter(&event, &filter) {
                return None;
            }
            match serde_json::to_string(&event) {
                Ok(data) => Some(Ok(Event::default().event("activity_event").data(data))),
                Err(error) => {
                    tracing::warn!(
                        run_id = event.run_id.as_str(),
                        error = %error,
                        "Failed to serialize activity event for SSE"
                    );
                    None
                }
            }
        }
        Err(error) => {
            tracing::warn!(error = %error, "Activity live stream lagged or closed");
            None
        }
    });

    Sse::new(stream).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    )
}
