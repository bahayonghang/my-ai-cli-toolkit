use std::path::PathBuf;

use crate::config::platform::platform_displays;
use crate::tui::state::{
    AppState, ConfirmAction, ContentTab, FocusTarget, InstallMode, PopupKind, Screen,
};
use crossterm::event::{KeyCode, KeyEvent};

pub fn handle_platform_select_key(state: &mut AppState, key: KeyEvent) {
    let count = platform_displays().len();
    match key.code {
        KeyCode::Up | KeyCode::Char('k') => {
            if state.platform_cursor > 0 {
                state.platform_cursor -= 1;
            }
        }
        KeyCode::Down | KeyCode::Char('j') => {
            if state.platform_cursor + 1 < count {
                state.platform_cursor += 1;
            }
        }
        KeyCode::Enter => {
            let displays = platform_displays();
            if let Some(d) = displays.get(state.platform_cursor) {
                state.platform = Some(d.id.to_string());
                state.load_items();
                state.screen = Screen::Main;
                state.focus = FocusTarget::ItemList;
            }
        }
        KeyCode::Char('q') | KeyCode::Esc => state.quit = true,
        _ => {}
    }
}

pub fn handle_main_key(state: &mut AppState, key: KeyEvent) {
    if state.focus == FocusTarget::SearchInput {
        handle_search_key(state, key);
        return;
    }

    let filtered = state.filtered_indices();
    let filtered_len = filtered.len();

    match key.code {
        // Navigation
        KeyCode::Up | KeyCode::Char('k') => {
            if state.focus == FocusTarget::Sidebar {
                if state.category_cursor > 0 {
                    state.category_cursor -= 1;
                }
            } else if state.cursor > 0 {
                state.cursor -= 1;
            }
        }
        KeyCode::Down | KeyCode::Char('j') => {
            if state.focus == FocusTarget::Sidebar {
                let cat_count = state.categories().len() + 1; // +1 for "All"
                if state.category_cursor + 1 < cat_count {
                    state.category_cursor += 1;
                }
            } else if state.cursor + 1 < filtered_len {
                state.cursor += 1;
            }
        }
        KeyCode::Tab => {
            state.focus = match state.focus {
                FocusTarget::Sidebar => FocusTarget::ItemList,
                FocusTarget::ItemList => FocusTarget::Sidebar,
                FocusTarget::SearchInput => FocusTarget::ItemList,
            };
        }
        // Sidebar: select category
        KeyCode::Enter if state.focus == FocusTarget::Sidebar => {
            if state.category_cursor == 0 {
                state.selected_category = None;
            } else {
                let cats = state.categories();
                if let Some((cat, _)) = cats.get(state.category_cursor - 1) {
                    state.selected_category = Some(cat.clone());
                }
            }
            state.cursor = 0;
        }
        // Toggle Skills/Commands
        KeyCode::Char('1') => {
            state.active_tab = ContentTab::Skills;
            state.cursor = 0;
            state.category_cursor = 0;
            state.selected_category = None;
        }
        KeyCode::Char('2') => {
            state.active_tab = ContentTab::Commands;
            state.cursor = 0;
            state.category_cursor = 0;
            state.selected_category = None;
        }
        // Selection
        KeyCode::Char(' ') if state.focus == FocusTarget::ItemList => {
            if let Some(&idx) = filtered.get(state.cursor) {
                if !state.selected_indices.remove(&idx) {
                    state.selected_indices.insert(idx);
                }
            }
        }
        KeyCode::Char('a') => {
            if state.selected_indices.len() == filtered_len {
                state.selected_indices.clear();
            } else {
                state.selected_indices = filtered.into_iter().collect();
            }
        }
        // Install
        KeyCode::Char('i') => {
            let items = selected_names(state);
            if !items.is_empty() {
                state.popup = Some(PopupKind::Install {
                    items,
                    mode: InstallMode::Global,
                    path_input: String::new(),
                });
            }
        }
        KeyCode::Enter if state.focus == FocusTarget::ItemList => {
            if let Some(name) = focused_name(state) {
                state.popup = Some(PopupKind::Install {
                    items: vec![name],
                    mode: InstallMode::Global,
                    path_input: String::new(),
                });
            }
        }
        // Uninstall
        KeyCode::Char('u') => {
            if let Some(name) = focused_name(state) {
                state.popup = Some(PopupKind::Confirm {
                    title: "Uninstall".into(),
                    message: format!("Uninstall {name}?"),
                    items: vec![name],
                    danger: true,
                    action: ConfirmAction::Uninstall,
                });
            }
        }
        KeyCode::Char('x') => {
            let items = selected_names(state);
            if !items.is_empty() {
                state.popup = Some(PopupKind::Confirm {
                    title: "Batch Uninstall".into(),
                    message: format!("Uninstall {} items?", items.len()),
                    items,
                    danger: true,
                    action: ConfirmAction::BatchUninstall,
                });
            }
        }
        // Update outdated
        KeyCode::Char('U') => {
            let items: Vec<String> = state
                .active_items()
                .iter()
                .filter(|i| i.needs_update())
                .map(|i| i.name.clone())
                .collect();
            if !items.is_empty() {
                state.popup = Some(PopupKind::Confirm {
                    title: "Update".into(),
                    message: format!("Update {} outdated items?", items.len()),
                    items,
                    danger: false,
                    action: ConfirmAction::UpdateOutdated,
                });
            }
        }
        // Detail
        KeyCode::Char('d') => {
            let filtered = state.filtered_indices();
            if let Some(&idx) = filtered.get(state.cursor) {
                state.popup = Some(PopupKind::Detail { item_index: idx });
            }
        }
        // Diff
        KeyCode::Char('D') => {
            let filtered = state.filtered_indices();
            if let Some(&idx) = filtered.get(state.cursor) {
                state.popup = Some(PopupKind::Diff { item_index: idx });
            }
        }
        // Search
        KeyCode::Char('/') => {
            state.focus = FocusTarget::SearchInput;
        }
        // Status filter cycle
        KeyCode::Char('s') => {
            state.status_filter = match state.status_filter {
                None => Some(crate::model::InstallStatus::Installed),
                Some(crate::model::InstallStatus::Installed) => {
                    Some(crate::model::InstallStatus::Outdated)
                }
                Some(crate::model::InstallStatus::Outdated) => {
                    Some(crate::model::InstallStatus::NotInstalled)
                }
                Some(crate::model::InstallStatus::NotInstalled) => None,
            };
            state.cursor = 0;
        }
        // Prompt management
        KeyCode::Char('p') => {
            if let Some(platform) = state.current_platform() {
                if crate::core::prompt::supports_prompt(platform) {
                    let (has_diff, diff_text) =
                        crate::core::prompt::prompt_diff(&state.project_root, platform);
                    state.popup = Some(PopupKind::Prompt {
                        has_diff,
                        diff_text,
                    });
                }
            }
        }
        // Platform config
        KeyCode::Char('P') => {
            state.popup = Some(PopupKind::PlatformConfig);
        }
        // Multi-platform sync
        KeyCode::Char('S') => {
            state.popup = Some(PopupKind::MultiSync {
                selected_platforms: std::collections::HashSet::new(),
            });
        }
        // Back to platform select
        KeyCode::Esc => {
            state.screen = Screen::PlatformSelect;
        }
        KeyCode::Char('q') => state.quit = true,
        _ => {}
    }
}

fn handle_search_key(state: &mut AppState, key: KeyEvent) {
    match key.code {
        KeyCode::Esc | KeyCode::Enter => {
            state.focus = FocusTarget::ItemList;
        }
        KeyCode::Backspace => {
            state.search_query.pop();
            state.cursor = 0;
        }
        KeyCode::Char(c) => {
            state.search_query.push(c);
            state.cursor = 0;
        }
        _ => {}
    }
}

pub fn handle_dashboard_key(state: &mut AppState, key: KeyEvent) {
    match key.code {
        KeyCode::Esc | KeyCode::Char('q') => state.screen = Screen::PlatformSelect,
        _ => {}
    }
}

pub fn handle_popup_key(state: &mut AppState, key: KeyEvent) {
    let popup = state.popup.clone();
    let Some(popup) = popup else { return };

    match popup {
        PopupKind::Install {
            ref items,
            ref mode,
            ref path_input,
        } => {
            match key.code {
                KeyCode::Esc => state.popup = None,
                KeyCode::Enter => {
                    if *mode == InstallMode::Directory && path_input.trim().is_empty() {
                        // Keep popup open until a project path is provided.
                        return;
                    }
                    // Execute install
                    let items_clone = items.clone();
                    let item_type = state.active_tab;
                    let install_mode = *mode;
                    let path_input_clone = path_input.clone();
                    state.popup = None;
                    execute_batch_install(
                        state,
                        &items_clone,
                        item_type,
                        install_mode,
                        &path_input_clone,
                    );
                }
                KeyCode::Up => {
                    set_install_popup(
                        state,
                        items.clone(),
                        InstallMode::Global,
                        path_input.clone(),
                    );
                }
                KeyCode::Down => {
                    set_install_popup(
                        state,
                        items.clone(),
                        InstallMode::Directory,
                        path_input.clone(),
                    );
                }
                KeyCode::Tab => {
                    let new_mode = match mode {
                        InstallMode::Global => InstallMode::Directory,
                        InstallMode::Directory => InstallMode::Global,
                    };
                    set_install_popup(state, items.clone(), new_mode, path_input.clone());
                }
                KeyCode::Char(c) if *mode == InstallMode::Directory => {
                    let mut p = path_input.clone();
                    p.push(c);
                    set_install_popup(state, items.clone(), *mode, p);
                }
                KeyCode::Backspace if *mode == InstallMode::Directory => {
                    let mut p = path_input.clone();
                    p.pop();
                    set_install_popup(state, items.clone(), *mode, p);
                }
                _ => {}
            }
        }
        PopupKind::Confirm {
            ref items,
            ref action,
            ..
        } => match key.code {
            KeyCode::Esc | KeyCode::Char('n') => state.popup = None,
            KeyCode::Enter | KeyCode::Char('y') => {
                let items_clone = items.clone();
                let action = *action;
                let item_type = state.active_tab;
                state.popup = None;
                match action {
                    ConfirmAction::Uninstall | ConfirmAction::BatchUninstall => {
                        execute_batch_uninstall(state, &items_clone, item_type)
                    }
                    ConfirmAction::UpdateOutdated => execute_batch_install(
                        state,
                        &items_clone,
                        item_type,
                        InstallMode::Global,
                        "",
                    ),
                }
            }
            _ => {}
        },
        PopupKind::Prompt { has_diff, .. } => match key.code {
            KeyCode::Esc => state.popup = None,
            KeyCode::Enter if has_diff => {
                if let Some(platform) = state.current_platform().cloned() {
                    crate::core::prompt::prompt_update(&state.project_root, &platform);
                }
                state.popup = None;
            }
            _ => {}
        },
        PopupKind::MultiSync {
            ref selected_platforms,
        } => {
            match key.code {
                KeyCode::Esc => state.popup = None,
                KeyCode::Char(' ') => {
                    // Toggle platform at cursor - simplified
                    state.popup = Some(PopupKind::MultiSync {
                        selected_platforms: selected_platforms.clone(),
                    });
                }
                KeyCode::Enter => {
                    // Execute multi-sync
                    state.popup = None;
                }
                _ => {}
            }
        }
        _ => {
            // Detail, Diff, PlatformConfig: Esc to close
            if key.code == KeyCode::Esc {
                state.popup = None;
            }
        }
    }
}

fn set_install_popup(
    state: &mut AppState,
    items: Vec<String>,
    mode: InstallMode,
    path_input: String,
) {
    state.popup = Some(PopupKind::Install {
        items,
        mode,
        path_input,
    });
}

fn selected_names(state: &AppState) -> Vec<String> {
    let items = state.active_items();
    let mut names: Vec<String> = state
        .selected_indices
        .iter()
        .filter_map(|&i| items.get(i).map(|item| item.name.clone()))
        .collect();
    names.sort_unstable();
    names
}

fn focused_name(state: &AppState) -> Option<String> {
    let filtered = state.filtered_indices();
    filtered
        .get(state.cursor)
        .and_then(|&i| state.active_items().get(i).map(|item| item.name.clone()))
}

fn execute_batch_install(
    state: &mut AppState,
    names: &[String],
    tab: ContentTab,
    mode: InstallMode,
    path_input: &str,
) {
    let item_type = match tab {
        ContentTab::Skills => crate::model::ItemType::Skill,
        ContentTab::Commands => crate::model::ItemType::Command,
    };
    let mut platform = match state.current_platform().cloned() {
        Some(p) => p,
        None => return,
    };
    if mode == InstallMode::Directory {
        let project_path = path_input.trim();
        if project_path.is_empty() {
            return;
        }
        platform = project_platform_for_directory(&platform, project_path);
    }
    for name in names {
        crate::core::installer::install_item(&state.project_root, &platform, name, item_type);
    }
    state.reload_items();
}

fn execute_batch_uninstall(state: &mut AppState, names: &[String], tab: ContentTab) {
    let item_type = match tab {
        ContentTab::Skills => crate::model::ItemType::Skill,
        ContentTab::Commands => crate::model::ItemType::Command,
    };
    let platform = match state.current_platform().cloned() {
        Some(p) => p,
        None => return,
    };
    for name in names {
        crate::core::installer::uninstall_item(&state.project_root, &platform, name, item_type);
    }
    state.reload_items();
}

fn project_platform_for_directory(
    platform: &crate::config::platform::PlatformConfig,
    project_path: &str,
) -> crate::config::platform::PlatformConfig {
    let mut project_platform = platform.clone();
    let platform_dir = project_platform_dir(&platform.name);
    let base_dir = PathBuf::from(project_path).join(platform_dir);
    project_platform.base_dir = base_dir.to_string_lossy().to_string();
    project_platform
}

fn project_platform_dir(platform_name: &str) -> String {
    match platform_name {
        "opencode" => ".opencode".to_string(),
        "antigravity" => ".gemini/antigravity".to_string(),
        "windsurf" => ".codeium/windsurf".to_string(),
        _ => format!(".{platform_name}"),
    }
}
