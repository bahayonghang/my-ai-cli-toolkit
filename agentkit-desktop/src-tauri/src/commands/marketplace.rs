//! Marketplace commands

use super::AppState;
use crate::error::CommandError;
use crate::marketplace::{
    default_skills, is_skills_sh_sort, MarketplaceCategory, MarketplaceClient, MarketplaceFilters,
    MarketplaceQuery, MarketplaceSkill,
};
use crate::marketplace_cache::MarketplaceCache;
use crate::skill_installer::{InstallResult, SkillInstaller};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};
use tauri::State;
use tracing::{debug, error, info, warn};

const SKILLS_SH_CACHE_TTL_SECONDS: i64 = 15 * 60;
const NODEJS_CACHE_TTL_SECONDS: u64 = 10 * 60;

#[derive(Debug, Clone)]
struct NodejsCacheEntry {
    available: bool,
    version: Option<String>,
    checked_at: Instant,
}

static NODEJS_INFO_CACHE: OnceLock<Mutex<Option<NodejsCacheEntry>>> = OnceLock::new();

fn nodejs_cache() -> &'static Mutex<Option<NodejsCacheEntry>> {
    NODEJS_INFO_CACHE.get_or_init(|| Mutex::new(None))
}

fn query_nodejs_info() -> Result<NodejsCacheEntry, CommandError> {
    let available = SkillInstaller::check_nodejs_available().map_err(|e| {
        warn!(error = %e, "Node.js availability check failed");
        CommandError::External(e.to_string())
    })?;

    let version = if available {
        SkillInstaller::get_nodejs_version()
    } else {
        None
    };

    Ok(NodejsCacheEntry {
        available,
        version,
        checked_at: Instant::now(),
    })
}

fn get_nodejs_info_cached(force_refresh: bool) -> Result<NodejsCacheEntry, CommandError> {
    let cache = nodejs_cache();
    if !force_refresh {
        let guard = cache
            .lock()
            .map_err(|e| CommandError::External(e.to_string()))?;
        if let Some(entry) = guard.as_ref() {
            if entry.checked_at.elapsed() <= Duration::from_secs(NODEJS_CACHE_TTL_SECONDS) {
                return Ok(entry.clone());
            }
        }
    }

    let entry = query_nodejs_info()?;
    let mut guard = cache
        .lock()
        .map_err(|e| CommandError::External(e.to_string()))?;
    *guard = Some(entry.clone());
    Ok(entry)
}

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

fn try_get_skills_sh_snapshot(
    state: &State<'_, AppState>,
    sort_by: &str,
) -> Result<Option<Vec<MarketplaceSkill>>, CommandError> {
    let db = state.db.lock()?;
    let cache = MarketplaceCache::new(db.conn());
    cache
        .get_skills_sh_snapshot(sort_by, SKILLS_SH_CACHE_TTL_SECONDS)
        .map_err(|e| CommandError::Database(e.to_string()))
}

fn try_get_skills_sh_stale_snapshot(
    state: &State<'_, AppState>,
    sort_by: &str,
) -> Result<Option<Vec<MarketplaceSkill>>, CommandError> {
    let db = state.db.lock()?;
    let cache = MarketplaceCache::new(db.conn());
    cache
        .get_skills_sh_snapshot_stale(sort_by)
        .map_err(|e| CommandError::Database(e.to_string()))
}

fn update_skills_sh_snapshot(
    state: &State<'_, AppState>,
    sort_by: &str,
    skills: &[MarketplaceSkill],
) -> Result<(), CommandError> {
    let db = state.db.lock()?;
    let cache = MarketplaceCache::new(db.conn());
    cache
        .set_skills_sh_snapshot(sort_by, skills)
        .map_err(|e| CommandError::Database(e.to_string()))
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
    let started = Instant::now();
    debug!(query = ?query, "Getting marketplace skills");
    let client = MarketplaceClient::new();

    let is_skills_leaderboard = is_skills_sh_sort(&query.sort_by) && query.search.is_none();

    // Primary path for new browse experience: cache-first for skills.sh leaderboard.
    if is_skills_leaderboard {
        if let Some(cached) = try_get_skills_sh_snapshot(&state, &query.sort_by)? {
            info!(
                count = cached.len(),
                sort = %query.sort_by,
                cache_hit = true,
                source = "skills_sh_snapshot",
                duration_ms = started.elapsed().as_millis() as u64,
                "Returned cached marketplace skills"
            );
            return Ok(cached);
        }
    }

    if is_skills_sh_sort(&query.sort_by) {
        match client.fetch_skills_from_skills_sh(&query).await {
            Ok(skills) => {
                if is_skills_leaderboard {
                    if let Err(e) = update_skills_sh_snapshot(&state, &query.sort_by, &skills) {
                        warn!(error = %e, sort = %query.sort_by, "Failed to update skills.sh snapshot cache");
                    }
                }
                info!(
                    count = skills.len(),
                    sort = %query.sort_by,
                    source = "skills_sh",
                    cache_hit = false,
                    duration_ms = started.elapsed().as_millis() as u64,
                    "Fetched marketplace skills from skills.sh"
                );
                return Ok(skills);
            }
            Err(e) => {
                warn!(error = %e, sort = %query.sort_by, "skills.sh fetch failed, falling back to skillsmp");

                if is_skills_leaderboard {
                    if let Some(stale_snapshot) =
                        try_get_skills_sh_stale_snapshot(&state, &query.sort_by)?
                    {
                        info!(
                            count = stale_snapshot.len(),
                            sort = %query.sort_by,
                            source = "skills_sh_snapshot_stale",
                            cache_hit = true,
                            duration_ms = started.elapsed().as_millis() as u64,
                            "Returned stale skills.sh snapshot after network failure"
                        );
                        return Ok(stale_snapshot);
                    }
                }
            }
        }
    }

    if let Some(cached_skills) = try_get_cached_skills(&state, &query)? {
        info!(
            count = cached_skills.len(),
            cache_hit = true,
            source = "skillsmp_cache",
            duration_ms = started.elapsed().as_millis() as u64,
            "Returning cached marketplace skills"
        );
        return Ok(cached_skills);
    }

    info!("Fetching marketplace skills from fallback API");
    let (skills, source) = match client.fetch_skills_from_skillsmp(&query).await {
        Ok(skills) => {
            if let Err(e) = update_skills_cache(&state, &skills) {
                warn!(error = %e, "Failed to update skills cache");
            }
            (skills, "skillsmp")
        }
        Err(e) => {
            warn!(
                error = %e,
                "Fallback marketplace API failed, using offline default skill list"
            );
            (default_skills(), "offline_defaults")
        }
    };

    info!(
        count = skills.len(),
        cache_hit = false,
        source,
        duration_ms = started.elapsed().as_millis() as u64,
        "Fetched marketplace skills"
    );
    Ok(skills)
}

/// Search marketplace skills by keyword
#[tauri::command]
pub async fn search_marketplace(
    state: State<'_, AppState>,
    keyword: String,
    filters: MarketplaceFilters,
) -> Result<Vec<MarketplaceSkill>, CommandError> {
    let started = Instant::now();
    info!(keyword = %keyword, filters = ?filters, "Searching marketplace");
    let trimmed = keyword.trim();
    if trimmed.len() < 2 {
        debug!("Search keyword shorter than 2 characters, returning empty result");
        return Ok(vec![]);
    }

    let client = MarketplaceClient::new();
    let skills_sh_query = MarketplaceQuery {
        sort_by: "all_time".to_string(),
        search: Some(trimmed.to_string()),
        category: filters.category.clone(),
        source: filters.source.clone(),
        platform: filters.platform.clone(),
        page: 1,
        per_page: 50,
    };

    // Prefer skills.sh search endpoint.
    match client.fetch_skills_from_skills_sh(&skills_sh_query).await {
        Ok(skills) => {
            info!(
                count = skills.len(),
                keyword = %trimmed,
                source = "skills_sh",
                duration_ms = started.elapsed().as_millis() as u64,
                "Marketplace search completed via skills.sh"
            );
            return Ok(skills);
        }
        Err(e) => {
            warn!(keyword = %trimmed, error = %e, "skills.sh search failed, falling back to skillsmp");
        }
    }

    let cache_query = MarketplaceQuery {
        sort_by: "all_time".to_string(),
        search: Some(trimmed.to_string()),
        category: filters.category.clone(),
        source: filters.source.clone(),
        platform: filters.platform.clone(),
        ..Default::default()
    };

    if let Some(cached_skills) = try_get_cached_skills(&state, &cache_query)? {
        info!(
            count = cached_skills.len(),
            keyword = %keyword,
            source = "skillsmp_cache",
            duration_ms = started.elapsed().as_millis() as u64,
            "Returning cached search results"
        );
        return Ok(cached_skills);
    }

    debug!(keyword = %trimmed, "Searching marketplace fallback API");
    let skills = client
        .fetch_skills_from_skillsmp(&cache_query)
        .await
        .map_err(|e| {
            error!(keyword = %trimmed, error = %e, "Marketplace search failed");
            CommandError::Network(e.to_string())
        })?;

    info!(
        count = skills.len(),
        keyword = %trimmed,
        source = "skillsmp",
        duration_ms = started.elapsed().as_millis() as u64,
        "Marketplace search completed"
    );
    Ok(skills)
}

/// Install a skill from marketplace using npx skills CLI
#[tauri::command]
pub fn install_marketplace_skill(
    state: State<'_, AppState>,
    owner: String,
    repo: String,
    skill: String,
) -> Result<InstallResult, CommandError> {
    info!(owner = %owner, repo = %repo, skill = %skill, "Installing marketplace skill");
    let installer = SkillInstaller::new();
    let result = installer.install_skill_by_name(&owner, &repo, &skill).map_err(|e| {
        error!(owner = %owner, repo = %repo, skill = %skill, error = %e, "Marketplace skill installation failed");
        CommandError::External(e.to_string())
    })?;

    if result.success {
        info!(owner = %owner, repo = %repo, skill = %skill, "Marketplace skill installed successfully");
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());
        let skill_id = format!("{}/{}/{}", owner, repo, skill);
        if let Err(e) = cache.update_skill_installed(&skill_id, true) {
            warn!(skill_id = %skill_id, error = %e, "Failed to update cache installed status");
        }
    } else {
        warn!(owner = %owner, repo = %repo, skill = %skill, message = ?result.message, "Marketplace skill installation returned failure");
    }

    Ok(result)
}

/// Uninstall a marketplace skill
#[tauri::command]
pub fn uninstall_marketplace_skill(
    state: State<'_, AppState>,
    owner: String,
    repo: String,
    skill: String,
) -> Result<InstallResult, CommandError> {
    info!(owner = %owner, repo = %repo, skill = %skill, "Uninstalling marketplace skill");
    let installer = SkillInstaller::new();
    let result = installer.uninstall_skill_by_name(&owner, &repo, &skill).map_err(|e| {
        error!(owner = %owner, repo = %repo, skill = %skill, error = %e, "Marketplace skill uninstall failed");
        CommandError::External(e.to_string())
    })?;

    if result.success {
        info!(owner = %owner, repo = %repo, skill = %skill, "Marketplace skill uninstalled successfully");
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());
        let skill_id = format!("{}/{}/{}", owner, repo, skill);
        if let Err(e) = cache.update_skill_installed(&skill_id, false) {
            warn!(skill_id = %skill_id, error = %e, "Failed to update cache uninstalled status");
        }
    } else {
        warn!(owner = %owner, repo = %repo, skill = %skill, message = ?result.message, "Marketplace skill uninstall returned failure");
    }

    Ok(result)
}

/// Refresh marketplace cache (force fetch from API)
#[tauri::command]
pub async fn refresh_marketplace_cache(
    state: State<'_, AppState>,
) -> Result<Vec<MarketplaceSkill>, CommandError> {
    info!("Refreshing marketplace cache");
    let client = MarketplaceClient::new();
    let query = MarketplaceQuery::default();

    if is_skills_sh_sort(&query.sort_by) {
        match client.fetch_skills_from_skills_sh(&query).await {
            Ok(skills) => {
                if let Err(e) = update_skills_sh_snapshot(&state, &query.sort_by, &skills) {
                    warn!(error = %e, sort = %query.sort_by, "Failed to write refreshed skills.sh snapshot");
                }
                info!(
                    count = skills.len(),
                    "Marketplace refresh completed via skills.sh"
                );
                return Ok(skills);
            }
            Err(e) => {
                warn!(error = %e, "skills.sh refresh failed, falling back to skillsmp cache refresh");
            }
        }
    }

    {
        let db = state.db.lock()?;
        let cache = MarketplaceCache::new(db.conn());
        if let Err(e) = cache.invalidate_skills_sh_snapshot(None) {
            warn!(error = %e, "Failed to invalidate skills.sh snapshot cache");
        }
        cache.invalidate_cache().map_err(|e| {
            error!(error = %e, "Failed to invalidate cache");
            CommandError::Database(e.to_string())
        })?;
        debug!("Cache invalidated");
    }

    debug!("Fetching fresh data from fallback marketplace API");
    let skills = client
        .fetch_skills_from_skillsmp(&query)
        .await
        .map_err(|e| {
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
    let node_info = get_nodejs_info_cached(false)?;
    info!(
        available = node_info.available,
        "Node.js availability check completed"
    );
    Ok(node_info.available)
}

/// Get Node.js version if available
#[tauri::command]
pub fn get_nodejs_version() -> Option<String> {
    debug!("Getting Node.js version");
    let version = get_nodejs_info_cached(false)
        .ok()
        .and_then(|info| info.version);
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
