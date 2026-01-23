"""TUI 项目级别安装功能测试

测试 TUI 组件对项目路径的支持。
"""

import pytest
from pathlib import Path
from unittest.mock import Mock, patch

# 测试 TUIManager 初始化


def test_tui_manager_init_with_project_path():
    """测试 TUIManager 使用项目路径初始化"""
    from tui.core.manager import TUIManager
    
    with patch("tui.core.manager.SkillManager") as mock_skill_manager:
        manager = TUIManager(
            platform="claude",
            project_path="./test-project"
        )
        
        assert manager.platform == "claude"
        assert manager.project_path == "./test-project"
        
        # 验证 SkillManager 被正确调用
        mock_skill_manager.assert_called_once_with(
            "claude",
            project_path="./test-project"
        )


def test_tui_manager_init_with_kiro_platform():
    """测试 TUIManager 使用 Kiro 平台初始化"""
    from tui.core.manager import TUIManager
    
    with patch("tui.core.manager.SkillManager") as mock_skill_manager:
        manager = TUIManager(
            platform="kiro",
            project_path="./kiro-project"
        )
        
        assert manager.platform == "kiro"
        assert manager.project_path == "./kiro-project"
        
        # 验证 SkillManager 被正确调用
        mock_skill_manager.assert_called_once_with(
            "kiro",
            project_path="./kiro-project"
        )


def test_tui_manager_init_global():
    """测试 TUIManager 全局模式初始化（向后兼容）"""
    from tui.core.manager import TUIManager
    
    with patch("tui.core.manager.SkillManager") as mock_skill_manager:
        manager = TUIManager(platform="claude")
        
        assert manager.platform == "claude"
        assert manager.project_path is None
        
        # 验证 SkillManager 被正确调用
        mock_skill_manager.assert_called_once_with(
            "claude",
            project_path=None
        )


# 测试 MainScreen 初始化


def test_main_screen_init_with_project():
    """测试 MainScreen 使用项目路径初始化"""
    from tui.screens.main_screen import MainScreen
    
    screen = MainScreen(
        platform="claude",
        project_path="./test-project"
    )
    
    assert screen._platform == "claude"
    assert screen._project_path == "./test-project"


def test_main_screen_init_with_kiro_platform():
    """测试 MainScreen 使用 Kiro 平台初始化"""
    from tui.screens.main_screen import MainScreen
    
    screen = MainScreen(
        platform="kiro",
        project_path="./kiro-project"
    )
    
    assert screen._platform == "kiro"
    assert screen._project_path == "./kiro-project"


def test_main_screen_init_global():
    """测试 MainScreen 全局模式初始化（向后兼容）"""
    from tui.screens.main_screen import MainScreen
    
    screen = MainScreen(platform="claude")
    
    assert screen._platform == "claude"
    assert screen._project_path is None


# 测试 SkillInstallerApp


def test_app_set_platform_with_project():
    """测试应用设置平台和项目路径"""
    from tui.app import SkillInstallerApp
    
    app = SkillInstallerApp()
    
    # Mock push_screen 方法
    with patch.object(app, "push_screen") as mock_push:
        app.set_platform(
            platform="claude",
            project_path="./test-project"
        )
        
        assert app.current_platform == "claude"
        assert app.current_project_path == "./test-project"
        
        # 验证 MainScreen 被创建并推送
        mock_push.assert_called_once()
        main_screen = mock_push.call_args[0][0]
        assert main_screen._platform == "claude"
        assert main_screen._project_path == "./test-project"


def test_app_set_platform_with_kiro_platform():
    """测试应用设置平台为 Kiro"""
    from tui.app import SkillInstallerApp
    
    app = SkillInstallerApp()
    
    with patch.object(app, "push_screen") as mock_push:
        app.set_platform(
            platform="kiro",
            project_path="./kiro-project"
        )
        
        assert app.current_platform == "kiro"
        assert app.current_project_path == "./kiro-project"
        
        # 验证 MainScreen 被创建并推送
        mock_push.assert_called_once()
        main_screen = mock_push.call_args[0][0]
        assert main_screen._platform == "kiro"
        assert main_screen._project_path == "./kiro-project"


def test_app_set_platform_global():
    """测试应用设置平台（全局模式，向后兼容）"""
    from tui.app import SkillInstallerApp
    
    app = SkillInstallerApp()
    
    with patch.object(app, "push_screen") as mock_push:
        app.set_platform(platform="claude")
        
        assert app.current_platform == "claude"
        assert app.current_project_path is None


# 测试 Header 组件


def test_header_format_title_with_project():
    """测试 Header 标题格式化（包含项目路径）"""
    from tui.components.header import Header
    
    header = Header(
        platform="claude",
        project_path="./test-project"
    )
    
    title = header._format_title()
    assert "MyClaude Skills Manager" in title
    assert "test-project" in title


def test_header_format_badge_with_kiro():
    """测试 Header 徽章格式化（包含 Kiro 标识）"""
    from tui.components.header import Header
    
    header = Header(
        platform="kiro",
        project_path="./kiro-project"
    )
    
    badge = header._format_badge()
    assert "KIRO" in badge


def test_header_format_badge_without_kiro():
    """测试 Header 徽章格式化（不含 Kiro 标识）"""
    from tui.components.header import Header
    
    header = Header(
        platform="claude",
        project_path="./test-project"
    )
    
    badge = header._format_badge()
    assert "CLAUDE" in badge
    assert "KIRO" not in badge


def test_header_global_mode():
    """测试 Header 全局模式（向后兼容）"""
    from tui.components.header import Header
    
    header = Header(platform="claude")
    
    title = header._format_title()
    assert "MyClaude Skills Manager" in title
    assert "📁" not in title  # 没有项目路径图标
    
    badge = header._format_badge()
    assert "CLAUDE" in badge
    assert "KIRO" not in badge


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
