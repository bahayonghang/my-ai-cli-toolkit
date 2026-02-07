"""Install Modal Component

Modal dialog for install path configuration.
Shows install mode selection (global/directory), item list, and confirmation.
"""

from dataclasses import dataclass

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Input, RadioButton, RadioSet, Static


@dataclass
class InstallConfig:
    """Install configuration returned by the modal.

    Attributes:
        install_mode: "global" or "directory"
        directory_path: Custom path (only when install_mode == "directory")
        items: List of item names to install
    """

    install_mode: str
    directory_path: str | None
    items: list[str]


class InstallModal(ModalScreen[InstallConfig | None]):
    """Modal dialog for install path configuration.

    Displays target platform name, radio toggle for install mode,
    conditional path input, items to install, and confirm/cancel buttons.
    """

    BINDINGS = [
        ("escape", "cancel", "Cancel"),
    ]

    def __init__(
        self,
        platform: str,
        items: list[str],
        default_path: str = "",
    ) -> None:
        super().__init__()
        self._platform = platform
        self._items = items
        self._default_path = default_path

    def compose(self) -> ComposeResult:
        platform_name = self._platform.capitalize()

        with Vertical(id="install-dialog"):
            yield Static(
                f"  Install to {platform_name}",
                id="dialog-title",
            )
            yield Static("─" * 50, id="dialog-sep")

            # Install mode radio
            yield Static(" Install Mode:", id="mode-label")
            with RadioSet(id="install-radio"):
                yield RadioButton(
                    f"Global Install (~/.{self._platform}/)",
                    value=True,
                    id="radio-global",
                )
                yield RadioButton(
                    "Specify Directory",
                    id="radio-directory",
                )

            # Conditional path input (hidden by default)
            with Vertical(id="path-container", classes="-hidden"):
                yield Input(
                    placeholder="Enter directory path...",
                    value=self._default_path,
                    id="path-input",
                )

            # Items to install
            count = len(self._items)
            yield Static(f" Items to install ({count}):", id="items-label")
            items_text = "\n".join(f"  • {name}" for name in self._items[:15])
            if count > 15:
                items_text += f"\n  ... and {count - 15} more"
            yield Static(items_text, id="items-list")

            # Action buttons
            with Horizontal(id="dialog-buttons"):
                yield Button("Install", variant="primary", id="btn-install")
                yield Button("Cancel", variant="default", id="btn-cancel")

    def on_radio_set_changed(self, event: RadioSet.Changed) -> None:
        """Toggle path input visibility based on radio selection."""
        path_container = self.query_one("#path-container")
        if event.index == 1:  # Specify Directory
            path_container.remove_class("-hidden")
            self.query_one("#path-input", Input).focus()
        else:
            path_container.add_class("-hidden")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-install":
            self._do_install()
        elif event.button.id == "btn-cancel":
            self.dismiss(None)

    def _do_install(self) -> None:
        """Collect config and dismiss with result."""
        radio = self.query_one("#install-radio", RadioSet)

        if radio.pressed_index == 1:  # Specify Directory
            path_input = self.query_one("#path-input", Input)
            path = path_input.value.strip()
            if not path:
                self.notify("Please enter a directory path", severity="warning")
                return
            config = InstallConfig(
                install_mode="directory",
                directory_path=path,
                items=list(self._items),
            )
        else:
            config = InstallConfig(
                install_mode="global",
                directory_path=None,
                items=list(self._items),
            )

        self.dismiss(config)

    def action_cancel(self) -> None:
        self.dismiss(None)
