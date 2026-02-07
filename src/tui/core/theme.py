"""MyClaude Skills TUI Custom Theme

Catppuccin Mocha inspired dark theme for modern IDE-like aesthetics.

Requirements: 1.1, 1.4
"""

from textual.theme import Theme

# Theme color constants - for testing and reuse
# Catppuccin Mocha palette
THEME_COLORS = {
    "primary": "#89b4fa",      # Blue (soft blue accent)
    "secondary": "#74c7ec",    # Sapphire (complementary)
    "accent": "#cba6f7",       # Mauve (highlight/selection)
    "foreground": "#cdd6f4",   # Text (readable light)
    "background": "#1e1e2e",   # Base (warm dark)
    "success": "#a6e3a1",      # Green (confirmation)
    "warning": "#fab387",      # Peach (attention)
    "error": "#f38ba8",        # Red (error/danger)
    "surface": "#313244",      # Surface0 (elevated panels)
    "panel": "#45475a",        # Surface2 (borders/dividers)
}

# 必需的主题属性列表
REQUIRED_THEME_PROPERTIES = [
    "primary",
    "secondary",
    "accent",
    "foreground",
    "background",
    "success",
    "warning",
    "error",
    "surface",
    "panel",
]


def create_myclaude_theme() -> Theme:
    """Create the MyClaude custom theme.

    Returns:
        Configured Theme object with Catppuccin Mocha palette
    """
    return Theme(
        name="myclaude",
        primary=THEME_COLORS["primary"],
        secondary=THEME_COLORS["secondary"],
        accent=THEME_COLORS["accent"],
        foreground=THEME_COLORS["foreground"],
        background=THEME_COLORS["background"],
        success=THEME_COLORS["success"],
        warning=THEME_COLORS["warning"],
        error=THEME_COLORS["error"],
        surface=THEME_COLORS["surface"],
        panel=THEME_COLORS["panel"],
        dark=True,
        variables={
            "block-cursor-text-style": "bold",
            "footer-key-foreground": THEME_COLORS["primary"],
            "input-selection-background": f"{THEME_COLORS['primary']} 40%",
            "input-cursor-foreground": THEME_COLORS["primary"],
            "text-muted": "#a6adc8",     # Subtext0
            "text-subtle": "#6c7086",     # Overlay0
        },
    )


# Pre-created theme instance
myclaudeTheme = create_myclaude_theme()
