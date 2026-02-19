//! Marketplace Cache Module
//!
//! SQLite cache layer for marketplace data with TTL support.

use crate::marketplace::{MarketplaceCategory, MarketplaceSkill};
use anyhow::Result;
use rusqlite::{params, Connection};
use tracing::{debug, info};

/// Default cache TTL in seconds (1 hour)
const DEFAULT_CACHE_TTL: i64 = 3600;
const SKILLS_SH_SNAPSHOT_PREFIX: &str = "skills_sh_snapshot";

/// Marketplace cache manager
pub struct MarketplaceCache<'a> {
    conn: &'a Connection,
}

impl<'a> MarketplaceCache<'a> {
    /// Create a new cache manager
    pub fn new(conn: &'a Connection) -> Self {
        debug!("Creating MarketplaceCache");
        Self { conn }
    }

    /// Get cached skills
    pub fn get_cached_skills(&self) -> Result<Vec<MarketplaceSkill>> {
        debug!("Fetching all cached skills");
        let mut stmt = self.conn.prepare(
            r#"
            SELECT id, name, description, owner, repo, stars, downloads,
                   categories, platforms, source, updated_at, installed
            FROM marketplace_skills
            ORDER BY stars DESC
            "#,
        )?;

        let skills: Vec<MarketplaceSkill> = stmt
            .query_map([], |row| {
                let categories_json: String = row.get(7)?;
                let platforms_json: String = row.get(8)?;

                Ok(MarketplaceSkill {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    owner: row.get(3)?,
                    repo: row.get(4)?,
                    stars: row.get(5)?,
                    downloads: row.get(6)?,
                    categories: serde_json::from_str(&categories_json).unwrap_or_default(),
                    platforms: serde_json::from_str(&platforms_json).unwrap_or_default(),
                    source: row.get(9)?,
                    updated_at: row.get(10)?,
                    installed: row.get::<_, i32>(11)? != 0,
                    skill: parse_skill_from_id(&row.get::<_, String>(0)?),
                    metric_label: row
                        .get::<_, Option<u32>>(6)?
                        .map(|_| "Installs".to_string()),
                    metric_value: row.get::<_, Option<u32>>(6)?.map(format_compact_number),
                    metric_delta: None,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        debug!(count = skills.len(), "Retrieved cached skills");
        Ok(skills)
    }

    /// Get cached skills with filters
    pub fn get_cached_skills_filtered(
        &self,
        sort_by: &str,
        search: Option<&str>,
        category: Option<&str>,
        source: Option<&str>,
        platform: Option<&str>,
    ) -> Result<Vec<MarketplaceSkill>> {
        debug!(
            sort_by = %sort_by,
            search = ?search,
            category = ?category,
            source = ?source,
            platform = ?platform,
            "Fetching cached skills with filters"
        );

        let mut conditions = vec!["1=1".to_string()];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        if let Some(search) = search {
            if !search.is_empty() {
                conditions.push("(name LIKE ? OR description LIKE ? OR owner LIKE ?)".to_string());
                let search_pattern = format!("%{}%", search);
                params_vec.push(Box::new(search_pattern.clone()));
                params_vec.push(Box::new(search_pattern.clone()));
                params_vec.push(Box::new(search_pattern));
            }
        }

        if let Some(category) = category {
            if !category.is_empty() && category != "all" {
                conditions.push("categories LIKE ?".to_string());
                params_vec.push(Box::new(format!("%\"{}%", category)));
            }
        }

        if let Some(source) = source {
            if !source.is_empty() && source != "all" {
                conditions.push("source = ?".to_string());
                params_vec.push(Box::new(source.to_string()));
            }
        }

        if let Some(platform) = platform {
            if !platform.is_empty() && platform != "all" {
                conditions.push("platforms LIKE ?".to_string());
                params_vec.push(Box::new(format!("%\"{}%", platform)));
            }
        }

        let order_by = match sort_by {
            "hot" => "updated_at DESC, stars DESC",
            "trending" => "updated_at DESC, stars DESC",
            "all_time" => "stars DESC",
            // Backward-compatible sort values (legacy clients/cache reads)
            "latest" => "updated_at DESC",
            "top" | "popular" => "stars DESC",
            _ => "stars DESC",
        };

        let sql = format!(
            r#"
            SELECT id, name, description, owner, repo, stars, downloads,
                   categories, platforms, source, updated_at, installed
            FROM marketplace_skills
            WHERE {}
            ORDER BY {}
            "#,
            conditions.join(" AND "),
            order_by
        );

        let mut stmt = self.conn.prepare(&sql)?;

        let params_refs: Vec<&dyn rusqlite::ToSql> =
            params_vec.iter().map(|p| p.as_ref()).collect();

        let skills: Vec<MarketplaceSkill> = stmt
            .query_map(params_refs.as_slice(), |row| {
                let categories_json: String = row.get(7)?;
                let platforms_json: String = row.get(8)?;

                Ok(MarketplaceSkill {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    owner: row.get(3)?,
                    repo: row.get(4)?,
                    stars: row.get(5)?,
                    downloads: row.get(6)?,
                    categories: serde_json::from_str(&categories_json).unwrap_or_default(),
                    platforms: serde_json::from_str(&platforms_json).unwrap_or_default(),
                    source: row.get(9)?,
                    updated_at: row.get(10)?,
                    installed: row.get::<_, i32>(11)? != 0,
                    skill: parse_skill_from_id(&row.get::<_, String>(0)?),
                    metric_label: row
                        .get::<_, Option<u32>>(6)?
                        .map(|_| "Installs".to_string()),
                    metric_value: row.get::<_, Option<u32>>(6)?.map(format_compact_number),
                    metric_delta: None,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        debug!(count = skills.len(), "Retrieved filtered cached skills");
        Ok(skills)
    }

    /// Update cache with new skills
    pub fn update_cache(&self, skills: &[MarketplaceSkill]) -> Result<()> {
        info!(count = skills.len(), "Updating marketplace cache");

        // Clear existing cache
        self.conn.execute("DELETE FROM marketplace_skills", [])?;
        debug!("Cleared existing cache");

        // Insert new skills
        let mut stmt = self.conn.prepare(
            r#"
            INSERT INTO marketplace_skills
            (id, name, description, owner, repo, stars, downloads, categories, platforms, source, updated_at, installed, cached_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            "#,
        )?;

        for skill in skills {
            let categories_json = serde_json::to_string(&skill.categories)?;
            let platforms_json = serde_json::to_string(&skill.platforms)?;

            stmt.execute(params![
                skill.id,
                skill.name,
                skill.description,
                skill.owner,
                skill.repo,
                skill.stars,
                skill.downloads,
                categories_json,
                platforms_json,
                skill.source,
                skill.updated_at,
                if skill.installed { 1 } else { 0 },
            ])?;
        }

        // Update last refresh timestamp
        self.conn.execute(
            "UPDATE marketplace_cache_meta SET value = datetime('now'), updated_at = datetime('now') WHERE key = 'last_refresh'",
            [],
        )?;

        info!(
            count = skills.len(),
            "Marketplace cache updated successfully"
        );
        Ok(())
    }

    pub fn get_skills_sh_snapshot(
        &self,
        sort_by: &str,
        ttl_seconds: i64,
    ) -> Result<Option<Vec<MarketplaceSkill>>> {
        let key = skills_sh_snapshot_key(sort_by);
        let json: Option<String> = self
            .conn
            .query_row(
                r#"
                SELECT value
                FROM marketplace_cache_meta
                WHERE key = ?
                  AND value IS NOT NULL
                  AND (julianday('now') - julianday(updated_at)) * 86400 <= ?
                "#,
                params![key, ttl_seconds],
                |row| row.get(0),
            )
            .ok();

        let Some(json) = json else {
            return Ok(None);
        };

        let parsed = serde_json::from_str::<Vec<MarketplaceSkill>>(&json)
            .map(Some)
            .unwrap_or(None);
        Ok(parsed)
    }

    pub fn get_skills_sh_snapshot_stale(
        &self,
        sort_by: &str,
    ) -> Result<Option<Vec<MarketplaceSkill>>> {
        let key = skills_sh_snapshot_key(sort_by);
        let json: Option<String> = self
            .conn
            .query_row(
                "SELECT value FROM marketplace_cache_meta WHERE key = ? AND value IS NOT NULL",
                params![key],
                |row| row.get(0),
            )
            .ok();

        let Some(json) = json else {
            return Ok(None);
        };

        let parsed = serde_json::from_str::<Vec<MarketplaceSkill>>(&json)
            .map(Some)
            .unwrap_or(None);
        Ok(parsed)
    }

    pub fn set_skills_sh_snapshot(&self, sort_by: &str, skills: &[MarketplaceSkill]) -> Result<()> {
        let key = skills_sh_snapshot_key(sort_by);
        let json = serde_json::to_string(skills)?;
        self.conn.execute(
            r#"
            INSERT INTO marketplace_cache_meta (key, value, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = datetime('now')
            "#,
            params![key, json],
        )?;
        Ok(())
    }

    pub fn invalidate_skills_sh_snapshot(&self, sort_by: Option<&str>) -> Result<()> {
        match sort_by {
            Some(sort_by) => {
                let key = skills_sh_snapshot_key(sort_by);
                self.conn.execute(
                    "UPDATE marketplace_cache_meta SET value = NULL, updated_at = datetime('now') WHERE key = ?",
                    params![key],
                )?;
            }
            None => {
                self.conn.execute(
                    "UPDATE marketplace_cache_meta SET value = NULL, updated_at = datetime('now') WHERE key LIKE ?",
                    params![format!("{SKILLS_SH_SNAPSHOT_PREFIX}:%")],
                )?;
            }
        }
        Ok(())
    }

    /// Check if cache is valid (not expired)
    pub fn is_cache_valid(&self) -> Result<bool> {
        debug!("Checking cache validity");

        // Get TTL setting
        let ttl: i64 = self
            .conn
            .query_row(
                "SELECT CAST(value AS INTEGER) FROM marketplace_cache_meta WHERE key = 'cache_ttl_seconds'",
                [],
                |row| row.get(0),
            )
            .unwrap_or(DEFAULT_CACHE_TTL);

        // Check if last refresh is within TTL
        let is_valid: bool = self
            .conn
            .query_row(
                r#"
                SELECT CASE
                    WHEN value IS NULL THEN 0
                    WHEN (julianday('now') - julianday(value)) * 86400 < ? THEN 1
                    ELSE 0
                END
                FROM marketplace_cache_meta
                WHERE key = 'last_refresh'
                "#,
                params![ttl],
                |row| row.get(0),
            )
            .unwrap_or(false);

        debug!(
            is_valid = is_valid,
            ttl_seconds = ttl,
            "Cache validity checked"
        );
        Ok(is_valid)
    }

    /// Invalidate cache (force refresh on next request)
    pub fn invalidate_cache(&self) -> Result<()> {
        info!("Invalidating marketplace cache");
        self.conn.execute(
            "UPDATE marketplace_cache_meta SET value = NULL WHERE key = 'last_refresh'",
            [],
        )?;
        debug!("Cache invalidated");
        Ok(())
    }

    /// Get cache statistics
    pub fn get_cache_stats(&self) -> Result<CacheStats> {
        debug!("Getting cache statistics");

        let skill_count: u32 =
            self.conn
                .query_row("SELECT COUNT(*) FROM marketplace_skills", [], |row| {
                    row.get(0)
                })?;

        let last_refresh: Option<String> = self
            .conn
            .query_row(
                "SELECT value FROM marketplace_cache_meta WHERE key = 'last_refresh'",
                [],
                |row| row.get(0),
            )
            .ok();

        let ttl: i64 = self
            .conn
            .query_row(
                "SELECT CAST(value AS INTEGER) FROM marketplace_cache_meta WHERE key = 'cache_ttl_seconds'",
                [],
                |row| row.get(0),
            )
            .unwrap_or(DEFAULT_CACHE_TTL);

        let is_valid = self.is_cache_valid()?;

        debug!(
            skill_count = skill_count,
            last_refresh = ?last_refresh,
            ttl_seconds = ttl,
            is_valid = is_valid,
            "Cache statistics retrieved"
        );

        Ok(CacheStats {
            skill_count,
            last_refresh,
            ttl_seconds: ttl,
            is_valid,
        })
    }

    /// Update skill installation status
    pub fn update_skill_installed(&self, skill_id: &str, installed: bool) -> Result<()> {
        debug!(skill_id = %skill_id, installed = installed, "Updating skill installation status");
        self.conn.execute(
            "UPDATE marketplace_skills SET installed = ? WHERE id = ?",
            params![if installed { 1 } else { 0 }, skill_id],
        )?;
        info!(skill_id = %skill_id, installed = installed, "Skill installation status updated");
        Ok(())
    }

    /// Get unique categories from cached skills
    pub fn get_categories(&self) -> Result<Vec<MarketplaceCategory>> {
        debug!("Extracting categories from cached skills");

        // Extract categories from cached skills
        let skills = self.get_cached_skills()?;

        let mut category_counts: std::collections::HashMap<String, u32> =
            std::collections::HashMap::new();

        for skill in &skills {
            for category in &skill.categories {
                *category_counts.entry(category.clone()).or_insert(0) += 1;
            }
        }

        let categories: Vec<MarketplaceCategory> = category_counts
            .into_iter()
            .map(|(name, count)| MarketplaceCategory {
                id: name.to_lowercase().replace(' ', "-"),
                name,
                count,
            })
            .collect();

        debug!(count = categories.len(), "Categories extracted from cache");
        Ok(categories)
    }
}

/// Cache statistics
#[derive(Debug, Clone, serde::Serialize)]
pub struct CacheStats {
    pub skill_count: u32,
    pub last_refresh: Option<String>,
    pub ttl_seconds: i64,
    pub is_valid: bool,
}

fn parse_skill_from_id(id: &str) -> Option<String> {
    let mut parts = id.trim_matches('/').split('/');
    let _owner = parts.next()?;
    let _repo = parts.next()?;
    parts
        .next()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

fn format_compact_number(value: u32) -> String {
    if value >= 1_000_000 {
        format!("{:.1}M", value as f64 / 1_000_000_f64)
    } else if value >= 1_000 {
        format!("{:.1}K", value as f64 / 1_000_f64)
    } else {
        value.to_string()
    }
}

fn skills_sh_snapshot_key(sort_by: &str) -> String {
    format!("{SKILLS_SH_SNAPSHOT_PREFIX}:{sort_by}")
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    fn setup_test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(include_str!("schema.sql")).unwrap();
        conn
    }

    #[test]
    fn test_cache_initially_invalid() {
        let conn = setup_test_db();
        let cache = MarketplaceCache::new(&conn);

        // Cache should be invalid initially (no data)
        assert!(!cache.is_cache_valid().unwrap());
    }

    #[test]
    fn test_update_and_get_cache() {
        let conn = setup_test_db();
        let cache = MarketplaceCache::new(&conn);

        let skills = vec![MarketplaceSkill {
            id: "test-1".to_string(),
            name: "Test Skill".to_string(),
            description: Some("A test".to_string()),
            owner: "owner".to_string(),
            repo: "repo".to_string(),
            stars: 100,
            downloads: Some(50),
            categories: vec!["web".to_string()],
            platforms: vec!["claude".to_string()],
            source: "community".to_string(),
            updated_at: "2024-01-01".to_string(),
            installed: false,
            skill: Some("test-skill".to_string()),
            metric_label: Some("Installs".to_string()),
            metric_value: Some("50".to_string()),
            metric_delta: None,
        }];

        cache.update_cache(&skills).unwrap();

        let cached = cache.get_cached_skills().unwrap();
        assert_eq!(cached.len(), 1);
        assert_eq!(cached[0].name, "Test Skill");
    }

    #[test]
    fn test_invalidate_cache() {
        let conn = setup_test_db();
        let cache = MarketplaceCache::new(&conn);

        // Update cache first
        cache.update_cache(&[]).unwrap();
        assert!(cache.is_cache_valid().unwrap());

        // Invalidate
        cache.invalidate_cache().unwrap();
        assert!(!cache.is_cache_valid().unwrap());
    }

    #[test]
    fn test_skills_sh_snapshot_roundtrip() {
        let conn = setup_test_db();
        let cache = MarketplaceCache::new(&conn);
        let skills = vec![MarketplaceSkill {
            id: "owner/repo/skill".to_string(),
            name: "skill".to_string(),
            description: None,
            owner: "owner".to_string(),
            repo: "repo".to_string(),
            stars: 10,
            downloads: Some(30),
            categories: vec![],
            platforms: vec![],
            source: "owner/repo".to_string(),
            updated_at: "2024-01-01".to_string(),
            installed: false,
            skill: Some("skill".to_string()),
            metric_label: Some("Installs".to_string()),
            metric_value: Some("30".to_string()),
            metric_delta: None,
        }];

        cache.set_skills_sh_snapshot("hot", &skills).unwrap();
        let cached = cache.get_skills_sh_snapshot("hot", 900).unwrap();
        assert!(cached.is_some());
        assert_eq!(cached.unwrap()[0].id, "owner/repo/skill");
    }
}
