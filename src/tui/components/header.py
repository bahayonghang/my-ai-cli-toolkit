"""Header component - compact title bar

Displays app title and platform badge with icon.
Requirements: 3.1, 3.2, 3.3, 3.4
"""

from textual.containers import Horizontal
from textual.widgets import Static

# Platform icon mapping (shared with platform_select)
PLATFORM_ICONS = {
    "claude": "🤖",
    "codex": "📦",
    "gemini": "✨",
    "qwen": "🌙",
    "antigravity": "🚀",
    "windsurf": "🏄",
    "kiro": "🧭",
    "trae": "🧩",
    "iflow": "🌊",
}


class Header(Static):
    """Compact title bar

    Left: 🚀 Title [project path]
    Right: Platform badge with icon (e.g. "🤖 CLAUDE")
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
        background: $accent;
        color: $background;
        text-style: bold;
        padding: 0 2;
    }
    """

    APP_TITLE = "🚀 MyClaude Skills Manager"

    def __init__(
        self,
        platform: str = "",
    ) -> None:
        super().__init__()
        self._platform = platform

    def compose(self):
        with Horizontal(id="header-row"):
            yield Static(self._format_title(), id="app-title")
            yield Static(self._format_badge(), id="platform-badge")

    def _format_title(self) -> str:
        """Format title."""
        return self.APP_TITLE

    def _format_badge(self) -> str:
        """Format platform badge with icon."""
        if not self._platform:
            return "—"
        icon = PLATFORM_ICONS.get(self._platform, "📁")
        name = self._platform.upper()
        return f"{icon} {name}"

    def set_platform(self, platform: str) -> None:
        """Update platform info."""
        self._platform = platform
        try:
            title = self.query_one("#app-title", Static)
            title.update(self._format_title())
            badge = self.query_one("#platform-badge", Static)
            badge.update(self._format_badge())
        except Exception:
            pass
