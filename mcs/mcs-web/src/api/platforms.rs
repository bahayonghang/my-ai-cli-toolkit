use axum::Json;
use axum::extract::{Path, Query, State};

use mcs_core::config::platform::{
    PlatformDisplayOwned, is_universal_shared_skills_platform, platform_displays,
    skills_library_kind, skills_library_platform_ids, universal_shared_skills_display_path,
};
use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, CategoryDto, CategoryQuery, InstallTargetScopeDto, ResolvedInstallTargetDto,
    SimpleSuccess,
};
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
                skills_library_kind: skills_library_kind(display.id),
                skills_library_platform_ids: skills_library_platform_ids(&platforms, display.id),
                commands_path: platform.commands_display_path(),
                agents_path: platform.agents_display_path(),
                guidance_path: platform.guidance_display_path(),
                supports_commands: platform.supports_commands(),
                supports_agents: platform.supports_agents(),
                supports_guidance: platform.supports_guidance(),
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
        // Filter out any platforms that belong to the universal shared group
        // since they are now unified under the "gemini" / "Universal Agents" static card.
        if is_universal_shared_skills_platform(&id) {
            continue;
        }

        if let Some(platform) = platforms.get(&id) {
            let skills_path = platform.skills_display_path();
            displays.push(PlatformDisplayOwned {
                id: id.clone(),
                name: id.clone(),
                icon: "📁".to_string(),
                base_dir: platform.base_dir.clone(),
                skills_path,
                skills_library_kind: skills_library_kind(&id),
                skills_library_platform_ids: skills_library_platform_ids(&platforms, &id),
                commands_path: platform.commands_display_path(),
                agents_path: platform.agents_display_path(),
                guidance_path: platform.guidance_display_path(),
                supports_commands: platform.supports_commands(),
                supports_agents: platform.supports_agents(),
                supports_guidance: platform.supports_guidance(),
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

/// POST /api/platforms/:id/install-target/resolve — validate + normalize install target
pub async fn resolve_install_target(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(install_target): Json<crate::dto::InstallTargetDto>,
) -> Result<Json<ApiResponse<ResolvedInstallTargetDto>>, AppError> {
    let platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;

    let access_mode = if matches!(install_target.scope, InstallTargetScopeDto::Project) {
        InstallTargetAccessMode::Write
    } else {
        InstallTargetAccessMode::Read
    };

    let resolved = resolve_target_platform(&platform, &install_target.to_core(), access_mode)
        .map_err(AppError::BadRequest)?;

    let project_path = resolved
        .normalized_project_path
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned());

    Ok(Json(ApiResponse::ok(ResolvedInstallTargetDto {
        scope: InstallTargetScopeDto::from_core(resolved.scope),
        project_path,
        base_dir: resolved.platform.base_path().to_string_lossy().into_owned(),
        skills_path: resolved
            .platform
            .skills_path()
            .to_string_lossy()
            .into_owned(),
        commands_path: resolved.platform.commands_display_path().map(|_| {
            resolved
                .platform
                .commands_path()
                .to_string_lossy()
                .into_owned()
        }),
        agents_path: resolved.platform.agents_display_path().map(|_| {
            resolved
                .platform
                .agents_path()
                .to_string_lossy()
                .into_owned()
        }),
        guidance_path: resolved
            .platform
            .guidance_path()
            .map(|path| path.to_string_lossy().into_owned()),
    })))
}

/// GET /api/platforms/:id/categories — categories with item counts
pub async fn categories(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<CategoryQuery>,
) -> Result<Json<ApiResponse<Vec<CategoryDto>>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;

    let install_target = query.install_target.to_install_target();
    let wants_skills = query
        .item_type
        .is_none_or(|item_type| item_type == mcs_core::model::ItemType::Skill);
    let wants_commands = query
        .item_type
        .is_none_or(|item_type| item_type == mcs_core::model::ItemType::Command);
    let wants_agents = query
        .item_type
        .is_none_or(|item_type| item_type == mcs_core::model::ItemType::Agent);

    let (skills, commands, agents) =
        if matches!(install_target.scope, InstallTargetScopeDto::Global) {
            let skills = if wants_skills {
                state.skills(&id).await
            } else {
                Vec::new()
            };
            let commands = if wants_commands {
                state.commands(&id).await
            } else {
                Vec::new()
            };
            let agents = if wants_agents {
                state.agents(&id).await
            } else {
                Vec::new()
            };
            (skills, commands, agents)
        } else {
            let resolved = resolve_target_platform(
                &base_platform,
                &install_target.to_core(),
                InstallTargetAccessMode::Read,
            )
            .map_err(AppError::BadRequest)?;
            let skills = if wants_skills {
                state.skills_for_platform_config(&resolved.platform).await
            } else {
                Vec::new()
            };
            let commands = if wants_commands {
                state.commands_for_platform_config(&resolved.platform).await
            } else {
                Vec::new()
            };
            let agents = if wants_agents {
                state.agents_for_platform_config(&resolved.platform).await
            } else {
                Vec::new()
            };
            (skills, commands, agents)
        };

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

    let mut agent_cats: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    for item in agents.iter() {
        let cat = item
            .category
            .clone()
            .unwrap_or_else(|| "uncategorized".into());
        *agent_cats.entry(cat).or_default() += 1;
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
    for (name, count) in agent_cats {
        result.push(CategoryDto {
            name,
            count,
            item_type: mcs_core::model::ItemType::Agent,
        });
    }

    result.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(Json(ApiResponse::ok(result)))
}
