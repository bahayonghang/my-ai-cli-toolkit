use crate::tui::state::AppState;
use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub fn draw(frame: &mut Frame, area: Rect, state: &AppState) {
    let block = style_system::modal_block("Platform Config");
    let inner = block.inner(area);
    frame.render_widget(block, area);

    let Some(p) = state.current_platform() else {
        frame.render_widget(
            Paragraph::new(" No platform selected")
                .style(style_system::style(StyleRole::TextMuted)),
            inner,
        );
        return;
    };

    let lines = vec![
        Line::from(vec![
            Span::styled("Platform: ", style_system::style(StyleRole::HintKey)),
            Span::raw(&p.name),
        ]),
        Line::from(vec![
            Span::styled("Base: ", style_system::style(StyleRole::HintKey)),
            Span::raw(&p.base_dir),
        ]),
        Line::from(vec![
            Span::styled("Skills: ", style_system::style(StyleRole::HintKey)),
            Span::raw(p.skills_path().display().to_string()),
        ]),
        Line::from(vec![
            Span::styled("Commands: ", style_system::style(StyleRole::HintKey)),
            Span::raw(p.commands_path().display().to_string()),
        ]),
        Line::from(vec![
            Span::styled("Prompt: ", style_system::style(StyleRole::HintKey)),
            Span::raw(
                p.prompt_path()
                    .map(|p| p.display().to_string())
                    .unwrap_or("-".into()),
            ),
        ]),
        Line::default(),
        Line::from(" Esc Close").style(style_system::style(StyleRole::HintText)),
    ];
    frame.render_widget(
        Paragraph::new(lines).style(style_system::style(StyleRole::TextPrimary)),
        inner,
    );
}
