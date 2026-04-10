use std::collections::{BTreeMap, HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::json;

use mcs_core::config::paths::home_dir;
use mcs_core::core::external_skills::ResolvedExternalSkillEntry;

use crate::api::error::AppError;
use crate::dto::{
    InstallTargetDto, InstallTargetScopeDto, NpxCatalogInstalledStateDto, NpxCatalogMatchDto,
    NpxInstalledActionsDto, NpxInstalledSkillInstanceDto, NpxInstalledSourceDto,
    NpxInstalledSourceKindDto, NpxInstalledTrackingDto, NpxInstalledTrackingKindDto,
    NpxInstalledUpdateDto, NpxInstalledUpdateKindDto, NpxSkillsCapabilitiesDto,
    NpxSkillsCapabilityDto, NpxSkillsCatalogItemDto, NpxSkillsCliConfigDto, NpxSkillsCliMode,
    NpxSkillsInstalledInventoryDto, NpxSkillsInstalledSummaryDto, NpxTaxonomyCategoryDto,
    NpxTaxonomyGroupDto, ResolvedInstallTargetDto,
};
use crate::services::npx_skills_cli::{
    build_list_args, execute_skills_command, format_skills_command_preview,
};

const CHECK_CACHE_VERSION: u32 = 1;
const CHECK_CACHE_DIR: &str = "check-cache";
const INVENTORY_CACHE_TTL_MS: u64 = 5 * 60_000;
const LIST_CACHE_VERSION: u32 = 1;
const LIST_CACHE_DIR: &str = "list-cache";
const LIST_CACHE_TTL_MS: u64 = 10 * 60_000;
const GLOBAL_LOCK_FILE: &str = ".skill-lock.json";
const PROJECT_LOCK_FILE: &str = "skills-lock.json";
const MANUAL_GROUP_ID: &str = "manual";
const MANUAL_GROUP_LABEL: &str = "Manual";
const MANUAL_GROUP_ORDER: i32 = 90_000;
const CATEGORY_ORDER_GITHUB: i32 = 10;
const CATEGORY_ORDER_GIT: i32 = 20;
const CATEGORY_ORDER_LOCAL: i32 = 30;
const CATEGORY_ORDER_UNKNOWN: i32 = 40;
const PROJECT_MAINTENANCE_REASON: &str =
    "The current skills CLI only supports check/update from the global lock file.";
const DEFAULT_PAGE_SIZE: usize = 50;
const MAX_PAGE_SIZE: usize = 200;

#[derive(Clone, Debug, Deserialize, Serialize)]
struct CliListedSkill {
    name: String,
    path: String,
    #[serde(rename = "scope")]
    _scope: String,
    #[serde(default)]
    agents: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Default)]
struct GlobalLockFile {
    #[serde(default)]
    skills: HashMap<String, GlobalLockEntry>,
}

#[derive(Clone, Debug, Deserialize, Default)]
struct GlobalLockEntry {
    #[serde(default, rename = "sourceType")]
    source_type: Option<String>,
    #[serde(default)]
    source: Option<String>,
    #[serde(default, rename = "sourceUrl")]
    source_url: Option<String>,
    #[serde(default, rename = "skillPath")]
    skill_path: Option<String>,
    #[serde(default, rename = "skillFolderHash")]
    skill_folder_hash: Option<String>,
    #[serde(default, rename = "installedAt")]
    installed_at: Option<String>,
    #[serde(default, rename = "updatedAt")]
    updated_at: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Default)]
struct ProjectLockFile {
    #[serde(default)]
    skills: HashMap<String, ProjectLockEntry>,
}

#[derive(Clone, Debug, Deserialize, Default)]
struct ProjectLockEntry {
    #[serde(default, rename = "sourceType")]
    source_type: Option<String>,
    #[serde(default)]
    source: Option<String>,
    #[serde(default, rename = "computedHash")]
    computed_hash: Option<String>,
}

#[derive(Clone, Debug)]
struct LockMetadata {
    source_type: Option<String>,
    source_ref: Option<String>,
    installed_at: Option<String>,
    updated_at: Option<String>,
    update_supported: bool,
    update_reason: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
struct CheckCacheFile {
    version: u32,
    #[serde(default)]
    items: BTreeMap<String, CheckCacheEntry>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct CheckCacheEntry {
    status: String,
    checked_at_ms: u64,
    #[serde(default)]
    reason: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
struct ListedSkillsCacheFile {
    version: u32,
    cached_at_ms: u64,
    #[serde(default)]
    listed_skills: Vec<CliListedSkill>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct InventoryCacheKey {
    normalized_skills_path: String,
    install_target_scope: InstallTargetScopeDto,
    cli_mode: NpxSkillsCliMode,
}

#[derive(Clone, Debug)]
struct InstalledInventorySourceData {
    listed_skills: Vec<CliListedSkill>,
    lock_entries: HashMap<String, LockMetadata>,
    check_cache: CheckCacheFile,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct InventoryQuery {
    pub search: Option<String>,
    pub group_id: Option<String>,
    pub category_id: Option<String>,
    pub source_filter: Option<String>,
    pub tracking_filter: Option<String>,
    pub update_filter: Option<String>,
    pub page: Option<usize>,
    pub page_size: Option<usize>,
}

#[derive(Clone, Debug)]
pub struct InventoryPageResult {
    pub target: ResolvedInstallTargetDto,
    pub capabilities: NpxSkillsCapabilitiesDto,
    pub summary: NpxSkillsInstalledSummaryDto,
    pub groups: Vec<NpxTaxonomyGroupDto>,
    pub filtered_total: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
    pub items: Vec<NpxInstalledSkillInstanceDto>,
}

impl InventoryPageResult {
    pub fn into_dto(self) -> NpxSkillsInstalledInventoryDto {
        NpxSkillsInstalledInventoryDto {
            target: self.target,
            capabilities: self.capabilities,
            summary: self.summary,
            groups: self.groups,
            filtered_total: self.filtered_total,
            page: self.page,
            page_size: self.page_size,
            total_pages: self.total_pages,
            items: self.items,
        }
    }
}

#[derive(Clone, Debug)]
struct InventoryCacheEntry {
    cached_at_ms: u64,
    data: Arc<InstalledInventorySourceData>,
}

pub async fn resolve_inventory(
    project_root: &Path,
    install_target: &InstallTargetDto,
    resolved_target: ResolvedInstallTargetDto,
    catalog_entries: &[ResolvedExternalSkillEntry],
    cli_mode: NpxSkillsCliMode,
) -> Result<NpxSkillsInstalledInventoryDto, AppError> {
    let source_data =
        resolve_inventory_source_data(project_root, install_target, &resolved_target, cli_mode)
            .await?;
    let capabilities = build_capabilities(install_target.scope);
    let catalog_by_installed_name = catalog_entries
        .iter()
        .map(|entry| (catalog_installed_name(entry), entry))
        .collect::<HashMap<_, _>>();

    let mut items = source_data
        .listed_skills
        .iter()
        .cloned()
        .map(|listed| {
            let lock = source_data.lock_entries.get(listed.name.as_str());
            let cached = source_data.check_cache.items.get(listed.name.as_str());
            build_inventory_item(
                listed,
                install_target.scope,
                lock,
                &catalog_by_installed_name,
                cached,
                &capabilities,
            )
        })
        .collect::<Vec<_>>();

    items.sort_by(|left, right| {
        left.group_order
            .cmp(&right.group_order)
            .then_with(|| left.category_order.cmp(&right.category_order))
            .then_with(|| left.name.cmp(&right.name))
    });

    let filtered_total = items.len();
    let page_size = filtered_total.max(1);
    Ok(NpxSkillsInstalledInventoryDto {
        target: resolved_target,
        capabilities,
        summary: build_summary(&items),
        groups: build_taxonomy_groups(&items),
        filtered_total,
        page: 1,
        page_size,
        total_pages: 1,
        items,
    })
}

pub async fn resolve_inventory_page(
    project_root: &Path,
    install_target: &InstallTargetDto,
    resolved_target: ResolvedInstallTargetDto,
    catalog_entries: &[ResolvedExternalSkillEntry],
    cli_mode: NpxSkillsCliMode,
    query: &InventoryQuery,
) -> Result<InventoryPageResult, AppError> {
    let inventory = resolve_inventory(
        project_root,
        install_target,
        resolved_target,
        catalog_entries,
        cli_mode,
    )
    .await?;
    let search = query.search.as_ref().map(|value| value.to_lowercase());
    let mut filtered_items = inventory
        .items
        .into_iter()
        .filter(|item| item_matches_query(item, search.as_deref(), query))
        .collect::<Vec<_>>();
    filtered_items.sort_by(|left, right| {
        left.group_order
            .cmp(&right.group_order)
            .then_with(|| left.category_order.cmp(&right.category_order))
            .then_with(|| left.name.cmp(&right.name))
    });
    let filtered_total = filtered_items.len();
    let page_size = sanitize_page_size(query.page_size);
    let total_pages = total_pages(filtered_total, page_size);
    let page = sanitize_page(query.page, total_pages);
    let start = (page - 1) * page_size;
    let items = filtered_items
        .into_iter()
        .skip(start)
        .take(page_size)
        .collect::<Vec<_>>();

    Ok(InventoryPageResult {
        target: inventory.target,
        capabilities: inventory.capabilities,
        summary: inventory.summary,
        groups: inventory.groups,
        filtered_total,
        page,
        page_size,
        total_pages,
        items,
    })
}

#[cfg(test)]
pub fn apply_catalog_install_state(
    catalog_entries: Vec<ResolvedExternalSkillEntry>,
    inventory: &NpxSkillsInstalledInventoryDto,
) -> Vec<NpxSkillsCatalogItemDto> {
    let installed_ids = inventory
        .items
        .iter()
        .map(|item| (item.name.clone(), item.id.clone()))
        .collect::<HashMap<_, _>>();
    apply_catalog_install_state_with_lookup(catalog_entries, &installed_ids)
}

pub async fn resolve_catalog_install_state(
    project_root: &Path,
    install_target: &InstallTargetDto,
    resolved_target: &ResolvedInstallTargetDto,
    cli_mode: NpxSkillsCliMode,
) -> Result<HashMap<String, String>, AppError> {
    let source_data =
        resolve_inventory_source_data(project_root, install_target, resolved_target, cli_mode)
            .await?;
    Ok(source_data
        .listed_skills
        .iter()
        .map(|skill| (skill.name.clone(), skill.name.clone()))
        .collect())
}

pub fn apply_catalog_install_state_with_lookup(
    catalog_entries: Vec<ResolvedExternalSkillEntry>,
    installed_ids: &HashMap<String, String>,
) -> Vec<NpxSkillsCatalogItemDto> {
    let mut items = catalog_entries
        .into_iter()
        .map(|entry| {
            let installed_name = catalog_installed_name(&entry);
            let installed_instance_id = installed_ids.get(&installed_name).cloned();
            NpxSkillsCatalogItemDto {
                id: entry.id,
                name: entry.name,
                package_ref: entry.package_ref,
                skill_flag: entry.skill_flag,
                group_id: entry.group_id,
                group_label: entry.group_label,
                group_order: entry.group_order,
                category_id: entry.category_id,
                category_slug: entry.category_slug,
                category_label: entry.category_label,
                category_order: entry.category_order,
                tags: entry.tags,
                install_kind: entry.install_kind,
                install_provider: entry.install_provider,
                description: entry.description,
                stars: entry.stars,
                project_only: entry.project_only,
                usage: entry.usage,
                installed_state: if installed_instance_id.is_some() {
                    NpxCatalogInstalledStateDto::Installed
                } else {
                    NpxCatalogInstalledStateDto::NotInstalled
                },
                installed_instance_id,
            }
        })
        .collect::<Vec<_>>();

    items.sort_by(|left, right| left.name.cmp(&right.name));
    items
}

async fn resolve_inventory_source_data(
    project_root: &Path,
    install_target: &InstallTargetDto,
    resolved_target: &ResolvedInstallTargetDto,
    cli_mode: NpxSkillsCliMode,
) -> Result<Arc<InstalledInventorySourceData>, AppError> {
    let now_ms = unix_time_ms();
    let cache_key = inventory_cache_key(
        Path::new(&resolved_target.skills_path),
        install_target.scope,
        cli_mode,
    );
    if let Some(cached) = read_inventory_cache(&cache_key, now_ms, INVENTORY_CACHE_TTL_MS) {
        return Ok(cached);
    }

    let listed_skills = if let Some(cached) =
        read_persisted_list_cache(project_root, &cache_key, now_ms, LIST_CACHE_TTL_MS)
    {
        cached
    } else {
        let listed = list_installed_skills(install_target, cli_mode).await?;
        write_persisted_list_cache(project_root, &cache_key, &listed, now_ms);
        listed
    };
    let data = Arc::new(InstalledInventorySourceData {
        listed_skills,
        lock_entries: load_lock_entries(install_target)?,
        check_cache: read_check_cache(project_root, Path::new(&resolved_target.skills_path))?,
    });
    write_inventory_cache(cache_key, Arc::clone(&data), now_ms);
    Ok(data)
}

fn build_summary(items: &[NpxInstalledSkillInstanceDto]) -> NpxSkillsInstalledSummaryDto {
    NpxSkillsInstalledSummaryDto {
        total: items.len(),
        curated: items
            .iter()
            .filter(|item| matches!(item.source.kind, NpxInstalledSourceKindDto::Curated))
            .count(),
        manual: items
            .iter()
            .filter(|item| !matches!(item.source.kind, NpxInstalledSourceKindDto::Curated))
            .count(),
        tracked: items
            .iter()
            .filter(|item| matches!(item.tracking.kind, NpxInstalledTrackingKindDto::Tracked))
            .count(),
        update_available: items
            .iter()
            .filter(|item| matches!(item.update.kind, NpxInstalledUpdateKindDto::UpdateAvailable))
            .count(),
    }
}

fn item_matches_query(
    item: &NpxInstalledSkillInstanceDto,
    search: Option<&str>,
    query: &InventoryQuery,
) -> bool {
    if let Some(value) = search
        && !item_matches_search(item, value)
    {
        return false;
    }
    if let Some(ref group_id) = query.group_id
        && item.group_id != *group_id
    {
        return false;
    }
    if let Some(ref category_id) = query.category_id
        && item.category_id != *category_id
    {
        return false;
    }
    item_matches_source_filter(item, query.source_filter.as_deref())
        && item_matches_tracking_filter(item, query.tracking_filter.as_deref())
        && item_matches_update_filter(item, query.update_filter.as_deref())
}

fn item_matches_search(item: &NpxInstalledSkillInstanceDto, search: &str) -> bool {
    item.name.to_lowercase().contains(search)
        || item.source.r#ref.to_lowercase().contains(search)
        || item
            .description
            .as_ref()
            .is_some_and(|value| value.to_lowercase().contains(search))
        || item.group_label.to_lowercase().contains(search)
        || item.category_slug.to_lowercase().contains(search)
        || item.category_label.to_lowercase().contains(search)
        || item.source.display.to_lowercase().contains(search)
        || item
            .tags
            .iter()
            .any(|tag| tag.to_lowercase().contains(search))
}

fn item_matches_source_filter(item: &NpxInstalledSkillInstanceDto, filter: Option<&str>) -> bool {
    match filter.unwrap_or("all") {
        "all" | "" => true,
        "curated" => matches!(item.source.kind, NpxInstalledSourceKindDto::Curated),
        "manual" => !matches!(item.source.kind, NpxInstalledSourceKindDto::Curated),
        _ => true,
    }
}

fn item_matches_tracking_filter(item: &NpxInstalledSkillInstanceDto, filter: Option<&str>) -> bool {
    match filter.unwrap_or("all") {
        "all" | "" => true,
        "tracked" => matches!(item.tracking.kind, NpxInstalledTrackingKindDto::Tracked),
        "untracked" => matches!(item.tracking.kind, NpxInstalledTrackingKindDto::Untracked),
        _ => true,
    }
}

fn item_matches_update_filter(item: &NpxInstalledSkillInstanceDto, filter: Option<&str>) -> bool {
    match filter.unwrap_or("all") {
        "all" | "" => true,
        "not_checked" => matches!(item.update.kind, NpxInstalledUpdateKindDto::NotChecked),
        "up_to_date" => matches!(item.update.kind, NpxInstalledUpdateKindDto::UpToDate),
        "update_available" => {
            matches!(item.update.kind, NpxInstalledUpdateKindDto::UpdateAvailable)
        }
        "unsupported" => matches!(item.update.kind, NpxInstalledUpdateKindDto::Unsupported),
        _ => true,
    }
}

fn sanitize_page_size(page_size: Option<usize>) -> usize {
    page_size
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .clamp(1, MAX_PAGE_SIZE)
}

fn total_pages(filtered_total: usize, page_size: usize) -> usize {
    std::cmp::max(1, filtered_total.div_ceil(page_size))
}

fn sanitize_page(page: Option<usize>, total_pages: usize) -> usize {
    page.unwrap_or(1).clamp(1, total_pages)
}

fn build_taxonomy_groups(items: &[NpxInstalledSkillInstanceDto]) -> Vec<NpxTaxonomyGroupDto> {
    let mut groups =
        HashMap::<String, (String, i32, HashMap<String, NpxTaxonomyCategoryDto>)>::new();
    for item in items {
        let group = groups.entry(item.group_id.clone()).or_insert_with(|| {
            (
                item.group_label.clone(),
                item.group_order,
                HashMap::<String, NpxTaxonomyCategoryDto>::new(),
            )
        });

        let category =
            group
                .2
                .entry(item.category_id.clone())
                .or_insert_with(|| NpxTaxonomyCategoryDto {
                    id: item.category_id.clone(),
                    slug: item.category_slug.clone(),
                    label: item.category_label.clone(),
                    count: 0,
                    group_id: item.group_id.clone(),
                    group_order: item.group_order,
                    category_order: item.category_order,
                });
        category.count += 1;
    }

    let mut resolved = groups
        .into_iter()
        .map(|(id, (label, order, categories))| {
            let mut categories = categories.into_values().collect::<Vec<_>>();
            categories.sort_by(|left, right| {
                left.category_order
                    .cmp(&right.category_order)
                    .then_with(|| left.label.cmp(&right.label))
            });
            NpxTaxonomyGroupDto {
                id,
                label,
                order,
                categories,
            }
        })
        .collect::<Vec<_>>();
    resolved.sort_by(|left, right| {
        left.order
            .cmp(&right.order)
            .then_with(|| left.label.cmp(&right.label))
    });
    resolved
}

pub fn clear_check_cache(project_root: &Path, skills_path: &Path) -> Result<(), AppError> {
    let path = check_cache_path(project_root, skills_path);
    if !path.exists() {
        return Ok(());
    }

    std::fs::remove_file(&path).map_err(|error| {
        AppError::Internal(format!(
            "Failed to remove npx skills check cache {}: {error}",
            path.display()
        ))
    })
}

pub fn invalidate_inventory_cache(skills_path: &Path, install_target_scope: InstallTargetScopeDto) {
    let normalized_skills_path = normalize_path(skills_path);
    let mut cache = inventory_cache()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    cache.retain(|key, _| {
        !(key.normalized_skills_path == normalized_skills_path
            && key.install_target_scope == install_target_scope)
    });
}

pub fn clear_persisted_list_cache(
    project_root: &Path,
    skills_path: &Path,
    install_target_scope: InstallTargetScopeDto,
) {
    for cli_mode in [NpxSkillsCliMode::Auto, NpxSkillsCliMode::Npx] {
        let key = inventory_cache_key(skills_path, install_target_scope, cli_mode);
        let path = list_cache_path(project_root, &key);
        if path.exists() {
            let _ = std::fs::remove_file(path);
        }
    }
}

pub fn write_check_cache(
    project_root: &Path,
    skills_path: &Path,
    inventory: &NpxSkillsInstalledInventoryDto,
    output: &str,
) -> Result<(), AppError> {
    let mut cache = CheckCacheFile {
        version: CHECK_CACHE_VERSION,
        items: BTreeMap::new(),
    };
    let output = strip_ansi(output);
    let updates = parse_named_lines(&output, '↑');
    let unsupported = parse_named_reasons(&output, '•');
    let checked_at_ms = unix_time_ms();

    for item in &inventory.items {
        let entry = match item.update.kind {
            NpxInstalledUpdateKindDto::Unsupported => CheckCacheEntry {
                status: "unsupported".into(),
                checked_at_ms,
                reason: item.update.reason.clone(),
            },
            _ if unsupported.contains_key(item.name.as_str()) => CheckCacheEntry {
                status: "unsupported".into(),
                checked_at_ms,
                reason: unsupported.get(item.name.as_str()).cloned().flatten(),
            },
            _ if updates.contains(item.name.as_str()) => CheckCacheEntry {
                status: "update_available".into(),
                checked_at_ms,
                reason: None,
            },
            _ => CheckCacheEntry {
                status: "up_to_date".into(),
                checked_at_ms,
                reason: None,
            },
        };
        cache.items.insert(item.id.clone(), entry);
    }

    write_check_cache_file(project_root, skills_path, &cache)
}

fn build_inventory_item<'a>(
    listed: CliListedSkill,
    target_scope: InstallTargetScopeDto,
    lock: Option<&'a LockMetadata>,
    catalog_by_installed_name: &HashMap<String, &'a ResolvedExternalSkillEntry>,
    cached: Option<&'a CheckCacheEntry>,
    capabilities: &NpxSkillsCapabilitiesDto,
) -> NpxInstalledSkillInstanceDto {
    let name = listed.name.trim().to_string();
    let catalog_entry = catalog_by_installed_name.get(name.as_str()).copied();
    let synthetic = synthetic_taxonomy(lock);
    let source = build_source(listed.path.as_str(), lock, catalog_entry);
    let tracking = build_tracking(lock);
    let update = build_update(lock, cached);
    let batch_updatable = capabilities.update.supported
        && matches!(
            update.kind,
            NpxInstalledUpdateKindDto::NotChecked
                | NpxInstalledUpdateKindDto::UpToDate
                | NpxInstalledUpdateKindDto::UpdateAvailable
        );

    NpxInstalledSkillInstanceDto {
        id: name.clone(),
        name,
        scope: target_scope,
        agents: listed.agents,
        group_id: catalog_entry
            .map(|entry| entry.group_id.clone())
            .unwrap_or_else(|| MANUAL_GROUP_ID.to_string()),
        group_label: catalog_entry
            .map(|entry| entry.group_label.clone())
            .unwrap_or_else(|| MANUAL_GROUP_LABEL.to_string()),
        group_order: catalog_entry
            .map(|entry| entry.group_order)
            .unwrap_or(MANUAL_GROUP_ORDER),
        category_id: catalog_entry
            .map(|entry| entry.category_id.clone())
            .unwrap_or_else(|| synthetic.category_id),
        category_slug: catalog_entry
            .map(|entry| entry.category_slug.clone())
            .unwrap_or_else(|| synthetic.category_slug),
        category_label: catalog_entry
            .map(|entry| entry.category_label.clone())
            .unwrap_or_else(|| synthetic.category_label),
        category_order: catalog_entry
            .map(|entry| entry.category_order)
            .unwrap_or(synthetic.category_order),
        tags: catalog_entry
            .map(|entry| entry.tags.clone())
            .unwrap_or_else(|| synthetic.tags),
        description: catalog_entry
            .and_then(|entry| entry.description.clone())
            .or(synthetic.description),
        source,
        catalog_match: catalog_entry.map(|entry| NpxCatalogMatchDto {
            id: entry.id.clone(),
            name: entry.name.clone(),
            category_label: entry.category_label.clone(),
        }),
        tracking,
        update,
        actions: NpxInstalledActionsDto {
            removable: true,
            reinstallable: lock
                .and_then(|entry| entry.source_ref.as_ref())
                .is_some_and(|value| !value.trim().is_empty()),
            batch_updatable,
        },
    }
}

fn build_capabilities(scope: InstallTargetScopeDto) -> NpxSkillsCapabilitiesDto {
    let list = NpxSkillsCapabilityDto {
        supported: true,
        reason: None,
    };
    let remove = NpxSkillsCapabilityDto {
        supported: true,
        reason: None,
    };
    let maintenance_supported = matches!(scope, InstallTargetScopeDto::Global);

    NpxSkillsCapabilitiesDto {
        list,
        remove,
        check: NpxSkillsCapabilityDto {
            supported: maintenance_supported,
            reason: (!maintenance_supported).then(|| PROJECT_MAINTENANCE_REASON.to_string()),
        },
        update: NpxSkillsCapabilityDto {
            supported: maintenance_supported,
            reason: (!maintenance_supported).then(|| PROJECT_MAINTENANCE_REASON.to_string()),
        },
    }
}

async fn list_installed_skills(
    install_target: &InstallTargetDto,
    cli_mode: NpxSkillsCliMode,
) -> Result<Vec<CliListedSkill>, AppError> {
    let cli_config = NpxSkillsCliConfigDto {
        agents: Vec::new(),
        cli_mode,
    };
    let args = build_list_args(matches!(
        install_target.scope,
        InstallTargetScopeDto::Global
    ));
    let result = execute_skills_command(&args, &cli_config, install_target).await?;
    if !result.success {
        return Err(AppError::BadRequestWithDetails {
            message: "Unable to load installed npx skills inventory".into(),
            details: json!({
                "remediation": "Ensure `skills list --json` is available through either the local `skills` binary or `npx skills`.",
                "command": format_skills_command_preview(&args),
                "output": result.output,
            }),
        });
    }

    let output = strip_ansi(&result.output);
    let mut listed: Vec<CliListedSkill> = serde_json::from_str(output.trim()).map_err(|error| {
        AppError::BadRequestWithDetails {
            message: "Unable to parse installed npx skills inventory".into(),
            details: json!({
                "remediation": "The installed skills inventory must be valid JSON. Verify the local skills CLI version supports `skills list --json`.",
                "command": format_skills_command_preview(&args),
                "parse_error": error.to_string(),
                "output": output,
            }),
        }
    })?;
    listed.sort_by(|left, right| left.name.cmp(&right.name));
    Ok(listed)
}

fn load_lock_entries(
    install_target: &InstallTargetDto,
) -> Result<HashMap<String, LockMetadata>, AppError> {
    match install_target.scope {
        InstallTargetScopeDto::Global => read_global_lock(),
        InstallTargetScopeDto::Project => install_target
            .project_path
            .as_ref()
            .map(PathBuf::from)
            .map_or_else(|| Ok(HashMap::new()), |path| read_project_lock(&path)),
    }
}

fn read_global_lock() -> Result<HashMap<String, LockMetadata>, AppError> {
    let path = std::env::var_os("XDG_STATE_HOME")
        .map(PathBuf::from)
        .map(|base| base.join("skills").join(GLOBAL_LOCK_FILE))
        .unwrap_or_else(|| home_dir().join(".agents").join(GLOBAL_LOCK_FILE));

    read_global_lock_from(&path)
}

fn read_project_lock(project_path: &Path) -> Result<HashMap<String, LockMetadata>, AppError> {
    let path = project_path.join(PROJECT_LOCK_FILE);
    read_project_lock_from(&path)
}

fn read_global_lock_from(path: &Path) -> Result<HashMap<String, LockMetadata>, AppError> {
    let file: GlobalLockFile = read_json_file(path)?;
    Ok(file
        .skills
        .into_iter()
        .map(|(name, entry)| (name, global_lock_metadata(entry)))
        .collect())
}

fn read_project_lock_from(path: &Path) -> Result<HashMap<String, LockMetadata>, AppError> {
    let file: ProjectLockFile = read_json_file(path)?;
    Ok(file
        .skills
        .into_iter()
        .map(|(name, entry)| (name, project_lock_metadata(entry)))
        .collect())
}

fn global_lock_metadata(entry: GlobalLockEntry) -> LockMetadata {
    let source_type = entry.source_type.clone();
    let source_ref = entry.source_url.clone().or_else(|| entry.source.clone());
    let update_supported = source_type.as_deref() != Some("local")
        && source_type.as_deref() != Some("git")
        && entry
            .skill_folder_hash
            .as_ref()
            .is_some_and(|value| !value.trim().is_empty())
        && entry
            .skill_path
            .as_ref()
            .is_some_and(|value| !value.trim().is_empty());

    let update_reason = if update_supported {
        None
    } else if source_type.as_deref() == Some("local") {
        Some("Local path entries cannot be checked for remote updates.".into())
    } else if source_type.as_deref() == Some("git") {
        Some("Git URL entries are not hash-tracked by the current skills CLI.".into())
    } else if entry.skill_folder_hash.as_deref().unwrap_or("").is_empty() {
        Some("No version hash recorded in the global lock file.".into())
    } else {
        Some("No skill path recorded in the global lock file.".into())
    };

    LockMetadata {
        source_type,
        source_ref,
        installed_at: entry.installed_at,
        updated_at: entry.updated_at,
        update_supported,
        update_reason,
    }
}

fn project_lock_metadata(entry: ProjectLockEntry) -> LockMetadata {
    let reason = if entry.computed_hash.as_deref().unwrap_or("").is_empty() {
        "Project lock entries do not include remote version tracking.".to_string()
    } else {
        "Project lock entries only track local snapshots, not remote update hashes.".into()
    };

    LockMetadata {
        source_type: entry.source_type,
        source_ref: entry.source,
        installed_at: None,
        updated_at: None,
        update_supported: false,
        update_reason: Some(reason),
    }
}

fn build_source(
    path: &str,
    lock: Option<&LockMetadata>,
    catalog_entry: Option<&ResolvedExternalSkillEntry>,
) -> NpxInstalledSourceDto {
    let source_ref = lock
        .and_then(|entry| entry.source_ref.clone())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| path.to_string());
    let kind = if catalog_entry.is_some() {
        NpxInstalledSourceKindDto::Curated
    } else {
        classify_manual_kind(lock, &source_ref)
    };

    NpxInstalledSourceDto {
        kind,
        r#ref: source_ref.clone(),
        display: source_ref,
    }
}

fn build_tracking(lock: Option<&LockMetadata>) -> NpxInstalledTrackingDto {
    match lock {
        Some(lock) => NpxInstalledTrackingDto {
            kind: NpxInstalledTrackingKindDto::Tracked,
            source_type: lock.source_type.clone(),
            installed_at: lock.installed_at.clone(),
            updated_at: lock.updated_at.clone(),
            reason: None,
        },
        None => NpxInstalledTrackingDto {
            kind: NpxInstalledTrackingKindDto::Untracked,
            source_type: None,
            installed_at: None,
            updated_at: None,
            reason: Some("No lock metadata found for this installed skill.".into()),
        },
    }
}

fn build_update(
    lock: Option<&LockMetadata>,
    cached: Option<&CheckCacheEntry>,
) -> NpxInstalledUpdateDto {
    match lock {
        None => NpxInstalledUpdateDto {
            kind: NpxInstalledUpdateKindDto::Unsupported,
            last_checked_at_ms: None,
            reason: Some("No lock metadata found for this installed skill.".into()),
        },
        Some(lock) if !lock.update_supported => NpxInstalledUpdateDto {
            kind: NpxInstalledUpdateKindDto::Unsupported,
            last_checked_at_ms: None,
            reason: lock.update_reason.clone(),
        },
        Some(_) => match cached {
            Some(entry) if entry.status == "update_available" => NpxInstalledUpdateDto {
                kind: NpxInstalledUpdateKindDto::UpdateAvailable,
                last_checked_at_ms: Some(entry.checked_at_ms),
                reason: entry.reason.clone(),
            },
            Some(entry) if entry.status == "up_to_date" => NpxInstalledUpdateDto {
                kind: NpxInstalledUpdateKindDto::UpToDate,
                last_checked_at_ms: Some(entry.checked_at_ms),
                reason: None,
            },
            Some(entry) if entry.status == "unsupported" => NpxInstalledUpdateDto {
                kind: NpxInstalledUpdateKindDto::Unsupported,
                last_checked_at_ms: Some(entry.checked_at_ms),
                reason: entry.reason.clone(),
            },
            _ => NpxInstalledUpdateDto {
                kind: NpxInstalledUpdateKindDto::NotChecked,
                last_checked_at_ms: None,
                reason: None,
            },
        },
    }
}

fn synthetic_taxonomy(lock: Option<&LockMetadata>) -> SyntheticTaxonomy {
    match classify_manual_kind(lock, "") {
        NpxInstalledSourceKindDto::ManualGithub => SyntheticTaxonomy {
            category_id: "manual_github".into(),
            category_slug: "manual-github".into(),
            category_label: "GitHub".into(),
            category_order: CATEGORY_ORDER_GITHUB,
            description: Some("Installed from a GitHub or well-known source.".into()),
            tags: vec!["manual".into(), "github".into()],
        },
        NpxInstalledSourceKindDto::ManualGit => SyntheticTaxonomy {
            category_id: "manual_git".into(),
            category_slug: "manual-git".into(),
            category_label: "Git URL".into(),
            category_order: CATEGORY_ORDER_GIT,
            description: Some("Installed from a Git URL source.".into()),
            tags: vec!["manual".into(), "git".into()],
        },
        NpxInstalledSourceKindDto::ManualLocal => SyntheticTaxonomy {
            category_id: "manual_local".into(),
            category_slug: "manual-local".into(),
            category_label: "Local".into(),
            category_order: CATEGORY_ORDER_LOCAL,
            description: Some("Installed from a local path or node_modules source.".into()),
            tags: vec!["manual".into(), "local".into()],
        },
        _ => SyntheticTaxonomy {
            category_id: "manual_unknown".into(),
            category_slug: "manual-unknown".into(),
            category_label: "Unknown".into(),
            category_order: CATEGORY_ORDER_UNKNOWN,
            description: Some("Installed from an unknown or untracked source.".into()),
            tags: vec!["manual".into(), "unknown".into()],
        },
    }
}

fn classify_manual_kind(
    lock: Option<&LockMetadata>,
    source_ref: &str,
) -> NpxInstalledSourceKindDto {
    let source_type = lock.and_then(|entry| entry.source_type.as_deref());
    match source_type {
        Some("local") | Some("node_modules") => NpxInstalledSourceKindDto::ManualLocal,
        Some("git") => NpxInstalledSourceKindDto::ManualGit,
        Some("github") | Some("well-known") => NpxInstalledSourceKindDto::ManualGithub,
        _ if source_ref.contains("github.com") => NpxInstalledSourceKindDto::ManualGithub,
        _ if source_ref.starts_with("git@") || source_ref.ends_with(".git") => {
            NpxInstalledSourceKindDto::ManualGit
        }
        _ if source_ref.starts_with('.') || source_ref.starts_with('/') => {
            NpxInstalledSourceKindDto::ManualLocal
        }
        _ => NpxInstalledSourceKindDto::ManualUnknown,
    }
}

fn parse_named_lines(output: &str, marker: char) -> HashSet<String> {
    output
        .lines()
        .filter_map(|line| {
            let trimmed = line.trim();
            trimmed
                .strip_prefix(marker)
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(ToOwned::to_owned)
        })
        .collect()
}

fn parse_named_reasons(output: &str, marker: char) -> HashMap<String, Option<String>> {
    output
        .lines()
        .filter_map(|line| {
            let trimmed = line.trim();
            let payload = trimmed.strip_prefix(marker)?.trim();
            if payload.is_empty() {
                return None;
            }
            if let Some(start) = payload.rfind(" (")
                && payload.ends_with(')')
            {
                let name = payload[..start].trim().to_string();
                let reason = payload[start + 2..payload.len() - 1].trim().to_string();
                return Some((name, Some(reason)));
            }
            Some((payload.to_string(), None))
        })
        .collect()
}

fn read_check_cache(project_root: &Path, skills_path: &Path) -> Result<CheckCacheFile, AppError> {
    let path = check_cache_path(project_root, skills_path);
    if !path.exists() {
        return Ok(CheckCacheFile {
            version: CHECK_CACHE_VERSION,
            items: BTreeMap::new(),
        });
    }

    let mut cache: CheckCacheFile = read_json_file(&path)?;
    if cache.version == 0 {
        cache.version = CHECK_CACHE_VERSION;
    }
    Ok(cache)
}

fn write_check_cache_file(
    project_root: &Path,
    skills_path: &Path,
    cache: &CheckCacheFile,
) -> Result<(), AppError> {
    let path = check_cache_path(project_root, skills_path);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|error| {
            AppError::Internal(format!(
                "Failed to create npx skills check cache dir {}: {error}",
                parent.display()
            ))
        })?;
    }

    let content = serde_json::to_string_pretty(cache).map_err(|error| {
        AppError::Internal(format!(
            "Failed to serialize npx skills check cache {}: {error}",
            path.display()
        ))
    })?;

    std::fs::write(&path, content).map_err(|error| {
        AppError::Internal(format!(
            "Failed to write npx skills check cache {}: {error}",
            path.display()
        ))
    })
}

fn check_cache_path(project_root: &Path, skills_path: &Path) -> PathBuf {
    project_root
        .join(".omx")
        .join("state")
        .join("npx-skills")
        .join(CHECK_CACHE_DIR)
        .join(format!("{}.json", stable_path_hash(skills_path)))
}

fn list_cache_path(project_root: &Path, key: &InventoryCacheKey) -> PathBuf {
    project_root
        .join(".omx")
        .join("state")
        .join("npx-skills")
        .join(LIST_CACHE_DIR)
        .join(format!("{}.json", stable_key_hash(key)))
}

fn inventory_cache() -> &'static Mutex<HashMap<InventoryCacheKey, InventoryCacheEntry>> {
    static INVENTORY_CACHE: OnceLock<Mutex<HashMap<InventoryCacheKey, InventoryCacheEntry>>> =
        OnceLock::new();
    INVENTORY_CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn inventory_cache_key(
    skills_path: &Path,
    install_target_scope: InstallTargetScopeDto,
    cli_mode: NpxSkillsCliMode,
) -> InventoryCacheKey {
    InventoryCacheKey {
        normalized_skills_path: normalize_path(skills_path),
        install_target_scope,
        cli_mode,
    }
}

fn read_inventory_cache(
    key: &InventoryCacheKey,
    now_ms: u64,
    ttl_ms: u64,
) -> Option<Arc<InstalledInventorySourceData>> {
    let mut cache = inventory_cache()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    let (cached_at_ms, data) = cache
        .get(key)
        .map(|entry| (entry.cached_at_ms, Arc::clone(&entry.data)))?;
    if now_ms.saturating_sub(cached_at_ms) > ttl_ms {
        cache.remove(key);
        return None;
    }
    Some(data)
}

fn write_inventory_cache(
    key: InventoryCacheKey,
    data: Arc<InstalledInventorySourceData>,
    now_ms: u64,
) {
    let mut cache = inventory_cache()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    cache.insert(
        key,
        InventoryCacheEntry {
            cached_at_ms: now_ms,
            data,
        },
    );
}

fn read_persisted_list_cache(
    project_root: &Path,
    key: &InventoryCacheKey,
    now_ms: u64,
    ttl_ms: u64,
) -> Option<Vec<CliListedSkill>> {
    let path = list_cache_path(project_root, key);
    if !path.exists() {
        return None;
    }

    let cache: ListedSkillsCacheFile = match read_json_file(&path) {
        Ok(cache) => cache,
        Err(_) => return None,
    };
    if cache.version != LIST_CACHE_VERSION {
        return None;
    }
    if now_ms.saturating_sub(cache.cached_at_ms) > ttl_ms {
        let _ = std::fs::remove_file(path);
        return None;
    }
    Some(cache.listed_skills)
}

fn write_persisted_list_cache(
    project_root: &Path,
    key: &InventoryCacheKey,
    listed_skills: &[CliListedSkill],
    cached_at_ms: u64,
) {
    let path = list_cache_path(project_root, key);
    if let Some(parent) = path.parent()
        && std::fs::create_dir_all(parent).is_err()
    {
        return;
    }

    let cache = ListedSkillsCacheFile {
        version: LIST_CACHE_VERSION,
        cached_at_ms,
        listed_skills: listed_skills.to_vec(),
    };
    let Ok(content) = serde_json::to_string(&cache) else {
        return;
    };
    let _ = std::fs::write(path, content);
}

fn stable_path_hash(path: &Path) -> String {
    stable_hash(&normalize_path(path))
}

fn stable_key_hash(key: &InventoryCacheKey) -> String {
    stable_hash(&format!(
        "{}|{:?}|{:?}",
        key.normalized_skills_path, key.install_target_scope, key.cli_mode
    ))
}

fn stable_hash(input: &str) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in input.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("{hash:016x}")
}

fn normalize_path(path: &Path) -> String {
    let normalized = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let raw = normalized.to_string_lossy().replace('\\', "/");
    if cfg!(windows) {
        raw.to_lowercase()
    } else {
        raw
    }
}

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

fn read_json_file<T: DeserializeOwnedExt>(path: &Path) -> Result<T, AppError> {
    let content = std::fs::read_to_string(path).map_err(|error| {
        AppError::Internal(format!("Failed to read {}: {error}", path.display()))
    })?;
    T::deserialize_owned(&content)
        .map_err(|error| AppError::Internal(format!("Failed to parse {}: {error}", path.display())))
}

fn catalog_installed_name(entry: &ResolvedExternalSkillEntry) -> String {
    entry
        .skill_flag
        .clone()
        .unwrap_or_else(|| entry.name.clone())
}

fn strip_ansi(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    let mut chars = input.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '\u{1b}' {
            if matches!(chars.peek(), Some('[')) {
                chars.next();
                for next in chars.by_ref() {
                    if next.is_ascii_alphabetic() {
                        break;
                    }
                }
            }
            continue;
        }
        result.push(ch);
    }
    result
}

#[derive(Clone, Debug)]
struct SyntheticTaxonomy {
    category_id: String,
    category_slug: String,
    category_label: String,
    category_order: i32,
    description: Option<String>,
    tags: Vec<String>,
}

trait DeserializeOwnedExt: Sized {
    fn deserialize_owned(content: &str) -> Result<Self, serde_json::Error>;
}

impl<T> DeserializeOwnedExt for T
where
    T: for<'de> Deserialize<'de>,
{
    fn deserialize_owned(content: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(content)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn temp_dir(label: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "mcs_npx_inventory_{}_{}_{}",
            label,
            std::process::id(),
            unix_time_ms()
        ));
        fs::create_dir_all(&dir).expect("create temp dir");
        dir
    }

    fn catalog_entry(name: &str, skill_flag: Option<&str>) -> ResolvedExternalSkillEntry {
        ResolvedExternalSkillEntry {
            id: format!("{name}-id"),
            name: name.into(),
            description: Some(format!("{name} description")),
            stars: Some(5),
            project_only: false,
            usage: None,
            tags: vec!["tag".into()],
            group_id: "engineering".into(),
            group_label: "Engineering".into(),
            group_order: 10,
            category_id: "engineering".into(),
            category_slug: "engineering".into(),
            category_label: "Engineering".into(),
            category_order: 10,
            install_kind: "skills_cli".into(),
            install_provider: "vercel".into(),
            package_ref: "vercel-labs/skills".into(),
            skill_flag: skill_flag.map(str::to_string),
        }
    }

    fn inventory_with_item(
        item: NpxInstalledSkillInstanceDto,
        skills_path: &str,
    ) -> NpxSkillsInstalledInventoryDto {
        NpxSkillsInstalledInventoryDto {
            target: ResolvedInstallTargetDto {
                scope: InstallTargetScopeDto::Global,
                project_path: None,
                base_dir: "/tmp".into(),
                skills_path: skills_path.into(),
                commands_path: None,
                agents_path: None,
                guidance_path: None,
            },
            capabilities: build_capabilities(InstallTargetScopeDto::Global),
            summary: NpxSkillsInstalledSummaryDto {
                total: 1,
                curated: 1,
                manual: 0,
                tracked: 0,
                update_available: 0,
            },
            groups: vec![NpxTaxonomyGroupDto {
                id: "engineering".into(),
                label: "Engineering".into(),
                order: 10,
                categories: vec![NpxTaxonomyCategoryDto {
                    id: "engineering".into(),
                    slug: "engineering".into(),
                    label: "Engineering".into(),
                    count: 1,
                    group_id: "engineering".into(),
                    group_order: 10,
                    category_order: 10,
                }],
            }],
            filtered_total: 1,
            page: 1,
            page_size: 1,
            total_pages: 1,
            items: vec![item],
        }
    }

    fn source_data_with_names(names: &[&str]) -> Arc<InstalledInventorySourceData> {
        Arc::new(InstalledInventorySourceData {
            listed_skills: names
                .iter()
                .map(|name| CliListedSkill {
                    name: (*name).into(),
                    path: format!("/tmp/{name}"),
                    _scope: "global".into(),
                    agents: vec!["codex".into()],
                })
                .collect(),
            lock_entries: HashMap::new(),
            check_cache: CheckCacheFile {
                version: CHECK_CACHE_VERSION,
                items: BTreeMap::new(),
            },
        })
    }

    #[test]
    fn strip_ansi_removes_escape_sequences() {
        assert_eq!(strip_ansi("\u{1b}[32mhello\u{1b}[0m"), "hello");
    }

    #[test]
    fn parse_named_reasons_extracts_skipped_entries() {
        let parsed = parse_named_reasons("  • local-skill (Local path)\n", '•');
        assert_eq!(
            parsed.get("local-skill").and_then(|value| value.clone()),
            Some("Local path".into())
        );
    }

    #[test]
    fn build_inventory_item_prefers_catalog_taxonomy() {
        let listed = CliListedSkill {
            name: "find-skills".into(),
            path: "/tmp/find-skills".into(),
            _scope: "global".into(),
            agents: vec!["Claude Code".into()],
        };
        let mut catalog_by_name = HashMap::new();
        let entry = catalog_entry("find-skills", Some("find-skills"));
        catalog_by_name.insert("find-skills".into(), &entry);

        let item = build_inventory_item(
            listed,
            InstallTargetScopeDto::Global,
            None,
            &catalog_by_name,
            None,
            &build_capabilities(InstallTargetScopeDto::Global),
        );

        assert_eq!(item.group_id, "engineering");
        assert!(matches!(
            item.source.kind,
            NpxInstalledSourceKindDto::Curated
        ));
        assert!(item.catalog_match.is_some());
    }

    #[test]
    fn build_update_marks_missing_lock_as_unsupported() {
        let update = build_update(None, None);
        assert!(matches!(
            update.kind,
            NpxInstalledUpdateKindDto::Unsupported
        ));
    }

    #[test]
    fn build_taxonomy_groups_aggregates_counts_by_group_and_category() {
        let first = inventory_with_item(
            NpxInstalledSkillInstanceDto {
                id: "alpha".into(),
                name: "alpha".into(),
                scope: InstallTargetScopeDto::Global,
                agents: vec![],
                group_id: "engineering".into(),
                group_label: "Engineering".into(),
                group_order: 10,
                category_id: "engineering".into(),
                category_slug: "engineering".into(),
                category_label: "Engineering".into(),
                category_order: 10,
                tags: vec![],
                description: None,
                source: NpxInstalledSourceDto {
                    kind: NpxInstalledSourceKindDto::Curated,
                    r#ref: "vercel-labs/skills".into(),
                    display: "vercel-labs/skills".into(),
                },
                catalog_match: None,
                tracking: NpxInstalledTrackingDto {
                    kind: NpxInstalledTrackingKindDto::Tracked,
                    source_type: None,
                    installed_at: None,
                    updated_at: None,
                    reason: None,
                },
                update: NpxInstalledUpdateDto {
                    kind: NpxInstalledUpdateKindDto::NotChecked,
                    last_checked_at_ms: None,
                    reason: None,
                },
                actions: NpxInstalledActionsDto {
                    removable: true,
                    reinstallable: true,
                    batch_updatable: true,
                },
            },
            "/tmp/skills",
        );
        let mut items = first.items;
        items.push(NpxInstalledSkillInstanceDto {
            id: "beta".into(),
            name: "beta".into(),
            scope: InstallTargetScopeDto::Global,
            agents: vec![],
            group_id: "engineering".into(),
            group_label: "Engineering".into(),
            group_order: 10,
            category_id: "engineering".into(),
            category_slug: "engineering".into(),
            category_label: "Engineering".into(),
            category_order: 10,
            tags: vec![],
            description: None,
            source: NpxInstalledSourceDto {
                kind: NpxInstalledSourceKindDto::Curated,
                r#ref: "vercel-labs/skills".into(),
                display: "vercel-labs/skills".into(),
            },
            catalog_match: None,
            tracking: NpxInstalledTrackingDto {
                kind: NpxInstalledTrackingKindDto::Tracked,
                source_type: None,
                installed_at: None,
                updated_at: None,
                reason: None,
            },
            update: NpxInstalledUpdateDto {
                kind: NpxInstalledUpdateKindDto::NotChecked,
                last_checked_at_ms: None,
                reason: None,
            },
            actions: NpxInstalledActionsDto {
                removable: true,
                reinstallable: true,
                batch_updatable: true,
            },
        });

        let groups = build_taxonomy_groups(&items);
        assert_eq!(groups.len(), 1);
        assert_eq!(groups[0].categories.len(), 1);
        assert_eq!(groups[0].categories[0].slug, "engineering");
        assert_eq!(groups[0].categories[0].count, 2);
    }

    #[test]
    fn global_lock_metadata_marks_remote_hashes_as_updatable() {
        let metadata = global_lock_metadata(GlobalLockEntry {
            source_type: Some("github".into()),
            source: Some("owner/repo".into()),
            source_url: Some("https://github.com/owner/repo".into()),
            skill_path: Some("skills/find-skills".into()),
            skill_folder_hash: Some("abc123".into()),
            installed_at: Some("2026-03-23T00:00:00Z".into()),
            updated_at: Some("2026-03-24T00:00:00Z".into()),
        });

        assert!(metadata.update_supported);
        assert_eq!(
            metadata.source_ref.as_deref(),
            Some("https://github.com/owner/repo")
        );
        assert!(metadata.update_reason.is_none());
    }

    #[test]
    fn project_lock_metadata_stays_tracked_but_unsupported() {
        let metadata = project_lock_metadata(ProjectLockEntry {
            source_type: Some("node_modules".into()),
            source: Some("vercel-labs/skills".into()),
            computed_hash: Some("deadbeef".into()),
        });

        assert!(!metadata.update_supported);
        assert_eq!(metadata.source_type.as_deref(), Some("node_modules"));
        assert_eq!(
            metadata.update_reason.as_deref(),
            Some("Project lock entries only track local snapshots, not remote update hashes.")
        );
    }

    #[test]
    fn write_check_cache_roundtrips_update_and_unsupported_states() {
        let project_root = temp_dir("check-cache-root");
        let skills_path = project_root.join("skills");
        fs::create_dir_all(&skills_path).expect("skills dir");

        let inventory = NpxSkillsInstalledInventoryDto {
            target: ResolvedInstallTargetDto {
                scope: InstallTargetScopeDto::Global,
                project_path: None,
                base_dir: project_root.to_string_lossy().into_owned(),
                skills_path: skills_path.to_string_lossy().into_owned(),
                commands_path: None,
                agents_path: None,
                guidance_path: None,
            },
            capabilities: build_capabilities(InstallTargetScopeDto::Global),
            summary: NpxSkillsInstalledSummaryDto {
                total: 2,
                curated: 1,
                manual: 1,
                tracked: 2,
                update_available: 1,
            },
            groups: vec![],
            filtered_total: 2,
            page: 1,
            page_size: 2,
            total_pages: 1,
            items: vec![
                NpxInstalledSkillInstanceDto {
                    id: "find-skills".into(),
                    name: "find-skills".into(),
                    scope: InstallTargetScopeDto::Global,
                    agents: vec![],
                    group_id: "engineering".into(),
                    group_label: "Engineering".into(),
                    group_order: 1,
                    category_id: "engineering".into(),
                    category_slug: "engineering".into(),
                    category_label: "Engineering".into(),
                    category_order: 1,
                    tags: vec![],
                    description: None,
                    source: NpxInstalledSourceDto {
                        kind: NpxInstalledSourceKindDto::Curated,
                        r#ref: "vercel-labs/skills".into(),
                        display: "vercel-labs/skills".into(),
                    },
                    catalog_match: None,
                    tracking: NpxInstalledTrackingDto {
                        kind: NpxInstalledTrackingKindDto::Tracked,
                        source_type: Some("github".into()),
                        installed_at: None,
                        updated_at: None,
                        reason: None,
                    },
                    update: NpxInstalledUpdateDto {
                        kind: NpxInstalledUpdateKindDto::NotChecked,
                        last_checked_at_ms: None,
                        reason: None,
                    },
                    actions: NpxInstalledActionsDto {
                        removable: true,
                        reinstallable: true,
                        batch_updatable: true,
                    },
                },
                NpxInstalledSkillInstanceDto {
                    id: "local-only".into(),
                    name: "local-only".into(),
                    scope: InstallTargetScopeDto::Global,
                    agents: vec![],
                    group_id: "manual".into(),
                    group_label: "Manual".into(),
                    group_order: 2,
                    category_id: "manual_local".into(),
                    category_slug: "manual-local".into(),
                    category_label: "Local".into(),
                    category_order: 2,
                    tags: vec![],
                    description: None,
                    source: NpxInstalledSourceDto {
                        kind: NpxInstalledSourceKindDto::ManualLocal,
                        r#ref: "./skills/local-only".into(),
                        display: "./skills/local-only".into(),
                    },
                    catalog_match: None,
                    tracking: NpxInstalledTrackingDto {
                        kind: NpxInstalledTrackingKindDto::Tracked,
                        source_type: Some("local".into()),
                        installed_at: None,
                        updated_at: None,
                        reason: None,
                    },
                    update: NpxInstalledUpdateDto {
                        kind: NpxInstalledUpdateKindDto::Unsupported,
                        last_checked_at_ms: None,
                        reason: Some(
                            "Local path entries cannot be checked for remote updates.".into(),
                        ),
                    },
                    actions: NpxInstalledActionsDto {
                        removable: true,
                        reinstallable: true,
                        batch_updatable: false,
                    },
                },
            ],
        };

        write_check_cache(
            &project_root,
            &skills_path,
            &inventory,
            "1 update(s) available:\n  ↑ find-skills\n\n1 skill(s) cannot be checked automatically:\n  • local-only (Local path)\n",
        )
        .expect("write cache");

        let cache = read_check_cache(&project_root, &skills_path).expect("read cache");
        assert_eq!(
            cache
                .items
                .get("find-skills")
                .map(|entry| entry.status.as_str()),
            Some("update_available")
        );
        assert_eq!(
            cache
                .items
                .get("local-only")
                .map(|entry| entry.status.as_str()),
            Some("unsupported")
        );
    }

    #[test]
    fn inventory_cache_returns_cached_snapshot_for_matching_key() {
        let skills_path = temp_dir("inventory_cache_hit");
        let key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );
        let data = source_data_with_names(&["find-skills"]);

        write_inventory_cache(key.clone(), Arc::clone(&data), 1_000);

        let cached = read_inventory_cache(&key, 5_000, INVENTORY_CACHE_TTL_MS)
            .expect("cached inventory should exist");
        assert_eq!(cached.listed_skills.len(), 1);
        assert_eq!(
            cached.listed_skills.first().map(|item| item.name.clone()),
            Some("find-skills".into())
        );
    }

    #[test]
    fn inventory_cache_expires_after_ttl() {
        let skills_path = temp_dir("inventory_cache_expiry");
        let key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );

        write_inventory_cache(key.clone(), source_data_with_names(&["expiring"]), 1_000);

        assert!(read_inventory_cache(&key, 301_500, INVENTORY_CACHE_TTL_MS).is_none());
    }

    #[test]
    fn inventory_cache_invalidation_clears_matching_scope_and_path() {
        let skills_path = temp_dir("inventory_cache_invalidate");
        let global_key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );
        let project_key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Project,
            NpxSkillsCliMode::Auto,
        );
        let data = source_data_with_names(&["keep-me"]);

        write_inventory_cache(global_key.clone(), Arc::clone(&data), 1_000);
        write_inventory_cache(project_key.clone(), data, 1_000);

        invalidate_inventory_cache(&skills_path, InstallTargetScopeDto::Global);

        assert!(read_inventory_cache(&global_key, 2_000, INVENTORY_CACHE_TTL_MS).is_none());
        assert!(read_inventory_cache(&project_key, 2_000, INVENTORY_CACHE_TTL_MS).is_some());
    }

    #[test]
    fn persisted_list_cache_roundtrips_within_ttl() {
        let project_root = temp_dir("persisted-list-cache");
        let skills_path = project_root.join("skills");
        fs::create_dir_all(&skills_path).expect("skills dir");
        let key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );
        let listed_skills = source_data_with_names(&["find-skills", "review"])
            .listed_skills
            .clone();

        write_persisted_list_cache(&project_root, &key, &listed_skills, 1_000);

        let cached = read_persisted_list_cache(&project_root, &key, 5_000, LIST_CACHE_TTL_MS)
            .expect("persisted list cache should exist");
        assert_eq!(cached.len(), 2);
        assert_eq!(cached[0].name, "find-skills");
        assert_eq!(cached[1].name, "review");
    }

    #[test]
    fn persisted_list_cache_expires_after_ttl() {
        let project_root = temp_dir("persisted-list-expiry");
        let skills_path = project_root.join("skills");
        fs::create_dir_all(&skills_path).expect("skills dir");
        let key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );
        let listed_skills = source_data_with_names(&["expiring"]).listed_skills.clone();

        write_persisted_list_cache(&project_root, &key, &listed_skills, 1_000);

        assert!(
            read_persisted_list_cache(&project_root, &key, 601_500, LIST_CACHE_TTL_MS).is_none()
        );
    }

    #[test]
    fn clear_persisted_list_cache_removes_matching_scope_files() {
        let project_root = temp_dir("persisted-list-clear");
        let skills_path = project_root.join("skills");
        fs::create_dir_all(&skills_path).expect("skills dir");
        let global_key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );
        let project_key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Project,
            NpxSkillsCliMode::Auto,
        );
        let listed_skills = source_data_with_names(&["keep-me"]).listed_skills.clone();

        write_persisted_list_cache(&project_root, &global_key, &listed_skills, 1_000);
        write_persisted_list_cache(&project_root, &project_key, &listed_skills, 1_000);

        clear_persisted_list_cache(&project_root, &skills_path, InstallTargetScopeDto::Global);

        assert!(
            read_persisted_list_cache(&project_root, &global_key, 2_000, LIST_CACHE_TTL_MS)
                .is_none()
        );
        assert!(
            read_persisted_list_cache(&project_root, &project_key, 2_000, LIST_CACHE_TTL_MS)
                .is_some()
        );
    }

    #[test]
    fn build_capabilities_disables_project_maintenance() {
        let capabilities = build_capabilities(InstallTargetScopeDto::Project);
        assert!(!capabilities.check.supported);
        assert!(!capabilities.update.supported);
        assert_eq!(
            capabilities.check.reason.as_deref(),
            Some(PROJECT_MAINTENANCE_REASON)
        );
    }

    #[test]
    fn apply_catalog_install_state_marks_installed_rows() {
        let inventory = inventory_with_item(
            NpxInstalledSkillInstanceDto {
                id: "find-skills".into(),
                name: "find-skills".into(),
                scope: InstallTargetScopeDto::Global,
                agents: vec![],
                group_id: "engineering".into(),
                group_label: "Engineering".into(),
                group_order: 1,
                category_id: "engineering".into(),
                category_slug: "engineering".into(),
                category_label: "Engineering".into(),
                category_order: 1,
                tags: vec![],
                description: None,
                source: NpxInstalledSourceDto {
                    kind: NpxInstalledSourceKindDto::Curated,
                    r#ref: "vercel-labs/skills".into(),
                    display: "vercel-labs/skills".into(),
                },
                catalog_match: None,
                tracking: NpxInstalledTrackingDto {
                    kind: NpxInstalledTrackingKindDto::Tracked,
                    source_type: None,
                    installed_at: None,
                    updated_at: None,
                    reason: None,
                },
                update: NpxInstalledUpdateDto {
                    kind: NpxInstalledUpdateKindDto::NotChecked,
                    last_checked_at_ms: None,
                    reason: None,
                },
                actions: NpxInstalledActionsDto {
                    removable: true,
                    reinstallable: true,
                    batch_updatable: true,
                },
            },
            "/tmp/skills",
        );

        let items = apply_catalog_install_state(
            vec![catalog_entry("find-skills", Some("find-skills"))],
            &inventory,
        );
        assert!(matches!(
            items[0].installed_state,
            NpxCatalogInstalledStateDto::Installed
        ));
        assert_eq!(
            items[0].installed_instance_id.as_deref(),
            Some("find-skills")
        );
    }

    #[tokio::test]
    async fn resolve_inventory_page_sorts_before_paginating() {
        let project_root = temp_dir("inventory_page");
        let skills_path = project_root.join("skills");
        let cache_key = inventory_cache_key(
            &skills_path,
            InstallTargetScopeDto::Global,
            NpxSkillsCliMode::Auto,
        );
        write_inventory_cache(
            cache_key,
            source_data_with_names(&["zeta", "alpha", "beta"]),
            unix_time_ms(),
        );

        let page = resolve_inventory_page(
            &project_root,
            &InstallTargetDto {
                scope: InstallTargetScopeDto::Global,
                project_path: None,
            },
            ResolvedInstallTargetDto {
                scope: InstallTargetScopeDto::Global,
                project_path: None,
                base_dir: project_root.to_string_lossy().into_owned(),
                skills_path: skills_path.to_string_lossy().into_owned(),
                commands_path: None,
                agents_path: None,
                guidance_path: None,
            },
            &[],
            NpxSkillsCliMode::Auto,
            &InventoryQuery {
                page: Some(2),
                page_size: Some(1),
                ..InventoryQuery::default()
            },
        )
        .await
        .expect("resolve inventory page");

        assert_eq!(page.filtered_total, 3);
        assert_eq!(page.page, 2);
        assert_eq!(page.page_size, 1);
        assert_eq!(page.total_pages, 3);
        assert_eq!(page.items.len(), 1);
        assert_eq!(page.items[0].name, "beta");
    }

    #[test]
    fn malformed_global_lock_returns_error() {
        let project_root = temp_dir("broken_global_lock");
        let lock_path = project_root.join(GLOBAL_LOCK_FILE);
        fs::write(&lock_path, "{ not valid json").expect("write malformed lock");

        let error = read_global_lock_from(&lock_path).expect_err("lock should fail");
        let message = match error {
            AppError::Internal(message) => message,
            other => panic!("unexpected error: {other:?}"),
        };
        assert!(message.contains(lock_path.to_string_lossy().as_ref()));
    }

    #[test]
    fn malformed_project_lock_returns_error() {
        let project_root = temp_dir("broken_project_lock");
        let lock_path = project_root.join(PROJECT_LOCK_FILE);
        fs::write(&lock_path, "{ not valid json").expect("write malformed lock");

        let error = read_project_lock_from(&lock_path).expect_err("lock should fail");
        let message = match error {
            AppError::Internal(message) => message,
            other => panic!("unexpected error: {other:?}"),
        };
        assert!(message.contains(lock_path.to_string_lossy().as_ref()));
    }
}
