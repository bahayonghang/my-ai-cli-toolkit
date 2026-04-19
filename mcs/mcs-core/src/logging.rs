use std::env;
use std::fs;
use std::path::PathBuf;

use tracing_subscriber::EnvFilter;

use crate::config::paths::home_dir;
use crate::error::AppError;

const LOG_DIR_ENV: &str = "MCS_LOG_DIR";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppLogKind {
    Web,
    Tui,
}

pub fn init_logging(kind: AppLogKind) -> Result<(), AppError> {
    match kind {
        AppLogKind::Web => init_web_logging(),
        AppLogKind::Tui => init_tui_logging(),
    }
}

pub fn resolve_log_dir() -> PathBuf {
    env::var_os(LOG_DIR_ENV)
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(default_log_dir)
}

fn default_log_dir() -> PathBuf {
    home_dir().join(".mcs").join("logs")
}

fn init_web_logging() -> Result<(), AppError> {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("warn,mcs::skills=info"));

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .try_init()
        .map_err(|err| AppError::Validation(format!("failed to initialize web logger: {err}")))
}

fn init_tui_logging() -> Result<(), AppError> {
    let log_dir = resolve_log_dir();
    fs::create_dir_all(&log_dir)?;

    let log_file = log_dir.join("mcs-tui.log");
    let file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file)?;

    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("warn"));

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_ansi(false)
        .with_writer(file)
        .try_init()
        .map_err(|err| AppError::Validation(format!("failed to initialize tui logger: {err}")))
}
