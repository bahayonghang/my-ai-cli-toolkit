pub mod input;
pub mod popups;
pub mod screens;
pub mod state;
pub mod theme;
pub mod widgets;

use std::path::PathBuf;
use std::time::Duration;

use crossterm::{
    event::{self, Event, KeyCode, KeyEvent, KeyEventKind, KeyModifiers},
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
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // Drop pending key events (e.g. shell Enter used to launch mcs.exe) so
    // startup doesn't immediately auto-select the first platform.
    drain_pending_events()?;

    let result = main_loop(&mut terminal, &mut state);

    // Terminal cleanup
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
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

        if let Event::Key(key) = event::read()? {
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
                    state::Screen::PlatformSelect => input::handle_platform_select_key(state, key),
                    state::Screen::Main => input::handle_main_key(state, key),
                    state::Screen::Dashboard => input::handle_dashboard_key(state, key),
                }
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
