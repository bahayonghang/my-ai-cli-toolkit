//! Resource Manager Module
//!
//! Manages discovery, installation, and updates of Skills, Commands, and Agents.

use crate::models::*;
use crate::platform::{get_commands_path, get_skills_path};
use crate::sync::{SyncEngine, SyncError};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use thiserror::Error;

/// Manager errors
#[derive(Debug, Error)]
pub enum ManagerError {
    #[error("Invalid resource format: {0}")]
    InvalidFormat(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Sync error: {0}")]
    Sync(#[from] SyncError),
}

/// Common install logic for syncing a local resource to multiple platforms.
///
/// `path_resolver` maps a platform to its target base directory (e.g., skills or commands dir).
/// `target_name` determines the final directory/file name under the target base.
fn install_resource(
    resource: &ResourceItem,
    platforms: &[Platform],
    sync_engine: &SyncEngine,
    path_resolver: fn(Platform) -> Option<PathBuf>,
    target_name: &std::ffi::OsStr,
) -> Result<Vec<SyncResult>, ManagerError> {
    let source_path = match &resource.source {
        ResourceSource::Local { path } => path.clone(),
        _ => {
            return Err(ManagerError::InvalidFormat(
                "Only local resources can be installed".to_string(),
            ))
        }
    };

    let mut results = Vec::new();

    for platform in platforms {
        let target_base = match path_resolver(*platform) {
            Some(p) => p,
            None => {
                results.push(SyncResult {
                    success: false,
                    platform: *platform,
                    resource_id: resource.id.clone(),
                    error: Some("Platform path not found".to_string()),
                });
                continue;
            }
        };

        let target_path = target_base.join(target_name);

        match sync_engine.sync(&source_path, &target_path, None) {
            Ok(()) => {
                results.push(SyncResult {
                    success: true,
                    platform: *platform,
                    resource_id: resource.id.clone(),
                    error: None,
                });
            }
            Err(e) => {
                results.push(SyncResult {
                    success: false,
                    platform: *platform,
                    resource_id: resource.id.clone(),
                    error: Some(e.to_string()),
                });
            }
        }
    }

    Ok(results)
}

/// Skill manager for discovering and managing skills
pub struct SkillManager {
    source_path: PathBuf,
}

impl SkillManager {
    pub fn new(source_path: PathBuf) -> Self {
        Self { source_path }
    }

    /// Discover all skills in the source directory
    pub fn discover(&self) -> Result<Vec<ResourceItem>, ManagerError> {
        let mut skills = Vec::new();

        if !self.source_path.exists() {
            return Ok(skills);
        }

        for entry in fs::read_dir(&self.source_path)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                if let Some(skill) = self.parse_skill_dir(&path)? {
                    skills.push(skill);
                }
            }
        }

        Ok(skills)
    }

    /// Parse a skill directory
    fn parse_skill_dir(&self, path: &Path) -> Result<Option<ResourceItem>, ManagerError> {
        let skill_md = path.join("SKILL.md");

        if !skill_md.exists() {
            return Ok(None);
        }

        let content = fs::read_to_string(&skill_md)?;
        let (frontmatter, _body) = parse_frontmatter(&content);

        let name = frontmatter
            .get("name")
            .cloned()
            .or_else(|| path.file_name().map(|n| n.to_string_lossy().to_string()))
            .unwrap_or_else(|| "unknown".to_string());

        let description = frontmatter.get("description").cloned();

        // Parse category from frontmatter (single value -> vec)
        let categories: Vec<String> = frontmatter
            .get("category")
            .map(|c| vec![c.trim().to_string()])
            .unwrap_or_default();

        // Parse tags from frontmatter (supports both comma-separated and YAML array format)
        let tags: Vec<String> = frontmatter
            .get("tags")
            .map(|t| {
                // Remove brackets if present (YAML array format: [tag1, tag2])
                let t = t.trim().trim_start_matches('[').trim_end_matches(']');
                t.split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect()
            })
            .unwrap_or_default();

        let id = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| name.clone());

        Ok(Some(ResourceItem {
            id,
            name,
            resource_type: ResourceType::Skill,
            description,
            source: ResourceSource::Local {
                path: path.to_path_buf(),
            },
            categories,
            tags,
            platform_status: HashMap::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }))
    }

    /// Install a skill to specified platforms
    pub fn install(
        &self,
        skill: &ResourceItem,
        platforms: &[Platform],
        sync_engine: &SyncEngine,
    ) -> Result<Vec<SyncResult>, ManagerError> {
        let target_name = std::ffi::OsStr::new(&skill.id);
        install_resource(skill, platforms, sync_engine, get_skills_path, target_name)
    }

    /// Uninstall a skill from specified platforms
    pub fn uninstall(
        &self,
        skill: &ResourceItem,
        platforms: &[Platform],
        sync_engine: &SyncEngine,
    ) -> Result<(), ManagerError> {
        for platform in platforms {
            let target_base = match get_skills_path(*platform) {
                Some(p) => p,
                None => continue,
            };

            let target_path = target_base.join(&skill.id);

            if target_path.exists() || target_path.is_symlink() {
                sync_engine.remove(&target_path)?;
            }
        }

        Ok(())
    }
}

/// Command manager for discovering and managing slash commands
pub struct CommandManager {
    source_path: PathBuf,
}

impl CommandManager {
    pub fn new(source_path: PathBuf) -> Self {
        Self { source_path }
    }

    /// Discover all commands in the source directory
    pub fn discover(&self) -> Result<Vec<ResourceItem>, ManagerError> {
        let mut commands = Vec::new();

        if !self.source_path.exists() {
            return Ok(commands);
        }

        // Commands are organized by platform subdirectories
        for entry in fs::read_dir(&self.source_path)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                // This is a platform directory (e.g., "claude", "gemini")
                let platform_name = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                self.discover_commands_in_dir(&path, &platform_name, &mut commands)?;
            }
        }

        Ok(commands)
    }

    /// Recursively discover commands in a directory
    fn discover_commands_in_dir(
        &self,
        dir: &Path,
        platform: &str,
        commands: &mut Vec<ResourceItem>,
    ) -> Result<(), ManagerError> {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                // Recurse into subdirectories
                self.discover_commands_in_dir(&path, platform, commands)?;
            } else if path.is_file() {
                let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");

                if ext == "md" || ext == "toml" {
                    if let Some(cmd) = self.parse_command_file(&path, platform)? {
                        commands.push(cmd);
                    }
                }
            }
        }

        Ok(())
    }

    /// Parse a command file
    fn parse_command_file(
        &self,
        path: &Path,
        platform: &str,
    ) -> Result<Option<ResourceItem>, ManagerError> {
        let name = path
            .file_stem()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| "unknown".to_string());

        // Generate ID from relative path
        let relative = path.strip_prefix(&self.source_path).unwrap_or(path);
        let id = relative
            .to_string_lossy()
            .replace(['/', '\\'], ":")
            .trim_end_matches(".md")
            .trim_end_matches(".toml")
            .to_string();

        let content = fs::read_to_string(path)?;
        let description = extract_description(&content);

        Ok(Some(ResourceItem {
            id,
            name,
            resource_type: ResourceType::Command,
            description,
            source: ResourceSource::Local {
                path: path.to_path_buf(),
            },
            categories: vec!["command".to_string(), platform.to_string()],
            tags: vec![platform.to_string()],
            platform_status: HashMap::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }))
    }

    /// Install a command to specified platforms
    pub fn install(
        &self,
        command: &ResourceItem,
        platforms: &[Platform],
        sync_engine: &SyncEngine,
    ) -> Result<Vec<SyncResult>, ManagerError> {
        let source_path = match &command.source {
            ResourceSource::Local { path } => path.clone(),
            _ => {
                return Err(ManagerError::InvalidFormat(
                    "Only local commands can be installed".to_string(),
                ))
            }
        };

        let file_name = source_path.file_name().unwrap_or_default().to_os_string();
        install_resource(
            command,
            platforms,
            sync_engine,
            get_commands_path,
            &file_name,
        )
    }
}

/// Parse YAML-like frontmatter from markdown content
fn parse_frontmatter(content: &str) -> (HashMap<String, String>, &str) {
    let mut frontmatter = HashMap::new();

    if !content.starts_with("---") {
        return (frontmatter, content);
    }

    let parts: Vec<&str> = content.splitn(3, "---").collect();

    if parts.len() < 3 {
        return (frontmatter, content);
    }

    let fm_content = parts[1].trim();
    let body = parts[2];

    for line in fm_content.lines() {
        if let Some((key, value)) = line.split_once(':') {
            let key = key.trim().to_string();
            let value = value
                .trim()
                .trim_matches('"')
                .trim_matches('\'')
                .to_string();
            frontmatter.insert(key, value);
        }
    }

    (frontmatter, body)
}

/// Extract description from content (first paragraph or comment)
fn extract_description(content: &str) -> Option<String> {
    let content = content.trim();

    // Try to get first non-empty line that's not a header
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') || line.starts_with("---") {
            continue;
        }
        // Return first meaningful line, truncated
        let desc = if line.len() > 200 {
            format!("{}...", &line[..197])
        } else {
            line.to_string()
        };
        return Some(desc);
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_frontmatter() {
        let content = r#"---
name: test-skill
description: A test skill
category: development-tools
tags: [test, example, demo]
---

# Test Skill

This is a test."#;

        let (fm, body) = parse_frontmatter(content);

        assert_eq!(fm.get("name"), Some(&"test-skill".to_string()));
        assert_eq!(fm.get("description"), Some(&"A test skill".to_string()));
        assert_eq!(fm.get("category"), Some(&"development-tools".to_string()));
        assert_eq!(fm.get("tags"), Some(&"[test, example, demo]".to_string()));
        assert!(body.contains("# Test Skill"));
    }

    #[test]
    fn test_parse_frontmatter_no_frontmatter() {
        let content = "# Just a header\n\nSome content";
        let (fm, body) = parse_frontmatter(content);

        assert!(fm.is_empty());
        assert_eq!(body, content);
    }

    #[test]
    fn test_parse_tags_with_brackets() {
        // Simulate parsing tags like in parse_skill_dir
        let tags_str = "[svg, graphics, cover-image, blog, design]";
        let t = tags_str
            .trim()
            .trim_start_matches('[')
            .trim_end_matches(']');
        let tags: Vec<String> = t
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        assert_eq!(
            tags,
            vec!["svg", "graphics", "cover-image", "blog", "design"]
        );
    }
}
