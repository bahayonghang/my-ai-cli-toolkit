"""Footer 组件 - 底部快捷键栏

显示快捷键提示和状态消息。

Requirements: 7.2
"""

from textual.containers import Horizontal
from textual.widgets import Static


class Footer(Static):
    """底部状态栏

    显示快捷键提示和状态消息。

    Requirements:
    - 7.2: 底部显示快捷键提示
    """

    DEFAULT_CSS = """
    Footer {
        dock: bottom;
        height: 1;
        background: $surface;
        padding: 0 1;
    }

    Footer #footer-row {
        width: 100%;
        height: 1;
    }

    Footer #keys-hint {
        width: 1fr;
        color: $text-muted;
    }

    Footer #status-info {
        width: auto;
        color: $text;
    }
    """

    # 快捷键定义 (key, description)
    KEYS = [
        ("↑↓/jk", "Navigate"),
        ("/", "Search"),
        ("c", "Check Deps"),
        ("i", "Install"),
        ("d", "Detail"),
        ("Esc", "Back"),
        ("q", "Quit"),
    ]

    def __init__(self) -> None:
        super().__init__()
        self._message = ""

    def compose(self):
        with Horizontal(id="footer-row"):
            yield Static(self._render_keys(), id="keys-hint", markup=True)
            yield Static("", id="status-info")

    def _render_keys(self) -> str:
        """渲染快捷键提示"""
        parts = []
        for key, desc in self.KEYS:
            parts.append(f"[bold]{key}[/] {desc}")
        return " | ".join(parts)

    def show_message(self, message: str, level: str = "info") -> None:
        """显示状态消息

        Args:
            message: 消息内容
            level: 消息级别 (info/success/warning/error)
        """
        self._message = message
        try:
            status = self.query_one("#status-info", Static)
            icon = {"success": "✓", "warning": "⚠", "error": "✗"}.get(level, "ℹ")
            status.update(f"{icon} {message}" if message else "")
        except Exception:
            pass

    def clear_message(self) -> None:
        """清除状态消息"""
        self._message = ""
        self.show_message("", "info")

    def show_loading(self, item_type: str = "") -> None:
        """显示加载状态"""
        self.show_message(f"Loading {item_type}..." if item_type else "Loading...", "info")

    def hide_loading(self) -> None:
        """隐藏加载状态"""
        self.clear_message()
