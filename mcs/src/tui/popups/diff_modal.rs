use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use similar::TextDiff;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState, item_index: usize) {
    let block = Block::default()
        .title(" Diff ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(theme::PRIMARY))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let item = &state.active_items()[item_index];
    if !item.is_installed() {
        frame.render_widget(
            Paragraph::new(" Not installed — no diff").style(Style::default().fg(theme::MUTED)),
            inner,
        );
        return;
    }

    let src = std::fs::read_to_string(&item.source_path).unwrap_or_default();
    let tgt = std::fs::read_to_string(&item.target_path).unwrap_or_default();
    let diff = TextDiff::from_lines(&tgt, &src);
    let unified = diff
        .unified_diff()
        .header("installed", "source")
        .to_string();

    if unified.is_empty() {
        frame.render_widget(
            Paragraph::new(" Files are identical").style(Style::default().fg(theme::SUCCESS)),
            inner,
        );
    } else {
        let lines: Vec<Line> = unified
            .lines()
            .map(|l| {
                let style = if l.starts_with('+') {
                    Style::default().fg(theme::SUCCESS)
                } else if l.starts_with('-') {
                    Style::default().fg(theme::ERROR)
                } else if l.starts_with('@') {
                    Style::default().fg(theme::ACCENT)
                } else {
                    Style::default().fg(theme::FG)
                };
                Line::styled(l, style)
            })
            .collect();
        frame.render_widget(Paragraph::new(lines).scroll((0, 0)), inner);
    }
}
