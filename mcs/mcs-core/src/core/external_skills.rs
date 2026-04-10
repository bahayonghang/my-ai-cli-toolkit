use std::collections::{HashMap, HashSet};
use std::error::Error;
use std::fmt::{Display, Formatter};
use std::path::{Component, Path, PathBuf};

use serde::Deserialize;
use serde::de::DeserializeOwned;

pub const EXTERNAL_SKILLS_SCHEMA_VERSION: u32 = 2;
pub const EXTERNAL_SKILLS_KIND_SKILLS_CLI: &str = "skills_cli";

const ALLOWED_INSTALL_KINDS: &[&str] = &[EXTERNAL_SKILLS_KIND_SKILLS_CLI];
const ALLOWED_INSTALL_PROVIDERS: &[&str] = &["vercel", "playbooks"];
const EXTERNAL_SKILLS_DIR: &str = "community-skills-registry";
const EXTERNAL_SKILLS_INDEX_FILE: &str = "index.toml";
const EXTERNAL_SKILLS_CATEGORY_DIR: &str = "categories";
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
    #[serde(default)]
    pub file: Option<String>,
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

#[derive(Debug, Clone, Deserialize)]
struct ExternalSkillsIndex {
    pub schema: ExternalSkillsSchema,
    #[serde(default)]
    pub groups: Vec<ExternalSkillGroup>,
    #[serde(default)]
    pub categories: Vec<ExternalSkillCategory>,
}

#[derive(Debug, Clone, Deserialize)]
struct ExternalSkillsCategoryFragment {
    #[serde(default)]
    pub skills: Vec<ExternalSkillFragmentEntry>,
}

#[derive(Debug, Clone, Deserialize)]
struct ExternalSkillFragmentEntry {
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
    pub category_slug: String,
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
                        category_slug(category),
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
                let (group_id, category_slug, category_label, category_order) =
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
                    category_slug,
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

impl ExternalSkillFragmentEntry {
    fn into_entry(self, category_id: String) -> ExternalSkillEntry {
        ExternalSkillEntry {
            id: self.id,
            name: self.name,
            description: self.description,
            stars: self.stars,
            project_only: self.project_only,
            usage: self.usage,
            category_id,
            tags: self.tags,
            install: self.install,
        }
    }
}

fn external_skills_registry_dir(project_root: &Path) -> PathBuf {
    project_root.join("content").join(EXTERNAL_SKILLS_DIR)
}

fn read_toml_file<T: DeserializeOwned>(path: &Path, label: &str) -> Result<T, ExternalSkillsError> {
    let content = std::fs::read_to_string(path).map_err(|error| {
        ExternalSkillsError::new(format!(
            "Failed to read {label} ({}): {error}",
            path.display()
        ))
    })?;

    toml::from_str(&content).map_err(|error| {
        ExternalSkillsError::new(format!(
            "Failed to parse {label} ({}): {error}",
            path.display()
        ))
    })
}

fn normalize_registry_relative_path(path: &str) -> Result<PathBuf, &'static str> {
    let candidate = Path::new(path.trim());
    if candidate.as_os_str().is_empty() {
        return Err("path must not be empty");
    }

    let mut normalized = PathBuf::new();
    for component in candidate.components() {
        match component {
            Component::Normal(part) => normalized.push(part),
            Component::CurDir => {}
            Component::ParentDir => return Err("path must not contain '..'"),
            Component::RootDir | Component::Prefix(_) => {
                return Err("path must be relative to content/community-skills-registry/");
            }
        }
    }

    if normalized.as_os_str().is_empty() {
        return Err("path must not resolve to the registry root");
    }

    Ok(normalized)
}

fn category_slug(category: &ExternalSkillCategory) -> String {
    category
        .file
        .as_deref()
        .and_then(|file| normalize_registry_relative_path(file).ok())
        .and_then(|normalized| {
            normalized
                .file_stem()
                .and_then(|stem| stem.to_str())
                .map(|stem| stem.trim().to_string())
        })
        .filter(|stem| !stem.is_empty())
        .unwrap_or_else(|| category.id.clone())
}

fn resolve_category_fragment_path(
    registry_dir: &Path,
    category: &ExternalSkillCategory,
) -> Result<(PathBuf, String), ExternalSkillsError> {
    let file = category.file.as_deref().ok_or_else(|| {
        ExternalSkillsError::new(format!(
            "External skills category '{}' must define file",
            category.id
        ))
    })?;

    let normalized = normalize_registry_relative_path(file).map_err(|reason| {
        ExternalSkillsError::new(format!(
            "External skills category '{}' has invalid file '{}': {reason}",
            category.id, file
        ))
    })?;
    let relative_display = normalized.to_string_lossy().replace('\\', "/");
    Ok((registry_dir.join(&normalized), relative_display))
}

fn discover_registry_fragment_files(dir: &Path) -> Result<Vec<PathBuf>, ExternalSkillsError> {
    let mut files = Vec::new();
    if !dir.exists() {
        return Ok(files);
    }

    let entries = std::fs::read_dir(dir).map_err(|error| {
        ExternalSkillsError::new(format!(
            "Failed to read external skills fragment directory ({}): {error}",
            dir.display()
        ))
    })?;

    for entry in entries {
        let entry = entry.map_err(|error| {
            ExternalSkillsError::new(format!(
                "Failed to enumerate external skills fragment directory ({}): {error}",
                dir.display()
            ))
        })?;
        let path = entry.path();
        if path.is_dir() {
            files.extend(discover_registry_fragment_files(&path)?);
            continue;
        }
        if path.extension().and_then(|value| value.to_str()) == Some("toml") {
            files.push(path);
        }
    }

    Ok(files)
}

pub fn load_external_skills(
    project_root: &Path,
) -> Result<ExternalSkillsRegistry, ExternalSkillsError> {
    let registry_dir = external_skills_registry_dir(project_root);
    let index_path = registry_dir.join(EXTERNAL_SKILLS_INDEX_FILE);
    let index: ExternalSkillsIndex = read_toml_file(&index_path, "external skills index")?;

    let mut category_file_owners = HashMap::new();
    let mut skill_origins: HashMap<String, (String, String)> = HashMap::new();
    let mut skills = Vec::new();

    for category in &index.categories {
        let (fragment_path, relative_display) =
            resolve_category_fragment_path(&registry_dir, category)?;

        if let Some(existing_category) =
            category_file_owners.insert(relative_display.clone(), category.id.clone())
        {
            return Err(ExternalSkillsError::new(format!(
                "External skills categories '{}' and '{}' both reference '{}'",
                existing_category, category.id, relative_display
            )));
        }

        if !fragment_path.is_file() {
            return Err(ExternalSkillsError::new(format!(
                "External skills category '{}' references missing file '{}' ({})",
                category.id,
                relative_display,
                fragment_path.display()
            )));
        }

        let label = format!("external skills category fragment '{}'", category.id);
        let fragment: ExternalSkillsCategoryFragment = read_toml_file(&fragment_path, &label)?;
        for fragment_skill in fragment.skills {
            if let Some((other_category, other_file)) = skill_origins.insert(
                fragment_skill.id.clone(),
                (category.id.clone(), relative_display.clone()),
            ) {
                return Err(ExternalSkillsError::new(format!(
                    "Duplicate external skills entry id '{}' found in '{}' (category '{}') and '{}' (category '{}')",
                    fragment_skill.id, other_file, other_category, relative_display, category.id
                )));
            }
            skills.push(fragment_skill.into_entry(category.id.clone()));
        }
    }

    let categories_dir = registry_dir.join(EXTERNAL_SKILLS_CATEGORY_DIR);
    let mut fragment_files = discover_registry_fragment_files(&categories_dir)?;
    fragment_files.sort();
    for fragment_path in fragment_files {
        let relative_display = fragment_path
            .strip_prefix(&registry_dir)
            .ok()
            .unwrap_or(fragment_path.as_path())
            .to_string_lossy()
            .replace('\\', "/");
        if !category_file_owners.contains_key(&relative_display) {
            return Err(ExternalSkillsError::new(format!(
                "Unreferenced external skills fragment '{}' under '{}'",
                relative_display,
                categories_dir.display()
            )));
        }
    }

    let parsed = ExternalSkillsRegistry {
        schema: index.schema,
        groups: index.groups,
        categories: index.categories,
        skills,
    };
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
        category_slug: FALLBACK_GROUP_ID.to_string(),
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
id = "engineering"
group_id = "engineering"
label = "Engineering"

[[skills]]
id = "find-skills"
name = "find-skills"
description = "Find skills quickly"
category_id = "engineering"
tags = ["search"]

[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "vercel-labs/skills"
skill_flag = "find-skills"
"#
    }

    fn sample_split_index() -> &'static str {
        r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"
order = 10

[[categories]]
id = "engineering"
group_id = "engineering"
label = "Engineering"
order = 10
file = "categories/engineering.toml"

[[categories]]
id = "design"
group_id = "engineering"
label = "Design"
order = 20
file = "categories/design.toml"
"#
    }

    fn sample_engineering_fragment() -> &'static str {
        r#"
[[skills]]
id = "find-skills"
name = "find-skills"
description = "Find skills quickly"
stars = 4
usage = "Discover packages"
tags = ["search"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/skills", skill_flag = "find-skills" }

[[skills]]
id = "alpha-skill"
name = "alpha-skill"
description = "Alpha"
tags = ["alpha"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/alpha", skill_flag = "alpha-skill" }
"#
    }

    fn sample_design_fragment() -> &'static str {
        r#"
[[skills]]
id = "zeta-tool"
name = "zeta-tool"
description = "Zeta"
tags = ["tooling"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/zeta", skill_flag = "zeta-tool" }
"#
    }

    fn temp_project_root(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "mcs_external_skills_{}_{}_{}",
            name,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or_default()
        ))
    }

    fn write_split_registry(
        project_root: &Path,
        index: &str,
        fragments: &[(&str, &str)],
    ) -> PathBuf {
        let registry_dir = project_root.join("content").join(EXTERNAL_SKILLS_DIR);
        let categories_dir = registry_dir.join(EXTERNAL_SKILLS_CATEGORY_DIR);
        std::fs::create_dir_all(&categories_dir).unwrap();
        std::fs::write(registry_dir.join(EXTERNAL_SKILLS_INDEX_FILE), index).unwrap();
        for (relative_path, content) in fragments {
            let path = registry_dir.join(relative_path);
            if let Some(parent) = path.parent() {
                std::fs::create_dir_all(parent).unwrap();
            }
            std::fs::write(path, content).unwrap();
        }
        registry_dir
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
        assert_eq!(resolved[0].category_id, "engineering");
        assert_eq!(resolved[0].category_slug, "engineering");
        assert_eq!(resolved[0].package_ref, "vercel-labs/skills");
        assert_eq!(resolved[0].skill_flag.as_deref(), Some("find-skills"));
    }

    #[test]
    fn category_slug_prefers_fragment_file_stem_over_category_id() {
        let parsed: ExternalSkillsRegistry = toml::from_str(
            r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"

[[categories]]
id = "design_systems"
group_id = "engineering"
label = "Design Systems"
file = "categories/design.toml"

[[skills]]
id = "design-dna"
name = "design-dna"
category_id = "design_systems"
[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "vercel-labs/design"
"#,
        )
        .unwrap();

        let resolved = parsed
            .resolved_skills_for_kind(EXTERNAL_SKILLS_KIND_SKILLS_CLI)
            .unwrap();
        assert_eq!(resolved[0].category_id, "design_systems");
        assert_eq!(resolved[0].category_slug, "design");
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
id = "engineering"
group_id = "engineering"
label = "Engineering"

[[skills]]
id = "duplicate"
name = "duplicate"
category_id = "engineering"
[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "a/b"

[[skills]]
id = "duplicate"
name = "duplicate-2"
category_id = "engineering"
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
id = "engineering"
group_id = "engineering"
label = "Engineering"

[[skills]]
id = "find-skills"
name = "find-skills"
category_id = "engineering"
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

    #[test]
    fn load_external_skills_reads_split_registry_from_content_skills() {
        let project_root = temp_project_root("split_ok");
        write_split_registry(
            &project_root,
            sample_split_index(),
            &[
                ("categories/engineering.toml", sample_engineering_fragment()),
                ("categories/design.toml", sample_design_fragment()),
            ],
        );

        let registry = load_external_skills(&project_root).unwrap();
        let resolved = registry
            .resolved_skills_for_kind(EXTERNAL_SKILLS_KIND_SKILLS_CLI)
            .unwrap();

        let ids = resolved
            .iter()
            .map(|skill| skill.id.as_str())
            .collect::<Vec<_>>();
        assert_eq!(ids, vec!["alpha-skill", "find-skills", "zeta-tool"]);
        assert_eq!(
            registry
                .categories
                .iter()
                .find(|category| category.id == "engineering")
                .and_then(|category| category.file.as_deref()),
            Some("categories/engineering.toml")
        );

        let _ = std::fs::remove_dir_all(project_root);
    }

    #[test]
    fn load_external_skills_fails_when_category_file_is_missing() {
        let project_root = temp_project_root("missing_fragment");
        write_split_registry(&project_root, sample_split_index(), &[]);

        let error = load_external_skills(&project_root).unwrap_err();
        assert!(error.to_string().contains("references missing file"));
        assert!(error.to_string().contains("categories/engineering.toml"));

        let _ = std::fs::remove_dir_all(project_root);
    }

    #[test]
    fn load_external_skills_fails_when_two_categories_share_same_file() {
        let project_root = temp_project_root("duplicate_file");
        write_split_registry(
            &project_root,
            r#"
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"

[[categories]]
id = "engineering"
group_id = "engineering"
label = "Engineering"
file = "categories/shared.toml"

[[categories]]
id = "design"
group_id = "engineering"
label = "Design"
file = "categories/shared.toml"
"#,
            &[("categories/shared.toml", sample_engineering_fragment())],
        );

        let error = load_external_skills(&project_root).unwrap_err();
        assert!(
            error
                .to_string()
                .contains("both reference 'categories/shared.toml'")
        );

        let _ = std::fs::remove_dir_all(project_root);
    }

    #[test]
    fn load_external_skills_fails_when_duplicate_skill_ids_exist_across_fragments() {
        let project_root = temp_project_root("duplicate_skill");
        write_split_registry(
            &project_root,
            sample_split_index(),
            &[
                (
                    "categories/engineering.toml",
                    r#"
[[skills]]
id = "shared-skill"
name = "shared-skill"
tags = ["engineering"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/shared", skill_flag = "shared-skill" }
"#,
                ),
                (
                    "categories/design.toml",
                    r#"
[[skills]]
id = "shared-skill"
name = "shared-skill"
tags = ["tools"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/shared-tools", skill_flag = "shared-skill" }
"#,
                ),
            ],
        );

        let error = load_external_skills(&project_root).unwrap_err();
        assert!(
            error
                .to_string()
                .contains("Duplicate external skills entry id 'shared-skill'")
        );
        assert!(error.to_string().contains("categories/engineering.toml"));
        assert!(error.to_string().contains("categories/design.toml"));

        let _ = std::fs::remove_dir_all(project_root);
    }

    #[test]
    fn load_external_skills_fails_when_unreferenced_fragment_exists() {
        let project_root = temp_project_root("unreferenced_fragment");
        write_split_registry(
            &project_root,
            sample_split_index(),
            &[
                ("categories/engineering.toml", sample_engineering_fragment()),
                ("categories/design.toml", sample_design_fragment()),
                (
                    "categories/extra.toml",
                    r#"
[[skills]]
id = "extra-skill"
name = "extra-skill"
tags = ["extra"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/extra", skill_flag = "extra-skill" }
"#,
                ),
            ],
        );

        let error = load_external_skills(&project_root).unwrap_err();
        assert!(
            error
                .to_string()
                .contains("Unreferenced external skills fragment 'categories/extra.toml'")
        );

        let _ = std::fs::remove_dir_all(project_root);
    }
}
