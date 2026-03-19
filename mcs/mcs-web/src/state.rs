use std::collections::HashMap;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

use tokio::sync::RwLock;

use mcs_core::config::platform::PlatformConfig;
use mcs_core::core::discovery::{
    SkillSource, discover_agents, discover_commands, discover_skill_sources,
    resolve_skills_for_platform,
};
use mcs_core::core::external_skills::{ExternalSkillsRegistry, load_external_skills};
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
    /// Discovered agents per platform
    agents: HashMap<String, Vec<ItemInfo>>,
    /// Resolved skills for ad-hoc project targets, keyed by normalized skills path
    scoped_skills: HashMap<String, Vec<ItemInfo>>,
    /// Discovered commands for ad-hoc project targets, keyed by normalized commands path
    scoped_commands: HashMap<String, Vec<ItemInfo>>,
    /// Discovered agents for ad-hoc project targets, keyed by normalized agents path
    scoped_agents: HashMap<String, Vec<ItemInfo>>,
    /// External skills registry from TOML
    external_skills: Option<Result<ExternalSkillsRegistry, String>>,
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

    pub async fn related_platform_ids_by_skills_path(&self, platform_id: &str) -> Vec<String> {
        let platforms = self.platforms().await;
        shared_skill_path_group_for(&platforms, platform_id)
    }

    pub async fn related_platform_ids_for_platforms_by_skills_path(
        &self,
        platform_ids: &[String],
    ) -> Vec<String> {
        let platforms = self.platforms().await;
        let mut related = std::collections::BTreeSet::new();
        for platform_id in platform_ids {
            for id in shared_skill_path_group_for(&platforms, platform_id) {
                related.insert(id);
            }
        }
        related.into_iter().collect()
    }

    /// Get source skill catalog (platform-independent).
    pub async fn skill_catalog(&self) -> Vec<SkillSource> {
        {
            let cache = self.cache.read().await;
            if !cache.skill_sources.is_empty() {
                return cache.skill_sources.clone();
            }
        }

        let root = self.project_root().await;
        let sources = discover_skill_sources_async(root).await;
        let mut cache = self.cache.write().await;
        if cache.skill_sources.is_empty() {
            cache.skill_sources = sources.clone();
        }
        sources
    }

    /// Get external skill catalog from TOML registry.
    pub async fn external_skill_catalog(&self) -> Result<ExternalSkillsRegistry, String> {
        {
            let cache = self.cache.read().await;
            if let Some(ref registry) = cache.external_skills {
                return registry.clone();
            }
        }

        let root = self.project_root().await;
        let registry = load_external_skills(&root).map_err(|error| error.to_string());
        let mut cache = self.cache.write().await;
        if cache.external_skills.is_none() {
            cache.external_skills = Some(registry.clone());
        }
        registry
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

    /// Get cached agents for a platform
    pub async fn agents(&self, platform_id: &str) -> Vec<ItemInfo> {
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.agents.get(platform_id) {
                return cached.clone();
            }
        }
        self.refresh_platform(platform_id).await;
        self.cache
            .read()
            .await
            .agents
            .get(platform_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Resolve skills using an ad-hoc platform config without binding to platform-id cache.
    pub async fn skills_for_platform_config(&self, platform: &PlatformConfig) -> Vec<ItemInfo> {
        let cache_key = normalize_path_key(&platform.skills_path());
        {
            let cache_read = self.cache.read().await;
            if let Some(cached) = cache_read.scoped_skills.get(&cache_key) {
                return cached.clone();
            }
        }

        let sources = {
            let cache_read = self.cache.read().await;
            if !cache_read.skill_sources.is_empty() {
                cache_read.skill_sources.clone()
            } else {
                drop(cache_read);
                let root = self.project_root().await;
                discover_skill_sources_async(root).await
            }
        };
        let skills = resolve_skills_for_platform_async(sources.clone(), platform.clone()).await;

        let mut cache = self.cache.write().await;
        if cache.skill_sources.is_empty() {
            cache.skill_sources = sources;
        }
        cache.scoped_skills.insert(cache_key, skills.clone());
        skills
    }

    /// Resolve commands using an ad-hoc platform config without binding to platform-id cache.
    pub async fn commands_for_platform_config(&self, platform: &PlatformConfig) -> Vec<ItemInfo> {
        let cache_key = normalize_path_key(&platform.commands_path());
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.scoped_commands.get(&cache_key) {
                return cached.clone();
            }
        }
        let root = self.project_root().await;
        let commands = discover_commands_async(root, platform.clone()).await;
        self.cache
            .write()
            .await
            .scoped_commands
            .insert(cache_key, commands.clone());
        commands
    }

    /// Resolve agents using an ad-hoc platform config without binding to platform-id cache.
    pub async fn agents_for_platform_config(&self, platform: &PlatformConfig) -> Vec<ItemInfo> {
        let cache_key = normalize_path_key(&platform.agents_path());
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.scoped_agents.get(&cache_key) {
                return cached.clone();
            }
        }
        let root = self.project_root().await;
        let agents = discover_agents_async(root, platform.clone()).await;
        self.cache
            .write()
            .await
            .scoped_agents
            .insert(cache_key, agents.clone());
        agents
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
        let skill_sources = discover_skill_sources_async(root.clone()).await;

        let mut grouped_platforms: HashMap<String, Vec<(String, PlatformConfig)>> = HashMap::new();
        for (id, platform) in &platforms {
            grouped_platforms
                .entry(normalize_path_key(&platform.skills_path()))
                .or_default()
                .push((id.clone(), platform.clone()));
        }

        let mut skill_set = tokio::task::JoinSet::new();
        for (_, grouped) in grouped_platforms {
            let sources = skill_sources.clone();
            skill_set.spawn_blocking(move || {
                let (first_id, representative) = grouped
                    .first()
                    .cloned()
                    .expect("skill cache group should never be empty");
                let ids = grouped.into_iter().map(|(id, _)| id).collect::<Vec<_>>();
                let skills = resolve_skills_for_platform(&sources, &representative);
                (first_id, ids, skills)
            });
        }

        let mut command_set = tokio::task::JoinSet::new();
        let mut agent_set = tokio::task::JoinSet::new();
        for (id, platform) in platforms {
            let root = root.clone();
            let agent_root = root.clone();
            let agent_platform = platform.clone();
            let agent_id = id.clone();
            command_set.spawn_blocking(move || {
                let commands = discover_commands(&root, &platform);
                (id, commands)
            });
            agent_set.spawn_blocking(move || {
                let agents = discover_agents(&agent_root, &agent_platform);
                (agent_id, agents)
            });
        }

        let mut skills_map = HashMap::new();
        let mut commands_map = HashMap::new();
        let mut agents_map = HashMap::new();
        while let Some(res) = skill_set.join_next().await {
            if let Ok((_first_id, ids, skills)) = res {
                for id in ids {
                    skills_map.insert(id, skills.clone());
                }
            }
        }
        while let Some(res) = command_set.join_next().await {
            if let Ok((id, commands)) = res {
                commands_map.insert(id, commands);
            }
        }
        while let Some(res) = agent_set.join_next().await {
            if let Ok((id, agents)) = res {
                agents_map.insert(id, agents);
            }
        }

        let mut cache = self.cache.write().await;
        cache.skill_sources = skill_sources;
        cache.skills = skills_map;
        cache.commands = commands_map;
        cache.agents = agents_map;
        cache.scoped_skills.clear();
        cache.scoped_commands.clear();
        cache.scoped_agents.clear();
        cache.external_skills = None;
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
            let sources = self.cached_or_discovered_sources(root.clone()).await;
            let skills = resolve_skills_for_platform_async(sources.clone(), platform.clone()).await;
            let commands = discover_commands_async(root.clone(), platform.clone()).await;
            let agents = discover_agents_async(root, platform.clone()).await;

            let mut cache = self.cache.write().await;
            cache.skills.insert(platform_id.to_string(), skills);
            cache.commands.insert(platform_id.to_string(), commands);
            cache.agents.insert(platform_id.to_string(), agents);
        }
    }

    /// Invalidate cache for multiple platforms
    pub async fn invalidate_platforms(&self, platform_ids: &[String]) {
        let inner = self.inner.read().await;
        let root = inner.project_root.clone();
        let all_platforms = inner.platforms.clone();
        drop(inner);

        let sources = self.cached_or_discovered_sources(root.clone()).await;

        let mut skill_groups: HashMap<String, Vec<(String, PlatformConfig)>> = HashMap::new();
        let mut command_set = tokio::task::JoinSet::new();
        let mut agent_set = tokio::task::JoinSet::new();
        for pid in platform_ids {
            if let Some(platform) = all_platforms.get(pid) {
                skill_groups
                    .entry(normalize_path_key(&platform.skills_path()))
                    .or_default()
                    .push((pid.clone(), platform.clone()));
                let root = root.clone();
                let platform = platform.clone();
                let pid = pid.clone();
                let agent_root = root.clone();
                let agent_platform = platform.clone();
                let agent_pid = pid.clone();
                command_set.spawn_blocking(move || {
                    let commands = discover_commands(&root, &platform);
                    (pid, commands)
                });
                agent_set.spawn_blocking(move || {
                    let agents = discover_agents(&agent_root, &agent_platform);
                    (agent_pid, agents)
                });
            }
        }

        let mut skill_set = tokio::task::JoinSet::new();
        for (_, grouped) in skill_groups {
            let sources = sources.clone();
            skill_set.spawn_blocking(move || {
                let representative = grouped
                    .first()
                    .map(|(_, platform)| platform.clone())
                    .expect("invalidate skill group should never be empty");
                let ids = grouped.into_iter().map(|(id, _)| id).collect::<Vec<_>>();
                let skills = resolve_skills_for_platform(&sources, &representative);
                (ids, skills)
            });
        }

        let mut cache = self.cache.write().await;
        while let Some(res) = skill_set.join_next().await {
            if let Ok((ids, skills)) = res {
                for id in ids {
                    cache.skills.insert(id, skills.clone());
                }
            }
        }
        while let Some(res) = command_set.join_next().await {
            if let Ok((pid, commands)) = res {
                cache.commands.insert(pid, commands);
            }
        }
        while let Some(res) = agent_set.join_next().await {
            if let Ok((pid, agents)) = res {
                cache.agents.insert(pid, agents);
            }
        }
    }

    /// Invalidate cache for an ad-hoc platform config such as a project-scoped install target.
    pub async fn invalidate_platform_config(&self, platform: &PlatformConfig) {
        let root = self.project_root().await;
        let sources = self.cached_or_discovered_sources(root.clone()).await;
        let skills = resolve_skills_for_platform_async(sources, platform.clone()).await;
        let commands = discover_commands_async(root.clone(), platform.clone()).await;
        let agents = discover_agents_async(root, platform.clone()).await;
        let mut cache = self.cache.write().await;
        cache
            .scoped_skills
            .insert(normalize_path_key(&platform.skills_path()), skills);
        cache
            .scoped_commands
            .insert(normalize_path_key(&platform.commands_path()), commands);
        cache
            .scoped_agents
            .insert(normalize_path_key(&platform.agents_path()), agents);
    }

    /// Re-discover a single platform and update cache
    async fn refresh_platform(&self, platform_id: &str) {
        let inner = self.inner.read().await;
        let root = inner.project_root.clone();
        let platform = inner.platforms.get(platform_id).cloned();
        drop(inner);

        if let Some(platform) = platform {
            let sources = self.cached_or_discovered_sources(root.clone()).await;
            let skills = resolve_skills_for_platform_async(sources.clone(), platform.clone()).await;
            let commands = discover_commands_async(root.clone(), platform.clone()).await;
            let agents = discover_agents_async(root, platform.clone()).await;

            let mut cache = self.cache.write().await;
            if cache.skill_sources.is_empty() {
                cache.skill_sources = sources;
            }
            cache.skills.insert(platform_id.to_string(), skills);
            cache.commands.insert(platform_id.to_string(), commands);
            cache.agents.insert(platform_id.to_string(), agents);
        }
    }

    async fn cached_or_discovered_sources(&self, root: PathBuf) -> Vec<SkillSource> {
        let cached = {
            let cache = self.cache.read().await;
            cache.skill_sources.clone()
        };
        if !cached.is_empty() {
            return cached;
        }

        let sources = discover_skill_sources_async(root).await;
        let mut cache = self.cache.write().await;
        if cache.skill_sources.is_empty() {
            cache.skill_sources = sources.clone();
        }
        sources
    }
}

async fn discover_skill_sources_async(root: PathBuf) -> Vec<SkillSource> {
    tokio::task::spawn_blocking(move || discover_skill_sources(&root))
        .await
        .unwrap_or_else(|error| {
            tracing::error!("Failed to join skill discovery task: {error}");
            Vec::new()
        })
}

async fn resolve_skills_for_platform_async(
    sources: Vec<SkillSource>,
    platform: PlatformConfig,
) -> Vec<ItemInfo> {
    let platform_name = platform.name.clone();
    tokio::task::spawn_blocking(move || resolve_skills_for_platform(&sources, &platform))
        .await
        .unwrap_or_else(|error| {
            tracing::error!(
                platform = platform_name.as_str(),
                "Failed to join skill resolution task: {error}"
            );
            Vec::new()
        })
}

async fn discover_commands_async(root: PathBuf, platform: PlatformConfig) -> Vec<ItemInfo> {
    let platform_name = platform.name.clone();
    tokio::task::spawn_blocking(move || discover_commands(&root, &platform))
        .await
        .unwrap_or_else(|error| {
            tracing::error!(
                platform = platform_name.as_str(),
                "Failed to join command discovery task: {error}"
            );
            Vec::new()
        })
}

async fn discover_agents_async(root: PathBuf, platform: PlatformConfig) -> Vec<ItemInfo> {
    let platform_name = platform.name.clone();
    tokio::task::spawn_blocking(move || discover_agents(&root, &platform))
        .await
        .unwrap_or_else(|error| {
            tracing::error!(
                platform = platform_name.as_str(),
                "Failed to join agent discovery task: {error}"
            );
            Vec::new()
        })
}

fn shared_skill_path_group_for(
    platforms: &HashMap<String, PlatformConfig>,
    platform_id: &str,
) -> Vec<String> {
    let Some(current) = platforms.get(platform_id) else {
        return vec![platform_id.to_string()];
    };
    let current_key = normalize_path_key(&current.skills_path());

    let mut related = Vec::new();
    for (id, platform) in platforms {
        if normalize_path_key(&platform.skills_path()) == current_key {
            related.push(id.clone());
        }
    }
    related.sort();
    related
}

fn normalize_path_key(path: &Path) -> String {
    let normalized = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let raw = normalized.to_string_lossy().replace('\\', "/");
    if cfg!(windows) {
        raw.to_lowercase()
    } else {
        raw
    }
}
