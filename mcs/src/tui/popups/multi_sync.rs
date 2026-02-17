use crate::tui::state::AppState;
use crate::tui::style_system;
use crate::tui::theme::{self, StyleRole};
use ratatui::prelude::*;
use ratatui::widgets::*;
use std::collections::HashSet;

pub fn draw(
    frame: &mut Frame,
    area: Rect,
    state: &AppState,
    selected: &HashSet<String>,
    cursor: usize,
) {
    let block = style_system::modal_block("Multi-Platform Sync");
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([Constraint::Min(1), Constraint::Length(1)]).split(inner);

    let mut names: Vec<_> = state.platforms.keys().cloned().collect();
    names.sort();
    let icons = style_system::icons();
    let items: Vec<ListItem> = names
        .iter()
        .enumerate()
        .map(|(idx, n)| {
            let check = if selected.contains(n) {
                icons.checked
            } else {
                icons.unchecked
            };
            let style = if idx == cursor {
                style_system::style(StyleRole::HintKey).bg(theme::color(StyleRole::SelectionBg))
            } else {
                style_system::style(StyleRole::TextPrimary)
            };
            let status = if selected.contains(n) {
                "selected"
            } else {
                "pending"
            };
            ListItem::new(format!("  {check} {n} ({status})")).style(style)
        })
        .collect();
    frame.render_widget(List::new(items), chunks[0]);
    frame.render_widget(
        Paragraph::new(format!(
            " ↑↓ Select  Space Toggle  {} Sync  Esc Cancel",
            icons.enter_key
        ))
        .style(style_system::style(StyleRole::HintText)),
        chunks[1],
    );
}
