//! Marketplace commands

use super::AppState;
use crate::error::CommandError;
use crate::marketplace::{
    MarketplaceCategory, MarketplaceClient, MarketplaceFilters, MarketplaceQuery, MarketplaceSkill,
};
use crate::marketplace_cache::MarketplaceCache;
use crate::skill_installer::{InstallResult, SkillInstaller};
use tauri::State;
use tracing::{debug, error, info, warn};

/// Helper: Check cache validity and get cached skills if valid
fn try_get_cached_skills(
    state: &State<'_, AppState>,
    query: &MarketplaceQuery,
) -> Result<Option<Vec<MarketplaceSkill>>, CommandError> {
    let db = state.db.lock()?;
    let cache = MarketplaceCache::new(db.conn());

    if cache
        .is_cache_valid()
        .map_err(|e| CommandError::Database(e.to_string()))?
    {
        debug!("Cache is valid, retrieving cached skills");
        let skills = cache
            .get_cached_skills_filtered(
                &query.sort_by,
                query.search.as_deref(),
                query.category.as_deref(),
                query.source.as_deref(),
                query.platform.as_deref(),
            )
            .map_err(|e| CommandError::Database(e.to_string()))?;
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
) -> Result<(), CommandError> {
    debug!(count = skills.len(), "Updating skills cache");
    let db = state.db.lock()?;
    let cache = MarketplaceCache::new(db.conn());
    cache
        .update_cache(skills)
        .map_err(|e| CommandError::Database(e.to_string()))
}

/// Get marketplace skills with optional filtering and caching
#[tauri::command]
pub async fn get_marketplace_skills(
    state: State<'_, AppState>,
    query: MarketplaceQuery,
) -> Result<Vec<MarketplaceSkill>, CommandError> {
    debug!(query = ?query, "Getting marketplace skills");

    if let Some(cached_skills) = try_get_cached_skills(&state, &query)? {
        info!(
            count = cached_skills.len(),
            "Returning cached marketplace skills"
        );
        return Ok(cached_skills);
    }

    info!("Fetching marketplace skills from API");
    let client = MarketplaceClient::new();
    let skills = client.fetch_skills(&query).await.map_err(|e| {
        error!(error = %e, "Failed to fetch marketplace skills");
        CommandError::Network(e.to_string())
    })?;

    if let Err(e) = update_skills_cache(&state, &skills) {
        warn!(error = %e, "Failed to update skills cache");
    }

    info!(count = skills.len(), "Fetched marketplace skills from API");
    Ok(skills)
}

/// Search marketplace skills by keyword
#[tauri::command]
pub async fn search_marketplace(
    state: State<'_, AppState>,
    keyword: String,
    filters: MarketplaceFilters,
) -> Result<Vec<MarketplaceSkill>, CommandError> {
    info!(keyword = %keyword, filters = ?filters, "Searching marketplace");

    let cache_query = MarketplaceQuery {
        sort_by: "popular".to_string(),
        search: Some(keyword.clone()),
        category: filters.category.clone(),
        source: filters.source.clone(),
        platform: filters.platform.clone(),
        ..Default::default()
    };

    if let Some(cached_skills) = try_get_cached_skills(&state, &cache_query)? {
        info!(count = cached_skills.len(), keyword = %keyword, "Returning cached search results");
        return Ok(cached_skills);
    }

    debug!(keyword = %keyword, "Searching marketplace API");
    let client = MarketplaceClient::new();
    let skills = client
        .search_skills(&keyword, &filters)
        .await
        .map_err(|e| {
            error!(keyword = %keyword, error = %e, "Marketplace search failed");
            CommandError::Network(e.to_string())
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
) -> Result<InstallResult, CommandError> {
    info!(owner = %owner, repo = %repo, "Installing marketplace skill");
    let installer = SkillInstaller::new();
    let result = installer.install_skill(&owner, &repo).map_err(|e| {
        error!(owner = %owner, repo = %repo, error = %e, "Marketplace skill installation failed");
        CommandError::External(e.to_string())
    })?;

    if result.success {
        info!(owner = %owner, repo = %repo, "Marketplace skill installed successfully");
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());
        let skill_id = format!("{}/{}", owner, repo);
        if let Err(e) = cache.update_skill_installed(&skill_id, true) {
            warn!(skill_id = %skill_id, error = %e, "Failed to update cache installed status");
        }
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
) -> Result<InstallResult, CommandError> {
    info!(owner = %owner, repo = %repo, "Uninstalling marketplace skill");
    let installer = SkillInstaller::new();
    let result = installer.uninstall_skill(&owner, &repo).map_err(|e| {
        error!(owner = %owner, repo = %repo, error = %e, "Marketplace skill uninstall failed");
        CommandError::External(e.to_string())
    })?;

    if result.success {
        info!(owner = %owner, repo = %repo, "Marketplace skill uninstalled successfully");
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());
        let skill_id = format!("{}/{}", owner, repo);
        if let Err(e) = cache.update_skill_installed(&skill_id, false) {
            warn!(skill_id = %skill_id, error = %e, "Failed to update cache uninstalled status");
        }
    } else {
        warn!(owner = %owner, repo = %repo, message = ?result.message, "Marketplace skill uninstall returned failure");
    }

    Ok(result)
}

/// Refresh marketplace cache (force fetch from API)
#[tauri::command]
pub async fn refresh_marketplace_cache(
    state: State<'_, AppState>,
) -> Result<Vec<MarketplaceSkill>, CommandError> {
    info!("Refreshing marketplace cache");

    {
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());
        cache.invalidate_cache().map_err(|e| {
            error!(error = %e, "Failed to invalidate cache");
            CommandError::Database(e.to_string())
        })?;
        debug!("Cache invalidated");
    }

    debug!("Fetching fresh data from marketplace API");
    let client = MarketplaceClient::new();
    let query = MarketplaceQuery::default();
    let skills = client.fetch_skills(&query).await.map_err(|e| {
        error!(error = %e, "Failed to fetch skills from API");
        CommandError::Network(e.to_string())
    })?;

    if let Err(e) = update_skills_cache(&state, &skills) {
        warn!(error = %e, "Failed to update skills cache after refresh");
    }

    info!(
        count = skills.len(),
        "Marketplace cache refreshed successfully"
    );
    Ok(skills)
}

/// Get marketplace categories
#[tauri::command]
pub async fn get_marketplace_categories(
    state: State<'_, AppState>,
) -> Result<Vec<MarketplaceCategory>, CommandError> {
    debug!("Getting marketplace categories");

    let cache_result = {
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());

        if cache
            .is_cache_valid()
            .map_err(|e| CommandError::Database(e.to_string()))?
        {
            debug!("Returning cached categories");
            Some(
                cache
                    .get_categories()
                    .map_err(|e| CommandError::Database(e.to_string()))?,
            )
        } else {
            None
        }
    };

    if let Some(categories) = cache_result {
        info!(
            count = categories.len(),
            "Returning cached marketplace categories"
        );
        return Ok(categories);
    }

    debug!("Fetching categories from marketplace API");
    let client = MarketplaceClient::new();
    let categories = client.get_categories().await.map_err(|e| {
        error!(error = %e, "Failed to fetch categories from API");
        CommandError::Network(e.to_string())
    })?;

    info!(
        count = categories.len(),
        "Fetched marketplace categories from API"
    );
    Ok(categories)
}

/// Check if Node.js/npx is available for skill installation
#[tauri::command]
pub fn check_nodejs_available() -> Result<bool, CommandError> {
    debug!("Checking Node.js availability");
    let available = SkillInstaller::check_nodejs_available().map_err(|e| {
        warn!(error = %e, "Node.js availability check failed");
        CommandError::External(e.to_string())
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
) -> Result<crate::marketplace_cache::CacheStats, CommandError> {
    debug!("Getting marketplace cache statistics");
    let db = state.db.lock()?;
    let cache = MarketplaceCache::new(db.conn());
    let stats = cache.get_cache_stats().map_err(|e| {
        error!(error = %e, "Failed to get cache stats");
        CommandError::Database(e.to_string())
    })?;
    debug!(stats = ?stats, "Cache statistics retrieved");
    Ok(stats)
}
