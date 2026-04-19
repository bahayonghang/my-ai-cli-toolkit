use axum::Json;
use axum::extract::{Path, Query, State};
use axum::response::sse::{Event, KeepAlive, Sse};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::convert::Infallible;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::{RwLock, Semaphore, broadcast};
use tokio_stream::{StreamExt as TokioStreamExt, wrappers::BroadcastStream};

use mcs_core::activity::{
    ActivityEventKind, ActivityEventLevel, ActivityItem, ActivityOperation as ActivityLogOperation,
    ActivityRun, ActivitySurface, append_run,
};
use mcs_core::core::external_skills::{
    EXTERNAL_SKILLS_KIND_SKILLS_CLI, ResolvedExternalSkillEntry,
};
use mcs_core::core::install_target::{InstallTargetAccessMode, resolve_target_platform};
use mcs_core::model::ItemType;

use crate::api::error::AppError;
#[cfg(test)]
use crate::dto::NpxInstalledSkillInstanceDto;
use crate::dto::{
    ApiResponse, InstallTargetDto, InstallTargetQuery, InstallTargetScopeDto,
    NpxSkillsCatalogItemDto, NpxSkillsCliConfigDto, NpxSkillsCliMode, NpxSkillsCliVersionDto,
    NpxSkillsInstallItemRequest, NpxSkillsInstallJobRequest, NpxSkillsInstalledInventoryDto,
    NpxSkillsJobStartDto, NpxSkillsMaintenanceJobRequest, NpxSkillsOperation,
    NpxSkillsPackagePreviewDto, NpxSkillsPackagePreviewRequest, NpxSkillsPackageUpdateJobRequest,
    NpxSkillsPackagesInventoryDto, NpxSkillsRemoveJobRequest, ResolvedInstallTargetDto,
};
use crate::services::activity_log::{
    activity_status_from_counts, build_activity_event, current_time_ms, emit_activity_event,
    install_target_to_activity, npx_run_config,
};
use crate::services::npx_skills_cli::{
    build_check_args, build_install_args, build_remove_args, build_update_args,
    build_update_args_for_skills, clear_package_preview_cache, execute_skills_command,
    preview_package_skills, resolve_cli_version_info,
};
use crate::services::npx_skills_inventory::{
    InventoryQuery, PackageInventoryQuery, catalog_entries_to_static_dto, clear_check_cache,
    clear_persisted_list_cache, invalidate_inventory_cache, resolve_catalog_install_state_snapshot,
    resolve_inventory, resolve_inventory_page, resolve_package_inventory_page, write_check_cache,
};
use crate::state::AppState;

const NPX_SKILLS_MAX_ITEMS: usize = 100;
const NPX_SKILLS_MAX_CONCURRENCY: usize = 3;
const NPX_SKILLS_OUTPUT_MAX_BYTES: usize = 8 * 1024;
const NPX_SKILLS_JOB_RETENTION_SECS: u64 = 30 * 60;
const NPX_SKILLS_JOB_HISTORY_MAX_EVENTS: usize = 2_048;
#[cfg(test)]
const NPX_SKILLS_DEFAULT_PAGE_SIZE: usize = 50;
#[cfg(test)]
const NPX_SKILLS_MAX_PAGE_SIZE: usize = 100;

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
    started_at_ms: u64,
    recorded_items: Vec<Option<ActivityItem>>,
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
    package_ref: Option<String>,
    skill_flags: Vec<String>,
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
    state: AppState,
    platform_id: String,
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
    pub source_filter: Option<String>,
    pub tracking_filter: Option<String>,
    pub update_filter: Option<String>,
    pub page: Option<usize>,
    pub page_size: Option<usize>,
    #[serde(flatten)]
    pub install_target: InstallTargetQuery,
}

#[derive(Deserialize, Default)]
pub struct NpxSkillsPackagesQuery {
    pub search: Option<String>,
    pub page: Option<usize>,
    pub page_size: Option<usize>,
    pub refresh_remote: Option<bool>,
    #[serde(flatten)]
    pub install_target: InstallTargetQuery,
}

#[derive(Deserialize, Default)]
pub struct NpxSkillsCliVersionQuery {
    pub cli_mode: Option<NpxSkillsCliMode>,
    pub refresh: Option<bool>,
}

#[derive(Deserialize, Default)]
pub struct NpxSkillsCatalogInstallStateQuery {
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

fn installed_query_is_filtered(query: &NpxSkillsInstalledQuery) -> bool {
    query
        .search
        .as_ref()
        .is_some_and(|value| !value.trim().is_empty())
        || query.group_id.is_some()
        || query.category_id.is_some()
        || query
            .source_filter
            .as_ref()
            .is_some_and(|value| !value.trim().is_empty())
        || query
            .tracking_filter
            .as_ref()
            .is_some_and(|value| !value.trim().is_empty())
        || query
            .update_filter
            .as_ref()
            .is_some_and(|value| !value.trim().is_empty())
        || query.page.is_some()
        || query.page_size.is_some()
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
    let _resolved = resolve_target_platform(
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
    // Static catalog responses intentionally defer installed-state filtering until
    // the follow-up install-state snapshot arrives on the client.
    let _ignored_installed_only = query.installed_only.unwrap_or(false);
    let search = query.search.as_ref().map(|value| value.to_lowercase());

    let mut items: Vec<NpxSkillsCatalogItemDto> = catalog_entries_to_static_dto(catalog_entries)
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

    let resolved_target = resolved_install_target_dto(&resolved);
    let project_root = state.project_root().await;
    let catalog_entries = resolved_catalog_entries(
        state
            .external_skill_catalog()
            .await
            .map_err(AppError::Internal)?,
    )?;
    if installed_query_is_filtered(&query) {
        let inventory = resolve_inventory_page(
            &project_root,
            &install_target,
            resolved_target,
            &catalog_entries,
            NpxSkillsCliConfigDto::default().cli_mode,
            &InventoryQuery {
                search: query.search.clone(),
                group_id: query.group_id.clone(),
                category_id: query.category_id.clone(),
                source_filter: query.source_filter.clone(),
                tracking_filter: query.tracking_filter.clone(),
                update_filter: query.update_filter.clone(),
                page: query.page,
                page_size: query.page_size,
            },
        )
        .await?;
        return Ok(Json(ApiResponse::ok(inventory.into_dto())));
    }

    let inventory = resolve_inventory(
        &project_root,
        &install_target,
        resolved_target,
        &catalog_entries,
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    Ok(Json(ApiResponse::ok(inventory)))
}

pub async fn packages(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<NpxSkillsPackagesQuery>,
) -> Result<Json<ApiResponse<NpxSkillsPackagesInventoryDto>>, AppError> {
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

    let resolved_target = resolved_install_target_dto(&resolved);
    let project_root = state.project_root().await;
    let catalog_entries = resolved_catalog_entries(
        state
            .external_skill_catalog()
            .await
            .map_err(AppError::Internal)?,
    )?;
    let inventory = resolve_package_inventory_page(
        &project_root,
        &install_target,
        resolved_target,
        &catalog_entries,
        NpxSkillsCliConfigDto::default().cli_mode,
        &PackageInventoryQuery {
            search: query.search.clone(),
            page: query.page,
            page_size: query.page_size,
            force_remote_refresh: query.refresh_remote.unwrap_or(false),
        },
    )
    .await?;

    Ok(Json(ApiResponse::ok(inventory.into_dto())))
}

pub async fn cli_version(
    State(state): State<AppState>,
    Path(_id): Path<String>,
    Query(query): Query<NpxSkillsCliVersionQuery>,
) -> Result<Json<ApiResponse<NpxSkillsCliVersionDto>>, AppError> {
    let project_root = state.project_root().await;
    let cli_mode = query.cli_mode.unwrap_or_default();
    let version =
        resolve_cli_version_info(&project_root, cli_mode, query.refresh.unwrap_or(false)).await?;
    Ok(Json(ApiResponse::ok(version)))
}

pub async fn catalog_install_state(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<NpxSkillsCatalogInstallStateQuery>,
) -> Result<Json<ApiResponse<crate::dto::NpxCatalogInstallStateDto>>, AppError> {
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
    let snapshot = resolve_catalog_install_state_snapshot(
        &project_root,
        &install_target,
        &resolved_install_target_dto(&resolved),
        NpxSkillsCliConfigDto::default().cli_mode,
    )
    .await?;
    Ok(Json(ApiResponse::ok(snapshot)))
}

pub async fn package_preview(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<NpxSkillsPackagePreviewRequest>,
) -> Result<Json<ApiResponse<NpxSkillsPackagePreviewDto>>, AppError> {
    let base_platform = state
        .platform(&id)
        .await
        .ok_or_else(|| AppError::NotFound(format!("Platform '{id}' not found")))?;
    let install_target = body.install_target.clone();
    resolve_target_platform(
        &base_platform,
        &install_target.to_core(),
        InstallTargetAccessMode::Read,
    )
    .map_err(AppError::BadRequest)?;
    let preview = preview_package_skills(&body.package_ref, &body.config, &install_target).await?;
    Ok(Json(ApiResponse::ok(preview)))
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
            package_ref: Some(item.package_ref.clone()),
            skill_flags: item.skill_flags.clone(),
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
            package_ref: None,
            skill_flags: Vec::new(),
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
            package_ref: None,
            skill_flags: Vec::new(),
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
            package_ref: None,
            skill_flags: Vec::new(),
        }],
        target_ctx,
        install_target,
        body.config,
    )
    .await?;

    Ok(Json(ApiResponse::ok(result)))
}

pub async fn update_package_jobs_start(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<NpxSkillsPackageUpdateJobRequest>,
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
    let catalog_entries = resolved_catalog_entries(
        state
            .external_skill_catalog()
            .await
            .map_err(AppError::Internal)?,
    )?;
    let inventory = resolve_package_inventory_page(
        &target_ctx.project_root,
        &install_target,
        resolved_install_target_dto(&resolved),
        &catalog_entries,
        NpxSkillsCliConfigDto::default().cli_mode,
        &PackageInventoryQuery {
            page: Some(NPX_SKILLS_MAX_ITEMS),
            page_size: Some(NPX_SKILLS_MAX_ITEMS),
            force_remote_refresh: false,
            ..PackageInventoryQuery::default()
        },
    )
    .await?;

    let item_ids = normalize_names(body.item_ids)?;
    if item_ids.len() > NPX_SKILLS_MAX_ITEMS {
        return Err(AppError::BadRequest(format!(
            "Too many package update items ({}); max allowed is {NPX_SKILLS_MAX_ITEMS}",
            item_ids.len()
        )));
    }

    let package_lookup = inventory
        .items
        .into_iter()
        .map(|item| (item.id.clone(), item))
        .collect::<HashMap<_, _>>();

    let mut skill_names = Vec::<String>::new();
    let mut labels = Vec::<String>::new();
    for item_id in &item_ids {
        let Some(package) = package_lookup.get(item_id) else {
            return Err(AppError::BadRequest(format!(
                "Installed package '{item_id}' cannot be updated from this page"
            )));
        };
        if !package.actions.updatable {
            return Err(AppError::BadRequest(format!(
                "Installed package '{}' does not currently expose an update action",
                package.package_ref
            )));
        }
        labels.push(package.package_ref.clone());
        for skill in &package.installed_skill_names {
            if !skill_names.iter().any(|existing| existing == skill) {
                skill_names.push(skill.clone());
            }
        }
    }

    let is_global = !matches!(install_target.scope, InstallTargetScopeDto::Project);
    let args = build_update_args_for_skills(&skill_names, is_global);
    let result = start_job(
        state,
        id,
        NpxSkillsOperation::UpdatePackages,
        vec![NpxSkillsJobTask {
            label: labels.join(", "),
            args,
            state_update: StateUpdate::ClearCheckCache,
            package_ref: None,
            skill_flags: Vec::new(),
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
    tracing::info!(
        target: "mcs::skills::job",
        job_id = job_id.as_str(),
        platform_id = platform_id.as_str(),
        operation = ?operation,
        items = total,
        scope = ?install_target.scope,
        "start"
    );
    let (sender, _) = broadcast::channel(512);
    let job = Arc::new(RwLock::new(NpxSkillsJob {
        platform_id: platform_id.clone(),
        total,
        success_count: 0,
        failure_count: 0,
        completed: false,
        started_at_ms: current_time_ms(),
        recorded_items: vec![None; total],
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

    emit_activity_event(
        &ctx.state,
        build_activity_event(
            &job_id,
            ActivityEventKind::JobStarted,
            ActivityEventLevel::Info,
            ActivitySurface::NpxSkills,
            Some(ctx.platform_id.clone()),
            Some(activity_operation(operation)),
            serde_json::json!({
                "total": tasks.len(),
                "scope": format!("{:?}", ctx.install_target.scope),
            }),
        ),
    );

    let semaphore = Arc::new(Semaphore::new(NPX_SKILLS_MAX_CONCURRENCY));
    let task_ctx = TaskExecutionContext {
        state: ctx.state.clone(),
        platform_id: ctx.platform_id.clone(),
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

    let (success_count, failure_count, total, started_at_ms, recorded_items, completed_at_ms) = {
        let mut guard = job.write().await;
        guard.completed = true;
        let success_count = guard.success_count;
        let failure_count = guard.failure_count;
        let total = guard.total;
        let started_at_ms = guard.started_at_ms;
        let recorded_items = guard
            .recorded_items
            .iter()
            .filter_map(|item| item.clone())
            .collect::<Vec<_>>();
        let completed_at_ms = current_time_ms();
        guard.push_event(build_sse_envelope(
            "job_completed",
            &JobCompletedPayload {
                job_id: job_id.clone(),
                operation,
                total,
                success_count,
                failure_count,
                completed_at_ms: completed_at_ms.into(),
            },
        ));
        (
            success_count,
            failure_count,
            total,
            started_at_ms,
            recorded_items,
            completed_at_ms,
        )
    };

    if is_mutating_operation(operation) && success_count > 0 {
        invalidate_install_target(&ctx.state, &ctx.platform_id, &ctx.install_target).await;
    }

    let platform_name = ctx
        .state
        .platform(&ctx.platform_id)
        .await
        .map(|platform| platform.name)
        .unwrap_or_else(|| ctx.platform_id.clone());
    if let Err(error) = append_run(&ActivityRun {
        run_id: job_id.clone(),
        surface: ActivitySurface::NpxSkills,
        operation: activity_operation(operation),
        status: activity_status_from_counts(success_count, failure_count),
        platform_id: ctx.platform_id.clone(),
        platform_name,
        install_target: install_target_to_activity(&ctx.install_target),
        started_at_ms,
        completed_at_ms,
        duration_ms: completed_at_ms.saturating_sub(started_at_ms),
        item_count: recorded_items.len(),
        success_count,
        failure_count,
        run_config: npx_run_config(&ctx.config),
        items: recorded_items,
    }) {
        tracing::warn!(
            job_id = job_id.as_str(),
            error = %error,
            "Failed to persist npx skills activity log"
        );
    }

    tracing::info!(
        target: "mcs::skills::job",
        job_id = job_id.as_str(),
        platform_id = ctx.platform_id.as_str(),
        operation = ?operation,
        total,
        success = success_count,
        failure = failure_count,
        duration_ms = completed_at_ms.saturating_sub(started_at_ms),
        "job_completed"
    );
    emit_activity_event(
        &ctx.state,
        build_activity_event(
            &job_id,
            ActivityEventKind::JobCompleted,
            if failure_count > 0 {
                ActivityEventLevel::Warning
            } else {
                ActivityEventLevel::Info
            },
            ActivitySurface::NpxSkills,
            Some(ctx.platform_id.clone()),
            Some(activity_operation(operation)),
            serde_json::json!({
                "total": total,
                "success_count": success_count,
                "failure_count": failure_count,
                "duration_ms": completed_at_ms.saturating_sub(started_at_ms),
            }),
        ),
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
    tracing::info!(
        target: "mcs::skills::job",
        job_id = ctx.job_id.as_str(),
        item = task.label.as_str(),
        operation = ?ctx.operation,
        "item_started"
    );
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

    emit_activity_event(
        &ctx.state,
        build_activity_event(
            &ctx.job_id,
            ActivityEventKind::ItemStarted,
            ActivityEventLevel::Info,
            ActivitySurface::NpxSkills,
            Some(ctx.platform_id.clone()),
            Some(activity_operation(ctx.operation)),
            serde_json::json!({
                "item_id": item_id,
                "label": task.label,
            }),
        ),
    );

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
    guard.recorded_items[index] = Some(ActivityItem {
        label: task.label.clone(),
        item_type: ItemType::Skill,
        success: payload.success,
        message: if payload.success {
            format!("Completed {}", task.label)
        } else {
            format!("Failed {}", task.label)
        },
        error: payload.error.clone(),
        output: (!payload.output.is_empty()).then_some(payload.output.clone()),
        duration_ms: u64::try_from(payload.duration_ms).unwrap_or(u64::MAX),
        source_path: None,
        target_path: None,
        package_ref: task.package_ref.clone(),
        skill_flags: task.skill_flags.clone(),
    });
    guard.push_event(build_sse_envelope("item_finished", &payload));
    if payload.success {
        guard.success_count += 1;
        tracing::info!(
            target: "mcs::skills::job",
            job_id = ctx.job_id.as_str(),
            item = task.label.as_str(),
            duration_ms = payload.duration_ms,
            "item_finished"
        );
    } else {
        guard.failure_count += 1;
        tracing::error!(
            target: "mcs::skills::job",
            job_id = ctx.job_id.as_str(),
            item = task.label.as_str(),
            duration_ms = payload.duration_ms,
            error = payload.error.as_deref().unwrap_or("<none>"),
            "item_failed"
        );
    }
    drop(guard);

    emit_activity_event(
        &ctx.state,
        build_activity_event(
            &ctx.job_id,
            ActivityEventKind::ItemFinished,
            if payload.success {
                ActivityEventLevel::Info
            } else {
                ActivityEventLevel::Error
            },
            ActivitySurface::NpxSkills,
            Some(ctx.platform_id.clone()),
            Some(activity_operation(ctx.operation)),
            serde_json::json!({
                "item_id": item_id,
                "label": task.label,
                "success": payload.success,
                "duration_ms": payload.duration_ms,
                "error": payload.error,
                "package_ref": task.package_ref,
                "skill_flags": task.skill_flags,
            }),
        ),
    );
    let mut guard = ctx.job.write().await;

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

fn activity_operation(operation: NpxSkillsOperation) -> ActivityLogOperation {
    match operation {
        NpxSkillsOperation::Install => ActivityLogOperation::Install,
        NpxSkillsOperation::Remove => ActivityLogOperation::Remove,
        NpxSkillsOperation::Check => ActivityLogOperation::Check,
        NpxSkillsOperation::Update => ActivityLogOperation::Update,
        NpxSkillsOperation::UpdatePackages => ActivityLogOperation::UpdatePackages,
    }
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
        || item.category_slug.to_lowercase().contains(search)
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

#[cfg(test)]
fn installed_item_matches(item: &crate::dto::NpxInstalledSkillInstanceDto, search: &str) -> bool {
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

#[cfg(test)]
fn installed_item_matches_source_filter(
    item: &NpxInstalledSkillInstanceDto,
    filter: Option<&str>,
) -> bool {
    match filter.unwrap_or("all") {
        "all" | "" => true,
        "curated" => matches!(
            item.source.kind,
            crate::dto::NpxInstalledSourceKindDto::Curated
        ),
        "manual" => !matches!(
            item.source.kind,
            crate::dto::NpxInstalledSourceKindDto::Curated
        ),
        _ => true,
    }
}

#[cfg(test)]
fn installed_item_matches_tracking_filter(
    item: &NpxInstalledSkillInstanceDto,
    filter: Option<&str>,
) -> bool {
    match filter.unwrap_or("all") {
        "all" | "" => true,
        "tracked" => matches!(
            item.tracking.kind,
            crate::dto::NpxInstalledTrackingKindDto::Tracked
        ),
        "untracked" => {
            matches!(
                item.tracking.kind,
                crate::dto::NpxInstalledTrackingKindDto::Untracked
            )
        }
        _ => true,
    }
}

#[cfg(test)]
fn installed_item_matches_update_filter(
    item: &NpxInstalledSkillInstanceDto,
    filter: Option<&str>,
) -> bool {
    match filter.unwrap_or("all") {
        "all" | "" => true,
        "not_checked" => matches!(
            item.update.kind,
            crate::dto::NpxInstalledUpdateKindDto::NotChecked
        ),
        "up_to_date" => matches!(
            item.update.kind,
            crate::dto::NpxInstalledUpdateKindDto::UpToDate
        ),
        "update_available" => matches!(
            item.update.kind,
            crate::dto::NpxInstalledUpdateKindDto::UpdateAvailable
        ),
        "unsupported" => matches!(
            item.update.kind,
            crate::dto::NpxInstalledUpdateKindDto::Unsupported
        ),
        _ => true,
    }
}

#[cfg(test)]
fn sanitize_page_size(page_size: Option<usize>) -> usize {
    page_size
        .unwrap_or(NPX_SKILLS_DEFAULT_PAGE_SIZE)
        .clamp(1, NPX_SKILLS_MAX_PAGE_SIZE)
}

#[cfg(test)]
fn total_pages(filtered_total: usize, page_size: usize) -> usize {
    std::cmp::max(1, filtered_total.div_ceil(page_size))
}

#[cfg(test)]
fn sanitize_page(page: Option<usize>, total_pages: usize) -> usize {
    page.unwrap_or(1).clamp(1, total_pages)
}

fn normalize_install_items(
    items: Vec<NpxSkillsInstallItemRequest>,
) -> Result<Vec<NpxSkillsInstallItemRequest>, AppError> {
    let mut normalized = Vec::<NpxSkillsInstallItemRequest>::with_capacity(items.len());
    let mut package_index = HashMap::<String, usize>::new();
    for item in items {
        let package_ref = item.package_ref.trim();
        if package_ref.is_empty() {
            continue;
        }
        let mut skill_flags = item
            .skill_flags
            .into_iter()
            .map(|flag| flag.trim().to_string())
            .filter(|flag| !flag.is_empty())
            .collect::<Vec<_>>();

        if let Some(index) = package_index.get(package_ref).copied() {
            let existing = normalized
                .get_mut(index)
                .expect("existing grouped install item");
            if skill_flags.is_empty() {
                existing.skill_flags.clear();
            } else if !existing.skill_flags.is_empty() {
                let mut seen = existing.skill_flags.iter().cloned().collect::<HashSet<_>>();
                for flag in skill_flags.drain(..) {
                    if seen.insert(flag.clone()) {
                        existing.skill_flags.push(flag);
                    }
                }
            }
            continue;
        }

        package_index.insert(package_ref.to_string(), normalized.len());
        normalized.push(NpxSkillsInstallItemRequest {
            package_ref: package_ref.to_string(),
            skill_flags,
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
        NpxSkillsOperation::Install
            | NpxSkillsOperation::Remove
            | NpxSkillsOperation::Update
            | NpxSkillsOperation::UpdatePackages
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
            clear_package_preview_cache();
            clear_check_cache(&target_ctx.project_root, &target_ctx.skills_path)?;
            clear_persisted_list_cache(
                &target_ctx.project_root,
                &target_ctx.skills_path,
                target_ctx.install_target_scope,
            );
            invalidate_inventory_cache(&target_ctx.skills_path, target_ctx.install_target_scope);
            Ok(())
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
            )?;
            invalidate_inventory_cache(&target_ctx.skills_path, target_ctx.install_target_scope);
            Ok(())
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
            category_id: "design".into(),
            category_slug: "design".into(),
            category_label: "Design".into(),
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
        assert!(installed_item_matches(&item, "design"));
        assert!(installed_item_matches(&item, "vercel-labs/skills"));
    }

    #[test]
    fn installed_filter_helpers_match_expected_states() {
        let item = crate::dto::NpxInstalledSkillInstanceDto {
            id: "local-tool".into(),
            name: "local-tool".into(),
            scope: InstallTargetScopeDto::Global,
            agents: vec![],
            group_id: "manual".into(),
            group_label: "Manual".into(),
            group_order: 1,
            category_id: "manual_local".into(),
            category_slug: "manual-local".into(),
            category_label: "Local".into(),
            category_order: 1,
            tags: vec![],
            description: None,
            source: crate::dto::NpxInstalledSourceDto {
                kind: crate::dto::NpxInstalledSourceKindDto::ManualLocal,
                r#ref: "./skills/local-tool".into(),
                display: "./skills/local-tool".into(),
            },
            catalog_match: None,
            tracking: crate::dto::NpxInstalledTrackingDto {
                kind: crate::dto::NpxInstalledTrackingKindDto::Untracked,
                source_type: None,
                installed_at: None,
                updated_at: None,
                reason: None,
            },
            update: crate::dto::NpxInstalledUpdateDto {
                kind: crate::dto::NpxInstalledUpdateKindDto::Unsupported,
                last_checked_at_ms: None,
                reason: Some("local".into()),
            },
            actions: crate::dto::NpxInstalledActionsDto {
                removable: true,
                reinstallable: false,
                batch_updatable: false,
            },
        };

        assert!(installed_item_matches_source_filter(&item, Some("manual")));
        assert!(!installed_item_matches_source_filter(
            &item,
            Some("curated")
        ));
        assert!(installed_item_matches_tracking_filter(
            &item,
            Some("untracked")
        ));
        assert!(!installed_item_matches_tracking_filter(
            &item,
            Some("tracked")
        ));
        assert!(installed_item_matches_update_filter(
            &item,
            Some("unsupported")
        ));
        assert!(!installed_item_matches_update_filter(
            &item,
            Some("up_to_date")
        ));
    }

    #[test]
    fn pagination_helpers_clamp_values() {
        assert_eq!(sanitize_page_size(None), NPX_SKILLS_DEFAULT_PAGE_SIZE);
        assert_eq!(sanitize_page_size(Some(999)), NPX_SKILLS_MAX_PAGE_SIZE);
        assert_eq!(total_pages(0, 50), 1);
        assert_eq!(total_pages(101, 50), 3);
        assert_eq!(sanitize_page(Some(9), 3), 3);
        assert_eq!(sanitize_page(Some(0), 3), 1);
    }

    #[test]
    fn normalize_install_items_groups_package_refs_and_preserves_full_package_installs() {
        let items = normalize_install_items(vec![
            NpxSkillsInstallItemRequest {
                package_ref: "vercel-labs/agent-skills".into(),
                skill_flags: vec!["deploy-to-vercel".into()],
                catalog_entry_id: Some("deploy".into()),
            },
            NpxSkillsInstallItemRequest {
                package_ref: "vercel-labs/agent-skills".into(),
                skill_flags: vec!["web-design-guidelines".into()],
                catalog_entry_id: Some("web".into()),
            },
            NpxSkillsInstallItemRequest {
                package_ref: "vercel-labs/skills".into(),
                skill_flags: vec![],
                catalog_entry_id: None,
            },
            NpxSkillsInstallItemRequest {
                package_ref: "vercel-labs/skills".into(),
                skill_flags: vec!["find-skills".into()],
                catalog_entry_id: Some("find".into()),
            },
        ])
        .expect("normalized items");

        assert_eq!(items.len(), 2);
        assert_eq!(items[0].package_ref, "vercel-labs/agent-skills");
        assert_eq!(
            items[0].skill_flags,
            vec![
                "deploy-to-vercel".to_string(),
                "web-design-guidelines".to_string()
            ]
        );
        assert_eq!(items[1].package_ref, "vercel-labs/skills");
        assert!(items[1].skill_flags.is_empty());
    }

    #[test]
    fn installed_query_detection_defaults_to_full_snapshot() {
        assert!(!installed_query_is_filtered(
            &NpxSkillsInstalledQuery::default()
        ));
        assert!(installed_query_is_filtered(&NpxSkillsInstalledQuery {
            category_id: Some("engineering".into()),
            ..NpxSkillsInstalledQuery::default()
        }));
    }
}
