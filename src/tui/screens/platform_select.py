"""平台选择屏幕

启动时首先显示，让用户选择目标平台 (Claude, Codex, Gemini)。
支持键盘导航和选择。支持项目路径输入。

Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5
"""

from pathlib import Path

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Button, Input, OptionList, Static
from textual.widgets.option_list import Option

from ..core import PlatformDisplay

# 平台图标映射
PLATFORM_ICONS = {
    "claude": "🤖",
    "codex": "📦",
    "gemini": "✨",
    "qwen": "🌙",
    "antigravity": "🚀",
    "windsurf": "🏄",
    "kiro": "🧭",
    "trae": "🧩",
}


class PlatformSelectScreen(Screen):
    """平台选择屏幕 - 全屏现代设计

    高屏占比布局，顶部标题栏 + 中央选择区 + 底部提示栏
    """

    BINDINGS = [
        Binding("escape", "quit", "Quit", show=True),
    ]

    # 平台配置
    PLATFORMS = [
        PlatformDisplay("claude", "Claude", "~/.claude/"),
        PlatformDisplay("codex", "Codex", "~/.codex/"),
        PlatformDisplay("gemini", "Gemini", "~/.gemini/"),
        PlatformDisplay("qwen", "Qwen", "~/.qwen/"),
        PlatformDisplay("antigravity", "Antigravity", "~/.gemini/antigravity/"),
        PlatformDisplay("windsurf", "Windsurf", "~/.codeium/windsurf/"),
        PlatformDisplay("kiro", "Kiro", "~/.kiro/"),
        PlatformDisplay("trae", "Trae", "~/.trae/"),
    ]

    def compose(self) -> ComposeResult:
        # 顶部标题栏 - 使用大字体 ASCII 风格
        with Vertical(id="header-area"):
            yield Static("🚀  M y C l a u d e   S k i l l s   M a n a g e r  🚀", id="brand-text")

        # 中央选择区
        with Vertical(id="main-area"):
            with Vertical(id="select-container"):
                yield Static("Select your target platform", id="subtitle")
                yield OptionList(
                    *[Option(self._format_option(p), id=p.id) for p in self.PLATFORMS],
                    id="platform-list"
                )

                # 项目路径输入区
                with Vertical(id="project-section"):
                    yield Static("📁 Project Path (Optional)", id="project-label")
                    yield Input(
                        placeholder="./my-project or /absolute/path",
                        id="project-path-input"
                    )

                # 按钮区
                with Horizontal(id="button-row"):
                    yield Button("Continue", variant="primary", id="continue-btn")
                    yield Button("Cancel", variant="default", id="cancel-btn")

        # 底部提示栏
        with Vertical(id="footer-area"):
            with Horizontal(id="footer-row"):
                yield Static("↑↓ Navigate  ⏎ Select  Tab Switch  ⎋ Quit", id="hint")
                yield Static("v1.0", id="version")

    def _format_option(self, platform: PlatformDisplay) -> str:
        """格式化平台选项显示"""
        icon = PLATFORM_ICONS.get(platform.id, "📁")
        name = platform.name.ljust(10)
        # 移除手动换行，使用 CSS padding
        return f"{icon}  {name}  →  {platform.path}"

    def on_mount(self) -> None:
        self.query_one("#platform-list", OptionList).focus()

    def on_option_list_option_selected(self, event: OptionList.OptionSelected) -> None:
        """当用户在平台列表中按回车时，聚焦到继续按钮"""
        # 不直接进入，而是让用户点击 Continue 按钮
        try:
            self.query_one("#continue-btn", Button).focus()
        except Exception:
            pass

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """处理按钮点击事件"""
        if event.button.id == "cancel-btn":
            self.app.exit()
            return

        if event.button.id == "continue-btn":
            # 收集参数
            platform_list = self.query_one("#platform-list", OptionList)
            if platform_list.highlighted is None:
                self.notify("Please select a platform", severity="warning")
                return

            platform_option = platform_list.get_option_at_index(platform_list.highlighted)
            if platform_option is None or platform_option.id is None:
                self.notify("Invalid platform selection", severity="error")
                return

            platform = str(platform_option.id)
            project_path = self.query_one("#project-path-input", Input).value.strip()

            # 验证路径存在性（如果提供了路径）
            if project_path:
                path = Path(project_path)
                if not path.exists():
                    self.notify(
                        f"Path does not exist: {project_path}",
                        severity="warning",
                        title="Path Warning"
                    )
                    # 不阻止继续，只是警告

            # 传递参数到主界面
            self.app.set_platform(
                platform,
                project_path=project_path if project_path else None,
            )

    def action_quit(self) -> None:
        self.app.exit()
