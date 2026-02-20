use ratatui::prelude::*;
use ratatui::widgets::{Block, Borders};
use unicode_width::{UnicodeWidthChar, UnicodeWidthStr};

use crate::tui::theme::{self, StyleRole};

#[derive(Debug, Clone, Copy)]
pub struct LayoutMetrics {
    pub header_height: u16,
    pub footer_height: u16,
    pub progress_height: u16,
    pub sidebar_width: u16,
    pub popup_padding: u16,
}

pub fn layout_metrics() -> LayoutMetrics {
    LayoutMetrics {
        header_height: 1,
        footer_height: 1,
        progress_height: 1,
        sidebar_width: 24,
        popup_padding: 2,
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FooterToken {
    pub key: String,
    pub label: String,
}

impl FooterToken {
    pub fn new(key: impl Into<String>, label: impl Into<String>) -> Self {
        Self {
            key: key.into(),
            label: label.into(),
        }
    }
}

pub fn footer_line(tokens: &[FooterToken]) -> Line<'static> {
    let mut spans = Vec::new();
    for token in tokens {
        spans.push(Span::styled(token.key.clone(), style(StyleRole::HintKey)));
        spans.push(Span::styled(
            format!(" {}  ", token.label),
            style(StyleRole::HintText),
        ));
    }
    Line::from(spans)
}

#[derive(Debug, Clone, Copy)]
pub struct IconSet {
    pub cursor: &'static str,
    pub checked: &'static str,
    pub unchecked: &'static str,
    pub installed: &'static str,
    pub not_installed: &'static str,
    pub outdated: &'static str,
    pub tab_selected: &'static str,
    pub tab_unselected: &'static str,
    pub bullet: &'static str,
    pub default_category: &'static str,
    pub enter_key: &'static str,
}

pub fn icons() -> IconSet {
    icons_with_ascii(ascii_mode())
}

fn ascii_mode() -> bool {
    match std::env::var("MCS_ASCII") {
        Ok(v) => {
            let normalized = v.trim().to_ascii_lowercase();
            matches!(normalized.as_str(), "1" | "true" | "yes" | "on")
        }
        Err(_) => false,
    }
}

fn icons_with_ascii(ascii: bool) -> IconSet {
    if ascii {
        IconSet {
            cursor: "> ",
            checked: "[x]",
            unchecked: "[ ]",
            installed: "OK",
            not_installed: "--",
            outdated: "!!",
            tab_selected: "*",
            tab_unselected: "o",
            bullet: "-",
            default_category: "*",
            enter_key: "Enter",
        }
    } else {
        IconSet {
            cursor: "▸ ",
            checked: "☑",
            unchecked: "☐",
            installed: "✓",
            not_installed: "○",
            outdated: "⚠",
            tab_selected: "◉",
            tab_unselected: "○",
            bullet: "•",
            default_category: "★",
            enter_key: "⏎",
        }
    }
}

pub fn style(role: StyleRole) -> Style {
    theme::style(role)
}

pub fn modal_block(title: &str) -> Block<'static> {
    Block::default()
        .title(format!(" {title} "))
        .borders(Borders::ALL)
        .border_style(style(StyleRole::PanelBorderFocus))
        .style(style(StyleRole::ScreenBg))
}

pub fn truncate_display_width(text: &str, max_width: usize) -> String {
    if max_width == 0 {
        return String::new();
    }
    if UnicodeWidthStr::width(text) <= max_width {
        return text.to_string();
    }

    let ellipsis = '…';
    let ellipsis_w = UnicodeWidthChar::width(ellipsis).unwrap_or(1);
    if max_width <= ellipsis_w {
        return ellipsis.to_string();
    }
    let limit = max_width - ellipsis_w;

    let mut out = String::new();
    let mut width = 0;
    for ch in text.chars() {
        let ch_width = UnicodeWidthChar::width(ch).unwrap_or(0);
        if width + ch_width > limit {
            break;
        }
        width += ch_width;
        out.push(ch);
    }
    out.push(ellipsis);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn truncate_handles_mixed_wide_characters() {
        let input = "Alpha中文Beta🚀Gamma";
        let truncated = truncate_display_width(input, 10);
        assert!(UnicodeWidthStr::width(truncated.as_str()) <= 10);
        assert!(truncated.ends_with('…'));
    }

    #[test]
    fn unicode_and_ascii_icons_are_distinct() {
        let unicode = icons_with_ascii(false);
        let ascii = icons_with_ascii(true);
        assert_ne!(unicode.checked, ascii.checked);
        assert_eq!(ascii.enter_key, "Enter");
        assert_eq!(unicode.enter_key, "⏎");
    }
}
