use std::path::Path;

use serde::Deserialize;

/// A single external skill entry parsed from external-skills.toml
#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillEntry {
    pub name: String,
    pub repo: String,
    #[serde(default)]
    pub skill_flag: Option<String>,
    pub method: String,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub stars: Option<u8>,
    #[serde(default)]
    pub project_only: bool,
    #[serde(default)]
    pub usage: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ExternalSkillsToml {
    #[serde(default)]
    skills: Vec<ExternalSkillEntry>,
}

/// Load external skill entries from `content/external-skills/external-skills.toml`
pub fn load_external_skills(project_root: &Path) -> Vec<ExternalSkillEntry> {
    let toml_path = project_root
        .join("content")
        .join("external-skills")
        .join("external-skills.toml");

    let content = match std::fs::read_to_string(&toml_path) {
        Ok(c) => c,
        Err(_) => return Vec::new(),
    };

    let parsed: ExternalSkillsToml = match toml::from_str(&content) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to parse external-skills.toml: {e}");
            return Vec::new();
        }
    };

    parsed.skills
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_valid_toml() {
        let toml_str = r#"
[[skills]]
name = "test-skill"
repo = "owner/repo"
method = "vercel"
category = "dev-tools"
description = "A test skill"
stars = 5
usage = "Install and use /test command"

[[skills]]
name = "another"
repo = "https://github.com/foo/bar"
skill_flag = "my-skill"
method = "playbooks"
project_only = true
"#;
        let parsed: ExternalSkillsToml = toml::from_str(toml_str).unwrap();
        assert_eq!(parsed.skills.len(), 2);

        let first = &parsed.skills[0];
        assert_eq!(first.name, "test-skill");
        assert_eq!(first.repo, "owner/repo");
        assert!(first.skill_flag.is_none());
        assert_eq!(first.method, "vercel");
        assert_eq!(first.category.as_deref(), Some("dev-tools"));
        assert_eq!(first.stars, Some(5));
        assert!(!first.project_only);
        assert_eq!(
            first.usage.as_deref(),
            Some("Install and use /test command")
        );

        let second = &parsed.skills[1];
        assert_eq!(second.name, "another");
        assert_eq!(second.skill_flag.as_deref(), Some("my-skill"));
        assert_eq!(second.method, "playbooks");
        assert!(second.project_only);
        assert!(second.description.is_none());
        assert!(second.usage.is_none());
    }

    #[test]
    fn empty_file_returns_empty() {
        let parsed: ExternalSkillsToml = toml::from_str("").unwrap();
        assert!(parsed.skills.is_empty());
    }
}
