use std::fs;
use std::path::Path;

use similar::TextDiff;

use crate::config::paths::prompts_src_dir;
use crate::config::platform::PlatformConfig;
use crate::model::InstallResult;

/// Check if platform supports prompt management (Claude only)
pub fn supports_prompt(platform: &PlatformConfig) -> bool {
    platform.prompt_file.is_some()
}

/// Get diff between local and global CLAUDE.md
pub fn prompt_diff(project_root: &Path, platform: &PlatformConfig) -> (bool, String) {
    let local = prompts_src_dir(project_root).join("CLAUDE.md");
    let global = match platform.prompt_path() {
        Some(p) => p,
        None => return (false, "No prompt file configured".into()),
    };

    let local_text = match fs::read_to_string(&local) {
        Ok(t) => t,
        Err(_) => return (false, "Local CLAUDE.md not found".into()),
    };

    if !global.exists() {
        return (
            true,
            "Global CLAUDE.md does not exist (will be created)".into(),
        );
    }

    let global_text = match fs::read_to_string(&global) {
        Ok(t) => t,
        Err(e) => return (false, format!("Error reading global: {e}")),
    };

    let diff = TextDiff::from_lines(&global_text, &local_text);
    let unified = diff
        .unified_diff()
        .header("Global CLAUDE.md", "Local CLAUDE.md")
        .to_string();

    if unified.is_empty() {
        (false, String::new())
    } else {
        (true, unified)
    }
}

/// Update global CLAUDE.md from local source
pub fn prompt_update(project_root: &Path, platform: &PlatformConfig) -> InstallResult {
    if !supports_prompt(platform) {
        return InstallResult {
            success: false,
            item_name: "CLAUDE.md".into(),
            message: "Prompt management not configured for this platform".into(),
            error: None,
        };
    }
    let local = prompts_src_dir(project_root).join("CLAUDE.md");
    let global = match platform.prompt_path() {
        Some(p) => p,
        None => {
            return InstallResult {
                success: false,
                item_name: "CLAUDE.md".into(),
                message: "No prompt path".into(),
                error: None,
            };
        }
    };

    // Backup existing
    if global.exists() {
        let ts = chrono_timestamp();
        let backup = global.with_file_name(format!("CLAUDE.md.backup_{ts}"));
        if let Err(e) = fs::copy(&global, &backup) {
            return InstallResult {
                success: false,
                item_name: "CLAUDE.md".into(),
                message: "Failed to create backup".into(),
                error: Some(e.to_string()),
            };
        }
    }

    match fs::copy(&local, &global) {
        Ok(_) => InstallResult {
            success: true,
            item_name: "CLAUDE.md".into(),
            message: "Updated".into(),
            error: None,
        },
        Err(e) => InstallResult {
            success: false,
            item_name: "CLAUDE.md".into(),
            message: "Failed".into(),
            error: Some(e.to_string()),
        },
    }
}

fn chrono_timestamp() -> String {
    use std::time::SystemTime;
    let d = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default();
    format!("{}", d.as_secs())
}
