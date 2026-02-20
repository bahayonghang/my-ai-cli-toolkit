use ratatui::style::{Color, Modifier, Style};

#[derive(Debug, Clone, Copy)]
pub struct Palette {
    pub primary: Color,
    pub secondary: Color,
    pub accent_bg: Color,
    pub foreground: Color,
    pub background: Color,
    pub success: Color,
    pub warning: Color,
    pub error: Color,
    pub surface: Color,
    pub panel: Color,
    pub muted: Color,
}

pub const CATPPUCCIN_MOCHA: Palette = Palette {
    primary: Color::Rgb(137, 180, 250),    // #89b4fa Blue
    secondary: Color::Rgb(116, 199, 236),  // #74c7ec Sapphire
    accent_bg: Color::Rgb(203, 166, 247),  // #cba6f7 Mauve
    foreground: Color::Rgb(205, 214, 244), // #cdd6f4 Text
    background: Color::Rgb(30, 30, 46),    // #1e1e2e Base
    success: Color::Rgb(166, 227, 161),    // #a6e3a1 Green
    warning: Color::Rgb(250, 179, 135),    // #fab387 Peach
    error: Color::Rgb(243, 139, 168),      // #f38ba8 Red
    surface: Color::Rgb(49, 50, 68),       // #313244 Surface0
    panel: Color::Rgb(69, 71, 90),         // #45475a Surface2
    muted: Color::Rgb(166, 173, 200),      // #a6adc8 Subtext0
};

pub fn palette() -> &'static Palette {
    &CATPPUCCIN_MOCHA
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StyleRole {
    ScreenBg,
    PanelBg,
    PanelBorder,
    PanelBorderFocus,
    TextPrimary,
    TextMuted,
    TextOnAccent,
    BadgeAccent,
    StatusSuccess,
    StatusWarning,
    StatusError,
    SelectionBg,
    HintKey,
    HintText,
    NotificationInfo,
    NotificationSuccess,
    NotificationWarning,
    NotificationError,
}

pub fn color(role: StyleRole) -> Color {
    let p = palette();
    match role {
        StyleRole::ScreenBg => p.background,
        StyleRole::PanelBg => p.surface,
        StyleRole::PanelBorder => p.panel,
        StyleRole::PanelBorderFocus => p.primary,
        StyleRole::TextPrimary => p.foreground,
        StyleRole::TextMuted => p.muted,
        StyleRole::TextOnAccent => p.background,
        StyleRole::BadgeAccent => p.accent_bg,
        StyleRole::StatusSuccess => p.success,
        StyleRole::StatusWarning => p.warning,
        StyleRole::StatusError => p.error,
        StyleRole::SelectionBg => p.surface,
        StyleRole::HintKey => p.primary,
        StyleRole::HintText => p.muted,
        StyleRole::NotificationInfo => p.secondary,
        StyleRole::NotificationSuccess => p.success,
        StyleRole::NotificationWarning => p.warning,
        StyleRole::NotificationError => p.error,
    }
}

pub fn style(role: StyleRole) -> Style {
    match role {
        StyleRole::ScreenBg | StyleRole::PanelBg | StyleRole::SelectionBg => {
            Style::default().bg(color(role))
        }
        StyleRole::BadgeAccent => Style::default()
            .fg(color(StyleRole::TextOnAccent))
            .bg(color(StyleRole::BadgeAccent))
            .add_modifier(Modifier::BOLD),
        _ => Style::default().fg(color(role)),
    }
}

fn color_to_rgb(color: Color) -> Option<(u8, u8, u8)> {
    match color {
        Color::Rgb(r, g, b) => Some((r, g, b)),
        _ => None,
    }
}

fn channel_to_linear(v: u8) -> f64 {
    let c = f64::from(v) / 255.0;
    if c <= 0.03928 {
        c / 12.92
    } else {
        ((c + 0.055) / 1.055).powf(2.4)
    }
}

fn relative_luminance(color: Color) -> Option<f64> {
    let (r, g, b) = color_to_rgb(color)?;
    let r = channel_to_linear(r);
    let g = channel_to_linear(g);
    let b = channel_to_linear(b);
    Some(0.2126 * r + 0.7152 * g + 0.0722 * b)
}

fn contrast_ratio(fg: Color, bg: Color) -> Option<f64> {
    let l1 = relative_luminance(fg)?;
    let l2 = relative_luminance(bg)?;
    let (bright, dark) = if l1 >= l2 { (l1, l2) } else { (l2, l1) };
    Some((bright + 0.05) / (dark + 0.05))
}

/// Runtime sanity checks for theme contrast in terminals with custom palettes.
pub fn palette_contrast_warnings() -> Vec<String> {
    palette_contrast_warnings_for(palette())
}

fn palette_contrast_warnings_for(palette: &Palette) -> Vec<String> {
    let checks = [
        (
            "TextPrimary/ScreenBg",
            palette.foreground,
            palette.background,
            4.5,
        ),
        ("TextMuted/ScreenBg", palette.muted, palette.background, 3.0),
        (
            "TextOnAccent/BadgeAccent",
            palette.background,
            palette.accent_bg,
            4.5,
        ),
        (
            "StatusSuccess/ScreenBg",
            palette.success,
            palette.background,
            3.0,
        ),
        (
            "StatusWarning/ScreenBg",
            palette.warning,
            palette.background,
            3.0,
        ),
        (
            "StatusError/ScreenBg",
            palette.error,
            palette.background,
            3.0,
        ),
    ];

    let mut warnings = Vec::new();
    for (label, fg, bg, threshold) in checks {
        if let Some(ratio) = contrast_ratio(fg, bg)
            && ratio < threshold
        {
            warnings.push(format!(
                "Low contrast detected: {label} ratio {ratio:.2} (< {threshold:.1})"
            ));
        }
    }
    warnings
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_palette_passes_contrast_matrix() {
        assert!(palette_contrast_warnings_for(&CATPPUCCIN_MOCHA).is_empty());
    }

    #[test]
    fn low_contrast_palette_reports_multiple_warnings() {
        let low = Palette {
            primary: Color::Rgb(120, 120, 120),
            secondary: Color::Rgb(120, 120, 120),
            accent_bg: Color::Rgb(58, 58, 58),
            foreground: Color::Rgb(52, 52, 52),
            background: Color::Rgb(48, 48, 48),
            success: Color::Rgb(80, 80, 80),
            warning: Color::Rgb(78, 78, 78),
            error: Color::Rgb(82, 82, 82),
            surface: Color::Rgb(54, 54, 54),
            panel: Color::Rgb(60, 60, 60),
            muted: Color::Rgb(55, 55, 55),
        };
        let warnings = palette_contrast_warnings_for(&low);
        assert!(warnings.iter().any(|w| w.contains("TextPrimary/ScreenBg")));
        assert!(
            warnings
                .iter()
                .any(|w| w.contains("TextOnAccent/BadgeAccent"))
        );
        assert!(warnings.len() >= 3);
    }
}
