//! Tauri Commands Module
//!
//! Exposes backend functionality to the frontend via Tauri IPC.

use crate::database::Database;
use crate::external::{ExternalSkillsManager, ExternalSource};
use crate::manager::{CommandManager, SkillManager};
use crate::models::{ExternalSkill, LinkMode, Platform, PlatformInfo, ResourceItem, Settings, SyncResult};
use crate::platform::{detect_all_platforms, detect_platform};
use crate::repository::{ResourceRepository, SettingsRepository};
use crate::sync::SyncEngine;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

/// Application state
pub struct AppState {
    pub db: Mutex<Database>,
    pub skills_source: PathBuf,
    pub commands_source: PathBuf,
    pub external_manager: ExternalSkillsManager,
}

impl AppState {
    pub fn new() -> Self {
        let db_path = Database::default_path();
        let db = Database::new(db_path).expect("Failed to initialize database");

        // Default source paths (relative to the project)
        let base_path = std::env::current_dir().unwrap_or_default();
        let skills_source = base_path.join("skills");
        let commands_source = base_path.join("commands");

        // Cache directory for external skills
        let cache_dir = dirs::cache_dir()
            .unwrap_or_else(|| base_path.clone())
            .join("agentkit");

        Self {
            db: Mutex::new(db),
            skills_source,
            commands_source,
            external_manager: ExternalSkillsManager::new(cache_dir),
        }
    }

    pub fn with_paths(skills_source: PathBuf, commands_source: PathBuf) -> Self {
        let db_path = Database::default_path();
        let db = Database::new(db_path).expect("Failed to initialize database");

        let cache_dir = dirs::cache_dir()
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_default())
            .join("agentkit");

        Self {
            db: Mutex::new(db),
            skills_source,
            commands_source,
            external_manager: ExternalSkillsManager::new(cache_dir),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

/// Detect all installed platforms
#[tauri::command]
pub fn detect_platforms() -> Vec<String> {
    detect_all_platforms()
        .into_iter()
        .filter(|p| p.detected)
        .map(|p| p.platform.display_name().to_string())
        .collect()
}

/// Get detailed platform information
#[tauri::command]
pub fn get_platforms() -> Vec<PlatformInfo> {
    detect_all_platforms()
}

/// Get platform info by name
#[tauri::command]
pub fn get_platform_info(platform: Platform) -> PlatformInfo {
    detect_platform(platform)
}

/// Get all resources (skills, commands, agents)
#[tauri::command]
pub fn get_resources(state: State<AppState>) -> Vec<ResourceItem> {
    // First, try to get from database
    let db = state.db.lock().unwrap();
    let repo = ResourceRepository::new(db.conn());

    if let Ok(resources) = repo.get_all() {
        if !resources.is_empty() {
            return resources;
        }
    }

    // If database is empty, discover from filesystem
    drop(db); // Release lock before discovery

    let mut resources = Vec::new();

    // Discover skills
    let skill_manager = SkillManager::new(state.skills_source.clone());
    if let Ok(skills) = skill_manager.discover() {
        resources.extend(skills);
    }

    // Discover commands
    let command_manager = CommandManager::new(state.commands_source.clone());
    if let Ok(commands) = command_manager.discover() {
        resources.extend(commands);
    }

    resources
}

/// Get a resource by ID
#[tauri::command]
pub fn get_resource_by_id(state: State<AppState>, id: String) -> Option<ResourceItem> {
    let db = state.db.lock().unwrap();
    let repo = ResourceRepository::new(db.conn());

    repo.get_by_id(&id).ok().flatten()
}

/// Install a resource to specified platforms
#[tauri::command]
pub async fn install_resource(
    state: State<'_, AppState>,
    id: String,
    platforms: Vec<Platform>,
) -> Result<Vec<SyncResult>, String> {
    // Get the resource
    let resource = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id).map_err(|e| e.to_string())?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            // Try to find in discovered resources
            let skill_manager = SkillManager::new(state.skills_source.clone());
            let skills = skill_manager.discover().map_err(|e| e.to_string())?;

            skills
                .into_iter()
                .find(|s| s.id == id)
                .ok_or_else(|| format!("Resource not found: {}", id))?
        }
    };

    // Create sync engine
    let sync_engine = SyncEngine::new(LinkMode::default());

    // Install based on resource type
    let results = match resource.resource_type {
        crate::models::ResourceType::Skill => {
            let manager = SkillManager::new(state.skills_source.clone());
            manager
                .install(&resource, &platforms, &sync_engine)
                .map_err(|e| e.to_string())?
        }
        crate::models::ResourceType::Command => {
            let manager = CommandManager::new(state.commands_source.clone());
            manager
                .install(&resource, &platforms, &sync_engine)
                .map_err(|e| e.to_string())?
        }
        crate::models::ResourceType::Agent => {
            // Agent installation not yet implemented
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

    // Update database with new status
    {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());

        for result in &results {
            if result.success {
                let _ = repo.update_platform_status(
                    &result.resource_id,
                    result.platform,
                    crate::models::SyncStatus::Synced,
                    None,
                );
            }
        }
    }

    Ok(results)
}

/// Uninstall a resource from specified platforms
#[tauri::command]
pub async fn uninstall_resource(
    state: State<'_, AppState>,
    id: String,
    platforms: Vec<Platform>,
) -> Result<(), String> {
    let sync_engine = SyncEngine::new(LinkMode::default());

    // Get the resource
    let resource = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id).map_err(|e| e.to_string())?
    };

    let resource = match resource {
        Some(r) => r,
        None => return Err(format!("Resource not found: {}", id)),
    };

    // Uninstall based on resource type
    match resource.resource_type {
        crate::models::ResourceType::Skill => {
            let manager = SkillManager::new(state.skills_source.clone());
            manager
                .uninstall(&resource, &platforms, &sync_engine)
                .map_err(|e| e.to_string())?;
        }
        _ => {
            return Err("Uninstall not implemented for this resource type".to_string());
        }
    }

    // Update database
    {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());

        for platform in &platforms {
            let _ = repo.update_platform_status(
                &id,
                *platform,
                crate::models::SyncStatus::NotInstalled,
                None,
            );
        }
    }

    Ok(())
}

/// Update a resource
#[tauri::command]
pub async fn update_resource(state: State<'_, AppState>, id: String) -> Result<bool, String> {
    // Re-sync the resource
    let resource = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id).map_err(|e| e.to_string())?
    };

    let resource = match resource {
        Some(r) => r,
        None => return Err(format!("Resource not found: {}", id)),
    };

    // Get platforms where it's installed
    let installed_platforms: Vec<Platform> = resource
        .platform_status
        .iter()
        .filter(|(_, status)| **status == crate::models::SyncStatus::Synced)
        .map(|(platform, _)| *platform)
        .collect();

    if installed_platforms.is_empty() {
        return Ok(false);
    }

    // Re-install to update
    let sync_engine = SyncEngine::new(LinkMode::default());

    match resource.resource_type {
        crate::models::ResourceType::Skill => {
            let manager = SkillManager::new(state.skills_source.clone());
            // Uninstall first, then reinstall
            let _ = manager.uninstall(&resource, &installed_platforms, &sync_engine);
            let _ = manager.install(&resource, &installed_platforms, &sync_engine);
        }
        _ => {
            return Err("Update not implemented for this resource type".to_string());
        }
    }

    Ok(true)
}

/// Get external skills from registry
#[tauri::command]
pub fn get_external_skills() -> Vec<ExternalSkill> {
    // TODO: Parse external-skills registry
    // For now, return empty list
    vec![]
}

/// Install an external skill
#[tauri::command]
pub async fn install_external_skill(
    state: State<'_, AppState>,
    source_type: String,
    source: String,
    branch: Option<String>,
    platforms: Vec<Platform>,
) -> Result<Vec<SyncResult>, String> {
    // Parse source type
    let external_source = match source_type.as_str() {
        "npm" => ExternalSource::Npm { package: source.clone() },
        "pip" => ExternalSource::Pip { package: source.clone() },
        "git" => ExternalSource::Git { url: source.clone(), branch },
        "vercel" => ExternalSource::Vercel { skill_name: source.clone() },
        _ => return Err(format!("Unknown source type: {}", source_type)),
    };

    // Generate a name from the source
    let name = match &external_source {
        ExternalSource::Npm { package } => {
            package.split('/').next_back().unwrap_or(package).to_string()
        }
        ExternalSource::Pip { package } => package.clone(),
        ExternalSource::Git { url, .. } => {
            url.split('/').next_back()
                .unwrap_or("repo")
                .trim_end_matches(".git")
                .to_string()
        }
        ExternalSource::Vercel { skill_name } => skill_name.clone(),
    };

    // Install the external skill
    let installed_path = state.external_manager
        .install(&external_source, &name)
        .map_err(|e: anyhow::Error| e.to_string())?;

    // Now sync the installed skill to the target platforms
    let sync_engine = SyncEngine::new(LinkMode::default());
    let mut results = Vec::new();

    for platform in &platforms {
        let target_dir = platform.skills_path_full();

        if let Some(target_dir) = target_dir {
            let target_path = target_dir.join(&name);

            let result = sync_engine
                .sync(&installed_path, &target_path, None)
                .map(|_| SyncResult {
                    success: true,
                    platform: *platform,
                    resource_id: name.clone(),
                    error: None,
                })
                .unwrap_or_else(|e| SyncResult {
                    success: false,
                    platform: *platform,
                    resource_id: name.clone(),
                    error: Some(e.to_string()),
                });

            results.push(result);
        } else {
            results.push(SyncResult {
                success: false,
                platform: *platform,
                resource_id: name.clone(),
                error: Some("Platform skills path not found".to_string()),
            });
        }
    }

    Ok(results)
}

/// Check external handler prerequisites
#[tauri::command]
pub fn check_external_handlers(state: State<AppState>) -> Vec<(String, bool)> {
    state.external_manager.list_handlers()
}

/// Get application settings
#[tauri::command]
pub fn get_settings(state: State<AppState>) -> Settings {
    let db = state.db.lock().unwrap();
    let repo = SettingsRepository::new(db.conn());

    repo.get_settings().unwrap_or_default()
}

/// Update application settings
#[tauri::command]
pub fn update_settings(state: State<AppState>, settings: Settings) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let repo = SettingsRepository::new(db.conn());

    repo.save_settings(&settings).map_err(|e| e.to_string())?;

    Ok(())
}

/// Sync a resource to a specific platform
#[tauri::command]
pub async fn sync_resource(
    state: State<'_, AppState>,
    id: String,
    platform: Platform,
    force: bool,
) -> Result<SyncResult, String> {
    let _ = force; // TODO: Implement force sync

    // Just call install for single platform
    let results = install_resource(state, id.clone(), vec![platform]).await?;

    results
        .into_iter()
        .next()
        .ok_or_else(|| "No sync result".to_string())
}

/// Refresh resources by re-scanning the filesystem
#[tauri::command]
pub fn refresh_resources(state: State<AppState>) -> Result<Vec<ResourceItem>, String> {
    let mut resources = Vec::new();

    // Discover skills
    let skill_manager = SkillManager::new(state.skills_source.clone());
    if let Ok(skills) = skill_manager.discover() {
        resources.extend(skills);
    }

    // Discover commands
    let command_manager = CommandManager::new(state.commands_source.clone());
    if let Ok(commands) = command_manager.discover() {
        resources.extend(commands);
    }

    // Save to database
    {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());

        for resource in &resources {
            let _ = repo.insert(resource);
        }
    }

    Ok(resources)
}
