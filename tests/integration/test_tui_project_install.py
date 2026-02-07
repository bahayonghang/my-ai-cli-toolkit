"""TUI 项目级别安装功能测试

测试 TUI 组件对项目路径的支持。
路径配置已移至 InstallModal，不再在初始化时传入。
"""

from unittest.mock import patch

import pytest

# 测试 TUIManager 初始化


def test_tui_manager_init_with_project_path():
    """测试 TUIManager 使用项目路径初始化"""
    from tui.core.manager import TUIManager

    with patch("tui.core.manager.SkillManager") as mock_skill_manager:
        manager = TUIManager(platform="claude", project_path="./test-project")

        assert manager.platform == "claude"
        assert manager.project_path == "./test-project"

        # 验证 SkillManager 被正确调用
        mock_skill_manager.assert_called_once_with("claude", project_path="./test-project")


def test_tui_manager_init_with_kiro_platform():
    """测试 TUIManager 使用 Kiro 平台初始化"""
    from tui.core.manager import TUIManager

    with patch("tui.core.manager.SkillManager") as mock_skill_manager:
        manager = TUIManager(platform="kiro", project_path="./kiro-project")

        assert manager.platform == "kiro"
        assert manager.project_path == "./kiro-project"

        # 验证 SkillManager 被正确调用
        mock_skill_manager.assert_called_once_with("kiro", project_path="./kiro-project")


def test_tui_manager_init_global():
    """测试 TUIManager 全局模式初始化（向后兼容）"""
    from tui.core.manager import TUIManager

    with patch("tui.core.manager.SkillManager") as mock_skill_manager:
        manager = TUIManager(platform="claude")

        assert manager.platform == "claude"
        assert manager.project_path is None

        # 验证 SkillManager 被正确调用
        mock_skill_manager.assert_called_once_with("claude", project_path=None)


# 测试 MainScreen 初始化


def test_main_screen_init_with_platform():
    """测试 MainScreen 使用平台初始化"""
    from tui.screens.main_screen import MainScreen

    screen = MainScreen(platform="claude")

    assert screen._platform == "claude"


def test_main_screen_init_with_kiro_platform():
    """测试 MainScreen 使用 Kiro 平台初始化"""
    from tui.screens.main_screen import MainScreen

    screen = MainScreen(platform="kiro")

    assert screen._platform == "kiro"


def test_main_screen_init_default():
    """测试 MainScreen 默认初始化"""
    from tui.screens.main_screen import MainScreen

    screen = MainScreen()

    assert screen._platform == "claude"


# 测试 SkillInstallerApp


def test_app_set_platform():
    """测试应用设置平台"""
    from tui.app import SkillInstallerApp

    app = SkillInstallerApp()

    # Mock push_screen 方法
    with patch.object(app, "push_screen") as mock_push:
        app.set_platform(platform="claude")

        assert app.current_platform == "claude"

        # 验证 MainScreen 被创建并推送
        mock_push.assert_called_once()
        main_screen = mock_push.call_args[0][0]
        assert main_screen._platform == "claude"


def test_app_set_platform_kiro():
    """测试应用设置平台为 Kiro"""
    from tui.app import SkillInstallerApp

    app = SkillInstallerApp()

    with patch.object(app, "push_screen") as mock_push:
        app.set_platform(platform="kiro")

        assert app.current_platform == "kiro"

        # 验证 MainScreen 被创建并推送
        mock_push.assert_called_once()
        main_screen = mock_push.call_args[0][0]
        assert main_screen._platform == "kiro"


# 测试 Header 组件


def test_header_format_title():
    """测试 Header 标题格式化（不再包含项目路径）"""
    from tui.components.header import Header

    header = Header(platform="claude")

    title = header._format_title()
    assert "MyClaude Skills Manager" in title
    # 路径已移至 InstallModal，标题中不再显示
    assert "📁" not in title


def test_header_format_badge_with_kiro():
    """测试 Header 徽章格式化（包含 Kiro 标识）"""
    from tui.components.header import Header

    header = Header(platform="kiro")

    badge = header._format_badge()
    assert "KIRO" in badge


def test_header_format_badge_with_claude():
    """测试 Header 徽章格式化（Claude 标识）"""
    from tui.components.header import Header

    header = Header(platform="claude")

    badge = header._format_badge()
    assert "CLAUDE" in badge
    assert "KIRO" not in badge


def test_header_global_mode():
    """测试 Header 默认模式"""
    from tui.components.header import Header

    header = Header(platform="claude")

    title = header._format_title()
    assert "MyClaude Skills Manager" in title
    assert "📁" not in title

    badge = header._format_badge()
    assert "CLAUDE" in badge


# 测试 InstallConfig 数据模型


def test_install_config_global_mode():
    """测试 InstallConfig 全局安装模式"""
    from tui.components.install_modal import InstallConfig

    config = InstallConfig(
        install_mode="global",
        directory_path=None,
        items=["test-skill"],
    )

    assert config.install_mode == "global"
    assert config.directory_path is None
    assert config.items == ["test-skill"]


def test_install_config_directory_mode():
    """测试 InstallConfig 目录安装模式"""
    from tui.components.install_modal import InstallConfig

    config = InstallConfig(
        install_mode="directory",
        directory_path="./test-project",
        items=["skill-a", "skill-b"],
    )

    assert config.install_mode == "directory"
    assert config.directory_path == "./test-project"
    assert len(config.items) == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
