"""属性测试: 依赖检查阻止安装

Property 6: 依赖检查阻止安装
*For any* 技能安装请求，如果该技能存在未满足的依赖，
安装函数 SHALL 返回失败结果且不执行实际的安装命令。

**Validates: Requirements 5.3**

测试框架: hypothesis
配置: 每个属性测试至少运行 100 次迭代
"""

import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

from core.manager import ExternalSkillManager
from core.models import InstallResult
from hypothesis import given, settings
from hypothesis import strategies as st

# ==================== Strategies ====================

# 技能名称策略
skill_names = st.text(
    alphabet="abcdefghijklmnopqrstuvwxyz-",
    min_size=3,
    max_size=20,
).filter(lambda x: not x.startswith("-") and not x.endswith("-"))

# 依赖列表策略 - 包含不存在的命令
unsatisfied_dependencies = st.lists(
    st.sampled_from(
        [
            "nonexistent-cmd-12345",
            "fake-tool-67890",
            "missing-dep-abcde",
            "unavailable-program",
        ]
    ),
    min_size=1,
    max_size=3,
)

# 平台策略
platforms = st.sampled_from(["claude", "codex", "gemini", "kiro", "windsurf"])


# ==================== Helper Functions ====================


def create_test_registry(
    skill_name: str,
    requires: list[str],
    supported_targets: list[str] = None,
) -> str:
    """创建测试用的 registry.toml 内容"""
    if supported_targets is None:
        supported_targets = ["all"]

    targets_str = ", ".join(f'"{t}"' for t in supported_targets)
    requires_str = ", ".join(f'"{r}"' for r in requires)

    return f"""
[skills.{skill_name}]
description = "Test skill for property testing"
type = "npm-cli"
package = "test-package"
requires = [{requires_str}]
supported_targets = [{targets_str}]
install_command = "echo 'This should not run'"
"""


# ==================== Property Tests ====================


class TestDependencyBlocksInstall:
    """Property 6: 依赖检查阻止安装测试

    **Validates: Requirements 5.3**
    """

    @given(
        skill_name=skill_names,
        deps=unsatisfied_dependencies,
        platform=platforms,
    )
    @settings(max_examples=100, deadline=None)
    def test_unsatisfied_deps_block_install(
        self,
        skill_name: str,
        deps: list[str],
        platform: str,
    ) -> None:
        """未满足的依赖应阻止安装

        **Validates: Requirements 5.3**

        Property: 如果技能存在未满足的依赖，安装函数应返回失败结果
        """
        # 创建测试配置
        content = create_test_registry(skill_name, deps)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
            f.write(content)
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager(platform, registry_path=temp_path)

            # 尝试安装
            result = manager.install_skill(skill_name, skip_install=True)

            # 验证安装失败
            assert isinstance(result, InstallResult)
            assert not result.success, f"安装应该失败，因为依赖 {deps} 未满足"
            assert result.error is not None
            assert "依赖" in result.error or any(d in result.error for d in deps)
        finally:
            temp_path.unlink(missing_ok=True)

    @given(
        skill_name=skill_names,
        deps=unsatisfied_dependencies,
        platform=platforms,
    )
    @settings(max_examples=100, deadline=None)
    def test_install_command_not_executed_when_deps_missing(
        self,
        skill_name: str,
        deps: list[str],
        platform: str,
    ) -> None:
        """依赖未满足时不应执行安装命令

        **Validates: Requirements 5.3**

        Property: 安装命令不应在依赖检查失败时执行
        """
        content = create_test_registry(skill_name, deps)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
            f.write(content)
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager(platform, registry_path=temp_path)

            # 使用 mock 跟踪命令执行
            command_executed = []
            original_run_command = manager._run_command

            def mock_run_command(cmd, *args, **kwargs):
                command_executed.append(cmd)
                return original_run_command(cmd, *args, **kwargs)

            with patch.object(manager, "_run_command", side_effect=mock_run_command):
                result = manager.install_skill(skill_name)

            # 验证没有执行安装命令
            assert not result.success
            # 安装命令不应被执行（因为依赖检查失败）
            install_commands = [c for c in command_executed if "echo" in c]
            assert len(install_commands) == 0, f"安装命令不应执行，但执行了: {install_commands}"
        finally:
            temp_path.unlink(missing_ok=True)

    @given(platform=platforms)
    @settings(max_examples=50, deadline=None)
    def test_satisfied_deps_allow_install(self, platform: str) -> None:
        """满足的依赖应允许安装继续

        **Validates: Requirements 5.3**

        Property: 如果所有依赖都满足，安装应该继续（可能因其他原因失败）
        """
        # 使用一个通常存在的命令作为依赖
        # 注意：这个测试假设 python 命令存在
        content = """
[skills.test-skill]
description = "Test skill"
type = "npm-cli"
package = "test-package"
requires = []
supported_targets = ["all"]
"""

        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
            f.write(content)
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager(platform, registry_path=temp_path)

            # 检查依赖
            dep_result = manager.check_dependencies("test-skill")

            # 空依赖列表应该全部满足
            assert dep_result.all_satisfied

            # 安装应该继续（即使最终可能因为命令不存在而失败）
            result = manager.install_skill("test-skill", skip_install=True)

            # 由于没有安装命令，应该成功
            assert result.success
        finally:
            temp_path.unlink(missing_ok=True)


class TestDependencyCheckConsistency:
    """依赖检查一致性测试

    **Validates: Requirements 5.3**
    """

    @given(
        skill_name=skill_names,
        deps=unsatisfied_dependencies,
    )
    @settings(max_examples=100, deadline=None)
    def test_check_deps_consistent_with_install(
        self,
        skill_name: str,
        deps: list[str],
    ) -> None:
        """依赖检查结果应与安装结果一致

        **Validates: Requirements 5.3**

        Property: 如果 check_dependencies 返回未满足，install_skill 也应失败
        """
        content = create_test_registry(skill_name, deps)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
            f.write(content)
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager("claude", registry_path=temp_path)

            # 检查依赖
            dep_result = manager.check_dependencies(skill_name)

            # 尝试安装
            install_result = manager.install_skill(skill_name, skip_install=True)

            # 一致性检查
            if not dep_result.all_satisfied:
                assert not install_result.success, "依赖检查失败时，安装也应该失败"
        finally:
            temp_path.unlink(missing_ok=True)

    @given(
        skill_name=skill_names,
        deps=unsatisfied_dependencies,
    )
    @settings(max_examples=100, deadline=None)
    def test_error_message_mentions_missing_deps(
        self,
        skill_name: str,
        deps: list[str],
    ) -> None:
        """错误消息应提及缺失的依赖

        **Validates: Requirements 5.3**

        Property: 安装失败时的错误消息应包含依赖相关信息
        """
        content = create_test_registry(skill_name, deps)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
            f.write(content)
            temp_path = Path(f.name)

        try:
            manager = ExternalSkillManager("claude", registry_path=temp_path)
            result = manager.install_skill(skill_name, skip_install=True)

            assert not result.success
            assert result.error is not None

            # 错误消息应该提及依赖
            error_lower = result.error.lower()
            assert "依赖" in result.error or "缺少" in result.error or any(d.lower() in error_lower for d in deps), (
                f"错误消息应提及依赖: {result.error}"
            )
        finally:
            temp_path.unlink(missing_ok=True)
