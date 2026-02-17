use crate::model::InstallStatus;
use crate::tui::state::{AppState, NotificationLevel, PopupKind, Screen};
use crate::tui::style_system::{self, FooterToken};
use crate::tui::theme::{self, StyleRole};
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let left = style_system::footer_line(&help_tokens_for_state(state));
    frame.render_widget(
        Paragraph::new(left)
            .style(style_system::style(StyleRole::PanelBg).fg(theme::color(StyleRole::HintText))),
        area,
    );

    let mut right_spans = if let Some(progress) = &state.progress {
        vec![
            Span::styled("[Batch] ", style_system::style(StyleRole::HintKey)),
            Span::styled(
                format!(
                    "{} {}/{} ",
                    progress.label, progress.current, progress.total
                ),
                style_system::style(StyleRole::TextPrimary),
            ),
            Span::styled(
                format!("ok:{} ", progress.success),
                style_system::style(StyleRole::StatusSuccess),
            ),
            Span::styled(
                format!("fail:{} ", progress.failed),
                if progress.failed > 0 {
                    style_system::style(StyleRole::StatusError)
                } else {
                    style_system::style(StyleRole::HintText)
                },
            ),
        ]
    } else {
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
        vec![
            Span::styled("[Filter] ", style_system::style(StyleRole::HintKey)),
            Span::styled(filter_label, style_system::style(StyleRole::HintText)),
            Span::raw("  "),
            Span::styled(
                format!("✓{installed}/{total}"),
                style_system::style(StyleRole::StatusSuccess),
            ),
        ]
    };

    if let Some(note) = state.latest_notification() {
        right_spans.push(Span::raw(" | "));
        let style = match note.level {
            NotificationLevel::Info => style_system::style(StyleRole::NotificationInfo),
            NotificationLevel::Success => style_system::style(StyleRole::NotificationSuccess),
            NotificationLevel::Warning => style_system::style(StyleRole::NotificationWarning),
            NotificationLevel::Error => style_system::style(StyleRole::NotificationError),
        };
        right_spans.push(Span::styled(note.message.clone(), style));
    }

    frame.render_widget(
        Paragraph::new(Line::from(right_spans))
            .alignment(Alignment::Right)
            .style(style_system::style(StyleRole::PanelBg)),
        area,
    );
}

pub(crate) fn help_tokens_for_state(state: &AppState) -> Vec<FooterToken> {
    if let Some(popup) = &state.popup {
        return match popup {
            PopupKind::Install { .. } => vec![
                FooterToken::new("[↑↓]", "Mode"),
                FooterToken::new("[Tab]", "Toggle"),
                FooterToken::new("[Enter]", "Install"),
                FooterToken::new("[Esc]", "Cancel"),
            ],
            PopupKind::Confirm { .. } => vec![
                FooterToken::new("[y/Enter]", "Confirm"),
                FooterToken::new("[n/Esc]", "Cancel"),
            ],
            PopupKind::Detail { .. } | PopupKind::Diff { .. } => vec![
                FooterToken::new("[j/k]", "Scroll"),
                FooterToken::new("[PgUp/PgDn]", "Page"),
                FooterToken::new("[Esc]", "Close"),
            ],
            PopupKind::Prompt { has_diff, .. } => {
                let mut tokens = vec![
                    FooterToken::new("[j/k]", "Scroll"),
                    FooterToken::new("[PgUp/PgDn]", "Page"),
                    FooterToken::new("[Esc]", "Close"),
                ];
                if *has_diff {
                    tokens.insert(0, FooterToken::new("[Enter]", "Update"));
                }
                tokens
            }
            PopupKind::PlatformConfig => vec![FooterToken::new("[Esc]", "Close")],
            PopupKind::MultiSync { .. } => vec![
                FooterToken::new("[↑↓]", "Select"),
                FooterToken::new("[Space]", "Toggle"),
                FooterToken::new("[Enter]", "Sync"),
                FooterToken::new("[Esc]", "Cancel"),
            ],
        };
    }

    match state.screen {
        Screen::PlatformSelect => vec![
            FooterToken::new("[↑↓]", "Navigate"),
            FooterToken::new("[Enter]", "Select"),
            FooterToken::new("[d]", "Dashboard"),
            FooterToken::new("[q]", "Quit"),
        ],
        Screen::Dashboard => vec![
            FooterToken::new("[Esc]", "Back"),
            FooterToken::new("[q]", "Quit"),
        ],
        Screen::Main => vec![
            FooterToken::new("[Tab]", "Focus"),
            FooterToken::new("[↑↓]", "Move"),
            FooterToken::new("[Space]", "Select"),
            FooterToken::new("[i/u]", "Install/Uninstall"),
            FooterToken::new("[S]", "Sync"),
            FooterToken::new("[/]", "Search"),
            FooterToken::new("[s]", "Filter"),
            FooterToken::new("[q]", "Quit"),
        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::platform::default_platforms;
    use std::path::PathBuf;

    fn base_state() -> AppState {
        AppState::new(PathBuf::from("."), default_platforms())
    }

    #[test]
    fn help_tokens_change_by_screen() {
        let mut state = base_state();
        state.screen = Screen::PlatformSelect;
        let platform = help_tokens_for_state(&state);
        assert!(platform.iter().any(|t| t.label == "Dashboard"));

        state.screen = Screen::Dashboard;
        let dashboard = help_tokens_for_state(&state);
        assert!(dashboard.iter().all(|t| t.label != "Dashboard"));
        assert!(dashboard.iter().any(|t| t.label == "Back"));
    }

    #[test]
    fn popup_tokens_override_main_tokens() {
        let mut state = base_state();
        state.screen = Screen::Main;
        state.popup = Some(PopupKind::MultiSync {
            selected_platforms: std::collections::HashSet::new(),
            cursor: 0,
        });
        let tokens = help_tokens_for_state(&state);
        assert!(tokens.iter().any(|t| t.label == "Sync"));
        assert!(!tokens.iter().any(|t| t.label == "Search"));
    }
}
