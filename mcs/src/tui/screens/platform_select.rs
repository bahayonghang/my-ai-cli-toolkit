use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::config::platform::platform_displays;
use crate::tui::state::AppState;
use crate::tui::theme;

pub fn draw(frame: &mut Frame, state: &AppState) {
    let area = frame.area();
    frame.render_widget(Block::default().style(Style::default().bg(theme::BG)), area);

    // Full-screen layout with horizontal padding
    let padded = Rect {
        x: area.x + 2,
        y: area.y,
        width: area.width.saturating_sub(4),
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
            Style::default()
                .fg(theme::PRIMARY)
                .add_modifier(Modifier::BOLD),
        ),
        Span::styled(
            " Select Platform ",
            Style::default()
                .fg(theme::BG)
                .bg(theme::ACCENT)
                .add_modifier(Modifier::BOLD),
        ),
    ]);
    frame.render_widget(
        Paragraph::new(vec![Line::default(), title, Line::default()])
            .alignment(Alignment::Center)
            .style(Style::default().bg(theme::SURFACE)),
        chunks[0],
    );

    // Platform list
    let displays = platform_displays();
    let w = padded.width as usize;
    let items: Vec<ListItem> = displays
        .iter()
        .enumerate()
        .map(|(i, d)| {
            let selected = i == state.platform_cursor;
            let bg = if selected { theme::SURFACE } else { theme::BG };
            let fg = if selected { theme::PRIMARY } else { theme::FG };
            let muted = if selected {
                theme::SECONDARY
            } else {
                theme::MUTED
            };
            let indicator = if selected { "  ▸ " } else { "    " };

            let name_part = format!("{} {:<16}", d.icon, d.name);
            let path_part = format!("  {}", d.base_dir);
            let used = indicator.len() + name_part.chars().count() + path_part.len();
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
    let footer = Line::from(vec![
        Span::styled("[↑↓]", Style::default().fg(theme::PRIMARY)),
        Span::styled(" Navigate  ", Style::default().fg(theme::MUTED)),
        Span::styled("[⏎]", Style::default().fg(theme::PRIMARY)),
        Span::styled(" Select  ", Style::default().fg(theme::MUTED)),
        Span::styled("[d]", Style::default().fg(theme::PRIMARY)),
        Span::styled(" Dashboard  ", Style::default().fg(theme::MUTED)),
        Span::styled("[q]", Style::default().fg(theme::PRIMARY)),
        Span::styled(" Quit", Style::default().fg(theme::MUTED)),
    ]);
    frame.render_widget(
        Paragraph::new(footer).style(Style::default().bg(theme::SURFACE)),
        chunks[3],
    );
}
