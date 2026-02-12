"""Platform Config Modal Component

Platform paths and disk usage viewer.
"""

from pathlib import Path

from textual.app import ComposeResult
from textual.containers import ScrollableContainer, Vertical
from textual.screen import ModalScreen
from textual.widgets import Static

from ..components.header import PLATFORM_ICONS
from ..core.manager import TUIManager


def _format_size(size_bytes: int) -> str:
    """Format byte size to human-readable string."""
    size = float(size_bytes)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


def _get_dir_size(path: Path) -> int:
    """Get total size of a directory recursively."""
    if not path.exists():
        return 0

    total = 0
    try:
        for f in path.rglob("*"):
            if f.is_file():
                total += f.stat().st_size
    except (PermissionError, OSError):
        pass
    return total


class PlatformConfigModal(ModalScreen[None]):
    """Platform paths and disk usage viewer.

    Press Escape or q to close.
    """

    BINDINGS = [
        ("escape", "close", "Close"),
        ("q", "close", "Close"),
    ]

    def __init__(self, platform: str) -> None:
        super().__init__()
        self._platform = platform

    def compose(self) -> ComposeResult:
        icon = PLATFORM_ICONS.get(self._platform, "📁")
        manager = TUIManager(self._platform)

        with Vertical(id="config-dialog"):
            yield Static(
                f"  {icon}  {self._platform.capitalize()} Platform Configuration",
                id="config-title",
            )
            yield Static("─" * 60, id="config-sep")

            with ScrollableContainer(id="config-scroll"):
                lines = self._build_info(manager)
                yield Static("\n".join(lines), id="config-content")

    def _build_info(self, manager: TUIManager) -> list[str]:
        """Build platform information lines."""
        lines: list[str] = []

        # Paths section
        lines.append("  ── Paths ──")
        lines.append(f"  Skills Dir:    {manager.target_skills_dir}")
        lines.append(f"  Commands Dir:  {manager.target_commands_dir}")

        if manager.supports_prompt():
            prompt_path = manager._manager.config.get("prompt", "N/A")
            lines.append(f"  Prompt File:   {prompt_path}")

        # Disk usage section
        lines.append("")
        lines.append("  ── Disk Usage ──")
        skills_size = _get_dir_size(manager.target_skills_dir)
        commands_size = _get_dir_size(manager.target_commands_dir)
        total_size = skills_size + commands_size

        lines.append(f"  Skills:        {_format_size(skills_size)}")
        lines.append(f"  Commands:      {_format_size(commands_size)}")
        lines.append(f"  Total:         {_format_size(total_size)}")

        # Statistics section
        lines.append("")
        lines.append("  ── Statistics ──")

        skills = manager.get_skills() if manager.check_skills_source_exists() else []
        commands = manager.get_commands() if manager.check_commands_source_exists() else []

        skills_installed = sum(1 for s in skills if s.is_installed)
        commands_installed = sum(1 for c in commands if c.is_installed)
        skills_outdated = sum(1 for s in skills if s.needs_update)
        commands_outdated = sum(1 for c in commands if c.needs_update)

        lines.append(f"  Skills:        {skills_installed}/{len(skills)} installed")
        lines.append(f"  Commands:      {commands_installed}/{len(commands)} installed")

        total_outdated = skills_outdated + commands_outdated
        if total_outdated > 0:
            lines.append(f"  Outdated:      {total_outdated} items need update")

        return lines

    def action_close(self) -> None:
        self.dismiss(None)
