"""MyClaude Skills TUI 主应用类

继承 Textual App，管理屏幕导航和平台状态。

Requirements: 1.1, 10.1, 10.2
"""

from textual.app import App
from textual.binding import Binding

from .screens.platform_select import PlatformSelectScreen
from .screens.main_screen import MainScreen
from .core import myclaudeTheme


class SkillInstallerApp(App):
    """MyClaude Skills 安装管理器主应用
    
    管理平台选择和主界面之间的导航。
    
    Attributes:
        current_platform: 当前选择的目标平台
    
    Bindings:
        - q: 退出应用
        - t: 切换平台 (返回平台选择界面)
    """
    
    TITLE = "MyClaude Skills Manager"
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
        self.current_project_path: str | None = None
        # 注册 MyClaude 自定义主题
        self.register_theme(myclaudeTheme)
    
    def on_mount(self) -> None:
        """应用挂载时显示平台选择屏幕
        
        Requirements: 1.1 - 启动时首先显示平台选择界面
        """
        # 应用 MyClaude 主题
        self.theme = "myclaude"
        self.push_screen("platform_select")
    
    def set_platform(
        self, 
        platform: str,
        project_path: str | None = None
    ) -> None:
        """设置当前平台并进入主界面
        
        Args:
            platform: 平台名称 (claude/codex/gemini)
            project_path: 项目路径（可选）
        
        Requirements: 1.4 - 选择平台后进入主界面
        """
        self.current_platform = platform
        self.current_project_path = project_path
        # 创建并推送主界面，传入平台参数
        main_screen = MainScreen(
            platform=platform,
            project_path=project_path,
        )
        self.push_screen(main_screen)
    
    def action_toggle_platform(self) -> None:
        """返回平台选择界面
        
        Requirements: 10.1 - 按 't' 返回平台选择
        """
        # 弹出当前屏幕，返回平台选择
        if len(self.screen_stack) > 1:
            self.pop_screen()
