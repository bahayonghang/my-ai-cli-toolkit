"""Platform Selection Screen

Simplified screen: select target platform and enter main screen directly.
No project path input - path selection moved to install-time modal.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.events import ScreenResume
from textual.screen import Screen
from textual.widgets import OptionList, Static
from textual.widgets.option_list import Option

# Absolute import: resolved via pythonpath=["src"] in pyproject.toml
from core.paths import PROJECT_ROOT

from ..core import PlatformDisplay

if TYPE_CHECKING:
    from ..app import SkillInstallerApp


def _read_app_version() -> str:
    """Read version from pyproject.toml."""
    try:
        text = (PROJECT_ROOT / "pyproject.toml").read_text(encoding="utf-8")
        match = re.search(r'^version\s*=\s*"([^"]+)"', text, re.MULTILINE)
        if match:
            return f"v{match.group(1)}"
    except Exception:
        pass
    return "v0.0.0"


_APP_VERSION = _read_app_version()

# Platform icon mapping
PLATFORM_ICONS = {
    "claude": "🤖",
    "codex": "📦",
    "gemini": "✨",
    "qwen": "🌙",
    "antigravity": "🚀",
    "windsurf": "🏄",
    "kiro": "🧭",
    "trae": "🧩",
    "opencode": "🔓",
    "iflow": "🌊",
}


class PlatformSelectScreen(Screen):
    """Platform selection screen - simplified design.

    Click or press Enter on a platform to enter the main screen directly.
    No project path input (moved to install-time modal).
    """

    BINDINGS = [
        Binding("escape", "quit", "Quit", show=True),
    ]

    PLATFORMS = [
        PlatformDisplay("claude", "Claude", "~/.claude/"),
        PlatformDisplay("codex", "Codex", "~/.codex/"),
        PlatformDisplay("gemini", "Gemini", "~/.gemini/"),
        PlatformDisplay("qwen", "Qwen", "~/.qwen/"),
        PlatformDisplay("antigravity", "Antigravity", "~/.gemini/antigravity/"),
        PlatformDisplay("windsurf", "Windsurf", "~/.codeium/windsurf/"),
        PlatformDisplay("kiro", "Kiro", "~/.kiro/"),
        PlatformDisplay("trae", "Trae", "~/.trae/"),
        PlatformDisplay("opencode", "OpenCode", "~/.config/opencode/"),
        PlatformDisplay("iflow", "iFlow", "~/.iflow/"),
    ]

    def compose(self) -> ComposeResult:
        # Title bar
        with Vertical(id="header-area"):
            yield Static(
                "🚀  M y C l a u d e   S k i l l s   M a n a g e r  🚀",
                id="brand-text",
            )
            yield Static(
                "Unified skill installer for AI coding agents",
                id="brand-sub",
            )

        # Main content: platform list fills available space
        with Vertical(id="main-area"):
            yield Static(" Select your target platform", id="subtitle")
            yield OptionList(
                *[Option(self._format_option(p), id=p.id) for p in self.PLATFORMS],
                id="platform-list",
            )

        # Footer hint
        with Vertical(id="footer-area"):
            with Horizontal(id="footer-row"):
                yield Static("↑↓ Navigate  ⏎ Select  ⎋ Quit", id="hint")
                yield Static(_APP_VERSION, id="version")

    def _format_option(self, platform: PlatformDisplay) -> str:
        """Format platform option display with spacing line."""
        icon = PLATFORM_ICONS.get(platform.id, "📁")
        name = platform.name.ljust(14)
        return f"{icon}  {name} →  {platform.path}\n"

    def on_mount(self) -> None:
        self.query_one("#platform-list", OptionList).focus()

    def on_screen_resume(self, event: ScreenResume) -> None:
        """Re-focus platform list when returning from sub-screen."""
        self.query_one("#platform-list", OptionList).focus()

    @property
    def installer_app(self) -> SkillInstallerApp:
        """Return typed app reference."""
        return self.app  # type: ignore[return-value]

    def on_option_list_option_selected(self, event: OptionList.OptionSelected) -> None:
        """Direct entry: select platform and enter main screen immediately."""
        if event.option_id is None:
            return
        platform = str(event.option_id)
        self.installer_app.set_platform(platform)

    def action_quit(self) -> None:
        self.app.exit()
