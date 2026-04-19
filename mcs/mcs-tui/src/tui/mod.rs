pub mod actions;
pub mod input;
pub mod popups;
pub mod screens;
pub mod state;
pub mod style_system;
pub mod theme;
pub mod widgets;

use std::path::PathBuf;
use std::time::Duration;

use crossterm::{
    event::{
        self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyEvent, KeyEventKind,
        KeyModifiers, MouseButton, MouseEvent, MouseEventKind,
    },
    execute,
    terminal::{EnterAlternateScreen, LeaveAlternateScreen, disable_raw_mode, enable_raw_mode},
};
use ratatui::prelude::*;

use mcs_core::config::platform::load_platforms;
use mcs_core::error::Result;
use state::AppState;

pub fn run(project_root: PathBuf) -> Result<()> {
    let platforms = load_platforms(&project_root);
    let mut state = AppState::new(project_root, platforms);
    for msg in theme::palette_contrast_warnings() {
        eprintln!("Warning: {msg}");
        state.push_notification(state::NotificationLevel::Warning, msg.clone());
    }

    // Terminal setup
    enable_raw_mode()?;
    let mut stdout = std::io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // Drop pending key events (e.g. shell Enter used to launch mcs.exe) so
    // startup doesn't immediately auto-select the first platform.
    drain_pending_events()?;

    let result = main_loop(&mut terminal, &mut state);

    // Terminal cleanup
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;

    result
}

fn drain_pending_events() -> Result<()> {
    // Keep bounded to avoid getting stuck if the terminal keeps producing events.
    const MAX_DRAIN_EVENTS: usize = 256;
    for _ in 0..MAX_DRAIN_EVENTS {
        if !event::poll(Duration::from_millis(0))? {
            break;
        }
        let _ = event::read()?;
    }
    Ok(())
}

fn main_loop(
    terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>,
    state: &mut AppState,
) -> Result<()> {
    loop {
        actions::process_next_batch_task(state);

        terminal.draw(|frame| {
            match state.screen {
                state::Screen::PlatformSelect => screens::platform_select::draw(frame, state),
                state::Screen::Main => screens::main_screen::draw(frame, state),
                state::Screen::Dashboard => screens::dashboard::draw(frame, state),
            }
            if let Some(ref popup) = state.popup {
                popups::draw(frame, popup, state);
            }
        })?;

        if state.quit {
            break;
        }

        if event::poll(Duration::from_millis(30))? {
            match event::read()? {
                Event::Key(key) => {
                    if !is_actionable_key_event(&key) {
                        continue;
                    }
                    // Ctrl+C always quits
                    if key.modifiers.contains(KeyModifiers::CONTROL)
                        && key.code == KeyCode::Char('c')
                    {
                        break;
                    }
                    if state.popup.is_some() {
                        input::handle_popup_key(state, key);
                    } else {
                        match state.screen {
                            state::Screen::PlatformSelect => {
                                input::handle_platform_select_key(state, key)
                            }
                            state::Screen::Main => input::handle_main_key(state, key),
                            state::Screen::Dashboard => input::handle_dashboard_key(state, key),
                        }
                    }
                }
                Event::Mouse(mouse) if state.popup.is_none() => {
                    handle_mouse(state, mouse, terminal.size()?.into());
                }
                _ => {}
            }
        }
    }
    Ok(())
}

fn is_actionable_key_event(key: &KeyEvent) -> bool {
    is_actionable_key_kind(key.kind)
}

fn is_actionable_key_kind(kind: KeyEventKind) -> bool {
    matches!(kind, KeyEventKind::Press | KeyEventKind::Repeat)
}

fn handle_mouse(state: &mut AppState, mouse: MouseEvent, area: Rect) {
    if mouse.kind != MouseEventKind::Down(MouseButton::Left) {
        return;
    }
    let row = mouse.row;
    let col = mouse.column;

    match state.screen {
        state::Screen::PlatformSelect => {
            // Layout: title(3) + gap(1) = list starts at row 4
            let list_start = 4u16;
            let list_end = area.height.saturating_sub(1); // footer is last row
            if row >= list_start && row < list_end {
                let idx = (row - list_start) as usize;
                let count = mcs_core::config::platform::platform_displays().len();
                if idx < count {
                    state.platform_cursor = idx;
                    // Double-click feel: select on click
                    let displays = mcs_core::config::platform::platform_displays();
                    if let Some(d) = displays.get(idx) {
                        state.platform = Some(d.id.to_string());
                        state.load_items();
                        state.screen = state::Screen::Main;
                        state.focus = state::FocusTarget::ItemList;
                    }
                }
            }
        }
        state::Screen::Main => {
            let metrics = style_system::layout_metrics();
            let progress_height = if state.progress.is_some() {
                metrics.progress_height
            } else {
                0
            };
            let reserved_bottom = metrics.footer_height + progress_height;
            if row < metrics.header_height || row >= area.height.saturating_sub(reserved_bottom) {
                return; // header or footer/progress
            }
            if col < metrics.sidebar_width {
                // Sidebar click
                state.focus = state::FocusTarget::Sidebar;
                let sidebar_row = (row - metrics.header_height) as usize;
                // Row 0 = Skills tab, Row 1 = Commands tab, Row 2 = Agents tab
                if sidebar_row == 0 {
                    state.active_tab = state::ContentTab::Skills;
                    state.cursor = 0;
                    state.category_cursor = 0;
                    state.selected_category = None;
                    state.selected_indices.clear();
                } else if sidebar_row == 1 {
                    state.active_tab = state::ContentTab::Commands;
                    state.cursor = 0;
                    state.category_cursor = 0;
                    state.selected_category = None;
                    state.selected_indices.clear();
                } else if sidebar_row == 2 {
                    state.active_tab = state::ContentTab::Agents;
                    state.cursor = 0;
                    state.category_cursor = 0;
                    state.selected_category = None;
                    state.selected_indices.clear();
                } else if sidebar_row >= 4 {
                    let cats = state.categories();
                    if let Some(cat_idx) = sidebar_category_cursor_from_row(sidebar_row, &cats) {
                        state.category_cursor = cat_idx;
                        if cat_idx == 0 {
                            state.selected_category = None;
                        } else if let Some((cat, _)) = cats.get(cat_idx - 1) {
                            state.selected_category = Some(cat.clone());
                        }
                        state.cursor = 0;
                    }
                }
            } else {
                // Item list click
                let has_search = matches!(state.focus, state::FocusTarget::SearchInput)
                    || !state.search_query.is_empty();
                state.focus = state::FocusTarget::ItemList;
                let list_start = metrics.header_height + if has_search { 1 } else { 0 };
                if row < list_start {
                    return;
                }
                let list_row = (row - list_start) as usize;
                let filtered_len = state.filtered_indices().len();
                if list_row < filtered_len {
                    state.cursor = list_row;
                }
            }
        }
        state::Screen::Dashboard => {} // no mouse interaction needed
    }
}

fn sidebar_category_cursor_from_row(
    sidebar_row: usize,
    categories: &[(String, usize)],
) -> Option<usize> {
    let visual_row = sidebar_row.checked_sub(3)?;
    let visual_row = visual_row.checked_sub(1)?;
    let has_default = categories
        .first()
        .is_some_and(|(name, _)| name == "default");
    let logical_row = if has_default && visual_row >= 2 {
        if visual_row == 2 {
            return None; // separator row under default category
        }
        visual_row - 1
    } else {
        visual_row
    };

    let category_count = categories.len() + 1; // +1 for "All"
    (logical_row < category_count).then_some(logical_row)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tui::state::{ContentTab, PopupKind, Screen};
    use mcs_core::config::platform::default_platforms;
    use mcs_core::model::{InstallStatus, ItemInfo, ItemType};
    use ratatui::backend::TestBackend;
    use std::path::PathBuf;

    #[test]
    fn key_release_is_not_actionable() {
        assert!(!is_actionable_key_kind(KeyEventKind::Release));
    }

    #[test]
    fn key_press_and_repeat_are_actionable() {
        assert!(is_actionable_key_kind(KeyEventKind::Press));
        assert!(is_actionable_key_kind(KeyEventKind::Repeat));
    }

    fn render_state_for_smoke() -> AppState {
        let mut state = AppState::new(PathBuf::from("."), default_platforms());
        state.platform = Some("claude".into());
        state.active_tab = ContentTab::Skills;
        state.focus = state::FocusTarget::ItemList;
        state.skills.push(ItemInfo {
            name: "demo".into(),
            item_type: ItemType::Skill,
            description: Some("demo item for render test".into()),
            status: InstallStatus::NotInstalled,
            source_path: PathBuf::from("skills/demo"),
            target_path: PathBuf::from("~/.claude/skills/demo"),
            source_mtime: None,
            target_mtime: None,
            source_mtime_ms: None,
            target_mtime_ms: None,
            category: Some("default".into()),
            tags: vec!["test".into()],
            is_default: true,
        });
        state
    }

    fn backend_text(terminal: &Terminal<TestBackend>) -> String {
        let buffer = terminal.backend().buffer();
        let mut lines = Vec::new();
        for y in 0..buffer.area.height {
            let mut line = String::new();
            for x in 0..buffer.area.width {
                line.push_str(buffer[(x, y)].symbol());
            }
            lines.push(line);
        }
        lines.join("\n")
    }

    #[test]
    fn render_smoke_for_multiple_terminal_sizes() {
        for (w, h) in [(80, 24), (100, 30), (140, 40)] {
            let backend = TestBackend::new(w, h);
            let mut terminal = Terminal::new(backend).expect("terminal");
            let mut state = render_state_for_smoke();

            state.screen = Screen::PlatformSelect;
            terminal
                .draw(|frame| {
                    screens::platform_select::draw(frame, &state);
                })
                .expect("platform-select render");
            assert!(backend_text(&terminal).contains("Select Platform"));

            state.screen = Screen::Main;
            terminal
                .draw(|frame| {
                    screens::main_screen::draw(frame, &state);
                })
                .expect("main render");
            assert!(backend_text(&terminal).contains("MyClaude Skills"));

            state.screen = Screen::Dashboard;
            terminal
                .draw(|frame| {
                    screens::dashboard::draw(frame, &state);
                })
                .expect("dashboard render");
            assert!(backend_text(&terminal).contains("Dashboard"));

            state.screen = Screen::Main;
            state.popup_scroll = 0;
            state.popup = Some(PopupKind::Diff {
                item_index: 0,
                installed: false,
                diff_text: String::new(),
                load_error: None,
            });
            terminal
                .draw(|frame| {
                    screens::main_screen::draw(frame, &state);
                    if let Some(ref popup) = state.popup {
                        popups::draw(frame, popup, &state);
                    }
                })
                .expect("diff popup render");
            assert!(backend_text(&terminal).contains("Diff"));

            state.popup = Some(PopupKind::MultiSync {
                selected_platforms: std::collections::HashSet::new(),
                cursor: 0,
            });
            terminal
                .draw(|frame| {
                    screens::main_screen::draw(frame, &state);
                    if let Some(ref popup) = state.popup {
                        popups::draw(frame, popup, &state);
                    }
                })
                .expect("multi-sync popup render");
            assert!(backend_text(&terminal).contains("Multi-Platform Sync"));
        }
    }

    #[test]
    fn sidebar_row_mapping_skips_default_separator() {
        let categories = vec![("default".to_string(), 1), ("custom".to_string(), 2)];
        assert_eq!(
            sidebar_category_cursor_from_row(4, &categories),
            Some(0),
            "row for All category"
        );
        assert_eq!(
            sidebar_category_cursor_from_row(5, &categories),
            Some(1),
            "row for default category"
        );
        assert_eq!(
            sidebar_category_cursor_from_row(6, &categories),
            None,
            "separator row"
        );
        assert_eq!(
            sidebar_category_cursor_from_row(7, &categories),
            Some(2),
            "row for first non-default category"
        );
    }
}
