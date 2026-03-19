use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use super::paths::home_dir;

#[derive(Debug, Clone, Serialize)]
pub struct PlatformConfig {
    pub name: String,
    pub base_dir: String,
    pub skills_base_dir: Option<String>,
    pub skills_subdir: String,
    pub commands_subdir: String,
    pub commands_source: String,
    pub fallback_commands_source: Option<String>,
    pub agents_subdir: String,
    pub agents_source: String,
    pub fallback_agents_source: Option<String>,
    pub guidance_file: Option<String>,
    pub guidance_source: String,
    pub fallback_guidance_source: Option<String>,
}

impl PlatformConfig {
    pub fn base_path(&self) -> PathBuf {
        expand_home_path(&self.base_dir)
    }

    pub fn skills_base_path(&self) -> PathBuf {
        match self.skills_base_dir.as_deref() {
            Some(base) if !base.trim().is_empty() => expand_home_path(base),
            _ => self.base_path(),
        }
    }

    pub fn skills_path(&self) -> PathBuf {
        self.skills_base_path().join(&self.skills_subdir)
    }

    pub fn skills_display_path(&self) -> String {
        let base = self
            .skills_base_dir
            .as_deref()
            .filter(|v| !v.trim().is_empty())
            .unwrap_or(&self.base_dir);
        join_display_path(base, &self.skills_subdir)
    }

    pub fn commands_path(&self) -> PathBuf {
        self.base_path().join(&self.commands_subdir)
    }

    pub fn commands_display_path(&self) -> Option<String> {
        self.supports_commands()
            .then(|| join_display_path(&self.base_dir, &self.commands_subdir))
    }

    pub fn supports_commands(&self) -> bool {
        !self.commands_subdir.trim().is_empty() && !self.commands_source.trim().is_empty()
    }

    pub fn agents_path(&self) -> PathBuf {
        self.base_path().join(&self.agents_subdir)
    }

    pub fn agents_display_path(&self) -> Option<String> {
        self.supports_agents()
            .then(|| join_display_path(&self.base_dir, &self.agents_subdir))
    }

    pub fn supports_agents(&self) -> bool {
        !self.agents_subdir.trim().is_empty() && !self.agents_source.trim().is_empty()
    }

    pub fn guidance_path(&self) -> Option<PathBuf> {
        self.guidance_file
            .as_ref()
            .map(|file| self.base_path().join(file))
    }

    pub fn guidance_display_path(&self) -> Option<String> {
        self.guidance_file.as_deref().map(|file| {
            if file.contains(['/', '\\']) {
                join_display_path(&self.base_dir, file)
            } else {
                format!("{}/{}", self.base_dir.trim_end_matches(['/', '\\']), file)
            }
        })
    }

    pub fn supports_guidance(&self) -> bool {
        self.guidance_file.is_some() && !self.guidance_source.trim().is_empty()
    }
}

fn expand_home_path(raw: &str) -> PathBuf {
    if let Some(rest) = raw.strip_prefix('~') {
        let rest = rest.strip_prefix('/').unwrap_or(rest);
        let rest = rest.strip_prefix('\\').unwrap_or(rest);
        if rest.is_empty() {
            home_dir()
        } else {
            home_dir().join(rest)
        }
    } else {
        PathBuf::from(raw)
    }
}

fn join_display_path(base: &str, subdir: &str) -> String {
    let trimmed_base = base.trim_end_matches(['/', '\\']);
    let trimmed_subdir = subdir.trim_matches(['/', '\\']);
    if trimmed_subdir.is_empty() {
        trimmed_base.to_string()
    } else {
        format!("{trimmed_base}/{trimmed_subdir}")
    }
}

#[derive(Debug, Clone)]
pub struct LegacySkillsDir {
    pub platform_id: String,
    pub legacy_path: PathBuf,
    pub shared_path: PathBuf,
}

pub fn universal_shared_skills_platform_ids() -> &'static [&'static str] {
    static IDS: [&str; 8] = [
        "amp", "cline", "codex", "cursor", "gemini", "copilot", "kimi", "opencode",
    ];
    &IDS
}

pub fn universal_shared_skills_display_path() -> &'static str {
    "~/.agents/skills"
}

pub fn is_universal_shared_skills_platform(platform_id: &str) -> bool {
    universal_shared_skills_platform_ids().contains(&platform_id)
}

pub fn detect_legacy_skill_dirs(
    platforms: &HashMap<String, PlatformConfig>,
) -> Vec<LegacySkillsDir> {
    let mut ids: Vec<&String> = platforms.keys().collect();
    ids.sort();

    let mut warnings = Vec::new();
    for platform_id in ids {
        if !is_universal_shared_skills_platform(platform_id) {
            continue;
        }
        let Some(platform) = platforms.get(platform_id) else {
            continue;
        };
        if platform.skills_base_dir.is_none() {
            continue;
        }
        let legacy_path = platform.base_path().join(&platform.skills_subdir);
        let shared_path = platform.skills_path();
        if legacy_path == shared_path {
            continue;
        }
        if !legacy_path.exists() || !contains_installed_skill(&legacy_path) {
            continue;
        }
        warnings.push(LegacySkillsDir {
            platform_id: platform_id.clone(),
            legacy_path,
            shared_path,
        });
    }

    warnings
}

fn contains_installed_skill(path: &Path) -> bool {
    if path.join("SKILL.md").is_file() {
        return true;
    }
    let entries = match fs::read_dir(path) {
        Ok(items) => items,
        Err(_) => return false,
    };
    for entry in entries.flatten() {
        let child = entry.path();
        if child.is_dir() && child.join("SKILL.md").is_file() {
            return true;
        }
    }
    false
}

pub struct PlatformDisplay {
    pub id: &'static str,
    pub name: &'static str,
    pub icon: &'static str,
    pub base_dir: &'static str,
    pub skills_dir: &'static str,
}

#[derive(Debug, Clone, Serialize)]
pub struct PlatformDisplayOwned {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub base_dir: String,
    pub skills_path: String,
    pub commands_path: Option<String>,
    pub agents_path: Option<String>,
    pub guidance_path: Option<String>,
    pub supports_commands: bool,
    pub supports_agents: bool,
    pub supports_guidance: bool,
}

pub fn platform_displays() -> &'static [PlatformDisplay] {
    static DISPLAYS: std::sync::LazyLock<Vec<PlatformDisplay>> = std::sync::LazyLock::new(|| {
        vec![
            PlatformDisplay {
                id: "claude",
                name: "Claude",
                icon: "🤖",
                base_dir: "~/.claude/",
                skills_dir: "~/.claude/skills/",
            },
            PlatformDisplay {
                id: "codex",
                name: "Codex",
                icon: "🧠",
                base_dir: "~/.codex/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "gemini",
                name: "Universal Agents",
                icon: "🌌",
                base_dir: "~/.agents/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "qwen",
                name: "Qwen",
                icon: "🔮",
                base_dir: "~/.qwen/",
                skills_dir: "~/.qwen/skills/",
            },
            PlatformDisplay {
                id: "qoder",
                name: "Qoder",
                icon: "⚡",
                base_dir: "~/.qoder/",
                skills_dir: "~/.qoder/skills/",
            },
            PlatformDisplay {
                id: "kiro",
                name: "Kiro",
                icon: "🎯",
                base_dir: "~/.kiro/",
                skills_dir: "~/.kiro/skills/",
            },
            PlatformDisplay {
                id: "trae",
                name: "Trae",
                icon: "🌊",
                base_dir: "~/.trae/",
                skills_dir: "~/.trae/skills/",
            },
            PlatformDisplay {
                id: "trae-cn",
                name: "Trae CN",
                icon: "🌊",
                base_dir: "~/.trae-cn/",
                skills_dir: "~/.trae-cn/skills/",
            },
            PlatformDisplay {
                id: "iflow",
                name: "iFlow",
                icon: "🌀",
                base_dir: "~/.iflow/",
                skills_dir: "~/.iflow/skills/",
            },
            PlatformDisplay {
                id: "antigravity",
                name: "Antigravity",
                icon: "🚀",
                base_dir: "~/.gemini/antigravity/",
                skills_dir: "~/.gemini/antigravity/skills/",
            },
            PlatformDisplay {
                id: "windsurf",
                name: "Windsurf",
                icon: "🏄",
                base_dir: "~/.codeium/windsurf/",
                skills_dir: "~/.codeium/windsurf/skills/",
            },
        ]
    });
    &DISPLAYS
}

pub fn platform_displays_owned() -> Vec<PlatformDisplayOwned> {
    default_platforms()
        .into_iter()
        .map(|(id, platform)| {
            let skills_path = if is_universal_shared_skills_platform(&id) {
                universal_shared_skills_display_path().to_string()
            } else {
                platform.skills_display_path()
            };
            PlatformDisplayOwned {
                id: id.clone(),
                name: platform.name.clone(),
                icon: "📁".to_string(),
                base_dir: platform.base_dir.clone(),
                skills_path,
                commands_path: platform.commands_display_path(),
                agents_path: platform.agents_display_path(),
                guidance_path: platform.guidance_display_path(),
                supports_commands: platform.supports_commands(),
                supports_agents: platform.supports_agents(),
                supports_guidance: platform.supports_guidance(),
            }
        })
        .collect()
}

fn p(
    name: &str,
    base: &str,
    skills_base: Option<&str>,
    skills: &str,
    commands: (&str, &str, Option<&str>),
    agents: (&str, &str, Option<&str>),
    guidance: Option<(&str, &str, Option<&str>)>,
) -> PlatformConfig {
    PlatformConfig {
        name: name.into(),
        base_dir: base.into(),
        skills_base_dir: skills_base.map(Into::into),
        skills_subdir: skills.into(),
        commands_subdir: commands.0.into(),
        commands_source: commands.1.into(),
        fallback_commands_source: commands.2.map(Into::into),
        agents_subdir: agents.0.into(),
        agents_source: agents.1.into(),
        fallback_agents_source: agents.2.map(Into::into),
        guidance_file: guidance.map(|(file, _, _)| file.into()),
        guidance_source: guidance
            .map(|(_, source, _)| source.into())
            .unwrap_or_default(),
        fallback_guidance_source: guidance.and_then(|(_, _, fallback)| fallback.map(Into::into)),
    }
}

pub fn default_platforms() -> HashMap<String, PlatformConfig> {
    HashMap::from([
        (
            "claude".into(),
            p(
                "claude",
                "~/.claude",
                None,
                "skills",
                ("commands", "claude", None),
                ("agents", "claude", None),
                Some(("CLAUDE.md", "claude", None)),
            ),
        ),
        (
            "amp".into(),
            p(
                "amp",
                "~/.amp",
                Some("~/.agents"),
                "skills",
                ("", "", None),
                ("", "", None),
                None,
            ),
        ),
        (
            "cline".into(),
            p(
                "cline",
                "~/.cline",
                Some("~/.agents"),
                "skills",
                ("", "", None),
                ("", "", None),
                None,
            ),
        ),
        (
            "codex".into(),
            p(
                "codex",
                "~/.codex",
                Some("~/.agents"),
                "skills",
                ("", "", None),
                ("", "", None),
                Some(("AGENTS.md", "codex", None)),
            ),
        ),
        (
            "cursor".into(),
            p(
                "cursor",
                "~/.cursor",
                Some("~/.agents"),
                "skills",
                ("commands", "cursor", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "gemini".into(),
            p(
                "gemini",
                "~/.agents",
                None,
                "skills",
                ("commands", "gemini", None),
                ("", "", None),
                None,
            ),
        ),
        (
            "copilot".into(),
            p(
                "copilot",
                "~/.copilot",
                Some("~/.agents"),
                "skills",
                ("", "", None),
                ("", "", None),
                None,
            ),
        ),
        (
            "kimi".into(),
            p(
                "kimi",
                "~/.kimi",
                Some("~/.agents"),
                "skills",
                ("", "", None),
                ("", "", None),
                None,
            ),
        ),
        (
            "qwen".into(),
            p(
                "qwen",
                "~/.qwen",
                None,
                "skills",
                ("commands", "qwen", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "qoder".into(),
            p(
                "qoder",
                "~/.qoder",
                None,
                "skills",
                ("commands", "qoder", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "kiro".into(),
            p(
                "kiro",
                "~/.kiro",
                None,
                "skills",
                ("steering", "kiro", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "trae".into(),
            p(
                "trae",
                "~/.trae",
                None,
                "skills",
                ("commands", "trae", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "trae-cn".into(),
            p(
                "trae-cn",
                "~/.trae-cn",
                None,
                "skills",
                ("commands", "trae", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "opencode".into(),
            p(
                "opencode",
                "~/.config/opencode",
                Some("~/.agents"),
                "skills",
                ("commands", "opencode", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "iflow".into(),
            p(
                "iflow",
                "~/.iflow",
                None,
                "skills",
                ("commands", "iflow", Some("claude")),
                ("", "", None),
                None,
            ),
        ),
        (
            "antigravity".into(),
            p(
                "antigravity",
                "~/.gemini/antigravity",
                None,
                "skills",
                ("workflows", "antigravity", None),
                ("", "", None),
                None,
            ),
        ),
        (
            "windsurf".into(),
            p(
                "windsurf",
                "~/.codeium/windsurf",
                None,
                "skills",
                ("workflows", "windsurf", None),
                ("", "", None),
                None,
            ),
        ),
    ])
}

#[derive(Deserialize)]
struct TomlPlatform {
    base_dir: Option<String>,
    skills_base_dir: Option<String>,
    skills_subdir: Option<String>,
    commands_subdir: Option<String>,
    commands_source: Option<String>,
    fallback_commands_source: Option<String>,
    agents_subdir: Option<String>,
    agents_source: Option<String>,
    fallback_agents_source: Option<String>,
    #[serde(alias = "prompt_file")]
    guidance_file: Option<String>,
    guidance_source: Option<String>,
    fallback_guidance_source: Option<String>,
}

#[derive(Deserialize)]
struct TomlConfig {
    platforms: Option<HashMap<String, TomlPlatform>>,
}

pub fn load_platforms(project_root: &Path) -> HashMap<String, PlatformConfig> {
    let mut platforms = default_platforms();
    tracing::info!(
        count = platforms.len(),
        "Loaded default platform configuration"
    );

    apply_toml_overrides(
        &mut platforms,
        &project_root.join("platforms.toml"),
        "project",
    );

    let user_config = home_dir()
        .join(".config")
        .join("myclaude")
        .join("platforms.toml");
    apply_toml_overrides(&mut platforms, &user_config, "user");

    platforms
}

fn apply_toml_overrides(
    platforms: &mut HashMap<String, PlatformConfig>,
    path: &Path,
    source: &str,
) {
    let content = match std::fs::read_to_string(path) {
        Ok(c) => c,
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
            tracing::info!(source, path = %path.display(), "Skipped platform override file");
            return;
        }
        Err(err) => {
            tracing::warn!(source, path = %path.display(), error = %err, "Failed to read platform override file");
            return;
        }
    };
    let config: TomlConfig = match toml::from_str(&content) {
        Ok(c) => c,
        Err(err) => {
            tracing::warn!(source, path = %path.display(), error = %err, "Failed to parse platform override file");
            return;
        }
    };
    let Some(toml_platforms) = config.platforms else {
        tracing::debug!(source, path = %path.display(), "Platform override file did not contain a [platforms] section");
        return;
    };

    let override_count = toml_platforms.len();
    for (name, tp) in toml_platforms {
        let entry = platforms
            .entry(name.clone())
            .or_insert_with(|| PlatformConfig {
                name: name.clone(),
                base_dir: format!("~/.{name}"),
                skills_base_dir: None,
                skills_subdir: "skills".into(),
                commands_subdir: String::new(),
                commands_source: String::new(),
                fallback_commands_source: None,
                agents_subdir: String::new(),
                agents_source: String::new(),
                fallback_agents_source: None,
                guidance_file: None,
                guidance_source: String::new(),
                fallback_guidance_source: None,
            });
        if let Some(v) = tp.base_dir {
            entry.base_dir = v;
        }
        if let Some(v) = tp.skills_base_dir {
            entry.skills_base_dir = Some(v);
        }
        if let Some(v) = tp.skills_subdir {
            entry.skills_subdir = v;
        }
        if let Some(v) = tp.commands_subdir {
            entry.commands_subdir = v;
        }
        if let Some(v) = tp.commands_source {
            entry.commands_source = v;
        }
        if let Some(v) = tp.fallback_commands_source {
            entry.fallback_commands_source = Some(v);
        }
        if let Some(v) = tp.agents_subdir {
            entry.agents_subdir = v;
        }
        if let Some(v) = tp.agents_source {
            entry.agents_source = v;
        }
        if let Some(v) = tp.fallback_agents_source {
            entry.fallback_agents_source = Some(v);
        }
        if let Some(v) = tp.guidance_file {
            entry.guidance_file = Some(v);
        }
        if let Some(v) = tp.guidance_source {
            entry.guidance_source = v;
        }
        if let Some(v) = tp.fallback_guidance_source {
            entry.fallback_guidance_source = Some(v);
        }
    }
    tracing::info!(source, path = %path.display(), count = override_count, "Applied platform override file");
}

fn capability_source_dir(
    platforms_base: &Path,
    primary_source: &str,
    fallback_source: Option<&str>,
    kind: &str,
) -> PathBuf {
    let primary = platforms_base.join(primary_source).join(kind);
    if primary.exists() {
        return primary;
    }
    if let Some(fallback) = fallback_source {
        let fallback_path = platforms_base.join(fallback).join(kind);
        if fallback_path.exists() {
            return fallback_path;
        }
    }
    primary
}

pub fn commands_source_dir(platform: &PlatformConfig, platforms_base: &Path) -> PathBuf {
    capability_source_dir(
        platforms_base,
        &platform.commands_source,
        platform.fallback_commands_source.as_deref(),
        "commands",
    )
}

pub fn agents_source_dir(platform: &PlatformConfig, platforms_base: &Path) -> PathBuf {
    capability_source_dir(
        platforms_base,
        &platform.agents_source,
        platform.fallback_agents_source.as_deref(),
        "agents",
    )
}

pub fn guidance_source_dir(platform: &PlatformConfig, platforms_base: &Path) -> PathBuf {
    capability_source_dir(
        platforms_base,
        &platform.guidance_source,
        platform.fallback_guidance_source.as_deref(),
        "guidance",
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_platform(
        base_dir: String,
        skills_base_dir: Option<String>,
        commands_source: &str,
    ) -> PlatformConfig {
        PlatformConfig {
            name: "test".to_string(),
            base_dir,
            skills_base_dir,
            skills_subdir: "skills".to_string(),
            commands_subdir: "commands".to_string(),
            commands_source: commands_source.to_string(),
            fallback_commands_source: None,
            agents_subdir: "agents".to_string(),
            agents_source: "claude".to_string(),
            fallback_agents_source: None,
            guidance_file: None,
            guidance_source: String::new(),
            fallback_guidance_source: None,
        }
    }

    fn temp_dir(prefix: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "mcs_platform_{}_{}_{}",
            prefix,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or_default()
        ));
        std::fs::create_dir_all(&path).expect("create temp dir");
        path
    }

    #[test]
    fn skills_path_prefers_skills_base_dir() {
        let root = temp_dir("skills_base");
        let legacy_base = root.join("legacy");
        let shared_base = root.join("shared");
        let platform = test_platform(
            legacy_base.to_string_lossy().to_string(),
            Some(shared_base.to_string_lossy().to_string()),
            "claude",
        );

        assert_eq!(platform.skills_path(), shared_base.join("skills"));
    }

    #[test]
    fn supports_commands_is_false_for_skills_only_platform() {
        let mut platform = test_platform("~/.amp".to_string(), Some("~/.agents".to_string()), "");
        platform.commands_subdir = String::new();
        assert!(!platform.supports_commands());
    }

    #[test]
    fn supports_agents_is_false_when_not_configured() {
        let mut platform = test_platform("~/.codex".to_string(), Some("~/.agents".to_string()), "");
        platform.agents_subdir = String::new();
        platform.agents_source = String::new();
        assert!(!platform.supports_agents());
    }

    #[test]
    fn detect_legacy_skill_dirs_returns_universal_platform_legacy_dir() {
        let root = temp_dir("legacy_detect");
        let legacy_base = root.join("codex-home");
        let shared_base = root.join("agents");
        let legacy_skill = legacy_base.join("skills").join("example");
        std::fs::create_dir_all(&legacy_skill).expect("create legacy skill dir");
        std::fs::write(legacy_skill.join("SKILL.md"), "# Example").expect("write legacy skill");

        let mut platforms = HashMap::new();
        platforms.insert(
            "codex".to_string(),
            PlatformConfig {
                name: "codex".to_string(),
                base_dir: legacy_base.to_string_lossy().to_string(),
                skills_base_dir: Some(shared_base.to_string_lossy().to_string()),
                skills_subdir: "skills".to_string(),
                commands_subdir: String::new(),
                commands_source: String::new(),
                fallback_commands_source: None,
                agents_subdir: String::new(),
                agents_source: String::new(),
                fallback_agents_source: None,
                guidance_file: Some("AGENTS.md".to_string()),
                guidance_source: "codex".to_string(),
                fallback_guidance_source: None,
            },
        );

        let legacy_dirs = detect_legacy_skill_dirs(&platforms);
        assert_eq!(legacy_dirs.len(), 1);
        assert_eq!(legacy_dirs[0].platform_id, "codex");
        assert_eq!(legacy_dirs[0].legacy_path, legacy_base.join("skills"));
        assert_eq!(legacy_dirs[0].shared_path, shared_base.join("skills"));
    }

    #[test]
    fn guidance_display_path_uses_filename() {
        let platform = PlatformConfig {
            name: "claude".into(),
            base_dir: "~/.claude".into(),
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
        };

        assert_eq!(
            platform.guidance_display_path(),
            Some("~/.claude/CLAUDE.md".into())
        );
    }
}
