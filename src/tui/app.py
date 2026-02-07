"""MyClaude Skills TUI Main Application

Manages screen navigation between platform selection and main screen.
"""

from textual.app import App
from textual.binding import Binding

from .core import myclaudeTheme
from .screens.main_screen import MainScreen
from .screens.platform_select import PlatformSelectScreen


class SkillInstallerApp(App):
    """MyClaude Skills installer TUI application.

    Manages platform selection → main screen navigation.

    Bindings:
        - q: Quit application
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
        super().__init__()
        self.current_platform: str | None = None
        self.register_theme(myclaudeTheme)

    def on_mount(self) -> None:
        """Show platform selection screen on startup."""
        self.theme = "myclaude"
        self.push_screen("platform_select")

    def set_platform(self, platform: str) -> None:
        """Set current platform and enter main screen.

        Args:
            platform: Platform name (claude/codex/gemini/...)
        """
        self.current_platform = platform
        main_screen = MainScreen(platform=platform)
        self.push_screen(main_screen)

    def action_toggle_platform(self) -> None:
        """Return to platform selection screen."""
        if len(self.screen_stack) > 1:
            self.pop_screen()
