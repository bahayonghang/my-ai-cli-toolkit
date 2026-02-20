use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use tokio::sync::RwLock;

use mcs_core::config::platform::PlatformConfig;
use mcs_core::core::discovery::{
    discover_commands, discover_skill_sources, resolve_skills_for_platform, SkillSource,
};
use mcs_core::model::ItemInfo;

/// Shared application state accessible by all handlers
#[derive(Clone)]
pub struct AppState {
    inner: Arc<RwLock<AppStateInner>>,
    cache: Arc<RwLock<DiscoveryCache>>,
}

struct AppStateInner {
    project_root: PathBuf,
    platforms: HashMap<String, PlatformConfig>,
}

#[derive(Default)]
struct DiscoveryCache {
    /// Pre-scanned source skills (shared across all platforms)
    skill_sources: Vec<SkillSource>,
    /// Resolved skills per platform (with install status)
    skills: HashMap<String, Vec<ItemInfo>>,
    /// Discovered commands per platform
    commands: HashMap<String, Vec<ItemInfo>>,
}

impl AppState {
    pub fn new(project_root: PathBuf, platforms: HashMap<String, PlatformConfig>) -> Self {
        Self {
            inner: Arc::new(RwLock::new(AppStateInner {
                project_root,
                platforms,
            })),
            cache: Arc::new(RwLock::new(DiscoveryCache::default())),
        }
    }

    pub async fn project_root(&self) -> PathBuf {
        self.inner.read().await.project_root.clone()
    }

    pub async fn platforms(&self) -> HashMap<String, PlatformConfig> {
        self.inner.read().await.platforms.clone()
    }

    pub async fn platform(&self, id: &str) -> Option<PlatformConfig> {
        self.inner.read().await.platforms.get(id).cloned()
    }

    /// Get cached skills for a platform
    pub async fn skills(&self, platform_id: &str) -> Vec<ItemInfo> {
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.skills.get(platform_id) {
                return cached.clone();
            }
        }
        // Cache miss — refresh this platform and return
        self.refresh_platform(platform_id).await;
        self.cache
            .read()
            .await
            .skills
            .get(platform_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Get cached commands for a platform
    pub async fn commands(&self, platform_id: &str) -> Vec<ItemInfo> {
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.commands.get(platform_id) {
                return cached.clone();
            }
        }
        self.refresh_platform(platform_id).await;
        self.cache
            .read()
            .await
            .commands
            .get(platform_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Pre-warm cache for all platforms (call at startup).
    ///
    /// Scans source skills ONCE and resolves per-platform status efficiently.
    pub async fn warm_cache(&self) {
        let inner = self.inner.read().await;
        let root = inner.project_root.clone();
        let platforms = inner.platforms.clone();
        drop(inner);

        // Scan source skills once (the expensive part — directory walking + frontmatter parsing)
        let skill_sources = discover_skill_sources(&root);

        // Resolve per-platform status (fast — only checks target directories)
        let mut skills_map = HashMap::new();
        let mut commands_map = HashMap::new();
        for (id, platform) in &platforms {
            skills_map.insert(id.clone(), resolve_skills_for_platform(&skill_sources, platform));
            commands_map.insert(id.clone(), discover_commands(&root, platform));
        }

        let mut cache = self.cache.write().await;
        cache.skill_sources = skill_sources;
        cache.skills = skills_map;
        cache.commands = commands_map;
    }

    /// Invalidate and re-discover for a specific platform (after install/uninstall).
    ///
    /// Reuses cached source data — only re-checks target status.
    pub async fn invalidate_platform(&self, platform_id: &str) {
        let inner = self.inner.read().await;
        let root = inner.project_root.clone();
        let platform = inner.platforms.get(platform_id).cloned();
        drop(inner);

        if let Some(platform) = platform {
            let cache_read = self.cache.read().await;
            let sources = cache_read.skill_sources.clone();
            drop(cache_read);

            let skills = resolve_skills_for_platform(&sources, &platform);
            let commands = discover_commands(&root, &platform);

            let mut cache = self.cache.write().await;
            cache.skills.insert(platform_id.to_string(), skills);
            cache.commands.insert(platform_id.to_string(), commands);
        }
    }

    /// Invalidate cache for multiple platforms
    pub async fn invalidate_platforms(&self, platform_ids: &[String]) {
        let inner = self.inner.read().await;
        let root = inner.project_root.clone();
        let all_platforms = inner.platforms.clone();
        drop(inner);

        let cache_read = self.cache.read().await;
        let sources = cache_read.skill_sources.clone();
        drop(cache_read);

        let mut cache = self.cache.write().await;
        for pid in platform_ids {
            if let Some(platform) = all_platforms.get(pid) {
                cache
                    .skills
                    .insert(pid.clone(), resolve_skills_for_platform(&sources, platform));
                cache
                    .commands
                    .insert(pid.clone(), discover_commands(&root, platform));
            }
        }
    }

    /// Re-discover a single platform and update cache
    async fn refresh_platform(&self, platform_id: &str) {
        let inner = self.inner.read().await;
        let root = inner.project_root.clone();
        let platform = inner.platforms.get(platform_id).cloned();
        drop(inner);

        if let Some(platform) = platform {
            // Check if we have cached sources; if not, scan fresh
            let sources = {
                let cache_read = self.cache.read().await;
                if !cache_read.skill_sources.is_empty() {
                    cache_read.skill_sources.clone()
                } else {
                    drop(cache_read);
                    discover_skill_sources(&root)
                }
            };

            let skills = resolve_skills_for_platform(&sources, &platform);
            let commands = discover_commands(&root, &platform);

            let mut cache = self.cache.write().await;
            if cache.skill_sources.is_empty() {
                cache.skill_sources = sources;
            }
            cache.skills.insert(platform_id.to_string(), skills);
            cache.commands.insert(platform_id.to_string(), commands);
        }
    }
}
