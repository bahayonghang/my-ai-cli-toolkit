//! AgentKit Desktop - Main Entry Point
//!
//! A cross-platform desktop application for managing AI coding tool resources.

// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use agentkit_desktop_lib::commands::{self, AppState};
use std::path::PathBuf;

fn main() {
    // Determine source paths
    // In development, use the parent project's skills/commands directories
    // In production, use paths relative to the executable or user config
    let (skills_source, commands_source) = get_source_paths();

    let app_state = AppState::with_paths(skills_source, commands_source);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::detect_platforms,
            commands::get_platforms,
            commands::get_platform_info,
            commands::get_resources,
            commands::get_resource_by_id,
            commands::install_resource,
            commands::uninstall_resource,
            commands::update_resource,
            commands::get_external_skills,
            commands::install_external_skill,
            commands::get_settings,
            commands::update_settings,
            commands::sync_resource,
            commands::refresh_resources,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Get the source paths for skills and commands
fn get_source_paths() -> (PathBuf, PathBuf) {
    // Try to find the parent project directory (my-claude-code-settings)
    if let Ok(exe_path) = std::env::current_exe() {
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
                return (skills_path, commands_path);
            }
        }
    }

    // Fallback: use current directory
    let cwd = std::env::current_dir().unwrap_or_default();
    (cwd.join("skills"), cwd.join("commands"))
}
