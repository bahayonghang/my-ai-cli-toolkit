use std::fs;
use std::path::{Component, Path, PathBuf};

use crate::config::paths::{platforms_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, agents_source_dir, commands_source_dir};
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
    tracing::info!(
        platform = platform.name.as_str(),
        item = name,
        operation = "install_skill",
        "Starting install operation"
    );

    let result = (|| {
        if let Err(e) = validate_item_name(name) {
            return install_result_error(name, format!("Invalid skill name: {name}"), e);
        }

        let src = match safe_join_under(&skills_src_dir(project_root), name) {
            Ok(path) => find_skill_src(project_root, name).unwrap_or(path),
            Err(e) => {
                return install_result_error(name, format!("Invalid skill name: {name}"), e);
            }
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
            Err(e) => {
                return install_result_error(name, format!("Invalid skill name: {name}"), e);
            }
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
    })();

    if result.success {
        tracing::info!(
            platform = platform.name.as_str(),
            item = name,
            operation = "install_skill",
            message = result.message.as_str(),
            "Install operation completed"
        );
    } else {
        tracing::warn!(
            platform = platform.name.as_str(),
            item = name,
            operation = "install_skill",
            message = result.message.as_str(),
            error = result.error.as_deref().unwrap_or(""),
            "Install operation failed"
        );
    }

    result
}

pub fn install_command(
    project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
) -> InstallResult {
    install_file_item(project_root, platform, name, ItemType::Command)
}

pub fn install_agent(project_root: &Path, platform: &PlatformConfig, name: &str) -> InstallResult {
    install_file_item(project_root, platform, name, ItemType::Agent)
}

pub fn uninstall_skill(platform: &PlatformConfig, name: &str) -> InstallResult {
    tracing::info!(
        platform = platform.name.as_str(),
        item = name,
        operation = "uninstall_skill",
        "Starting uninstall operation"
    );

    let result = (|| {
        let target = match safe_join_under(&platform.skills_path(), name) {
            Ok(path) => path,
            Err(e) => {
                return install_result_error(name, format!("Invalid skill name: {name}"), e);
            }
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
    })();

    if result.success {
        tracing::info!(
            platform = platform.name.as_str(),
            item = name,
            operation = "uninstall_skill",
            message = result.message.as_str(),
            "Uninstall operation completed"
        );
    } else {
        tracing::warn!(
            platform = platform.name.as_str(),
            item = name,
            operation = "uninstall_skill",
            message = result.message.as_str(),
            error = result.error.as_deref().unwrap_or(""),
            "Uninstall operation failed"
        );
    }

    result
}

pub fn uninstall_command(platform: &PlatformConfig, name: &str) -> InstallResult {
    uninstall_file_item(platform, name, ItemType::Command)
}

pub fn uninstall_agent(platform: &PlatformConfig, name: &str) -> InstallResult {
    uninstall_file_item(platform, name, ItemType::Agent)
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
        ItemType::Agent => install_agent(project_root, platform, name),
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
        ItemType::Agent => uninstall_agent(platform, name),
    }
}

fn install_file_item(
    project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
    item_type: ItemType,
) -> InstallResult {
    let operation = match item_type {
        ItemType::Command => "install_command",
        ItemType::Agent => "install_agent",
        _ => "install_file_item",
    };
    tracing::info!(
        platform = platform.name.as_str(),
        item = name,
        operation,
        "Starting install operation"
    );

    let result = (|| {
        if !platform_supports_file_item(platform, item_type) {
            return InstallResult {
                success: false,
                item_name: name.into(),
                message: format!(
                    "{} are not managed for platform '{}'",
                    item_type_label_plural(item_type),
                    platform.name
                ),
                error: None,
            };
        }

        if let Err(e) = validate_item_name(name) {
            return install_result_error(
                name,
                format!("Invalid {} name: {name}", item_type_label(item_type)),
                e,
            );
        }

        let platforms_base = platforms_src_dir(project_root);
        let (src_dir, target_dir) = file_item_dirs(platform, &platforms_base, item_type);
        if !src_dir.exists() {
            return InstallResult {
                success: false,
                item_name: name.into(),
                message: format!("{} dir not found", item_type_label(item_type)),
                error: None,
            };
        }
        if let Err(e) = fs::create_dir_all(&target_dir) {
            return install_result_error(
                name,
                format!("Failed to create {} dir", item_type_label(item_type)),
                e.to_string(),
            );
        }

        let normalized = PathBuf::from(name.replace('/', std::path::MAIN_SEPARATOR_STR));
        let name_normalized = normalized.to_string_lossy().to_string();
        let src_file = find_file_by_stem(&src_dir, &name_normalized);
        let Some(src_file) = src_file else {
            return InstallResult {
                success: false,
                item_name: name.into(),
                message: format!("{} not found: {name}", item_type_label(item_type)),
                error: None,
            };
        };

        let rel = match src_file.strip_prefix(&src_dir) {
            Ok(path) => path,
            Err(e) => {
                return install_result_error(
                    name,
                    format!("Failed to install {name}"),
                    format!("Invalid {} source path: {e}", item_type_label(item_type)),
                );
            }
        };
        let target = target_dir.join(rel);
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
    })();

    if result.success {
        tracing::info!(
            platform = platform.name.as_str(),
            item = name,
            operation,
            message = result.message.as_str(),
            "Install operation completed"
        );
    } else {
        tracing::warn!(
            platform = platform.name.as_str(),
            item = name,
            operation,
            message = result.message.as_str(),
            error = result.error.as_deref().unwrap_or(""),
            "Install operation failed"
        );
    }

    result
}

fn uninstall_file_item(
    platform: &PlatformConfig,
    name: &str,
    item_type: ItemType,
) -> InstallResult {
    let operation = match item_type {
        ItemType::Command => "uninstall_command",
        ItemType::Agent => "uninstall_agent",
        _ => "uninstall_file_item",
    };
    tracing::info!(
        platform = platform.name.as_str(),
        item = name,
        operation,
        "Starting uninstall operation"
    );

    let result = (|| {
        if !platform_supports_file_item(platform, item_type) {
            return InstallResult {
                success: false,
                item_name: name.into(),
                message: format!(
                    "{} are not managed for platform '{}'",
                    item_type_label_plural(item_type),
                    platform.name
                ),
                error: None,
            };
        }

        if let Err(e) = validate_item_name(name) {
            return install_result_error(
                name,
                format!("Invalid {} name: {name}", item_type_label(item_type)),
                e,
            );
        }

        let target_dir = file_item_target_dir(platform, item_type);
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
    })();

    if result.success {
        tracing::info!(
            platform = platform.name.as_str(),
            item = name,
            operation,
            message = result.message.as_str(),
            "Uninstall operation completed"
        );
    } else {
        tracing::warn!(
            platform = platform.name.as_str(),
            item = name,
            operation,
            message = result.message.as_str(),
            error = result.error.as_deref().unwrap_or(""),
            "Uninstall operation failed"
        );
    }

    result
}

fn platform_supports_file_item(platform: &PlatformConfig, item_type: ItemType) -> bool {
    match item_type {
        ItemType::Command => platform.supports_commands(),
        ItemType::Agent => platform.supports_agents(),
        _ => false,
    }
}

fn file_item_dirs(
    platform: &PlatformConfig,
    platforms_base: &Path,
    item_type: ItemType,
) -> (PathBuf, PathBuf) {
    match item_type {
        ItemType::Command => (
            commands_source_dir(platform, platforms_base),
            platform.commands_path(),
        ),
        ItemType::Agent => (
            agents_source_dir(platform, platforms_base),
            platform.agents_path(),
        ),
        _ => unreachable!("unsupported file item type"),
    }
}

fn file_item_target_dir(platform: &PlatformConfig, item_type: ItemType) -> PathBuf {
    match item_type {
        ItemType::Command => platform.commands_path(),
        ItemType::Agent => platform.agents_path(),
        _ => unreachable!("unsupported file item type"),
    }
}

fn item_type_label(item_type: ItemType) -> &'static str {
    match item_type {
        ItemType::Skill => "Skill",
        ItemType::Command => "Command",
        ItemType::Agent => "Agent",
    }
}

fn item_type_label_plural(item_type: ItemType) -> &'static str {
    match item_type {
        ItemType::Skill => "Skills",
        ItemType::Command => "Commands",
        ItemType::Agent => "Agents",
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
