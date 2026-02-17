use crate::tui::state::AppState;
use crate::tui::style_system;
use crate::tui::theme::{self, StyleRole};
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
            .gauge_style(
                style_system::style(StyleRole::HintKey).bg(theme::color(StyleRole::PanelBg)),
            )
            .ratio(pct)
            .label(format!(
                "{} ({}/{})",
                progress.label, progress.current, progress.total
            ));
        frame.render_widget(gauge, area);
    }
}
