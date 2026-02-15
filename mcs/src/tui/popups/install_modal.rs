use crate::tui::state::InstallMode;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, items: &[String], mode: &InstallMode, path_input: &str) {
    let block = Block::default()
        .title(" Install ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(theme::PRIMARY))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([
        Constraint::Length(2), // mode
        Constraint::Length(1), // path
        Constraint::Length(1), // sep
        Constraint::Min(1),    // items
        Constraint::Length(1), // hint
    ])
    .split(inner);

    let (g_mark, d_mark) = if *mode == InstallMode::Global {
        ("◉", "○")
    } else {
        ("○", "◉")
    };

    let g_style = if *mode == InstallMode::Global {
        Style::default()
            .fg(theme::PRIMARY)
            .add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(theme::MUTED)
    };
    let d_style = if *mode == InstallMode::Directory {
        Style::default()
            .fg(theme::PRIMARY)
            .add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(theme::MUTED)
    };
    frame.render_widget(
        Paragraph::new(vec![
            Line::from(Span::styled(format!(" {g_mark} Global"), g_style)),
            Line::from(Span::styled(format!(" {d_mark} Directory"), d_style)),
        ]),
        chunks[0],
    );

    if *mode == InstallMode::Directory {
        let path = if path_input.is_empty() {
            "<project-path>"
        } else {
            path_input
        };
        frame.render_widget(
            Paragraph::new(format!("   Path: {path}▏")).style(Style::default().fg(theme::FG)),
            chunks[1],
        );
    } else {
        frame.render_widget(
            Paragraph::new("   Path: <project-path>").style(Style::default().fg(theme::MUTED)),
            chunks[1],
        );
    }

    frame.render_widget(
        Paragraph::new(format!("   Items: {}", items.len()))
            .style(Style::default().fg(theme::MUTED)),
        chunks[2],
    );

    let list = build_items_lines(items, chunks[3].width, chunks[3].height);
    frame.render_widget(Paragraph::new(list), chunks[3]);
    frame.render_widget(
        Paragraph::new(" ⏎ Install  ↑↓ Mode  Tab Toggle  Esc Cancel")
            .style(Style::default().fg(theme::MUTED)),
        chunks[4],
    );
}

fn build_items_lines(items: &[String], width: u16, height: u16) -> Vec<Line<'static>> {
    let rows_available = height as usize;
    if rows_available == 0 {
        return Vec::new();
    }

    let total_width = width.saturating_sub(2) as usize;
    let max_columns_by_width = (total_width / 14).max(1);
    let required_columns = items.len().max(1).div_ceil(rows_available);
    let columns = required_columns.clamp(1, max_columns_by_width);
    let col_width = (total_width / columns).max(10);

    let total_rows = items.len().div_ceil(columns);
    let has_overflow = total_rows > rows_available;
    let render_rows = if has_overflow {
        rows_available.saturating_sub(1)
    } else {
        total_rows
    };
    let mut lines = Vec::with_capacity(render_rows + 1);

    for row in 0..render_rows {
        let mut line = String::from(" ");
        for col in 0..columns {
            let idx = row * columns + col;
            if idx >= items.len() {
                break;
            }
            line.push_str(&format_column_item(&items[idx], col_width));
        }
        lines.push(Line::from(line).style(Style::default().fg(theme::FG)));
    }

    if has_overflow {
        let visible_count = render_rows * columns;
        let hidden = items.len().saturating_sub(visible_count);
        lines.push(
            Line::from(format!(" … and {hidden} more")).style(
                Style::default()
                    .fg(theme::MUTED)
                    .add_modifier(Modifier::ITALIC),
            ),
        );
    }

    lines
}

fn format_column_item(name: &str, width: usize) -> String {
    let label = format!("• {}", truncate_chars(name, width.saturating_sub(2)));
    format!("{label:<width$}")
}

fn truncate_chars(text: &str, max_chars: usize) -> String {
    let len = text.chars().count();
    if len <= max_chars {
        return text.to_string();
    }
    if max_chars <= 1 {
        return "…".to_string();
    }
    let mut s = String::with_capacity(max_chars);
    for c in text.chars().take(max_chars - 1) {
        s.push(c);
    }
    s.push('…');
    s
}
