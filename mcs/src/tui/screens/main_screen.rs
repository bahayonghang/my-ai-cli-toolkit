use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::tui::state::AppState;
use crate::tui::theme;
use crate::tui::widgets::{category_sidebar, footer, header, item_list, search_bar};

pub fn draw(frame: &mut Frame, state: &AppState) {
    let area = frame.area();
    frame.render_widget(Block::default().style(Style::default().bg(theme::BG)), area);

    let chunks = Layout::vertical([
        Constraint::Length(1), // header
        Constraint::Min(1),    // body
        Constraint::Length(1), // footer
    ])
    .split(area);

    header::draw(frame, chunks[0], state);

    // Two-column layout
    let body = Layout::horizontal([
        Constraint::Length(24), // sidebar
        Constraint::Min(1),     // content
    ])
    .split(chunks[1]);

    category_sidebar::draw(frame, body[0], state);

    // Content area: optional search bar + item list
    if state.focus == crate::tui::state::FocusTarget::SearchInput || !state.search_query.is_empty()
    {
        let content = Layout::vertical([Constraint::Length(1), Constraint::Min(1)]).split(body[1]);
        search_bar::draw(frame, content[0], state);
        item_list::draw(frame, content[1], state);
    } else {
        item_list::draw(frame, body[1], state);
    }

    footer::draw(frame, chunks[2], state);
}
