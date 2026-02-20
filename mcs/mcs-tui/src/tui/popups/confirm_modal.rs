use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(
    frame: &mut Frame,
    area: Rect,
    title: &str,
    message: &str,
    items: &[String],
    danger: bool,
) {
    let border_color = if danger {
        StyleRole::StatusError
    } else {
        StyleRole::PanelBorderFocus
    };
    let block = style_system::modal_block(title).border_style(style_system::style(border_color));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([
        Constraint::Length(2),
        Constraint::Min(1),
        Constraint::Length(1),
    ])
    .split(inner);

    frame.render_widget(
        Paragraph::new(format!(" {message}")).style(style_system::style(StyleRole::TextPrimary)),
        chunks[0],
    );

    let icons = style_system::icons();
    let list: Vec<Line> = items
        .iter()
        .take(15)
        .map(|n| {
            Line::from(format!("  {} {n}", icons.bullet))
                .style(style_system::style(StyleRole::TextMuted))
        })
        .collect();
    frame.render_widget(Paragraph::new(list), chunks[1]);

    let hint_style = if danger {
        style_system::style(StyleRole::StatusError)
    } else {
        style_system::style(StyleRole::HintText)
    };
    frame.render_widget(
        Paragraph::new(" y/Enter Confirm  n/Esc Cancel").style(hint_style),
        chunks[2],
    );
}
