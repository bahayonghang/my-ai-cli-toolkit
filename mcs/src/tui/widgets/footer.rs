use crate::model::InstallStatus;
use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let total = state.active_items().len();
    let installed = state
        .active_items()
        .iter()
        .filter(|i| i.is_installed())
        .count();
    let filter_label = match state.status_filter {
        None => "All",
        Some(InstallStatus::Installed) => "Installed",
        Some(InstallStatus::Outdated) => "Outdated",
        Some(InstallStatus::NotInstalled) => "Not Installed",
    };
    let line = Line::from(vec![
        Span::styled(" Tab", Style::default().fg(theme::PRIMARY)),
        Span::raw(" Switch "),
        Span::styled("↑↓", Style::default().fg(theme::PRIMARY)),
        Span::raw(" Nav "),
        Span::styled("Space", Style::default().fg(theme::PRIMARY)),
        Span::raw(" Sel "),
        Span::styled("i", Style::default().fg(theme::PRIMARY)),
        Span::raw(" Inst "),
        Span::styled("u", Style::default().fg(theme::PRIMARY)),
        Span::raw(" Uninst "),
        Span::styled("/", Style::default().fg(theme::PRIMARY)),
        Span::raw(" Search "),
        Span::styled("s", Style::default().fg(theme::PRIMARY)),
        Span::raw(format!(":{filter_label} ")),
        Span::styled(
            format!("✓{installed}/{total}"),
            Style::default().fg(theme::SUCCESS),
        ),
    ]);
    frame.render_widget(
        Paragraph::new(line).style(Style::default().bg(theme::SURFACE).fg(theme::MUTED)),
        area,
    );
}
