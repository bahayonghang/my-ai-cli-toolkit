"""Header 组件 - 简洁顶部栏

显示标题和平台徽章，CCR 风格。
Requirements: 3.1, 3.2, 3.3, 3.4
"""

from textual.widgets import Static
from textual.containers import Horizontal


class Header(Static):
    """简洁顶部标题栏
    
    左侧: 🚀 标题
    右侧: 平台徽章 (橙色背景)
    """
    
    DEFAULT_CSS = """
    Header {
        dock: top;
        height: 1;
        background: $primary;
        padding: 0 1;
    }
    
    Header #header-row {
        width: 100%;
        height: 1;
    }
    
    Header #app-title {
        width: 1fr;
        color: $text;
        text-style: bold;
    }
    
    Header #platform-badge {
        width: auto;
        min-width: 10;
        background: $warning;
        color: $background;
        text-style: bold;
        padding: 0 2;
    }
    """
    
    APP_TITLE = "🚀 MyClaude Skills Manager"
    
    def __init__(self, platform: str = "") -> None:
        super().__init__()
        self._platform = platform
    
    def compose(self):
        with Horizontal(id="header-row"):
            yield Static(self.APP_TITLE, id="app-title")
            yield Static(self._format_badge(), id="platform-badge")
    
    def _format_badge(self) -> str:
        return self._platform.upper() if self._platform else "—"
    
    def set_platform(self, platform: str) -> None:
        self._platform = platform
        try:
            badge = self.query_one("#platform-badge", Static)
            badge.update(self._format_badge())
        except Exception:
            pass
