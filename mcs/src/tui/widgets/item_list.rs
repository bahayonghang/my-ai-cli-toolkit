use ratatui::prelude::*;
use ratatui::widgets::*;
use unicode_width::UnicodeWidthStr;

use crate::model::InstallStatus;
use crate::tui::state::{AppState, FocusTarget};
use crate::tui::style_system;
use crate::tui::theme::{self, StyleRole};

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let filtered = state.filtered_indices();
    let items = state.active_items();
    let focused = state.focus == FocusTarget::ItemList;
    let icons = style_system::icons();

    let name_w = if area.width > 80 { 32usize } else { 24usize };
    let rows: Vec<ListItem> = filtered
        .iter()
        .enumerate()
        .map(|(vi, &idx)| {
            let item = &items[idx];
            let is_cursor = vi == state.cursor && focused;
            let is_selected = state.selected_indices.contains(&idx);

            let check = if is_selected {
                icons.checked
            } else {
                icons.unchecked
            };
            let (status_icon, status_text, status_role) = match item.status {
                InstallStatus::Installed => {
                    (icons.installed, "installed", StyleRole::StatusSuccess)
                }
                InstallStatus::NotInstalled => {
                    (icons.not_installed, "missing", StyleRole::TextMuted)
                }
                InstallStatus::Outdated => (icons.outdated, "outdated", StyleRole::StatusWarning),
            };

            let name = style_system::truncate_display_width(&item.name, name_w);
            let pad = name_w.saturating_sub(UnicodeWidthStr::width(name.as_str()));
            let desc = item.description.as_deref().unwrap_or("");
            let desc_w = (area.width as usize).saturating_sub(name_w + 24);
            let desc = style_system::truncate_display_width(desc, desc_w);

            let row_bg = if is_cursor || is_selected {
                Some(theme::color(StyleRole::SelectionBg))
            } else {
                None
            };
            let cursor = if is_cursor { icons.cursor } else { "  " };
            let mut name_style = style_system::style(StyleRole::TextPrimary);
            if is_cursor {
                name_style = name_style
                    .fg(theme::color(StyleRole::HintKey))
                    .add_modifier(Modifier::BOLD);
            }
            if let Some(bg) = row_bg {
                name_style = name_style.bg(bg);
            }
            let mut desc_style = style_system::style(StyleRole::TextMuted);
            if let Some(bg) = row_bg {
                desc_style = desc_style.bg(bg);
            }
            let mut check_style = style_system::style(StyleRole::HintText);
            let mut status_style = style_system::style(status_role);
            if let Some(bg) = row_bg {
                check_style = check_style.bg(bg);
                status_style = status_style.bg(bg);
            }

            let line = Line::from(vec![
                Span::styled(cursor, check_style),
                Span::styled(format!("{check} "), check_style),
                Span::styled(format!("{status_icon} {status_text:<9} "), status_style),
                Span::styled(format!("{name}{}", " ".repeat(pad)), name_style),
                Span::styled(desc, desc_style),
            ]);

            let style = if let Some(bg) = row_bg {
                Style::default().bg(bg)
            } else {
                Style::default()
            };
            ListItem::new(line).style(style)
        })
        .collect();

    let border_color = if focused {
        StyleRole::PanelBorderFocus
    } else {
        StyleRole::PanelBorder
    };
    let block = Block::default()
        .borders(Borders::LEFT)
        .border_style(style_system::style(border_color));

    frame.render_widget(List::new(rows).block(block), area);
}
