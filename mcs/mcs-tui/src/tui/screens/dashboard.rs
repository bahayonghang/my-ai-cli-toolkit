use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::tui::state::AppState;
use crate::tui::style_system::{self, layout_metrics};
use crate::tui::theme::StyleRole;
use crate::tui::widgets::footer;

pub fn draw(frame: &mut Frame, state: &AppState) {
    let metrics = layout_metrics();
    let area = frame.area();
    frame.render_widget(
        Block::default().style(style_system::style(StyleRole::ScreenBg)),
        area,
    );

    let padded = Rect {
        x: area.x + metrics.popup_padding,
        y: area.y,
        width: area.width.saturating_sub(metrics.popup_padding * 2),
        height: area.height,
    };

    let chunks = Layout::vertical([
        Constraint::Length(3),
        Constraint::Min(1),
        Constraint::Length(1),
    ])
    .split(padded);

    // Title — centered with badge
    let title = Line::from(vec![
        Span::styled(
            "MyClaude Skills ",
            style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD),
        ),
        Span::styled(" Dashboard ", style_system::style(StyleRole::BadgeAccent)),
    ]);
    frame.render_widget(
        Paragraph::new(vec![Line::default(), title, Line::default()])
            .alignment(Alignment::Center)
            .style(style_system::style(StyleRole::PanelBg)),
        chunks[0],
    );

    // Table from cache (zero I/O)
    let empty = Vec::new();
    let stats = state.dashboard_cache.as_ref().unwrap_or(&empty);

    let rows: Vec<Row> = stats
        .iter()
        .map(|s| {
            Row::new(vec![
                Cell::from(s.platform_name.as_str())
                    .style(style_system::style(StyleRole::TextPrimary)),
                Cell::from(format!("{}/{}", s.skills_installed, s.skills_total))
                    .style(style_system::style(StyleRole::StatusSuccess)),
                Cell::from(format!("{}/{}", s.commands_installed, s.commands_total))
                    .style(style_system::style(StyleRole::NotificationInfo)),
                Cell::from(format!("{}/{}", s.agents_installed, s.agents_total))
                    .style(style_system::style(StyleRole::BadgeAccent)),
                Cell::from(format!("{}", s.outdated)).style(if s.outdated > 0 {
                    style_system::style(StyleRole::StatusWarning)
                } else {
                    style_system::style(StyleRole::TextMuted)
                }),
                Cell::from(if s.has_guidance { "✓" } else { "-" })
                    .style(style_system::style(StyleRole::TextMuted)),
            ])
        })
        .collect();

    let header = Row::new([
        "Platform", "Skills", "Commands", "Agents", "Outdated", "Guidance",
    ])
    .style(style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD))
    .bottom_margin(1);

    let table = Table::new(
        rows,
        [
            Constraint::Length(16),
            Constraint::Length(10),
            Constraint::Length(10),
            Constraint::Length(10),
            Constraint::Length(10),
            Constraint::Length(8),
        ],
    )
    .header(header)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(style_system::style(StyleRole::PanelBorder)),
    );

    frame.render_widget(table, chunks[1]);

    let footer = style_system::footer_line(&footer::help_tokens_for_state(state));
    frame.render_widget(
        Paragraph::new(footer).style(style_system::style(StyleRole::PanelBg)),
        chunks[2],
    );
}
