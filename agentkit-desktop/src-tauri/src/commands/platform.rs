//! Platform detection commands

use crate::models::{Platform, PlatformInfo};
use crate::platform::{detect_all_platforms, detect_platform};
use tracing::{debug, info};

/// Detect all installed platforms
#[tauri::command]
pub fn detect_platforms() -> Vec<String> {
    debug!("Detecting installed platforms");
    let platforms: Vec<String> = detect_all_platforms()
        .into_iter()
        .filter(|p| p.detected)
        .map(|p| p.platform.display_name().to_string())
        .collect();
    info!(
        count = platforms.len(),
        "Detected platforms: {:?}", platforms
    );
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
