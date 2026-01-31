"""External Skills TUI 主应用类

继承 Textual App，管理屏幕导航和平台状态。

Requirements: 1.1, 7.1, 10.3, 10.4
"""

from textual.app import App
from textual.binding import Binding

from .screens.main_screen import MainScreen
from .screens.platform_select import PlatformSelectScreen


class ExternalSkillApp(App):
    """External Skills TUI 主应用

    管理平台选择和主界面之间的导航。

    Attributes:
        current_platform: 当前选择的目标平台

    Bindings:
        - q: 退出应用

    Requirements:
    - 1.1: 启动时显示平台选择界面
    - 7.1: 支持键盘快捷键操作
    """

    TITLE = "External Skills Manager"
    CSS_PATH = "styles.tcss"

    BINDINGS = [
        Binding("q", "quit", "Quit", show=True),
    ]

    SCREENS = {
        "platform_select": PlatformSelectScreen,
    }

    def __init__(self) -> None:
        """初始化应用"""
        super().__init__()
        self.current_platform: str | None = None

    def on_mount(self) -> None:
        """应用挂载时显示平台选择屏幕

        Requirements: 1.1 - 启动时首先显示平台选择界面
        """
        self.push_screen("platform_select")

    def set_platform(self, platform: str) -> None:
        """设置当前平台并进入主界面

        Args:
            platform: 平台名称 (claude/codex/gemini/kiro/windsurf 等)

        Requirements: 1.3 - 选择平台后进入主界面
        """
        self.current_platform = platform
        main_screen = MainScreen(platform=platform)
        self.push_screen(main_screen)


def main() -> None:
    """运行 External Skills TUI 应用"""
    app = ExternalSkillApp()
    app.run()


if __name__ == "__main__":
    main()
