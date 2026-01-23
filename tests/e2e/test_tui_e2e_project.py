"""TUI 端到端测试 - 项目级别安装

测试完整的 TUI 工作流，包括项目路径输入和实际安装。
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock


def test_tui_project_install_workflow(tmp_path):
    """测试 TUI 项目级别安装完整工作流"""
    from tui.core.manager import TUIManager
    
    # 创建临时项目目录
    project_dir = tmp_path / "test-project"
    project_dir.mkdir()
    
    # 创建临时技能源目录
    skills_src = tmp_path / "skills"
    skills_src.mkdir()
    test_skill = skills_src / "test-skill"
    test_skill.mkdir()
    (test_skill / "SKILL.md").write_text("---\nname: test-skill\n---\n# Test Skill")
    
    # 需要同时 patch TUIManager 和 SkillManager 中的 SKILLS_SRC_DIR
    with patch("tui.core.manager.SKILLS_SRC_DIR", skills_src):
        with patch("install.SKILLS_SRC_DIR", skills_src):
            # 初始化 TUIManager
            manager = TUIManager(
                platform="claude",
                project_path=str(project_dir)
            )
            
            # 验证配置
            assert manager.project_path == str(project_dir)
            
            # 获取技能列表
            skills = manager.get_skills()
            assert len(skills) == 1
            assert skills[0].name == "test-skill"
            
            # 安装技能
            result = manager.install_skill("test-skill")
            assert result.success is True
            
            # 验证安装位置
            installed_skill = project_dir / ".claude" / "skills" / "test-skill"
            assert installed_skill.exists()
            assert (installed_skill / "SKILL.md").exists()


def test_tui_kiro_install_workflow(tmp_path):
    """测试 TUI Kiro 模式安装完整工作流"""
    from tui.core.manager import TUIManager
    
    # 创建临时项目目录
    project_dir = tmp_path / "kiro-project"
    project_dir.mkdir()
    
    # 创建临时技能源目录
    skills_src = tmp_path / "skills"
    skills_src.mkdir()
    test_skill = skills_src / "test-skill"
    test_skill.mkdir()
    (test_skill / "SKILL.md").write_text("---\nname: test-skill\n---\n# Test Skill")
    
    # 需要同时 patch TUIManager 和 SkillManager 中的 SKILLS_SRC_DIR
    with patch("tui.core.manager.SKILLS_SRC_DIR", skills_src):
        with patch("install.SKILLS_SRC_DIR", skills_src):
            # 初始化 TUIManager（Kiro 模式）
            manager = TUIManager(
                platform="kiro",
                project_path=str(project_dir)
            )
            
            # 验证配置
            assert manager.project_path == str(project_dir)
            
            # 安装技能
            result = manager.install_skill("test-skill")
            assert result.success is True
            
            # 验证安装位置（应该在 .kiro 目录）
            installed_skill = project_dir / ".kiro" / "skills" / "test-skill"
            assert installed_skill.exists()
            assert (installed_skill / "SKILL.md").exists()


def test_tui_global_install_backward_compatibility(tmp_path):
    """测试 TUI 全局安装向后兼容性"""
    from tui.core.manager import TUIManager
    
    # 创建临时技能源目录
    skills_src = tmp_path / "skills"
    skills_src.mkdir()
    test_skill = skills_src / "test-skill"
    test_skill.mkdir()
    (test_skill / "SKILL.md").write_text("---\nname: test-skill\n---\n# Test Skill")
    
    # 创建临时全局目录
    global_dir = tmp_path / ".claude"
    global_dir.mkdir()
    
    with patch("tui.core.manager.SKILLS_SRC_DIR", skills_src):
        with patch("tui.core.manager.SkillManager") as mock_skill_manager:
            # 模拟 SkillManager
            mock_instance = MagicMock()
            mock_instance.target_skills_dir = global_dir / "skills"
            mock_instance.install_skill.return_value = True
            mock_skill_manager.return_value = mock_instance
            
            # 初始化 TUIManager（全局模式）
            manager = TUIManager(platform="claude")
            
            # 验证配置
            assert manager.project_path is None
            
            # 验证 SkillManager 被正确调用（不带项目路径）
            mock_skill_manager.assert_called_once_with(
                "claude",
                project_path=None
            )


def test_tui_path_validation():
    """测试 TUI 路径验证"""
    from pathlib import Path
    
    # 测试不存在的路径
    nonexistent_path = "./nonexistent-project"
    path = Path(nonexistent_path)
    assert not path.exists()
    
    # 测试存在的路径
    with tempfile.TemporaryDirectory() as tmpdir:
        existing_path = Path(tmpdir)
        assert existing_path.exists()
        assert existing_path.is_dir()


def test_tui_relative_path_handling(tmp_path):
    """测试 TUI 相对路径处理"""
    from tui.components.header import Header
    
    # 创建测试项目目录
    project_dir = tmp_path / "test-project"
    project_dir.mkdir()
    
    # 测试相对路径显示
    header = Header(
        platform="claude",
        project_path=str(project_dir)
    )
    
    title = header._format_title()
    assert "MyClaude Skills Manager" in title
    # 应该包含项目路径信息
    assert "📁" in title


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
