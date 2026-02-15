use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(
    frame: &mut Frame,
    area: Rect,
    title: &str,
    message: &str,
    items: &[String],
    danger: bool,
) {
    let border_color = if danger { theme::ERROR } else { theme::PRIMARY };
    let block = Block::default()
        .title(format!(" {title} "))
        .borders(Borders::ALL)
        .border_style(Style::default().fg(border_color))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([
        Constraint::Length(2),
        Constraint::Min(1),
        Constraint::Length(1),
    ])
    .split(inner);

    frame.render_widget(
        Paragraph::new(format!(" {message}")).style(Style::default().fg(theme::FG)),
        chunks[0],
    );

    let list: Vec<Line> = items
        .iter()
        .take(15)
        .map(|n| Line::from(format!("  • {n}")).style(Style::default().fg(theme::MUTED)))
        .collect();
    frame.render_widget(Paragraph::new(list), chunks[1]);

    let hint_style = if danger {
        Style::default().fg(theme::ERROR)
    } else {
        Style::default().fg(theme::MUTED)
    };
    frame.render_widget(
        Paragraph::new(" y/⏎ Confirm  n/Esc Cancel").style(hint_style),
        chunks[2],
    );
}
