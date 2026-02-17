use crate::tui::state::AppState;
use crate::tui::state::FocusTarget;
use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let focused = state.focus == FocusTarget::SearchInput;
    let line = Line::from(vec![
        Span::styled(" /", style_system::style(StyleRole::HintKey)),
        Span::styled(
            format!(" {}", state.search_query),
            style_system::style(StyleRole::TextPrimary),
        ),
        Span::styled(
            "▏",
            if focused {
                style_system::style(StyleRole::HintKey)
            } else {
                style_system::style(StyleRole::TextMuted)
            },
        ),
    ]);
    frame.render_widget(
        Paragraph::new(line).style(style_system::style(StyleRole::PanelBg)),
        area,
    );
}
