//! Tauri Commands Module
//!
//! Exposes backend functionality to the frontend via Tauri IPC.

use crate::database::Database;
use crate::external::{ExternalSkillsManager, ExternalSource};
use crate::logging::{self, LogInfo};
use crate::manager::{CommandManager, SkillManager};
use crate::marketplace::{MarketplaceCategory, MarketplaceClient, MarketplaceQuery, MarketplaceSkill, MarketplaceFilters};
use crate::marketplace_cache::MarketplaceCache;
use crate::models::{
    ExternalSkill, LinkMode, Platform, PlatformInfo, ResourceItem, Settings, SyncResult,
};
use crate::platform::{detect_all_platforms, detect_platform};
use crate::repository::{ResourceRepository, SettingsRepository};
use crate::skill_installer::{InstallResult, SkillInstaller};
use crate::sync::SyncEngine;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use tracing::{debug, error, info, warn};

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
    debug!("Detecting installed platforms");
    let platforms: Vec<String> = detect_all_platforms()
        .into_iter()
        .filter(|p| p.detected)
        .map(|p| p.platform.display_name().to_string())
        .collect();
    info!(count = platforms.len(), "Detected platforms: {:?}", platforms);
    platforms
}

/// Get detailed platform information
#[tauri::command]
pub fn get_platforms() -> Vec<PlatformInfo> {
    debug!("Getting all platform information");
    let platforms = detect_all_platforms();
    info!(count = platforms.len(), "Retrieved platform information");
    platforms
}

/// Get platform info by name
#[tauri::command]
pub fn get_platform_info(platform: Platform) -> PlatformInfo {
    debug!(platform = ?platform, "Getting platform info");
    detect_platform(platform)
}

/// Get all resources (skills, commands, agents)
#[tauri::command]
pub fn get_resources(state: State<AppState>) -> Vec<ResourceItem> {
    debug!("Getting all resources");
    // First, try to get from database
    let db = state.db.lock().unwrap();
    let repo = ResourceRepository::new(db.conn());

    if let Ok(resources) = repo.get_all() {
        if !resources.is_empty() {
            info!(count = resources.len(), "Retrieved resources from database");
            return resources;
        }
    }

    // If database is empty, discover from filesystem
    drop(db); // Release lock before discovery
    debug!("Database empty, discovering from filesystem");

    let mut resources = Vec::new();

    // Discover skills
    let skill_manager = SkillManager::new(state.skills_source.clone());
    if let Ok(skills) = skill_manager.discover() {
        debug!(count = skills.len(), "Discovered skills");
        resources.extend(skills);
    }

    // Discover commands
    let command_manager = CommandManager::new(state.commands_source.clone());
    if let Ok(commands) = command_manager.discover() {
        debug!(count = commands.len(), "Discovered commands");
        resources.extend(commands);
    }

    info!(count = resources.len(), "Total resources discovered");
    resources
}

/// Get a resource by ID
#[tauri::command]
pub fn get_resource_by_id(state: State<AppState>, id: String) -> Option<ResourceItem> {
    debug!(id = %id, "Getting resource by ID");
    let db = state.db.lock().unwrap();
    let repo = ResourceRepository::new(db.conn());

    match repo.get_by_id(&id) {
        Ok(resource) => {
            if resource.is_some() {
                debug!(id = %id, "Resource found");
            } else {
                debug!(id = %id, "Resource not found");
            }
            resource
        }
        Err(e) => {
            warn!(id = %id, error = %e, "Failed to get resource");
            None
        }
    }
}

/// Install a resource to specified platforms
#[tauri::command]
pub async fn install_resource(
    state: State<'_, AppState>,
    id: String,
    platforms: Vec<Platform>,
) -> Result<Vec<SyncResult>, String> {
    info!(id = %id, platforms = ?platforms, "Installing resource");

    // Get the resource
    let resource = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id).map_err(|e| e.to_string())?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            debug!(id = %id, "Resource not in database, discovering from filesystem");
            // Try to find in discovered resources
            let skill_manager = SkillManager::new(state.skills_source.clone());
            let skills = skill_manager.discover().map_err(|e| e.to_string())?;

            skills
                .into_iter()
                .find(|s| s.id == id)
                .ok_or_else(|| {
                    error!(id = %id, "Resource not found");
                    format!("Resource not found: {}", id)
                })?
        }
    };

    // Create sync engine
    let sync_engine = SyncEngine::new(LinkMode::default());

    // Install based on resource type
    let results = match resource.resource_type {
        crate::models::ResourceType::Skill => {
            debug!(id = %id, "Installing as skill");
            let manager = SkillManager::new(state.skills_source.clone());
            manager
                .install(&resource, &platforms, &sync_engine)
                .map_err(|e| {
                    error!(id = %id, error = %e, "Skill installation failed");
                    e.to_string()
                })?
        }
        crate::models::ResourceType::Command => {
            debug!(id = %id, "Installing as command");
            let manager = CommandManager::new(state.commands_source.clone());
            manager
                .install(&resource, &platforms, &sync_engine)
                .map_err(|e| {
                    error!(id = %id, error = %e, "Command installation failed");
                    e.to_string()
                })?
        }
        crate::models::ResourceType::Agent => {
            warn!(id = %id, "Agent installation not yet implemented");
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
                debug!(id = %result.resource_id, platform = ?result.platform, "Updating platform status to synced");
                let _ = repo.update_platform_status(
                    &result.resource_id,
                    result.platform,
                    crate::models::SyncStatus::Synced,
                    None,
                );
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
) -> Result<(), String> {
    info!(id = %id, platforms = ?platforms, "Uninstalling resource");
    let sync_engine = SyncEngine::new(LinkMode::default());

    // Get the resource
    let resource = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id).map_err(|e| e.to_string())?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            error!(id = %id, "Resource not found for uninstall");
            return Err(format!("Resource not found: {}", id));
        }
    };

    // Uninstall based on resource type
    match resource.resource_type {
        crate::models::ResourceType::Skill => {
            debug!(id = %id, "Uninstalling skill");
            let manager = SkillManager::new(state.skills_source.clone());
            manager
                .uninstall(&resource, &platforms, &sync_engine)
                .map_err(|e| {
                    error!(id = %id, error = %e, "Skill uninstall failed");
                    e.to_string()
                })?;
        }
        _ => {
            warn!(id = %id, resource_type = ?resource.resource_type, "Uninstall not implemented for this resource type");
            return Err("Uninstall not implemented for this resource type".to_string());
        }
    }

    // Update database
    {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());

        for platform in &platforms {
            debug!(id = %id, platform = ?platform, "Updating platform status to not installed");
            let _ = repo.update_platform_status(
                &id,
                *platform,
                crate::models::SyncStatus::NotInstalled,
                None,
            );
        }
    }

    info!(id = %id, "Resource uninstalled successfully");
    Ok(())
}

/// Update a resource
#[tauri::command]
pub async fn update_resource(state: State<'_, AppState>, id: String) -> Result<bool, String> {
    info!(id = %id, "Updating resource");
    // Re-sync the resource
    let resource = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());
        repo.get_by_id(&id).map_err(|e| e.to_string())?
    };

    let resource = match resource {
        Some(r) => r,
        None => {
            error!(id = %id, "Resource not found for update");
            return Err(format!("Resource not found: {}", id));
        }
    };

    // Get platforms where it's installed
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
            warn!(id = %id, resource_type = ?resource.resource_type, "Update not implemented for this resource type");
            return Err("Update not implemented for this resource type".to_string());
        }
    }

    info!(id = %id, "Resource updated successfully");
    Ok(true)
}

/// Get external skills from registry
#[tauri::command]
pub fn get_external_skills() -> Vec<ExternalSkill> {
    debug!("Getting external skills from registry");
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
    info!(source_type = %source_type, source = %source, platforms = ?platforms, "Installing external skill");

    // Parse source type
    let external_source = match source_type.as_str() {
        "npm" => ExternalSource::Npm {
            package: source.clone(),
        },
        "pip" => ExternalSource::Pip {
            package: source.clone(),
        },
        "git" => ExternalSource::Git {
            url: source.clone(),
            branch,
        },
        "vercel" => ExternalSource::Vercel {
            skill_name: source.clone(),
        },
        _ => {
            error!(source_type = %source_type, "Unknown source type");
            return Err(format!("Unknown source type: {}", source_type));
        }
    };

    // Generate a name from the source
    let name = match &external_source {
        ExternalSource::Npm { package } => package
            .split('/')
            .next_back()
            .unwrap_or(package)
            .to_string(),
        ExternalSource::Pip { package } => package.clone(),
        ExternalSource::Git { url, .. } => url
            .split('/')
            .next_back()
            .unwrap_or("repo")
            .trim_end_matches(".git")
            .to_string(),
        ExternalSource::Vercel { skill_name } => skill_name.clone(),
    };

    debug!(name = %name, "Generated skill name from source");

    // Install the external skill
    let installed_path = state
        .external_manager
        .install(&external_source, &name)
        .map_err(|e: anyhow::Error| {
            error!(name = %name, error = %e, "External skill installation failed");
            e.to_string()
        })?;

    debug!(path = %installed_path.display(), "External skill installed to cache");

    // Now sync the installed skill to the target platforms
    let sync_engine = SyncEngine::new(LinkMode::default());
    let mut results = Vec::new();

    for platform in &platforms {
        let target_dir = platform.skills_path_full();

        if let Some(target_dir) = target_dir {
            let target_path = target_dir.join(&name);

            let result = sync_engine
                .sync(&installed_path, &target_path, None)
                .map(|_| {
                    debug!(name = %name, platform = ?platform, "Synced to platform");
                    SyncResult {
                        success: true,
                        platform: *platform,
                        resource_id: name.clone(),
                        error: None,
                    }
                })
                .unwrap_or_else(|e| {
                    warn!(name = %name, platform = ?platform, error = %e, "Sync to platform failed");
                    SyncResult {
                        success: false,
                        platform: *platform,
                        resource_id: name.clone(),
                        error: Some(e.to_string()),
                    }
                });

            results.push(result);
        } else {
            warn!(name = %name, platform = ?platform, "Platform skills path not found");
            results.push(SyncResult {
                success: false,
                platform: *platform,
                resource_id: name.clone(),
                error: Some("Platform skills path not found".to_string()),
            });
        }
    }

    let success_count = results.iter().filter(|r| r.success).count();
    info!(name = %name, success_count, total = results.len(), "External skill installation completed");
    Ok(results)
}

/// Check external handler prerequisites
#[tauri::command]
pub fn check_external_handlers(state: State<AppState>) -> Vec<(String, bool)> {
    debug!("Checking external handler prerequisites");
    let handlers = state.external_manager.list_handlers();
    info!(handlers = ?handlers, "External handlers status");
    handlers
}

/// Get application settings
#[tauri::command]
pub fn get_settings(state: State<AppState>) -> Settings {
    debug!("Getting application settings");
    let db = state.db.lock().unwrap();
    let repo = SettingsRepository::new(db.conn());

    repo.get_settings().unwrap_or_default()
}

/// Update application settings
#[tauri::command]
pub fn update_settings(state: State<AppState>, settings: Settings) -> Result<(), String> {
    info!("Updating application settings");
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let repo = SettingsRepository::new(db.conn());

    repo.save_settings(&settings).map_err(|e| {
        error!(error = %e, "Failed to save settings");
        e.to_string()
    })?;

    info!("Settings updated successfully");
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
    info!(id = %id, platform = ?platform, force, "Syncing resource to platform");
    let _ = force; // TODO: Implement force sync

    // Just call install for single platform
    let results = install_resource(state, id.clone(), vec![platform]).await?;

    results
        .into_iter()
        .next()
        .ok_or_else(|| {
            error!(id = %id, "No sync result returned");
            "No sync result".to_string()
        })
}

/// Refresh resources by re-scanning the filesystem
#[tauri::command]
pub fn refresh_resources(state: State<AppState>) -> Result<Vec<ResourceItem>, String> {
    info!("Refreshing resources from filesystem");
    let mut resources = Vec::new();

    // Discover skills
    let skill_manager = SkillManager::new(state.skills_source.clone());
    if let Ok(skills) = skill_manager.discover() {
        debug!(count = skills.len(), "Discovered skills");
        resources.extend(skills);
    }

    // Discover commands
    let command_manager = CommandManager::new(state.commands_source.clone());
    if let Ok(commands) = command_manager.discover() {
        debug!(count = commands.len(), "Discovered commands");
        resources.extend(commands);
    }

    // Save to database
    {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let repo = ResourceRepository::new(db.conn());

        for resource in &resources {
            let _ = repo.insert(resource);
        }
        debug!(count = resources.len(), "Saved resources to database");
    }

    info!(count = resources.len(), "Resources refreshed successfully");
    Ok(resources)
}

// ============================================================================
// Marketplace Commands
// ============================================================================

/// Helper: Check cache validity and get cached skills if valid
fn try_get_cached_skills(
    state: &State<'_, AppState>,
    query: &MarketplaceQuery,
) -> Result<Option<Vec<MarketplaceSkill>>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let cache = MarketplaceCache::new(db.conn());

    if cache.is_cache_valid().map_err(|e| e.to_string())? {
        debug!("Cache is valid, retrieving cached skills");
        let skills = cache
            .get_cached_skills_filtered(
                &query.sort_by,
                query.search.as_deref(),
                query.category.as_deref(),
                query.source.as_deref(),
                query.platform.as_deref(),
            )
            .map_err(|e| e.to_string())?;
        debug!(count = skills.len(), "Retrieved skills from cache");
        return Ok(Some(skills));
    }

    debug!("Cache is invalid or empty");
    Ok(None)
}

/// Helper: Update cache with skills
fn update_skills_cache(
    state: &State<'_, AppState>,
    skills: &[MarketplaceSkill],
) -> Result<(), String> {
    debug!(count = skills.len(), "Updating skills cache");
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let cache = MarketplaceCache::new(db.conn());
    cache.update_cache(skills).map_err(|e| e.to_string())
}

/// Get marketplace skills with optional filtering and caching
#[tauri::command]
pub async fn get_marketplace_skills(
    state: State<'_, AppState>,
    query: MarketplaceQuery,
) -> Result<Vec<MarketplaceSkill>, String> {
    debug!(query = ?query, "Getting marketplace skills");

    // Check cache first (sync operation, lock released after this block)
    if let Some(cached_skills) = try_get_cached_skills(&state, &query)? {
        info!(count = cached_skills.len(), "Returning cached marketplace skills");
        return Ok(cached_skills);
    }

    // Cache expired or empty, fetch from API (async operation, no lock held)
    info!("Fetching marketplace skills from API");
    let client = MarketplaceClient::new();
    let skills = client
        .fetch_skills(&query)
        .await
        .map_err(|e| {
            error!(error = %e, "Failed to fetch marketplace skills");
            e.to_string()
        })?;

    // Update cache (sync operation)
    let _ = update_skills_cache(&state, &skills);

    info!(count = skills.len(), "Fetched marketplace skills from API");
    Ok(skills)
}

/// Search marketplace skills by keyword
#[tauri::command]
pub async fn search_marketplace(
    state: State<'_, AppState>,
    keyword: String,
    filters: MarketplaceFilters,
) -> Result<Vec<MarketplaceSkill>, String> {
    info!(keyword = %keyword, filters = ?filters, "Searching marketplace");

    // Build query for cache lookup
    let cache_query = MarketplaceQuery {
        sort_by: "popular".to_string(),
        search: Some(keyword.clone()),
        category: filters.category.clone(),
        source: filters.source.clone(),
        platform: filters.platform.clone(),
        ..Default::default()
    };

    // Check cache first (sync operation)
    if let Some(cached_skills) = try_get_cached_skills(&state, &cache_query)? {
        info!(count = cached_skills.len(), keyword = %keyword, "Returning cached search results");
        return Ok(cached_skills);
    }

    // Fetch from API (async operation, no lock held)
    debug!(keyword = %keyword, "Searching marketplace API");
    let client = MarketplaceClient::new();
    let skills = client
        .search_skills(&keyword, &filters)
        .await
        .map_err(|e| {
            error!(keyword = %keyword, error = %e, "Marketplace search failed");
            e.to_string()
        })?;

    info!(count = skills.len(), keyword = %keyword, "Marketplace search completed");
    Ok(skills)
}

/// Install a skill from marketplace using npx skills CLI
#[tauri::command]
pub fn install_marketplace_skill(
    state: State<'_, AppState>,
    owner: String,
    repo: String,
) -> Result<InstallResult, String> {
    info!(owner = %owner, repo = %repo, "Installing marketplace skill");
    let installer = SkillInstaller::new();
    let result = installer.install_skill(&owner, &repo).map_err(|e| {
        error!(owner = %owner, repo = %repo, error = %e, "Marketplace skill installation failed");
        e.to_string()
    })?;

    if result.success {
        info!(owner = %owner, repo = %repo, "Marketplace skill installed successfully");
        // Update cache to mark skill as installed
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let cache = MarketplaceCache::new(db.conn());
        let skill_id = format!("{}/{}", owner, repo);
        let _ = cache.update_skill_installed(&skill_id, true);
    } else {
        warn!(owner = %owner, repo = %repo, message = ?result.message, "Marketplace skill installation returned failure");
    }

    Ok(result)
}

/// Uninstall a marketplace skill
#[tauri::command]
pub fn uninstall_marketplace_skill(
    state: State<'_, AppState>,
    owner: String,
    repo: String,
) -> Result<InstallResult, String> {
    info!(owner = %owner, repo = %repo, "Uninstalling marketplace skill");
    let installer = SkillInstaller::new();
    let result = installer.uninstall_skill(&owner, &repo).map_err(|e| {
        error!(owner = %owner, repo = %repo, error = %e, "Marketplace skill uninstall failed");
        e.to_string()
    })?;

    if result.success {
        info!(owner = %owner, repo = %repo, "Marketplace skill uninstalled successfully");
        // Update cache to mark skill as uninstalled
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let cache = MarketplaceCache::new(db.conn());
        let skill_id = format!("{}/{}", owner, repo);
        let _ = cache.update_skill_installed(&skill_id, false);
    } else {
        warn!(owner = %owner, repo = %repo, message = ?result.message, "Marketplace skill uninstall returned failure");
    }

    Ok(result)
}

/// Refresh marketplace cache (force fetch from API)
#[tauri::command]
pub async fn refresh_marketplace_cache(
    state: State<'_, AppState>,
) -> Result<Vec<MarketplaceSkill>, String> {
    info!("Refreshing marketplace cache");

    // Invalidate cache first (sync operation)
    {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let cache = MarketplaceCache::new(db.conn());
        cache.invalidate_cache().map_err(|e| {
            error!(error = %e, "Failed to invalidate cache");
            e.to_string()
        })?;
        debug!("Cache invalidated");
    } // Lock released here

    // Fetch fresh data from API (async operation, no lock held)
    debug!("Fetching fresh data from marketplace API");
    let client = MarketplaceClient::new();
    let query = MarketplaceQuery::default();
    let skills = client
        .fetch_skills(&query)
        .await
        .map_err(|e| {
            error!(error = %e, "Failed to fetch skills from API");
            e.to_string()
        })?;

    // Update cache with fresh data (sync operation)
    let _ = update_skills_cache(&state, &skills);

    info!(count = skills.len(), "Marketplace cache refreshed successfully");
    Ok(skills)
}

/// Get marketplace categories
#[tauri::command]
pub async fn get_marketplace_categories(
    state: State<'_, AppState>,
) -> Result<Vec<MarketplaceCategory>, String> {
    debug!("Getting marketplace categories");

    // Check cache validity and get categories (sync operation)
    let cache_result = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let cache = MarketplaceCache::new(db.conn());

        if cache.is_cache_valid().map_err(|e| e.to_string())? {
            debug!("Returning cached categories");
            Some(cache.get_categories().map_err(|e| e.to_string())?)
        } else {
            None
        }
    }; // Lock released here

    if let Some(categories) = cache_result {
        info!(count = categories.len(), "Returning cached marketplace categories");
        return Ok(categories);
    }

    // Fetch from API (async operation, no lock held)
    debug!("Fetching categories from marketplace API");
    let client = MarketplaceClient::new();
    let categories = client.get_categories().await.map_err(|e| {
        error!(error = %e, "Failed to fetch categories from API");
        e.to_string()
    })?;

    info!(count = categories.len(), "Fetched marketplace categories from API");
    Ok(categories)
}

/// Check if Node.js/npx is available for skill installation
#[tauri::command]
pub fn check_nodejs_available() -> Result<bool, String> {
    debug!("Checking Node.js availability");
    let available = SkillInstaller::check_nodejs_available().map_err(|e| {
        warn!(error = %e, "Node.js availability check failed");
        e.to_string()
    })?;
    info!(available, "Node.js availability check completed");
    Ok(available)
}

/// Get Node.js version if available
#[tauri::command]
pub fn get_nodejs_version() -> Option<String> {
    debug!("Getting Node.js version");
    let version = SkillInstaller::get_nodejs_version();
    if let Some(ref v) = version {
        debug!(version = %v, "Node.js version detected");
    } else {
        debug!("Node.js not found");
    }
    version
}

/// Get marketplace cache statistics
#[tauri::command]
pub fn get_marketplace_cache_stats(
    state: State<AppState>,
) -> Result<crate::marketplace_cache::CacheStats, String> {
    debug!("Getting marketplace cache statistics");
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let cache = MarketplaceCache::new(db.conn());
    let stats = cache.get_cache_stats().map_err(|e| {
        error!(error = %e, "Failed to get cache stats");
        e.to_string()
    })?;
    debug!(stats = ?stats, "Cache statistics retrieved");
    Ok(stats)
}

// ============================================================================
// Logging Commands
// ============================================================================

/// Get log directory information
#[tauri::command]
pub fn get_log_info() -> Result<LogInfo, String> {
    info!("Getting log directory information");
    logging::get_log_info_internal().ok_or_else(|| "Failed to get log directory info".to_string())
}

/// Cleanup old log files manually
#[tauri::command]
pub fn cleanup_logs() -> Result<u32, String> {
    info!("Manual log cleanup triggered");
    match logging::trigger_log_cleanup() {
        Ok(count) => {
            info!(deleted_count = count, "Log cleanup completed");
            Ok(count)
        }
        Err(e) => {
            error!(error = %e, "Log cleanup failed");
            Err(e.to_string())
        }
    }
}
