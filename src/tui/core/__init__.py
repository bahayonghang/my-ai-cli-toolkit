"""
TUI core business logic module.

Contains:
- models: Data models (ItemType, InstallStatus, ItemInfo, InstallResult)
- manager: TUIManager wrapping SkillManager
- theme: MyClaude custom theme
- formatters: Formatting utilities
"""

from .formatters import (
    ARROW_INDICATOR,
    CHECKBOX_CHECKED,
    CHECKBOX_UNCHECKED,
    ICON_EMPTY,
    ICON_LOADING,
    ICON_PROGRESS,
    STATUS_INSTALLED,
    STATUS_NOT_INSTALLED,
    PlatformDisplay,
    format_checkbox,
    format_empty_state_message,
    format_loading_message,
    format_platform_badge,
    format_platform_option,
    format_progress_message,
    format_selection_count,
    format_status_icon,
    get_message_css_class,
    get_message_icon,
)
from .manager import TUIManager
from .models import InstallResult, InstallStatus, ItemInfo, ItemType
from .theme import REQUIRED_THEME_PROPERTIES, THEME_COLORS, myclaudeTheme

__all__ = [
    "ItemType",
    "InstallStatus",
    "ItemInfo",
    "InstallResult",
    "TUIManager",
    "myclaudeTheme",
    "THEME_COLORS",
    "REQUIRED_THEME_PROPERTIES",
    # Formatters
    "PlatformDisplay",
    "format_platform_option",
    "format_platform_badge",
    "format_checkbox",
    "format_status_icon",
    "format_selection_count",
    "get_message_icon",
    "get_message_css_class",
    "format_empty_state_message",
    "format_loading_message",
    "format_progress_message",
    "CHECKBOX_CHECKED",
    "CHECKBOX_UNCHECKED",
    "STATUS_INSTALLED",
    "STATUS_NOT_INSTALLED",
    "ARROW_INDICATOR",
    "ICON_EMPTY",
    "ICON_LOADING",
    "ICON_PROGRESS",
]
