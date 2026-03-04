use std::fs;
use std::path::{Component, Path, PathBuf};

use crate::config::paths::{commands_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, commands_source_dir};
use crate::core::discovery::find_skill_dirs;
use crate::core::fs_utils::walkdir_files;
use crate::core::skill_store::{
    SkillInstallMode, canonical_skill_path, copy_dir_replace, link_or_copy_dir, remove_path_any,
};
use crate::model::{InstallResult, ItemType, LinkMode};

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

fn safe_join_under(base: &Path, name: &str) -> Result<PathBuf, String> {
    validate_item_name(name)?;
    let normalized = PathBuf::from(name.replace('/', std::path::MAIN_SEPARATOR_STR));
    Ok(base.join(normalized))
}

fn install_result_error(item_name: &str, message: String, error: String) -> InstallResult {
    InstallResult {
        success: false,
        item_name: item_name.into(),
        message,
        error: Some(error),
    }
}

fn find_skill_src(project_root: &Path, name: &str) -> Option<PathBuf> {
    find_skill_dirs(&skills_src_dir(project_root))
        .into_iter()
        .find(|path| path.file_name().map(|file| file == name).unwrap_or(false))
}

pub fn install_skill(
    project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
    link_mode: LinkMode,
) -> InstallResult {
    if let Err(e) = validate_item_name(name) {
        return install_result_error(name, format!("Invalid skill name: {name}"), e);
    }

    let src = match safe_join_under(&skills_src_dir(project_root), name) {
        Ok(path) => find_skill_src(project_root, name).unwrap_or(path),
        Err(e) => return install_result_error(name, format!("Invalid skill name: {name}"), e),
    };
    if !src.exists() {
        return install_result_error(
            name,
            format!("Skill not found: {name}"),
            format!("{} does not exist", src.display()),
        );
    }
    if let Err(e) = fs::create_dir_all(platform.skills_path()) {
        return install_result_error(name, "Failed to create skill dir".into(), e.to_string());
    }

    let target = match safe_join_under(&platform.skills_path(), name) {
        Ok(path) => path,
        Err(e) => return install_result_error(name, format!("Invalid skill name: {name}"), e),
    };
    let canonical = canonical_skill_path(name);
    if let Err(e) = copy_dir_replace(&src, &canonical) {
        return install_result_error(
            name,
            format!("Failed to update canonical skill: {name}"),
            e.to_string(),
        );
    }

    match link_or_copy_dir(&canonical, &target, link_mode) {
        Ok(SkillInstallMode::Symlink) => InstallResult {
            success: true,
            item_name: name.into(),
            message: format!("Installed {name} (symlink)"),
            error: None,
        },
        Ok(SkillInstallMode::CopyFallback) => InstallResult {
            success: true,
            item_name: name.into(),
            message: match link_mode {
                LinkMode::Copy => format!("Installed {name} (copy)"),
                _ => format!("Installed {name} (copy fallback)"),
            },
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
    if let Err(e) = fs::create_dir_all(platform.commands_path()) {
        return install_result_error(name, "Failed to create command dir".into(), e.to_string());
    }

    let normalized = PathBuf::from(name.replace('/', std::path::MAIN_SEPARATOR_STR));
    let name_normalized = normalized.to_string_lossy().to_string();
    let src_file = find_file_by_stem(&src_dir, &name_normalized);
    let Some(src_file) = src_file else {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Command not found: {name}"),
            error: None,
        };
    };

    let rel = match src_file.strip_prefix(&src_dir) {
        Ok(path) => path,
        Err(e) => {
            return install_result_error(
                name,
                format!("Failed to install {name}"),
                format!("Invalid command source path: {e}"),
            );
        }
    };
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
    if !target.exists() && fs::symlink_metadata(&target).is_err() {
        return InstallResult {
            success: false,
            item_name: name.into(),
            message: format!("Not installed: {name}"),
            error: None,
        };
    }

    match remove_path_any(&target) {
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
    let normalized = PathBuf::from(name.replace('/', std::path::MAIN_SEPARATOR_STR));
    let name_normalized = normalized.to_string_lossy().to_string();
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
    link_mode: LinkMode,
) -> InstallResult {
    match item_type {
        ItemType::Skill => install_skill(project_root, platform, name, link_mode),
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

fn find_file_by_stem(dir: &Path, name: &str) -> Option<PathBuf> {
    let name_path = Path::new(name);
    walkdir_files(dir).into_iter().find(|file| {
        file.strip_prefix(dir)
            .ok()
            .map(|rel| rel.with_extension("") == name_path)
            .unwrap_or(false)
    })
}

fn prune_empty_parents(file: &Path, stop_at: &Path) {
    let mut parent = file.parent();
    while let Some(path) = parent {
        if path == stop_at || fs::remove_dir(path).is_err() {
            break;
        }
        parent = path.parent();
    }
}

#[cfg(test)]
#[path = "installer_tests.rs"]
mod installer_tests;
