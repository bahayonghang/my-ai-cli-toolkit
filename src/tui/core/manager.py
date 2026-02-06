"""
TUI Manager - TUI-specific manager wrapping SkillManager.

Provides all business logic interfaces needed by the TUI.
Requirements: 14.3, 6.1, 6.2, 8.1, 8.2, 2.7, 6.6, 13.2, 13.4
"""

import os
from collections.abc import Callable
from datetime import datetime
from pathlib import Path

# No more sys.path hack needed - pythonpath=["src"] handles module resolution
from core.config_loader import get_commands_source_dir
from core.paths import COMMANDS_SRC_DIR, SKILLS_SRC_DIR
from core.skill_meta import parse_skill_frontmatter
from install import SkillManager

from .models import InstallResult, InstallStatus, ItemInfo, ItemType


class SourceDirectoryError(Exception):
    """Source directory not found error."""
    def __init__(self, directory: Path, message: str = ""):
        self.directory = directory
        self.message = message or f"Source directory not found: {directory}"
        super().__init__(self.message)


class TUIManager:
    """TUI-specific manager wrapping install.py's SkillManager.

    Attributes:
        platform: Target platform (claude, codex, gemini)
        project_path: Project path (optional)
    """

    def __init__(
        self,
        platform: str,
        project_path: str | None = None
    ):
        """Initialize TUIManager.

        Args:
            platform: Target platform name
            project_path: Project path (optional)
        """
        self.platform = platform
        self.project_path = project_path
        self._manager = SkillManager(platform, project_path=project_path)

    @property
    def target_skills_dir(self) -> Path:
        """Get target skills directory."""
        return self._manager.target_skills_dir

    @property
    def target_commands_dir(self) -> Path:
        """Get target commands directory."""
        return self._manager.target_commands_dir

    def check_skills_source_exists(self) -> bool:
        """Check if skills source directory exists."""
        return SKILLS_SRC_DIR.exists()

    def _get_platform_commands_dir(self) -> Path:
        """Get platform-specific commands source directory (internal)."""
        return get_commands_source_dir(self.platform, COMMANDS_SRC_DIR)

    def check_commands_source_exists(self) -> bool:
        """Check if commands source directory exists."""
        return self._get_platform_commands_dir().exists()

    def get_skills_source_dir(self) -> Path:
        """Get skills source directory path."""
        return SKILLS_SRC_DIR

    def get_commands_source_dir(self) -> Path:
        """Get commands source directory path."""
        return self._get_platform_commands_dir()

    def _get_file_mtime(self, path: Path) -> datetime | None:
        """Get file modification time.

        Args:
            path: File path

        Returns:
            Modification time, or None if file doesn't exist
        """
        try:
            if path.exists():
                return datetime.fromtimestamp(path.stat().st_mtime)
        except Exception:
            pass
        return None

    def _determine_install_status(
        self,
        target_path: Path,
        source_mtime: datetime | None,
        target_mtime: datetime | None
    ) -> InstallStatus:
        """Determine installation status.

        Args:
            target_path: Target path
            source_mtime: Source file modification time
            target_mtime: Target file modification time

        Returns:
            Installation status
        """
        if not target_path.exists():
            return InstallStatus.NOT_INSTALLED

        if source_mtime is None or target_mtime is None:
            return InstallStatus.INSTALLED

        if source_mtime > target_mtime:
            return InstallStatus.OUTDATED

        return InstallStatus.INSTALLED

    def get_skills(self) -> list[ItemInfo]:
        """Get all skills list.

        Returns:
            List of skill info items
        """
        skills = []
        if not SKILLS_SRC_DIR.exists():
            return skills

        for skill_dir in sorted(SKILLS_SRC_DIR.iterdir()):
            if skill_dir.is_dir():
                target_path = self._manager.target_skills_dir / skill_dir.name

                source_mtime = self._get_file_mtime(skill_dir)
                target_mtime = self._get_file_mtime(target_path)

                status = self._determine_install_status(
                    target_path, source_mtime, target_mtime
                )

                # Use shared frontmatter parser from core.skill_meta
                metadata = parse_skill_frontmatter(skill_dir)

                skills.append(ItemInfo(
                    name=skill_dir.name,
                    item_type=ItemType.SKILL,
                    description=metadata.get("description"),
                    status=status,
                    source_path=skill_dir,
                    target_path=target_path,
                    source_mtime=source_mtime,
                    target_mtime=target_mtime,
                    category=metadata.get("category"),
                    tags=metadata.get("tags", []),
                ))

        return skills

    def get_all_categories(self) -> list[str]:
        """Get all available skill categories.

        Returns:
            Sorted list of category names (deduplicated)
        """
        categories = set()
        for skill in self.get_skills():
            if skill.category:
                categories.add(skill.category)
        return sorted(categories)

    def get_commands(self) -> list[ItemInfo]:
        """Get all commands list (supports nested directories).

        Returns:
            List of command info items
        """
        commands = []

        src_dir = self._get_platform_commands_dir()

        if not src_dir.exists():
            return commands

        for cmd_file in sorted(src_dir.rglob("*")):
            if cmd_file.is_file():
                rel_path = cmd_file.relative_to(src_dir)
                cmd_name = str(rel_path.with_suffix("")).replace("\\", "/")

                target_file = self._manager.target_commands_dir / rel_path

                source_mtime = self._get_file_mtime(cmd_file)
                target_mtime = self._get_file_mtime(target_file)

                status = self._determine_install_status(
                    target_file, source_mtime, target_mtime
                )

                commands.append(ItemInfo(
                    name=cmd_name,
                    item_type=ItemType.COMMAND,
                    description=None,
                    status=status,
                    source_path=cmd_file,
                    target_path=target_file,
                    source_mtime=source_mtime,
                    target_mtime=target_mtime,
                ))

        return commands

    def install_skill(self, name: str) -> InstallResult:
        """Install a single skill.

        Args:
            name: Skill name

        Returns:
            Installation result

        Requirements: 6.1, 6.5, 6.6
        """
        if not SKILLS_SRC_DIR.exists():
            return InstallResult(
                success=False,
                item_name=name,
                message="Skills directory not found",
                error=f"Source directory does not exist: {SKILLS_SRC_DIR}",
            )

        skill_src = SKILLS_SRC_DIR / name
        if not skill_src.exists():
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Skill not found: {name}",
                error=f"Skill directory does not exist: {skill_src}",
            )

        try:
            success = self._manager.install_skill(name, quiet=True)
            if success:
                return InstallResult(
                    success=True,
                    item_name=name,
                    message=f"Successfully installed {name}",
                )
            else:
                return InstallResult(
                    success=False,
                    item_name=name,
                    message=f"Failed to install {name}",
                    error="Installation returned False",
                )
        except PermissionError as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Permission denied: {name}",
                error=str(e),
            )
        except Exception as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Failed to install {name}",
                error=str(e),
            )

    def install_command(self, name: str) -> InstallResult:
        """Install a single command (supports nested directories).

        Args:
            name: Command name, may include path like "zcf/git-commit"

        Returns:
            Installation result

        Requirements: 6.2, 6.5, 6.6
        """
        import shutil

        src_dir = self._get_platform_commands_dir()

        if not src_dir.exists():
            return InstallResult(
                success=False,
                item_name=name,
                message="Commands directory not found",
                error=f"Source directory does not exist: {src_dir}",
            )

        try:
            src_file = None
            name_path = Path(name.replace("/", os.sep))

            for f in src_dir.rglob("*"):
                if f.is_file():
                    rel_path = f.relative_to(src_dir)
                    if rel_path.with_suffix("") == name_path:
                        src_file = f
                        break

            if src_file is None:
                return InstallResult(
                    success=False,
                    item_name=name,
                    message=f"Command not found: {name}",
                    error=f"No file matching '{name}' in {src_dir}",
                )

            self._manager.ensure_dirs()

            rel_path = src_file.relative_to(src_dir)
            target_file = self._manager.target_commands_dir / rel_path

            target_file.parent.mkdir(parents=True, exist_ok=True)

            shutil.copy2(src_file, target_file)

            return InstallResult(
                success=True,
                item_name=name,
                message=f"Successfully installed {name}",
            )
        except PermissionError as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Permission denied: {name}",
                error=str(e),
            )
        except Exception as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Failed to install {name}",
                error=str(e),
            )

    def install_all_skills(
        self,
        callback: Callable[[str, bool], None] | None = None
    ) -> tuple[int, int, list[str]]:
        """Install all skills.

        Args:
            callback: Progress callback receiving (skill_name, success)

        Returns:
            (success_count, fail_count, failure_list)
        """
        success_count = 0
        fail_count = 0
        failures: list[str] = []

        skills = self.get_skills()
        for skill in skills:
            result = self.install_skill(skill.name)
            if result.success:
                success_count += 1
            else:
                fail_count += 1
                failures.append(skill.name)

            if callback:
                callback(skill.name, result.success)

        return success_count, fail_count, failures

    def install_all_commands(
        self,
        callback: Callable[[str, bool], None] | None = None
    ) -> tuple[int, int, list[str]]:
        """Install all commands.

        Args:
            callback: Progress callback receiving (command_name, success)

        Returns:
            (success_count, fail_count, failure_list)
        """
        success_count = 0
        fail_count = 0
        failures: list[str] = []

        commands = self.get_commands()
        for cmd in commands:
            result = self.install_command(cmd.name)
            if result.success:
                success_count += 1
            else:
                fail_count += 1
                failures.append(cmd.name)

            if callback:
                callback(cmd.name, result.success)

        return success_count, fail_count, failures
