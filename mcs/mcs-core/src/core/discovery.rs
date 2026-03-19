use std::path::Path;
use std::path::PathBuf;
use std::time::SystemTime;
use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
};

use crate::config::paths::{platforms_src_dir, skills_src_dir};
use crate::config::platform::{PlatformConfig, agents_source_dir, commands_source_dir};
use crate::core::fs_utils::walkdir_files;
use crate::core::skill_meta::parse_skill_frontmatter;
use crate::model::{InstallStatus, ItemInfo, ItemType};

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

fn hash_metadata(hasher: &mut DefaultHasher, path: &Path, meta: &std::fs::Metadata) {
    path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default()
        .hash(hasher);
    meta.len().hash(hasher);
}

fn path_signature(path: &Path) -> (Option<SystemTime>, Option<u64>) {
    if !path.exists() {
        return (None, None);
    }

    if path.is_file() {
        let mut hasher = DefaultHasher::new();
        if let Ok(meta) = path.metadata() {
            hash_metadata(&mut hasher, path, &meta);
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

pub fn discover_skills(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    tracing::info!(
        platform = platform.name.as_str(),
        "Starting skills discovery"
    );
    let sources = discover_skill_sources(project_root);
    let skills = resolve_skills_for_platform(&sources, platform);
    tracing::info!(
        platform = platform.name.as_str(),
        source_count = sources.len(),
        resolved_count = skills.len(),
        "Completed skills discovery"
    );
    skills
}

pub fn discover_skill_sources(project_root: &Path) -> Vec<SkillSource> {
    let src_dir = skills_src_dir(project_root);
    if !src_dir.exists() {
        tracing::info!(source_count = 0usize, "Completed skill source discovery");
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
            true
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
    tracing::info!(
        source_count = sources.len(),
        "Completed skill source discovery"
    );
    sources
}

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

pub fn discover_commands(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    discover_platform_file_items(project_root, platform, ItemType::Command)
}

pub fn discover_agents(project_root: &Path, platform: &PlatformConfig) -> Vec<ItemInfo> {
    discover_platform_file_items(project_root, platform, ItemType::Agent)
}

fn discover_platform_file_items(
    project_root: &Path,
    platform: &PlatformConfig,
    item_type: ItemType,
) -> Vec<ItemInfo> {
    tracing::info!(
        platform = platform.name.as_str(),
        item_type = ?item_type,
        "Starting platform file discovery"
    );

    let Some((src_dir, target_dir)) =
        platform_file_item_source_and_target(project_root, platform, item_type)
    else {
        tracing::info!(
            platform = platform.name.as_str(),
            item_type = ?item_type,
            item_count = 0usize,
            "Platform capability not managed"
        );
        return Vec::new();
    };

    if !src_dir.exists() {
        tracing::info!(
            platform = platform.name.as_str(),
            item_type = ?item_type,
            item_count = 0usize,
            "Completed platform file discovery"
        );
        return Vec::new();
    }

    let mut items: Vec<ItemInfo> = Vec::new();
    let mut files = walkdir_files(&src_dir);
    files.sort();

    for file_path in files {
        let rel = file_path.strip_prefix(&src_dir).unwrap();
        let item_name = rel.with_extension("").to_string_lossy().replace('\\', "/");
        let target = target_dir.join(rel);
        let (src_mtime, src_sig) = path_signature(&file_path);
        let (tgt_mtime, tgt_sig) = path_signature(&target);
        let status = determine_status(&target, src_mtime, tgt_mtime, src_sig, tgt_sig);

        let category = if rel.components().count() > 1 {
            rel.components()
                .next()
                .map(|c| c.as_os_str().to_string_lossy().into_owned())
        } else {
            Some("general".into())
        };

        items.push(ItemInfo {
            name: item_name,
            item_type,
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

    tracing::info!(
        platform = platform.name.as_str(),
        item_type = ?item_type,
        item_count = items.len(),
        "Completed platform file discovery"
    );
    items
}

fn platform_file_item_source_and_target(
    project_root: &Path,
    platform: &PlatformConfig,
    item_type: ItemType,
) -> Option<(PathBuf, PathBuf)> {
    let platforms_base = platforms_src_dir(project_root);
    match item_type {
        ItemType::Command if platform.supports_commands() => Some((
            commands_source_dir(platform, &platforms_base),
            platform.commands_path(),
        )),
        ItemType::Agent if platform.supports_agents() => Some((
            agents_source_dir(platform, &platforms_base),
            platform.agents_path(),
        )),
        _ => None,
    }
}

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
            skills_base_dir: None,
            skills_subdir: "skills".into(),
            commands_subdir: "commands".into(),
            commands_source: "claude".into(),
            fallback_commands_source: None,
            agents_subdir: "agents".into(),
            agents_source: "claude".into(),
            fallback_agents_source: None,
            guidance_file: Some("CLAUDE.md".into()),
            guidance_source: "claude".into(),
            fallback_guidance_source: None,
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

    #[test]
    fn skill_same_size_content_change_marks_outdated() {
        let project_root = temp_dir("project_same_size");
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

        let install_root = temp_dir("install_same_size");
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

        std::thread::sleep(std::time::Duration::from_millis(1200));
        std::fs::write(source_skill.join("scripts").join("run.sh"), "echo v2").unwrap();

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

    #[test]
    fn external_registry_directory_is_not_discovered_as_skill() {
        let project_root = temp_dir("project_registry_file");
        let skills_root = project_root.join("content").join("skills");
        std::fs::create_dir_all(skills_root.join("workflow-skills").join("demo-skill")).unwrap();
        std::fs::write(
            skills_root
                .join("workflow-skills")
                .join("demo-skill")
                .join("SKILL.md"),
            "---\nname: demo-skill\n---\n",
        )
        .unwrap();
        std::fs::create_dir_all(skills_root.join("external-skills").join("categories")).unwrap();
        std::fs::write(
            skills_root.join("external-skills").join("index.toml"),
            "[schema]\nversion = 2\n",
        )
        .unwrap();

        let discovered = discover_skill_sources(&project_root);

        assert_eq!(discovered.len(), 1);
        assert_eq!(discovered[0].name, "demo-skill");

        let _ = std::fs::remove_dir_all(project_root);
    }

    #[test]
    fn discovers_agents_from_platform_content_tree() {
        let project_root = temp_dir("agents_project");
        let agent_src = project_root
            .join("content")
            .join("platforms")
            .join("claude")
            .join("agents")
            .join("specialist");
        std::fs::create_dir_all(&agent_src).unwrap();
        std::fs::write(agent_src.join("reviewer.md"), "# reviewer").unwrap();

        let install_root = temp_dir("agents_install");
        let target_root = install_root.join("agents").join("specialist");
        std::fs::create_dir_all(&target_root).unwrap();
        std::fs::write(target_root.join("reviewer.md"), "# reviewer").unwrap();

        let platform = test_platform(&install_root);
        let agents = discover_agents(&project_root, &platform);
        assert_eq!(agents.len(), 1);
        assert_eq!(agents[0].name, "specialist/reviewer");
        assert_eq!(agents[0].item_type, ItemType::Agent);
        assert_eq!(agents[0].status, InstallStatus::Installed);

        let _ = std::fs::remove_dir_all(project_root);
        let _ = std::fs::remove_dir_all(install_root);
    }
}
