"""Footer 组件 - 简洁底部快捷键栏

CCR 风格的单行快捷键提示。
Requirements: 5.1, 5.2, 5.3, 5.4
"""

from textual.containers import Horizontal
from textual.widgets import Static


class Footer(Static):
    """简洁底部状态栏

    单行显示: Keys: Tab Switch | ↔ Page | ↑↓/jk Select | Enter Apply | q Quit
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

    Footer .key {
        color: $accent;
        text-style: bold;
    }
    """

    # 快捷键定义 (key, description)
    KEYS = [
        ("Tab", "Switch"),
        ("↑↓/jk", "Select"),
        ("Space", "Toggle"),
        ("a", "All"),
        ("i", "Install"),
        ("Esc", "Back"),
        ("q", "Quit"),
    ]

    def __init__(self) -> None:
        super().__init__()
        self._message = ""
        self._selected_count = 0
        self._installed_count = 0
        self._total_count = 0
        self._outdated_count = 0  # 需要更新的数量

    def compose(self):
        with Horizontal(id="footer-row"):
            yield Static(self._render_keys(), id="keys-hint", markup=True)
            yield Static("", id="status-info")

    def _render_keys(self) -> str:
        """渲染快捷键提示"""
        parts = []
        for key, desc in self.KEYS:
            parts.append(f"[bold $accent]{key}[/] {desc}")
        return "Keys: " + " | ".join(parts)

    def show_message(self, message: str, level: str = "info") -> None:
        """显示状态消息"""
        self._message = message
        try:
            status = self.query_one("#status-info", Static)
            icon = {"success": "✓", "warning": "⚠", "error": "✗"}.get(level, "ℹ")
            status.update(f"{icon} {message}" if message else "")
        except Exception:
            pass

    def update_selection_count(self, count: int) -> None:
        """更新选中计数"""
        self._selected_count = count
        self._update_status_display()

    def update_installed_count(self, installed: int, total: int, outdated: int = 0) -> None:
        """更新已安装统计

        Args:
            installed: 已安装数量
            total: 总数量
            outdated: 需要更新的数量
        """
        self._installed_count = installed
        self._total_count = total
        self._outdated_count = outdated
        self._update_status_display()

    def _update_status_display(self) -> None:
        """更新状态显示"""
        try:
            status = self.query_one("#status-info", Static)
            if self._message:
                return  # 有消息时不覆盖

            parts = []
            if self._selected_count > 0:
                parts.append(f"Selected: {self._selected_count}")
            if self._total_count > 0:
                parts.append(f"✓ Installed {self._installed_count}/{self._total_count}")
            if self._outdated_count > 0:
                parts.append(f"⚠ {self._outdated_count} need update")

            status.update("  ".join(parts) if parts else "")
        except Exception:
            pass

    def clear_message(self) -> None:
        self.show_message("", "info")

    def show_loading(self, item_type: str = "") -> None:
        self.show_message(f"Loading {item_type}..." if item_type else "Loading...", "info")

    def show_progress(self, action: str, current: int, total: int) -> None:
        self.show_message(f"{action} {current}/{total}...", "info")

    def hide_loading(self) -> None:
        self.clear_message()
