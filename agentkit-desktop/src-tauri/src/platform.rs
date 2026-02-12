//! Platform Detection Module
//!
//! Detects installed AI coding tools by checking directories and CLI availability.

use crate::models::{LinkMode, Platform, PlatformInfo};
use std::path::PathBuf;
use std::process::Command;

/// Detect all supported platforms
pub fn detect_all_platforms() -> Vec<PlatformInfo> {
    let link_mode = determine_link_mode();
    Platform::all()
        .into_iter()
        .map(|platform| detect_platform_with_link_mode(platform, link_mode))
        .collect()
}

/// Detect a single platform
pub fn detect_platform(platform: Platform) -> PlatformInfo {
    detect_platform_with_link_mode(platform, determine_link_mode())
}

fn detect_platform_with_link_mode(platform: Platform, link_mode: LinkMode) -> PlatformInfo {
    let home_dir = dirs::home_dir();
    let base_path = home_dir.as_ref().map(|h| h.join(platform.base_path()));

    let detected = base_path.as_ref().map(|p| p.exists()).unwrap_or(false);

    let has_cli = check_cli_available(platform);

    PlatformInfo {
        platform,
        detected: detected || has_cli,
        base_path: if detected { base_path } else { None },
        has_cli,
        link_mode,
    }
}

/// Check if a platform's CLI is available in PATH
fn check_cli_available(platform: Platform) -> bool {
    let Some(cmd_name) = platform.cli_command() else {
        return false;
    };

    // On Windows, try both with and without .cmd/.exe extension
    #[cfg(target_os = "windows")]
    {
        let result = Command::new("where").arg(cmd_name).output();

        matches!(result, Ok(output) if output.status.success())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let result = Command::new("which").arg(cmd_name).output();

        matches!(result, Ok(output) if output.status.success())
    }
}

/// Determine the best link mode for the current OS
fn determine_link_mode() -> LinkMode {
    #[cfg(target_os = "windows")]
    {
        // Check if developer mode is enabled or we have admin rights
        if can_create_symlinks() {
            LinkMode::Symlink
        } else {
            LinkMode::Junction
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        LinkMode::Symlink
    }
}

/// Check if we can create symlinks on Windows
#[cfg(target_os = "windows")]
fn can_create_symlinks() -> bool {
    use std::env;
    use std::fs;

    let temp_dir = env::temp_dir();
    let test_target = temp_dir.join("agentkit_symlink_test_target");
    let test_link = temp_dir.join("agentkit_symlink_test_link");

    // Clean up any previous test files
    let _ = fs::remove_file(&test_link);
    let _ = fs::remove_file(&test_target);

    // Create a test file
    if fs::write(&test_target, "test").is_err() {
        return false;
    }

    // Try to create a symlink
    let result = std::os::windows::fs::symlink_file(&test_target, &test_link);

    // Clean up
    let _ = fs::remove_file(&test_link);
    let _ = fs::remove_file(&test_target);

    result.is_ok()
}

/// Get the full path for a platform's skills directory
pub fn get_skills_path(platform: Platform) -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(platform.skills_path()))
}

/// Get the full path for a platform's commands directory
pub fn get_commands_path(platform: Platform) -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(platform.commands_path()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_paths() {
        assert_eq!(Platform::Claude.skills_path(), ".claude/skills");
        assert_eq!(Platform::Claude.commands_path(), ".claude/commands");
        assert_eq!(Platform::Codex.commands_path(), ".codex/prompts");
    }

    #[test]
    fn test_platform_cli_commands() {
        assert_eq!(Platform::Claude.cli_command(), Some("claude"));
        assert_eq!(Platform::Cursor.cli_command(), None);
    }

    #[test]
    fn test_detect_all_platforms() {
        let platforms = detect_all_platforms();
        assert_eq!(platforms.len(), 12);
    }
}
