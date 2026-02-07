//! Logging Module
//!
//! Provides structured logging with:
//! - Daily log file rotation
//! - Automatic cleanup of logs older than 30 days
//! - Console output in development mode
//! - JSON format for production logs

use std::fs;
use std::path::PathBuf;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::{
    fmt::{self},
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
};

#[cfg(debug_assertions)]
use tracing_subscriber::fmt::format::FmtSpan;

/// Default log retention period in days
const LOG_RETENTION_DAYS: u64 = 30;

/// Log directory name
const LOG_DIR_NAME: &str = "logs";

/// Get the log directory path
pub fn get_log_dir() -> Option<PathBuf> {
    dirs::data_local_dir().map(|p| p.join("agentkit-desktop").join(LOG_DIR_NAME))
}

/// Initialize the logging system
///
/// Sets up:
/// - File logging with daily rotation
/// - Console logging (in debug builds)
/// - Environment-based log level filtering
pub fn init_logging() -> anyhow::Result<()> {
    let log_dir =
        get_log_dir().ok_or_else(|| anyhow::anyhow!("Failed to determine log directory"))?;

    // Ensure log directory exists
    fs::create_dir_all(&log_dir)?;

    // Clean up old logs before starting
    if let Err(e) = cleanup_old_logs(&log_dir, LOG_RETENTION_DAYS) {
        eprintln!("Warning: Failed to cleanup old logs: {}", e);
    }

    // Create file appender with daily rotation
    let file_appender = RollingFileAppender::new(Rotation::DAILY, &log_dir, "agentkit.log");

    // Build the subscriber
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        // Default log levels
        EnvFilter::new("agentkit_desktop=info,agentkit_desktop_lib=info,warn")
    });

    // File layer - JSON format for structured logging
    let file_layer = fmt::layer()
        .with_writer(file_appender)
        .with_ansi(false)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .json();

    // Console layer - human-readable format (only in debug builds)
    #[cfg(debug_assertions)]
    {
        let console_layer = fmt::layer()
            .with_target(true)
            .with_span_events(FmtSpan::CLOSE)
            .with_level(true)
            .pretty();

        tracing_subscriber::registry()
            .with(env_filter)
            .with(file_layer)
            .with(console_layer)
            .init();
    }

    #[cfg(not(debug_assertions))]
    {
        tracing_subscriber::registry()
            .with(env_filter)
            .with(file_layer)
            .init();
    }

    tracing::info!(
        log_dir = %log_dir.display(),
        retention_days = LOG_RETENTION_DAYS,
        "Logging system initialized"
    );

    Ok(())
}

/// Clean up log files older than the specified number of days
fn cleanup_old_logs(log_dir: &PathBuf, retention_days: u64) -> anyhow::Result<u32> {
    let mut deleted_count = 0;
    let now = std::time::SystemTime::now();
    let retention_duration = std::time::Duration::from_secs(retention_days * 24 * 60 * 60);

    if !log_dir.exists() {
        return Ok(0);
    }

    for entry in fs::read_dir(log_dir)? {
        let entry = entry?;
        let path = entry.path();

        // Only process log files
        if !path.is_file() {
            continue;
        }

        let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        if !file_name.starts_with("agentkit") || !file_name.contains(".log") {
            continue;
        }

        // Check file age
        if let Ok(metadata) = entry.metadata() {
            if let Ok(modified) = metadata.modified() {
                if let Ok(age) = now.duration_since(modified) {
                    if age > retention_duration {
                        if let Err(e) = fs::remove_file(&path) {
                            tracing::warn!(
                                path = %path.display(),
                                error = %e,
                                "Failed to delete old log file"
                            );
                        } else {
                            tracing::debug!(
                                path = %path.display(),
                                age_days = age.as_secs() / 86400,
                                "Deleted old log file"
                            );
                            deleted_count += 1;
                        }
                    }
                }
            }
        }
    }

    if deleted_count > 0 {
        tracing::info!(deleted_count, retention_days, "Cleaned up old log files");
    }

    Ok(deleted_count)
}

/// Manually trigger log cleanup (can be called from frontend)
pub fn trigger_log_cleanup() -> anyhow::Result<u32> {
    let log_dir =
        get_log_dir().ok_or_else(|| anyhow::anyhow!("Failed to determine log directory"))?;
    cleanup_old_logs(&log_dir, LOG_RETENTION_DAYS)
}

/// Get log directory info for display (internal implementation)
pub fn get_log_info_internal() -> Option<LogInfo> {
    let log_dir = get_log_dir()?;

    if !log_dir.exists() {
        return Some(LogInfo {
            path: log_dir.to_string_lossy().to_string(),
            file_count: 0,
            total_size_bytes: 0,
            oldest_log: None,
            newest_log: None,
        });
    }

    let mut file_count = 0;
    let mut total_size: u64 = 0;
    let mut oldest: Option<(String, std::time::SystemTime)> = None;
    let mut newest: Option<(String, std::time::SystemTime)> = None;

    if let Ok(entries) = fs::read_dir(&log_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if !file_name.starts_with("agentkit") || !file_name.contains(".log") {
                continue;
            }

            file_count += 1;

            if let Ok(metadata) = entry.metadata() {
                total_size += metadata.len();

                if let Ok(modified) = metadata.modified() {
                    let name = file_name.to_string();

                    match &oldest {
                        None => oldest = Some((name.clone(), modified)),
                        Some((_, t)) if modified < *t => oldest = Some((name.clone(), modified)),
                        _ => {}
                    }

                    match &newest {
                        None => newest = Some((name, modified)),
                        Some((_, t)) if modified > *t => newest = Some((name, modified)),
                        _ => {}
                    }
                }
            }
        }
    }

    Some(LogInfo {
        path: log_dir.to_string_lossy().to_string(),
        file_count,
        total_size_bytes: total_size,
        oldest_log: oldest.map(|(name, _)| name),
        newest_log: newest.map(|(name, _)| name),
    })
}

/// Log directory information
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LogInfo {
    pub path: String,
    pub file_count: u32,
    pub total_size_bytes: u64,
    pub oldest_log: Option<String>,
    pub newest_log: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_log_dir() {
        let log_dir = get_log_dir();
        assert!(log_dir.is_some());
        let path = log_dir.unwrap();
        assert!(path.to_string_lossy().contains("agentkit-desktop"));
        assert!(path.to_string_lossy().contains("logs"));
    }

    #[test]
    fn test_log_info_serialization() {
        let info = LogInfo {
            path: "/test/path".to_string(),
            file_count: 5,
            total_size_bytes: 1024,
            oldest_log: Some("agentkit.2024-01-01.log".to_string()),
            newest_log: Some("agentkit.2024-01-05.log".to_string()),
        };

        let json = serde_json::to_string(&info).unwrap();
        assert!(json.contains("/test/path"));
        assert!(json.contains("1024"));
    }
}
