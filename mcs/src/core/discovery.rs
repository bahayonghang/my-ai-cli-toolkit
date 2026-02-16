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

/// Load default category names from skills/default.toml
fn load_default_categories(project_root: &Path) -> Vec<String> {
    let toml_path = skills_src_dir(project_root).join("default.toml");
    let Ok(content) = std::fs::read_to_string(&toml_path) else {
        return Vec::new();
    };
    #[derive(serde::Deserialize)]
    struct DefaultConfig {
        #[serde(default)]
        categories: Vec<String>,
    }
    toml::from_str::<DefaultConfig>(&content)
        .map(|c| c.categories)
        .unwrap_or_default()
}

/// Scan all skills from source directory
pub fn discover_skills(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    let src_dir = skills_src_dir(project_root);
    if !src_dir.exists() {
        return Vec::new();
    }

    let mut skill_dirs = find_skill_dirs(&src_dir);
    skill_dirs.sort();

    let default_cats = load_default_categories(project_root);

    let mut skills: Vec<ItemInfo> = Vec::new();
    for path in skill_dirs {
        let name = path.file_name().unwrap().to_string_lossy().into_owned();
        let target = platform.skills_path().join(&name);
        let src_mtime = file_mtime(&path);
        let tgt_mtime = file_mtime(&target);
        let status = determine_status(&target, src_mtime, tgt_mtime);
        let meta = parse_skill_frontmatter(&path);

        let parent_cat = path
            .parent()
            .filter(|p| *p != src_dir)
            .map(|p| p.file_name().unwrap().to_string_lossy().into_owned());

        let is_default = if default_cats.is_empty() {
            true
        } else if let Some(ref cat) = parent_cat {
            default_cats.iter().any(|c| c == cat)
        } else {
            true // top-level skills are always default
        };

        let category = parent_cat.or(meta.category);

        skills.push(ItemInfo {
            name,
            item_type: ItemType::Skill,
            description: meta.description,
            status,
            source_path: path,
            target_path: target,
            source_mtime: src_mtime,
            target_mtime: tgt_mtime,
            category,
            tags: meta.tags,
            is_default,
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
            is_default: false,
        });
    }
    commands
}

/// Recursively find directories containing SKILL.md
pub(crate) fn find_skill_dirs(dir: &Path) -> Vec<std::path::PathBuf> {
    let mut result = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if path.join("SKILL.md").exists() {
                    result.push(path);
                } else {
                    result.extend(find_skill_dirs(&path));
                }
            }
        }
    }
    result
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
