//! Logging commands

use crate::error::CommandError;
use crate::logging::{self, LogInfo};
use tracing::{error, info};

/// Get log directory information
#[tauri::command]
pub fn get_log_info() -> Result<LogInfo, CommandError> {
    info!("Getting log directory information");
    logging::get_log_info_internal()
        .ok_or_else(|| CommandError::Io("Failed to get log directory info".into()))
}

/// Cleanup old log files manually
#[tauri::command]
pub fn cleanup_logs() -> Result<u32, CommandError> {
    info!("Manual log cleanup triggered");
    match logging::trigger_log_cleanup() {
        Ok(count) => {
            info!(deleted_count = count, "Log cleanup completed");
            Ok(count)
        }
        Err(e) => {
            error!(error = %e, "Log cleanup failed");
            Err(CommandError::Io(e.to_string()))
        }
    }
}
