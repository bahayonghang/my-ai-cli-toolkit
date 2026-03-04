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
    pub prompt_file: Option<String>,
    pub commands_source: String,
    pub fallback_commands_source: Option<String>,
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

    pub fn supports_commands(&self) -> bool {
        !self.commands_subdir.trim().is_empty() && !self.commands_source.trim().is_empty()
    }

    pub fn prompt_path(&self) -> Option<PathBuf> {
        self.prompt_file.as_ref().map(|f| self.base_path().join(f))
    }
}

fn expand_home_path(raw: &str) -> PathBuf {
    // Only expand a leading `~` (Unix-style home shorthand).
    // A bare `replace("~", home)` would corrupt Windows paths that contain
    // `~` mid-string (e.g. 8.3 short names like `RUNNER~1`).
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
    universal_shared_skills_platform_ids()
        .iter()
        .any(|id| *id == platform_id)
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

/// Display metadata for platform selection screen (static references)
pub struct PlatformDisplay {
    pub id: &'static str,
    pub name: &'static str,
    pub icon: &'static str,
    pub base_dir: &'static str,
    pub skills_dir: &'static str,
}

/// Owned display metadata for API responses
#[derive(Debug, Clone, Serialize)]
pub struct PlatformDisplayOwned {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub base_dir: String,
    pub skills_path: String,
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
                id: "amp",
                name: "Amp",
                icon: "🧩",
                base_dir: "~/.amp/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "cline",
                name: "Cline",
                icon: "🧩",
                base_dir: "~/.cline/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "codex",
                name: "Codex",
                icon: "🧩",
                base_dir: "~/.codex/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "cursor",
                name: "Cursor",
                icon: "🧩",
                base_dir: "~/.cursor/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "gemini",
                name: "Gemini",
                icon: "🧩",
                base_dir: "~/.agents/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "copilot",
                name: "GitHub Copilot",
                icon: "🧩",
                base_dir: "~/.copilot/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "kimi",
                name: "Kimi Code CLI",
                icon: "🧩",
                base_dir: "~/.kimi/",
                skills_dir: "~/.agents/skills/",
            },
            PlatformDisplay {
                id: "opencode",
                name: "OpenCode",
                icon: "🧩",
                base_dir: "~/.config/opencode/",
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

/// Get owned platform display data (for API serialization)
pub fn platform_displays_owned() -> Vec<PlatformDisplayOwned> {
    platform_displays()
        .iter()
        .map(|d| PlatformDisplayOwned {
            id: d.id.to_string(),
            name: d.name.to_string(),
            icon: d.icon.to_string(),
            base_dir: d.base_dir.to_string(),
            skills_path: d.skills_dir.to_string(),
        })
        .collect()
}

fn p(
    name: &str,
    base: &str,
    skills_base: Option<&str>,
    skills: &str,
    cmds: &str,
    prompt: Option<&str>,
    src: &str,
    fallback: Option<&str>,
) -> PlatformConfig {
    PlatformConfig {
        name: name.into(),
        base_dir: base.into(),
        skills_base_dir: skills_base.map(Into::into),
        skills_subdir: skills.into(),
        commands_subdir: cmds.into(),
        prompt_file: prompt.map(Into::into),
        commands_source: src.into(),
        fallback_commands_source: fallback.map(Into::into),
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
                "commands",
                Some("CLAUDE.md"),
                "claude",
                None,
            ),
        ),
        (
            "amp".into(),
            p(
                "amp",
                "~/.amp",
                Some("~/.agents"),
                "skills",
                "commands",
                None,
                "",
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
                "commands",
                None,
                "",
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
                "prompts",
                None,
                "codex",
                Some("claude"),
            ),
        ),
        (
            "cursor".into(),
            p(
                "cursor",
                "~/.cursor",
                Some("~/.agents"),
                "skills",
                "commands",
                None,
                "cursor",
                Some("claude"),
            ),
        ),
        (
            "gemini".into(),
            p(
                "gemini",
                "~/.agents",
                None,
                "skills",
                "commands",
                None,
                "gemini",
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
                "commands",
                None,
                "",
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
                "commands",
                None,
                "",
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
                "commands",
                None,
                "qwen",
                Some("claude"),
            ),
        ),
        (
            "qoder".into(),
            p(
                "qoder",
                "~/.qoder",
                None,
                "skills",
                "commands",
                None,
                "qoder",
                Some("claude"),
            ),
        ),
        (
            "kiro".into(),
            p(
                "kiro",
                "~/.kiro",
                None,
                "skills",
                "steering",
                None,
                "kiro",
                Some("claude"),
            ),
        ),
        (
            "trae".into(),
            p(
                "trae",
                "~/.trae",
                None,
                "skills",
                "commands",
                None,
                "trae",
                Some("claude"),
            ),
        ),
        (
            "trae-cn".into(),
            p(
                "trae-cn",
                "~/.trae-cn",
                None,
                "skills",
                "commands",
                None,
                "trae",
                Some("claude"),
            ),
        ),
        (
            "opencode".into(),
            p(
                "opencode",
                "~/.config/opencode",
                Some("~/.agents"),
                "skills",
                "commands",
                None,
                "opencode",
                Some("claude"),
            ),
        ),
        (
            "iflow".into(),
            p(
                "iflow",
                "~/.iflow",
                None,
                "skills",
                "commands",
                None,
                "iflow",
                Some("claude"),
            ),
        ),
        (
            "antigravity".into(),
            p(
                "antigravity",
                "~/.gemini/antigravity",
                None,
                "skills",
                "workflows",
                None,
                "antigravity",
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
                "workflows",
                None,
                "windsurf",
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
    prompt_file: Option<String>,
    commands_source: Option<String>,
    fallback_commands_source: Option<String>,
}

#[derive(Deserialize)]
struct TomlConfig {
    platforms: Option<HashMap<String, TomlPlatform>>,
}

/// Load platforms with 3-tier priority: defaults → project TOML → user TOML
pub fn load_platforms(project_root: &Path) -> HashMap<String, PlatformConfig> {
    let mut platforms = default_platforms();

    // Project-level override
    apply_toml_overrides(&mut platforms, &project_root.join("platforms.toml"));

    // User-level override (highest priority)
    let user_config = home_dir()
        .join(".config")
        .join("myclaude")
        .join("platforms.toml");
    apply_toml_overrides(&mut platforms, &user_config);

    platforms
}

fn apply_toml_overrides(platforms: &mut HashMap<String, PlatformConfig>, path: &Path) {
    let content = match std::fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return,
    };
    let config: TomlConfig = match toml::from_str(&content) {
        Ok(c) => c,
        Err(_) => return,
    };
    let Some(toml_platforms) = config.platforms else {
        return;
    };

    for (name, tp) in toml_platforms {
        let entry = platforms.entry(name.clone()).or_insert_with(|| {
            p(
                &name,
                &format!("~/.{name}"),
                None,
                "skills",
                "commands",
                None,
                &name,
                None,
            )
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
        if let Some(v) = tp.prompt_file {
            entry.prompt_file = Some(v);
        }
        if let Some(v) = tp.commands_source {
            entry.commands_source = v;
        }
        if let Some(v) = tp.fallback_commands_source {
            entry.fallback_commands_source = Some(v);
        }
    }
}

/// Get commands source directory with fallback logic
pub fn commands_source_dir(platform: &PlatformConfig, commands_base: &Path) -> PathBuf {
    let primary = commands_base.join(&platform.commands_source);
    if primary.exists() {
        return primary;
    }
    if let Some(ref fallback) = platform.fallback_commands_source {
        let fb = commands_base.join(fallback);
        if fb.exists() {
            return fb;
        }
    }
    primary
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
            prompt_file: None,
            commands_source: commands_source.to_string(),
            fallback_commands_source: None,
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
        let platform = test_platform("~/.amp".to_string(), Some("~/.agents".to_string()), "");
        assert!(!platform.supports_commands());
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
                commands_subdir: "prompts".to_string(),
                prompt_file: None,
                commands_source: "codex".to_string(),
                fallback_commands_source: Some("claude".to_string()),
            },
        );

        let legacy_dirs = detect_legacy_skill_dirs(&platforms);
        assert_eq!(legacy_dirs.len(), 1);
        assert_eq!(legacy_dirs[0].platform_id, "codex");
        assert_eq!(legacy_dirs[0].legacy_path, legacy_base.join("skills"));
        assert_eq!(legacy_dirs[0].shared_path, shared_base.join("skills"));
    }
}
