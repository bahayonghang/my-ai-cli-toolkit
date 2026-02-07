"""Formatting utilities for TUI display.

Requirements: 2.4, 3.2, 4.1, 4.2, 5.1, 5.2
"""

from typing import NamedTuple


class PlatformDisplay(NamedTuple):
    """Platform display data (for TUI rendering only).

    Renamed from PlatformConfig to avoid clash with core.config_loader.PlatformConfig.
    """

    id: str
    name: str
    path: str


# Unicode symbol constants
CHECKBOX_CHECKED = "☑"
CHECKBOX_UNCHECKED = "☐"
STATUS_INSTALLED = "✓"
STATUS_NOT_INSTALLED = "○"
ICON_SUCCESS = "✓"
ICON_WARNING = "⚠"
ICON_ERROR = "✗"
ICON_INFO = "ℹ"
ARROW_INDICATOR = "▸"


def format_platform_option(platform: PlatformDisplay) -> str:
    """Format platform option display text.

    Args:
        platform: Platform display info (id, name, path)

    Returns:
        Formatted option text with platform name and target path

    Example:
        >>> format_platform_option(PlatformDisplay("claude", "Claude", "~/.claude/"))
        'Claude    ~/.claude/'

    Requirements: 2.4
    """
    return f"{platform.name:<10}{platform.path}"


def format_platform_badge(platform_name: str) -> str:
    """Format Header platform badge.

    Args:
        platform_name: Platform name

    Returns:
        Uppercase platform name

    Example:
        >>> format_platform_badge("claude")
        'CLAUDE'

    Requirements: 3.2
    """
    return platform_name.upper()


def format_checkbox(selected: bool) -> str:
    """Format checkbox symbol.

    Args:
        selected: Whether selected

    Returns:
        Unicode checkbox symbol

    Example:
        >>> format_checkbox(True)
        '☑'
        >>> format_checkbox(False)
        '☐'

    Requirements: 4.1
    """
    return CHECKBOX_CHECKED if selected else CHECKBOX_UNCHECKED


def format_status_icon(installed: bool) -> str:
    """Format installation status icon.

    Args:
        installed: Whether installed

    Returns:
        Unicode status icon

    Example:
        >>> format_status_icon(True)
        '✓'
        >>> format_status_icon(False)
        '○'

    Requirements: 4.2
    """
    return STATUS_INSTALLED if installed else STATUS_NOT_INSTALLED


def format_selection_count(count: int) -> str:
    """Format selection count display.

    Args:
        count: Selected count (non-negative integer)

    Returns:
        Formatted selection count text

    Example:
        >>> format_selection_count(3)
        'Selected: 3'
        >>> format_selection_count(0)
        ''

    Requirements: 5.2
    """
    if count > 0:
        return f"Selected: {count}"
    return ""


def get_message_icon(level: str) -> str:
    """Get icon for message level.

    Args:
        level: Message level (info, success, warning, error)

    Returns:
        Corresponding Unicode icon

    Requirements: 5.1
    """
    icons = {
        "info": ICON_INFO,
        "success": ICON_SUCCESS,
        "warning": ICON_WARNING,
        "error": ICON_ERROR,
    }
    return icons.get(level, ICON_INFO)


def get_message_css_class(level: str) -> str:
    """Get CSS class name for message level.

    Args:
        level: Message level (info, success, warning, error)

    Returns:
        CSS class name

    Requirements: 5.1
    """
    valid_levels = {"info", "success", "warning", "error"}
    if level in valid_levels:
        return f"status-{level}"
    return "status-info"


# Empty state and loading state constants
ICON_EMPTY = "📭"
ICON_LOADING = "⏳"
ICON_PROGRESS = "⚙"


def format_empty_state_message(item_type: str) -> str:
    """Format empty list state message.

    Example:
        >>> format_empty_state_message("skills")
        '📭 No skills found'

    Requirements: 9.1
    """
    return f"{ICON_EMPTY} No {item_type} found"


def format_loading_message(item_type: str = "") -> str:
    """Format loading state message.

    Example:
        >>> format_loading_message("skills")
        '⏳ Loading skills...'

    Requirements: 9.2
    """
    if item_type:
        return f"{ICON_LOADING} Loading {item_type}..."
    return f"{ICON_LOADING} Loading..."


def format_progress_message(action: str, current: int, total: int) -> str:
    """Format progress message.

    Example:
        >>> format_progress_message("Installing", 2, 5)
        '⚙ Installing... (2/5)'

    Requirements: 9.2, 9.3
    """
    return f"{ICON_PROGRESS} {action}... ({current}/{total})"
