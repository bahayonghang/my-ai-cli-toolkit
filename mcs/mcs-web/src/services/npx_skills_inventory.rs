use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

use crate::api::error::AppError;
use crate::dto::{InstallTargetScopeDto, NpxSkillsOperation};

static INVENTORY_LOCK: std::sync::OnceLock<Arc<Mutex<()>>> = std::sync::OnceLock::new();

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct ManagedInventoryEntry {
    pub name: String,
    pub package_ref: String,
    #[serde(default)]
    pub catalog_entry_id: Option<String>,
    #[serde(default)]
    pub skill_flags: Vec<String>,
    #[serde(default)]
    pub agents: Vec<String>,
    pub install_target_scope: InstallTargetScopeDto,
    pub skills_path: String,
    pub last_operation: NpxSkillsOperation,
    pub updated_at_ms: u64,
    pub last_check_at_ms: Option<u64>,
    pub last_check_succeeded: Option<bool>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
struct InventoryFile {
    version: u32,
    skills_path: String,
    #[serde(default)]
    entries: Vec<ManagedInventoryEntry>,
}

pub async fn load_entries(
    project_root: &Path,
    skills_path: &Path,
) -> Result<Vec<ManagedInventoryEntry>, AppError> {
    let inventory = read_inventory(project_root, skills_path).await?;
    Ok(inventory.entries)
}

pub async fn upsert_entries(
    project_root: &Path,
    skills_path: &Path,
    entries: Vec<ManagedInventoryEntry>,
) -> Result<(), AppError> {
    if entries.is_empty() {
        return Ok(());
    }

    let _guard = inventory_lock().lock().await;
    let mut inventory = read_inventory_sync(project_root, skills_path)?;
    let mut by_name: HashMap<String, ManagedInventoryEntry> = inventory
        .entries
        .drain(..)
        .map(|entry| (entry.name.clone(), entry))
        .collect();

    for entry in entries {
        by_name.insert(entry.name.clone(), entry);
    }

    inventory.entries = by_name.into_values().collect();
    inventory
        .entries
        .sort_by(|left, right| left.name.cmp(&right.name));
    write_inventory_sync(project_root, skills_path, &inventory)?;
    Ok(())
}

pub async fn remove_entries(
    project_root: &Path,
    skills_path: &Path,
    names: &[String],
) -> Result<(), AppError> {
    if names.is_empty() {
        return Ok(());
    }

    let _guard = inventory_lock().lock().await;
    let mut inventory = read_inventory_sync(project_root, skills_path)?;
    let names: HashSet<&str> = names.iter().map(String::as_str).collect();
    inventory
        .entries
        .retain(|entry| !names.contains(entry.name.as_str()));
    write_inventory_sync(project_root, skills_path, &inventory)?;
    Ok(())
}

pub async fn touch_all_entries(
    project_root: &Path,
    skills_path: &Path,
    operation: NpxSkillsOperation,
    succeeded: bool,
) -> Result<(), AppError> {
    let _guard = inventory_lock().lock().await;
    let mut inventory = read_inventory_sync(project_root, skills_path)?;
    let now = unix_time_ms();
    for entry in &mut inventory.entries {
        entry.last_operation = operation;
        entry.updated_at_ms = now;
        entry.last_check_at_ms = Some(now);
        entry.last_check_succeeded = Some(succeeded);
    }
    write_inventory_sync(project_root, skills_path, &inventory)?;
    Ok(())
}

pub async fn discover_skill_names(skills_path: &Path) -> Result<HashSet<String>, AppError> {
    let path = skills_path.to_path_buf();
    tokio::task::spawn_blocking(move || discover_skill_names_sync(&path))
        .await
        .map_err(|error| AppError::Internal(format!("Failed to inspect skills path: {error}")))?
}

pub fn inventory_file_path(project_root: &Path, skills_path: &Path) -> PathBuf {
    project_root
        .join(".omx")
        .join("state")
        .join("npx-skills")
        .join("targets")
        .join(format!("{}.json", stable_path_hash(skills_path)))
}

fn inventory_lock() -> &'static Arc<Mutex<()>> {
    INVENTORY_LOCK.get_or_init(|| Arc::new(Mutex::new(())))
}

async fn read_inventory(
    project_root: &Path,
    skills_path: &Path,
) -> Result<InventoryFile, AppError> {
    let project_root = project_root.to_path_buf();
    let skills_path = skills_path.to_path_buf();
    tokio::task::spawn_blocking(move || read_inventory_sync(&project_root, &skills_path))
        .await
        .map_err(|error| AppError::Internal(format!("Failed to read inventory task: {error}")))?
}

fn read_inventory_sync(project_root: &Path, skills_path: &Path) -> Result<InventoryFile, AppError> {
    let path = inventory_file_path(project_root, skills_path);
    if !path.exists() {
        return Ok(InventoryFile {
            version: 1,
            skills_path: normalize_path(skills_path),
            entries: Vec::new(),
        });
    }

    let content = std::fs::read_to_string(&path).map_err(|error| {
        AppError::Internal(format!(
            "Failed to read inventory {}: {error}",
            path.display()
        ))
    })?;

    let mut inventory: InventoryFile = serde_json::from_str(&content).map_err(|error| {
        AppError::Internal(format!(
            "Failed to parse inventory {}: {error}",
            path.display()
        ))
    })?;

    if inventory.version == 0 {
        inventory.version = 1;
    }
    if inventory.skills_path.is_empty() {
        inventory.skills_path = normalize_path(skills_path);
    }

    Ok(inventory)
}

fn write_inventory_sync(
    project_root: &Path,
    skills_path: &Path,
    inventory: &InventoryFile,
) -> Result<(), AppError> {
    let path = inventory_file_path(project_root, skills_path);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|error| {
            AppError::Internal(format!(
                "Failed to create inventory dir {}: {error}",
                parent.display()
            ))
        })?;
    }

    let content = serde_json::to_string_pretty(inventory).map_err(|error| {
        AppError::Internal(format!(
            "Failed to serialize inventory {}: {error}",
            path.display()
        ))
    })?;

    std::fs::write(&path, content).map_err(|error| {
        AppError::Internal(format!(
            "Failed to write inventory {}: {error}",
            path.display()
        ))
    })
}

fn discover_skill_names_sync(skills_path: &Path) -> Result<HashSet<String>, AppError> {
    let mut names = HashSet::new();
    if !skills_path.exists() {
        return Ok(names);
    }
    walk_dirs_for_skills(skills_path, skills_path, &mut names)?;
    Ok(names)
}

fn walk_dirs_for_skills(
    root: &Path,
    current: &Path,
    names: &mut HashSet<String>,
) -> Result<(), AppError> {
    let entries = match std::fs::read_dir(current) {
        Ok(entries) => entries,
        Err(error) => {
            return Err(AppError::Internal(format!(
                "Failed to read skills dir {}: {error}",
                current.display()
            )));
        }
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        if path.join("SKILL.md").is_file()
            && let Ok(relative) = path.strip_prefix(root)
        {
            let relative = relative.to_string_lossy().replace('\\', "/");
            if !relative.is_empty() {
                names.insert(relative);
            }
        }

        walk_dirs_for_skills(root, &path, names)?;
    }

    Ok(())
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

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(label: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "mcs_npx_inventory_{}_{}_{}",
            label,
            std::process::id(),
            unix_time_ms()
        ));
        std::fs::create_dir_all(&dir).expect("create temp dir");
        dir
    }

    fn managed_entry(name: &str, skills_path: &Path) -> ManagedInventoryEntry {
        ManagedInventoryEntry {
            name: name.to_string(),
            package_ref: "owner/repo".to_string(),
            catalog_entry_id: Some("catalog-entry".to_string()),
            skill_flags: vec![],
            agents: vec!["codex".to_string()],
            install_target_scope: InstallTargetScopeDto::Global,
            skills_path: normalize_path(skills_path),
            last_operation: NpxSkillsOperation::Install,
            updated_at_ms: unix_time_ms(),
            last_check_at_ms: None,
            last_check_succeeded: None,
        }
    }

    #[tokio::test]
    async fn upsert_and_remove_inventory_entries_roundtrip() {
        let project_root = temp_dir("project");
        let skills_path = temp_dir("skills");

        upsert_entries(
            &project_root,
            &skills_path,
            vec![managed_entry("find-skills", &skills_path)],
        )
        .await
        .expect("upsert");
        let entries = load_entries(&project_root, &skills_path)
            .await
            .expect("load");
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "find-skills");

        remove_entries(&project_root, &skills_path, &["find-skills".to_string()])
            .await
            .expect("remove");
        let entries = load_entries(&project_root, &skills_path)
            .await
            .expect("load");
        assert!(entries.is_empty());
    }

    #[tokio::test]
    async fn discover_skill_names_scans_nested_skill_dirs() {
        let skills_path = temp_dir("discover");
        std::fs::create_dir_all(skills_path.join("top")).expect("top");
        std::fs::write(skills_path.join("top").join("SKILL.md"), "# top").expect("skill");
        std::fs::create_dir_all(skills_path.join("nested").join("deeper")).expect("nested");
        std::fs::write(
            skills_path.join("nested").join("deeper").join("SKILL.md"),
            "# nested",
        )
        .expect("skill");

        let names = discover_skill_names(&skills_path).await.expect("discover");
        assert!(names.contains("top"));
        assert!(names.contains("nested/deeper"));
    }

    #[test]
    fn inventory_path_is_stable_for_same_skills_path() {
        let root = temp_dir("root");
        let skills_path = temp_dir("skills-hash");
        assert_eq!(
            inventory_file_path(&root, &skills_path),
            inventory_file_path(&root, &skills_path)
        );
    }
}
