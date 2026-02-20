use crate::tui::state::AppState;
use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let name = state.platform.as_deref().unwrap_or("---");
    let line = Line::from(vec![
        Span::styled(
            " MyClaude Skills ",
            style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD),
        ),
        Span::styled(
            format!(" [{name}] "),
            style_system::style(StyleRole::BadgeAccent),
        ),
    ]);
    frame.render_widget(
        Paragraph::new(line).style(style_system::style(StyleRole::PanelBg)),
        area,
    );
}
