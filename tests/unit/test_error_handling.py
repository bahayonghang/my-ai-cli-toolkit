"""
单元测试：错误处理增强
测试 SkillManager 中的路径验证和错误处理
"""
import shutil
import sys
from pathlib import Path

import pytest

# 添加父目录到 sys.path 以便导入 install 模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import SkillManager, validate_project_path


class TestInstallSkillErrorHandling:
    """测试 install_skill() 方法的错误处理"""

    def test_install_skill_with_invalid_project_path(self):
        """测试使用无效项目路径时的错误处理"""
        # 使用不存在的路径
        mgr = SkillManager("claude", project_path="./nonexistent_path_12345")

        # 尝试安装技能应该失败
        result = mgr.install_skill("test-skill", quiet=True)

        assert result is False

    def test_install_skill_with_valid_project_path(self, tmp_path):
        """测试使用有效项目路径时的正常安装"""
        # 创建临时技能目录
        skills_dir = Path(__file__).parent.parent / "skills"
        test_skill_dir = skills_dir / "test-skill-temp"
        test_skill_dir.mkdir(parents=True, exist_ok=True)

        try:
            # 创建 SKILL.md 文件
            (test_skill_dir / "SKILL.md").write_text("---\nname: test-skill-temp\n---\n")

            # 使用有效的临时路径
            mgr = SkillManager("claude", project_path=str(tmp_path))

            # 安装应该成功
            result = mgr.install_skill("test-skill-temp", quiet=True)

            assert result is True
            assert (tmp_path / ".claude" / "skills" / "test-skill-temp").exists()
        finally:
            # 清理
            if test_skill_dir.exists():
                shutil.rmtree(test_skill_dir)

    def test_install_skill_global_mode_no_validation(self):
        """测试全局模式下不进行路径验证"""
        # 全局模式（project_path=None）
        mgr = SkillManager("claude")

        # 即使没有项目路径，也应该能够尝试安装（虽然可能因为技能不存在而失败）
        # 这里主要测试不会因为路径验证而失败
        result = mgr.install_skill("nonexistent-skill", quiet=True)

        # 应该因为技能不存在而失败，而不是路径验证失败
        assert result is False


class TestInstallCommandsErrorHandling:
    """测试 install_commands() 方法的错误处理"""

    def test_install_commands_with_invalid_project_path(self, capsys):
        """测试使用无效项目路径时的错误处理"""
        # 使用不存在的路径
        mgr = SkillManager("claude", project_path="./nonexistent_path_12345")

        # 尝试安装命令应该失败并显示错误
        mgr.install_commands()

        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out
        assert "does not exist" in captured.out

    def test_install_commands_with_valid_project_path(self, tmp_path):
        """测试使用有效项目路径时的正常安装"""
        # 使用有效的临时路径
        mgr = SkillManager("claude", project_path=str(tmp_path))

        # 安装命令（可能会因为源目录不存在而警告，但不应该因为路径验证失败）
        mgr.install_commands()

        # 验证目录已创建
        assert (tmp_path / ".claude").exists()

    def test_install_commands_global_mode_no_validation(self):
        """测试全局模式下不进行路径验证"""
        # 全局模式（project_path=None）
        mgr = SkillManager("claude")

        # 应该能够尝试安装命令（不会因为路径验证而失败）
        mgr.install_commands()

        # 主要测试不会抛出异常


class TestUnifiedExceptionHandling:
    """测试统一的异常处理"""

    def test_install_commands_exception_uses_format_error(self, tmp_path, capsys, monkeypatch):
        """测试 install_commands 中的异常使用 format_error"""
        # 创建一个会导致异常的场景
        mgr = SkillManager("claude", project_path=str(tmp_path))

        # 模拟 shutil.copytree 抛出异常
        def mock_copytree(*args, **kwargs):
            raise PermissionError("Mock permission error")

        import install
        monkeypatch.setattr(install.shutil, "copytree", mock_copytree)

        # 尝试安装命令
        mgr.install_commands()

        captured = capsys.readouterr()
        # 应该包含格式化的错误消息
        assert "[ERROR]" in captured.out
        assert "Cannot access" in captured.out or "Mock permission error" in captured.out

    def test_format_error_used_consistently(self):
        """测试 format_error 在整个代码库中一致使用"""
        # 测试各种错误场景都使用 format_error

        # 1. 路径不存在
        valid, error = validate_project_path("./nonexistent")
        assert error is not None
        assert "Suggestion" in error

        # 2. Kiro 需要项目路径 (validation moved to SkillManager.__init__)
        with pytest.raises(ValueError) as exc_info:
            SkillManager("claude", use_kiro=True)

        error_message = str(exc_info.value).lower()
        # 检查错误消息包含关键信息
        assert "kiro" in error_message
        assert "project" in error_message


class TestPathValidationIntegration:
    """测试路径验证的集成"""

    def test_path_validation_called_before_install(self, tmp_path):
        """测试路径验证在安装前被调用"""
        # 创建一个不存在的路径
        nonexistent = tmp_path / "nonexistent"

        mgr = SkillManager("claude", project_path=str(nonexistent))

        # 安装应该失败（因为路径验证失败）
        result = mgr.install_skill("any-skill", quiet=True)

        assert result is False

    def test_path_validation_allows_valid_paths(self, tmp_path):
        """测试路径验证允许有效路径"""
        # 创建临时技能
        skills_dir = Path(__file__).parent.parent / "skills"
        test_skill_dir = skills_dir / "test-skill-validation"
        test_skill_dir.mkdir(parents=True, exist_ok=True)

        try:
            (test_skill_dir / "SKILL.md").write_text("---\nname: test-skill-validation\n---\n")

            mgr = SkillManager("claude", project_path=str(tmp_path))

            # 安装应该成功
            result = mgr.install_skill("test-skill-validation", quiet=True)

            assert result is True
        finally:
            if test_skill_dir.exists():
                shutil.rmtree(test_skill_dir)

    def test_path_validation_checks_write_permission(self, tmp_path, monkeypatch):
        """测试路径验证检查写权限"""
        # 模拟权限错误
        def mock_touch(self):
            raise PermissionError("No write permission")

        monkeypatch.setattr(Path, "touch", mock_touch)

        valid, error = validate_project_path(str(tmp_path))

        assert valid is False
        assert "Permission denied" in error


class TestErrorMessageDisplay:
    """测试错误消息的显示"""

    def test_install_skill_displays_friendly_error(self, capsys):
        """测试 install_skill 显示友好的错误消息"""
        mgr = SkillManager("claude", project_path="./nonexistent_path_12345")

        mgr.install_skill("any-skill", quiet=False)

        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out
        assert "does not exist" in captured.out
        assert "Suggestion" in captured.out

    def test_install_commands_displays_friendly_error(self, capsys):
        """测试 install_commands 显示友好的错误消息"""
        mgr = SkillManager("claude", project_path="./nonexistent_path_12345")

        mgr.install_commands()

        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out
        assert "does not exist" in captured.out
        assert "Suggestion" in captured.out


class TestKiroModeErrorHandling:
    """测试 Kiro 模式的错误处理"""

    def test_kiro_mode_with_invalid_path(self):
        """测试 Kiro 模式使用无效路径时的错误处理"""
        mgr = SkillManager("claude", project_path="./nonexistent", use_kiro=True)

        result = mgr.install_skill("any-skill", quiet=True)

        assert result is False

    def test_kiro_mode_with_valid_path(self, tmp_path):
        """测试 Kiro 模式使用有效路径时的正常安装"""
        skills_dir = Path(__file__).parent.parent / "skills"
        test_skill_dir = skills_dir / "test-skill-kiro"
        test_skill_dir.mkdir(parents=True, exist_ok=True)

        try:
            (test_skill_dir / "SKILL.md").write_text("---\nname: test-skill-kiro\n---\n")

            mgr = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)

            result = mgr.install_skill("test-skill-kiro", quiet=True)

            assert result is True
            assert (tmp_path / ".kiro" / "skills" / "test-skill-kiro").exists()
        finally:
            if test_skill_dir.exists():
                shutil.rmtree(test_skill_dir)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
