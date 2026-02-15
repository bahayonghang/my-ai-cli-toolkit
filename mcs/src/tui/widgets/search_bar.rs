use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let line = Line::from(vec![
        Span::styled(" /", Style::default().fg(theme::PRIMARY)),
        Span::styled(
            format!(" {}", state.search_query),
            Style::default().fg(theme::FG),
        ),
        Span::styled("▏", Style::default().fg(theme::PRIMARY)),
    ]);
    frame.render_widget(
        Paragraph::new(line).style(Style::default().bg(theme::SURFACE)),
        area,
    );
}
