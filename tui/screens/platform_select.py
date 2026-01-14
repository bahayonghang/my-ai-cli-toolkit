"""平台选择屏幕

启动时首先显示，让用户选择目标平台 (Claude, Codex, Gemini)。
支持键盘导航和选择。

Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5
"""

from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Static, OptionList
from textual.widgets.option_list import Option
from textual.binding import Binding
from textual.containers import Vertical, Horizontal

from ..core import PlatformConfig


# 平台图标映射
PLATFORM_ICONS = {
    "claude": "🤖",
    "codex": "📦",
    "gemini": "✨",
    "qwen": "🌙",
    "antigravity": "🚀",
    "windsurf": "🏄",
}


class PlatformSelectScreen(Screen):
    """平台选择屏幕 - 全屏现代设计
    
    高屏占比布局，顶部标题栏 + 中央选择区 + 底部提示栏
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
    
    # 平台配置
    PLATFORMS = [
        PlatformConfig("claude", "Claude", "~/.claude/"),
        PlatformConfig("codex", "Codex", "~/.codex/"),
        PlatformConfig("gemini", "Gemini", "~/.gemini/"),
        PlatformConfig("qwen", "Qwen", "~/.qwen/"),
        PlatformConfig("antigravity", "Antigravity", "~/.gemini/antigravity/"),
        PlatformConfig("windsurf", "Windsurf", "~/.codeium/windsurf/"),
    ]
    
    def compose(self) -> ComposeResult:
        # 顶部标题栏 - 使用大字体 ASCII 风格
        with Vertical(id="header-area"):
            with Vertical(id="brand"):
                yield Static("🚀  M y C l a u d e   S k i l l s   M a n a g e r  🚀", id="brand-text")
        
        # 中央选择区
        with Vertical(id="main-area"):
            with Vertical(id="select-container"):
                yield Static("Select your target platform", id="subtitle")
                yield OptionList(
                    *[Option(self._format_option(p), id=p.id) for p in self.PLATFORMS],
                    id="platform-list"
                )
        
        # 底部提示栏
        with Vertical(id="footer-area"):
            with Horizontal(id="footer-row"):
                yield Static("↑↓ Navigate  ⏎ Select  ⎋ Quit", id="hint")
                yield Static("v1.0", id="version")
    
    def _format_option(self, platform: PlatformConfig) -> str:
        """格式化平台选项显示 - 带上下空行增加间距"""
        icon = PLATFORM_ICONS.get(platform.id, "📁")
        name = platform.name.ljust(10)
        return f"\n{icon}  {name}  →  {platform.path}\n"
    
    def on_mount(self) -> None:
        self.query_one("#platform-list", OptionList).focus()
    
    def on_option_list_option_selected(self, event: OptionList.OptionSelected) -> None:
        if event.option.id:
            self.app.set_platform(str(event.option.id))
    
    def action_quit(self) -> None:
        self.app.exit()
