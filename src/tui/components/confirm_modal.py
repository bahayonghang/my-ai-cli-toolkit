"""Confirm Modal Component

Reusable confirmation dialog for dangerous operations (uninstall, overwrite).
Follows InstallModal pattern for consistency.
"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Static

from .install_modal import _build_items_display


class ConfirmModal(ModalScreen[bool | None]):
    """Reusable confirmation dialog.

    Supports danger mode for destructive operations.
    Dismiss values: True (confirm), False (cancel), None (escape).

    Args:
        title: Dialog title text
        message: Description of the operation
        items: Optional list of item names to display
        confirm_label: Text for the confirm button
        danger: If True, renders confirm button with error styling
    """

    BINDINGS = [
        ("escape", "cancel", "Cancel"),
    ]

    def __init__(
        self,
        title: str,
        message: str,
        items: list[str] | None = None,
        confirm_label: str = "Confirm",
        danger: bool = False,
    ) -> None:
        super().__init__()
        self._title = title
        self._message = message
        self._items = items
        self._confirm_label = confirm_label
        self._danger = danger

    def compose(self) -> ComposeResult:
        with Vertical(id="confirm-dialog"):
            # Title
            icon = "⚠" if self._danger else "ℹ"
            yield Static(
                f"  {icon}  {self._title}",
                id="confirm-title",
            )
            yield Static("", id="confirm-sep")

            # Message
            yield Static(f"  {self._message}", id="confirm-message")

            # Items list (optional)
            if self._items:
                yield Static(
                    _build_items_display(self._items),
                    id="confirm-items",
                )

            # Action buttons
            with Horizontal(id="confirm-buttons"):
                btn_id = "btn-confirm-danger" if self._danger else "btn-confirm"
                yield Button(
                    f"✓ {self._confirm_label}",
                    variant="error" if self._danger else "primary",
                    id=btn_id,
                )
                yield Button("✗ Cancel", variant="default", id="btn-confirm-cancel")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id in ("btn-confirm", "btn-confirm-danger"):
            self.dismiss(True)
        elif event.button.id == "btn-confirm-cancel":
            self.dismiss(False)

    def action_cancel(self) -> None:
        self.dismiss(None)
