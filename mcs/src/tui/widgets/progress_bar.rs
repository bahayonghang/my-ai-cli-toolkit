use crate::tui::state::AppState;
use crate::tui::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

#[allow(dead_code)]
pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    if let Some(ref progress) = state.progress {
        let pct = if progress.total > 0 {
            progress.current as f64 / progress.total as f64
        } else {
            0.0
        };
        let gauge = Gauge::default()
            .gauge_style(Style::default().fg(theme::PRIMARY).bg(theme::SURFACE))
            .ratio(pct)
            .label(format!(
                "{} ({}/{})",
                progress.label, progress.current, progress.total
            ));
        frame.render_widget(gauge, area);
    }
}
