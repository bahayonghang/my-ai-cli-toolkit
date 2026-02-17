use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::tui::state::AppState;
use crate::tui::style_system::{self, layout_metrics};
use crate::tui::theme::StyleRole;
use crate::tui::widgets::{category_sidebar, footer, header, item_list, progress_bar, search_bar};

pub fn draw(frame: &mut Frame, state: &AppState) {
    let area = frame.area();
    frame.render_widget(
        Block::default().style(style_system::style(StyleRole::ScreenBg)),
        area,
    );
    let metrics = layout_metrics();
    let progress_height = if state.progress.is_some() {
        metrics.progress_height
    } else {
        0
    };

    let chunks = Layout::vertical([
        Constraint::Length(metrics.header_height), // header
        Constraint::Min(1),                        // body
        Constraint::Length(progress_height),       // progress
        Constraint::Length(metrics.footer_height), // footer
    ])
    .split(area);

    header::draw(frame, chunks[0], state);

    // Two-column layout
    let body = Layout::horizontal([
        Constraint::Length(metrics.sidebar_width), // sidebar
        Constraint::Min(1),                        // content
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

    if state.progress.is_some() {
        progress_bar::draw(frame, chunks[2], state);
    }
    footer::draw(frame, chunks[3], state);
}
