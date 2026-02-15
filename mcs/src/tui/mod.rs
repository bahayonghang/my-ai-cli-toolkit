pub mod input;
pub mod popups;
pub mod screens;
pub mod state;
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

use crate::config::platform::load_platforms;
use crate::error::Result;
use state::AppState;

pub fn run(project_root: PathBuf) -> Result<()> {
    let platforms = load_platforms(&project_root);
    let mut state = AppState::new(project_root, platforms);

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
        // Handle batch progress: install one item per tick
        if let Some(ref progress) = state.progress {
            if progress.current >= progress.total {
                state.progress = None;
                state.reload_items();
            }
        }

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

        match event::read()? {
            Event::Key(key) => {
                if !is_actionable_key_event(&key) {
                    continue;
                }
                // Ctrl+C always quits
                if key.modifiers.contains(KeyModifiers::CONTROL) && key.code == KeyCode::Char('c') {
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
            Event::Mouse(mouse) => {
                if state.popup.is_none() {
                    handle_mouse(state, mouse, terminal.size()?.into());
                }
            }
            _ => {}
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
                let count = crate::config::platform::platform_displays().len();
                if idx < count {
                    state.platform_cursor = idx;
                    // Double-click feel: select on click
                    let displays = crate::config::platform::platform_displays();
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
            // Header(1) + body, sidebar width = 24
            if row == 0 || row >= area.height.saturating_sub(1) {
                return; // header or footer
            }
            if col < 24 {
                // Sidebar click
                state.focus = state::FocusTarget::Sidebar;
                let sidebar_row = (row - 1) as usize; // -1 for header
                // Row 0 = Skills tab, Row 1 = Commands tab
                if sidebar_row == 0 {
                    state.active_tab = state::ContentTab::Skills;
                    state.cursor = 0;
                    state.category_cursor = 0;
                    state.selected_category = None;
                } else if sidebar_row == 1 {
                    state.active_tab = state::ContentTab::Commands;
                    state.cursor = 0;
                    state.category_cursor = 0;
                    state.selected_category = None;
                } else if sidebar_row >= 3 {
                    let cat_idx = sidebar_row - 3;
                    let cat_count = state.categories().len() + 1;
                    if cat_idx < cat_count {
                        state.category_cursor = cat_idx;
                        // Apply category selection
                        if cat_idx == 0 {
                            state.selected_category = None;
                        } else {
                            let cats = state.categories();
                            if let Some((cat, _)) = cats.get(cat_idx - 1) {
                                state.selected_category = Some(cat.clone());
                            }
                        }
                        state.cursor = 0;
                    }
                }
            } else {
                // Item list click
                state.focus = state::FocusTarget::ItemList;
                let list_row = (row - 1) as usize; // -1 for header
                let filtered_len = state.filtered_indices().len();
                if list_row < filtered_len {
                    state.cursor = list_row;
                }
            }
        }
        state::Screen::Dashboard => {} // no mouse interaction needed
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn key_release_is_not_actionable() {
        assert!(!is_actionable_key_kind(KeyEventKind::Release));
    }

    #[test]
    fn key_press_and_repeat_are_actionable() {
        assert!(is_actionable_key_kind(KeyEventKind::Press));
        assert!(is_actionable_key_kind(KeyEventKind::Repeat));
    }
}
