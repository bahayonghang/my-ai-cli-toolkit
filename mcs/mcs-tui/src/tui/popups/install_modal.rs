use crate::tui::state::InstallMode;
use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use mcs_core::model::LinkMode;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(
    frame: &mut Frame,
    area: Rect,
    items: &[String],
    mode: &InstallMode,
    link_mode: &LinkMode,
    path_input: &str,
) {
    let block = style_system::modal_block("Install");
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::vertical([
        Constraint::Length(2), // location mode (Global / Directory)
        Constraint::Length(1), // link mode (Auto / Symlink / Copy)
        Constraint::Length(1), // path
        Constraint::Length(1), // sep
        Constraint::Min(1),    // items
        Constraint::Length(1), // hint
    ])
    .split(inner);

    let icons = style_system::icons();

    // ── Location row ────────────────────────────────────────────────
    let (g_mark, d_mark) = if *mode == InstallMode::Global {
        (icons.tab_selected, icons.tab_unselected)
    } else {
        (icons.tab_unselected, icons.tab_selected)
    };
    let g_style = if *mode == InstallMode::Global {
        style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD)
    } else {
        style_system::style(StyleRole::TextMuted)
    };
    let d_style = if *mode == InstallMode::Directory {
        style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD)
    } else {
        style_system::style(StyleRole::TextMuted)
    };
    frame.render_widget(
        Paragraph::new(vec![
            Line::from(Span::styled(format!(" {g_mark} Global"), g_style)),
            Line::from(Span::styled(format!(" {d_mark} Directory"), d_style)),
        ]),
        chunks[0],
    );

    // ── Link mode row ───────────────────────────────────────────────
    let link_label = |lm: LinkMode, label: &str| -> Span<'static> {
        let (mark, role) = if *link_mode == lm {
            (icons.tab_selected, StyleRole::HintKey)
        } else {
            (icons.tab_unselected, StyleRole::TextMuted)
        };
        let style = style_system::style(role);
        Span::styled(format!(" {mark} {label}"), style)
    };
    frame.render_widget(
        Paragraph::new(Line::from(vec![
            link_label(LinkMode::Auto, "Auto"),
            link_label(LinkMode::Symlink, "Symlink"),
            link_label(LinkMode::Copy, "Copy"),
        ])),
        chunks[1],
    );

    // ── Path row ────────────────────────────────────────────────────
    if *mode == InstallMode::Directory {
        let path = if path_input.is_empty() {
            "<project-path>"
        } else {
            path_input
        };
        frame.render_widget(
            Paragraph::new(format!("   Path: {path}▏"))
                .style(style_system::style(StyleRole::TextPrimary)),
            chunks[2],
        );
    } else {
        frame.render_widget(
            Paragraph::new("   Path: <project-path>")
                .style(style_system::style(StyleRole::TextMuted)),
            chunks[2],
        );
    }

    frame.render_widget(
        Paragraph::new(format!("   Items: {}", items.len()))
            .style(style_system::style(StyleRole::TextMuted)),
        chunks[3],
    );

    let list = build_items_lines(items, chunks[4].width, chunks[4].height);
    frame.render_widget(Paragraph::new(list), chunks[4]);
    frame.render_widget(
        Paragraph::new(format!(
            " {} Install  ↑↓ Location  L Link  Tab Toggle  Esc Cancel",
            icons.enter_key
        ))
        .style(style_system::style(StyleRole::HintText)),
        chunks[5],
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
        lines.push(Line::from(line).style(style_system::style(StyleRole::TextPrimary)));
    }

    if has_overflow {
        let visible_count = render_rows * columns;
        let hidden = items.len().saturating_sub(visible_count);
        lines.push(
            Line::from(format!(" … and {hidden} more"))
                .style(style_system::style(StyleRole::TextMuted).add_modifier(Modifier::ITALIC)),
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
