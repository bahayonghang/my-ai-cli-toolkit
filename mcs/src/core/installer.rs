use std::fs;
use std::path::Path;

use crate::config::paths::{commands_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, commands_source_dir};
use crate::model::{InstallResult, ItemType};

/// Ensure target directories exist
fn ensure_dirs(platform: &PlatformConfig) -> std::io::Result<()> {
    fs::create_dir_all(platform.skills_path())?;
    fs::create_dir_all(platform.commands_path())?;
    Ok(())
}

pub fn install_skill(project_root: &Path, platform: &PlatformConfig, name: &str) -> InstallResult {
    let src = skills_src_dir(project_root).join(name);
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
    let target = platform.skills_path().join(name);
    // Remove old if exists
    if target.exists() {
        let _ = fs::remove_dir_all(&target);
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
    let name_normalized = name.replace('/', std::path::MAIN_SEPARATOR_STR);
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
    if let Some(parent) = target.parent() {
        let _ = fs::create_dir_all(parent);
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
    let target = platform.skills_path().join(name);
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
    let target_dir = platform.commands_path();
    let name_normalized = name.replace('/', std::path::MAIN_SEPARATOR_STR);
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
    project_root: &Path,
    platform: &PlatformConfig,
    name: &str,
    item_type: ItemType,
) -> InstallResult {
    let _ = project_root;
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

fn walkdir_files(dir: &Path) -> Vec<std::path::PathBuf> {
    let mut result = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                result.extend(walkdir_files(&path));
            } else if path.is_file() {
                result.push(path);
            }
        }
    }
    result
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
