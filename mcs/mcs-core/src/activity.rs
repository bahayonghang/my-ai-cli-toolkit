use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use crate::config::paths::home_dir;
use crate::error::{AppError, Result};
use crate::model::{ItemType, LinkMode};

const ACTIVITY_DIR: &str = "activity";
const RUN_FILE_PREFIX: &str = "runs-";
const RUN_FILE_SUFFIX: &str = ".jsonl";
const DEFAULT_PAGE_SIZE: usize = 20;
const MAX_PAGE_SIZE: usize = 100;
const OUTPUT_MAX_BYTES: usize = 8 * 1024;
const RETENTION_DAYS: u64 = 90;

static RUN_COUNTER: AtomicU64 = AtomicU64::new(1);
static APPEND_MUTEX: OnceLock<Mutex<()>> = OnceLock::new();

#[cfg(test)]
static TEST_ACTIVITY_ROOT: Mutex<Option<PathBuf>> = Mutex::new(None);
#[cfg(test)]
static TEST_ACTIVITY_MUTEX: Mutex<()> = Mutex::new(());

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActivitySurface {
    Local,
    NpxSkills,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActivityOperation {
    Install,
    Uninstall,
    Remove,
    Check,
    Update,
    UpdatePackages,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActivityStatus {
    Success,
    Warning,
    Error,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActivityTargetScope {
    Global,
    Project,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActivityInstallTarget {
    pub scope: ActivityTargetScope,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub struct ActivityRunConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub link_mode: Option<LinkMode>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub agents: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cli_mode: Option<String>,
}

impl ActivityRunConfig {
    pub fn is_empty(&self) -> bool {
        self.link_mode.is_none() && self.agents.is_empty() && self.cli_mode.is_none()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActivityItem {
    pub label: String,
    pub item_type: ItemType,
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<String>,
    pub duration_ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub package_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub skill_flags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActivityRun {
    pub run_id: String,
    pub surface: ActivitySurface,
    pub operation: ActivityOperation,
    pub status: ActivityStatus,
    pub platform_id: String,
    pub platform_name: String,
    pub install_target: ActivityInstallTarget,
    pub started_at_ms: u64,
    pub completed_at_ms: u64,
    pub duration_ms: u64,
    pub item_count: usize,
    pub success_count: usize,
    pub failure_count: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_config: Option<ActivityRunConfig>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub items: Vec<ActivityItem>,
}

#[derive(Debug, Clone, Default)]
pub struct ActivityRunQuery {
    pub run_id: Option<String>,
    pub platform_id: Option<String>,
    pub surface: Option<ActivitySurface>,
    pub operation: Option<ActivityOperation>,
    pub item_type: Option<ItemType>,
    pub status: Option<ActivityStatus>,
    pub target_scope: Option<ActivityTargetScope>,
    pub search: Option<String>,
    pub page: Option<usize>,
    pub page_size: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub struct ActivityRunsSummary {
    pub total_runs: usize,
    pub success_runs: usize,
    pub warning_runs: usize,
    pub error_runs: usize,
    pub local_runs: usize,
    pub npx_runs: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActivityRunQueryResult {
    pub summary: ActivityRunsSummary,
    pub filtered_total: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
    pub runs: Vec<ActivityRun>,
}

pub fn generate_run_id(prefix: &str) -> String {
    let counter = RUN_COUNTER.fetch_add(1, Ordering::Relaxed);
    let now_ms = unix_time_ms();
    let pid = std::process::id();
    format!("{prefix}-{now_ms}-{pid}-{counter}")
}

pub fn append_run(run: &ActivityRun) -> Result<()> {
    let _guard = append_mutex()
        .lock()
        .map_err(|_| AppError::Validation("Failed to lock activity writer".into()))?;
    prune_old_activity_files()?;

    let root = activity_root();
    fs::create_dir_all(&root)?;

    let mut sanitized = run.clone();
    sanitize_run(&mut sanitized);

    let file_path = run_file_path_for_ms(sanitized.started_at_ms);
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(file_path)?;

    let payload = serde_json::to_string(&sanitized).map_err(|error| {
        AppError::Validation(format!("Failed to serialize activity run: {error}"))
    })?;
    file.write_all(payload.as_bytes())?;
    file.write_all(b"\n")?;
    Ok(())
}

pub fn query_runs(query: &ActivityRunQuery) -> Result<ActivityRunQueryResult> {
    prune_old_activity_files()?;

    let mut runs = read_all_runs()?;
    runs.sort_by(|left, right| {
        right
            .started_at_ms
            .cmp(&left.started_at_ms)
            .then_with(|| right.completed_at_ms.cmp(&left.completed_at_ms))
            .then_with(|| right.run_id.cmp(&left.run_id))
    });

    let filtered: Vec<ActivityRun> = runs
        .into_iter()
        .filter(|run| matches_run_query(run, query))
        .collect();

    let summary = summarize_runs(&filtered);
    let filtered_total = filtered.len();
    let page_size = sanitize_page_size(query.page_size);
    let total_pages = usize::max(1, filtered_total.div_ceil(page_size));
    let page = sanitize_page(query.page, total_pages);
    let start = (page - 1) * page_size;
    let end = usize::min(start + page_size, filtered_total);
    let runs = if start >= filtered_total {
        Vec::new()
    } else {
        filtered[start..end].to_vec()
    };

    Ok(ActivityRunQueryResult {
        summary,
        filtered_total,
        page,
        page_size,
        total_pages,
        runs,
    })
}

pub fn activity_root() -> PathBuf {
    #[cfg(test)]
    {
        if let Some(path) = TEST_ACTIVITY_ROOT
            .lock()
            .ok()
            .and_then(|guard| guard.clone())
        {
            return path;
        }
    }

    home_dir().join(".mcs").join(ACTIVITY_DIR)
}

fn append_mutex() -> &'static Mutex<()> {
    APPEND_MUTEX.get_or_init(|| Mutex::new(()))
}

fn read_all_runs() -> Result<Vec<ActivityRun>> {
    let root = activity_root();
    if !root.exists() {
        return Ok(Vec::new());
    }

    let mut runs = Vec::new();
    for file_path in activity_files(&root)? {
        let file = fs::File::open(&file_path)?;
        let reader = BufReader::new(file);
        for line in reader.lines() {
            let line = line?;
            if line.trim().is_empty() {
                continue;
            }
            match serde_json::from_str::<ActivityRun>(&line) {
                Ok(run) => runs.push(run),
                Err(error) => {
                    tracing::warn!(
                        path = %file_path.display(),
                        error = %error,
                        "Skipping unreadable activity record"
                    );
                }
            }
        }
    }
    Ok(runs)
}

fn activity_files(root: &Path) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let path = entry.path();
        let Some(file_name) = path.file_name().and_then(|value| value.to_str()) else {
            continue;
        };
        if !file_name.starts_with(RUN_FILE_PREFIX) || !file_name.ends_with(RUN_FILE_SUFFIX) {
            continue;
        }
        files.push(path);
    }
    files.sort();
    Ok(files)
}

fn prune_old_activity_files() -> Result<()> {
    let root = activity_root();
    if !root.exists() {
        return Ok(());
    }

    let retention = Duration::from_secs(RETENTION_DAYS * 24 * 60 * 60);
    let cutoff = SystemTime::now()
        .checked_sub(retention)
        .unwrap_or(UNIX_EPOCH);

    for file_path in activity_files(&root)? {
        let Ok(metadata) = fs::metadata(&file_path) else {
            continue;
        };
        let Ok(modified) = metadata.modified() else {
            continue;
        };
        if modified < cutoff {
            let _ = fs::remove_file(&file_path);
        }
    }

    Ok(())
}

fn matches_run_query(run: &ActivityRun, query: &ActivityRunQuery) -> bool {
    if let Some(ref run_id) = query.run_id
        && run.run_id != *run_id
    {
        return false;
    }
    if let Some(ref platform_id) = query.platform_id
        && run.platform_id != *platform_id
    {
        return false;
    }
    if let Some(surface) = query.surface
        && run.surface != surface
    {
        return false;
    }
    if let Some(operation) = query.operation
        && run.operation != operation
    {
        return false;
    }
    if let Some(status) = query.status
        && run.status != status
    {
        return false;
    }
    if let Some(target_scope) = query.target_scope
        && run.install_target.scope != target_scope
    {
        return false;
    }
    if let Some(item_type) = query.item_type
        && !run.items.iter().any(|item| item.item_type == item_type)
    {
        return false;
    }
    if let Some(ref search) = query.search {
        let lowered = search.trim().to_lowercase();
        if !lowered.is_empty() && !run_matches_search(run, &lowered) {
            return false;
        }
    }
    true
}

fn run_matches_search(run: &ActivityRun, search: &str) -> bool {
    if run.run_id.to_lowercase().contains(search)
        || run.platform_id.to_lowercase().contains(search)
        || run.platform_name.to_lowercase().contains(search)
        || run
            .install_target
            .project_path
            .as_ref()
            .is_some_and(|value| value.to_lowercase().contains(search))
    {
        return true;
    }

    run.items.iter().any(|item| {
        item.label.to_lowercase().contains(search)
            || item.message.to_lowercase().contains(search)
            || item
                .error
                .as_ref()
                .is_some_and(|value| value.to_lowercase().contains(search))
            || item
                .output
                .as_ref()
                .is_some_and(|value| value.to_lowercase().contains(search))
            || item
                .package_ref
                .as_ref()
                .is_some_and(|value| value.to_lowercase().contains(search))
            || item
                .skill_flags
                .iter()
                .any(|flag| flag.to_lowercase().contains(search))
    })
}

fn summarize_runs(runs: &[ActivityRun]) -> ActivityRunsSummary {
    let mut summary = ActivityRunsSummary::default();
    for run in runs {
        summary.total_runs += 1;
        match run.status {
            ActivityStatus::Success => summary.success_runs += 1,
            ActivityStatus::Warning => summary.warning_runs += 1,
            ActivityStatus::Error => summary.error_runs += 1,
        }
        match run.surface {
            ActivitySurface::Local => summary.local_runs += 1,
            ActivitySurface::NpxSkills => summary.npx_runs += 1,
        }
    }
    summary
}

fn sanitize_page_size(page_size: Option<usize>) -> usize {
    page_size
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .clamp(1, MAX_PAGE_SIZE)
}

fn sanitize_page(page: Option<usize>, total_pages: usize) -> usize {
    page.unwrap_or(1).clamp(1, total_pages)
}

fn sanitize_run(run: &mut ActivityRun) {
    if let Some(config) = run.run_config.as_ref()
        && config.is_empty()
    {
        run.run_config = None;
    }

    for item in &mut run.items {
        item.error = item
            .error
            .take()
            .map(|value| truncate_utf8(&value, OUTPUT_MAX_BYTES));
        item.output = item
            .output
            .take()
            .map(|value| truncate_utf8(&value, OUTPUT_MAX_BYTES));
    }
}

fn truncate_utf8(input: &str, max_bytes: usize) -> String {
    if input.len() <= max_bytes {
        return input.to_string();
    }

    let mut end = max_bytes;
    while end > 0 && !input.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}...[truncated]", &input[..end])
}

fn run_file_path_for_ms(timestamp_ms: u64) -> PathBuf {
    let date = utc_date_string_from_ms(timestamp_ms);
    activity_root().join(format!("{RUN_FILE_PREFIX}{date}{RUN_FILE_SUFFIX}"))
}

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or_default()
}

fn utc_date_string_from_ms(timestamp_ms: u64) -> String {
    let days = (timestamp_ms / 1_000 / 86_400) as i64;
    let (year, month, day) = civil_from_days(days);
    format!("{year:04}-{month:02}-{day:02}")
}

fn civil_from_days(days_since_epoch: i64) -> (i32, u32, u32) {
    let z = days_since_epoch + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    let year = y + if month <= 2 { 1 } else { 0 };
    (year as i32, month as u32, day as u32)
}

#[cfg(test)]
pub(crate) fn set_test_activity_root(path: Option<PathBuf>) {
    if let Ok(mut guard) = TEST_ACTIVITY_ROOT.lock() {
        *guard = path;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_root(prefix: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "mcs_activity_{prefix}_{}_{}",
            std::process::id(),
            unix_time_ms()
        ));
        fs::create_dir_all(&path).expect("create temp activity root");
        path
    }

    fn sample_run(
        run_id: &str,
        started_at_ms: u64,
        status: ActivityStatus,
        surface: ActivitySurface,
    ) -> ActivityRun {
        ActivityRun {
            run_id: run_id.into(),
            surface,
            operation: ActivityOperation::Install,
            status,
            platform_id: "claude".into(),
            platform_name: "Claude".into(),
            install_target: ActivityInstallTarget {
                scope: ActivityTargetScope::Global,
                project_path: None,
            },
            started_at_ms,
            completed_at_ms: started_at_ms + 10,
            duration_ms: 10,
            item_count: 1,
            success_count: usize::from(matches!(status, ActivityStatus::Success)),
            failure_count: usize::from(!matches!(status, ActivityStatus::Success)),
            run_config: Some(ActivityRunConfig {
                cli_mode: Some("npx".into()),
                ..ActivityRunConfig::default()
            }),
            items: vec![ActivityItem {
                label: "frontend-design".into(),
                item_type: ItemType::Skill,
                success: !matches!(status, ActivityStatus::Error),
                message: "Installed frontend-design".into(),
                error: if matches!(status, ActivityStatus::Error) {
                    Some("failed".into())
                } else {
                    None
                },
                output: Some("ok".into()),
                duration_ms: 10,
                source_path: None,
                target_path: None,
                package_ref: Some("vercel-labs/skills".into()),
                skill_flags: vec!["frontend-design".into()],
            }],
        }
    }

    #[test]
    fn append_and_query_runs_support_filters_and_paging() {
        let _guard = TEST_ACTIVITY_MUTEX.lock().expect("lock activity tests");
        let root = temp_root("query");
        set_test_activity_root(Some(root.clone()));

        append_run(&sample_run(
            "run-1",
            1_720_000_000_000,
            ActivityStatus::Success,
            ActivitySurface::Local,
        ))
        .expect("append first");
        append_run(&sample_run(
            "run-2",
            1_720_000_100_000,
            ActivityStatus::Error,
            ActivitySurface::NpxSkills,
        ))
        .expect("append second");

        let page = query_runs(&ActivityRunQuery {
            status: Some(ActivityStatus::Error),
            page_size: Some(10),
            ..ActivityRunQuery::default()
        })
        .expect("query error runs");
        assert_eq!(page.filtered_total, 1);
        assert_eq!(page.summary.error_runs, 1);
        assert_eq!(page.runs[0].run_id, "run-2");

        let paged = query_runs(&ActivityRunQuery {
            page: Some(2),
            page_size: Some(1),
            ..ActivityRunQuery::default()
        })
        .expect("paged query");
        assert_eq!(paged.total_pages, 2);
        assert_eq!(paged.page, 2);
        assert_eq!(paged.runs[0].run_id, "run-1");

        set_test_activity_root(None);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn append_run_truncates_large_outputs() {
        let _guard = TEST_ACTIVITY_MUTEX.lock().expect("lock activity tests");
        let root = temp_root("truncate");
        set_test_activity_root(Some(root.clone()));

        let mut run = sample_run(
            "run-truncate",
            1_720_000_200_000,
            ActivityStatus::Warning,
            ActivitySurface::NpxSkills,
        );
        run.items[0].output = Some("x".repeat(OUTPUT_MAX_BYTES + 128));
        append_run(&run).expect("append truncated run");

        let stored = query_runs(&ActivityRunQuery::default()).expect("query stored run");
        assert!(
            stored.runs[0].items[0]
                .output
                .as_ref()
                .is_some_and(|value| value.ends_with("...[truncated]"))
        );

        set_test_activity_root(None);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn utc_date_string_uses_stable_day_rotation() {
        let _guard = TEST_ACTIVITY_MUTEX.lock().expect("lock activity tests");
        assert_eq!(utc_date_string_from_ms(0), "1970-01-01");
        assert_eq!(utc_date_string_from_ms(86_400_000), "1970-01-02");
    }
}
