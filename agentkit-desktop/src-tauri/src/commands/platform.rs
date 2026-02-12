//! Platform detection commands

use super::AppState;
use crate::database::Database;
use crate::error::CommandError;
use crate::models::{Platform, PlatformInfo};
use crate::platform::{detect_all_platforms, detect_platform};
use crate::repository::PlatformRepository;
use chrono::{DateTime, Utc};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Instant;
use tauri::State;
use tracing::{debug, error, info, warn};

const PLATFORM_CACHE_TTL_SECONDS: i64 = 10 * 60;
static PLATFORM_REFRESH_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Clone)]
struct CachedPlatformInfo {
    info: PlatformInfo,
    last_detected_at: Option<String>,
}

fn load_cached_platforms(
    state: &State<'_, AppState>,
) -> Result<Vec<CachedPlatformInfo>, CommandError> {
    let db = state.db.lock()?;
    let repo = PlatformRepository::new(db.conn());
    let records = repo
        .get_all()
        .map_err(|e| CommandError::Database(e.to_string()))?;

    Ok(records
        .into_iter()
        .map(
            |(platform, detected, base_path, link_mode, last_detected_at)| CachedPlatformInfo {
                info: PlatformInfo {
                    platform,
                    detected,
                    base_path: base_path.map(std::path::PathBuf::from),
                    has_cli: platform.cli_command().is_some(),
                    link_mode,
                },
                last_detected_at,
            },
        )
        .collect())
}

fn persist_platform_snapshot(repo: &PlatformRepository<'_>, platforms: &[PlatformInfo]) {
    for info in platforms {
        let base_path = info
            .base_path
            .as_ref()
            .map(|path| path.to_string_lossy().to_string());

        if let Err(e) = repo.update_detection(info.platform, info.detected, base_path.as_deref()) {
            warn!(
                platform = ?info.platform,
                error = %e,
                "Failed to update platform detection cache"
            );
        }
        if let Err(e) = repo.update_link_mode(info.platform, info.link_mode) {
            warn!(
                platform = ?info.platform,
                error = %e,
                "Failed to update platform link mode cache"
            );
        }
    }
}

fn parse_last_detected(timestamp: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(timestamp)
        .map(|dt| dt.with_timezone(&Utc))
        .ok()
}

fn should_refresh_cache(cached: &[CachedPlatformInfo]) -> bool {
    if cached.is_empty() {
        return true;
    }

    let now = Utc::now();
    cached.iter().any(|entry| {
        let Some(last) = entry
            .last_detected_at
            .as_deref()
            .and_then(parse_last_detected)
        else {
            return true;
        };
        (now - last).num_seconds() > PLATFORM_CACHE_TTL_SECONDS
    })
}

fn spawn_background_platform_refresh_if_needed() {
    if PLATFORM_REFRESH_IN_PROGRESS.swap(true, Ordering::AcqRel) {
        return;
    }

    let db_path = Database::default_path();
    std::thread::spawn(move || {
        let started = Instant::now();
        let platforms = detect_all_platforms();

        match Database::new(db_path) {
            Ok(db) => {
                let repo = PlatformRepository::new(db.conn());
                persist_platform_snapshot(&repo, &platforms);
                info!(
                    count = platforms.len(),
                    duration_ms = started.elapsed().as_millis() as u64,
                    "Background platform cache refresh completed"
                );
            }
            Err(e) => {
                error!(error = %e, "Background platform cache refresh failed");
            }
        }

        PLATFORM_REFRESH_IN_PROGRESS.store(false, Ordering::Release);
    });
}

fn detect_and_persist_platforms(
    state: &State<'_, AppState>,
) -> Result<Vec<PlatformInfo>, CommandError> {
    let started = Instant::now();
    let platforms = detect_all_platforms();

    {
        let db = state.db.lock()?;
        let repo = PlatformRepository::new(db.conn());
        persist_platform_snapshot(&repo, &platforms);
    }

    info!(
        count = platforms.len(),
        duration_ms = started.elapsed().as_millis() as u64,
        cache_hit = false,
        "Detected and persisted platform information"
    );
    Ok(platforms)
}

/// Detect all installed platforms
#[tauri::command]
pub fn detect_platforms(state: State<'_, AppState>) -> Result<Vec<String>, CommandError> {
    debug!("Detecting installed platforms");
    let platforms = refresh_platforms(state)?;
    let detected: Vec<String> = platforms
        .into_iter()
        .filter(|p| p.detected)
        .map(|p| p.platform.display_name().to_string())
        .collect();
    info!(count = detected.len(), "Detected platforms");
    Ok(detected)
}

/// Get detailed platform information (cache-first, stale-while-revalidate)
#[tauri::command]
pub fn get_platforms(state: State<'_, AppState>) -> Result<Vec<PlatformInfo>, CommandError> {
    let started = Instant::now();
    debug!("Getting all platform information");

    let cached = load_cached_platforms(&state)?;
    let cache_complete = cached
        .iter()
        .all(|entry| entry.last_detected_at.as_deref().is_some());

    if !cached.is_empty() && cache_complete {
        let should_refresh = should_refresh_cache(&cached);
        if should_refresh {
            spawn_background_platform_refresh_if_needed();
        }

        let platforms = cached
            .into_iter()
            .map(|entry| entry.info)
            .collect::<Vec<_>>();

        info!(
            count = platforms.len(),
            duration_ms = started.elapsed().as_millis() as u64,
            cache_hit = true,
            stale_refresh_started = should_refresh,
            "Returned cached platform information"
        );
        return Ok(platforms);
    }

    detect_and_persist_platforms(&state)
}

/// Force-refresh platform information from filesystem/CLI.
#[tauri::command]
pub fn refresh_platforms(state: State<'_, AppState>) -> Result<Vec<PlatformInfo>, CommandError> {
    detect_and_persist_platforms(&state)
}

/// Get platform info by name
#[tauri::command]
pub fn get_platform_info(platform: Platform) -> PlatformInfo {
    debug!(platform = ?platform, "Getting platform info");
    detect_platform(platform)
}
