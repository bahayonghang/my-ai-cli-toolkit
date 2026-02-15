use std::path::Path;
use std::time::SystemTime;

use crate::config::paths::{commands_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, commands_source_dir};
use crate::core::skill_meta::parse_skill_frontmatter;
use crate::model::{InstallStatus, ItemInfo, ItemType};

fn file_mtime(path: &Path) -> Option<SystemTime> {
    path.metadata().ok().and_then(|m| m.modified().ok())
}

fn determine_status(
    target: &Path,
    src_mtime: Option<SystemTime>,
    tgt_mtime: Option<SystemTime>,
) -> InstallStatus {
    if !target.exists() {
        return InstallStatus::NotInstalled;
    }
    match (src_mtime, tgt_mtime) {
        (Some(s), Some(t)) if s > t => InstallStatus::Outdated,
        _ => InstallStatus::Installed,
    }
}

/// Scan all skills from source directory
pub fn discover_skills(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    let src_dir = skills_src_dir(project_root);
    if !src_dir.exists() {
        return Vec::new();
    }

    let mut skills: Vec<ItemInfo> = Vec::new();
    let mut entries: Vec<_> = std::fs::read_dir(&src_dir)
        .into_iter()
        .flatten()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().into_owned();
        let target = platform.skills_path().join(&name);
        let src_mtime = file_mtime(&path);
        let tgt_mtime = file_mtime(&target);
        let status = determine_status(&target, src_mtime, tgt_mtime);
        let meta = parse_skill_frontmatter(&path);

        skills.push(ItemInfo {
            name,
            item_type: ItemType::Skill,
            description: meta.description,
            status,
            source_path: path,
            target_path: target,
            source_mtime: src_mtime,
            target_mtime: tgt_mtime,
            category: meta.category,
            tags: meta.tags,
        });
    }
    skills
}

/// Scan all commands from platform-specific source directory
pub fn discover_commands(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    let commands_base = commands_src_dir(project_root);
    let src_dir = commands_source_dir(platform, &commands_base);
    if !src_dir.exists() {
        return Vec::new();
    }

    let mut commands: Vec<ItemInfo> = Vec::new();
    let mut files: Vec<_> = walkdir(&src_dir);
    files.sort();

    for file_path in files {
        let rel = file_path.strip_prefix(&src_dir).unwrap();
        let cmd_name = rel.with_extension("").to_string_lossy().replace('\\', "/");
        let target = platform.commands_path().join(rel);
        let src_mtime = file_mtime(&file_path);
        let tgt_mtime = file_mtime(&target);
        let status = determine_status(&target, src_mtime, tgt_mtime);

        let category = if rel.components().count() > 1 {
            rel.components()
                .next()
                .map(|c| c.as_os_str().to_string_lossy().into_owned())
        } else {
            Some("general".into())
        };

        commands.push(ItemInfo {
            name: cmd_name,
            item_type: ItemType::Command,
            description: None,
            status,
            source_path: file_path,
            target_path: target,
            source_mtime: src_mtime,
            target_mtime: tgt_mtime,
            category,
            tags: Vec::new(),
        });
    }
    commands
}

/// Recursively collect all files under a directory
fn walkdir(dir: &Path) -> Vec<std::path::PathBuf> {
    let mut result = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                result.extend(walkdir(&path));
            } else if path.is_file() {
                result.push(path);
            }
        }
    }
    result
}
