use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use crate::tui::state::{
    AppState, BatchTask, BatchTaskKind, ContentTab, InstallMode, NotificationLevel, PendingBatch,
};
use mcs_core::config::platform::PlatformConfig;
use mcs_core::core::install_target::{
    InstallTarget, InstallTargetAccessMode, InstallTargetScope, resolve_target_platform,
};
use mcs_core::model::{ItemType, LinkMode};

#[derive(Debug, Clone)]
pub enum AppAction {
    InstallBatch {
        names: Vec<String>,
        tab: ContentTab,
        mode: InstallMode,
        link_mode: LinkMode,
        path_input: String,
    },
    UninstallBatch {
        names: Vec<String>,
        tab: ContentTab,
    },
    PromptUpdate,
    MultiSync {
        platform_names: HashSet<String>,
        items: Vec<String>,
        tab: ContentTab,
    },
}

#[derive(Debug, Clone)]
pub struct ActionResult {
    pub accepted: bool,
    pub level: NotificationLevel,
    pub message: String,
}

pub fn dispatch(state: &mut AppState, action: AppAction) -> ActionResult {
    match action {
        AppAction::InstallBatch {
            names,
            tab,
            mode,
            link_mode,
            path_input,
        } => dispatch_install_batch(state, names, tab, mode, link_mode, &path_input),
        AppAction::UninstallBatch { names, tab } => dispatch_uninstall_batch(state, names, tab),
        AppAction::PromptUpdate => dispatch_prompt_update(state),
        AppAction::MultiSync {
            platform_names,
            items,
            tab,
        } => dispatch_multi_sync(state, platform_names, items, tab),
    }
}

fn dispatch_install_batch(
    state: &mut AppState,
    names: Vec<String>,
    tab: ContentTab,
    mode: InstallMode,
    link_mode: LinkMode,
    path_input: &str,
) -> ActionResult {
    if names.is_empty() {
        return ActionResult {
            accepted: false,
            level: NotificationLevel::Warning,
            message: "No items selected".into(),
        };
    }
    let item_type = item_type_for_tab(tab);

    let mut platform = match state.current_platform().cloned() {
        Some(p) => p,
        None => {
            return ActionResult {
                accepted: false,
                level: NotificationLevel::Error,
                message: "No platform selected".into(),
            };
        }
    };

    if mode == InstallMode::Directory {
        let resolved = match resolve_target_platform(
            &platform,
            &InstallTarget {
                scope: InstallTargetScope::Project,
                project_path: Some(path_input.to_string()),
            },
            InstallTargetAccessMode::Write,
        ) {
            Ok(result) => result,
            Err(msg) => {
                return ActionResult {
                    accepted: false,
                    level: NotificationLevel::Error,
                    message: msg,
                };
            }
        };
        platform = resolved.platform;
    }

    let mut tasks = Vec::with_capacity(names.len());
    for name in names {
        tasks.push(BatchTask {
            label: format!("Install {name}"),
            kind: BatchTaskKind::Install {
                platform: platform.clone(),
                name,
                item_type,
                link_mode,
            },
        });
    }

    enqueue_batch(state, "Install", tasks, true)
}

fn dispatch_uninstall_batch(
    state: &mut AppState,
    names: Vec<String>,
    tab: ContentTab,
) -> ActionResult {
    if names.is_empty() {
        return ActionResult {
            accepted: false,
            level: NotificationLevel::Warning,
            message: "No items selected".into(),
        };
    }
    let item_type = item_type_for_tab(tab);
    let platform = match state.current_platform().cloned() {
        Some(p) => p,
        None => {
            return ActionResult {
                accepted: false,
                level: NotificationLevel::Error,
                message: "No platform selected".into(),
            };
        }
    };

    let mut tasks = Vec::with_capacity(names.len());
    for name in names {
        tasks.push(BatchTask {
            label: format!("Uninstall {name}"),
            kind: BatchTaskKind::Uninstall {
                platform: platform.clone(),
                name,
                item_type,
            },
        });
    }
    enqueue_batch(state, "Uninstall", tasks, true)
}

fn dispatch_prompt_update(state: &mut AppState) -> ActionResult {
    let platform = match state.current_platform().cloned() {
        Some(p) => p,
        None => {
            return ActionResult {
                accepted: false,
                level: NotificationLevel::Error,
                message: "No platform selected".into(),
            };
        }
    };
    if !mcs_core::core::prompt::supports_prompt(&platform) {
        return ActionResult {
            accepted: false,
            level: NotificationLevel::Warning,
            message: "Guidance management is not configured for this platform".into(),
        };
    }

    let task = BatchTask {
        label: "Update guidance".into(),
        kind: BatchTaskKind::PromptUpdate { platform },
    };
    enqueue_batch(state, "Guidance Update", vec![task], false)
}

fn dispatch_multi_sync(
    state: &mut AppState,
    platform_names: HashSet<String>,
    items: Vec<String>,
    tab: ContentTab,
) -> ActionResult {
    if platform_names.is_empty() {
        return ActionResult {
            accepted: false,
            level: NotificationLevel::Warning,
            message: "No target platforms selected".into(),
        };
    }
    if items.is_empty() {
        return ActionResult {
            accepted: false,
            level: NotificationLevel::Warning,
            message: "No items selected for multi-sync".into(),
        };
    }

    let item_type = item_type_for_tab(tab);
    let mut names: Vec<String> = platform_names.into_iter().collect();
    names.sort();

    let mut tasks = Vec::new();
    let mut dedupe_keys: HashMap<String, String> = HashMap::new();
    let mut reused_messages = Vec::new();
    for platform_name in names {
        let Some(platform) = state.platforms.get(&platform_name).cloned() else {
            continue;
        };
        for item in &items {
            if item_type == ItemType::Skill {
                let key = dedupe_skill_install_key(&platform, item);
                if let Some(source_platform) = dedupe_keys.get(&key) {
                    reused_messages.push(format!(
                        "{item} → {platform_name} (reused from {source_platform})"
                    ));
                    continue;
                }
                dedupe_keys.insert(key, platform_name.clone());
            }
            tasks.push(BatchTask {
                label: format!("Sync {item} → {platform_name}"),
                kind: BatchTaskKind::Install {
                    platform: platform.clone(),
                    name: item.clone(),
                    item_type,
                    link_mode: LinkMode::Auto,
                },
            });
        }
    }

    if tasks.is_empty() {
        return ActionResult {
            accepted: false,
            level: NotificationLevel::Error,
            message: "No valid sync tasks generated".into(),
        };
    }

    let mut result = enqueue_batch(state, "Multi-Sync", tasks, true);
    if result.accepted && !reused_messages.is_empty() {
        state.push_notification(
            NotificationLevel::Info,
            format!(
                "Reused {} shared-path install(s) in this multi-sync run",
                reused_messages.len()
            ),
        );
        for msg in reused_messages.iter().take(3) {
            state.push_notification(NotificationLevel::Info, format!("Reused: {msg}"));
        }
        result.message = format!("{} ({} reused)", result.message, reused_messages.len());
    }
    result
}

fn enqueue_batch(
    state: &mut AppState,
    label: &str,
    tasks: Vec<BatchTask>,
    reload_after: bool,
) -> ActionResult {
    let total = tasks.len();
    state.pending_batch = Some(PendingBatch {
        label: label.into(),
        tasks,
        current: 0,
        success: 0,
        failures: Vec::new(),
        reload_after,
    });
    state.progress = Some(crate::tui::state::ProgressState {
        current: 0,
        total,
        label: label.into(),
        success: 0,
        failed: 0,
    });
    ActionResult {
        accepted: true,
        level: NotificationLevel::Info,
        message: format!("{label} queued: {total} task(s)"),
    }
}

pub fn process_next_batch_task(state: &mut AppState) {
    let Some(mut batch) = state.pending_batch.take() else {
        return;
    };
    if batch.current >= batch.tasks.len() {
        finalize_batch(state, batch);
        return;
    }

    let task = batch.tasks[batch.current].clone();
    let result = execute_task(state, &task);
    if result.success {
        batch.success += 1;
    } else {
        let error = result
            .error
            .unwrap_or_else(|| String::from("unknown error"));
        batch
            .failures
            .push(format!("{}: {}", task.label, error.trim()));
    }
    batch.current += 1;

    state.progress = Some(crate::tui::state::ProgressState {
        current: batch.current,
        total: batch.tasks.len(),
        label: batch.label.clone(),
        success: batch.success,
        failed: batch.failures.len(),
    });

    if batch.current >= batch.tasks.len() {
        finalize_batch(state, batch);
    } else {
        state.pending_batch = Some(batch);
    }
}

fn finalize_batch(state: &mut AppState, batch: PendingBatch) {
    let total = batch.tasks.len();
    let failed = batch.failures.len();
    let success = batch.success;

    let level = if failed == 0 {
        NotificationLevel::Success
    } else if success == 0 {
        NotificationLevel::Error
    } else {
        NotificationLevel::Warning
    };

    state.push_notification(
        level,
        format!("{} finished: {success}/{total} succeeded", batch.label),
    );

    if !batch.failures.is_empty() {
        for fail in batch.failures.iter().take(3) {
            state.push_notification(NotificationLevel::Error, fail.clone());
        }
        if batch.failures.len() > 3 {
            state.push_notification(
                NotificationLevel::Warning,
                format!("... and {} more failures", batch.failures.len() - 3),
            );
        }
    }

    if batch.reload_after {
        state.reload_items();
    }
    state.pending_batch = None;
    state.progress = None;
}

fn execute_task(state: &AppState, task: &BatchTask) -> mcs_core::model::InstallResult {
    match &task.kind {
        BatchTaskKind::Install {
            platform,
            name,
            item_type,
            link_mode,
        } => mcs_core::core::installer::install_item(
            &state.project_root,
            platform,
            name,
            *item_type,
            *link_mode,
        ),
        BatchTaskKind::Uninstall {
            platform,
            name,
            item_type,
        } => mcs_core::core::installer::uninstall_item(
            &state.project_root,
            platform,
            name,
            *item_type,
        ),
        BatchTaskKind::PromptUpdate { platform } => {
            mcs_core::core::prompt::prompt_update(&state.project_root, platform)
        }
    }
}

fn item_type_for_tab(tab: ContentTab) -> ItemType {
    match tab {
        ContentTab::Skills => ItemType::Skill,
        ContentTab::Commands => ItemType::Command,
        ContentTab::Agents => ItemType::Agent,
    }
}

fn dedupe_skill_install_key(platform: &PlatformConfig, item_name: &str) -> String {
    let item_path = PathBuf::from(item_name.replace('/', std::path::MAIN_SEPARATOR_STR));
    let target = platform.skills_path().join(item_path);
    normalize_path_key(&target)
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
