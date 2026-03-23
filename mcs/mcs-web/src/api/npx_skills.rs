use axum::Json;
use axum::extract::{Path, Query, State};
use axum::response::sse::{Event, KeepAlive, Sse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::convert::Infallible;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::{RwLock, Semaphore, broadcast};
use tokio_stream::{StreamExt as TokioStreamExt, wrappers::BroadcastStream};

use mcs_core::core::external_skills::{
    EXTERNAL_SKILLS_KIND_SKILLS_CLI, ResolvedExternalSkillEntry,
};
use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, InstallTargetDto, InstallTargetQuery, InstallTargetScopeDto,
    NpxCatalogInstalledStateDto, NpxSkillsCatalogItemDto, NpxSkillsCliConfigDto,
    NpxSkillsInstallItemRequest, NpxSkillsInstallJobRequest, NpxSkillsInstalledInventoryDto,
    NpxSkillsJobStartDto, NpxSkillsMaintenanceJobRequest, NpxSkillsOperation,
    NpxSkillsRemoveJobRequest, ResolvedInstallTargetDto,
};
use crate::services::npx_skills_cli::{
    build_check_args, build_install_args, build_remove_args, build_update_args,
    execute_skills_command,
};
use crate::services::npx_skills_inventory::{
    apply_catalog_install_state, clear_check_cache, resolve_inventory, write_check_cache,
};
use crate::state::AppState;

const NPX_SKILLS_MAX_ITEMS: usize = 100;
const NPX_SKILLS_MAX_CONCURRENCY: usize = 3;
const NPX_SKILLS_OUTPUT_MAX_BYTES: usize = 8 * 1024;
const NPX_SKILLS_JOB_RETENTION_SECS: u64 = 30 * 60;
const NPX_SKILLS_JOB_HISTORY_MAX_EVENTS: usize = 2_048;

type NpxSkillsJobMap = HashMap<String, Arc<RwLock<NpxSkillsJob>>>;

static NPX_SKILLS_JOBS: OnceLock<Arc<RwLock<NpxSkillsJobMap>>> = OnceLock::new();
static NPX_SKILLS_JOB_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Clone)]
struct NpxSkillsSseEnvelope {
    event: String,
    data: String,
}

struct NpxSkillsJob {
    platform_id: String,
    total: usize,
    success_count: usize,
    failure_count: usize,
    completed: bool,
    history: Vec<NpxSkillsSseEnvelope>,
    sender: broadcast::Sender<NpxSkillsSseEnvelope>,
}

impl NpxSkillsJob {
    fn push_event(&mut self, event: NpxSkillsSseEnvelope) {
        if self.history.len() >= NPX_SKILLS_JOB_HISTORY_MAX_EVENTS {
            self.history.remove(0);
        }
        self.history.push(event.clone());
        let _ = self.sender.send(event);
    }
}

#[derive(Clone)]
struct NpxSkillsJobTask {
    label: String,
    args: Vec<String>,
    state_update: StateUpdate,
}

#[derive(Clone)]
struct TargetContext {
    project_root: PathBuf,
    skills_path: PathBuf,
    install_target_scope: InstallTargetScopeDto,
}

#[derive(Clone)]
struct JobExecutionContext {
    state: AppState,
    platform_id: String,
    target_ctx: Arc<TargetContext>,
    install_target: Arc<InstallTargetDto>,
    config: Arc<NpxSkillsCliConfigDto>,
}

#[derive(Clone)]
struct TaskExecutionContext {
    job: Arc<RwLock<NpxSkillsJob>>,
    job_id: String,
    operation: NpxSkillsOperation,
    semaphore: Arc<Semaphore>,
    install_target: Arc<InstallTargetDto>,
    config: Arc<NpxSkillsCliConfigDto>,
    target_ctx: Arc<TargetContext>,
}

#[derive(Clone)]
enum StateUpdate {
    ClearCheckCache,
    WriteCheckCache,
}

#[derive(Deserialize, Default)]
pub struct NpxSkillsCatalogQuery {
    pub search: Option<String>,
    pub installed_only: Option<bool>,
    pub group_id: Option<String>,
    pub category_id: Option<String>,
    #[serde(flatten)]
    pub install_target: InstallTargetQuery,
}

#[derive(Deserialize, Default)]
pub struct NpxSkillsInstalledQuery {
    pub search: Option<String>,
    pub group_id: Option<String>,
    pub category_id: Option<String>,
    #[serde(flatten)]
    pub install_target: InstallTargetQuery,
}

#[derive(Serialize)]
struct JobStartedPayload {
    job_id: String,
    operation: NpxSkillsOperation,
    total: usize,
    max_concurrency: usize,
    started_at_ms: u128,
}

#[derive(Serialize)]
struct ItemStartedPayload {
    job_id: String,
    operation: NpxSkillsOperation,
    item_id: String,
    label: String,
}

#[derive(Serialize)]
struct ItemFinishedPayload {
    job_id: String,
    operation: NpxSkillsOperation,
    item_id: String,
    label: String,
    success: bool,
    output: String,
    error: Option<String>,
    duration_ms: u128,
}

#[derive(Serialize)]
struct JobProgressPayload {
    job_id: String,
    operation: NpxSkillsOperation,
    completed: usize,
    total: usize,
    success_count: usize,
    failure_count: usize,
    percent: f64,
}

#[derive(Serialize)]
struct JobCompletedPayload {
    job_id: String,
    operation: NpxSkillsOperation,
    total: usize,
    success_count: usize,
    failure_count: usize,
    completed_at_ms: u128,
}

#[derive(Serialize)]
struct JobFailedPayload {
    job_id: String,
    operation: NpxSkillsOperation,
    message: String,
}

pub async fn catalog(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<NpxSkillsCatalogQuery>,
) -> Result<Json<ApiResponse<Vec<NpxSkillsCatalogItemDto>>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = query.install_target.to_install_target();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Read,
    )
    .map_err(AppError::BadRequest)?;

    let catalog_entries = resolved_catalog_entries(
        state
            .external_skill_catalog()
            .await
            .map_err(AppError::Internal)?,
    )?;
    let project_root = state.project_root().await;
    let inventory = resolve_inventory(
        &project_root,
        &install_target,
        resolved_install_target_dto(&resolved),
        &catalog_entries,
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    let search = query.search.as_ref().map(|value| value.to_lowercase());

    let mut items: Vec<NpxSkillsCatalogItemDto> =
        apply_catalog_install_state(catalog_entries, &inventory)
            .into_iter()
            .filter_map(|entry| {
                if let Some(ref search) = search
                    && !catalog_item_matches(&entry, search)
                {
                    return None;
                }
                if let Some(ref group_id) = query.group_id
                    && entry.group_id != *group_id
                {
                    return None;
                }
                if let Some(ref category_id) = query.category_id
                    && entry.category_id != *category_id
                {
                    return None;
                }
                if query.installed_only.unwrap_or(false)
                    && !matches!(
                        entry.installed_state,
                        NpxCatalogInstalledStateDto::Installed
                    )
                {
                    return None;
                }
                Some(entry)
            })
            .collect();

    items.sort_by(|left, right| left.name.cmp(&right.name));
    Ok(Json(ApiResponse::ok(items)))
}

pub async fn installed(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<NpxSkillsInstalledQuery>,
) -> Result<Json<ApiResponse<NpxSkillsInstalledInventoryDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = query.install_target.to_install_target();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Read,
    )
    .map_err(AppError::BadRequest)?;

    let project_root = state.project_root().await;
    let catalog_entries = resolved_catalog_entries(
        state
            .external_skill_catalog()
            .await
            .map_err(AppError::Internal)?,
    )?;
    let inventory = resolve_inventory(
        &project_root,
        &install_target,
        resolved_install_target_dto(&resolved),
        &catalog_entries,
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    let search = query.search.as_ref().map(|value| value.to_lowercase());
    let mut items = inventory
        .items
        .into_iter()
        .filter(|item| {
            if let Some(ref value) = search
                && !installed_item_matches(item, value)
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
            true
        })
        .collect::<Vec<_>>();
    items.sort_by(|left, right| left.name.cmp(&right.name));

    Ok(Json(ApiResponse::ok(NpxSkillsInstalledInventoryDto {
        target: inventory.target,
        capabilities: inventory.capabilities,
        summary: inventory.summary,
        items,
    })))
}

pub async fn install_jobs_start(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<NpxSkillsInstallJobRequest>,
) -> Result<Json<ApiResponse<NpxSkillsJobStartDto>>, AppError> {
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
    let target_ctx = TargetContext {
        project_root: state.project_root().await,
        skills_path: resolved.platform.skills_path(),
        install_target_scope: install_target.scope,
    };

    let items = normalize_install_items(body.items)?;
    if items.len() > NPX_SKILLS_MAX_ITEMS {
        return Err(AppError::BadRequest(format!(
            "Too many install items ({}); max allowed is {NPX_SKILLS_MAX_ITEMS}",
            items.len()
        )));
    }

    let is_global = !matches!(install_target.scope, InstallTargetScopeDto::Project);
    let mut tasks = Vec::with_capacity(items.len());
    for item in &items {
        tasks.push(NpxSkillsJobTask {
            label: install_label(item),
            args: build_install_args(item, &body.config, is_global)?,
            state_update: StateUpdate::ClearCheckCache,
        });
    }

    let result = start_job(
        state,
        id,
        NpxSkillsOperation::Install,
        tasks,
        target_ctx,
        install_target,
        body.config,
    )
    .await?;

    Ok(Json(ApiResponse::ok(result)))
}

pub async fn remove_jobs_start(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<NpxSkillsRemoveJobRequest>,
) -> Result<Json<ApiResponse<NpxSkillsJobStartDto>>, AppError> {
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
    let project_root = state.project_root().await;
    let target_ctx = TargetContext {
        project_root: project_root.clone(),
        skills_path: resolved.platform.skills_path(),
        install_target_scope: install_target.scope,
    };

    let item_ids = normalize_names(body.item_ids)?;
    if item_ids.len() > NPX_SKILLS_MAX_ITEMS {
        return Err(AppError::BadRequest(format!(
            "Too many remove items ({}); max allowed is {NPX_SKILLS_MAX_ITEMS}",
            item_ids.len()
        )));
    }

    let catalog_entries = resolved_catalog_entries(
        state
            .external_skill_catalog()
            .await
            .map_err(AppError::Internal)?,
    )?;
    let inventory = resolve_inventory(
        &project_root,
        &install_target,
        resolved_install_target_dto(&resolved),
        &catalog_entries,
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    let removable_items = inventory
        .items
        .into_iter()
        .filter(|item| item.actions.removable)
        .map(|item| (item.id, item.name))
        .collect::<HashMap<_, _>>();

    let mut names = Vec::with_capacity(item_ids.len());
    for item_id in &item_ids {
        let Some(name) = removable_items.get(item_id) else {
            return Err(AppError::BadRequest(format!(
                "Installed skill item '{item_id}' cannot be removed from this page"
            )));
        };
        names.push(name.clone());
    }

    let is_global = !matches!(install_target.scope, InstallTargetScopeDto::Project);
    let mut tasks = Vec::with_capacity(names.len());
    for name in &names {
        tasks.push(NpxSkillsJobTask {
            label: name.clone(),
            args: build_remove_args(name, is_global)?,
            state_update: StateUpdate::ClearCheckCache,
        });
    }

    let result = start_job(
        state,
        id,
        NpxSkillsOperation::Remove,
        tasks,
        target_ctx,
        install_target,
        body.config,
    )
    .await?;

    Ok(Json(ApiResponse::ok(result)))
}

pub async fn check_jobs_start(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<NpxSkillsMaintenanceJobRequest>,
) -> Result<Json<ApiResponse<NpxSkillsJobStartDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = body.install_target.clone();
    let resolved = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Read,
    )
    .map_err(AppError::BadRequest)?;
    let target_ctx = TargetContext {
        project_root: state.project_root().await,
        skills_path: resolved.platform.skills_path(),
        install_target_scope: install_target.scope,
    };
    let inventory = resolve_inventory(
        &target_ctx.project_root,
        &install_target,
        resolved_install_target_dto(&resolved),
        &resolved_catalog_entries(
            state
                .external_skill_catalog()
                .await
                .map_err(AppError::Internal)?,
        )?,
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    if !inventory.capabilities.check.supported {
        return Err(AppError::BadRequestWithDetails {
            message: "Check is not supported for the current install target".into(),
            details: serde_json::json!({
                "reason": inventory.capabilities.check.reason,
            }),
        });
    }

    let is_global = !matches!(install_target.scope, InstallTargetScopeDto::Project);
    let result = start_job(
        state,
        id,
        NpxSkillsOperation::Check,
        vec![NpxSkillsJobTask {
            label: "check".into(),
            args: build_check_args(is_global),
            state_update: StateUpdate::WriteCheckCache,
        }],
        target_ctx,
        install_target,
        body.config,
    )
    .await?;

    Ok(Json(ApiResponse::ok(result)))
}

pub async fn update_jobs_start(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<NpxSkillsMaintenanceJobRequest>,
) -> Result<Json<ApiResponse<NpxSkillsJobStartDto>>, AppError> {
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
    let target_ctx = TargetContext {
        project_root: state.project_root().await,
        skills_path: resolved.platform.skills_path(),
        install_target_scope: install_target.scope,
    };
    let inventory = resolve_inventory(
        &target_ctx.project_root,
        &install_target,
        resolved_install_target_dto(&resolved),
        &resolved_catalog_entries(
            state
                .external_skill_catalog()
                .await
                .map_err(AppError::Internal)?,
        )?,
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    if !inventory.capabilities.update.supported {
        return Err(AppError::BadRequestWithDetails {
            message: "Update is not supported for the current install target".into(),
            details: serde_json::json!({
                "reason": inventory.capabilities.update.reason,
            }),
        });
    }

    let is_global = !matches!(install_target.scope, InstallTargetScopeDto::Project);
    let result = start_job(
        state,
        id,
        NpxSkillsOperation::Update,
        vec![NpxSkillsJobTask {
            label: "update".into(),
            args: build_update_args(is_global),
            state_update: StateUpdate::ClearCheckCache,
        }],
        target_ctx,
        install_target,
        body.config,
    )
    .await?;

    Ok(Json(ApiResponse::ok(result)))
}

pub async fn jobs_stream(
    State(state): State<AppState>,
    Path((id, job_id)): Path<(String, String)>,
) -> Result<Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let job = {
        let jobs = npx_skills_jobs();
        jobs.read()
            .await
            .get(&job_id)
            .cloned()
            .ok_or_else(|| AppError::NotFound(format!("npx skills job '{job_id}' not found")))?
    };

    let (history, receiver) = {
        let job_guard = job.read().await;
        if job_guard.platform_id != id {
            return Err(AppError::NotFound(format!(
                "npx skills job '{job_id}' not found for platform '{id}'"
            )));
        }
        (job_guard.history.clone(), job_guard.sender.subscribe())
    };

    let history_stream = tokio_stream::iter(history.into_iter().map(envelope_to_sse_result));
    let live_stream = BroadcastStream::new(receiver).filter_map(|message| match message {
        Ok(envelope) => Some(envelope_to_sse_result(envelope)),
        Err(_) => None,
    });

    Ok(Sse::new(history_stream.chain(live_stream)).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    ))
}

async fn start_job(
    state: AppState,
    platform_id: String,
    operation: NpxSkillsOperation,
    tasks: Vec<NpxSkillsJobTask>,
    target_ctx: TargetContext,
    install_target: InstallTargetDto,
    config: NpxSkillsCliConfigDto,
) -> Result<NpxSkillsJobStartDto, AppError> {
    if tasks.is_empty() {
        return Err(AppError::BadRequest("At least one task is required".into()));
    }

    let job_id = generate_job_id();
    let total = tasks.len();
    let (sender, _) = broadcast::channel(512);
    let job = Arc::new(RwLock::new(NpxSkillsJob {
        platform_id: platform_id.clone(),
        total,
        success_count: 0,
        failure_count: 0,
        completed: false,
        history: Vec::new(),
        sender,
    }));

    {
        let jobs = npx_skills_jobs();
        jobs.write().await.insert(job_id.clone(), job);
    }

    let job_ctx = JobExecutionContext {
        state: state.clone(),
        platform_id: platform_id.clone(),
        target_ctx: Arc::new(target_ctx),
        install_target: Arc::new(install_target),
        config: Arc::new(config),
    };
    let job_id_for_job = job_id.clone();
    tokio::spawn(async move {
        run_job(job_ctx, job_id_for_job, operation, tasks).await;
    });

    Ok(NpxSkillsJobStartDto {
        job_id,
        operation,
        total,
        status: "running".to_string(),
    })
}

async fn run_job(
    ctx: JobExecutionContext,
    job_id: String,
    operation: NpxSkillsOperation,
    tasks: Vec<NpxSkillsJobTask>,
) {
    let Some(job) = get_job(&job_id).await else {
        return;
    };

    let _ = emit_job_event(
        &job,
        "job_started",
        &JobStartedPayload {
            job_id: job_id.clone(),
            operation,
            total: tasks.len(),
            max_concurrency: NPX_SKILLS_MAX_CONCURRENCY,
            started_at_ms: unix_time_ms(),
        },
    )
    .await;

    let semaphore = Arc::new(Semaphore::new(NPX_SKILLS_MAX_CONCURRENCY));
    let task_ctx = TaskExecutionContext {
        job: job.clone(),
        job_id: job_id.clone(),
        operation,
        semaphore,
        install_target: ctx.install_target.clone(),
        config: ctx.config.clone(),
        target_ctx: ctx.target_ctx.clone(),
    };
    let mut set = tokio::task::JoinSet::new();

    for (index, task) in tasks.into_iter().enumerate() {
        let task_ctx = task_ctx.clone();
        set.spawn(async move {
            run_task(task_ctx, index, task).await;
        });
    }

    while let Some(joined) = set.join_next().await {
        if let Err(error) = joined {
            let _ = emit_job_event(
                &job,
                "job_failed",
                &JobFailedPayload {
                    job_id: job_id.clone(),
                    operation,
                    message: format!("A worker task failed: {error}"),
                },
            )
            .await;
        }
    }

    let (success_count, failure_count, total) = {
        let mut guard = job.write().await;
        guard.completed = true;
        let success_count = guard.success_count;
        let failure_count = guard.failure_count;
        let total = guard.total;
        guard.push_event(build_sse_envelope(
            "job_completed",
            &JobCompletedPayload {
                job_id: job_id.clone(),
                operation,
                total,
                success_count,
                failure_count,
                completed_at_ms: unix_time_ms(),
            },
        ));
        (success_count, failure_count, total)
    };

    if is_mutating_operation(operation) && success_count > 0 {
        invalidate_install_target(&ctx.state, &ctx.platform_id, &ctx.install_target).await;
    }

    tracing::info!(
        "npx skills job completed: job_id={job_id} platform={platform_id} operation={:?} total={total} success={success_count} failure={failure_count}",
        operation,
        platform_id = ctx.platform_id
    );
    schedule_job_cleanup(job_id);
}

async fn run_task(ctx: TaskExecutionContext, index: usize, task: NpxSkillsJobTask) {
    let Ok(_permit) = ctx.semaphore.clone().acquire_owned().await else {
        let _ = emit_job_event(
            &ctx.job,
            "job_failed",
            &JobFailedPayload {
                job_id: ctx.job_id.clone(),
                operation: ctx.operation,
                message: "Semaphore was closed unexpectedly".to_string(),
            },
        )
        .await;
        return;
    };

    let item_id = index.to_string();
    let _ = emit_job_event(
        &ctx.job,
        "item_started",
        &ItemStartedPayload {
            job_id: ctx.job_id.clone(),
            operation: ctx.operation,
            item_id: item_id.clone(),
            label: task.label.clone(),
        },
    )
    .await;

    let started = tokio::time::Instant::now();
    let result = execute_skills_command(&task.args, &ctx.config, &ctx.install_target).await;
    let duration_ms = started.elapsed().as_millis();

    let payload = match result {
        Ok(result) => {
            let state_result = if result.success {
                apply_state_update(
                    &task.state_update,
                    &ctx.target_ctx,
                    &ctx.install_target,
                    &result.output,
                )
                .await
            } else {
                Ok(())
            };
            let output = truncate_utf8(result.output.clone(), NPX_SKILLS_OUTPUT_MAX_BYTES);
            let inventory_error = state_result.err().map(|error| app_error_message(&error));
            let success = result.success && inventory_error.is_none();
            ItemFinishedPayload {
                job_id: ctx.job_id.clone(),
                operation: ctx.operation,
                item_id: item_id.clone(),
                label: task.label.clone(),
                success,
                error: inventory_error.or_else(|| {
                    if result.success {
                        None
                    } else {
                        extract_failure_message(&result.output)
                    }
                }),
                output,
                duration_ms,
            }
        }
        Err(error) => ItemFinishedPayload {
            job_id: ctx.job_id.clone(),
            operation: ctx.operation,
            item_id: item_id.clone(),
            label: task.label.clone(),
            success: false,
            output: String::new(),
            error: Some(app_error_message(&error)),
            duration_ms,
        },
    };

    let mut guard = ctx.job.write().await;
    guard.push_event(build_sse_envelope("item_finished", &payload));
    if payload.success {
        guard.success_count += 1;
    } else {
        guard.failure_count += 1;
    }

    let completed = guard.success_count + guard.failure_count;
    let total = guard.total;
    let success_count = guard.success_count;
    let failure_count = guard.failure_count;
    let percent = if total == 0 {
        0.0
    } else {
        (completed as f64 / total as f64) * 100.0
    };
    guard.push_event(build_sse_envelope(
        "job_progress",
        &JobProgressPayload {
            job_id: ctx.job_id,
            operation: ctx.operation,
            completed,
            total,
            success_count,
            failure_count,
            percent,
        },
    ));
}

fn resolved_catalog_entries(
    registry: mcs_core::core::external_skills::ExternalSkillsRegistry,
) -> Result<Vec<ResolvedExternalSkillEntry>, AppError> {
    registry
        .resolved_skills_for_kind(EXTERNAL_SKILLS_KIND_SKILLS_CLI)
        .map_err(|error| AppError::Internal(error.to_string()))
}

fn resolved_install_target_dto(
    resolved: &mcs_core::core::install_target::ResolvedInstallTarget,
) -> ResolvedInstallTargetDto {
    let project_path = resolved
        .normalized_project_path
        .as_ref()
        .map(|path| path.to_string_lossy().into_owned());

    ResolvedInstallTargetDto {
        scope: InstallTargetScopeDto::from_core(resolved.scope),
        project_path,
        base_dir: resolved.platform.base_path().to_string_lossy().into_owned(),
        skills_path: resolved
            .platform
            .skills_path()
            .to_string_lossy()
            .into_owned(),
        commands_path: resolved.platform.commands_display_path().map(|_| {
            resolved
                .platform
                .commands_path()
                .to_string_lossy()
                .into_owned()
        }),
        agents_path: resolved.platform.agents_display_path().map(|_| {
            resolved
                .platform
                .agents_path()
                .to_string_lossy()
                .into_owned()
        }),
        guidance_path: resolved
            .platform
            .guidance_path()
            .map(|path| path.to_string_lossy().into_owned()),
    }
}

fn catalog_item_matches(item: &NpxSkillsCatalogItemDto, search: &str) -> bool {
    item.name.to_lowercase().contains(search)
        || item.package_ref.to_lowercase().contains(search)
        || item
            .description
            .as_ref()
            .is_some_and(|value| value.to_lowercase().contains(search))
        || item.group_label.to_lowercase().contains(search)
        || item.category_label.to_lowercase().contains(search)
        || item
            .usage
            .as_ref()
            .is_some_and(|value| value.to_lowercase().contains(search))
        || item
            .tags
            .iter()
            .any(|tag| tag.to_lowercase().contains(search))
}

fn installed_item_matches(item: &crate::dto::NpxInstalledSkillInstanceDto, search: &str) -> bool {
    item.name.to_lowercase().contains(search)
        || item.source.r#ref.to_lowercase().contains(search)
        || item
            .description
            .as_ref()
            .is_some_and(|value| value.to_lowercase().contains(search))
        || item.group_label.to_lowercase().contains(search)
        || item.category_label.to_lowercase().contains(search)
        || item.source.display.to_lowercase().contains(search)
        || item
            .tags
            .iter()
            .any(|tag| tag.to_lowercase().contains(search))
}

fn normalize_install_items(
    items: Vec<NpxSkillsInstallItemRequest>,
) -> Result<Vec<NpxSkillsInstallItemRequest>, AppError> {
    let mut normalized = Vec::with_capacity(items.len());
    for item in items {
        let package_ref = item.package_ref.trim();
        if package_ref.is_empty() {
            continue;
        }
        normalized.push(NpxSkillsInstallItemRequest {
            package_ref: package_ref.to_string(),
            skill_flags: item
                .skill_flags
                .into_iter()
                .map(|flag| flag.trim().to_string())
                .filter(|flag| !flag.is_empty())
                .collect(),
            catalog_entry_id: item.catalog_entry_id,
        });
    }

    if normalized.is_empty() {
        return Err(AppError::BadRequest(
            "At least one package reference is required".into(),
        ));
    }

    Ok(normalized)
}

fn normalize_names(names: Vec<String>) -> Result<Vec<String>, AppError> {
    let mut normalized = Vec::new();
    for name in names.into_iter().map(|name| name.trim().to_string()) {
        if name.is_empty() {
            continue;
        }
        if !normalized.iter().any(|existing| existing == &name) {
            normalized.push(name);
        }
    }

    if normalized.is_empty() {
        return Err(AppError::BadRequest(
            "At least one installed skill name is required".into(),
        ));
    }

    Ok(normalized)
}

fn install_label(item: &NpxSkillsInstallItemRequest) -> String {
    let mut label = item.package_ref.trim().to_string();
    for flag in &item.skill_flags {
        label.push_str(" --skill ");
        label.push_str(flag);
    }
    label
}

fn is_mutating_operation(operation: NpxSkillsOperation) -> bool {
    matches!(
        operation,
        NpxSkillsOperation::Install | NpxSkillsOperation::Remove | NpxSkillsOperation::Update
    )
}

async fn apply_state_update(
    state_update: &StateUpdate,
    target_ctx: &TargetContext,
    install_target: &InstallTargetDto,
    output: &str,
) -> Result<(), AppError> {
    match state_update {
        StateUpdate::ClearCheckCache => {
            clear_check_cache(&target_ctx.project_root, &target_ctx.skills_path)
        }
        StateUpdate::WriteCheckCache => {
            let inventory = resolve_inventory(
                &target_ctx.project_root,
                install_target,
                ResolvedInstallTargetDto {
                    scope: target_ctx.install_target_scope,
                    project_path: install_target.project_path.clone(),
                    base_dir: String::new(),
                    skills_path: target_ctx.skills_path.to_string_lossy().into_owned(),
                    commands_path: None,
                    agents_path: None,
                    guidance_path: None,
                },
                &[],
                NpxSkillsCliConfigDto::default().cli_mode,
            )
            .await?;
            write_check_cache(
                &target_ctx.project_root,
                &target_ctx.skills_path,
                &inventory,
                output,
            )
        }
    }
}

async fn invalidate_install_target(
    state: &AppState,
    platform_id: &str,
    install_target: &InstallTargetDto,
) {
    let Some(base_platform) = state.platform(platform_id).await else {
        return;
    };
    let Ok(resolved) = resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Write,
    ) else {
        return;
    };

    if matches!(install_target.scope, InstallTargetScopeDto::Global) {
        let related = state.related_platform_ids_by_skills_path(platform_id).await;
        if related.is_empty() {
            state.invalidate_platform(platform_id).await;
        } else {
            state.invalidate_platforms(&related).await;
        }
    } else {
        state.invalidate_platform_config(&resolved.platform).await;
    }
}

fn npx_skills_jobs() -> &'static Arc<RwLock<NpxSkillsJobMap>> {
    NPX_SKILLS_JOBS.get_or_init(|| Arc::new(RwLock::new(HashMap::new())))
}

async fn get_job(job_id: &str) -> Option<Arc<RwLock<NpxSkillsJob>>> {
    let jobs = npx_skills_jobs();
    jobs.read().await.get(job_id).cloned()
}

fn generate_job_id() -> String {
    let seq = NPX_SKILLS_JOB_COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("npx-skills-{seq}-{}", unix_time_ms())
}

fn unix_time_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0)
}

fn build_sse_envelope<T: Serialize>(event: &str, payload: &T) -> NpxSkillsSseEnvelope {
    let data = serde_json::to_string(payload).unwrap_or_else(|_| {
        serde_json::json!({ "message": "Failed to serialize SSE payload" }).to_string()
    });
    NpxSkillsSseEnvelope {
        event: event.to_string(),
        data,
    }
}

fn envelope_to_sse_result(envelope: NpxSkillsSseEnvelope) -> Result<Event, Infallible> {
    Ok(Event::default().event(envelope.event).data(envelope.data))
}

async fn emit_job_event<T: Serialize>(
    job: &Arc<RwLock<NpxSkillsJob>>,
    event: &str,
    payload: &T,
) -> Result<(), AppError> {
    let mut guard = job.write().await;
    guard.push_event(build_sse_envelope(event, payload));
    Ok(())
}

fn schedule_job_cleanup(job_id: String) {
    let jobs = npx_skills_jobs().clone();
    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_secs(NPX_SKILLS_JOB_RETENTION_SECS)).await;
        jobs.write().await.remove(&job_id);
    });
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
        AppError::NotFound(message)
        | AppError::BadRequest(message)
        | AppError::Internal(message) => message.clone(),
        AppError::BadRequestWithDetails { message, .. } => message.clone(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalize_names_deduplicates_and_rejects_empty() {
        let names = normalize_names(vec!["find-skills".into(), "find-skills".into(), " ".into()])
            .expect("names");
        assert_eq!(names, vec!["find-skills".to_string()]);
    }

    #[test]
    fn installed_item_matches_considers_taxonomy_and_tags() {
        let item = crate::dto::NpxInstalledSkillInstanceDto {
            id: "find-skills".into(),
            name: "find-skills".into(),
            scope: InstallTargetScopeDto::Global,
            agents: vec!["Claude Code".into()],
            group_id: "engineering".into(),
            group_label: "Engineering".into(),
            group_order: 10,
            category_id: "tools".into(),
            category_label: "Tools".into(),
            category_order: 20,
            tags: vec!["tag".into()],
            description: Some("Find skills quickly".into()),
            source: crate::dto::NpxInstalledSourceDto {
                kind: crate::dto::NpxInstalledSourceKindDto::Curated,
                r#ref: "vercel-labs/skills".into(),
                display: "vercel-labs/skills".into(),
            },
            catalog_match: None,
            tracking: crate::dto::NpxInstalledTrackingDto {
                kind: crate::dto::NpxInstalledTrackingKindDto::Tracked,
                source_type: Some("well-known".into()),
                installed_at: None,
                updated_at: None,
                reason: None,
            },
            update: crate::dto::NpxInstalledUpdateDto {
                kind: crate::dto::NpxInstalledUpdateKindDto::NotChecked,
                last_checked_at_ms: None,
                reason: None,
            },
            actions: crate::dto::NpxInstalledActionsDto {
                removable: true,
                reinstallable: true,
                batch_updatable: true,
            },
        };
        assert!(installed_item_matches(&item, "engineering"));
        assert!(installed_item_matches(&item, "tools"));
        assert!(installed_item_matches(&item, "vercel-labs/skills"));
    }
}
