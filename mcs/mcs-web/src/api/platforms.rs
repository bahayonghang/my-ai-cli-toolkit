use axum::Json;
use axum::extract::{Path, State};

use mcs_core::config::platform::platform_displays_owned;

use crate::api::error::AppError;
use crate::dto::{ApiResponse, CategoryDto, SimpleSuccess};
use crate::state::AppState;

/// GET /api/platforms — list all platforms with display info
pub async fn list(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<mcs_core::config::platform::PlatformDisplayOwned>>> {
    let mut displays = platform_displays_owned();
    // Sort by display order (matching the static list order)
    let order: Vec<String> = mcs_core::config::platform::platform_displays()
        .iter()
        .map(|d| d.id.to_string())
        .collect();
    displays.sort_by_key(|d| {
        order
            .iter()
            .position(|id| *id == d.id)
            .unwrap_or(usize::MAX)
    });

    // Mark which platforms are configured
    let platforms = state.platforms().await;
    let displays: Vec<_> = displays
        .into_iter()
        .filter(|d| platforms.contains_key(&d.id))
        .collect();

    Json(ApiResponse::ok(displays))
}

/// POST /api/refresh — force re-scan content and rebuild discovery cache
pub async fn refresh(State(state): State<AppState>) -> Json<ApiResponse<SimpleSuccess>> {
    state.warm_cache().await;
    Json(ApiResponse::ok(SimpleSuccess { success: true }))
}

/// GET /api/platforms/:id — get single platform config
pub async fn get(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<mcs_core::config::platform::PlatformConfig>>, AppError> {
    let platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    Ok(Json(ApiResponse::ok(platform)))
}

/// GET /api/platforms/:id/categories — categories with item counts
pub async fn categories(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<Vec<CategoryDto>>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let commands = state.commands(&id).await;

    let mut skill_cats: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    for item in skills.iter() {
        let cat = item
            .category
            .clone()
            .unwrap_or_else(|| "uncategorized".into());
        *skill_cats.entry(cat).or_default() += 1;
    }

    let mut cmd_cats: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    for item in commands.iter() {
        let cat = item
            .category
            .clone()
            .unwrap_or_else(|| "uncategorized".into());
        *cmd_cats.entry(cat).or_default() += 1;
    }

    let mut result: Vec<CategoryDto> = Vec::new();
    for (name, count) in skill_cats {
        result.push(CategoryDto {
            name,
            count,
            item_type: mcs_core::model::ItemType::Skill,
        });
    }
    for (name, count) in cmd_cats {
        result.push(CategoryDto {
            name,
            count,
            item_type: mcs_core::model::ItemType::Command,
        });
    }

    result.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(Json(ApiResponse::ok(result)))
}
