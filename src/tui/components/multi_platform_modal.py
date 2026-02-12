"""Multi-Platform Modal Component

Multi-platform target selector with checkboxes for cross-platform sync.
"""

from __future__ import annotations

from textual.app import ComposeResult
from textual.containers import Horizontal, ScrollableContainer, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Checkbox, Static

from ..components.header import PLATFORM_ICONS


class MultiPlatformModal(ModalScreen[list[str] | None]):
    """Multi-platform target selector with checkboxes.

    Dismiss values: list[str] of selected platform IDs, or None (cancel).
    """

    BINDINGS = [
        ("escape", "cancel", "Cancel"),
    ]

    def compose(self) -> ComposeResult:
        # Lazy import to avoid circular dependency
        from ..screens.platform_select import PlatformSelectScreen

        with Vertical(id="multi-platform-dialog"):
            yield Static(
                "  🔄  Multi-Platform Sync",
                id="multi-platform-title",
            )
            yield Static("─" * 50, id="multi-platform-sep")
            yield Static(
                "  Select target platforms to sync:",
                id="multi-platform-hint",
            )

            with ScrollableContainer(id="multi-platform-scroll"):
                for platform in PlatformSelectScreen.PLATFORMS:
                    icon = PLATFORM_ICONS.get(platform.id, "📁")
                    yield Checkbox(
                        f"{icon}  {platform.name}  ({platform.path})",
                        id=f"chk-{platform.id}",
                    )

            with Horizontal(id="multi-platform-buttons"):
                yield Button(
                    "✓ Sync Selected",
                    variant="primary",
                    id="btn-multi-sync",
                )
                yield Button(
                    "✗ Cancel",
                    variant="default",
                    id="btn-multi-cancel",
                )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        # Lazy import to avoid circular dependency
        from ..screens.platform_select import PlatformSelectScreen

        if event.button.id == "btn-multi-sync":
            selected = []
            for platform in PlatformSelectScreen.PLATFORMS:
                try:
                    chk = self.query_one(f"#chk-{platform.id}", Checkbox)
                    if chk.value:
                        selected.append(platform.id)
                except Exception:
                    pass

            if selected:
                self.dismiss(selected)
            else:
                self.notify("No platforms selected", severity="warning")
        elif event.button.id == "btn-multi-cancel":
            self.dismiss(None)

    def action_cancel(self) -> None:
        self.dismiss(None)
