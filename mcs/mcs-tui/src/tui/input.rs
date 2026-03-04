use crate::tui::actions::{self, AppAction};
use crate::tui::state::{
    AppState, ConfirmAction, ContentTab, FocusTarget, InstallMode, NotificationLevel, PopupKind,
    Screen,
};
use crossterm::event::{KeyCode, KeyEvent};
use mcs_core::config::platform::platform_displays;

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
        KeyCode::Char('d') => {
            state.refresh_dashboard();
            state.screen = Screen::Dashboard;
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
                    apply_category_from_cursor(state);
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
                    apply_category_from_cursor(state);
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
        // Sidebar: select category (Enter is now redundant but kept for UX)
        KeyCode::Enter if state.focus == FocusTarget::Sidebar => {
            apply_category_from_cursor(state);
        }
        // Toggle Skills/Commands
        KeyCode::Char('1') => switch_tab(state, ContentTab::Skills),
        KeyCode::Char('2') => switch_tab(state, ContentTab::Commands),
        // Selection
        KeyCode::Char(' ') if state.focus == FocusTarget::ItemList => {
            if let Some(&idx) = filtered.get(state.cursor)
                && !state.selected_indices.remove(&idx)
            {
                state.selected_indices.insert(idx);
            }
        }
        KeyCode::Char('a') => {
            if state.selected_indices.len() == filtered_len {
                state.selected_indices.clear();
            } else {
                state.selected_indices = filtered.into_iter().collect();
            }
        }
        // Install / Reinstall
        KeyCode::Char('i') | KeyCode::Char('r') => {
            let items = state.selected_names();
            if !items.is_empty() {
                state.popup = Some(PopupKind::Install {
                    items,
                    mode: InstallMode::Global,
                    link_mode: mcs_core::model::LinkMode::Auto,
                    path_input: String::new(),
                });
            }
        }
        KeyCode::Enter if state.focus == FocusTarget::ItemList => {
            if let Some(name) = state.focused_name() {
                state.popup = Some(PopupKind::Install {
                    items: vec![name],
                    mode: InstallMode::Global,
                    link_mode: mcs_core::model::LinkMode::Auto,
                    path_input: String::new(),
                });
            }
        }
        // Uninstall
        KeyCode::Char('u') => {
            if let Some(name) = state.focused_name() {
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
            let items = state.selected_names();
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
            } else {
                state.push_notification(NotificationLevel::Info, "No outdated items");
            }
        }
        // Detail
        KeyCode::Char('d') => {
            let filtered = state.filtered_indices();
            if let Some(&idx) = filtered.get(state.cursor) {
                state.popup_scroll = 0;
                state.popup = Some(PopupKind::Detail { item_index: idx });
            }
        }
        // Diff
        KeyCode::Char('D') => {
            let filtered = state.filtered_indices();
            if let Some(&idx) = filtered.get(state.cursor) {
                state.popup_scroll = 0;
                if let Some(item) = state.active_items().get(idx) {
                    let installed = item.is_installed();
                    let (diff_text, load_error) = if installed {
                        match crate::tui::popups::diff_modal::compute_diff_for_item(item) {
                            Ok(text) => (text, None),
                            Err(e) => (String::new(), Some(e)),
                        }
                    } else {
                        (String::new(), None)
                    };
                    state.popup = Some(PopupKind::Diff {
                        item_index: idx,
                        installed,
                        diff_text,
                        load_error,
                    });
                }
            }
        }
        // Search
        KeyCode::Char('/') => {
            state.focus = FocusTarget::SearchInput;
        }
        // Status filter cycle
        KeyCode::Char('s') => {
            state.status_filter = match state.status_filter {
                None => Some(mcs_core::model::InstallStatus::Installed),
                Some(mcs_core::model::InstallStatus::Installed) => {
                    Some(mcs_core::model::InstallStatus::Outdated)
                }
                Some(mcs_core::model::InstallStatus::Outdated) => {
                    Some(mcs_core::model::InstallStatus::NotInstalled)
                }
                Some(mcs_core::model::InstallStatus::NotInstalled) => None,
            };
            state.cursor = 0;
        }
        // Prompt management
        KeyCode::Char('p') => {
            if let Some(platform) = state.current_platform() {
                if mcs_core::core::prompt::supports_prompt(platform) {
                    let (has_diff, diff_text) =
                        mcs_core::core::prompt::prompt_diff(&state.project_root, platform);
                    state.popup_scroll = 0;
                    state.popup = Some(PopupKind::Prompt {
                        has_diff,
                        diff_text,
                    });
                } else {
                    state.push_notification(
                        NotificationLevel::Warning,
                        "Prompt management only supports Claude",
                    );
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
                cursor: 0,
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

fn apply_category_from_cursor(state: &mut AppState) {
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

fn switch_tab(state: &mut AppState, tab: ContentTab) {
    if state.active_tab == tab {
        return;
    }
    state.active_tab = tab;
    state.cursor = 0;
    state.category_cursor = 0;
    state.selected_category = None;
    state.selected_indices.clear();
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
        KeyCode::Esc => state.screen = Screen::PlatformSelect,
        KeyCode::Char('q') => state.quit = true,
        _ => {}
    }
}

pub fn handle_popup_key(state: &mut AppState, key: KeyEvent) {
    let Some(ref popup) = state.popup else { return };

    // Unified scroll handling for scrollable popups
    if matches!(
        popup,
        PopupKind::Detail { .. } | PopupKind::Diff { .. } | PopupKind::Prompt { .. }
    ) {
        match key.code {
            KeyCode::Char('j') | KeyCode::Down => {
                state.popup_scroll = state.popup_scroll.saturating_add(1);
                return;
            }
            KeyCode::Char('k') | KeyCode::Up => {
                state.popup_scroll = state.popup_scroll.saturating_sub(1);
                return;
            }
            KeyCode::PageDown => {
                state.popup_scroll = state.popup_scroll.saturating_add(10);
                return;
            }
            KeyCode::PageUp => {
                state.popup_scroll = state.popup_scroll.saturating_sub(10);
                return;
            }
            _ => {}
        }
    }

    match popup {
        PopupKind::Install {
            items,
            mode,
            link_mode,
            path_input,
        } => {
            let items = items.clone();
            let mode = *mode;
            let link_mode = *link_mode;
            let path_input = path_input.clone();
            match key.code {
                KeyCode::Esc => state.popup = None,
                KeyCode::Enter => {
                    let accepted = dispatch_and_notify(
                        state,
                        AppAction::InstallBatch {
                            names: items,
                            tab: state.active_tab,
                            mode,
                            link_mode,
                            path_input,
                        },
                    );
                    if accepted {
                        state.popup = None;
                    }
                }
                KeyCode::Up => {
                    set_install_popup(state, items, InstallMode::Global, link_mode, path_input);
                }
                KeyCode::Down => {
                    set_install_popup(state, items, InstallMode::Directory, link_mode, path_input);
                }
                KeyCode::Tab => {
                    let new_mode = match mode {
                        InstallMode::Global => InstallMode::Directory,
                        InstallMode::Directory => InstallMode::Global,
                    };
                    set_install_popup(state, items, new_mode, link_mode, path_input);
                }
                KeyCode::Char('l') | KeyCode::Char('L') => {
                    let new_link_mode = match link_mode {
                        mcs_core::model::LinkMode::Auto => mcs_core::model::LinkMode::Symlink,
                        mcs_core::model::LinkMode::Symlink => mcs_core::model::LinkMode::Copy,
                        mcs_core::model::LinkMode::Copy => mcs_core::model::LinkMode::Auto,
                    };
                    set_install_popup(state, items, mode, new_link_mode, path_input);
                }
                KeyCode::Char(c) if mode == InstallMode::Directory => {
                    let mut p = path_input;
                    p.push(c);
                    set_install_popup(state, items, mode, link_mode, p);
                }
                KeyCode::Backspace if mode == InstallMode::Directory => {
                    let mut p = path_input;
                    p.pop();
                    set_install_popup(state, items, mode, link_mode, p);
                }
                _ => {}
            }
        }
        PopupKind::Confirm { items, action, .. } => {
            let items = items.clone();
            let action = *action;
            match key.code {
                KeyCode::Esc | KeyCode::Char('n') => state.popup = None,
                KeyCode::Enter | KeyCode::Char('y') => {
                    let accepted = match action {
                        ConfirmAction::Uninstall | ConfirmAction::BatchUninstall => {
                            dispatch_and_notify(
                                state,
                                AppAction::UninstallBatch {
                                    names: items,
                                    tab: state.active_tab,
                                },
                            )
                        }
                        ConfirmAction::UpdateOutdated => dispatch_and_notify(
                            state,
                            AppAction::InstallBatch {
                                names: items,
                                tab: state.active_tab,
                                mode: InstallMode::Global,
                                link_mode: mcs_core::model::LinkMode::Auto,
                                path_input: String::new(),
                            },
                        ),
                    };
                    if accepted {
                        state.popup = None;
                    }
                }
                _ => {}
            }
        }
        PopupKind::Prompt { has_diff, .. } => {
            let has_diff = *has_diff;
            match key.code {
                KeyCode::Esc => state.popup = None,
                KeyCode::Enter if has_diff => {
                    let accepted = dispatch_and_notify(state, AppAction::PromptUpdate);
                    if accepted {
                        state.popup = None;
                    }
                }
                _ => {}
            }
        }
        PopupKind::MultiSync {
            selected_platforms,
            cursor,
        } => {
            let selected_platforms = selected_platforms.clone();
            let cursor = *cursor;
            let mut names: Vec<String> = state.platforms.keys().cloned().collect();
            names.sort();
            match key.code {
                KeyCode::Esc => state.popup = None,
                KeyCode::Up | KeyCode::Char('k') => {
                    state.popup = Some(PopupKind::MultiSync {
                        selected_platforms,
                        cursor: cursor.saturating_sub(1),
                    });
                }
                KeyCode::Down | KeyCode::Char('j') => {
                    let max_idx = names.len().saturating_sub(1);
                    state.popup = Some(PopupKind::MultiSync {
                        selected_platforms,
                        cursor: if cursor < max_idx { cursor + 1 } else { cursor },
                    });
                }
                KeyCode::Char(' ') => {
                    let mut selected = selected_platforms;
                    if let Some(name) = names.get(cursor)
                        && !selected.remove(name)
                    {
                        selected.insert(name.clone());
                    }
                    state.popup = Some(PopupKind::MultiSync {
                        selected_platforms: selected,
                        cursor,
                    });
                }
                KeyCode::Enter => {
                    let mut items = state.selected_names();
                    if items.is_empty()
                        && let Some(name) = state.focused_name()
                    {
                        items.push(name);
                    }
                    let accepted = dispatch_and_notify(
                        state,
                        AppAction::MultiSync {
                            platform_names: selected_platforms,
                            items,
                            tab: state.active_tab,
                        },
                    );
                    if accepted {
                        state.popup = None;
                    }
                }
                _ => {}
            }
        }
        PopupKind::Detail { .. } | PopupKind::Diff { .. } => {
            if key.code == KeyCode::Esc {
                state.popup = None;
            }
        }
        PopupKind::PlatformConfig => {
            if key.code == KeyCode::Esc {
                state.popup = None;
            }
        }
    }
}

fn dispatch_and_notify(state: &mut AppState, action: AppAction) -> bool {
    let result = actions::dispatch(state, action);
    state.push_notification(result.level, result.message);
    result.accepted
}

fn set_install_popup(
    state: &mut AppState,
    items: Vec<String>,
    mode: InstallMode,
    link_mode: mcs_core::model::LinkMode,
    path_input: String,
) {
    state.popup = Some(PopupKind::Install {
        items,
        mode,
        link_mode,
        path_input,
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use mcs_core::config::platform::default_platforms;
    use mcs_core::model::{InstallStatus, ItemInfo, ItemType};
    use std::path::PathBuf;

    fn make_state() -> AppState {
        let mut state = AppState::new(PathBuf::from("."), default_platforms());
        state.screen = Screen::Main;
        state.platform = Some("claude".into());
        state.skills = vec![ItemInfo {
            name: "demo".into(),
            item_type: ItemType::Skill,
            description: Some("demo".into()),
            status: InstallStatus::NotInstalled,
            source_path: PathBuf::from("skills/demo"),
            target_path: PathBuf::from("~/.claude/skills/demo"),
            source_mtime: None,
            target_mtime: None,
            source_mtime_ms: None,
            target_mtime_ms: None,
            category: Some("general".into()),
            tags: vec![],
            is_default: true,
        }];
        state.focus = FocusTarget::ItemList;
        state
    }

    #[test]
    fn platform_select_d_opens_dashboard() {
        let mut state = AppState::new(PathBuf::from("."), default_platforms());
        handle_platform_select_key(
            &mut state,
            KeyEvent::from(crossterm::event::KeyCode::Char('d')),
        );
        assert_eq!(state.screen, Screen::Dashboard);
    }

    #[test]
    fn switch_tab_clears_selected_indices() {
        let mut state = make_state();
        state.selected_indices.insert(0);
        handle_main_key(
            &mut state,
            KeyEvent::from(crossterm::event::KeyCode::Char('2')),
        );
        assert!(state.selected_indices.is_empty());
        assert_eq!(state.active_tab, ContentTab::Commands);
    }

    #[test]
    fn multisync_space_toggles_current_platform() {
        let mut state = make_state();
        state.popup = Some(PopupKind::MultiSync {
            selected_platforms: std::collections::HashSet::new(),
            cursor: 0,
        });
        handle_popup_key(
            &mut state,
            KeyEvent::from(crossterm::event::KeyCode::Char(' ')),
        );
        if let Some(PopupKind::MultiSync {
            selected_platforms, ..
        }) = &state.popup
        {
            assert_eq!(selected_platforms.len(), 1);
        } else {
            panic!("expected multisync popup");
        }
    }
}
