"""Dashboard Screen - All-platforms installation overview.

Displays a DataTable with installation statistics across all platforms.
"""

from __future__ import annotations

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Vertical
from textual.screen import Screen
from textual.widgets import DataTable, Static

from ..components.header import PLATFORM_ICONS
from ..core.manager import TUIManager


class DashboardScreen(Screen):
    """All-platforms installation overview using DataTable.

    Shows skills/commands installed counts, outdated items,
    and prompt status per platform.
    """

    BINDINGS = [
        Binding("escape", "go_back", "Back"),
        Binding("q", "quit", "Quit"),
        Binding("r", "refresh", "Refresh"),
    ]

    def compose(self) -> ComposeResult:
        with Vertical(id="dashboard-container"):
            yield Static(
                "  📊  Platform Dashboard  —  Installation Overview",
                id="dashboard-title",
            )
            yield Static("─" * 70, id="dashboard-sep")
            yield DataTable(id="dashboard-table")
            yield Static("", id="dashboard-footer-info")

    def on_mount(self) -> None:
        table = self.query_one("#dashboard-table", DataTable)
        table.cursor_type = "row"
        self._load_data()

    def _load_data(self) -> None:
        """Load installation data for all platforms."""
        # Lazy import to avoid circular dependency
        from .platform_select import PlatformSelectScreen

        table = self.query_one("#dashboard-table", DataTable)
        table.clear(columns=True)

        table.add_columns(
            "Platform",
            "Skills",
            "Commands",
            "Outdated",
            "Prompt",
        )

        for platform in PlatformSelectScreen.PLATFORMS:
            try:
                manager = TUIManager(platform.id)
                icon = PLATFORM_ICONS.get(platform.id, "📁")

                # Skills stats
                skills = manager.get_skills() if manager.check_skills_source_exists() else []
                skills_installed = sum(1 for s in skills if s.is_installed)
                skills_total = len(skills)

                # Commands stats
                commands = manager.get_commands() if manager.check_commands_source_exists() else []
                commands_installed = sum(1 for c in commands if c.is_installed)
                commands_total = len(commands)

                # Outdated count
                outdated = sum(1 for s in skills if s.needs_update) + sum(1 for c in commands if c.needs_update)

                # Prompt status
                prompt_status = "✓" if manager.supports_prompt() else "—"

                table.add_row(
                    f"{icon} {platform.name}",
                    f"{skills_installed}/{skills_total}",
                    f"{commands_installed}/{commands_total}",
                    str(outdated) if outdated > 0 else "—",
                    prompt_status,
                )
            except Exception:
                icon = PLATFORM_ICONS.get(platform.id, "📁")
                table.add_row(f"{icon} {platform.name}", "?", "?", "?", "—")

        # Update footer info
        total_platforms = len(PlatformSelectScreen.PLATFORMS)
        self.query_one("#dashboard-footer-info", Static).update(
            f"  {total_platforms} platforms  |  ↑↓ Navigate  r Refresh  Esc Back"
        )

    def action_go_back(self) -> None:
        self.app.pop_screen()

    def action_quit(self) -> None:
        self.app.exit()

    def action_refresh(self) -> None:
        self._load_data()
