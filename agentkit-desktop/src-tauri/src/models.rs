//! AgentKit Desktop - Core Data Models
//!
//! This module defines the core data structures used throughout the application.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Resource type classification
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum ResourceType {
    Skill,
    Command,
    Agent,
}

/// Synchronization status for a resource on a specific platform
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SyncStatus {
    NotInstalled,
    Synced,
    Outdated,
    Conflict,
    NotSupported,
}

/// Supported AI coding tool platforms
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum Platform {
    Claude,
    Codex,
    Gemini,
    Cursor,
    Windsurf,
    Antigravity,
    Qwen,
    Amp,
    Cline,
    Kiro,
    Trae,
    OpenCode,
}

impl Platform {
    /// Get all supported platforms
    pub fn all() -> Vec<Platform> {
        vec![
            Platform::Claude,
            Platform::Codex,
            Platform::Gemini,
            Platform::Cursor,
            Platform::Windsurf,
            Platform::Antigravity,
            Platform::Qwen,
            Platform::Amp,
            Platform::Cline,
            Platform::Kiro,
            Platform::Trae,
            Platform::OpenCode,
        ]
    }

    /// Get the skills directory path relative to user home
    pub fn skills_path(&self) -> &'static str {
        match self {
            Platform::Claude => ".claude/skills",
            Platform::Codex => ".codex/skills",
            Platform::Gemini => ".gemini/skills",
            Platform::Cursor => ".cursor/skills",
            Platform::Windsurf => ".codeium/windsurf/skills",
            Platform::Antigravity => ".gemini/antigravity/skills",
            Platform::Qwen => ".qwen/skills",
            Platform::Amp => ".amp/skills",
            Platform::Cline => ".cline/skills",
            Platform::Kiro => ".kiro/skills",
            Platform::Trae => ".trae/skills",
            Platform::OpenCode => ".opencode/skills",
        }
    }

    /// Get the commands directory path relative to user home
    pub fn commands_path(&self) -> &'static str {
        match self {
            Platform::Claude => ".claude/commands",
            Platform::Codex => ".codex/prompts",
            Platform::Gemini => ".gemini/commands",
            Platform::Cursor => ".cursor/commands",
            Platform::Windsurf => ".codeium/windsurf/workflows",
            Platform::Antigravity => ".gemini/antigravity/workflows",
            Platform::Qwen => ".qwen/commands",
            Platform::Amp => ".amp/commands",
            Platform::Cline => ".cline/commands",
            Platform::Kiro => ".kiro/commands",
            Platform::Trae => ".trae/commands",
            Platform::OpenCode => ".opencode/commands",
        }
    }

    /// Get the base directory path relative to user home
    pub fn base_path(&self) -> &'static str {
        match self {
            Platform::Claude => ".claude",
            Platform::Codex => ".codex",
            Platform::Gemini => ".gemini",
            Platform::Cursor => ".cursor",
            Platform::Windsurf => ".codeium/windsurf",
            Platform::Antigravity => ".gemini/antigravity",
            Platform::Qwen => ".qwen",
            Platform::Amp => ".amp",
            Platform::Cline => ".cline",
            Platform::Kiro => ".kiro",
            Platform::Trae => ".trae",
            Platform::OpenCode => ".opencode",
        }
    }

    /// Get the CLI command name for detection (if available)
    pub fn cli_command(&self) -> Option<&'static str> {
        match self {
            Platform::Claude => Some("claude"),
            Platform::Codex => Some("codex"),
            Platform::Gemini => Some("gemini"),
            Platform::Cursor => None,
            Platform::Windsurf => None,
            Platform::Antigravity => None,
            Platform::Qwen => Some("qwen"),
            Platform::Amp => Some("amp"),
            Platform::Cline => None,
            Platform::Kiro => Some("kiro"),
            Platform::Trae => None,
            Platform::OpenCode => Some("opencode"),
        }
    }

    /// Get display name for the platform
    pub fn display_name(&self) -> &'static str {
        match self {
            Platform::Claude => "Claude Code",
            Platform::Codex => "Codex CLI",
            Platform::Gemini => "Gemini CLI",
            Platform::Cursor => "Cursor",
            Platform::Windsurf => "Windsurf",
            Platform::Antigravity => "Antigravity",
            Platform::Qwen => "Qwen Code",
            Platform::Amp => "Amp",
            Platform::Cline => "Cline",
            Platform::Kiro => "Kiro",
            Platform::Trae => "Trae",
            Platform::OpenCode => "OpenCode",
        }
    }

    /// Get the full skills directory path (absolute)
    pub fn skills_path_full(&self) -> Option<PathBuf> {
        dirs::home_dir().map(|home| home.join(self.skills_path()))
    }

    /// Get the full commands directory path (absolute)
    pub fn commands_path_full(&self) -> Option<PathBuf> {
        dirs::home_dir().map(|home| home.join(self.commands_path()))
    }

    /// Get the full base directory path (absolute)
    pub fn base_path_full(&self) -> Option<PathBuf> {
        dirs::home_dir().map(|home| home.join(self.base_path()))
    }
}

/// Link mode for file synchronization
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "snake_case")]
pub enum LinkMode {
    #[default]
    Symlink,
    Junction,
    Copy,
}

/// Resource source information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ResourceSource {
    Local { path: PathBuf },
    Git { url: String, branch: String },
    Npm { package: String },
    Pip { package: String },
    Vercel { skill_name: String },
}

/// A resource item (skill, command, or agent)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResourceItem {
    pub id: String,
    pub name: String,
    pub resource_type: ResourceType,
    pub description: Option<String>,
    pub source: ResourceSource,
    pub categories: Vec<String>,
    pub tags: Vec<String>,
    pub platform_status: HashMap<Platform, SyncStatus>,
    pub created_at: String,
    pub updated_at: String,
}

/// Platform detection information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformInfo {
    pub platform: Platform,
    pub detected: bool,
    pub base_path: Option<PathBuf>,
    pub has_cli: bool,
    pub link_mode: LinkMode,
}

/// Application settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub default_link_mode: LinkMode,
    pub theme: Theme,
    pub language: Language,
    pub auto_detect_platforms: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            default_link_mode: LinkMode::Symlink,
            theme: Theme::System,
            language: Language::English,
            auto_detect_platforms: true,
        }
    }
}

/// UI theme
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "snake_case")]
pub enum Theme {
    Dark,
    Light,
    #[default]
    System,
}

/// UI language
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    #[default]
    English,
    Chinese,
}

/// External skill from registry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExternalSkill {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub source_type: String,
    pub package: Option<String>,
    pub repo: Option<String>,
    pub branch: Option<String>,
    pub homepage: Option<String>,
    pub license: Option<String>,
    pub supported_platforms: Vec<Platform>,
}

/// Sync operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncResult {
    pub success: bool,
    pub platform: Platform,
    pub resource_id: String,
    pub error: Option<String>,
}
