use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, has_diff: bool, diff_text: &str) {
    let block = Block::default()
        .title(" CLAUDE.md ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(theme::PRIMARY))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([Constraint::Min(1), Constraint::Length(1)]).split(inner);

    if !has_diff {
        frame.render_widget(
            Paragraph::new(" No differences").style(Style::default().fg(theme::SUCCESS)),
            chunks[0],
        );
    } else {
        let lines: Vec<Line> = diff_text
            .lines()
            .map(|l| {
                let style = if l.starts_with('+') {
                    Style::default().fg(theme::SUCCESS)
                } else if l.starts_with('-') {
                    Style::default().fg(theme::ERROR)
                } else {
                    Style::default().fg(theme::FG)
                };
                Line::styled(l, style)
            })
            .collect();
        frame.render_widget(Paragraph::new(lines), chunks[0]);
    }

    let hint = if has_diff {
        " ⏎ Update  Esc Close"
    } else {
        " Esc Close"
    };
    frame.render_widget(
        Paragraph::new(hint).style(Style::default().fg(theme::MUTED)),
        chunks[1],
    );
}
