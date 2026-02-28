use std::fs;
use std::path::{Component, Path, PathBuf};

use crate::config::paths::{commands_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, commands_source_dir};
use crate::core::discovery::find_skill_dirs;
use crate::core::fs_utils::walkdir_files;
use crate::model::{InstallResult, ItemType};

/// Ensure target directories exist
fn ensure_dirs(platform: &PlatformConfig) -> std::io::Result<()> {
    fs::create_dir_all(platform.skills_path())?;
    fs::create_dir_all(platform.commands_path())?;
    Ok(())
}

fn validate_item_name(name: &str) -> Result<(), String> {
    if name.trim().is_empty() {
        return Err("Item name cannot be empty".into());
    }

    let normalized = name.trim().replace('\\', "/");
    let candidate = Path::new(&normalized);
    if candidate.is_absolute() {
        return Err(format!("Item name must be relative: {name}"));
    }

    for component in candidate.components() {
        match component {
            Component::Prefix(_) | Component::RootDir | Component::ParentDir => {
                return Err(format!("Invalid path component in item name: {name}"));
            }
            Component::CurDir => {
                return Err(format!("Current-directory component not allowed: {name}"));
            }
            Component::Normal(_) => {}
        }
    }

    Ok(())
}

fn normalized_path(name: &str) -> PathBuf {
    PathBuf::from(name.replace('/', std::path::MAIN_SEPARATOR_STR))
}

fn safe_join_under(base: &Path, name: &str) -> Result<PathBuf, String> {
    validate_item_name(name)?;
    Ok(base.join(normalized_path(name)))
}

fn install_result_error(item_name: &str, message: String, error: String) -> InstallResult {
    InstallResult {
        success: false,
        item_name: item_name.into(),
        message,
        error: Some(error),
    }
}

fn find_skill_src(project_root: &Path, name: &str) -> Option<std::path::PathBuf> {
    find_skill_dirs(&skills_src_dir(project_root))
        .into_iter()
        .find(|p| p.file_name().map(|f| f == name).unwrap_or(false))
}

pub fn install_skill(project_root: &Path, platform: &PlatformConfig, name: &str) -> InstallResult {
    if let Err(e) = validate_item_name(name) {
        return install_result_error(name, format!("Invalid skill name: {name}"), e);
    }

    let fallback_src = match safe_join_under(&skills_src_dir(project_root), name) {
        Ok(path) => path,
        Err(e) => return install_result_error(name, format!("Invalid skill name: {name}"), e),
    };
    let src = find_skill_src(project_root, name).unwrap_or(fallback_src);
    if !src.exists() {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Skill not found: {name}"),
            error: Some(format!("{} does not exist", src.display())),
        };
    }
    if let Err(e) = ensure_dirs(platform) {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: "Failed to create dirs".into(),
            error: Some(e.to_string()),
        };
    }
    let target = match safe_join_under(&platform.skills_path(), name) {
        Ok(path) => path,
        Err(e) => return install_result_error(name, format!("Invalid skill name: {name}"), e),
    };
    // Remove old if exists
    if target.exists()
        && let Err(e) = fs::remove_dir_all(&target)
    {
        return install_result_error(
            name,
            format!("Failed to replace existing install: {name}"),
            e.to_string(),
        );
    }
    let opts = fs_extra::dir::CopyOptions::new();
    match fs_extra::dir::copy(&src, platform.skills_path(), &opts) {
        Ok(_) => InstallResult {
            success: true,
            item_name: name.into(),
            message: format!("Installed {name}"),
            error: None,
        },
        Err(e) => InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Failed to install {name}"),
            error: Some(e.to_string()),
        },
    }
}

pub fn install_command(
    project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
) -> InstallResult {
    if let Err(e) = validate_item_name(name) {
        return install_result_error(name, format!("Invalid command name: {name}"), e);
    }

    let commands_base = commands_src_dir(project_root);
    let src_dir = commands_source_dir(platform, &commands_base);
    if !src_dir.exists() {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: "Commands dir not found".into(),
            error: None,
        };
    }
    if let Err(e) = ensure_dirs(platform) {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: "Failed to create dirs".into(),
            error: Some(e.to_string()),
        };
    }

    // Find source file matching name (without extension)
    let name_normalized = normalized_path(name).to_string_lossy().to_string();
    let src_file = find_file_by_stem(&src_dir, &name_normalized);
    let Some(src_file) = src_file else {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Command not found: {name}"),
            error: None,
        };
    };

    let rel = src_file.strip_prefix(&src_dir).unwrap();
    let target = platform.commands_path().join(rel);
    if let Some(parent) = target.parent()
        && let Err(e) = fs::create_dir_all(parent)
    {
        return install_result_error(
            name,
            format!("Failed to prepare install target: {name}"),
            e.to_string(),
        );
    }
    match fs::copy(&src_file, &target) {
        Ok(_) => InstallResult {
            success: true,
            item_name: name.into(),
            message: format!("Installed {name}"),
            error: None,
        },
        Err(e) => InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Failed to install {name}"),
            error: Some(e.to_string()),
        },
    }
}

pub fn uninstall_skill(platform: &PlatformConfig, name: &str) -> InstallResult {
    let target = match safe_join_under(&platform.skills_path(), name) {
        Ok(path) => path,
        Err(e) => return install_result_error(name, format!("Invalid skill name: {name}"), e),
    };
    if !target.exists() {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Not installed: {name}"),
            error: None,
        };
    }
    match fs::remove_dir_all(&target) {
        Ok(_) => InstallResult {
            success: true,
            item_name: name.into(),
            message: format!("Uninstalled {name}"),
            error: None,
        },
        Err(e) => InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Failed: {name}"),
            error: Some(e.to_string()),
        },
    }
}

pub fn uninstall_command(platform: &PlatformConfig, name: &str) -> InstallResult {
    if let Err(e) = validate_item_name(name) {
        return install_result_error(name, format!("Invalid command name: {name}"), e);
    }

    let target_dir = platform.commands_path();
    let name_normalized = normalized_path(name).to_string_lossy().to_string();
    let target_file = find_file_by_stem(&target_dir, &name_normalized);
    let Some(target_file) = target_file else {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Not installed: {name}"),
            error: None,
        };
    };
    match fs::remove_file(&target_file) {
        Ok(_) => {
            // Prune empty parent dirs up to commands_path
            prune_empty_parents(&target_file, &target_dir);
            InstallResult {
                success: true,
                item_name: name.into(),
                message: format!("Uninstalled {name}"),
                error: None,
            }
        }
        Err(e) => InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Failed: {name}"),
            error: Some(e.to_string()),
        },
    }
}

pub fn install_item(
    project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
    item_type: ItemType,
) -> InstallResult {
    match item_type {
        ItemType::Skill => install_skill(project_root, platform, name),
        ItemType::Command => install_command(project_root, platform, name),
    }
}

pub fn uninstall_item(
    _project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
    item_type: ItemType,
) -> InstallResult {
    match item_type {
        ItemType::Skill => uninstall_skill(platform, name),
        ItemType::Command => uninstall_command(platform, name),
    }
}

fn find_file_by_stem(dir: &Path, name: &str) -> Option<std::path::PathBuf> {
    let name_path = std::path::Path::new(name);
    walkdir_files(dir).into_iter().find(|f| {
        f.strip_prefix(dir)
            .ok()
            .map(|rel| rel.with_extension("") == name_path)
            .unwrap_or(false)
    })
}

fn prune_empty_parents(file: &Path, stop_at: &Path) {
    let mut parent = file.parent();
    while let Some(p) = parent {
        if p == stop_at {
            break;
        }
        if fs::remove_dir(p).is_err() {
            break;
        } // non-empty → stop
        parent = p.parent();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validate_item_name_rejects_parent_dir() {
        let result = validate_item_name("../escape");
        assert!(result.is_err());
    }

    #[test]
    fn validate_item_name_rejects_absolute_path() {
        #[cfg(windows)]
        let candidate = "C:/absolute/path";
        #[cfg(not(windows))]
        let candidate = "/absolute/path";

        let result = validate_item_name(candidate);
        assert!(result.is_err());
    }

    #[test]
    fn validate_item_name_accepts_nested_relative_path() {
        let result = validate_item_name("nested/command/name");
        assert!(result.is_ok());
    }
}
