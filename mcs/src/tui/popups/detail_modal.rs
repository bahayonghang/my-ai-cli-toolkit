use crate::tui::state::AppState;
use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState, item_index: usize, scroll: u16) {
    let block = style_system::modal_block("Detail");
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let Some(item) = state.active_items().get(item_index) else {
        return;
    };
    let mut lines = vec![
        Line::from(vec![
            Span::styled("Name: ", style_system::style(StyleRole::HintKey)),
            Span::raw(&item.name),
        ]),
        Line::from(vec![
            Span::styled("Type: ", style_system::style(StyleRole::HintKey)),
            Span::raw(format!("{:?}", item.item_type)),
        ]),
        Line::from(vec![
            Span::styled("Status: ", style_system::style(StyleRole::HintKey)),
            Span::raw(format!("{:?}", item.status)),
        ]),
    ];
    if let Some(ref d) = item.description {
        lines.push(Line::from(vec![
            Span::styled("Desc: ", style_system::style(StyleRole::HintKey)),
            Span::raw(d),
        ]));
    }
    if let Some(ref c) = item.category {
        lines.push(Line::from(vec![
            Span::styled("Category: ", style_system::style(StyleRole::HintKey)),
            Span::raw(c),
        ]));
    }
    if !item.tags.is_empty() {
        lines.push(Line::from(vec![
            Span::styled("Tags: ", style_system::style(StyleRole::HintKey)),
            Span::raw(item.tags.join(", ")),
        ]));
    }
    lines.push(Line::from(vec![
        Span::styled("Source: ", style_system::style(StyleRole::HintKey)),
        Span::raw(item.source_path.display().to_string()),
    ]));
    lines.push(Line::from(vec![
        Span::styled("Target: ", style_system::style(StyleRole::HintKey)),
        Span::raw(item.target_path.display().to_string()),
    ]));
    lines.push(Line::default());
    lines.push(
        Line::from(" j/k Scroll  PgUp/PgDn Page  Esc Close")
            .style(style_system::style(StyleRole::HintText)),
    );

    frame.render_widget(
        Paragraph::new(lines)
            .style(style_system::style(StyleRole::TextPrimary))
            .scroll((scroll, 0)),
        inner,
    );
}
