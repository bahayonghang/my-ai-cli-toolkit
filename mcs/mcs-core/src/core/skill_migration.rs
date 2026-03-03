use std::collections::{BTreeMap, HashMap};
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::config::platform::PlatformConfig;
use crate::core::skill_store::{
    SkillInstallMode, canonical_meta_root, canonical_skill_path, copy_dir_replace, link_or_copy_dir,
};

const MIGRATION_ID: &str = "skills-symlink-v1";
const SKILL_FILE: &str = "SKILL.md";

#[derive(Debug, Clone)]
pub struct MigrationSummary {
    pub skipped: bool,
    pub reason: Option<String>,
    pub migrated_skills: usize,
    pub relinked_targets: usize,
    pub copy_fallbacks: usize,
    pub errors: Vec<String>,
    pub done_marker: PathBuf,
}

#[derive(Debug, Clone)]
struct SkillCandidate {
    platform_id: String,
    installed_path: PathBuf,
    latest_mtime: SystemTime,
}

pub fn run_one_time_skill_migration(
    _project_root: &Path,
    platforms: &HashMap<String, PlatformConfig>,
) -> io::Result<MigrationSummary> {
    let done_marker = done_marker_path();
    if done_marker.exists() {
        return Ok(MigrationSummary::skipped(
            done_marker,
            "done marker already exists",
        ));
    }

    fs::create_dir_all(canonical_meta_root())?;
    let lock_path = lock_path();
    let _lock = match acquire_lock(&lock_path)? {
        Some(guard) => guard,
        None => {
            return Ok(MigrationSummary::skipped(
                done_marker,
                "migration lock already exists",
            ));
        }
    };

    let mut summary = MigrationSummary::new(done_marker);
    let candidates = collect_skill_candidates(platforms)?;
    migrate_all_skills(&candidates, &mut summary)?;
    write_done_marker(&summary)?;
    Ok(summary)
}

impl MigrationSummary {
    fn new(done_marker: PathBuf) -> Self {
        Self {
            skipped: false,
            reason: None,
            migrated_skills: 0,
            relinked_targets: 0,
            copy_fallbacks: 0,
            errors: Vec::new(),
            done_marker,
        }
    }

    fn skipped(done_marker: PathBuf, reason: &str) -> Self {
        Self {
            skipped: true,
            reason: Some(reason.to_string()),
            migrated_skills: 0,
            relinked_targets: 0,
            copy_fallbacks: 0,
            errors: Vec::new(),
            done_marker,
        }
    }
}

fn migrate_all_skills(
    candidates: &BTreeMap<String, Vec<SkillCandidate>>,
    summary: &mut MigrationSummary,
) -> io::Result<()> {
    for (skill_name, installs) in candidates {
        if installs.is_empty() {
            continue;
        }
        if let Err(err) = migrate_single_skill(skill_name, installs, summary) {
            summary.errors.push(format!("{skill_name}: {err}"));
        }
    }
    Ok(())
}

fn migrate_single_skill(
    skill_name: &str,
    installs: &[SkillCandidate],
    summary: &mut MigrationSummary,
) -> io::Result<()> {
    let primary = pick_primary_install(installs)?;
    let canonical_path = canonical_skill_path(skill_name);
    copy_dir_replace(&primary.installed_path, &canonical_path)?;
    summary.migrated_skills += 1;

    for install in installs {
        match link_or_copy_dir(&canonical_path, &install.installed_path)? {
            SkillInstallMode::Symlink => {}
            SkillInstallMode::CopyFallback => summary.copy_fallbacks += 1,
        }
        summary.relinked_targets += 1;
    }

    Ok(())
}

fn pick_primary_install(installs: &[SkillCandidate]) -> io::Result<SkillCandidate> {
    let mut ordered = installs.to_vec();
    ordered.sort_by(|left, right| {
        right
            .latest_mtime
            .cmp(&left.latest_mtime)
            .then_with(|| left.platform_id.cmp(&right.platform_id))
    });
    ordered
        .into_iter()
        .next()
        .ok_or_else(|| io::Error::other("skill install list is empty"))
}

fn collect_skill_candidates(
    platforms: &HashMap<String, PlatformConfig>,
) -> io::Result<BTreeMap<String, Vec<SkillCandidate>>> {
    let mut map: BTreeMap<String, Vec<SkillCandidate>> = BTreeMap::new();
    let mut platform_ids: Vec<&String> = platforms.keys().collect();
    platform_ids.sort();

    for platform_id in platform_ids {
        let platform = match platforms.get(platform_id) {
            Some(p) => p,
            None => continue,
        };
        collect_platform_skills(platform_id, platform, &mut map)?;
    }

    Ok(map)
}

fn collect_platform_skills(
    platform_id: &str,
    platform: &PlatformConfig,
    map: &mut BTreeMap<String, Vec<SkillCandidate>>,
) -> io::Result<()> {
    let root = platform.skills_path();
    if !root.exists() {
        return Ok(());
    }

    for entry in fs::read_dir(root)? {
        let entry = match entry {
            Ok(value) => value,
            Err(_) => continue,
        };
        let path = entry.path();
        if !is_skill_install_path(&path) {
            continue;
        }

        let name = entry.file_name().to_string_lossy().to_string();
        let candidate = SkillCandidate {
            platform_id: platform_id.to_string(),
            installed_path: path.clone(),
            latest_mtime: latest_recursive_mtime(&path),
        };
        map.entry(name).or_default().push(candidate);
    }

    Ok(())
}

fn is_skill_install_path(path: &Path) -> bool {
    path.join(SKILL_FILE).is_file()
}

fn latest_recursive_mtime(path: &Path) -> SystemTime {
    let mut latest = fs::metadata(path)
        .and_then(|meta| meta.modified())
        .unwrap_or(UNIX_EPOCH);
    if !path.is_dir() {
        return latest;
    }

    let entries = match fs::read_dir(path) {
        Ok(items) => items,
        Err(_) => return latest,
    };
    for entry in entries.flatten() {
        let nested = latest_recursive_mtime(&entry.path());
        if nested > latest {
            latest = nested;
        }
    }
    latest
}

fn done_marker_path() -> PathBuf {
    canonical_meta_root().join(format!("{MIGRATION_ID}.done"))
}

fn lock_path() -> PathBuf {
    canonical_meta_root().join(format!("{MIGRATION_ID}.lock"))
}

fn write_done_marker(summary: &MigrationSummary) -> io::Result<()> {
    let mut report = String::new();
    report.push_str(&format!("migration={MIGRATION_ID}\n"));
    report.push_str(&format!("timestamp={}\n", current_epoch_secs()));
    report.push_str(&format!("migrated_skills={}\n", summary.migrated_skills));
    report.push_str(&format!("relinked_targets={}\n", summary.relinked_targets));
    report.push_str(&format!("copy_fallbacks={}\n", summary.copy_fallbacks));
    report.push_str(&format!("errors={}\n", summary.errors.len()));
    for error in &summary.errors {
        report.push_str(&format!("error={error}\n"));
    }
    fs::write(&summary.done_marker, report)
}

fn current_epoch_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

struct LockGuard {
    path: PathBuf,
}

impl Drop for LockGuard {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
    }
}

fn acquire_lock(path: &Path) -> io::Result<Option<LockGuard>> {
    let mut file = match OpenOptions::new().create_new(true).write(true).open(path) {
        Ok(handle) => handle,
        Err(e) if e.kind() == io::ErrorKind::AlreadyExists => return Ok(None),
        Err(e) => return Err(e),
    };
    let _ = writeln!(file, "pid={}", std::process::id());
    Ok(Some(LockGuard {
        path: path.to_path_buf(),
    }))
}

#[cfg(test)]
#[path = "skill_migration_tests.rs"]
mod skill_migration_tests;
