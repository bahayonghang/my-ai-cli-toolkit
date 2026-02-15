use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::config::platform::load_platforms;
use crate::core::discovery;
use crate::tui::state::AppState;
use crate::tui::theme;

pub fn draw(frame: &mut Frame, state: &AppState) {
    let area = frame.area();
    frame.render_widget(Block::default().style(Style::default().bg(theme::BG)), area);

    let padded = Rect {
        x: area.x + 2,
        y: area.y,
        width: area.width.saturating_sub(4),
        height: area.height,
    };

    let chunks = Layout::vertical([
        Constraint::Length(3),
        Constraint::Min(1),
        Constraint::Length(1),
    ])
    .split(padded);

    // Title — centered with badge
    let title = Line::from(vec![
        Span::styled(
            "MyClaude Skills ",
            Style::default()
                .fg(theme::PRIMARY)
                .add_modifier(Modifier::BOLD),
        ),
        Span::styled(
            " Dashboard ",
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

    // Table
    let platforms = load_platforms(&state.project_root);
    let mut sorted: Vec<_> = platforms.keys().collect();
    sorted.sort();

    let rows: Vec<Row> = sorted
        .iter()
        .map(|name| {
            let p = &platforms[*name];
            let skills = discovery::discover_skills(&state.project_root, p);
            let commands = discovery::discover_commands(&state.project_root, p);
            let installed_s = skills.iter().filter(|i| i.is_installed()).count();
            let outdated_s = skills.iter().filter(|i| i.needs_update()).count();
            let installed_c = commands.iter().filter(|i| i.is_installed()).count();

            Row::new(vec![
                Cell::from(name.as_str()).style(Style::default().fg(theme::FG)),
                Cell::from(format!("{}/{}", installed_s, skills.len()))
                    .style(Style::default().fg(theme::SUCCESS)),
                Cell::from(format!("{}/{}", installed_c, commands.len()))
                    .style(Style::default().fg(theme::SECONDARY)),
                Cell::from(format!("{}", outdated_s)).style(if outdated_s > 0 {
                    Style::default().fg(theme::WARNING)
                } else {
                    Style::default().fg(theme::MUTED)
                }),
                Cell::from(if p.prompt_file.is_some() { "✓" } else { "-" })
                    .style(Style::default().fg(theme::MUTED)),
            ])
        })
        .collect();

    let header = Row::new(["Platform", "Skills", "Commands", "Outdated", "Prompt"])
        .style(
            Style::default()
                .fg(theme::ACCENT)
                .add_modifier(Modifier::BOLD),
        )
        .bottom_margin(1);

    let table = Table::new(
        rows,
        [
            Constraint::Length(16),
            Constraint::Length(10),
            Constraint::Length(10),
            Constraint::Length(10),
            Constraint::Length(8),
        ],
    )
    .header(header)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(theme::PANEL)),
    );

    frame.render_widget(table, chunks[1]);

    let footer = Line::from(vec![
        Span::styled(" [Esc]", Style::default().fg(theme::PRIMARY)),
        Span::styled(" Back ", Style::default().fg(theme::MUTED)),
        Span::styled("[q]", Style::default().fg(theme::PRIMARY)),
        Span::styled(" Quit", Style::default().fg(theme::MUTED)),
    ]);
    frame.render_widget(
        Paragraph::new(footer).style(Style::default().bg(theme::SURFACE)),
        chunks[2],
    );
}
