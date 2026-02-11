//! AgentKit Desktop - Main Entry Point
//!
//! A cross-platform desktop application for managing AI coding tool resources.

// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use agentkit_desktop_lib::commands::{self, AppState};
use agentkit_desktop_lib::logging;
use std::path::PathBuf;

fn main() {
    // Initialize logging system first
    if let Err(e) = logging::init_logging() {
        eprintln!("Warning: Failed to initialize logging: {}", e);
    }

    tracing::info!("AgentKit Desktop starting...");

    // Determine source paths
    // In development, use the parent project's skills/commands directories
    // In production, use paths relative to the executable or user config
    let (skills_source, commands_source) = get_source_paths();

    tracing::info!(
        skills_source = %skills_source.display(),
        commands_source = %commands_source.display(),
        "Source paths configured"
    );

    let app_state = match AppState::with_paths(skills_source, commands_source) {
        Ok(state) => state,
        Err(e) => {
            tracing::error!("Failed to initialize application state: {}", e);
            eprintln!("Fatal: Failed to initialize application state: {}", e);
            std::process::exit(1);
        }
    };

    tracing::info!("Building Tauri application...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            // Platform commands
            commands::detect_platforms,
            commands::get_platforms,
            commands::get_platform_info,
            // Resource commands
            commands::get_resources,
            commands::get_resource_by_id,
            commands::install_resource,
            commands::uninstall_resource,
            commands::update_resource,
            commands::sync_resource,
            commands::refresh_resources,
            // External skills commands
            commands::get_external_skills,
            commands::install_external_skill,
            commands::check_external_handlers,
            // Settings commands
            commands::get_settings,
            commands::update_settings,
            // Marketplace commands
            commands::get_marketplace_skills,
            commands::search_marketplace,
            commands::install_marketplace_skill,
            commands::uninstall_marketplace_skill,
            commands::refresh_marketplace_cache,
            commands::get_marketplace_categories,
            commands::check_nodejs_available,
            commands::get_nodejs_version,
            commands::get_marketplace_cache_stats,
            // Logging commands
            commands::get_log_info,
            commands::cleanup_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Get the source paths for skills and commands
fn get_source_paths() -> (PathBuf, PathBuf) {
    // Try to find the parent project directory (my-claude-code-settings)
    if let Ok(exe_path) = std::env::current_exe() {
        tracing::debug!(exe_path = %exe_path.display(), "Executable path detected");

        // In development: exe is in target/debug or target/release
        // Go up to find the project root
        let mut path = exe_path.clone();
        for _ in 0..5 {
            path = match path.parent() {
                Some(p) => p.to_path_buf(),
                None => break,
            };

            // Check if this looks like the my-claude-code-settings directory
            let skills_path = path.join("skills");
            let commands_path = path.join("commands");

            if skills_path.exists() && commands_path.exists() {
                tracing::debug!(
                    project_root = %path.display(),
                    "Found project root directory"
                );
                return (skills_path, commands_path);
            }
        }
    }

    // Fallback: use current directory
    let cwd = std::env::current_dir().unwrap_or_default();
    tracing::warn!(
        cwd = %cwd.display(),
        "Using fallback current directory for source paths"
    );
    (cwd.join("skills"), cwd.join("commands"))
}
