use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState, item_index: usize) {
    let block = Block::default()
        .title(" Detail ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(theme::PRIMARY))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let item = &state.active_items()[item_index];
    let mut lines = vec![
        Line::from(vec![
            Span::styled("Name: ", Style::default().fg(theme::ACCENT)),
            Span::raw(&item.name),
        ]),
        Line::from(vec![
            Span::styled("Type: ", Style::default().fg(theme::ACCENT)),
            Span::raw(format!("{:?}", item.item_type)),
        ]),
        Line::from(vec![
            Span::styled("Status: ", Style::default().fg(theme::ACCENT)),
            Span::raw(format!("{:?}", item.status)),
        ]),
    ];
    if let Some(ref d) = item.description {
        lines.push(Line::from(vec![
            Span::styled("Desc: ", Style::default().fg(theme::ACCENT)),
            Span::raw(d),
        ]));
    }
    if let Some(ref c) = item.category {
        lines.push(Line::from(vec![
            Span::styled("Category: ", Style::default().fg(theme::ACCENT)),
            Span::raw(c),
        ]));
    }
    if !item.tags.is_empty() {
        lines.push(Line::from(vec![
            Span::styled("Tags: ", Style::default().fg(theme::ACCENT)),
            Span::raw(item.tags.join(", ")),
        ]));
    }
    lines.push(Line::from(vec![
        Span::styled("Source: ", Style::default().fg(theme::ACCENT)),
        Span::raw(item.source_path.display().to_string()),
    ]));
    lines.push(Line::from(vec![
        Span::styled("Target: ", Style::default().fg(theme::ACCENT)),
        Span::raw(item.target_path.display().to_string()),
    ]));
    lines.push(Line::default());
    lines.push(Line::from(" Esc Close").style(Style::default().fg(theme::MUTED)));

    frame.render_widget(
        Paragraph::new(lines).style(Style::default().fg(theme::FG)),
        inner,
    );
}
