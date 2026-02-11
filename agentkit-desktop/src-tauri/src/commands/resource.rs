//! Resource management commands

use super::AppState;
use crate::error::CommandError;
use crate::manager::{CommandManager, SkillManager};
use crate::models::{LinkMode, Platform, ResourceItem, SyncResult};
use crate::repository::ResourceRepository;
use crate::sync::SyncEngine;
use tauri::State;
use tracing::{debug, error, info, warn};

/// Get all resources (skills, commands, agents)
#[tauri::command]
pub fn get_resources(state: State<AppState>) -> Result<Vec<ResourceItem>, CommandError> {
    debug!("Getting all resources");
    let db = state.db.lock()?;
    let repo = ResourceRepository::new(db.conn());

    if let Ok(resources) = repo.get_all() {
        if !resources.is_empty() {
            info!(count = resources.len(), "Retrieved resources from database");
            return Ok(resources);
        }
    }

    drop(db);
    debug!("Database empty, discovering from filesystem");

    let mut resources = Vec::new();

    let skill_manager = SkillManager::new(state.skills_source.clone());
    if let Ok(skills) = skill_manager.discover() {
        debug!(count = skills.len(), "Discovered skills");
        resources.extend(skills);
    }

    let command_manager = CommandManager::new(state.commands_source.clone());
    if let Ok(commands) = command_manager.discover() {
        debug!(count = commands.len(), "Discovered commands");
        resources.extend(commands);
    }

    // Persist discovered resources so subsequent calls hit the DB cache
    if !resources.is_empty() {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());
        for resource in &resources {
            if let Err(e) = repo.insert(resource) {
                warn!(id = %resource.id, error = %e, "Failed to persist discovered resource");
            }
        }
        debug!(
            count = resources.len(),
            "Persisted discovered resources to database"
        );
    }

    info!(count = resources.len(), "Total resources discovered");
    Ok(resources)
}

/// Get a resource by ID
#[tauri::command]
pub fn get_resource_by_id(
    state: State<AppState>,
    id: String,
) -> Result<Option<ResourceItem>, CommandError> {
    debug!(id = %id, "Getting resource by ID");
    let db = state.db.lock()?;
    let repo = ResourceRepository::new(db.conn());

    match repo.get_by_id(&id) {
        Ok(resource) => {
            if resource.is_some() {
                debug!(id = %id, "Resource found");
            } else {
                debug!(id = %id, "Resource not found");
            }
            Ok(resource)
        }
        Err(e) => {
            warn!(id = %id, error = %e, "Failed to get resource");
            Ok(None)
        }
    }
}

/// Install a resource to specified platforms
#[tauri::command]
pub async fn install_resource(
    state: State<'_, AppState>,
    id: String,
    platforms: Vec<Platform>,
) -> Result<Vec<SyncResult>, CommandError> {
    info!(id = %id, platforms = ?platforms, "Installing resource");

    let resource = {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id)?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            debug!(id = %id, "Resource not in database, discovering from filesystem");
            let skill_manager = SkillManager::new(state.skills_source.clone());
            let skills = skill_manager.discover().map_err(|e| {
                error!(error = %e, "Failed to discover skills");
                CommandError::Io(e.to_string())
            })?;

            skills.into_iter().find(|s| s.id == id).ok_or_else(|| {
                error!(id = %id, "Resource not found");
                CommandError::NotFound {
                    entity: "Resource",
                    id: id.clone(),
                }
            })?
        }
    };

    let sync_engine = SyncEngine::new(LinkMode::default());

    let results = match resource.resource_type {
        crate::models::ResourceType::Skill => {
            debug!(id = %id, "Installing as skill");
            let manager = SkillManager::new(state.skills_source.clone());
            manager
                .install(&resource, &platforms, &sync_engine)
                .map_err(|e| {
                    error!(id = %id, error = %e, "Skill installation failed");
                    CommandError::Io(e.to_string())
                })?
        }
        crate::models::ResourceType::Command => {
            debug!(id = %id, "Installing as command");
            let manager = CommandManager::new(state.commands_source.clone());
            manager
                .install(&resource, &platforms, &sync_engine)
                .map_err(|e| {
                    error!(id = %id, error = %e, "Command installation failed");
                    CommandError::Io(e.to_string())
                })?
        }
        crate::models::ResourceType::Agent => {
            warn!(id = %id, "Agent installation not yet implemented");
            platforms
                .iter()
                .map(|p| SyncResult {
                    success: false,
                    platform: *p,
                    resource_id: id.clone(),
                    error: Some("Agent installation not yet implemented".to_string()),
                })
                .collect()
        }
    };

    {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());

        for result in &results {
            if result.success {
                debug!(id = %result.resource_id, platform = ?result.platform, "Updating platform status to synced");
                if let Err(e) = repo.update_platform_status(
                    &result.resource_id,
                    result.platform,
                    crate::models::SyncStatus::Synced,
                    None,
                ) {
                    warn!(error = %e, "Failed to update platform status");
                }
            }
        }
    }

    let success_count = results.iter().filter(|r| r.success).count();
    info!(id = %id, success_count, total = results.len(), "Resource installation completed");
    Ok(results)
}

/// Uninstall a resource from specified platforms
#[tauri::command]
pub async fn uninstall_resource(
    state: State<'_, AppState>,
    id: String,
    platforms: Vec<Platform>,
) -> Result<(), CommandError> {
    info!(id = %id, platforms = ?platforms, "Uninstalling resource");
    let sync_engine = SyncEngine::new(LinkMode::default());

    let resource = {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id)?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            error!(id = %id, "Resource not found for uninstall");
            return Err(CommandError::NotFound {
                entity: "Resource",
                id,
            });
        }
    };

    match resource.resource_type {
        crate::models::ResourceType::Skill => {
            debug!(id = %id, "Uninstalling skill");
            let manager = SkillManager::new(state.skills_source.clone());
            manager
                .uninstall(&resource, &platforms, &sync_engine)
                .map_err(|e| {
                    error!(id = %id, error = %e, "Skill uninstall failed");
                    CommandError::Io(e.to_string())
                })?;
        }
        _ => {
            warn!(id = %id, resource_type = ?resource.resource_type, "Uninstall not implemented for this resource type");
            return Err(CommandError::NotImplemented(
                "Uninstall not implemented for this resource type".to_string(),
            ));
        }
    }

    {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());

        for platform in &platforms {
            debug!(id = %id, platform = ?platform, "Updating platform status to not installed");
            if let Err(e) = repo.update_platform_status(
                &id,
                *platform,
                crate::models::SyncStatus::NotInstalled,
                None,
            ) {
                warn!(error = %e, "Failed to update platform status");
            }
        }
    }

    info!(id = %id, "Resource uninstalled successfully");
    Ok(())
}

/// Update a resource (atomic: install to temp, then swap)
#[tauri::command]
pub async fn update_resource(state: State<'_, AppState>, id: String) -> Result<bool, CommandError> {
    info!(id = %id, "Updating resource");
    let resource = {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id)?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            error!(id = %id, "Resource not found for update");
            return Err(CommandError::NotFound {
                entity: "Resource",
                id,
            });
        }
    };

    let installed_platforms: Vec<Platform> = resource
        .platform_status
        .iter()
        .filter(|(_, status)| **status == crate::models::SyncStatus::Synced)
        .map(|(platform, _)| *platform)
        .collect();

    if installed_platforms.is_empty() {
        debug!(id = %id, "No installed platforms found, skipping update");
        return Ok(false);
    }

    debug!(id = %id, platforms = ?installed_platforms, "Re-installing to update");
    let sync_engine = SyncEngine::new(LinkMode::default());

    let source_path = match &resource.source {
        crate::models::ResourceSource::Local { path } => path.clone(),
        _ => {
            return Err(CommandError::NotImplemented(
                "Only local resources can be updated".to_string(),
            ))
        }
    };

    match resource.resource_type {
        crate::models::ResourceType::Skill => {
            for platform in &installed_platforms {
                let target_base = match crate::platform::get_skills_path(*platform) {
                    Some(p) => p,
                    None => continue,
                };
                let target_path = target_base.join(&resource.id);
                let temp_path = target_base.join(format!(".{}.tmp", &resource.id));

                // Atomic update: sync to temp, remove old, rename temp
                if sync_engine.sync(&source_path, &temp_path, None).is_ok() {
                    let _ = sync_engine.remove(&target_path);
                    if let Err(e) = std::fs::rename(&temp_path, &target_path) {
                        warn!(id = %id, error = %e, "Rename failed, cleaning up temp");
                        let _ = sync_engine.remove(&temp_path);
                    }
                } else {
                    // Fallback: direct uninstall + reinstall
                    warn!(id = %id, "Temp install failed, falling back to direct reinstall");
                    let _ = sync_engine.remove(&target_path);
                    let _ = sync_engine.sync(&source_path, &target_path, None);
                }
            }
        }
        _ => {
            warn!(id = %id, resource_type = ?resource.resource_type, "Update not implemented for this resource type");
            return Err(CommandError::NotImplemented(
                "Update not implemented for this resource type".to_string(),
            ));
        }
    }

    info!(id = %id, "Resource updated successfully");
    Ok(true)
}

/// Sync a resource to a specific platform
#[tauri::command]
pub async fn sync_resource(
    state: State<'_, AppState>,
    id: String,
    platform: Platform,
    force: bool,
) -> Result<SyncResult, CommandError> {
    info!(id = %id, platform = ?platform, force, "Syncing resource to platform");

    if force {
        // Remove existing target before re-sync
        let sync_engine = SyncEngine::new(LinkMode::default());
        if let Some(target_base) = crate::platform::get_skills_path(platform) {
            let target_path = target_base.join(&id);
            let _ = sync_engine.remove(&target_path);
        }
    }

    let results = install_resource(state, id.clone(), vec![platform]).await?;

    results.into_iter().next().ok_or_else(|| {
        error!(id = %id, "No sync result returned");
        CommandError::Io("No sync result returned".to_string())
    })
}

/// Refresh resources by re-scanning the filesystem
#[tauri::command]
pub fn refresh_resources(state: State<AppState>) -> Result<Vec<ResourceItem>, CommandError> {
    info!("Refreshing resources from filesystem");
    let mut resources = Vec::new();

    let skill_manager = SkillManager::new(state.skills_source.clone());
    if let Ok(skills) = skill_manager.discover() {
        debug!(count = skills.len(), "Discovered skills");
        resources.extend(skills);
    }

    let command_manager = CommandManager::new(state.commands_source.clone());
    if let Ok(commands) = command_manager.discover() {
        debug!(count = commands.len(), "Discovered commands");
        resources.extend(commands);
    }

    {
        let db = state.db.lock()?;
        let repo = ResourceRepository::new(db.conn());

        for resource in &resources {
            if let Err(e) = repo.insert(resource) {
                warn!(id = %resource.id, error = %e, "Failed to insert resource into database");
            }
        }
        debug!(count = resources.len(), "Saved resources to database");
    }

    info!(count = resources.len(), "Resources refreshed successfully");
    Ok(resources)
}
