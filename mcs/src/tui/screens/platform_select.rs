use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::config::platform::platform_displays;
use crate::tui::state::AppState;
use crate::tui::theme;

const LOGO: &str = r#"
  __  __        ____ _                 _
 |  \/  |_   _ / ___| | __ _ _   _  __| | ___
 | |\/| | | | | |   | |/ _` | | | |/ _` |/ _ \
 | |  | | |_| | |___| | (_| | |_| | (_| |  __/
 |_|  |_|\__, |\____|_|\__,_|\__,_|\__,_|\___|
         |___/        Skills Installer (Rust)
"#;

pub fn draw(frame: &mut Frame, state: &AppState) {
    let area = frame.area();

    // Center the card
    let card_w = 60.min(area.width);
    let card_h = 24.min(area.height);
    let x = (area.width.saturating_sub(card_w)) / 2;
    let y = (area.height.saturating_sub(card_h)) / 2;
    let card = Rect::new(x, y, card_w, card_h);

    frame.render_widget(Block::default().style(Style::default().bg(theme::BG)), area);

    let chunks = Layout::vertical([
        Constraint::Length(7), // logo
        Constraint::Length(1), // title
        Constraint::Min(1),    // list
        Constraint::Length(2), // footer
    ])
    .split(card);

    // Logo
    let logo = Paragraph::new(LOGO)
        .style(Style::default().fg(theme::PRIMARY))
        .alignment(Alignment::Center);
    frame.render_widget(logo, chunks[0]);

    // Title
    let title = Paragraph::new("  Select Target Platform").style(
        Style::default()
            .fg(theme::ACCENT)
            .add_modifier(Modifier::BOLD),
    );
    frame.render_widget(title, chunks[1]);

    // Platform list
    let displays = platform_displays();
    let items: Vec<ListItem> = displays
        .iter()
        .enumerate()
        .map(|(i, d)| {
            let (fg, bg, mods) = if i == state.platform_cursor {
                (theme::BG, theme::PRIMARY, Modifier::BOLD)
            } else {
                (theme::FG, theme::BG, Modifier::empty())
            };
            let muted = if i == state.platform_cursor {
                theme::BG
            } else {
                theme::MUTED
            };
            ListItem::new(Line::from(vec![
                Span::styled(
                    format!("  {} {:<14}", d.icon, d.name),
                    Style::default().fg(fg).bg(bg).add_modifier(mods),
                ),
                Span::styled(d.base_dir.to_string(), Style::default().fg(muted).bg(bg)),
            ]))
        })
        .collect();

    let list = List::new(items).block(
        Block::default()
            .borders(Borders::TOP)
            .border_style(Style::default().fg(theme::PANEL)),
    );
    frame.render_widget(list, chunks[2]);

    // Footer
    let footer = Paragraph::new("  ↑↓/jk Navigate  ⏎ Select  q Quit")
        .style(Style::default().fg(theme::MUTED));
    frame.render_widget(footer, chunks[3]);
}
