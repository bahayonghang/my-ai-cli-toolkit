"""格式化工具函数

提供 TUI 界面中各种元素的格式化函数。

Requirements: 2.4, 3.2, 4.1, 4.2, 5.1, 5.2
"""

from typing import NamedTuple


class PlatformConfig(NamedTuple):
    """平台配置数据结构"""
    id: str
    name: str
    path: str


# Unicode 符号常量
CHECKBOX_CHECKED = "☑"
CHECKBOX_UNCHECKED = "☐"
STATUS_INSTALLED = "✓"
STATUS_NOT_INSTALLED = "○"
ICON_SUCCESS = "✓"
ICON_WARNING = "⚠"
ICON_ERROR = "✗"
ICON_INFO = "ℹ"
ARROW_INDICATOR = "▸"


def format_platform_option(platform: PlatformConfig) -> str:
    """格式化平台选项显示文本

    Args:
        platform: 平台配置 (id, name, path)

    Returns:
        格式化后的选项文本，包含平台名称和目标路径

    Example:
        >>> format_platform_option(PlatformConfig("claude", "Claude", "~/.claude/"))
        'Claude    ~/.claude/'

    Requirements: 2.4 - 平台选项应显示名称和目标路径
    """
    # 使用固定宽度格式化，确保对齐
    return f"{platform.name:<10}{platform.path}"


def format_platform_badge(platform_name: str) -> str:
    """格式化 Header 平台徽章

    Args:
        platform_name: 平台名称

    Returns:
        大写格式的平台名称

    Example:
        >>> format_platform_badge("claude")
        'CLAUDE'

    Requirements: 3.2 - 平台徽章应显示大写格式
    """
    return platform_name.upper()


def format_checkbox(selected: bool) -> str:
    """格式化复选框符号

    Args:
        selected: 是否选中

    Returns:
        Unicode 复选框符号

    Example:
        >>> format_checkbox(True)
        '☑'
        >>> format_checkbox(False)
        '☐'

    Requirements: 4.1 - 使用 Unicode 复选框符号
    """
    return CHECKBOX_CHECKED if selected else CHECKBOX_UNCHECKED


def format_status_icon(installed: bool) -> str:
    """格式化安装状态图标

    Args:
        installed: 是否已安装

    Returns:
        Unicode 状态图标

    Example:
        >>> format_status_icon(True)
        '✓'
        >>> format_status_icon(False)
        '○'

    Requirements: 4.2 - 使用 Unicode 状态图标
    """
    return STATUS_INSTALLED if installed else STATUS_NOT_INSTALLED


def format_selection_count(count: int) -> str:
    """格式化选中计数显示

    Args:
        count: 选中数量 (非负整数)

    Returns:
        格式化的选中计数文本，count > 0 时显示 "Selected: N"，否则为空

    Example:
        >>> format_selection_count(3)
        'Selected: 3'
        >>> format_selection_count(0)
        ''

    Requirements: 5.2 - 选中计数显示格式
    """
    if count > 0:
        return f"Selected: {count}"
    return ""


def get_message_icon(level: str) -> str:
    """获取消息级别对应的图标

    Args:
        level: 消息级别 (info, success, warning, error)

    Returns:
        对应的 Unicode 图标

    Requirements: 5.1 - 状态消息前添加语义图标
    """
    icons = {
        "info": ICON_INFO,
        "success": ICON_SUCCESS,
        "warning": ICON_WARNING,
        "error": ICON_ERROR,
    }
    return icons.get(level, ICON_INFO)


def get_message_css_class(level: str) -> str:
    """获取消息级别对应的 CSS 类名

    Args:
        level: 消息级别 (info, success, warning, error)

    Returns:
        CSS 类名

    Requirements: 5.1 - 状态消息应用对应的 CSS 类
    """
    valid_levels = {"info", "success", "warning", "error"}
    if level in valid_levels:
        return f"status-{level}"
    return "status-info"


# 空状态和加载状态常量
ICON_EMPTY = "📭"
ICON_LOADING = "⏳"
ICON_PROGRESS = "⚙"


def format_empty_state_message(item_type: str) -> str:
    """格式化空列表状态消息

    Args:
        item_type: 项目类型 ("skills" 或 "commands")

    Returns:
        格式化后的空状态消息，包含图标

    Example:
        >>> format_empty_state_message("skills")
        '📭 No skills found'
        >>> format_empty_state_message("commands")
        '📭 No commands found'

    Requirements: 9.1 - 空列表应显示居中消息和图标
    """
    return f"{ICON_EMPTY} No {item_type} found"


def format_loading_message(item_type: str = "") -> str:
    """格式化加载状态消息

    Args:
        item_type: 项目类型 (可选)

    Returns:
        格式化后的加载消息，包含图标

    Example:
        >>> format_loading_message("skills")
        '⏳ Loading skills...'
        >>> format_loading_message()
        '⏳ Loading...'

    Requirements: 9.2 - 加载状态应显示加载指示器
    """
    if item_type:
        return f"{ICON_LOADING} Loading {item_type}..."
    return f"{ICON_LOADING} Loading..."


def format_progress_message(action: str, current: int, total: int) -> str:
    """格式化进度消息

    Args:
        action: 操作名称 (如 "Installing")
        current: 当前进度
        total: 总数

    Returns:
        格式化后的进度消息，包含图标和进度数字

    Example:
        >>> format_progress_message("Installing", 2, 5)
        '⚙ Installing... (2/5)'

    Requirements: 9.2, 9.3 - 进度状态应显示进度指示
    """
    return f"{ICON_PROGRESS} {action}... ({current}/{total})"
