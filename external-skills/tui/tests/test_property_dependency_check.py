"""
属性测试: 依赖检查正确性

**Property 3: 依赖检查正确性**
**Validates: Requirements 4.2, 4.3**

*For any* 依赖列表和系统环境状态，依赖检查函数返回的结果 SHALL 准确反映每个依赖的实际满足状态，
且 `all_satisfied` 字段为 True 当且仅当所有依赖都满足。

使用 hypothesis 库进行属性测试，至少运行 100 次迭代。
使用 mock 来模拟不同的系统环境状态。
"""

import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

from core.manager import ExternalSkillManager
from hypothesis import given, settings
from hypothesis import strategies as st

# --- Constants ---

# 有效的依赖列表
DEPENDENCIES = ["node", "npm", "npx", "python3", "pip", "git"]

# 有效的平台列表
PLATFORMS = ["claude", "codex", "gemini", "kiro", "windsurf"]


# --- Hypothesis Strategies ---

@st.composite
def dependency_list_strategy(draw):
    """生成随机的依赖列表

    生成 0-6 个不重复的依赖项
    """
    deps = draw(st.lists(
        st.sampled_from(DEPENDENCIES),
        min_size=0,
        max_size=len(DEPENDENCIES),
        unique=True,
    ))
    return deps


@st.composite
def environment_state_strategy(draw):
    """生成随机的系统环境状态

    返回一个字典，表示每个依赖是否在系统中存在
    """
    state = {}
    for dep in DEPENDENCIES:
        state[dep] = draw(st.booleans())
    return state


@st.composite
def dependency_and_environment_strategy(draw):
    """生成依赖列表和对应的环境状态

    返回 (依赖列表, 环境状态字典)
    """
    deps = draw(dependency_list_strategy())
    env_state = draw(environment_state_strategy())
    return deps, env_state


# --- Helper Functions ---

def create_mock_check_command_exists(env_state: dict):
    """创建一个模拟的 _check_command_exists 方法

    Args:
        env_state: 环境状态字典，key 为依赖名，value 为是否存在

    Returns:
        模拟函数
    """
    def mock_check(cmd: str) -> bool:
        return env_state.get(cmd, False)
    return mock_check


def create_temp_registry_with_skill(skill_name: str, requires: list[str]) -> Path:
    """创建包含单个技能的临时 registry.toml 文件

    Args:
        skill_name: 技能名称
        requires: 依赖列表

    Returns:
        临时文件路径
    """
    requires_str = ", ".join(f'"{r}"' for r in requires)
    toml_content = f'''# Generated registry.toml for testing

[skills.{skill_name}]
description = "Test skill"
type = "npm-cli"
package = "test-package"
requires = [{requires_str}]
supported_targets = ["all"]
homepage = "https://example.com"
license = "MIT"
'''

    fd, path = tempfile.mkstemp(suffix=".toml", prefix="registry_")
    with open(fd, "w", encoding="utf-8") as f:
        f.write(toml_content)

    return Path(path)


# --- Property Tests ---

class TestDependencyCheckCorrectness:
    """Property 3: 依赖检查正确性

    **Validates: Requirements 4.2, 4.3**
    """

    @given(data=dependency_and_environment_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_all_satisfied_iff_all_deps_satisfied(self, data, platform):
        """验证 all_satisfied 字段的正确性

        **Validates: Requirements 4.2, 4.3**

        all_satisfied 为 True 当且仅当所有依赖都满足。
        """
        deps, env_state = data
        skill_name = "test-skill"

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            # Mock _check_command_exists 方法
            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            # 计算期望的 all_satisfied 值
            if len(deps) == 0:
                # 空依赖列表，应该全部满足
                expected_all_satisfied = True
            else:
                # 检查所有依赖是否都满足
                expected_all_satisfied = all(env_state.get(dep, False) for dep in deps)

            assert result.all_satisfied == expected_all_satisfied, (
                f"all_satisfied 不正确: "
                f"依赖={deps}, 环境={env_state}, "
                f"期望 {expected_all_satisfied}, 实际 {result.all_satisfied}"
            )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(data=dependency_and_environment_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_each_dependency_status_accurate(self, data, platform):
        """验证每个依赖状态的准确性

        **Validates: Requirements 4.2**

        每个依赖的 satisfied 状态应准确反映系统环境中该依赖的实际状态。
        """
        deps, env_state = data
        skill_name = "test-skill"

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            # Mock _check_command_exists 方法
            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            # 验证返回的依赖数量
            assert len(result.dependencies) == len(deps), (
                f"依赖数量不匹配: 期望 {len(deps)}, 实际 {len(result.dependencies)}"
            )

            # 验证每个依赖的状态
            result_dict = {d.name: d.satisfied for d in result.dependencies}

            for dep in deps:
                assert dep in result_dict, f"依赖 {dep} 未在结果中"
                expected_satisfied = env_state.get(dep, False)
                assert result_dict[dep] == expected_satisfied, (
                    f"依赖 {dep} 状态不正确: "
                    f"期望 {expected_satisfied}, 实际 {result_dict[dep]}"
                )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(data=dependency_and_environment_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_dependency_order_preserved(self, data, platform):
        """验证依赖顺序保持一致

        **Validates: Requirements 4.2**

        返回的依赖状态列表应与输入的依赖列表顺序一致。
        """
        deps, env_state = data
        skill_name = "test-skill"

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            # Mock _check_command_exists 方法
            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            # 验证顺序
            result_names = [d.name for d in result.dependencies]
            assert result_names == deps, (
                f"依赖顺序不一致: 期望 {deps}, 实际 {result_names}"
            )
        finally:
            registry_file.unlink(missing_ok=True)


class TestDependencyCheckEdgeCases:
    """依赖检查边界情况测试

    **Validates: Requirements 4.2, 4.3**
    """

    @given(env_state=environment_state_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_empty_dependency_list(self, env_state, platform):
        """验证空依赖列表的处理

        **Validates: Requirements 4.3**

        空依赖列表应返回 all_satisfied=True 和空的 dependencies 列表。
        """
        skill_name = "test-skill"
        deps = []  # 空依赖列表

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            # Mock _check_command_exists 方法
            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            # 空依赖列表应该全部满足
            assert result.all_satisfied is True, (
                f"空依赖列表应返回 all_satisfied=True, 实际 {result.all_satisfied}"
            )
            assert len(result.dependencies) == 0, (
                f"空依赖列表应返回空的 dependencies, 实际 {len(result.dependencies)} 个"
            )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_all_deps_satisfied(self, platform):
        """验证所有依赖都满足的情况

        **Validates: Requirements 4.3**

        当所有依赖都满足时，all_satisfied 应为 True。
        """
        skill_name = "test-skill"
        deps = ["node", "npm", "git"]

        # 所有依赖都存在
        env_state = dict.fromkeys(DEPENDENCIES, True)

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            assert result.all_satisfied is True, (
                "所有依赖满足时应返回 all_satisfied=True"
            )

            for dep_status in result.dependencies:
                assert dep_status.satisfied is True, (
                    f"依赖 {dep_status.name} 应为 satisfied=True"
                )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_no_deps_satisfied(self, platform):
        """验证所有依赖都不满足的情况

        **Validates: Requirements 4.3**

        当所有依赖都不满足时，all_satisfied 应为 False。
        """
        skill_name = "test-skill"
        deps = ["node", "npm", "git"]

        # 所有依赖都不存在
        env_state = dict.fromkeys(DEPENDENCIES, False)

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            assert result.all_satisfied is False, (
                "所有依赖不满足时应返回 all_satisfied=False"
            )

            for dep_status in result.dependencies:
                assert dep_status.satisfied is False, (
                    f"依赖 {dep_status.name} 应为 satisfied=False"
                )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_partial_deps_satisfied(self, platform):
        """验证部分依赖满足的情况

        **Validates: Requirements 4.2, 4.3**

        当部分依赖满足时，all_satisfied 应为 False，且每个依赖状态准确。
        """
        skill_name = "test-skill"
        deps = ["node", "npm", "git"]

        # 只有 node 存在
        env_state = {
            "node": True,
            "npm": False,
            "npx": False,
            "python3": False,
            "pip": False,
            "git": False,
        }

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            # 部分满足时 all_satisfied 应为 False
            assert result.all_satisfied is False, (
                "部分依赖满足时应返回 all_satisfied=False"
            )

            # 验证每个依赖的状态
            result_dict = {d.name: d.satisfied for d in result.dependencies}
            assert result_dict["node"] is True
            assert result_dict["npm"] is False
            assert result_dict["git"] is False
        finally:
            registry_file.unlink(missing_ok=True)


class TestDependencyCheckConsistency:
    """依赖检查一致性测试

    **Validates: Requirements 4.2, 4.3**
    """

    @given(data=dependency_and_environment_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_all_satisfied_consistency(self, data, platform):
        """验证 all_satisfied 与 dependencies 列表的一致性

        **Validates: Requirements 4.2, 4.3**

        all_satisfied 应该等于 all(d.satisfied for d in dependencies)
        """
        deps, env_state = data
        skill_name = "test-skill"

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            with patch.object(
                manager,
                '_check_command_exists',
                side_effect=create_mock_check_command_exists(env_state)
            ):
                result = manager.check_dependencies(skill_name)

            # 计算 dependencies 列表的 all() 结果
            if len(result.dependencies) == 0:
                computed_all_satisfied = True
            else:
                computed_all_satisfied = all(d.satisfied for d in result.dependencies)

            assert result.all_satisfied == computed_all_satisfied, (
                f"all_satisfied 与 dependencies 不一致: "
                f"all_satisfied={result.all_satisfied}, "
                f"computed={computed_all_satisfied}, "
                f"dependencies={[(d.name, d.satisfied) for d in result.dependencies]}"
            )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(data=dependency_and_environment_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_idempotent_check(self, data, platform):
        """验证依赖检查的幂等性

        **Validates: Requirements 4.2**

        多次调用 check_dependencies 应返回相同的结果。
        """
        deps, env_state = data
        skill_name = "test-skill"

        registry_file = create_temp_registry_with_skill(skill_name, deps)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)

            mock_fn = create_mock_check_command_exists(env_state)

            with patch.object(manager, '_check_command_exists', side_effect=mock_fn):
                result1 = manager.check_dependencies(skill_name)

            with patch.object(manager, '_check_command_exists', side_effect=mock_fn):
                result2 = manager.check_dependencies(skill_name)

            # 验证两次结果一致
            assert result1.all_satisfied == result2.all_satisfied, (
                "幂等性检查失败: all_satisfied 不一致"
            )

            assert len(result1.dependencies) == len(result2.dependencies), (
                "幂等性检查失败: dependencies 长度不一致"
            )

            for d1, d2 in zip(result1.dependencies, result2.dependencies, strict=False):
                assert d1.name == d2.name, "幂等性检查失败: 依赖名称不一致"
                assert d1.satisfied == d2.satisfied, (
                    f"幂等性检查失败: 依赖 {d1.name} 状态不一致"
                )
        finally:
            registry_file.unlink(missing_ok=True)
