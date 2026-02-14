"""Install Modal Component

Modal dialog for install path configuration.
Shows install mode selection (global/directory), item list, and confirmation.
"""

from dataclasses import dataclass

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Input, RadioButton, RadioSet, Static

from core.config_loader import get_platform_config

from .header import PLATFORM_ICONS

# Max items to show in preview list before truncating
_MAX_PREVIEW_ITEMS = 30
# Number of columns for item list layout
_ITEM_COLUMNS = 2


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


def _build_items_display(items: list[str], columns: int = _ITEM_COLUMNS) -> str:
    """Build a compact multi-column item list display.

    Args:
        items: List of item names
        columns: Number of columns for layout

    Returns:
        Formatted multi-column text string
    """
    count = len(items)
    preview = items[:_MAX_PREVIEW_ITEMS]

    # Calculate column width based on longest item name
    max_len = max((len(name) for name in preview), default=10)
    col_width = max_len + 3  # padding for bullet + spacing

    lines: list[str] = []
    for i in range(0, len(preview), columns):
        row_items = preview[i : i + columns]
        row = ""
        for name in row_items:
            row += f"  ‣ {name:<{col_width}}"
        lines.append(row.rstrip())

    if count > _MAX_PREVIEW_ITEMS:
        lines.append(f"  … and {count - _MAX_PREVIEW_ITEMS} more")

    return "\n".join(lines)


class InstallModal(ModalScreen[InstallConfig | None]):
    """Modal dialog for install path configuration.

    Displays target platform name, radio toggle for install mode,
    conditional path input, items to install, and confirm/cancel buttons.

    Key design: avoids ``on_key`` override entirely to prevent Textual's
    ModalScreen key dispatch from intercepting events meant for the Input
    widget. Uses ``disabled`` property instead of ``can_focus`` toggling
    for reliable focus cycle management.
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
        icon = PLATFORM_ICONS.get(self._platform, "📁")
        count = len(self._items)

        with Vertical(id="install-dialog"):
            # ── Title area ──
            yield Static(
                f" {icon}  Install to {platform_name}",
                id="dialog-title",
            )

            # ── Install mode section ──
            with Vertical(id="mode-section"):
                yield Static("Install Mode", id="mode-label")
                with RadioSet(id="install-radio"):
                    yield RadioButton(
                        f" 🌐  Global Install  ({get_platform_config(self._platform).base_dir}/)",
                        value=True,
                        id="radio-global",
                    )
                    yield RadioButton(
                        " 📂  Specify Directory",
                        id="radio-directory",
                    )

            # Path input — always present, disabled by default.
            # Using disabled instead of display:none avoids Textual focus
            # cycle issues that prevent the Input from receiving keystrokes.
            with Vertical(id="path-section"):
                yield Static(
                    "  📍  Target Path",
                    id="path-label",
                    classes="-hidden",
                )
                yield Input(
                    placeholder="Enter project directory path, e.g. ./my-project",
                    value=self._default_path,
                    id="path-input",
                    disabled=True,
                    classes="-hidden",
                )

            # ── Items section ──
            with Vertical(id="items-section"):
                yield Static(
                    f"  📦  Items to install  ({count})",
                    id="items-label",
                )
                yield Static(
                    _build_items_display(self._items),
                    id="items-list",
                )

            # ── Action buttons ──
            with Horizontal(id="dialog-buttons"):
                yield Button(
                    "✓ Install", variant="primary", id="btn-install"
                )
                yield Button(
                    "✗ Cancel", variant="default", id="btn-cancel"
                )

    def on_radio_set_changed(self, event: RadioSet.Changed) -> None:
        """Toggle path input visibility based on radio selection."""
        is_directory = event.index == 1
        path_input = self.query_one("#path-input", Input)
        path_label = self.query_one("#path-label", Static)

        if is_directory:
            path_label.remove_class("-hidden")
            path_input.remove_class("-hidden")
            path_input.disabled = False
            # Use set_timer for reliable post-layout focus
            self.set_timer(0.05, path_input.focus)
        else:
            path_label.add_class("-hidden")
            path_input.add_class("-hidden")
            path_input.disabled = True

    def on_input_submitted(self, event: Input.Submitted) -> None:
        """When user presses Enter inside the path input, trigger install."""
        if event.input.id == "path-input":
            self._do_install()

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
                self.notify(
                    "⚠ Please enter a directory path",
                    severity="warning",
                )
                path_input.focus()
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
