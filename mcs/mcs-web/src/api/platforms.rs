use axum::Json;
use axum::extract::{Path, State};

use mcs_core::config::platform::{
    PlatformDisplayOwned, is_universal_shared_skills_platform, platform_displays,
    universal_shared_skills_display_path,
};

use crate::api::error::AppError;
use crate::dto::{ApiResponse, CategoryDto, SimpleSuccess};
use crate::state::AppState;

/// GET /api/platforms — list all platforms with display info
pub async fn list(State(state): State<AppState>) -> Json<ApiResponse<Vec<PlatformDisplayOwned>>> {
    let platforms = state.platforms().await;
    let mut displays: Vec<PlatformDisplayOwned> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for display in platform_displays() {
        if let Some(platform) = platforms.get(display.id) {
            let skills_path = if is_universal_shared_skills_platform(display.id) {
                universal_shared_skills_display_path().to_string()
            } else {
                platform.skills_display_path()
            };
            displays.push(PlatformDisplayOwned {
                id: display.id.to_string(),
                name: display.name.to_string(),
                icon: display.icon.to_string(),
                base_dir: platform.base_dir.clone(),
                skills_path,
            });
            seen.insert(display.id.to_string());
        }
    }

    // Include dynamically configured platforms not in the static display table.
    let mut dynamic_ids: Vec<String> = platforms.keys().cloned().collect();
    dynamic_ids.sort();
    for id in dynamic_ids {
        if seen.contains(&id) {
            continue;
        }
        if let Some(platform) = platforms.get(&id) {
            let skills_path = if is_universal_shared_skills_platform(&id) {
                universal_shared_skills_display_path().to_string()
            } else {
                platform.skills_display_path()
            };
            displays.push(PlatformDisplayOwned {
                id: id.clone(),
                name: id.clone(),
                icon: "📁".to_string(),
                base_dir: platform.base_dir.clone(),
                skills_path,
            });
        }
    }

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
