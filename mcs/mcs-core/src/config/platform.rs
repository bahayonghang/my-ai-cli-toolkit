use std::collections::HashMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use super::paths::home_dir;

#[derive(Debug, Clone, Serialize)]
pub struct PlatformConfig {
    pub name: String,
    pub base_dir: String,
    pub skills_subdir: String,
    pub commands_subdir: String,
    pub prompt_file: Option<String>,
    pub commands_source: String,
    pub fallback_commands_source: Option<String>,
}

impl PlatformConfig {
    pub fn base_path(&self) -> PathBuf {
        let expanded = self.base_dir.replace("~", &home_dir().to_string_lossy());
        PathBuf::from(expanded)
    }

    pub fn skills_path(&self) -> PathBuf {
        self.base_path().join(&self.skills_subdir)
    }

    pub fn commands_path(&self) -> PathBuf {
        self.base_path().join(&self.commands_subdir)
    }

    pub fn prompt_path(&self) -> Option<PathBuf> {
        self.prompt_file.as_ref().map(|f| self.base_path().join(f))
    }
}

/// Display metadata for platform selection screen (static references)
pub struct PlatformDisplay {
    pub id: &'static str,
    pub name: &'static str,
    pub icon: &'static str,
    pub base_dir: &'static str,
}

/// Owned display metadata for API responses
#[derive(Debug, Clone, Serialize)]
pub struct PlatformDisplayOwned {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub base_dir: String,
}

pub fn platform_displays() -> &'static [PlatformDisplay] {
    static DISPLAYS: std::sync::LazyLock<Vec<PlatformDisplay>> = std::sync::LazyLock::new(|| {
        vec![
            PlatformDisplay {
                id: "claude",
                name: "Claude",
                icon: "🤖",
                base_dir: "~/.claude/",
            },
            PlatformDisplay {
                id: "codex",
                name: "Codex",
                icon: "📦",
                base_dir: "~/.codex/",
            },
            PlatformDisplay {
                id: "cursor",
                name: "Cursor",
                icon: "🖱️",
                base_dir: "~/.cursor/",
            },
            PlatformDisplay {
                id: "gemini",
                name: "Gemini",
                icon: "✨",
                base_dir: "~/.agents/",
            },
            PlatformDisplay {
                id: "qwen",
                name: "Qwen",
                icon: "🔮",
                base_dir: "~/.qwen/",
            },
            PlatformDisplay {
                id: "qoder",
                name: "Qoder",
                icon: "⚡",
                base_dir: "~/.qoder/",
            },
            PlatformDisplay {
                id: "kiro",
                name: "Kiro",
                icon: "🎯",
                base_dir: "~/.kiro/",
            },
            PlatformDisplay {
                id: "trae",
                name: "Trae",
                icon: "🌊",
                base_dir: "~/.trae/",
            },
            PlatformDisplay {
                id: "trae-cn",
                name: "Trae CN",
                icon: "🌊",
                base_dir: "~/.trae-cn/",
            },
            PlatformDisplay {
                id: "opencode",
                name: "OpenCode",
                icon: "🔓",
                base_dir: "~/.config/opencode/",
            },
            PlatformDisplay {
                id: "iflow",
                name: "iFlow",
                icon: "🌀",
                base_dir: "~/.iflow/",
            },
            PlatformDisplay {
                id: "antigravity",
                name: "Antigravity",
                icon: "🚀",
                base_dir: "~/.gemini/antigravity/",
            },
            PlatformDisplay {
                id: "windsurf",
                name: "Windsurf",
                icon: "🏄",
                base_dir: "~/.codeium/windsurf/",
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
        })
        .collect()
}

fn p(
    name: &str,
    base: &str,
    skills: &str,
    cmds: &str,
    prompt: Option<&str>,
    src: &str,
    fallback: Option<&str>,
) -> PlatformConfig {
    PlatformConfig {
        name: name.into(),
        base_dir: base.into(),
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
                "skills",
                "commands",
                Some("CLAUDE.md"),
                "claude",
                None,
            ),
        ),
        (
            "codex".into(),
            p(
                "codex",
                "~/.codex",
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
                "skills",
                "commands",
                None,
                "gemini",
                None,
            ),
        ),
        (
            "qwen".into(),
            p(
                "qwen",
                "~/.qwen",
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
