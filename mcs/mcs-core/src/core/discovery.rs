use std::path::Path;
use std::time::SystemTime;
use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
};

use std::path::PathBuf;

use crate::config::paths::{commands_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, commands_source_dir};
use crate::core::fs_utils::walkdir_files;
use crate::core::skill_meta::parse_skill_frontmatter;
use crate::model::{InstallStatus, ItemInfo, ItemType};

/// Pre-scanned source skill info (platform-independent, computed once)
#[derive(Debug, Clone)]
pub struct SkillSource {
    pub name: String,
    pub source_path: PathBuf,
    pub src_mtime: Option<SystemTime>,
    pub src_sig: Option<u64>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub is_default: bool,
}

fn file_mtime(path: &Path) -> Option<SystemTime> {
    path.metadata().ok().and_then(|m| m.modified().ok())
}

fn update_latest(latest: &mut Option<SystemTime>, candidate: Option<SystemTime>) {
    if let Some(c) = candidate {
        match latest {
            Some(curr) if *curr >= c => {}
            _ => *latest = Some(c),
        }
    }
}

fn systemtime_to_epoch_ms(t: Option<SystemTime>) -> Option<u64> {
    t.and_then(|t| {
        t.duration_since(std::time::UNIX_EPOCH)
            .ok()
            .map(|d| d.as_millis() as u64)
    })
}

fn path_signature(path: &Path) -> (Option<SystemTime>, Option<u64>) {
    if !path.exists() {
        return (None, None);
    }

    if path.is_file() {
        let mut hasher = DefaultHasher::new();
        path.file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default()
            .hash(&mut hasher);
        if let Ok(meta) = path.metadata() {
            meta.len().hash(&mut hasher);
        }
        return (file_mtime(path), Some(hasher.finish()));
    }

    let mut files = walkdir_files(path);
    files.sort();

    let mut hasher = DefaultHasher::new();
    let mut latest = None;

    for file in files {
        let rel = file
            .strip_prefix(path)
            .ok()
            .unwrap_or(file.as_path())
            .to_string_lossy()
            .to_string();
        rel.hash(&mut hasher);

        if let Ok(meta) = file.metadata() {
            if let Ok(m) = meta.modified() {
                update_latest(&mut latest, Some(m));
            }
            meta.len().hash(&mut hasher);
        }
    }

    if latest.is_none() {
        latest = file_mtime(path);
    }

    (latest, Some(hasher.finish()))
}

fn determine_status(
    target: &Path,
    src_mtime: Option<SystemTime>,
    tgt_mtime: Option<SystemTime>,
    src_sig: Option<u64>,
    tgt_sig: Option<u64>,
) -> InstallStatus {
    if !target.exists() {
        return InstallStatus::NotInstalled;
    }
    if let (Some(s), Some(t)) = (src_mtime, tgt_mtime)
        && s > t
    {
        return InstallStatus::Outdated;
    }
    if let (Some(s), Some(t)) = (src_sig, tgt_sig)
        && s != t
    {
        return InstallStatus::Outdated;
    }
    InstallStatus::Installed
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
    let sources = discover_skill_sources(project_root);
    resolve_skills_for_platform(&sources, platform)
}

/// Scan source skills once (platform-independent, shared across all platforms)
pub fn discover_skill_sources(project_root: &Path) -> Vec<SkillSource> {
    let src_dir = skills_src_dir(project_root);
    if !src_dir.exists() {
        return Vec::new();
    }

    let mut skill_dirs = find_skill_dirs(&src_dir);
    skill_dirs.sort();

    let default_cats = load_default_categories(project_root);

    let mut sources: Vec<SkillSource> = Vec::new();
    for path in skill_dirs {
        let name = path.file_name().unwrap().to_string_lossy().into_owned();
        let (src_mtime, src_sig) = path_signature(&path);
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

        sources.push(SkillSource {
            name,
            source_path: path,
            src_mtime,
            src_sig,
            description: meta.description,
            category,
            tags: meta.tags,
            is_default,
        });
    }
    sources
}

/// Resolve skills for a specific platform using pre-scanned sources (fast — only checks targets)
pub fn resolve_skills_for_platform(
    sources: &[SkillSource],
    platform: &PlatformConfig,
) -> Vec<ItemInfo> {
    sources
        .iter()
        .map(|src| {
            let target = platform.skills_path().join(&src.name);
            let (tgt_mtime, tgt_sig) = path_signature(&target);
            let status = determine_status(&target, src.src_mtime, tgt_mtime, src.src_sig, tgt_sig);

            ItemInfo {
                name: src.name.clone(),
                item_type: ItemType::Skill,
                description: src.description.clone(),
                status,
                source_path: src.source_path.clone(),
                target_path: target,
                source_mtime: src.src_mtime,
                target_mtime: tgt_mtime,
                source_mtime_ms: systemtime_to_epoch_ms(src.src_mtime),
                target_mtime_ms: systemtime_to_epoch_ms(tgt_mtime),
                category: src.category.clone(),
                tags: src.tags.clone(),
                is_default: src.is_default,
            }
        })
        .collect()
}

/// Scan all commands from platform-specific source directory
pub fn discover_commands(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    let commands_base = commands_src_dir(project_root);
    let src_dir = commands_source_dir(platform, &commands_base);
    if !src_dir.exists() {
        return Vec::new();
    }

    let mut commands: Vec<ItemInfo> = Vec::new();
    let mut files: Vec<_> = walkdir_files(&src_dir);
    files.sort();

    for file_path in files {
        let rel = file_path.strip_prefix(&src_dir).unwrap();
        let cmd_name = rel.with_extension("").to_string_lossy().replace('\\', "/");
        let target = platform.commands_path().join(rel);
        let src_mtime = file_mtime(&file_path);
        let tgt_mtime = file_mtime(&target);
        let status = determine_status(&target, src_mtime, tgt_mtime, None, None);

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
            source_mtime_ms: systemtime_to_epoch_ms(src_mtime),
            target_mtime_ms: systemtime_to_epoch_ms(tgt_mtime),
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::platform::PlatformConfig;
    use std::path::PathBuf;

    fn temp_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "mcs_discovery_{}_{}_{}",
            name,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or_default()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn test_platform(base_dir: &Path) -> PlatformConfig {
        PlatformConfig {
            name: "claude".into(),
            base_dir: base_dir.to_string_lossy().to_string(),
            skills_subdir: "skills".into(),
            commands_subdir: "commands".into(),
            prompt_file: Some("CLAUDE.md".into()),
            commands_source: "claude".into(),
            fallback_commands_source: None,
        }
    }

    #[test]
    fn skill_changes_inside_directory_mark_outdated() {
        let project_root = temp_dir("project");
        let source_skill = project_root
            .join("content")
            .join("skills")
            .join("demo-skill");
        std::fs::create_dir_all(source_skill.join("scripts")).unwrap();
        std::fs::write(
            source_skill.join("SKILL.md"),
            "---\nname: demo-skill\n---\n",
        )
        .unwrap();
        std::fs::write(source_skill.join("scripts").join("run.sh"), "echo v1").unwrap();

        let install_root = temp_dir("install");
        let target_skill = install_root.join("skills").join("demo-skill");
        std::fs::create_dir_all(target_skill.join("scripts")).unwrap();
        std::fs::write(
            target_skill.join("SKILL.md"),
            "---\nname: demo-skill\n---\n",
        )
        .unwrap();
        std::fs::write(target_skill.join("scripts").join("run.sh"), "echo v1").unwrap();

        let platform = test_platform(&install_root);
        let first = discover_skills(&project_root, &platform);
        let status_first = first
            .iter()
            .find(|i| i.name == "demo-skill")
            .map(|i| i.status)
            .unwrap();
        assert_eq!(status_first, InstallStatus::Installed);

        std::thread::sleep(std::time::Duration::from_millis(50));
        // Write content with a different size (not just different content) so the
        // directory signature (which hashes relative paths + file sizes) detects
        // the change even if mtime resolution is too coarse on the CI filesystem.
        std::fs::write(
            source_skill.join("scripts").join("run.sh"),
            "echo v2 updated",
        )
        .unwrap();

        let second = discover_skills(&project_root, &platform);
        let status_second = second
            .iter()
            .find(|i| i.name == "demo-skill")
            .map(|i| i.status)
            .unwrap();
        assert_eq!(status_second, InstallStatus::Outdated);

        let _ = std::fs::remove_dir_all(project_root);
        let _ = std::fs::remove_dir_all(install_root);
    }
}
