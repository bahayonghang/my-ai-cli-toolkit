use std::collections::{HashMap, HashSet};
use std::error::Error;
use std::fmt::{Display, Formatter};
use std::path::Path;

use serde::Deserialize;

pub const EXTERNAL_SKILLS_SCHEMA_VERSION: u32 = 2;
pub const EXTERNAL_SKILLS_KIND_SKILLS_CLI: &str = "skills_cli";

const ALLOWED_INSTALL_KINDS: &[&str] = &[EXTERNAL_SKILLS_KIND_SKILLS_CLI];
const ALLOWED_INSTALL_PROVIDERS: &[&str] = &["vercel", "playbooks"];
const FALLBACK_GROUP_ID: &str = "uncategorized";
const FALLBACK_GROUP_LABEL: &str = "Uncategorized";
const FALLBACK_ORDER: i32 = i32::MAX / 2;

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillsRegistry {
    pub schema: ExternalSkillsSchema,
    #[serde(default)]
    pub groups: Vec<ExternalSkillGroup>,
    #[serde(default)]
    pub categories: Vec<ExternalSkillCategory>,
    #[serde(default)]
    pub skills: Vec<ExternalSkillEntry>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillsSchema {
    pub version: u32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillGroup {
    pub id: String,
    pub label: String,
    #[serde(default)]
    pub order: Option<i32>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillCategory {
    pub id: String,
    pub group_id: String,
    pub label: String,
    #[serde(default)]
    pub order: Option<i32>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillInstall {
    pub kind: String,
    pub provider: String,
    pub package_ref: String,
    #[serde(default)]
    pub skill_flag: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalSkillEntry {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub stars: Option<u8>,
    #[serde(default)]
    pub project_only: bool,
    #[serde(default)]
    pub usage: Option<String>,
    pub category_id: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub install: ExternalSkillInstall,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolvedExternalSkillEntry {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub stars: Option<u8>,
    pub project_only: bool,
    pub usage: Option<String>,
    pub tags: Vec<String>,
    pub group_id: String,
    pub group_label: String,
    pub group_order: i32,
    pub category_id: String,
    pub category_label: String,
    pub category_order: i32,
    pub install_kind: String,
    pub install_provider: String,
    pub package_ref: String,
    pub skill_flag: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExternalSkillsError {
    message: String,
}

impl ExternalSkillsError {
    fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl Display for ExternalSkillsError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.message.as_str())
    }
}

impl Error for ExternalSkillsError {}

impl ExternalSkillsRegistry {
    pub fn validate(&self) -> Result<(), ExternalSkillsError> {
        if self.schema.version != EXTERNAL_SKILLS_SCHEMA_VERSION {
            return Err(ExternalSkillsError::new(format!(
                "Unsupported external skills schema version {}; expected {}",
                self.schema.version, EXTERNAL_SKILLS_SCHEMA_VERSION
            )));
        }

        let mut group_ids = HashSet::new();
        for group in &self.groups {
            let group_id = group.id.trim();
            if group_id.is_empty() {
                return Err(ExternalSkillsError::new(
                    "External skills group id must not be empty",
                ));
            }
            if !group_ids.insert(group_id.to_string()) {
                return Err(ExternalSkillsError::new(format!(
                    "Duplicate external skills group id '{group_id}'"
                )));
            }
        }

        let group_lookup: HashMap<&str, &ExternalSkillGroup> = self
            .groups
            .iter()
            .map(|group| (group.id.as_str(), group))
            .collect();

        let mut category_ids = HashSet::new();
        for category in &self.categories {
            let category_id = category.id.trim();
            if category_id.is_empty() {
                return Err(ExternalSkillsError::new(
                    "External skills category id must not be empty",
                ));
            }
            if !category_ids.insert(category_id.to_string()) {
                return Err(ExternalSkillsError::new(format!(
                    "Duplicate external skills category id '{category_id}'"
                )));
            }
            if !group_lookup.contains_key(category.group_id.as_str()) {
                return Err(ExternalSkillsError::new(format!(
                    "External skills category '{}' references unknown group '{}'",
                    category.id, category.group_id
                )));
            }
        }

        let category_lookup: HashMap<&str, &ExternalSkillCategory> = self
            .categories
            .iter()
            .map(|category| (category.id.as_str(), category))
            .collect();

        let mut skill_ids = HashSet::new();
        for skill in &self.skills {
            let skill_id = skill.id.trim();
            if skill_id.is_empty() {
                return Err(ExternalSkillsError::new(
                    "External skills entry id must not be empty",
                ));
            }
            if !skill_ids.insert(skill_id.to_string()) {
                return Err(ExternalSkillsError::new(format!(
                    "Duplicate external skills entry id '{skill_id}'"
                )));
            }
            if !category_lookup.contains_key(skill.category_id.as_str()) {
                return Err(ExternalSkillsError::new(format!(
                    "External skills entry '{}' references unknown category '{}'",
                    skill.id, skill.category_id
                )));
            }

            let install_kind = skill.install.kind.trim();
            if !ALLOWED_INSTALL_KINDS.contains(&install_kind) {
                return Err(ExternalSkillsError::new(format!(
                    "External skills entry '{}' uses unsupported install kind '{}'",
                    skill.id, skill.install.kind
                )));
            }

            let install_provider = skill.install.provider.trim();
            if !ALLOWED_INSTALL_PROVIDERS.contains(&install_provider) {
                return Err(ExternalSkillsError::new(format!(
                    "External skills entry '{}' uses unsupported install provider '{}'",
                    skill.id, skill.install.provider
                )));
            }

            if skill.install.package_ref.trim().is_empty() {
                return Err(ExternalSkillsError::new(format!(
                    "External skills entry '{}' must define install.package_ref",
                    skill.id
                )));
            }

            if skill.name.trim().is_empty() {
                return Err(ExternalSkillsError::new(format!(
                    "External skills entry '{}' must define name",
                    skill.id
                )));
            }
        }

        Ok(())
    }

    pub fn resolved_skills_for_kind(
        &self,
        install_kind: &str,
    ) -> Result<Vec<ResolvedExternalSkillEntry>, ExternalSkillsError> {
        self.validate()?;

        let group_orders = self
            .groups
            .iter()
            .enumerate()
            .map(|(index, group)| {
                (
                    group.id.as_str(),
                    (group.label.clone(), group.order.unwrap_or(index as i32)),
                )
            })
            .collect::<HashMap<_, _>>();
        let category_meta = self
            .categories
            .iter()
            .enumerate()
            .map(|(index, category)| {
                (
                    category.id.as_str(),
                    (
                        category.group_id.clone(),
                        category.label.clone(),
                        category.order.unwrap_or(index as i32),
                    ),
                )
            })
            .collect::<HashMap<_, _>>();

        let mut resolved = self
            .skills
            .iter()
            .filter(|skill| skill.install.kind == install_kind)
            .filter_map(|skill| {
                let (group_id, category_label, category_order) =
                    category_meta.get(skill.category_id.as_str())?.clone();
                let (group_label, group_order) = group_orders
                    .get(group_id.as_str())
                    .cloned()
                    .unwrap_or_else(|| (FALLBACK_GROUP_LABEL.to_string(), FALLBACK_ORDER));
                Some(ResolvedExternalSkillEntry {
                    id: skill.id.clone(),
                    name: skill.name.clone(),
                    description: skill.description.clone(),
                    stars: skill.stars,
                    project_only: skill.project_only,
                    usage: skill.usage.clone(),
                    tags: skill.tags.clone(),
                    group_id,
                    group_label,
                    group_order,
                    category_id: skill.category_id.clone(),
                    category_label,
                    category_order,
                    install_kind: skill.install.kind.clone(),
                    install_provider: skill.install.provider.clone(),
                    package_ref: skill.install.package_ref.clone(),
                    skill_flag: skill.install.skill_flag.clone(),
                })
            })
            .collect::<Vec<_>>();

        resolved.sort_by(|left, right| {
            left.group_order
                .cmp(&right.group_order)
                .then_with(|| left.category_order.cmp(&right.category_order))
                .then_with(|| left.name.cmp(&right.name))
        });
        Ok(resolved)
    }

    pub fn resolved_skill_by_catalog_entry_id(
        &self,
        install_kind: &str,
        catalog_entry_id: &str,
    ) -> Result<Option<ResolvedExternalSkillEntry>, ExternalSkillsError> {
        Ok(self
            .resolved_skills_for_kind(install_kind)?
            .into_iter()
            .find(|skill| skill.id == catalog_entry_id))
    }

    pub fn resolved_skill_by_installed_name(
        &self,
        install_kind: &str,
        installed_name: &str,
    ) -> Result<Option<ResolvedExternalSkillEntry>, ExternalSkillsError> {
        Ok(self
            .resolved_skills_for_kind(install_kind)?
            .into_iter()
            .find(|skill| {
                skill.skill_flag.as_deref() == Some(installed_name) || skill.name == installed_name
            }))
    }
}

pub fn load_external_skills(
    project_root: &Path,
) -> Result<ExternalSkillsRegistry, ExternalSkillsError> {
    let toml_path = project_root
        .join("content")
        .join("external-skills")
        .join("external-skills.toml");

    let content = std::fs::read_to_string(&toml_path).map_err(|error| {
        ExternalSkillsError::new(format!(
            "Failed to read external-skills.toml ({}): {error}",
            toml_path.display()
        ))
    })?;

    let parsed: ExternalSkillsRegistry = toml::from_str(&content).map_err(|error| {
        ExternalSkillsError::new(format!(
            "Failed to parse external-skills.toml ({}): {error}",
            toml_path.display()
        ))
    })?;
    parsed.validate()?;
    Ok(parsed)
}

pub fn uncategorized_skill(
    id: String,
    name: String,
    description: Option<String>,
    package_ref: String,
    skill_flag: Option<String>,
) -> ResolvedExternalSkillEntry {
    ResolvedExternalSkillEntry {
        id,
        name,
        description,
        stars: None,
        project_only: false,
        usage: None,
        tags: Vec::new(),
        group_id: FALLBACK_GROUP_ID.to_string(),
        group_label: FALLBACK_GROUP_LABEL.to_string(),
        group_order: FALLBACK_ORDER,
        category_id: FALLBACK_GROUP_ID.to_string(),
        category_label: FALLBACK_GROUP_LABEL.to_string(),
        category_order: FALLBACK_ORDER,
        install_kind: EXTERNAL_SKILLS_KIND_SKILLS_CLI.to_string(),
        install_provider: "unknown".to_string(),
        package_ref,
        skill_flag,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_registry() -> &'static str {
        r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"

[[categories]]
id = "frontend"
group_id = "engineering"
label = "Frontend"

[[skills]]
id = "find-skills"
name = "find-skills"
description = "Find skills quickly"
category_id = "frontend"
tags = ["search"]

[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "vercel-labs/skills"
skill_flag = "find-skills"
"#
    }

    #[test]
    fn parse_valid_registry() {
        let parsed: ExternalSkillsRegistry = toml::from_str(sample_registry()).unwrap();
        parsed.validate().unwrap();
        let resolved = parsed
            .resolved_skills_for_kind(EXTERNAL_SKILLS_KIND_SKILLS_CLI)
            .unwrap();
        assert_eq!(resolved.len(), 1);
        assert_eq!(resolved[0].group_id, "engineering");
        assert_eq!(resolved[0].category_id, "frontend");
        assert_eq!(resolved[0].package_ref, "vercel-labs/skills");
        assert_eq!(resolved[0].skill_flag.as_deref(), Some("find-skills"));
    }

    #[test]
    fn duplicate_ids_fail_validation() {
        let parsed: ExternalSkillsRegistry = toml::from_str(
            r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"

[[categories]]
id = "frontend"
group_id = "engineering"
label = "Frontend"

[[skills]]
id = "duplicate"
name = "duplicate"
category_id = "frontend"
[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "a/b"

[[skills]]
id = "duplicate"
name = "duplicate-2"
category_id = "frontend"
[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "c/d"
"#,
        )
        .unwrap();

        let error = parsed.validate().unwrap_err();
        assert!(
            error
                .to_string()
                .contains("Duplicate external skills entry id")
        );
    }

    #[test]
    fn missing_category_fails_validation() {
        let parsed: ExternalSkillsRegistry = toml::from_str(
            r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"

[[skills]]
id = "find-skills"
name = "find-skills"
category_id = "missing"
[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "vercel-labs/skills"
"#,
        )
        .unwrap();

        let error = parsed.validate().unwrap_err();
        assert!(error.to_string().contains("references unknown category"));
    }

    #[test]
    fn invalid_install_provider_fails_validation() {
        let parsed: ExternalSkillsRegistry = toml::from_str(
            r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"

[[categories]]
id = "frontend"
group_id = "engineering"
label = "Frontend"

[[skills]]
id = "find-skills"
name = "find-skills"
category_id = "frontend"
[skills.install]
kind = "skills_cli"
provider = "unknown"
package_ref = "vercel-labs/skills"
"#,
        )
        .unwrap();

        let error = parsed.validate().unwrap_err();
        assert!(error.to_string().contains("unsupported install provider"));
    }
}
