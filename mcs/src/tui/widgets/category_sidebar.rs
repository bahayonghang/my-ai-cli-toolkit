use crate::tui::state::{AppState, ContentTab, FocusTarget};
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let focused = state.focus == FocusTarget::Sidebar;
    let border_color = if focused {
        theme::PRIMARY
    } else {
        theme::PANEL
    };

    let block = Block::default()
        .borders(Borders::RIGHT)
        .border_style(Style::default().fg(border_color));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([
        Constraint::Length(2), // tabs
        Constraint::Length(1), // separator
        Constraint::Min(1),    // categories
    ])
    .split(inner);

    // Skills/Commands toggle
    let skills_style = if state.active_tab == ContentTab::Skills {
        Style::default()
            .fg(theme::BG)
            .bg(theme::PRIMARY)
            .add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(theme::MUTED)
    };
    let cmds_style = if state.active_tab == ContentTab::Commands {
        Style::default()
            .fg(theme::BG)
            .bg(theme::PRIMARY)
            .add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(theme::MUTED)
    };

    let tabs = vec![
        Line::from(Span::styled(" ◉ Skills  ", skills_style)),
        Line::from(Span::styled(" ○ Commands ", cmds_style)),
    ];
    frame.render_widget(Paragraph::new(tabs), chunks[0]);

    // Separator
    frame.render_widget(
        Paragraph::new("─".repeat(inner.width as usize)).style(Style::default().fg(theme::PANEL)),
        chunks[1],
    );

    // Category list
    let cats = state.categories(); // "default" is guaranteed first if present
    let total = state.active_items().len();
    let mut items = vec![];

    // "All" entry (cursor index 0)
    {
        let style = if state.category_cursor == 0 && focused {
            Style::default().fg(theme::PRIMARY).bg(theme::SURFACE)
        } else if state.selected_category.is_none() {
            Style::default().fg(theme::FG).add_modifier(Modifier::BOLD)
        } else {
            Style::default().fg(theme::MUTED)
        };
        items.push(ListItem::new(format!(" ▸ All ({total})")).style(style));
    }

    for (i, (cat, count)) in cats.iter().enumerate() {
        let cursor_i = i + 1; // offset by "All"
        let is_default = cat == "default";
        let is_selected = state.selected_category.as_deref() == Some(cat.as_str());
        let is_cursor = state.category_cursor == cursor_i && focused;

        let style = if is_cursor {
            Style::default().fg(theme::PRIMARY).bg(theme::SURFACE)
        } else if is_selected {
            Style::default()
                .fg(if is_default { theme::ACCENT } else { theme::FG })
                .add_modifier(Modifier::BOLD)
        } else if is_default {
            Style::default().fg(theme::ACCENT)
        } else {
            Style::default().fg(theme::MUTED)
        };

        let label = if is_default {
            format!(" ★ Default ({count})")
        } else {
            format!("   {cat} ({count})")
        };
        items.push(ListItem::new(label).style(style));

        // Visual separator after "default"
        if is_default {
            items.push(
                ListItem::new("─".repeat(inner.width.saturating_sub(1) as usize))
                    .style(Style::default().fg(theme::PANEL)),
            );
        }
    }

    frame.render_widget(List::new(items), chunks[2]);
}
