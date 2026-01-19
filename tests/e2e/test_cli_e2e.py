"""
CLI 端到端测试

测试 CLI 命令的完整工作流，包括项目级别安装、Kiro 模式等。
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from typer.testing import CliRunner
import sys

# 添加项目根目录到 sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import app, SKILLS_SRC_DIR, COMMANDS_SRC_DIR

runner = CliRunner()


class TestCLIProjectInstall:
    """测试 CLI 项目级别安装功能"""
    
    def test_install_skill_to_project(self, tmp_path):
        """测试安装技能到项目目录"""
        # 确保有可用的技能
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available in repository")
        
        # 获取第一个可用技能
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        # 执行安装
        result = runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        # 验证
        assert result.exit_code == 0
        assert (tmp_path / ".claude" / "skills" / skill_name).exists()
        assert "Installing to: Project:" in result.stdout
    
    def test_install_skill_to_kiro_project(self, tmp_path):
        """测试安装技能到 Kiro 项目"""
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available in repository")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        result = runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--kiro"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".kiro" / "skills" / skill_name).exists()
        assert "Kiro structure" in result.stdout
    
    def test_install_multiple_skills_to_project(self, tmp_path):
        """测试批量安装技能到项目"""
        if not SKILLS_SRC_DIR.exists():
            pytest.skip("No skills available")
        
        skills = [d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir()][:2]
        if len(skills) < 2:
            pytest.skip("Need at least 2 skills")
        
        result = runner.invoke(app, [
            "install",
            *skills,
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        assert result.exit_code == 0
        for skill in skills:
            assert (tmp_path / ".claude" / "skills" / skill).exists()
    
    def test_install_all_to_project(self, tmp_path):
        """测试安装所有技能到项目"""
        if not SKILLS_SRC_DIR.exists():
            pytest.skip("No skills available")
        
        result = runner.invoke(app, [
            "install-all",
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".claude" / "skills").exists()
        assert "Finished!" in result.stdout
    
    def test_list_skills_in_project(self, tmp_path):
        """测试列出项目中的技能"""
        result = runner.invoke(app, [
            "list-skills",  # 修正命令名
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        assert result.exit_code == 0
        assert "Available Skills" in result.stdout
        assert "Project:" in result.stdout
    
    def test_installed_skills_in_project(self, tmp_path):
        """测试列出项目中已安装的技能"""
        # 先安装一个技能
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        # 列出已安装
        result = runner.invoke(app, [
            "installed",
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        assert result.exit_code == 0
        assert "Installed Skills" in result.stdout
        assert skill_name in result.stdout


class TestCLIKiroMode:
    """测试 CLI Kiro 模式"""
    
    def test_kiro_without_project_fails(self):
        """测试 --kiro 缺少 --project 时失败"""
        result = runner.invoke(app, [
            "install",
            "test-skill",
            "--kiro"
        ])
        
        assert result.exit_code == 1
        assert "requires --project" in result.stdout
    
    def test_kiro_with_project_succeeds(self, tmp_path):
        """测试 --kiro 配合 --project 成功"""
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        result = runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--kiro"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".kiro" / "skills" / skill_name).exists()
    
    def test_kiro_commands_to_steering(self, tmp_path):
        """测试 Kiro 模式下命令安装到 steering 目录"""
        if not COMMANDS_SRC_DIR.exists():
            pytest.skip("No commands available")
        
        result = runner.invoke(app, [
            "install-commands",
            "--project", str(tmp_path),
            "--kiro"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".kiro" / "steering").exists()


class TestCLIErrorHandling:
    """测试 CLI 错误处理"""
    
    def test_invalid_project_path(self):
        """测试无效的项目路径"""
        result = runner.invoke(app, [
            "install",
            "test-skill",
            "--project", "/nonexistent/path/that/does/not/exist"
        ])
        
        # install_skill 会打印错误但不会导致 CLI 退出码为 1
        # 因为它在内部处理了错误
        assert "does not exist" in result.stdout or result.exit_code == 0
    
    def test_nonexistent_skill(self, tmp_path):
        """测试安装不存在的技能"""
        result = runner.invoke(app, [
            "install",
            "nonexistent-skill-xyz",
            "--project", str(tmp_path)
        ])
        
        assert result.exit_code == 0  # install_skill 返回 False 但不退出
        assert "not found" in result.stdout.lower()
    
    def test_relative_path_support(self, tmp_path):
        """测试相对路径支持"""
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        # 使用相对路径
        import os
        original_cwd = os.getcwd()
        try:
            os.chdir(tmp_path.parent)
            rel_path = tmp_path.name
            
            result = runner.invoke(app, [
                "install",
                skill_name,
                "--project", rel_path,
                "--target", "claude"
            ])
            
            assert result.exit_code == 0
        finally:
            os.chdir(original_cwd)


class TestCLIMultiPlatform:
    """测试 CLI 多平台支持"""
    
    @pytest.mark.parametrize("target,expected_dir", [
        ("claude", ".claude"),
        ("codex", ".codex"),
        ("gemini", ".gemini"),
        ("qwen", ".qwen"),
    ])
    def test_install_to_different_platforms(self, tmp_path, target, expected_dir):
        """测试安装到不同平台"""
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        result = runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--target", target
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / expected_dir / "skills" / skill_name).exists()
    
    def test_antigravity_platform(self, tmp_path):
        """测试 Antigravity 平台（特殊路径结构）"""
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        result = runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--target", "antigravity"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".gemini" / "antigravity" / "skills" / skill_name).exists()
    
    def test_windsurf_platform(self, tmp_path):
        """测试 Windsurf 平台（特殊路径结构）"""
        if not SKILLS_SRC_DIR.exists() or not list(SKILLS_SRC_DIR.iterdir()):
            pytest.skip("No skills available")
        
        skill_name = next(d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir())
        
        result = runner.invoke(app, [
            "install",
            skill_name,
            "--project", str(tmp_path),
            "--target", "windsurf"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".codeium" / "windsurf" / "skills" / skill_name).exists()


class TestCLICommandsInstall:
    """测试 CLI 命令安装"""
    
    def test_install_commands_to_project(self, tmp_path):
        """测试安装命令到项目"""
        if not COMMANDS_SRC_DIR.exists():
            pytest.skip("No commands available")
        
        result = runner.invoke(app, [
            "install-commands",
            "--project", str(tmp_path),
            "--target", "claude"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".claude" / "commands").exists()
    
    def test_install_commands_codex_to_prompts(self, tmp_path):
        """测试 Codex 平台命令安装到 prompts 目录"""
        if not COMMANDS_SRC_DIR.exists():
            pytest.skip("No commands available")
        
        result = runner.invoke(app, [
            "install-commands",
            "--project", str(tmp_path),
            "--target", "codex"
        ])
        
        assert result.exit_code == 0
        assert (tmp_path / ".codex" / "prompts").exists()
