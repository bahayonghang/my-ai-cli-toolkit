use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use std::collections::HashSet;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState, selected: &HashSet<String>) {
    let block = Block::default()
        .title(" Multi-Platform Sync ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(theme::PRIMARY))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([Constraint::Min(1), Constraint::Length(1)]).split(inner);

    let mut names: Vec<_> = state.platforms.keys().cloned().collect();
    names.sort();
    let items: Vec<ListItem> = names
        .iter()
        .map(|n| {
            let check = if selected.contains(n) { "☑" } else { "☐" };
            ListItem::new(format!("  {check} {n}")).style(Style::default().fg(theme::FG))
        })
        .collect();
    frame.render_widget(List::new(items), chunks[0]);
    frame.render_widget(
        Paragraph::new(" ⏎ Sync  Space Toggle  Esc Cancel")
            .style(Style::default().fg(theme::MUTED)),
        chunks[1],
    );
}
