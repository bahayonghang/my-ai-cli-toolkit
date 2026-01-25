"""MyClaude Skills TUI 自定义主题

定义 MyClaude 专属的深色主题，灵感来自现代 IDE 和终端应用。

Requirements: 1.1, 1.4
"""

from textual.theme import Theme


# 主题颜色常量 - 便于测试和复用
THEME_COLORS = {
    "primary": "#22D3EE",      # Cyan-400
    "secondary": "#60A5FA",    # Blue-400
    "accent": "#F97316",       # Orange-500
    "foreground": "#F8FAFC",   # Slate-50
    "background": "#0B1020",   # Deep Navy
    "success": "#10B981",      # Emerald-500
    "warning": "#F59E0B",      # Amber-500
    "error": "#EF4444",        # Red-500
    "surface": "#111827",      # Slate-900 (Card Background)
    "panel": "#1F2937",        # Slate-800 (Border/Highlight)
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
    """创建 MyClaude 自定义主题
    
    Returns:
        配置好的 Theme 对象
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
            "text-muted": "#94A3B8",
            "text-subtle": "#7C879A",
        },
    )


# 预创建的主题实例
myclaudeTheme = create_myclaude_theme()
