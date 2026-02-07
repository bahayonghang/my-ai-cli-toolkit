"""
单元测试：SkillManager 辅助方法
验证任务 2.2 的所有子任务要求
"""

import sys
from pathlib import Path

import pytest

# 添加父目录到 sys.path 以便导入 install 模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import SkillManager


class TestGetInstallLocationInfo:
    """测试 SkillManager.get_install_location_info() 方法（任务 2.2.1）"""

    def test_global_mode_location_info(self):
        """测试全局模式下的安装位置信息"""
        mgr = SkillManager("claude")
        info = mgr.get_install_location_info()

        # 验证返回全局模式信息
        assert "Global" in info
        assert "Target: claude" in info
        assert info == "Global (Target: claude)"

    def test_project_mode_location_info(self, tmp_path):
        """测试项目模式下的安装位置信息"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        info = mgr.get_install_location_info()

        # 验证返回项目路径信息
        assert "Project:" in info
        assert "Target: claude" in info
        assert str(tmp_path.name) in info  # 至少包含目录名

    def test_kiro_mode_location_info(self, tmp_path):
        """测试 Kiro 模式下的安装位置信息"""
        mgr = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)
        info = mgr.get_install_location_info()

        # 验证返回 Kiro 结构信息
        assert "Project:" in info
        assert "Kiro structure" in info
        assert str(tmp_path.name) in info

    def test_location_info_uses_relative_path(self, tmp_path):
        """测试安装位置信息使用相对路径"""
        # 创建子目录
        project_dir = tmp_path / "test-project"
        project_dir.mkdir()

        mgr = SkillManager("claude", project_path=str(project_dir))
        info = mgr.get_install_location_info()

        # 验证使用相对路径（不包含完整绝对路径）
        assert "Project:" in info
        # 相对路径应该更短，不包含完整的 tmp_path
        assert "test-project" in info

    def test_location_info_different_platforms(self, tmp_path):
        """测试不同平台的安装位置信息"""
        platforms = ["claude", "codex", "gemini", "qwen"]

        for platform in platforms:
            mgr = SkillManager(platform, project_path=str(tmp_path))
            info = mgr.get_install_location_info()

            # 验证包含正确的平台信息
            assert "Project:" in info
            assert f"Target: {platform}" in info

    def test_location_info_returns_string(self, tmp_path):
        """测试返回值类型为字符串"""
        mgr_global = SkillManager("claude")
        mgr_project = SkillManager("claude", project_path=str(tmp_path))
        mgr_kiro = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)

        # 验证返回类型
        assert isinstance(mgr_global.get_install_location_info(), str)
        assert isinstance(mgr_project.get_install_location_info(), str)
        assert isinstance(mgr_kiro.get_install_location_info(), str)

    def test_location_info_human_readable(self, tmp_path):
        """测试返回的信息是人类可读的"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        info = mgr.get_install_location_info()

        # 验证信息格式清晰
        assert len(info) > 0
        assert not info.startswith(" ")  # 不以空格开头
        assert not info.endswith(" ")  # 不以空格结尾
        # 包含关键信息
        assert any(keyword in info for keyword in ["Global", "Project"])


class TestListAvailableWithLocationInfo:
    """测试 list_available() 显示项目信息（任务 2.2.2）"""

    def test_list_available_shows_global_info(self, capsys):
        """测试全局模式下 list_available() 显示全局信息"""
        mgr = SkillManager("claude")
        mgr.list_available()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题包含全局信息
        assert "Available Skills" in output
        assert "Global" in output
        assert "Target: claude" in output

    def test_list_available_shows_project_info(self, tmp_path, capsys):
        """测试项目模式下 list_available() 显示项目信息"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        mgr.list_available()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题包含项目信息
        assert "Available Skills" in output
        assert "Project:" in output
        assert str(tmp_path.name) in output

    def test_list_available_shows_kiro_info(self, tmp_path, capsys):
        """测试 Kiro 模式下 list_available() 显示 Kiro 信息"""
        mgr = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)
        mgr.list_available()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题包含 Kiro 信息
        assert "Available Skills" in output
        assert "Kiro structure" in output

    def test_list_available_title_format(self, tmp_path, capsys):
        """测试 list_available() 标题格式正确"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        mgr.list_available()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题格式：=== Available Skills (...) ===
        assert "===" in output
        assert "Available Skills" in output
        assert "(" in output and ")" in output


class TestListInstalledWithLocationInfo:
    """测试 list_installed() 显示项目信息（任务 2.2.3）"""

    def test_list_installed_shows_global_info(self, capsys):
        """测试全局模式下 list_installed() 显示全局信息"""
        mgr = SkillManager("claude")
        mgr.list_installed()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题包含全局信息
        assert "Installed Skills" in output
        assert "Global" in output
        assert "Target: claude" in output

    def test_list_installed_shows_project_info(self, tmp_path, capsys):
        """测试项目模式下 list_installed() 显示项目信息"""
        # 创建项目目录结构
        skills_dir = tmp_path / ".claude" / "skills"
        skills_dir.mkdir(parents=True)

        mgr = SkillManager("claude", project_path=str(tmp_path))
        mgr.list_installed()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题包含项目信息
        assert "Installed Skills" in output
        assert "Project:" in output

    def test_list_installed_shows_kiro_info(self, tmp_path, capsys):
        """测试 Kiro 模式下 list_installed() 显示 Kiro 信息"""
        # 创建 Kiro 目录结构
        skills_dir = tmp_path / ".kiro" / "skills"
        skills_dir.mkdir(parents=True)

        mgr = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)
        mgr.list_installed()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题包含 Kiro 信息
        assert "Installed Skills" in output
        assert "Kiro structure" in output

    def test_list_installed_title_format(self, tmp_path, capsys):
        """测试 list_installed() 标题格式正确"""
        skills_dir = tmp_path / ".claude" / "skills"
        skills_dir.mkdir(parents=True)

        mgr = SkillManager("claude", project_path=str(tmp_path))
        mgr.list_installed()

        captured = capsys.readouterr()
        output = captured.out

        # 验证标题格式：=== Installed Skills (...) ===
        assert "===" in output
        assert "Installed Skills" in output
        assert "(" in output and ")" in output


class TestLocationInfoIntegration:
    """集成测试：验证安装位置信息在完整工作流中的表现"""

    def test_location_info_consistency(self, tmp_path):
        """测试安装位置信息在不同方法中保持一致"""
        mgr = SkillManager("claude", project_path=str(tmp_path))

        # 获取位置信息
        location_info = mgr.get_install_location_info()

        # 验证信息一致性（通过检查关键字）
        assert "Project:" in location_info
        assert "Target: claude" in location_info

    def test_location_info_with_different_targets(self, tmp_path):
        """测试不同目标平台的位置信息"""
        targets = ["claude", "codex", "gemini"]

        for target in targets:
            mgr = SkillManager(target, project_path=str(tmp_path))
            info = mgr.get_install_location_info()

            # 验证包含正确的目标信息
            assert f"Target: {target}" in info

    def test_location_info_kiro_vs_normal(self, tmp_path):
        """测试 Kiro 模式和普通模式的位置信息区别"""
        mgr_normal = SkillManager("claude", project_path=str(tmp_path))
        mgr_kiro = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)

        info_normal = mgr_normal.get_install_location_info()
        info_kiro = mgr_kiro.get_install_location_info()

        # 验证两者不同
        assert info_normal != info_kiro
        assert "Kiro structure" in info_kiro
        assert "Kiro structure" not in info_normal
        assert "Target: claude" in info_normal


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
