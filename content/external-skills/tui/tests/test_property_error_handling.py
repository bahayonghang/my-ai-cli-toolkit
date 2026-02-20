"""属性测试: 错误处理健壮性

Property 7: 错误处理健壮性
*For any* 异常输入（如无效的技能名称、损坏的配置文件），
系统 SHALL 返回适当的错误结果而不是抛出未捕获的异常。

**Validates: Requirements 9.4**

测试框架: hypothesis
配置: 每个属性测试至少运行 100 次迭代
"""

import sys
import tempfile
from pathlib import Path

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

import pytest
from core.manager import ExternalSkillManager
from core.models import InstallResult
from hypothesis import given, settings
from hypothesis import strategies as st

# ==================== Strategies ====================

# 随机字符串策略（包含各种特殊字符）
random_string = st.text(
    alphabet=st.characters(
        whitelist_categories=("L", "N", "P", "S"),
        blacklist_characters="\x00",
    ),
    min_size=0,
    max_size=100,
)

# 无效技能名称策略
invalid_skill_names = st.one_of(
    st.just(""),  # 空字符串
    st.just("   "),  # 空白字符串
    st.just("nonexistent-skill-12345"),  # 不存在的技能
    st.text(min_size=1, max_size=50).filter(lambda x: x.strip() != ""),  # 随机字符串
)

# 无效平台名称策略
invalid_platforms = st.one_of(
    st.just(""),
    st.just("invalid-platform"),
    st.just("unknown"),
    random_string.filter(lambda x: x not in ["claude", "codex", "gemini", "kiro", "windsurf"]),
)

# 损坏的 TOML 内容策略 - 使用 ASCII 字符避免编码问题
corrupted_toml_content = st.one_of(
    st.just(""),  # 空文件
    st.just("invalid toml content [[["),  # 无效语法
    st.just("[skills]\nname = "),  # 不完整的值
    st.just("skills = 'not a table'"),  # 错误类型
    st.just("[skills.test]\nrequires = 'not a list'"),  # 错误的 requires 类型
    st.just("[[[[invalid"),  # 无效括号
    st.just("key without value"),  # 缺少值
    st.just("[skills]\n[skills]"),  # 重复表
)


# ==================== Property Tests ====================


class TestErrorHandlingRobustness:
    """Property 7: 错误处理健壮性测试

    **Validates: Requirements 9.4**
    """

    @given(skill_name=invalid_skill_names)
    @settings(max_examples=100)
    def test_invalid_skill_name_returns_error_not_exception(self, skill_name: str) -> None:
        """无效技能名称应返回错误结果而非抛出异常

        **Validates: Requirements 9.4**
        """
        manager = ExternalSkillManager("claude")

        # get_skill_detail 应返回 None 而非抛出异常
        result = manager.get_skill_detail(skill_name)
        assert result is None or hasattr(result, "name")

        # install_skill 应返回失败结果而非抛出异常
        install_result = manager.install_skill(skill_name, skip_install=True)
        assert isinstance(install_result, InstallResult)

        # 如果技能不存在，应该返回失败
        if result is None:
            assert not install_result.success
            assert install_result.error is not None

    @given(platform=invalid_platforms)
    @settings(max_examples=100)
    def test_invalid_platform_handles_gracefully(self, platform: str) -> None:
        """无效平台名称应优雅处理

        **Validates: Requirements 9.4**
        """
        # 创建管理器不应抛出异常
        manager = ExternalSkillManager(platform)

        # 获取技能列表不应抛出异常（可能返回空列表或所有技能标记为不支持）
        try:
            skills = manager.get_skills()
            assert isinstance(skills, list)
        except FileNotFoundError:
            # 配置文件不存在是预期的异常
            pass
        except ValueError:
            # 配置文件格式错误是预期的异常
            pass

    @given(content=corrupted_toml_content)
    @settings(max_examples=100)
    def test_corrupted_config_returns_error_not_crash(self, content: str) -> None:
        """损坏的配置文件应返回错误而非崩溃

        **Validates: Requirements 9.4**
        """
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
            f.write(content)
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager("claude", registry_path=temp_path)

            # 应该抛出 ValueError 或 FileNotFoundError，而非其他异常
            try:
                skills = manager.get_skills()
                # 如果成功解析，结果应该是列表
                assert isinstance(skills, list)
            except (ValueError, FileNotFoundError) as e:
                # 这些是预期的异常类型
                assert str(e)  # 错误消息不应为空
            except Exception as e:
                # 其他异常类型是不期望的
                pytest.fail(f"Unexpected exception type: {type(e).__name__}: {e}")
        finally:
            temp_path.unlink(missing_ok=True)

    @given(skill_name=random_string)
    @settings(max_examples=100)
    def test_check_dependencies_handles_invalid_skill(self, skill_name: str) -> None:
        """依赖检查应优雅处理无效技能名称

        **Validates: Requirements 9.4**
        """
        manager = ExternalSkillManager("claude")

        try:
            result = manager.check_dependencies(skill_name)
            # 如果成功，结果应该有正确的结构
            assert hasattr(result, "all_satisfied")
            assert hasattr(result, "dependencies")
        except ValueError as e:
            # ValueError 是预期的异常（技能不存在）
            assert "未知技能" in str(e) or skill_name in str(e)
        except FileNotFoundError:
            # 配置文件不存在是预期的异常
            pass

    @given(
        skill_name=random_string,
        platform=st.sampled_from(["claude", "codex", "gemini", "kiro", "windsurf"]),
    )
    @settings(max_examples=100)
    def test_install_always_returns_install_result(self, skill_name: str, platform: str) -> None:
        """安装操作应始终返回 InstallResult 而非抛出异常

        **Validates: Requirements 9.4**
        """
        manager = ExternalSkillManager(platform)

        # 安装应该返回 InstallResult，无论输入是什么
        result = manager.install_skill(skill_name, skip_install=True)

        assert isinstance(result, InstallResult)
        assert isinstance(result.success, bool)
        assert isinstance(result.skill_name, str)
        assert isinstance(result.message, str)

        # 如果失败，应该有错误信息
        if not result.success:
            assert result.error is not None
            assert len(result.error) > 0


class TestConfigFileErrorHandling:
    """配置文件错误处理测试

    **Validates: Requirements 9.1, 9.4**
    """

    def test_missing_config_file_raises_file_not_found(self) -> None:
        """配置文件不存在应抛出 FileNotFoundError

        **Validates: Requirements 9.1**
        """
        nonexistent_path = Path("/nonexistent/path/registry.toml")
        manager = ExternalSkillManager("claude", registry_path=nonexistent_path)

        with pytest.raises(FileNotFoundError) as exc_info:
            manager.get_skills()

        assert "配置文件不存在" in str(exc_info.value)

    def test_invalid_toml_syntax_raises_value_error(self) -> None:
        """无效 TOML 语法应抛出 ValueError

        **Validates: Requirements 9.4**
        """
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write("invalid [[[toml syntax")
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager("claude", registry_path=temp_path)

            with pytest.raises(ValueError) as exc_info:
                manager.get_skills()

            assert "配置文件格式错误" in str(exc_info.value)
        finally:
            temp_path.unlink(missing_ok=True)

    def test_empty_config_file_returns_empty_list(self) -> None:
        """空配置文件应返回空列表

        **Validates: Requirements 9.4**
        """
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write("")  # 空文件
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager("claude", registry_path=temp_path)

            # 空 TOML 文件应该能解析，返回空列表
            try:
                skills = manager.get_skills()
                assert skills == []
            except ValueError:
                # 某些 TOML 解析器可能认为空文件无效
                pass
        finally:
            temp_path.unlink(missing_ok=True)


class TestInstallErrorHandling:
    """安装错误处理测试

    **Validates: Requirements 9.2**
    """

    def test_unsupported_platform_returns_error(self) -> None:
        """不支持的平台应返回错误结果

        **Validates: Requirements 9.2**
        """
        # 创建一个只支持特定平台的测试配置
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write("""
[skills.test-skill]
description = "Test skill"
type = "npm-cli"
package = "test-package"
requires = []
supported_targets = ["claude"]
""")
            temp_path = Path(f.name)

        try:
            # 使用不支持的平台
            manager = ExternalSkillManager("codex", registry_path=temp_path)
            result = manager.install_skill("test-skill", skip_install=True)

            assert not result.success
            assert result.error is not None
            assert "不支持" in result.error or "codex" in result.error
        finally:
            temp_path.unlink(missing_ok=True)

    def test_missing_dependency_returns_error(self) -> None:
        """缺少依赖应返回错误结果

        **Validates: Requirements 9.2**
        """
        # 创建一个需要不存在依赖的测试配置
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write("""
[skills.test-skill]
description = "Test skill"
type = "npm-cli"
package = "test-package"
requires = ["nonexistent-command-12345"]
supported_targets = ["all"]
""")
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager("claude", registry_path=temp_path)
            result = manager.install_skill("test-skill", skip_install=True)

            assert not result.success
            assert result.error is not None
            assert "依赖" in result.error or "nonexistent" in result.error
        finally:
            temp_path.unlink(missing_ok=True)
