use ratatui::prelude::*;
use ratatui::widgets::*;
use unicode_width::UnicodeWidthStr;

use crate::config::platform::platform_displays;
use crate::tui::state::AppState;
use crate::tui::style_system::{self, layout_metrics};
use crate::tui::theme::{self, StyleRole};
use crate::tui::widgets::footer;

pub fn draw(frame: &mut Frame, state: &AppState) {
    let metrics = layout_metrics();
    let area = frame.area();
    frame.render_widget(
        Block::default().style(style_system::style(StyleRole::ScreenBg)),
        area,
    );

    // Full-screen layout with horizontal padding
    let padded = Rect {
        x: area.x + metrics.popup_padding,
        y: area.y,
        width: area.width.saturating_sub(metrics.popup_padding * 2),
        height: area.height,
    };

    let chunks = Layout::vertical([
        Constraint::Length(3), // title area
        Constraint::Length(1), // gap
        Constraint::Min(1),    // list
        Constraint::Length(1), // footer
    ])
    .split(padded);

    // Title — centered with badge
    let title = Line::from(vec![
        Span::styled(
            "MyClaude Skills Installer ",
            style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD),
        ),
        Span::styled(
            " Select Platform ",
            style_system::style(StyleRole::BadgeAccent),
        ),
    ]);
    frame.render_widget(
        Paragraph::new(vec![Line::default(), title, Line::default()])
            .alignment(Alignment::Center)
            .style(style_system::style(StyleRole::PanelBg)),
        chunks[0],
    );

    // Platform list
    let icons = style_system::icons();
    let displays = platform_displays();
    let w = padded.width as usize;
    let items: Vec<ListItem> = displays
        .iter()
        .enumerate()
        .map(|(i, d)| {
            let selected = i == state.platform_cursor;
            let bg = if selected {
                theme::color(StyleRole::SelectionBg)
            } else {
                theme::color(StyleRole::ScreenBg)
            };
            let fg = if selected {
                theme::color(StyleRole::HintKey)
            } else {
                theme::color(StyleRole::TextPrimary)
            };
            let muted = if selected {
                theme::color(StyleRole::NotificationInfo)
            } else {
                theme::color(StyleRole::TextMuted)
            };
            let indicator = if selected {
                format!("  {}", icons.cursor)
            } else {
                "    ".into()
            };

            let name_part = format!("{} {:<16}", d.icon, d.name);
            let path_part = format!("  {}", d.base_dir);
            let used = UnicodeWidthStr::width(indicator.as_str())
                + UnicodeWidthStr::width(name_part.as_str())
                + UnicodeWidthStr::width(path_part.as_str());
            let pad = w.saturating_sub(used);

            ListItem::new(Line::from(vec![
                Span::styled(
                    indicator,
                    Style::default().fg(fg).bg(bg).add_modifier(if selected {
                        Modifier::BOLD
                    } else {
                        Modifier::empty()
                    }),
                ),
                Span::styled(
                    name_part,
                    Style::default().fg(fg).bg(bg).add_modifier(if selected {
                        Modifier::BOLD
                    } else {
                        Modifier::empty()
                    }),
                ),
                Span::styled(path_part, Style::default().fg(muted).bg(bg)),
                Span::styled(" ".repeat(pad), Style::default().bg(bg)),
            ]))
        })
        .collect();

    frame.render_widget(List::new(items), chunks[2]);

    // Footer
    let mut tokens = footer::help_tokens_for_state(state);
    for token in &mut tokens {
        if token.key == "[Enter]" {
            token.key = format!("[{}]", icons.enter_key);
        }
    }
    let footer = style_system::footer_line(&tokens);
    frame.render_widget(
        Paragraph::new(footer).style(style_system::style(StyleRole::PanelBg)),
        chunks[3],
    );
}
