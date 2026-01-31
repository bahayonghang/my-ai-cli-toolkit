//! Repository Module
//!
//! Data access layer for resources, platforms, and settings.

use crate::models::*;
use rusqlite::{params, Connection, Result, Row};
use std::collections::HashMap;

/// Platform record tuple: (platform, detected, base_path, link_mode)
pub type PlatformRecord = (Platform, bool, Option<String>, LinkMode);

/// Resource repository for CRUD operations
pub struct ResourceRepository<'a> {
    conn: &'a Connection,
}

impl<'a> ResourceRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    /// Get all resources
    pub fn get_all(&self) -> Result<Vec<ResourceItem>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, type, description, source_type, source_path, source_url,
                    source_branch, source_package, created_at, updated_at
             FROM resources ORDER BY name"
        )?;

        let resources = stmt.query_map([], |row| self.row_to_resource(row))?
            .collect::<Result<Vec<_>>>()?;

        // Load platform status for each resource
        let mut result = Vec::new();
        for mut resource in resources {
            resource.platform_status = self.get_platform_status(&resource.id)?;
            resource.tags = self.get_resource_tags(&resource.id)?;
            resource.categories = self.get_resource_categories(&resource.id)?;
            result.push(resource);
        }

        Ok(result)
    }

    /// Get resource by ID
    pub fn get_by_id(&self, id: &str) -> Result<Option<ResourceItem>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, type, description, source_type, source_path, source_url,
                    source_branch, source_package, created_at, updated_at
             FROM resources WHERE id = ?"
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            let mut resource = self.row_to_resource(row)?;
            resource.platform_status = self.get_platform_status(&resource.id)?;
            resource.tags = self.get_resource_tags(&resource.id)?;
            resource.categories = self.get_resource_categories(&resource.id)?;
            Ok(Some(resource))
        } else {
            Ok(None)
        }
    }

    /// Insert a new resource
    pub fn insert(&self, resource: &ResourceItem) -> Result<()> {
        let (source_type, source_path, source_url, source_branch, source_package) =
            self.source_to_columns(&resource.source);

        self.conn.execute(
            "INSERT INTO resources (id, name, type, description, source_type, source_path,
                                    source_url, source_branch, source_package)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                resource.id,
                resource.name,
                resource_type_to_str(&resource.resource_type),
                resource.description,
                source_type,
                source_path,
                source_url,
                source_branch,
                source_package,
            ],
        )?;

        // Insert tags
        for tag in &resource.tags {
            self.add_tag(&resource.id, tag)?;
        }

        // Insert categories
        for category in &resource.categories {
            self.add_category(&resource.id, category)?;
        }

        Ok(())
    }

    /// Update an existing resource
    pub fn update(&self, resource: &ResourceItem) -> Result<()> {
        let (source_type, source_path, source_url, source_branch, source_package) =
            self.source_to_columns(&resource.source);

        self.conn.execute(
            "UPDATE resources SET name = ?, type = ?, description = ?, source_type = ?,
                                  source_path = ?, source_url = ?, source_branch = ?,
                                  source_package = ?
             WHERE id = ?",
            params![
                resource.name,
                resource_type_to_str(&resource.resource_type),
                resource.description,
                source_type,
                source_path,
                source_url,
                source_branch,
                source_package,
                resource.id,
            ],
        )?;

        Ok(())
    }

    /// Delete a resource
    pub fn delete(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM resources WHERE id = ?", params![id])?;
        Ok(())
    }

    /// Update platform status for a resource
    pub fn update_platform_status(&self, resource_id: &str, platform: Platform, status: SyncStatus, target_path: Option<&str>) -> Result<()> {
        let platform_str = platform_to_str(&platform);
        let status_str = sync_status_to_str(&status);
        let synced_at = if status == SyncStatus::Synced {
            Some(chrono::Utc::now().to_rfc3339())
        } else {
            None
        };

        self.conn.execute(
            "INSERT OR REPLACE INTO resource_platform_status (resource_id, platform, status, target_path, synced_at)
             VALUES (?, ?, ?, ?, ?)",
            params![resource_id, platform_str, status_str, target_path, synced_at],
        )?;

        Ok(())
    }

    /// Get platform status for a resource
    fn get_platform_status(&self, resource_id: &str) -> Result<HashMap<Platform, SyncStatus>> {
        let mut stmt = self.conn.prepare(
            "SELECT platform, status FROM resource_platform_status WHERE resource_id = ?"
        )?;

        let mut status_map = HashMap::new();
        let rows = stmt.query_map(params![resource_id], |row| {
            let platform_str: String = row.get(0)?;
            let status_str: String = row.get(1)?;
            Ok((platform_str, status_str))
        })?;

        for row in rows {
            let (platform_str, status_str) = row?;
            if let (Some(platform), Some(status)) = (str_to_platform(&platform_str), str_to_sync_status(&status_str)) {
                status_map.insert(platform, status);
            }
        }

        Ok(status_map)
    }

    /// Get tags for a resource
    fn get_resource_tags(&self, resource_id: &str) -> Result<Vec<String>> {
        let mut stmt = self.conn.prepare(
            "SELECT t.name FROM tags t
             JOIN resource_tags rt ON t.id = rt.tag_id
             WHERE rt.resource_id = ?"
        )?;

        let tags = stmt.query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;

        Ok(tags)
    }

    /// Get categories for a resource
    fn get_resource_categories(&self, resource_id: &str) -> Result<Vec<String>> {
        let mut stmt = self.conn.prepare(
            "SELECT c.name FROM categories c
             JOIN resource_categories rc ON c.id = rc.category_id
             WHERE rc.resource_id = ?"
        )?;

        let categories = stmt.query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;

        Ok(categories)
    }

    /// Add a tag to a resource
    fn add_tag(&self, resource_id: &str, tag_name: &str) -> Result<()> {
        let tag_id = tag_name.to_lowercase().replace(' ', "-");

        // Insert tag if not exists
        self.conn.execute(
            "INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)",
            params![tag_id, tag_name],
        )?;

        // Link tag to resource
        self.conn.execute(
            "INSERT OR IGNORE INTO resource_tags (resource_id, tag_id) VALUES (?, ?)",
            params![resource_id, tag_id],
        )?;

        Ok(())
    }

    /// Add a category to a resource
    fn add_category(&self, resource_id: &str, category_name: &str) -> Result<()> {
        let category_id = category_name.to_lowercase().replace(' ', "-");

        // Insert category if not exists
        self.conn.execute(
            "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
            params![category_id, category_name],
        )?;

        // Link category to resource
        self.conn.execute(
            "INSERT OR IGNORE INTO resource_categories (resource_id, category_id) VALUES (?, ?)",
            params![resource_id, category_id],
        )?;

        Ok(())
    }

    /// Convert a row to ResourceItem
    fn row_to_resource(&self, row: &Row) -> Result<ResourceItem> {
        let id: String = row.get(0)?;
        let name: String = row.get(1)?;
        let type_str: String = row.get(2)?;
        let description: Option<String> = row.get(3)?;
        let source_type: String = row.get(4)?;
        let source_path: Option<String> = row.get(5)?;
        let source_url: Option<String> = row.get(6)?;
        let source_branch: Option<String> = row.get(7)?;
        let source_package: Option<String> = row.get(8)?;
        let created_at: String = row.get(9)?;
        let updated_at: String = row.get(10)?;

        let resource_type = str_to_resource_type(&type_str).unwrap_or(ResourceType::Skill);
        let source = self.columns_to_source(&source_type, source_path, source_url, source_branch, source_package);

        Ok(ResourceItem {
            id,
            name,
            resource_type,
            description,
            source,
            categories: vec![],
            tags: vec![],
            platform_status: HashMap::new(),
            created_at,
            updated_at,
        })
    }

    /// Convert source to database columns
    fn source_to_columns(&self, source: &ResourceSource) -> (&'static str, Option<String>, Option<String>, Option<String>, Option<String>) {
        match source {
            ResourceSource::Local { path } => ("local", Some(path.display().to_string()), None, None, None),
            ResourceSource::Git { url, branch } => ("git", None, Some(url.clone()), Some(branch.clone()), None),
            ResourceSource::Npm { package } => ("npm", None, None, None, Some(package.clone())),
            ResourceSource::Pip { package } => ("pip", None, None, None, Some(package.clone())),
            ResourceSource::Vercel { skill_name } => ("vercel", None, None, None, Some(skill_name.clone())),
        }
    }

    /// Convert database columns to source
    fn columns_to_source(&self, source_type: &str, path: Option<String>, url: Option<String>, branch: Option<String>, package: Option<String>) -> ResourceSource {
        match source_type {
            "local" => ResourceSource::Local {
                path: path.map(std::path::PathBuf::from).unwrap_or_default()
            },
            "git" => ResourceSource::Git {
                url: url.unwrap_or_default(),
                branch: branch.unwrap_or_else(|| "main".to_string())
            },
            "npm" => ResourceSource::Npm {
                package: package.unwrap_or_default()
            },
            "pip" => ResourceSource::Pip {
                package: package.unwrap_or_default()
            },
            "vercel" => ResourceSource::Vercel {
                skill_name: package.unwrap_or_default()
            },
            _ => ResourceSource::Local { path: std::path::PathBuf::new() },
        }
    }
}

/// Platform repository
pub struct PlatformRepository<'a> {
    conn: &'a Connection,
}

impl<'a> PlatformRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    /// Update platform detection status
    pub fn update_detection(&self, platform: Platform, detected: bool, base_path: Option<&str>) -> Result<()> {
        let platform_str = platform_to_str(&platform);
        let now = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "UPDATE platforms SET detected = ?, base_path = ?, last_detected_at = ? WHERE platform = ?",
            params![detected as i32, base_path, now, platform_str],
        )?;

        Ok(())
    }

    /// Update platform link mode
    pub fn update_link_mode(&self, platform: Platform, link_mode: LinkMode) -> Result<()> {
        let platform_str = platform_to_str(&platform);
        let mode_str = link_mode_to_str(&link_mode);

        self.conn.execute(
            "UPDATE platforms SET link_mode = ? WHERE platform = ?",
            params![mode_str, platform_str],
        )?;

        Ok(())
    }

    /// Get all platforms
    pub fn get_all(&self) -> Result<Vec<PlatformRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT platform, detected, base_path, link_mode FROM platforms"
        )?;

        let rows = stmt.query_map([], |row| {
            let platform_str: String = row.get(0)?;
            let detected: i32 = row.get(1)?;
            let base_path: Option<String> = row.get(2)?;
            let link_mode_str: String = row.get(3)?;
            Ok((platform_str, detected != 0, base_path, link_mode_str))
        })?;

        let mut result = Vec::new();
        for row in rows {
            let (platform_str, detected, base_path, link_mode_str) = row?;
            if let Some(platform) = str_to_platform(&platform_str) {
                let link_mode = str_to_link_mode(&link_mode_str).unwrap_or(LinkMode::Symlink);
                result.push((platform, detected, base_path, link_mode));
            }
        }

        Ok(result)
    }
}

/// Settings repository
pub struct SettingsRepository<'a> {
    conn: &'a Connection,
}

impl<'a> SettingsRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    /// Get a setting value
    pub fn get(&self, key: &str) -> Result<Option<String>> {
        let mut stmt = self.conn.prepare("SELECT value FROM settings WHERE key = ?")?;
        let mut rows = stmt.query(params![key])?;

        if let Some(row) = rows.next()? {
            Ok(Some(row.get(0)?))
        } else {
            Ok(None)
        }
    }

    /// Set a setting value
    pub fn set(&self, key: &str, value: &str) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            params![key, value],
        )?;
        Ok(())
    }

    /// Get all settings as Settings struct
    pub fn get_settings(&self) -> Result<Settings> {
        let default_link_mode = self.get("default_link_mode")?
            .and_then(|v| serde_json::from_str(&v).ok())
            .unwrap_or(LinkMode::Symlink);

        let theme = self.get("theme")?
            .and_then(|v| serde_json::from_str(&v).ok())
            .unwrap_or(Theme::System);

        let language = self.get("language")?
            .and_then(|v| serde_json::from_str(&v).ok())
            .unwrap_or(Language::English);

        let auto_detect_platforms = self.get("auto_detect_platforms")?
            .and_then(|v| serde_json::from_str(&v).ok())
            .unwrap_or(true);

        Ok(Settings {
            default_link_mode,
            theme,
            language,
            auto_detect_platforms,
        })
    }

    /// Save settings
    pub fn save_settings(&self, settings: &Settings) -> Result<()> {
        self.set("default_link_mode", &serde_json::to_string(&settings.default_link_mode).unwrap())?;
        self.set("theme", &serde_json::to_string(&settings.theme).unwrap())?;
        self.set("language", &serde_json::to_string(&settings.language).unwrap())?;
        self.set("auto_detect_platforms", &serde_json::to_string(&settings.auto_detect_platforms).unwrap())?;
        Ok(())
    }
}

// Helper functions for enum conversion
fn resource_type_to_str(rt: &ResourceType) -> &'static str {
    match rt {
        ResourceType::Skill => "skill",
        ResourceType::Command => "command",
        ResourceType::Agent => "agent",
    }
}

fn str_to_resource_type(s: &str) -> Option<ResourceType> {
    match s {
        "skill" => Some(ResourceType::Skill),
        "command" => Some(ResourceType::Command),
        "agent" => Some(ResourceType::Agent),
        _ => None,
    }
}

fn platform_to_str(p: &Platform) -> &'static str {
    match p {
        Platform::Claude => "claude",
        Platform::Codex => "codex",
        Platform::Gemini => "gemini",
        Platform::Cursor => "cursor",
        Platform::Windsurf => "windsurf",
        Platform::Antigravity => "antigravity",
        Platform::Qwen => "qwen",
        Platform::Amp => "amp",
        Platform::Cline => "cline",
        Platform::Kiro => "kiro",
        Platform::Trae => "trae",
        Platform::OpenCode => "opencode",
    }
}

fn str_to_platform(s: &str) -> Option<Platform> {
    match s {
        "claude" => Some(Platform::Claude),
        "codex" => Some(Platform::Codex),
        "gemini" => Some(Platform::Gemini),
        "cursor" => Some(Platform::Cursor),
        "windsurf" => Some(Platform::Windsurf),
        "antigravity" => Some(Platform::Antigravity),
        "qwen" => Some(Platform::Qwen),
        "amp" => Some(Platform::Amp),
        "cline" => Some(Platform::Cline),
        "kiro" => Some(Platform::Kiro),
        "trae" => Some(Platform::Trae),
        "opencode" => Some(Platform::OpenCode),
        _ => None,
    }
}

fn sync_status_to_str(s: &SyncStatus) -> &'static str {
    match s {
        SyncStatus::NotInstalled => "not_installed",
        SyncStatus::Synced => "synced",
        SyncStatus::Outdated => "outdated",
        SyncStatus::Conflict => "conflict",
        SyncStatus::NotSupported => "not_supported",
    }
}

fn str_to_sync_status(s: &str) -> Option<SyncStatus> {
    match s {
        "not_installed" => Some(SyncStatus::NotInstalled),
        "synced" => Some(SyncStatus::Synced),
        "outdated" => Some(SyncStatus::Outdated),
        "conflict" => Some(SyncStatus::Conflict),
        "not_supported" => Some(SyncStatus::NotSupported),
        _ => None,
    }
}

fn link_mode_to_str(m: &LinkMode) -> &'static str {
    match m {
        LinkMode::Symlink => "symlink",
        LinkMode::Junction => "junction",
        LinkMode::Copy => "copy",
    }
}

fn str_to_link_mode(s: &str) -> Option<LinkMode> {
    match s {
        "symlink" => Some(LinkMode::Symlink),
        "junction" => Some(LinkMode::Junction),
        "copy" => Some(LinkMode::Copy),
        _ => None,
    }
}
