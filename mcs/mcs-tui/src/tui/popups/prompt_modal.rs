use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, has_diff: bool, diff_text: &str, scroll: u16) {
    let block = style_system::modal_block("Guidance");
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([Constraint::Min(1), Constraint::Length(1)]).split(inner);

    if !has_diff {
        frame.render_widget(
            Paragraph::new(" No differences").style(style_system::style(StyleRole::StatusSuccess)),
            chunks[0],
        );
    } else {
        let lines: Vec<Line> = diff_text
            .lines()
            .map(|l| {
                let style = if l.starts_with('+') {
                    style_system::style(StyleRole::StatusSuccess)
                } else if l.starts_with('-') {
                    style_system::style(StyleRole::StatusError)
                } else {
                    style_system::style(StyleRole::TextPrimary)
                };
                Line::styled(l, style)
            })
            .collect();
        frame.render_widget(Paragraph::new(lines).scroll((scroll, 0)), chunks[0]);
    }

    let hint = if has_diff {
        " ⏎ Update  j/k Scroll  PgUp/PgDn Page  Esc Close"
    } else {
        " j/k Scroll  PgUp/PgDn Page  Esc Close"
    };
    frame.render_widget(
        Paragraph::new(hint).style(style_system::style(StyleRole::HintText)),
        chunks[1],
    );
}
