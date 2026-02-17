use crate::tui::state::{AppState, ContentTab, FocusTarget};
use crate::tui::style_system;
use crate::tui::theme::{self, StyleRole};
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let focused = state.focus == FocusTarget::Sidebar;
    let border_color = if focused {
        StyleRole::PanelBorderFocus
    } else {
        StyleRole::PanelBorder
    };

    let block = Block::default()
        .borders(Borders::RIGHT)
        .border_style(style_system::style(border_color));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([
        Constraint::Length(2), // tabs
        Constraint::Length(1), // separator
        Constraint::Min(1),    // categories
    ])
    .split(inner);

    // Skills/Commands toggle
    let icons = style_system::icons();
    let tab_style = |active: bool| {
        if active {
            style_system::style(StyleRole::BadgeAccent)
        } else {
            style_system::style(StyleRole::TextMuted)
        }
    };

    let tabs = vec![
        Line::from(Span::styled(
            format!(
                " {} Skills   ",
                if state.active_tab == ContentTab::Skills {
                    icons.tab_selected
                } else {
                    icons.tab_unselected
                }
            ),
            tab_style(state.active_tab == ContentTab::Skills),
        )),
        Line::from(Span::styled(
            format!(
                " {} Commands ",
                if state.active_tab == ContentTab::Commands {
                    icons.tab_selected
                } else {
                    icons.tab_unselected
                }
            ),
            tab_style(state.active_tab == ContentTab::Commands),
        )),
    ];
    frame.render_widget(Paragraph::new(tabs), chunks[0]);

    // Separator
    frame.render_widget(
        Paragraph::new("─".repeat(inner.width as usize))
            .style(style_system::style(StyleRole::PanelBorder)),
        chunks[1],
    );

    // Category list
    let cats = state.categories(); // "default" is guaranteed first if present
    let total = state.active_items().len();
    let mut items = vec![];

    // "All" entry (cursor index 0)
    {
        let style = if state.category_cursor == 0 && focused {
            style_system::style(StyleRole::HintKey).bg(theme::color(StyleRole::SelectionBg))
        } else if state.selected_category.is_none() {
            style_system::style(StyleRole::TextPrimary).add_modifier(Modifier::BOLD)
        } else {
            style_system::style(StyleRole::TextMuted)
        };
        let prefix = if state.category_cursor == 0 && focused {
            icons.cursor
        } else {
            "  "
        };
        items.push(ListItem::new(format!(" {prefix}All ({total})")).style(style));
    }

    for (i, (cat, count)) in cats.iter().enumerate() {
        let cursor_i = i + 1; // offset by "All"
        let is_default = cat == "default";
        let is_selected = state.selected_category.as_deref() == Some(cat.as_str());
        let is_cursor = state.category_cursor == cursor_i && focused;

        let style = if is_cursor {
            style_system::style(StyleRole::HintKey).bg(theme::color(StyleRole::SelectionBg))
        } else if is_selected {
            style_system::style(if is_default {
                StyleRole::HintKey
            } else {
                StyleRole::TextPrimary
            })
            .add_modifier(Modifier::BOLD)
        } else if is_default {
            style_system::style(StyleRole::HintKey)
        } else {
            style_system::style(StyleRole::TextMuted)
        };

        let cursor_prefix = if is_cursor { icons.cursor } else { "  " };
        let label = if is_default {
            format!(
                " {cursor_prefix}{} Default ({count})",
                icons.default_category
            )
        } else {
            format!(" {cursor_prefix}{cat} ({count})")
        };
        items.push(ListItem::new(label).style(style));

        // Visual separator after "default"
        if is_default {
            items.push(
                ListItem::new("─".repeat(inner.width.saturating_sub(1) as usize))
                    .style(style_system::style(StyleRole::PanelBorder)),
            );
        }
    }

    frame.render_widget(List::new(items), chunks[2]);
}
