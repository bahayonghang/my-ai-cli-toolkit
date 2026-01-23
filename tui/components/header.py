"""Header 组件 - 简洁顶部栏

显示标题和平台徽章，CCR 风格。支持显示项目路径。
Requirements: 3.1, 3.2, 3.3, 3.4
"""

from pathlib import Path
from textual.widgets import Static
from textual.containers import Horizontal


class Header(Static):
    """简洁顶部标题栏
    
    左侧: 🚀 标题 [项目路径]
    右侧: 平台徽章 (橙色背景) [Kiro 标识]
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
    
    def __init__(
        self, 
        platform: str = "",
        project_path: str | None = None
    ) -> None:
        super().__init__()
        self._platform = platform
        self._project_path = project_path
    
    def compose(self):
        with Horizontal(id="header-row"):
            yield Static(self._format_title(), id="app-title")
            yield Static(self._format_badge(), id="platform-badge")
    
    def _format_title(self) -> str:
        """格式化标题，包含项目路径信息"""
        title = self.APP_TITLE
        if self._project_path:
            try:
                # 尝试获取相对路径，更简洁
                rel_path = Path(self._project_path).relative_to(Path.cwd())
                title += f" | 📁 {rel_path}"
            except ValueError:
                # 如果无法获取相对路径，使用绝对路径
                title += f" | 📁 {self._project_path}"
        return title
    
    def _format_badge(self) -> str:
        """格式化平台徽章，包含 Kiro 标识"""
        badge = self._platform.upper() if self._platform else "—"
        if self._platform == "kiro":
            badge += " [KIRO]"
        return badge
    
    def set_platform(
        self, 
        platform: str,
        project_path: str | None = None
    ) -> None:
        """更新平台信息"""
        self._platform = platform
        self._project_path = project_path
        try:
            title = self.query_one("#app-title", Static)
            title.update(self._format_title())
            badge = self.query_one("#platform-badge", Static)
            badge.update(self._format_badge())
        except Exception:
            pass
