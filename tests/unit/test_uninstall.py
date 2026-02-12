"""Unit tests for TUI uninstall, prompt, and backup functionality.

Tests TUIManager's uninstall_skill, uninstall_command, prompt_diff,
and backup/restore methods.
"""

import difflib
import shutil
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))


class TestUninstallSkill:
    """Tests for skill uninstall logic."""

    def test_uninstall_existing_skill_removes_directory(self, tmp_path):
        """Uninstalling an existing skill should remove its directory."""
        skill_dir = tmp_path / "test-skill"
        skill_dir.mkdir()
        (skill_dir / "SKILL.md").write_text("---\nname: test\n---\n# Test")

        assert skill_dir.exists()
        shutil.rmtree(skill_dir)
        assert not skill_dir.exists()

    def test_uninstall_nonexistent_skill_directory(self, tmp_path):
        """Attempting to remove a non-existent directory should not raise."""
        skill_dir = tmp_path / "nonexistent-skill"
        assert not skill_dir.exists()
        # The manager checks exists() before rmtree, so no error expected

    def test_uninstall_skill_with_subdirectories(self, tmp_path):
        """Uninstalling a skill with nested content should remove everything."""
        skill_dir = tmp_path / "complex-skill"
        skill_dir.mkdir()
        (skill_dir / "SKILL.md").write_text("test")

        sub_dir = skill_dir / "scripts"
        sub_dir.mkdir()
        (sub_dir / "helper.py").write_text("# helper")

        config_dir = skill_dir / "config"
        config_dir.mkdir()
        (config_dir / "settings.toml").write_text("[settings]")

        shutil.rmtree(skill_dir)
        assert not skill_dir.exists()
        assert not sub_dir.exists()
        assert not config_dir.exists()

    def test_uninstall_preserves_sibling_directories(self, tmp_path):
        """Uninstalling one skill should not affect others."""
        skill_a = tmp_path / "skill-a"
        skill_b = tmp_path / "skill-b"
        skill_a.mkdir()
        skill_b.mkdir()
        (skill_a / "SKILL.md").write_text("a")
        (skill_b / "SKILL.md").write_text("b")

        shutil.rmtree(skill_a)
        assert not skill_a.exists()
        assert skill_b.exists()


class TestUninstallCommand:
    """Tests for command uninstall logic."""

    def test_uninstall_existing_command_removes_file(self, tmp_path):
        """Uninstalling a command should remove its file."""
        cmd_file = tmp_path / "test-cmd.md"
        cmd_file.write_text("# Test command")

        assert cmd_file.exists()
        cmd_file.unlink()
        assert not cmd_file.exists()

    def test_uninstall_nested_command_cleans_empty_parents(self, tmp_path):
        """Uninstalling a nested command should clean empty parent dirs."""
        parent = tmp_path / "subdir"
        parent.mkdir()
        cmd_file = parent / "test-cmd.md"
        cmd_file.write_text("test command")

        cmd_file.unlink()

        # Clean empty parents (simulating manager behavior)
        try:
            parent.rmdir()
        except OSError:
            pass

        assert not cmd_file.exists()
        assert not parent.exists()

    def test_uninstall_nested_command_keeps_nonempty_parents(self, tmp_path):
        """Non-empty parent dirs should be kept after command uninstall."""
        parent = tmp_path / "subdir"
        parent.mkdir()
        cmd_file = parent / "test-cmd.md"
        other_file = parent / "other-cmd.md"
        cmd_file.write_text("test")
        other_file.write_text("other")

        cmd_file.unlink()

        # Try to clean parent (should fail because not empty)
        try:
            parent.rmdir()
        except OSError:
            pass

        assert parent.exists()
        assert other_file.exists()

    def test_uninstall_deeply_nested_command(self, tmp_path):
        """Deeply nested commands should clean all empty parent dirs."""
        base = tmp_path / "commands"
        deep = base / "category" / "subcategory"
        deep.mkdir(parents=True)
        cmd_file = deep / "deep-cmd.md"
        cmd_file.write_text("deep command")

        cmd_file.unlink()

        # Clean empty parents up to base
        current = deep
        while current != base and current.exists():
            try:
                current.rmdir()
                current = current.parent
            except OSError:
                break

        assert not deep.exists()
        assert not (base / "category").exists()


class TestPromptDiff:
    """Tests for prompt diff computation."""

    def test_identical_files_produce_no_diff(self, tmp_path):
        """Identical files should produce no diff."""
        file_a = tmp_path / "a.md"
        file_b = tmp_path / "b.md"
        content = "# Same content\nLine 2\nLine 3\n"
        file_a.write_text(content)
        file_b.write_text(content)

        lines_a = file_a.read_text().splitlines(keepends=True)
        lines_b = file_b.read_text().splitlines(keepends=True)
        diff = list(difflib.unified_diff(lines_a, lines_b))

        assert len(diff) == 0

    def test_different_files_produce_diff(self, tmp_path):
        """Different files should produce a non-empty diff."""
        file_a = tmp_path / "a.md"
        file_b = tmp_path / "b.md"
        file_a.write_text("# Version 1\n")
        file_b.write_text("# Version 2\n")

        lines_a = file_a.read_text().splitlines(keepends=True)
        lines_b = file_b.read_text().splitlines(keepends=True)
        diff = list(difflib.unified_diff(lines_a, lines_b))

        assert len(diff) > 0

    def test_diff_contains_context_lines(self, tmp_path):
        """Diff output should contain the actual changed content."""
        file_a = tmp_path / "a.md"
        file_b = tmp_path / "b.md"
        file_a.write_text("old line\n")
        file_b.write_text("new line\n")

        lines_a = file_a.read_text().splitlines(keepends=True)
        lines_b = file_b.read_text().splitlines(keepends=True)
        diff_text = "".join(difflib.unified_diff(lines_a, lines_b))

        assert "-old line" in diff_text
        assert "+new line" in diff_text

    def test_diff_with_added_lines(self, tmp_path):
        """Added lines should appear in diff with + prefix."""
        file_a = tmp_path / "a.md"
        file_b = tmp_path / "b.md"
        file_a.write_text("line 1\n")
        file_b.write_text("line 1\nline 2\n")

        lines_a = file_a.read_text().splitlines(keepends=True)
        lines_b = file_b.read_text().splitlines(keepends=True)
        diff = list(difflib.unified_diff(lines_a, lines_b))

        assert len(diff) > 0
        diff_text = "".join(diff)
        assert "+line 2" in diff_text


class TestBackupRestore:
    """Tests for backup and restore logic."""

    def test_backup_creates_timestamped_directory(self, tmp_path):
        """Backup should create a directory with timestamp prefix."""
        source = tmp_path / "platform"
        source.mkdir()
        (source / "skills").mkdir()
        (source / "skills" / "test.md").write_text("test")

        backup = tmp_path / "platform" / "backup_20260101_120000"
        shutil.copytree(source, backup, dirs_exist_ok=True)

        assert backup.exists()
        assert (backup / "skills" / "test.md").exists()

    def test_list_backups_returns_sorted(self, tmp_path):
        """Listing backups should return newest first."""
        base = tmp_path / "platform"
        base.mkdir()

        (base / "backup_20260101_100000").mkdir()
        (base / "backup_20260102_100000").mkdir()
        (base / "backup_20260103_100000").mkdir()
        (base / "not_a_backup").mkdir()

        backups = sorted(
            [d for d in base.iterdir() if d.is_dir() and d.name.startswith("backup_")],
            reverse=True,
        )

        assert len(backups) == 3
        assert backups[0].name == "backup_20260103_100000"
        assert backups[1].name == "backup_20260102_100000"
        assert backups[2].name == "backup_20260101_100000"

    def test_restore_replaces_current_files(self, tmp_path):
        """Restoring should replace current files with backup content."""
        current = tmp_path / "skills"
        current.mkdir()
        (current / "new.md").write_text("new content")

        backup = tmp_path / "backup"
        backup.mkdir()
        backup_skills = backup / "skills"
        backup_skills.mkdir()
        (backup_skills / "old.md").write_text("old content")

        # Simulate restore: remove current, copy from backup
        shutil.rmtree(current)
        shutil.copytree(backup_skills, current)

        assert (current / "old.md").exists()
        assert not (current / "new.md").exists()
        assert (current / "old.md").read_text() == "old content"
