use std::collections::{BTreeMap, HashMap, HashSet};
use std::path::{Path, PathBuf};
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
    NpxSkillsInstalledInventoryDto, NpxSkillsInstalledSummaryDto, ResolvedInstallTargetDto,
};
use crate::services::npx_skills_cli::{build_list_args, execute_skills_command};

const CHECK_CACHE_VERSION: u32 = 1;
const CHECK_CACHE_DIR: &str = "check-cache";
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

#[derive(Clone, Debug, Deserialize)]
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

pub async fn resolve_inventory(
    project_root: &Path,
    install_target: &InstallTargetDto,
    resolved_target: ResolvedInstallTargetDto,
    catalog_entries: &[ResolvedExternalSkillEntry],
    cli_mode: NpxSkillsCliMode,
) -> Result<NpxSkillsInstalledInventoryDto, AppError> {
    let listed_skills = list_installed_skills(install_target, cli_mode).await?;
    let lock_entries = load_lock_entries(install_target);
    let check_cache = read_check_cache(project_root, Path::new(&resolved_target.skills_path))?;
    let capabilities = build_capabilities(install_target.scope);
    let catalog_by_installed_name = catalog_entries
        .iter()
        .map(|entry| (catalog_installed_name(entry), entry))
        .collect::<HashMap<_, _>>();

    let mut items = listed_skills
        .into_iter()
        .map(|listed| {
            let lock = lock_entries.get(listed.name.as_str());
            let cached = check_cache.items.get(listed.name.as_str());
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

    let summary = NpxSkillsInstalledSummaryDto {
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
    };

    Ok(NpxSkillsInstalledInventoryDto {
        target: resolved_target,
        capabilities,
        summary,
        items,
    })
}

pub fn apply_catalog_install_state(
    catalog_entries: Vec<ResolvedExternalSkillEntry>,
    inventory: &NpxSkillsInstalledInventoryDto,
) -> Vec<NpxSkillsCatalogItemDto> {
    let installed_ids = inventory
        .items
        .iter()
        .map(|item| (item.name.clone(), item.id.clone()))
        .collect::<HashMap<_, _>>();

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
                "command": format_command_preview(&args),
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
                "command": format_command_preview(&args),
                "parse_error": error.to_string(),
                "output": output,
            }),
        }
    })?;
    listed.sort_by(|left, right| left.name.cmp(&right.name));
    Ok(listed)
}

fn load_lock_entries(install_target: &InstallTargetDto) -> HashMap<String, LockMetadata> {
    match install_target.scope {
        InstallTargetScopeDto::Global => read_global_lock(),
        InstallTargetScopeDto::Project => install_target
            .project_path
            .as_ref()
            .map(PathBuf::from)
            .map_or_else(HashMap::new, |path| read_project_lock(&path)),
    }
}

fn read_global_lock() -> HashMap<String, LockMetadata> {
    let path = std::env::var_os("XDG_STATE_HOME")
        .map(PathBuf::from)
        .map(|base| base.join("skills").join(GLOBAL_LOCK_FILE))
        .unwrap_or_else(|| home_dir().join(".agents").join(GLOBAL_LOCK_FILE));

    let file: GlobalLockFile = read_json_file(&path).unwrap_or_default();
    file.skills
        .into_iter()
        .map(|(name, entry)| (name, global_lock_metadata(entry)))
        .collect()
}

fn read_project_lock(project_path: &Path) -> HashMap<String, LockMetadata> {
    let path = project_path.join(PROJECT_LOCK_FILE);
    let file: ProjectLockFile = read_json_file(&path).unwrap_or_default();
    file.skills
        .into_iter()
        .map(|(name, entry)| (name, project_lock_metadata(entry)))
        .collect()
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
            category_label: "GitHub".into(),
            category_order: CATEGORY_ORDER_GITHUB,
            description: Some("Installed from a GitHub or well-known source.".into()),
            tags: vec!["manual".into(), "github".into()],
        },
        NpxInstalledSourceKindDto::ManualGit => SyntheticTaxonomy {
            category_id: "manual_git".into(),
            category_label: "Git URL".into(),
            category_order: CATEGORY_ORDER_GIT,
            description: Some("Installed from a Git URL source.".into()),
            tags: vec!["manual".into(), "git".into()],
        },
        NpxInstalledSourceKindDto::ManualLocal => SyntheticTaxonomy {
            category_id: "manual_local".into(),
            category_label: "Local".into(),
            category_order: CATEGORY_ORDER_LOCAL,
            description: Some("Installed from a local path or node_modules source.".into()),
            tags: vec!["manual".into(), "local".into()],
        },
        _ => SyntheticTaxonomy {
            category_id: "manual_unknown".into(),
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

fn stable_path_hash(path: &Path) -> String {
    let normalized = normalize_path(path);
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in normalized.as_bytes() {
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

fn format_command_preview(args: &[String]) -> String {
    format!("skills {}", args.join(" "))
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
            category_id: "tools".into(),
            category_label: "Tools".into(),
            category_order: 20,
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
            items: vec![item],
        }
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
            items: vec![
                NpxInstalledSkillInstanceDto {
                    id: "find-skills".into(),
                    name: "find-skills".into(),
                    scope: InstallTargetScopeDto::Global,
                    agents: vec![],
                    group_id: "engineering".into(),
                    group_label: "Engineering".into(),
                    group_order: 1,
                    category_id: "tools".into(),
                    category_label: "Tools".into(),
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
                category_id: "tools".into(),
                category_label: "Tools".into(),
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
}
