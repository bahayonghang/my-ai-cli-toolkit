"""平台选择屏幕

启动时首先显示，让用户选择目标平台。
支持键盘导航和选择。

Requirements: 1.1, 1.2, 1.3, 1.4
"""

from dataclasses import dataclass

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import OptionList, Static
from textual.widgets.option_list import Option


@dataclass
class PlatformConfig:
    """平台配置数据类"""

    id: str
    name: str
    path: str


# 平台图标映射
PLATFORM_ICONS = {
    "claude": "🤖",
    "codex": "📦",
    "gemini": "✨",
    "kiro": "🔮",
    "windsurf": "🏄",
    "cursor": "🖱️",
    "copilot": "🚁",
}


class PlatformSelectScreen(Screen):
    """平台选择屏幕 - 全屏现代设计

    高屏占比布局，顶部标题栏 + 中央选择区 + 底部提示栏

    Requirements:
    - 1.1: 启动时显示平台选择界面
    - 1.2: 方向键导航高亮显示
    - 1.3: Enter 键确认选择并进入主界面
    - 1.4: 显示所有支持的平台
    """

    BINDINGS = [
        Binding("escape", "quit", "Quit", show=True),
    ]

    DEFAULT_CSS = """
    PlatformSelectScreen {
        background: $background;
        layout: vertical;
    }

    /* 顶部标题区 */
    PlatformSelectScreen #header-area {
        width: 100%;
        height: 5;
        background: $surface;
        border-bottom: solid $primary;
        align: center middle;
    }

    PlatformSelectScreen #brand {
        width: 100%;
        height: 100%;
        align: center middle;
    }

    PlatformSelectScreen #brand-text {
        text-style: bold;
        color: $primary;
        text-align: center;
        width: 100%;
    }

    /* 中央内容区 */
    PlatformSelectScreen #main-area {
        width: 100%;
        height: 1fr;
        align: center middle;
    }

    PlatformSelectScreen #select-container {
        width: 80%;
        max-width: 100;
        height: auto;
        padding: 2 4;
    }

    PlatformSelectScreen #subtitle {
        text-align: center;
        color: $text-muted;
        padding: 0 0 2 0;
    }

    /* 平台选项列表 - 大尺寸卡片风格 */
    PlatformSelectScreen #platform-list {
        width: 100%;
        height: auto;
        border: round $panel;
        padding: 1 2;
        background: $surface;
    }

    PlatformSelectScreen #platform-list:focus {
        border: round $accent;
    }

    PlatformSelectScreen #platform-list > .option-list--option-highlighted {
        background: $success;
        color: $background;
        text-style: bold;
    }

    /* 底部提示栏 */
    PlatformSelectScreen #footer-area {
        width: 100%;
        height: 1;
        background: $surface;
        border-top: solid $panel;
    }

    PlatformSelectScreen #footer-row {
        width: 100%;
        height: 1;
        padding: 0 2;
    }

    PlatformSelectScreen #hint {
        width: 1fr;
        color: $text-muted;
    }

    PlatformSelectScreen #version {
        width: auto;
        color: $text-muted;
    }
    """

    # 平台配置 - 支持所有目标平台
    PLATFORMS = [
        PlatformConfig("claude", "Claude", "~/.claude/"),
        PlatformConfig("codex", "Codex", "~/.codex/"),
        PlatformConfig("gemini", "Gemini", "~/.gemini/"),
        PlatformConfig("kiro", "Kiro", "~/.kiro/"),
        PlatformConfig("windsurf", "Windsurf", "~/.codeium/windsurf/"),
        PlatformConfig("cursor", "Cursor", "~/.cursor/"),
        PlatformConfig("copilot", "Copilot", "~/.copilot/"),
    ]

    def compose(self) -> ComposeResult:
        """组合屏幕组件

        Requirements:
        - 1.1: 显示平台选择界面
        - 1.4: 显示所有支持的平台
        """
        # 顶部标题栏 - 使用大字体 ASCII 风格
        with Vertical(id="header-area"):
            with Vertical(id="brand"):
                yield Static("📦  E x t e r n a l   S k i l l s   M a n a g e r  📦", id="brand-text")

        # 中央选择区
        with Vertical(id="main-area"):
            with Vertical(id="select-container"):
                yield Static("Select your target platform", id="subtitle")
                yield OptionList(*[Option(self._format_option(p), id=p.id) for p in self.PLATFORMS], id="platform-list")

        # 底部提示栏
        with Vertical(id="footer-area"):
            with Horizontal(id="footer-row"):
                yield Static("↑↓ Navigate  ⏎ Select  ⎋ Quit", id="hint")
                yield Static("v1.0", id="version")

    def _format_option(self, platform: PlatformConfig) -> str:
        """格式化平台选项显示 - 带上下空行增加间距

        Args:
            platform: 平台配置对象

        Returns:
            格式化后的选项字符串
        """
        icon = PLATFORM_ICONS.get(platform.id, "📁")
        name = platform.name.ljust(10)
        return f"\n{icon}  {name}  →  {platform.path}\n"

    def on_mount(self) -> None:
        """屏幕挂载时聚焦平台列表

        Requirements:
        - 1.2: 支持方向键导航
        """
        self.query_one("#platform-list", OptionList).focus()

    def on_option_list_option_selected(self, event: OptionList.OptionSelected) -> None:
        """处理平台选择事件

        Requirements:
        - 1.3: Enter 键确认选择并进入主界面

        Args:
            event: 选项选择事件
        """
        if event.option.id:
            self.app.set_platform(str(event.option.id))

    def action_quit(self) -> None:
        """退出应用"""
        self.app.exit()
