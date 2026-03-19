use std::fs;
use std::path::{Path, PathBuf};

use similar::TextDiff;

use crate::config::paths::platforms_src_dir;
use crate::config::platform::{PlatformConfig, guidance_source_dir};
use crate::model::InstallResult;

pub fn supports_guidance(platform: &PlatformConfig) -> bool {
    platform.supports_guidance()
}

pub fn guidance_diff(project_root: &Path, platform: &PlatformConfig) -> (bool, String) {
    let local = match resolve_guidance_source_file(project_root, platform) {
        Some(path) => path,
        None => return (false, "Local guidance source not found".into()),
    };
    let global = match platform.guidance_path() {
        Some(path) => path,
        None => return (false, "No guidance file configured".into()),
    };

    let local_text = match fs::read_to_string(&local) {
        Ok(text) => text,
        Err(err) => return (false, format!("Error reading local guidance: {err}")),
    };

    if !global.exists() {
        return (
            true,
            format!(
                "Installed guidance does not exist yet at {} (will be created)",
                global.display()
            ),
        );
    }

    let global_text = match fs::read_to_string(&global) {
        Ok(text) => text,
        Err(err) => return (false, format!("Error reading installed guidance: {err}")),
    };

    let local_label = local
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("source guidance");
    let global_label = global
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("installed guidance");

    let diff = TextDiff::from_lines(&global_text, &local_text);
    let unified = diff
        .unified_diff()
        .header(
            &format!("Installed {global_label}"),
            &format!("Source {local_label}"),
        )
        .to_string();

    if unified.is_empty() {
        (false, String::new())
    } else {
        (true, unified)
    }
}

pub fn guidance_update(project_root: &Path, platform: &PlatformConfig) -> InstallResult {
    if !supports_guidance(platform) {
        return InstallResult {
            success: false,
            item_name: platform
                .guidance_file
                .clone()
                .unwrap_or_else(|| "guidance".into()),
            message: "Guidance management is not configured for this platform".into(),
            error: None,
        };
    }

    let local = match resolve_guidance_source_file(project_root, platform) {
        Some(path) => path,
        None => {
            return InstallResult {
                success: false,
                item_name: platform
                    .guidance_file
                    .clone()
                    .unwrap_or_else(|| "guidance".into()),
                message: "Guidance source file not found".into(),
                error: None,
            };
        }
    };
    let global = match platform.guidance_path() {
        Some(path) => path,
        None => {
            return InstallResult {
                success: false,
                item_name: platform
                    .guidance_file
                    .clone()
                    .unwrap_or_else(|| "guidance".into()),
                message: "No guidance target path".into(),
                error: None,
            };
        }
    };

    if let Some(parent) = global.parent()
        && let Err(err) = fs::create_dir_all(parent)
    {
        return InstallResult {
            success: false,
            item_name: file_label(&global),
            message: "Failed to prepare guidance directory".into(),
            error: Some(err.to_string()),
        };
    }

    if global.exists() {
        let ts = chrono_timestamp();
        let backup_name = format!("{}.backup_{ts}", file_label(&global));
        let backup = global.with_file_name(backup_name);
        if let Err(err) = fs::copy(&global, &backup) {
            return InstallResult {
                success: false,
                item_name: file_label(&global),
                message: "Failed to create guidance backup".into(),
                error: Some(err.to_string()),
            };
        }
    }

    match fs::copy(&local, &global) {
        Ok(_) => InstallResult {
            success: true,
            item_name: file_label(&global),
            message: "Updated guidance".into(),
            error: None,
        },
        Err(err) => InstallResult {
            success: false,
            item_name: file_label(&global),
            message: "Failed to update guidance".into(),
            error: Some(err.to_string()),
        },
    }
}

pub fn resolve_guidance_source_file(
    project_root: &Path,
    platform: &PlatformConfig,
) -> Option<PathBuf> {
    let target_file = platform.guidance_file.as_deref()?;
    let guidance_root = guidance_source_dir(platform, &platforms_src_dir(project_root));
    if !guidance_root.exists() {
        return None;
    }

    let variant = if cfg!(windows) { "Windows" } else { "Unix" };
    let variant_path = guidance_root.join(variant).join(target_file);
    if variant_path.exists() {
        return Some(variant_path);
    }

    let direct_path = guidance_root.join(target_file);
    if direct_path.exists() {
        return Some(direct_path);
    }

    let mut candidates = [guidance_root.join("Unix"), guidance_root.join("Windows")]
        .into_iter()
        .map(|dir| dir.join(target_file))
        .collect::<Vec<_>>();
    candidates.sort();
    candidates.into_iter().find(|path| path.exists())
}

fn file_label(path: &Path) -> String {
    path.file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("guidance")
        .to_string()
}

fn chrono_timestamp() -> String {
    use std::time::SystemTime;
    let d = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default();
    format!("{}", d.as_secs())
}
