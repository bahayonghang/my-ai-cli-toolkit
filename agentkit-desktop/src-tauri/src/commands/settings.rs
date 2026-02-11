//! Settings commands

use super::AppState;
use crate::error::CommandError;
use crate::models::Settings;
use crate::repository::SettingsRepository;
use tauri::State;
use tracing::{debug, error, info};

/// Get application settings
#[tauri::command]
pub fn get_settings(state: State<AppState>) -> Result<Settings, CommandError> {
    debug!("Getting application settings");
    let db = state.db.lock()?;
    let repo = SettingsRepository::new(db.conn());
    Ok(repo.get_settings().unwrap_or_default())
}

/// Update application settings
#[tauri::command]
pub fn update_settings(state: State<AppState>, settings: Settings) -> Result<(), CommandError> {
    info!("Updating application settings");
    let db = state.db.lock()?;
    let repo = SettingsRepository::new(db.conn());
    repo.save_settings(&settings).map_err(|e| {
        error!(error = %e, "Failed to save settings");
        CommandError::Database(e.to_string())
    })?;
    info!("Settings updated successfully");
    Ok(())
}
