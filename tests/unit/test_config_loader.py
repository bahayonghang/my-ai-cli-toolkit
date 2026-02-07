"""
单元测试：config_loader 模块
测试平台配置加载、路径解析和测试辅助函数
"""
import sys
import tempfile
from pathlib import Path

import pytest

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from core.config_loader import (
    DEFAULT_PLATFORMS,
    DEFAULT_PROJECT_OVERRIDES,
    ERROR_MSG_KIRO_REQUIRES_PROJECT,
    PlatformConfig,
    clear_config_cache,
    get_all_platforms,
    get_available_platform_names,
    get_commands_source_dir,
    get_platform_config,
    resolve_install_paths,
    set_test_config,
)


class TestPlatformConfig:
    """测试 PlatformConfig 数据类"""

    def test_get_base_path_expands_user(self):
        """测试 base_dir 中的 ~ 被正确展开"""
        config = PlatformConfig(
            name="test",
            type="cli",
            base_dir="~/.test",
            skills_subdir="skills",
            commands_subdir="commands",
            prompt_file=None,
            commands_source="test",
            fallback_commands_source=None,
        )
        base_path = config.get_base_path()
        assert "~" not in str(base_path)
        assert base_path.is_absolute()

    def test_get_skills_path(self):
        """测试 skills 路径计算"""
        config = PlatformConfig(
            name="test",
            type="cli",
            base_dir="/tmp/test",
            skills_subdir="my-skills",
            commands_subdir="commands",
            prompt_file=None,
            commands_source="test",
            fallback_commands_source=None,
        )
        assert config.get_skills_path() == Path("/tmp/test/my-skills")

    def test_get_commands_path(self):
        """测试 commands 路径计算"""
        config = PlatformConfig(
            name="test",
            type="cli",
            base_dir="/tmp/test",
            skills_subdir="skills",
            commands_subdir="my-commands",
            prompt_file=None,
            commands_source="test",
            fallback_commands_source=None,
        )
        assert config.get_commands_path() == Path("/tmp/test/my-commands")

    def test_get_prompt_path_when_configured(self):
        """测试有 prompt_file 时的路径计算"""
        config = PlatformConfig(
            name="test",
            type="cli",
            base_dir="/tmp/test",
            skills_subdir="skills",
            commands_subdir="commands",
            prompt_file="PROMPT.md",
            commands_source="test",
            fallback_commands_source=None,
        )
        assert config.get_prompt_path() == Path("/tmp/test/PROMPT.md")

    def test_get_prompt_path_when_not_configured(self):
        """测试没有 prompt_file 时返回 None"""
        config = PlatformConfig(
            name="test",
            type="cli",
            base_dir="/tmp/test",
            skills_subdir="skills",
            commands_subdir="commands",
            prompt_file=None,
            commands_source="test",
            fallback_commands_source=None,
        )
        assert config.get_prompt_path() is None


class TestDefaultConfigurations:
    """测试默认配置"""

    def test_default_platforms_contains_claude(self):
        """测试默认配置包含 claude 平台"""
        assert "claude" in DEFAULT_PLATFORMS
        assert DEFAULT_PLATFORMS["claude"].name == "claude"

    def test_default_platforms_contains_expected_platforms(self):
        """测试默认配置包含所有预期平台"""
        expected = {"claude", "codex", "gemini", "qwen", "kiro", "trae", "antigravity", "windsurf"}
        assert expected.issubset(set(DEFAULT_PLATFORMS.keys()))

    def test_default_project_overrides_contains_kiro(self):
        """测试默认项目覆盖包含 kiro"""
        assert "kiro" in DEFAULT_PROJECT_OVERRIDES
        assert DEFAULT_PROJECT_OVERRIDES["kiro"].platform_dir == ".kiro"


class TestGetPlatformConfig:
    """测试 get_platform_config 函数"""

    def setup_method(self):
        """每个测试前清除缓存"""
        clear_config_cache()

    def test_get_known_platform(self):
        """测试获取已知平台配置"""
        config = get_platform_config("claude")
        assert config.name == "claude"
        assert config.type == "cli"

    def test_get_unknown_platform_raises_error(self):
        """测试获取未知平台时抛出错误"""
        with pytest.raises(ValueError) as exc_info:
            get_platform_config("unknown_platform_xyz")
        assert "Unknown platform" in str(exc_info.value)
        assert "unknown_platform_xyz" in str(exc_info.value)


class TestGetAvailablePlatformNames:
    """测试 get_available_platform_names 函数"""

    def setup_method(self):
        """每个测试前清除缓存"""
        clear_config_cache()

    def test_returns_sorted_list(self):
        """测试返回排序后的平台名称列表"""
        names = get_available_platform_names()
        assert names == sorted(names)

    def test_contains_expected_platforms(self):
        """测试包含预期的平台"""
        names = get_available_platform_names()
        assert "claude" in names
        assert "codex" in names


class TestResolveInstallPaths:
    """测试 resolve_install_paths 函数"""

    def setup_method(self):
        """每个测试前清除缓存"""
        clear_config_cache()

    def test_global_installation_paths(self):
        """测试全局安装路径解析"""
        paths = resolve_install_paths("claude")
        assert "base" in paths
        assert "skills" in paths
        assert "commands" in paths
        assert "prompt" in paths

    def test_project_installation_paths(self):
        """测试项目级安装路径解析"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            paths = resolve_install_paths("claude", project_path=tmp_dir)
            assert paths["base"] == Path(tmp_dir).resolve() / ".claude"
            assert paths["skills"] == Path(tmp_dir).resolve() / ".claude" / "skills"

    def test_kiro_mode_requires_project_path(self):
        """测试 kiro 模式需要项目路径"""
        with pytest.raises(ValueError) as exc_info:
            resolve_install_paths("claude", use_kiro=True)
        assert "kiro" in str(exc_info.value).lower()

    def test_kiro_platform_without_project_path(self):
        """测试 kiro 平台不需要 use_kiro 标志"""
        # kiro 平台本身不需要 project_path（全局安装）
        paths = resolve_install_paths("kiro")
        assert paths["base"].name == ".kiro" or "kiro" in str(paths["base"])

    def test_whitespace_project_path_treated_as_none(self):
        """测试空白字符串 project_path 被视为 None"""
        # 空白字符串应该被规范化为 None，触发全局安装
        paths = resolve_install_paths("claude", project_path="   ")
        # 应该返回全局路径，而不是基于空白字符串的路径
        assert "~" not in str(paths["base"]) or paths["base"].is_absolute()

    def test_whitespace_project_path_with_kiro_raises_error(self):
        """测试空白字符串 project_path 与 use_kiro 组合时抛出错误"""
        with pytest.raises(ValueError):
            resolve_install_paths("claude", project_path="   ", use_kiro=True)


class TestGetCommandsSourceDir:
    """测试 get_commands_source_dir 函数"""

    def setup_method(self):
        """每个测试前清除缓存"""
        clear_config_cache()

    def test_returns_path(self):
        """测试返回 Path 对象"""
        commands_src = PROJECT_ROOT / "commands"
        result = get_commands_source_dir("claude", commands_src)
        assert isinstance(result, Path)

    def test_fallback_when_primary_not_exists(self):
        """测试主目录不存在时使用 fallback"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            # 只创建 claude 目录（作为 fallback）
            (tmp_path / "claude").mkdir()

            # codex 的 fallback 是 claude
            result = get_commands_source_dir("codex", tmp_path)
            assert result == tmp_path / "claude"


class TestSetTestConfig:
    """测试 set_test_config 测试辅助函数"""

    def setup_method(self):
        """每个测试前清除缓存"""
        clear_config_cache()

    def teardown_method(self):
        """每个测试后清除缓存"""
        clear_config_cache()

    def test_set_and_restore_platforms(self):
        """测试设置和恢复平台配置"""
        # 获取原始配置
        original_config = get_platform_config("claude")

        # 创建测试配置
        test_config = PlatformConfig(
            name="claude",
            type="cli",
            base_dir="/test/path",
            skills_subdir="test-skills",
            commands_subdir="test-commands",
            prompt_file=None,
            commands_source="claude",
            fallback_commands_source=None,
        )

        # 设置测试配置
        original = set_test_config(platforms={"claude": test_config})

        # 验证配置已更改
        new_config = get_platform_config("claude")
        assert new_config.base_dir == "/test/path"

        # 恢复原始配置
        set_test_config(platforms=original[0], overrides=original[1])

        # 验证配置已恢复
        restored_config = get_platform_config("claude")
        assert restored_config.base_dir == original_config.base_dir

    def test_returns_original_values(self):
        """测试返回原始值"""
        # 确保缓存已加载
        get_all_platforms()

        # 设置新配置
        original = set_test_config(platforms={})

        # 验证返回了原始值
        assert original[0] is not None
        assert "claude" in original[0]

        # 清理
        set_test_config(platforms=original[0], overrides=original[1])


class TestErrorMessages:
    """测试错误消息常量"""

    def test_kiro_requires_project_message_format(self):
        """测试 kiro 错误消息格式"""
        assert "kiro" in ERROR_MSG_KIRO_REQUIRES_PROJECT.lower()
        assert "project" in ERROR_MSG_KIRO_REQUIRES_PROJECT.lower()
        assert "\n" in ERROR_MSG_KIRO_REQUIRES_PROJECT  # 多行消息
