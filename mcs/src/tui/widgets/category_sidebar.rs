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
    let cats = state.categories();
    let total = state.active_items().len();
    let mut items = vec![{
        let style = if state.category_cursor == 0 && focused {
            Style::default().fg(theme::PRIMARY).bg(theme::SURFACE)
        } else if state.selected_category.is_none() {
            Style::default().fg(theme::FG).add_modifier(Modifier::BOLD)
        } else {
            Style::default().fg(theme::MUTED)
        };
        ListItem::new(format!(" ▸ All ({total})")).style(style)
    }];

    for (i, (cat, count)) in cats.iter().enumerate() {
        let is_selected = state.selected_category.as_deref() == Some(cat.as_str());
        let is_cursor = state.category_cursor == i + 1 && focused;
        let style = if is_cursor {
            Style::default().fg(theme::PRIMARY).bg(theme::SURFACE)
        } else if is_selected {
            Style::default().fg(theme::FG).add_modifier(Modifier::BOLD)
        } else {
            Style::default().fg(theme::MUTED)
        };
        items.push(ListItem::new(format!("   {cat} ({count})")).style(style));
    }

    frame.render_widget(List::new(items), chunks[2]);
}
