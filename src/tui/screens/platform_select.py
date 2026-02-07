"""Platform Selection Screen

Displayed at launch, allows user to select target platform.
Supports keyboard navigation and optional project path input.

Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5
"""

from pathlib import Path

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.events import ScreenResume
from textual.screen import Screen
from textual.widgets import Button, Input, OptionList, Static
from textual.widgets.option_list import Option

from ..core import PlatformDisplay

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
}


class PlatformSelectScreen(Screen):
    """Platform selection screen - compact modern design

    Full-height layout: header + platform list (fills space) + project path + buttons + footer
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

        # Bottom panel: project path + buttons (docked to bottom)
        with Vertical(id="bottom-panel"):
            with Horizontal(id="project-row"):
                yield Static("📁 Project Path ", id="project-label")
                yield Input(
                    placeholder="./my-project or /absolute/path (optional)",
                    id="project-path-input",
                )
            with Horizontal(id="button-row"):
                yield Button("Continue", variant="primary", id="continue-btn")
                yield Button("Cancel", variant="default", id="cancel-btn")

        # Footer hint
        with Vertical(id="footer-area"):
            with Horizontal(id="footer-row"):
                yield Static("↑↓ Navigate  ⏎ Select  ⎋ Quit", id="hint")
                yield Static("v1.2", id="version")

    def _format_option(self, platform: PlatformDisplay) -> str:
        """Format platform option display."""
        icon = PLATFORM_ICONS.get(platform.id, "📁")
        name = platform.name.ljust(14)
        return f"{icon}  {name} →  {platform.path}"

    def on_mount(self) -> None:
        self.query_one("#platform-list", OptionList).focus()

    def on_screen_resume(self, event: ScreenResume) -> None:
        """Re-focus platform list when returning from sub-screen."""
        self.query_one("#platform-list", OptionList).focus()

    def on_option_list_option_selected(self, event: OptionList.OptionSelected) -> None:
        """When user presses Enter on platform list, focus Continue button."""
        try:
            self.query_one("#continue-btn", Button).focus()
        except Exception:
            pass

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button click events."""
        if event.button.id == "cancel-btn":
            self.app.exit()
            return

        if event.button.id == "continue-btn":
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

            # Validate path existence (warning only, non-blocking)
            if project_path:
                path = Path(project_path)
                if not path.exists():
                    self.notify(
                        f"Path does not exist: {project_path}",
                        severity="warning",
                        title="Path Warning",
                    )

            self.app.set_platform(
                platform,
                project_path=project_path if project_path else None,
            )

    def action_quit(self) -> None:
        self.app.exit()
