use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let block = Block::default()
        .title(" Platform Config ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(theme::PRIMARY))
        .style(Style::default().bg(theme::BG));
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let Some(p) = state.current_platform() else {
        frame.render_widget(
            Paragraph::new(" No platform selected").style(Style::default().fg(theme::MUTED)),
            inner,
        );
        return;
    };

    let lines = vec![
        Line::from(vec![
            Span::styled("Platform: ", Style::default().fg(theme::ACCENT)),
            Span::raw(&p.name),
        ]),
        Line::from(vec![
            Span::styled("Base: ", Style::default().fg(theme::ACCENT)),
            Span::raw(&p.base_dir),
        ]),
        Line::from(vec![
            Span::styled("Skills: ", Style::default().fg(theme::ACCENT)),
            Span::raw(p.skills_path().display().to_string()),
        ]),
        Line::from(vec![
            Span::styled("Commands: ", Style::default().fg(theme::ACCENT)),
            Span::raw(p.commands_path().display().to_string()),
        ]),
        Line::from(vec![
            Span::styled("Prompt: ", Style::default().fg(theme::ACCENT)),
            Span::raw(
                p.prompt_path()
                    .map(|p| p.display().to_string())
                    .unwrap_or("-".into()),
            ),
        ]),
        Line::default(),
        Line::from(" Esc Close").style(Style::default().fg(theme::MUTED)),
    ];
    frame.render_widget(
        Paragraph::new(lines).style(Style::default().fg(theme::FG)),
        inner,
    );
}
