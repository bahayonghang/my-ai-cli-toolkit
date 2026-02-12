"""Diff Modal Component

Source vs installed file diff viewer using difflib.unified_diff.
"""

import difflib

from textual.app import ComposeResult
from textual.containers import ScrollableContainer, Vertical
from textual.screen import ModalScreen
from textual.widgets import Static

from ..core.models import ItemInfo, ItemType


def _compute_diff(item_info: ItemInfo) -> str:
    """Compute unified diff between source and installed files.

    Args:
        item_info: Item to diff

    Returns:
        Unified diff text
    """
    source = item_info.source_path
    target = item_info.target_path

    if source is None or target is None:
        return "(paths not available)"

    if not target.exists():
        return "(not installed)"

    try:
        if item_info.item_type == ItemType.SKILL:
            # Compare SKILL.md files
            source_file = source / "SKILL.md"
            target_file = target / "SKILL.md"
        else:
            # Compare command files directly
            source_file = source
            target_file = target

        if not source_file.exists():
            return "(source file not found)"
        if not target_file.exists():
            return "(target file not found)"

        source_lines = source_file.read_text(encoding="utf-8").splitlines(keepends=True)
        target_lines = target_file.read_text(encoding="utf-8").splitlines(keepends=True)

        diff = list(
            difflib.unified_diff(
                target_lines,
                source_lines,
                fromfile=f"installed: {target_file.name}",
                tofile=f"source: {source_file.name}",
            )
        )

        if not diff:
            return "✓ Files are identical — no differences found."

        return "".join(diff)
    except Exception as e:
        return f"(error computing diff: {e})"


class DiffModal(ModalScreen[None]):
    """Source vs installed file diff viewer.

    Press Escape or q to close.
    """

    BINDINGS = [
        ("escape", "close", "Close"),
        ("q", "close", "Close"),
    ]

    def __init__(self, item_info: ItemInfo) -> None:
        super().__init__()
        self._item_info = item_info
        self._diff_text = _compute_diff(item_info)

    def compose(self) -> ComposeResult:
        name = self._item_info.name

        with Vertical(id="diff-dialog"):
            yield Static(
                f"  📄  Diff: {name}",
                id="diff-title",
            )
            yield Static("─" * 60, id="diff-sep")

            with ScrollableContainer(id="diff-scroll"):
                yield Static(self._diff_text, id="diff-content")

    def action_close(self) -> None:
        self.dismiss(None)
