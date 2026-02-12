"""Prompt Modal Component

CLAUDE.md prompt management modal (conditionally shown for claude platform).
Displays diff between local and global CLAUDE.md with optional update action.
"""

from textual.app import ComposeResult
from textual.containers import Horizontal, ScrollableContainer, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Static


class PromptModal(ModalScreen[bool | None]):
    """CLAUDE.md prompt diff viewer and updater.

    Shows diff between local and global CLAUDE.md.
    Dismiss values: True (update), None (close).

    Args:
        has_diff: Whether differences exist
        diff_text: Unified diff text to display
    """

    BINDINGS = [
        ("escape", "close", "Close"),
        ("q", "close", "Close"),
    ]

    def __init__(self, has_diff: bool, diff_text: str) -> None:
        super().__init__()
        self._has_diff = has_diff
        self._diff_text = diff_text

    def compose(self) -> ComposeResult:
        with Vertical(id="prompt-dialog"):
            yield Static(
                "  📝  CLAUDE.md Prompt Management",
                id="prompt-title",
            )
            yield Static("─" * 70, id="prompt-sep")

            if self._has_diff:
                yield Static(
                    "  Changes detected between local and global CLAUDE.md:",
                    id="prompt-status",
                )
                with ScrollableContainer(id="prompt-scroll"):
                    yield Static(self._diff_text, id="prompt-diff-content")

                with Horizontal(id="prompt-buttons"):
                    yield Button(
                        "✓ Update Global",
                        variant="primary",
                        id="btn-prompt-update",
                    )
                    yield Button(
                        "✗ Close",
                        variant="default",
                        id="btn-prompt-close",
                    )
            else:
                yield Static(
                    "  ✓ Local and global CLAUDE.md are in sync!",
                    id="prompt-status",
                )
                with Horizontal(id="prompt-buttons"):
                    yield Button(
                        "✗ Close",
                        variant="default",
                        id="btn-prompt-close",
                    )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-prompt-update":
            self.dismiss(True)
        elif event.button.id == "btn-prompt-close":
            self.dismiss(None)

    def action_close(self) -> None:
        self.dismiss(None)
