use axum::Json;
use axum::extract::{Path, Query, State};
use axum::response::sse::{Event, KeepAlive, Sse};
use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;
use std::convert::Infallible;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::{RwLock, Semaphore, broadcast};
use tokio_stream::{StreamExt as TokioStreamExt, wrappers::BroadcastStream};

use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};
use mcs_core::core::installer::{install_skill, uninstall_skill};

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, BatchResultDto, DiffDto, EditContentRequest, ExternalInstallBatchItem,
    ExternalInstallJobRequest, ExternalInstallJobStartResult, ExternalInstallMethod,
    ExternalInstallRequest, ExternalInstallResult, InstallRequest, InstallTargetScopeDto,
    ItemDetailDto, ItemDto, ItemQuery, SimpleSuccess,
};
use crate::state::AppState;

const EXTERNAL_INSTALL_TIMEOUT_SECS: u64 = 120;
const EXTERNAL_INSTALL_MAX_ITEMS: usize = 100;
const EXTERNAL_INSTALL_MAX_CONCURRENCY: usize = 3;
const EXTERNAL_INSTALL_OUTPUT_MAX_BYTES: usize = 8 * 1024;
const EXTERNAL_INSTALL_JOB_RETENTION_SECS: u64 = 30 * 60;
const EXTERNAL_INSTALL_JOB_HISTORY_MAX_EVENTS: usize = 2_048;

type ExternalInstallJobMap = HashMap<String, Arc<RwLock<ExternalInstallJob>>>;

static EXTERNAL_INSTALL_JOBS: OnceLock<Arc<RwLock<ExternalInstallJobMap>>> = OnceLock::new();
static EXTERNAL_INSTALL_JOB_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Clone)]
struct ExternalInstallSseEnvelope {
    event: String,
    data: String,
}

struct ExternalInstallJob {
    platform_id: String,
    total: usize,
    success_count: usize,
    failure_count: usize,
    completed: bool,
    history: Vec<ExternalInstallSseEnvelope>,
    sender: broadcast::Sender<ExternalInstallSseEnvelope>,
}

impl ExternalInstallJob {
    fn push_event(&mut self, event: ExternalInstallSseEnvelope) {
        if self.history.len() >= EXTERNAL_INSTALL_JOB_HISTORY_MAX_EVENTS {
            self.history.remove(0);
        }
        self.history.push(event.clone());
        let _ = self.sender.send(event);
    }
}

#[derive(Serialize)]
struct JobStartedPayload {
    job_id: String,
    total: usize,
    max_concurrency: usize,
    started_at_ms: u128,
}

#[derive(Serialize)]
struct ItemStartedPayload {
    job_id: String,
    item_id: String,
    skill_name: String,
    method: String,
}

#[derive(Serialize)]
struct ItemFinishedPayload {
    job_id: String,
    item_id: String,
    skill_name: String,
    method: String,
    success: bool,
    output: String,
    error: Option<String>,
    duration_ms: u128,
}

#[derive(Serialize)]
struct JobProgressPayload {
    job_id: String,
    completed: usize,
    total: usize,
    success_count: usize,
    failure_count: usize,
    percent: f64,
}

#[derive(Serialize)]
struct JobCompletedPayload {
    job_id: String,
    total: usize,
    success_count: usize,
    failure_count: usize,
    completed_at_ms: u128,
}

#[derive(Serialize)]
struct JobFailedPayload {
    job_id: String,
    message: String,
}

/// GET /api/platforms/:id/skills — list skills with optional filters
pub async fn list(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ItemQuery>,
) -> Result<Json<ApiResponse<Vec<ItemDto>>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = query.install_target.to_install_target();

    let skills = if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        state.skills(&id).await
    } else {
        let resolved = resolve_target_platform(
            &base_platform,
            &install_target.to_core(),
            InstallTargetAccessMode::Read,
        )
        .map_err(AppError::BadRequest)?;
        state.skills_for_platform_config(&resolved.platform).await
    };
    let filtered = filter_items(skills, &query);

    Ok(Json(ApiResponse::ok(filtered)))
}

/// GET /api/platforms/:id/skills/:name — skill detail + SKILL.md content
pub async fn detail(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<ItemDetailDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    let skill_md_path = item.source_path.join("SKILL.md");
    let content = read_file_text(skill_md_path, "Failed to read SKILL.md").await?;

    Ok(Json(ApiResponse::ok(ItemDetailDto {
        name: item.name,
        item_type: item.item_type,
        description: item.description,
        status: item.status,
        category: item.category,
        tags: item.tags,
        is_default: item.is_default,
        content: Some(content),
    })))
}

/// GET /api/platforms/:id/skills/:name/diff — source vs installed diff
pub async fn diff(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<DiffDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    if !item.is_installed() {
        return Ok(Json(ApiResponse::ok(DiffDto {
            has_diff: false,
            diff_text: "Not installed".into(),
        })));
    }

    let diff_text =
        build_skill_diff_async(item.source_path.clone(), item.target_path.clone()).await?;
    let has_diff = !diff_text.is_empty();

    Ok(Json(ApiResponse::ok(DiffDto {
        has_diff,
        diff_text,
    })))
}

/// POST /api/platforms/:id/skills/install — install skills by names
pub async fn install(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<InstallRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    let root = state.project_root().await;
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = body.install_target.clone();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Write,
    )
    .map_err(AppError::BadRequest)?;
    let platform = resolved.platform;
    let should_invalidate_global = matches!(install_target.scope, InstallTargetScopeDto::Global);

    // 并行安装：每个 skill 使用独立的 spawn_blocking 任务
    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let root = root.clone();
        let platform = platform.clone();
        let link_mode = body.link_mode;
        set.spawn_blocking(move || install_skill(&root, &platform, &name, link_mode));
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Install task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache (including platforms sharing the same skills path)
    if should_invalidate_global {
        invalidate_platform_and_shared_skills(&state, &id).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

/// POST /api/platforms/:id/skills/uninstall — uninstall skills by names
pub async fn uninstall(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<InstallRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = body.install_target.clone();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Write,
    )
    .map_err(AppError::BadRequest)?;
    let platform = resolved.platform;
    let should_invalidate_global = matches!(install_target.scope, InstallTargetScopeDto::Global);

    // 并行卸载
    let mut set = tokio::task::JoinSet::new();
    for name in body.names.clone() {
        let platform = platform.clone();
        set.spawn_blocking(move || uninstall_skill(&platform, &name));
    }
    let mut results = Vec::with_capacity(body.names.len());
    while let Some(res) = set.join_next().await {
        results.push(res.map_err(|e| AppError::Internal(format!("Uninstall task failed: {e}")))?);
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache (including platforms sharing the same skills path)
    if should_invalidate_global {
        invalidate_platform_and_shared_skills(&state, &id).await;
    }

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

// ── Helper functions ───────────────────────────────────────────────

fn filter_items(items: Vec<mcs_core::model::ItemInfo>, query: &ItemQuery) -> Vec<ItemDto> {
    items
        .into_iter()
        .filter(|item| {
            if let Some(ref search) = query.search {
                let s = search.to_lowercase();
                let name_match = item.name.to_lowercase().contains(&s);
                let desc_match = item
                    .description
                    .as_ref()
                    .is_some_and(|d| d.to_lowercase().contains(&s));
                if !name_match && !desc_match {
                    return false;
                }
            }
            if let Some(ref cat) = query.category
                && item.category.as_deref() != Some(cat.as_str())
            {
                return false;
            }
            if let Some(status) = query.status
                && item.status != status
            {
                return false;
            }
            true
        })
        .map(|item| ItemDto {
            name: item.name,
            item_type: item.item_type,
            description: item.description,
            status: item.status,
            category: item.category,
            tags: item.tags,
            is_default: item.is_default,
            source_path: item.source_path.to_string_lossy().into_owned(),
            target_path: item.target_path.to_string_lossy().into_owned(),
            source_mtime_ms: item.source_mtime_ms,
            target_mtime_ms: item.target_mtime_ms,
        })
        .collect()
}

fn build_skill_diff_text(
    source_dir: &std::path::Path,
    target_dir: &std::path::Path,
) -> Result<String, std::io::Error> {
    use similar::TextDiff;

    let src_skill_md = std::fs::read_to_string(source_dir.join("SKILL.md"))?;
    let tgt_skill_md = std::fs::read_to_string(target_dir.join("SKILL.md"))?;
    let diff = TextDiff::from_lines(&tgt_skill_md, &src_skill_md)
        .unified_diff()
        .header("installed/SKILL.md", "source/SKILL.md")
        .to_string();
    Ok(diff)
}

async fn build_skill_diff_async(
    source_dir: PathBuf,
    target_dir: PathBuf,
) -> Result<String, AppError> {
    tokio::task::spawn_blocking(move || build_skill_diff_text(&source_dir, &target_dir))
        .await
        .map_err(|e| AppError::Internal(format!("Failed to execute diff task: {e}")))?
        .map_err(|e| AppError::Internal(format!("Failed to build skill diff: {e}")))
}

async fn read_file_text(path: PathBuf, label: &'static str) -> Result<String, AppError> {
    let display = path.display().to_string();
    tokio::task::spawn_blocking(move || std::fs::read_to_string(&path))
        .await
        .map_err(|e| AppError::Internal(format!("{label} ({display}): {e}")))?
        .map_err(|e| AppError::Internal(format!("{label} ({display}): {e}")))
}

async fn write_file_text(path: PathBuf, content: String) -> Result<(), AppError> {
    let display = path.display().to_string();
    tokio::task::spawn_blocking(move || std::fs::write(&path, content))
        .await
        .map_err(|e| AppError::Internal(format!("Failed to execute write task: {e}")))?
        .map_err(|e| AppError::Internal(format!("Failed to write file {display}: {e}")))
}

async fn invalidate_platform_and_shared_skills(state: &AppState, platform_id: &str) {
    let related = state.related_platform_ids_by_skills_path(platform_id).await;
    if related.is_empty() {
        state.invalidate_platform(platform_id).await;
        return;
    }
    state.invalidate_platforms(&related).await;
}

/// PUT /api/platforms/:id/skills/:name/content — overwrite SKILL.md content
pub async fn edit_content(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
    Json(body): Json<EditContentRequest>,
) -> Result<Json<ApiResponse<SimpleSuccess>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    let skill_md_path = item.source_path.join("SKILL.md");
    write_file_text(skill_md_path, body.content).await?;

    // Invalidate cache so next request reflects updated content
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(SimpleSuccess { success: true })))
}

/// POST /api/platforms/:id/skills/external-install — install via npx CLI
pub async fn external_install(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<ExternalInstallRequest>,
) -> Result<Json<ApiResponse<ExternalInstallResult>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    ensure_external_install_allowed(body.install_target.scope)?;
    let result = execute_external_install(body.method, &body.skill_name).await?;

    if result.success {
        invalidate_platform_and_shared_skills(&state, &id).await;
    }

    Ok(Json(ApiResponse::ok(result)))
}

/// POST /api/platforms/:id/skills/external-install/jobs — start batch external install job
pub async fn external_install_jobs_start(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<ExternalInstallJobRequest>,
) -> Result<Json<ApiResponse<ExternalInstallJobStartResult>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    ensure_external_install_allowed(body.install_target.scope)?;
    if body.items.is_empty() {
        return Err(AppError::BadRequest(
            "At least one item is required for batch external install".into(),
        ));
    }
    if body.items.len() > EXTERNAL_INSTALL_MAX_ITEMS {
        return Err(AppError::BadRequest(format!(
            "Too many items ({}) for batch external install; max allowed is {EXTERNAL_INSTALL_MAX_ITEMS}",
            body.items.len()
        )));
    }

    let items = normalize_batch_items(body.items)?;
    let total = items.len();
    let job_id = generate_external_install_job_id();
    let (sender, _) = broadcast::channel(512);
    let job = Arc::new(RwLock::new(ExternalInstallJob {
        platform_id: id.clone(),
        total: items.len(),
        success_count: 0,
        failure_count: 0,
        completed: false,
        history: Vec::new(),
        sender,
    }));

    {
        let jobs = external_install_jobs();
        jobs.write().await.insert(job_id.clone(), job);
    }

    let state_for_job = state.clone();
    let platform_id_for_job = id.clone();
    let job_id_for_job = job_id.clone();
    tokio::spawn(async move {
        run_external_install_job(state_for_job, platform_id_for_job, job_id_for_job, items).await;
    });

    Ok(Json(ApiResponse::ok(ExternalInstallJobStartResult {
        job_id,
        total,
        status: "running".to_string(),
    })))
}

/// GET /api/platforms/:id/skills/external-install/jobs/:job_id/stream — stream batch progress via SSE
pub async fn external_install_jobs_stream(
    State(state): State<AppState>,
    Path((id, job_id)): Path<(String, String)>,
) -> Result<Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let job = {
        let jobs = external_install_jobs();
        jobs.read().await.get(&job_id).cloned().ok_or_else(|| {
            AppError::NotFound(format!("External install job '{job_id}' not found"))
        })?
    };

    let (history, receiver) = {
        let job_guard = job.read().await;
        if job_guard.platform_id != id {
            return Err(AppError::NotFound(format!(
                "External install job '{job_id}' not found for platform '{id}'"
            )));
        }
        (job_guard.history.clone(), job_guard.sender.subscribe())
    };

    let history_stream = tokio_stream::iter(history.into_iter().map(envelope_to_sse_result));
    let live_stream = BroadcastStream::new(receiver).filter_map(|message| match message {
        Ok(envelope) => Some(envelope_to_sse_result(envelope)),
        Err(_) => None,
    });

    let combined = history_stream.chain(live_stream);
    Ok(Sse::new(combined).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    ))
}

async fn run_external_install_job(
    state: AppState,
    platform_id: String,
    job_id: String,
    items: Vec<ExternalInstallBatchItem>,
) {
    let Some(job) = get_external_install_job(&job_id).await else {
        return;
    };

    let _ = emit_job_event(
        &job,
        "job_started",
        &JobStartedPayload {
            job_id: job_id.clone(),
            total: items.len(),
            max_concurrency: EXTERNAL_INSTALL_MAX_CONCURRENCY,
            started_at_ms: unix_time_ms(),
        },
    )
    .await;

    let semaphore = Arc::new(Semaphore::new(EXTERNAL_INSTALL_MAX_CONCURRENCY));
    let mut set = tokio::task::JoinSet::new();

    for (index, item) in items.into_iter().enumerate() {
        let job = job.clone();
        let job_id = job_id.clone();
        let semaphore = semaphore.clone();
        set.spawn(async move {
            run_external_install_job_item(job, job_id, index, item, semaphore).await;
        });
    }

    while let Some(joined) = set.join_next().await {
        if let Err(error) = joined {
            let _ = emit_job_event(
                &job,
                "job_failed",
                &JobFailedPayload {
                    job_id: job_id.clone(),
                    message: format!("A worker task failed: {error}"),
                },
            )
            .await;
        }
    }

    let (success_count, failure_count, total) = {
        let mut job_guard = job.write().await;
        job_guard.completed = true;
        let success_count = job_guard.success_count;
        let failure_count = job_guard.failure_count;
        let total = job_guard.total;
        job_guard.push_event(build_sse_envelope(
            "job_completed",
            &JobCompletedPayload {
                job_id: job_id.clone(),
                total,
                success_count,
                failure_count,
                completed_at_ms: unix_time_ms(),
            },
        ));
        (success_count, failure_count, total)
    };

    if success_count > 0 {
        invalidate_platform_and_shared_skills(&state, &platform_id).await;
    }

    tracing::info!(
        "External install job completed: job_id={job_id} platform={platform_id} total={total} success={success_count} failure={failure_count}"
    );
    schedule_external_install_job_cleanup(job_id);
}

async fn run_external_install_job_item(
    job: Arc<RwLock<ExternalInstallJob>>,
    job_id: String,
    index: usize,
    item: ExternalInstallBatchItem,
    semaphore: Arc<Semaphore>,
) {
    let Ok(_permit) = semaphore.acquire_owned().await else {
        let _ = emit_job_event(
            &job,
            "job_failed",
            &JobFailedPayload {
                job_id,
                message: "Semaphore was closed unexpectedly".to_string(),
            },
        )
        .await;
        return;
    };

    let item_id = format!("{index}");
    let method = external_install_method_name(item.method).to_string();

    let _ = emit_job_event(
        &job,
        "item_started",
        &ItemStartedPayload {
            job_id: job_id.clone(),
            item_id: item_id.clone(),
            skill_name: item.skill_name.clone(),
            method: method.clone(),
        },
    )
    .await;

    let started = tokio::time::Instant::now();
    let result = execute_external_install(item.method, &item.skill_name).await;
    let duration_ms = started.elapsed().as_millis();

    let payload = match result {
        Ok(result) => {
            let success = result.success;
            let output = result.output;
            ItemFinishedPayload {
                job_id: job_id.clone(),
                item_id: item_id.clone(),
                skill_name: item.skill_name.clone(),
                method: method.clone(),
                success,
                output: truncate_utf8(output.clone(), EXTERNAL_INSTALL_OUTPUT_MAX_BYTES),
                error: if success {
                    None
                } else {
                    extract_failure_message(&output)
                },
                duration_ms,
            }
        }
        Err(error) => ItemFinishedPayload {
            job_id: job_id.clone(),
            item_id: item_id.clone(),
            skill_name: item.skill_name.clone(),
            method: method.clone(),
            success: false,
            output: String::new(),
            error: Some(app_error_message(&error)),
            duration_ms,
        },
    };

    let mut job_guard = job.write().await;
    job_guard.push_event(build_sse_envelope("item_finished", &payload));
    if payload.success {
        job_guard.success_count += 1;
    } else {
        job_guard.failure_count += 1;
    }

    let completed = job_guard.success_count + job_guard.failure_count;
    let progress = JobProgressPayload {
        job_id,
        completed,
        total: job_guard.total,
        success_count: job_guard.success_count,
        failure_count: job_guard.failure_count,
        percent: if job_guard.total == 0 {
            0.0
        } else {
            (completed as f64 / job_guard.total as f64) * 100.0
        },
    };
    job_guard.push_event(build_sse_envelope("job_progress", &progress));
}

fn external_install_jobs() -> &'static Arc<RwLock<ExternalInstallJobMap>> {
    EXTERNAL_INSTALL_JOBS.get_or_init(|| Arc::new(RwLock::new(HashMap::new())))
}

async fn get_external_install_job(job_id: &str) -> Option<Arc<RwLock<ExternalInstallJob>>> {
    let jobs = external_install_jobs();
    jobs.read().await.get(job_id).cloned()
}

fn generate_external_install_job_id() -> String {
    let seq = EXTERNAL_INSTALL_JOB_COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("external-{seq}-{}", unix_time_ms())
}

fn unix_time_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0)
}

fn build_sse_envelope<T: Serialize>(event: &str, payload: &T) -> ExternalInstallSseEnvelope {
    let data = serde_json::to_string(payload)
        .unwrap_or_else(|_| json!({ "message": "Failed to serialize SSE payload" }).to_string());
    ExternalInstallSseEnvelope {
        event: event.to_string(),
        data,
    }
}

fn envelope_to_sse_result(envelope: ExternalInstallSseEnvelope) -> Result<Event, Infallible> {
    Ok(Event::default().event(envelope.event).data(envelope.data))
}

async fn emit_job_event<T: Serialize>(
    job: &Arc<RwLock<ExternalInstallJob>>,
    event: &str,
    payload: &T,
) -> Result<(), AppError> {
    let mut job_guard = job.write().await;
    job_guard.push_event(build_sse_envelope(event, payload));
    Ok(())
}

fn schedule_external_install_job_cleanup(job_id: String) {
    let jobs = external_install_jobs().clone();
    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_secs(EXTERNAL_INSTALL_JOB_RETENTION_SECS)).await;
        jobs.write().await.remove(&job_id);
    });
}

fn normalize_batch_items(
    items: Vec<ExternalInstallBatchItem>,
) -> Result<Vec<ExternalInstallBatchItem>, AppError> {
    let mut normalized = Vec::with_capacity(items.len());
    for item in items {
        let skill_name = item.skill_name.trim();
        if skill_name.is_empty() {
            continue;
        }
        normalized.push(ExternalInstallBatchItem {
            skill_name: skill_name.to_string(),
            method: item.method,
        });
    }
    if normalized.is_empty() {
        return Err(AppError::BadRequest(
            "No valid skill names found in batch request".into(),
        ));
    }
    Ok(normalized)
}

fn ensure_external_install_allowed(scope: InstallTargetScopeDto) -> Result<(), AppError> {
    if matches!(scope, InstallTargetScopeDto::Project) {
        return Err(AppError::BadRequest(
            "External install is disabled in project install mode".into(),
        ));
    }
    Ok(())
}

fn external_install_method_name(method: ExternalInstallMethod) -> &'static str {
    match method {
        ExternalInstallMethod::Vercel => "vercel",
        ExternalInstallMethod::Playbooks => "playbooks",
    }
}

fn build_external_install_args(method: ExternalInstallMethod, skill_name: &str) -> Vec<String> {
    match method {
        ExternalInstallMethod::Vercel => vec![
            "skills".to_string(),
            "add".to_string(),
            skill_name.to_string(),
        ],
        ExternalInstallMethod::Playbooks => vec![
            "playbooks".to_string(),
            "add".to_string(),
            "skill".to_string(),
            skill_name.to_string(),
        ],
    }
}

async fn execute_external_install(
    method: ExternalInstallMethod,
    skill_name: &str,
) -> Result<ExternalInstallResult, AppError> {
    let args = build_external_install_args(method, skill_name);
    let mut command = tokio::process::Command::new("npx");
    command.args(&args);
    command.kill_on_drop(true);

    let output = tokio::time::timeout(
        Duration::from_secs(EXTERNAL_INSTALL_TIMEOUT_SECS),
        command.output(),
    )
    .await
    .map_err(|_| {
        AppError::Internal(format!(
            "External install timed out after {EXTERNAL_INSTALL_TIMEOUT_SECS}s"
        ))
    })?
    .map_err(|e| AppError::Internal(format!("Failed to execute npx: {e}")))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let combined = if stderr.is_empty() {
        stdout
    } else if stdout.is_empty() {
        stderr
    } else {
        format!("{stdout}\n{stderr}")
    };

    Ok(ExternalInstallResult {
        success: output.status.success(),
        output: combined,
    })
}

fn truncate_utf8(input: String, max_bytes: usize) -> String {
    if input.len() <= max_bytes {
        return input;
    }
    let mut end = max_bytes;
    while end > 0 && !input.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}...[truncated]", &input[..end])
}

fn extract_failure_message(output: &str) -> Option<String> {
    output
        .lines()
        .rev()
        .find(|line| !line.trim().is_empty())
        .map(|line| line.trim().to_string())
}

fn app_error_message(error: &AppError) -> String {
    match error {
        AppError::NotFound(message) => message.clone(),
        AppError::BadRequest(message) => message.clone(),
        AppError::BadRequestWithDetails { message, .. } => message.clone(),
        AppError::Internal(message) => message.clone(),
    }
}
