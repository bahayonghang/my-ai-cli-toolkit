//! Utility functions for AgentKit Desktop
//!
//! Common utilities shared across modules, including cross-platform
//! executable resolution for Windows environments.

use std::path::PathBuf;
use std::process::Command;
use thiserror::Error;
#[cfg(target_os = "windows")]
use tracing::{debug, warn};

/// Find executable in PATH or common locations (Windows-specific fallback)
#[cfg(target_os = "windows")]
pub fn find_executable(name: &str) -> Option<PathBuf> {
    // Try standard PATH lookup first
    if let Ok(output) = Command::new("where.exe").arg(name).output() {
        if output.status.success() {
            let paths = String::from_utf8_lossy(&output.stdout);
            if let Some(first_path) = paths.lines().next() {
                let path = PathBuf::from(first_path.trim());
                if path.exists() {
                    debug!(executable = %name, path = %path.display(), "Found executable via where.exe");
                    return Some(path);
                }
            }
        }
    }

    // Fallback: check common installation locations
    let home = std::env::var("USERPROFILE").ok()?;
    let common_paths = vec![
        // Scoop
        format!("{}\\scoop\\apps\\nodejs\\current\\{}.cmd", home, name),
        format!("{}\\scoop\\apps\\nodejs\\current\\{}.exe", home, name),
        format!("{}\\scoop\\shims\\{}.exe", home, name),
        format!("{}\\scoop\\shims\\{}.cmd", home, name),
        // npm global
        format!(
            "C:\\Users\\{}\\.npm-global\\{}.cmd",
            home.split('\\').next_back()?,
            name
        ),
        // Standard Node.js
        format!("C:\\Program Files\\nodejs\\{}.cmd", name),
        format!("C:\\Program Files\\nodejs\\{}.exe", name),
        format!("C:\\Program Files (x86)\\nodejs\\{}.cmd", name),
        format!("C:\\Program Files (x86)\\nodejs\\{}.exe", name),
        // User AppData
        format!("{}\\AppData\\Roaming\\npm\\{}.cmd", home, name),
        // nvm for Windows
        format!("{}\\AppData\\Roaming\\nvm\\current\\{}.cmd", home, name),
        format!("{}\\AppData\\Roaming\\nvm\\current\\{}.exe", home, name),
        // fnm (Fast Node Manager)
        format!("{}\\AppData\\Local\\fnm_multishells\\*\\{}.cmd", home, name),
    ];

    for path_str in common_paths {
        // Handle glob patterns for fnm
        if path_str.contains('*') {
            if let Some(parent) = PathBuf::from(&path_str).parent() {
                if let Ok(entries) = std::fs::read_dir(parent) {
                    for entry in entries.flatten() {
                        let candidate = entry.path().join(format!("{}.cmd", name));
                        if candidate.exists() {
                            debug!(executable = %name, path = %candidate.display(), "Found executable via fnm glob");
                            return Some(candidate);
                        }
                    }
                }
            }
            continue;
        }

        let path = PathBuf::from(&path_str);
        if path.exists() {
            debug!(executable = %name, path = %path.display(), "Found executable via fallback search");
            return Some(path);
        }
    }

    warn!(
        executable = %name,
        "Executable not found in PATH or common locations"
    );
    None
}

/// Find executable in PATH (Unix-like systems)
#[cfg(not(target_os = "windows"))]
pub fn find_executable(name: &str) -> Option<PathBuf> {
    // On Unix-like systems, rely on PATH
    if Command::new("which")
        .arg(name)
        .output()
        .ok()?
        .status
        .success()
    {
        Some(PathBuf::from(name))
    } else {
        None
    }
}

/// Create a Command with proper executable resolution
///
/// On Windows, this function attempts to find the executable in common
/// installation locations if it's not found in PATH. This is necessary
/// because GUI applications may not inherit the full PATH environment.
pub fn create_command(name: &str) -> Command {
    #[cfg(target_os = "windows")]
    {
        if let Some(path) = find_executable(name) {
            Command::new(path)
        } else {
            // Fallback to original behavior
            Command::new(name)
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new(name)
    }
}

#[derive(Debug, PartialEq, Error)]
pub enum ValidationError {
    #[error("Name contains path traversal sequence: {0}")]
    PathTraversal(String),
    #[error("Name contains invalid characters: {0}")]
    InvalidChars(String),
    #[error("Name exceeds maximum length of {0}")]
    TooLong(usize),
    #[error("Name is empty")]
    Empty,
}

/// Sanitize a resource/skill name to prevent path traversal attacks.
/// Allows: alphanumeric, `@`, `.`, `_`, `-` (for npm scoped packages).
pub fn sanitize_name(name: &str) -> Result<&str, ValidationError> {
    if name.is_empty() {
        return Err(ValidationError::Empty);
    }
    if name.len() > 255 {
        return Err(ValidationError::TooLong(255));
    }
    if name.contains("..") || name.contains('\0') {
        return Err(ValidationError::PathTraversal(name.to_string()));
    }
    if name.contains('/') || name.contains('\\') || name.starts_with('.') {
        return Err(ValidationError::PathTraversal(name.to_string()));
    }
    if !name
        .chars()
        .all(|c| c.is_alphanumeric() || "@._-".contains(c))
    {
        return Err(ValidationError::InvalidChars(name.to_string()));
    }
    Ok(name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_executable_node() {
        let result = find_executable("node");
        println!("node executable: {:?}", result);
    }

    #[test]
    fn test_find_executable_npx() {
        let result = find_executable("npx");
        println!("npx executable: {:?}", result);
    }

    #[test]
    fn test_create_command() {
        let cmd = create_command("node");
        println!("Created command for node: {:?}", cmd);
    }

    #[test]
    fn test_sanitize_name_valid() {
        assert_eq!(sanitize_name("my-skill"), Ok("my-skill"));
        assert_eq!(sanitize_name("@scope_pkg"), Ok("@scope_pkg"));
        assert_eq!(sanitize_name("skill.v2"), Ok("skill.v2"));
    }

    #[test]
    fn test_sanitize_name_rejects_traversal() {
        assert!(sanitize_name("..").is_err());
        assert!(sanitize_name(".hidden").is_err());
        assert!(sanitize_name("a/b").is_err());
        assert!(sanitize_name("a\\b").is_err());
    }

    #[test]
    fn test_sanitize_name_rejects_empty_and_long() {
        assert!(sanitize_name("").is_err());
        assert!(sanitize_name(&"a".repeat(256)).is_err());
    }

    #[test]
    fn test_sanitize_name_rejects_invalid_chars() {
        assert!(sanitize_name("skill name").is_err());
        assert!(sanitize_name("skill;rm").is_err());
    }
}
