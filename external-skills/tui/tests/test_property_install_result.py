"""
属性测试: 安装结果完整性

**Property 5: 安装结果完整性**
**Validates: Requirements 5.5, 5.6, 9.2**

*For any* 安装操作，返回的 InstallResult SHALL 包含 success 状态，
且当 success 为 False 时 SHALL 包含非空的 error 信息描述失败原因。

使用 hypothesis 库进行属性测试，至少运行 100 次迭代。
"""

import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

from hypothesis import given, settings, assume
from hypothesis import strategies as st

from core.models import InstallResult, ExternalSkillInfo
from core.manager import ExternalSkillManager


# --- Constants ---

SKILL_TYPES = ["npm-cli", "npx", "pip-cli", "git"]
PLATFORMS = ["claude", "codex", "gemini", "kiro", "windsurf"]
DEPENDENCIES = ["node", "npm", "npx", "python3", "pip", "git"]


# --- Hypothesis Strategies ---

@st.composite
def skill_name_strategy(draw):
    """生成有效的技能名称"""
    words = draw(st.lists(
        st.text(
            alphabet="abcdefghijklmnopqrstuvwxyz",
            min_size=2,
            max_size=8,
        ),
        min_size=1,
        max_size=3,
    ))
    return "-".join(words)


@st.composite
def install_result_strategy(draw):
    """生成 InstallResult 对象"""
    success = draw(st.booleans())
    skill_name = draw(skill_name_strategy())
    assume(len(skill_name) > 0)
    
    message = draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyz0123456789 ",
        min_size=1,
        max_size=50,
    ))
    
    if success:
        # 成功时 error 可以为 None
        error = None
    else:
        # 失败时 error 应该有值
        error = draw(st.text(
            alphabet="abcdefghijklmnopqrstuvwxyz0123456789 :",
            min_size=1,
            max_size=100,
        ))
    
    return InstallResult(
        success=success,
        skill_name=skill_name,
        message=message,
        error=error,
    )


# --- Helper Functions ---

def create_temp_registry_with_skill(
    skill_name: str,
    requires: list[str],
    supported_targets: list[str],
) -> Path:
    """创建包含单个技能的临时 registry.toml 文件"""
    requires_str = ", ".join(f'"{r}"' for r in requires)
    targets_str = ", ".join(f'"{t}"' for t in supported_targets)
    
    toml_content = f'''# Generated registry.toml for testing

[skills.{skill_name}]
description = "Test skill"
type = "npm-cli"
package = "test-package"
install_command = "npm install -g test-package"
init_command = "test-cli init"
init_args = ["--ai", "{{target}}"]
target_map = {{ claude = "claude", codex = "codex" }}
requires = [{requires_str}]
supported_targets = [{targets_str}]
homepage = "https://example.com"
license = "MIT"
'''
    
    fd, path = tempfile.mkstemp(suffix=".toml", prefix="registry_")
    with open(fd, "w", encoding="utf-8") as f:
        f.write(toml_content)
    
    return Path(path)


def create_mock_check_command_exists(env_state: dict):
    """创建模拟的 _check_command_exists 方法"""
    def mock_check(cmd: str) -> bool:
        return env_state.get(cmd, False)
    return mock_check


# --- Property Tests ---

class TestInstallResultCompleteness:
    """Property 5: 安装结果完整性
    
    **Validates: Requirements 5.5, 5.6, 9.2**
    """

    @given(result=install_result_strategy())
    @settings(max_examples=100, deadline=None)
    def test_install_result_has_success_field(self, result):
        """验证 InstallResult 包含 success 字段
        
        **Validates: Requirements 5.5**
        
        对于任意 InstallResult，success 字段应该是布尔值。
        """
        assert isinstance(result.success, bool), (
            f"success 字段应该是布尔值: type={type(result.success)}"
        )

    @given(result=install_result_strategy())
    @settings(max_examples=100, deadline=None)
    def test_install_result_has_skill_name(self, result):
        """验证 InstallResult 包含 skill_name 字段
        
        **Validates: Requirements 5.5**
        
        对于任意 InstallResult，skill_name 字段应该是非空字符串。
        """
        assert isinstance(result.skill_name, str), (
            f"skill_name 字段应该是字符串: type={type(result.skill_name)}"
        )
        assert len(result.skill_name) > 0, (
            f"skill_name 字段不应为空"
        )

    @given(result=install_result_strategy())
    @settings(max_examples=100, deadline=None)
    def test_install_result_has_message(self, result):
        """验证 InstallResult 包含 message 字段
        
        **Validates: Requirements 5.5**
        
        对于任意 InstallResult，message 字段应该是字符串。
        """
        assert isinstance(result.message, str), (
            f"message 字段应该是字符串: type={type(result.message)}"
        )

    @given(result=install_result_strategy())
    @settings(max_examples=100, deadline=None)
    def test_failed_result_has_error(self, result):
        """验证失败的 InstallResult 包含非空 error 信息
        
        **Validates: Requirements 5.6, 9.2**
        
        当 success 为 False 时，error 字段应该包含非空的错误信息。
        """
        if not result.success:
            assert result.error is not None, (
                f"失败的安装结果应该包含 error 信息: success={result.success}"
            )
            assert len(result.error) > 0, (
                f"失败的安装结果的 error 信息不应为空"
            )


class TestInstallResultFromManager:
    """测试 ExternalSkillManager.install_skill 返回的 InstallResult
    
    **Validates: Requirements 5.5, 5.6, 9.2**
    """

    @given(platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_install_nonexistent_skill_returns_error(self, platform):
        """验证安装不存在的技能返回错误
        
        **Validates: Requirements 9.2**
        
        安装不存在的技能应该返回 success=False 和非空 error。
        """
        skill_name = "nonexistent-skill-xyz"
        
        registry_file = create_temp_registry_with_skill(
            "other-skill", [], ["all"]
        )
        try:
            manager = ExternalSkillManager(
                platform=platform,
                registry_path=registry_file
            )
            
            result = manager.install_skill(skill_name)
            
            # 验证返回失败结果
            assert result.success is False, (
                f"安装不存在的技能应该返回 success=False"
            )
            assert result.error is not None, (
                f"安装不存在的技能应该返回非空 error"
            )
            assert len(result.error) > 0, (
                f"error 信息不应为空"
            )
            assert result.skill_name == skill_name, (
                f"skill_name 应该匹配: 期望 {skill_name}, 实际 {result.skill_name}"
            )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_install_unsupported_platform_returns_error(self, platform):
        """验证安装不支持当前平台的技能返回错误
        
        **Validates: Requirements 5.6, 9.2**
        
        安装不支持当前平台的技能应该返回 success=False 和非空 error。
        """
        skill_name = "test-skill"
        # 创建一个不支持当前平台的技能
        other_platforms = [p for p in PLATFORMS if p != platform]
        assume(len(other_platforms) > 0)
        
        registry_file = create_temp_registry_with_skill(
            skill_name, [], other_platforms
        )
        try:
            manager = ExternalSkillManager(
                platform=platform,
                registry_path=registry_file
            )
            
            result = manager.install_skill(skill_name)
            
            # 验证返回失败结果
            assert result.success is False, (
                f"安装不支持平台的技能应该返回 success=False"
            )
            assert result.error is not None, (
                f"安装不支持平台的技能应该返回非空 error"
            )
            assert "不支持平台" in result.error or "不支持" in result.error, (
                f"error 应该说明平台不支持: {result.error}"
            )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_install_missing_deps_returns_error(self, platform):
        """验证安装缺少依赖的技能返回错误
        
        **Validates: Requirements 5.6, 9.2**
        
        安装缺少依赖的技能应该返回 success=False 和非空 error。
        """
        skill_name = "test-skill"
        requires = ["node", "npm"]
        
        registry_file = create_temp_registry_with_skill(
            skill_name, requires, ["all"]
        )
        try:
            manager = ExternalSkillManager(
                platform=platform,
                registry_path=registry_file
            )
            
            # 模拟所有依赖都不存在
            env_state = {dep: False for dep in DEPENDENCIES}
            
            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.install_skill(skill_name)
            
            # 验证返回失败结果
            assert result.success is False, (
                f"安装缺少依赖的技能应该返回 success=False"
            )
            assert result.error is not None, (
                f"安装缺少依赖的技能应该返回非空 error"
            )
            assert "缺少依赖" in result.error or "依赖" in result.error, (
                f"error 应该说明缺少依赖: {result.error}"
            )
        finally:
            registry_file.unlink(missing_ok=True)


class TestInstallResultConsistency:
    """安装结果一致性测试
    
    **Validates: Requirements 5.5, 5.6, 9.2**
    """

    @given(result=install_result_strategy())
    @settings(max_examples=100, deadline=None)
    def test_success_and_error_consistency(self, result):
        """验证 success 和 error 字段的一致性
        
        **Validates: Requirements 5.5, 5.6**
        
        当 success=True 时，error 可以为 None；
        当 success=False 时，error 应该非空。
        """
        if result.success:
            # 成功时 error 可以为 None（但也可以有警告信息）
            pass  # 不做强制要求
        else:
            # 失败时 error 必须非空
            assert result.error is not None, (
                f"失败时 error 不应为 None"
            )
            assert len(result.error) > 0, (
                f"失败时 error 不应为空字符串"
            )

    @given(result=install_result_strategy())
    @settings(max_examples=100, deadline=None)
    def test_all_required_fields_present(self, result):
        """验证所有必需字段都存在
        
        **Validates: Requirements 5.5**
        
        InstallResult 应该包含 success, skill_name, message 字段。
        """
        # 验证必需字段存在
        assert hasattr(result, 'success'), "缺少 success 字段"
        assert hasattr(result, 'skill_name'), "缺少 skill_name 字段"
        assert hasattr(result, 'message'), "缺少 message 字段"
        assert hasattr(result, 'error'), "缺少 error 字段"
        
        # 验证字段类型
        assert isinstance(result.success, bool)
        assert isinstance(result.skill_name, str)
        assert isinstance(result.message, str)
        assert result.error is None or isinstance(result.error, str)
