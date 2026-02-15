use ratatui::prelude::*;
use ratatui::widgets::*;
use unicode_width::UnicodeWidthStr;

use crate::model::InstallStatus;
use crate::tui::state::{AppState, FocusTarget};
use crate::tui::theme;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let filtered = state.filtered_indices();
    let items = state.active_items();
    let focused = state.focus == FocusTarget::ItemList;

    let name_w = 30usize;
    let rows: Vec<ListItem> = filtered
        .iter()
        .enumerate()
        .map(|(vi, &idx)| {
            let item = &items[idx];
            let is_cursor = vi == state.cursor && focused;
            let is_selected = state.selected_indices.contains(&idx);

            let check = if is_selected { "☑" } else { "☐" };
            let status_icon = match item.status {
                InstallStatus::Installed => Span::styled("✓", Style::default().fg(theme::SUCCESS)),
                InstallStatus::NotInstalled => Span::styled("○", Style::default().fg(theme::MUTED)),
                InstallStatus::Outdated => Span::styled("⚠", Style::default().fg(theme::WARNING)),
            };

            let name = truncate_to_width(&item.name, name_w);
            let pad = name_w.saturating_sub(UnicodeWidthStr::width(name.as_str()));
            let desc = item.description.as_deref().unwrap_or("");
            let desc_w = (area.width as usize).saturating_sub(name_w + 8);
            let desc = truncate_to_width(desc, desc_w);

            let line = Line::from(vec![
                Span::raw(if is_cursor { "▶ " } else { "  " }),
                Span::raw(format!("{check} ")),
                status_icon,
                Span::raw(" "),
                Span::styled(
                    format!("{name}{}", " ".repeat(pad)),
                    Style::default().fg(theme::FG),
                ),
                Span::styled(desc, Style::default().fg(theme::MUTED)),
            ]);

            let style = if is_cursor {
                Style::default().bg(theme::SURFACE)
            } else {
                Style::default()
            };
            ListItem::new(line).style(style)
        })
        .collect();

    let border_color = if focused {
        theme::PRIMARY
    } else {
        theme::PANEL
    };
    let block = Block::default()
        .borders(Borders::LEFT)
        .border_style(Style::default().fg(border_color));

    frame.render_widget(List::new(rows).block(block), area);
}

fn truncate_to_width(text: &str, max: usize) -> String {
    let mut result = String::new();
    let mut w = 0;
    for ch in text.chars() {
        let cw = unicode_width::UnicodeWidthChar::width(ch).unwrap_or(0);
        if w + cw > max {
            result.push('…');
            break;
        }
        w += cw;
        result.push(ch);
    }
    result
}
