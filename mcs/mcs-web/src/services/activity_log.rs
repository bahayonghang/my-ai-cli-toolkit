use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

use mcs_core::activity::{
    ActivityEvent, ActivityEventKind, ActivityEventLevel, ActivityInstallTarget, ActivityItem,
    ActivityOperation, ActivityRunConfig, ActivityStatus, ActivitySurface, ActivityTargetScope,
    append_event, next_event_seq,
};
use mcs_core::model::{InstallResult, ItemInfo, ItemType, LinkMode};

use crate::dto::{InstallTargetDto, InstallTargetScopeDto, NpxSkillsCliConfigDto};
use crate::state::AppState;

pub fn install_target_to_activity(target: &InstallTargetDto) -> ActivityInstallTarget {
    ActivityInstallTarget {
        scope: match target.scope {
            InstallTargetScopeDto::Global => ActivityTargetScope::Global,
            InstallTargetScopeDto::Project => ActivityTargetScope::Project,
        },
        project_path: target.project_path.clone(),
    }
}

pub fn activity_status_from_counts(success_count: usize, failure_count: usize) -> ActivityStatus {
    match (success_count, failure_count) {
        (_, 0) => ActivityStatus::Success,
        (0, _) => ActivityStatus::Error,
        _ => ActivityStatus::Warning,
    }
}

pub fn item_path_lookup(items: Vec<ItemInfo>) -> HashMap<String, (String, String)> {
    items
        .into_iter()
        .map(|item| {
            (
                item.name,
                (
                    item.source_path.to_string_lossy().into_owned(),
                    item.target_path.to_string_lossy().into_owned(),
                ),
            )
        })
        .collect()
}

pub fn local_activity_items(
    item_type: ItemType,
    results: &[(InstallResult, u64)],
    path_lookup: &HashMap<String, (String, String)>,
) -> Vec<ActivityItem> {
    results
        .iter()
        .map(|(result, duration_ms)| {
            let paths = path_lookup.get(&result.item_name);
            ActivityItem {
                label: result.item_name.clone(),
                item_type,
                success: result.success,
                message: result.message.clone(),
                error: result.error.clone(),
                output: None,
                duration_ms: *duration_ms,
                source_path: paths.map(|value| value.0.clone()),
                target_path: paths.map(|value| value.1.clone()),
                package_ref: None,
                skill_flags: Vec::new(),
            }
        })
        .collect()
}

pub fn local_link_mode_config(link_mode: LinkMode) -> Option<ActivityRunConfig> {
    Some(ActivityRunConfig {
        link_mode: Some(link_mode),
        ..ActivityRunConfig::default()
    })
}

pub fn npx_run_config(config: &NpxSkillsCliConfigDto) -> Option<ActivityRunConfig> {
    let run_config = ActivityRunConfig {
        agents: config.agents.clone(),
        cli_mode: Some(match config.cli_mode {
            crate::dto::NpxSkillsCliMode::Auto => "auto".to_string(),
            crate::dto::NpxSkillsCliMode::Npx => "npx".to_string(),
        }),
        ..ActivityRunConfig::default()
    };
    (!run_config.is_empty()).then_some(run_config)
}

pub fn current_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or_default()
}

/// Persist + broadcast an activity event. Failures to persist are logged as warnings;
/// broadcast failures (no subscribers) are silently ignored.
pub fn emit_activity_event(state: &AppState, event: ActivityEvent) {
    if let Err(error) = append_event(&event) {
        tracing::warn!(
            run_id = event.run_id.as_str(),
            seq = event.seq,
            kind = ?event.kind,
            error = %error,
            "Failed to persist activity event"
        );
    }
    state.broadcast_activity_event(event);
}

pub fn build_activity_event(
    run_id: &str,
    kind: ActivityEventKind,
    level: ActivityEventLevel,
    surface: ActivitySurface,
    platform_id: Option<String>,
    operation: Option<ActivityOperation>,
    payload: serde_json::Value,
) -> ActivityEvent {
    ActivityEvent {
        run_id: run_id.to_string(),
        seq: next_event_seq(),
        ts_ms: current_time_ms(),
        kind,
        level,
        surface,
        platform_id,
        operation,
        payload,
    }
}
