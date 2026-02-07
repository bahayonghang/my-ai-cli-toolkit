"""Detail Modal Component

Modal dialog showing detailed information about a skill or command.
Displays metadata, description, SKILL.md body content, and directory listing.
"""

from __future__ import annotations

from pathlib import Path

from textual.app import ComposeResult
from textual.containers import ScrollableContainer, Vertical
from textual.screen import ModalScreen
from textual.widgets import Static

# Absolute import: resolved via pythonpath=["src"] in pyproject.toml
from core.skill_meta import parse_skill_frontmatter

from ..core.models import ItemInfo, ItemType

# Maximum lines of body content to preview
_MAX_BODY_LINES = 40


def _load_skill_content(source_path: Path) -> tuple[dict, str]:
    """Load skill metadata and body from SKILL.md.

    Args:
        source_path: Path to the skill directory

    Returns:
        (frontmatter_dict, body_text)
    """
    meta = parse_skill_frontmatter(source_path)
    body = ""

    skill_md = source_path / "SKILL.md"
    if skill_md.exists():
        try:
            raw = skill_md.read_text(encoding="utf-8")
            # Extract body after second '---'
            if raw.startswith("---"):
                parts = raw.split("---", 2)
                if len(parts) >= 3:
                    body = parts[2].strip()
                else:
                    body = raw
            else:
                body = raw
        except OSError:
            body = "(failed to read SKILL.md)"

    return meta, body


def _load_command_content(source_path: Path) -> str:
    """Load command file content directly.

    Args:
        source_path: Path to the command file

    Returns:
        File content string
    """
    if source_path.is_file():
        try:
            return source_path.read_text(encoding="utf-8")
        except OSError:
            return "(failed to read file)"
    return "(file not found)"


def _list_directory(source_path: Path) -> list[str]:
    """List subdirectories and files in a skill directory.

    Args:
        source_path: Path to the skill directory

    Returns:
        List of formatted entries like "  scripts/" or "  config.toml"
    """
    if not source_path.is_dir():
        return []

    entries: list[str] = []
    try:
        for child in sorted(source_path.iterdir()):
            if child.name.startswith("."):
                continue
            if child.is_dir():
                entries.append(f"  {child.name}/")
            else:
                entries.append(f"  {child.name}")
    except OSError:
        pass
    return entries


def _truncate_body(body: str, max_lines: int = _MAX_BODY_LINES) -> str:
    """Truncate body text to a maximum number of lines.

    Args:
        body: Full body text
        max_lines: Maximum lines to keep

    Returns:
        Truncated text with indicator if needed
    """
    lines = body.split("\n")
    if len(lines) <= max_lines:
        return body
    truncated = "\n".join(lines[:max_lines])
    remaining = len(lines) - max_lines
    return f"{truncated}\n\n  ... ({remaining} more lines)"


class DetailModal(ModalScreen[None]):
    """Modal dialog showing detailed information about a skill or command.

    Press Escape or q to close.
    """

    BINDINGS = [
        ("escape", "close", "Close"),
        ("q", "close", "Close"),
    ]

    def __init__(self, item_info: ItemInfo) -> None:
        super().__init__()
        self._item_info = item_info
        self._meta: dict = {}
        self._body: str = ""
        self._dir_entries: list[str] = []

        self._load_content()

    def _load_content(self) -> None:
        """Load content based on item type."""
        source = self._item_info.source_path

        if source is None:
            self._body = "(no source path)"
            return

        if self._item_info.item_type == ItemType.SKILL:
            self._meta, self._body = _load_skill_content(source)
            self._dir_entries = _list_directory(source)
        else:
            # Command - show file content directly
            self._body = _load_command_content(source)

    def compose(self) -> ComposeResult:
        info = self._item_info

        # Status icon
        if info.is_installed:
            status_icon = "[green]\u2713[/green]" if not info.needs_update else "[yellow]\u26a0[/yellow]"
        else:
            status_icon = "[dim]\u25cb[/dim]"

        with Vertical(id="detail-dialog"):
            # Title
            yield Static(
                f"  {status_icon}  {info.name}",
                id="detail-title",
            )
            yield Static("\u2500" * 60, id="detail-sep")

            with ScrollableContainer(id="detail-scroll"):
                # Metadata section
                meta_lines = self._build_metadata()
                if meta_lines:
                    yield Static(meta_lines, id="detail-meta")
                    yield Static("")

                # Description section
                desc = self._get_description()
                if desc:
                    yield Static("[bold]Description[/bold]", id="detail-desc-label")
                    yield Static(desc, id="detail-desc")
                    yield Static("")

                # Body preview
                if self._body:
                    yield Static("[bold]Content Preview[/bold]", id="detail-body-label")
                    truncated = _truncate_body(self._body)
                    yield Static(truncated, id="detail-body")

                # Directory listing (skills only)
                if self._dir_entries:
                    yield Static("")
                    yield Static("[bold]Files[/bold]", id="detail-files-label")
                    yield Static("\n".join(self._dir_entries), id="detail-files")

    def _build_metadata(self) -> str:
        """Build formatted metadata block."""
        info = self._item_info
        lines: list[str] = []

        # Type
        type_label = "Skill" if info.item_type == ItemType.SKILL else "Command"
        lines.append(f"  Type:      {type_label}")

        # Category
        cat = info.category or self._meta.get("category")
        if cat:
            lines.append(f"  Category:  {cat}")

        # Tags
        tags = info.tags or self._meta.get("tags", [])
        if tags:
            lines.append(f"  Tags:      {', '.join(tags)}")

        # Version
        version = self._meta.get("version")
        if version:
            lines.append(f"  Version:   {version}")

        # Status
        if info.is_installed:
            status_text = "Outdated" if info.needs_update else "Installed"
        else:
            status_text = "Not installed"
        lines.append(f"  Status:    {status_text}")

        # Source path
        if info.source_path:
            lines.append(f"  Source:    {info.source_path}")

        return "\n".join(lines)

    def _get_description(self) -> str:
        """Get description from item_info or loaded metadata."""
        return self._item_info.description or self._meta.get("description") or ""

    def action_close(self) -> None:
        """Close the detail modal."""
        self.dismiss(None)
