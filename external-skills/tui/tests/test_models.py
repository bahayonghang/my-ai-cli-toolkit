"""
数据模型单元测试

测试 ExternalSkillInfo, DependencyStatus, DependencyCheckResult, InstallResult 数据类。

**Validates: Requirements 2.2, 3.2**
"""

import sys
from pathlib import Path

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))


from core.models import (
    DependencyCheckResult,
    DependencyStatus,
    ExternalSkillInfo,
    InstallResult,
)

# --- ExternalSkillInfo 测试 ---

class TestExternalSkillInfo:
    """ExternalSkillInfo 数据类测试"""

    def test_create_with_required_fields(self):
        """测试使用必需字段创建 ExternalSkillInfo"""
        skill = ExternalSkillInfo(
            name="test-skill",
            description="A test skill",
            skill_type="npm-cli",
            package="test-package",
        )
        assert skill.name == "test-skill"
        assert skill.description == "A test skill"
        assert skill.skill_type == "npm-cli"
        assert skill.package == "test-package"

    def test_create_with_all_fields(self):
        """测试使用所有字段创建 ExternalSkillInfo"""
        skill = ExternalSkillInfo(
            name="full-skill",
            description="A full skill",
            skill_type="npx",
            package="@scope/package",
            requires=["node", "npm"],
            supported_targets=["claude", "codex"],
            homepage="https://example.com",
            license="MIT",
            is_supported=False,
        )
        assert skill.name == "full-skill"
        assert skill.description == "A full skill"
        assert skill.skill_type == "npx"
        assert skill.package == "@scope/package"
        assert skill.requires == ["node", "npm"]
        assert skill.supported_targets == ["claude", "codex"]
        assert skill.homepage == "https://example.com"
        assert skill.license == "MIT"
        assert skill.is_supported is False

    def test_default_values(self):
        """测试默认值"""
        skill = ExternalSkillInfo(
            name="default-skill",
            description="Default test",
            skill_type="git",
            package="https://github.com/test/repo",
        )
        assert skill.requires == []
        assert skill.supported_targets == []
        assert skill.homepage == ""
        assert skill.license == ""
        assert skill.is_supported is True

    def test_empty_requires_list(self):
        """测试空依赖列表"""
        skill = ExternalSkillInfo(
            name="no-deps",
            description="No dependencies",
            skill_type="pip-cli",
            package="simple-package",
            requires=[],
        )
        assert skill.requires == []
        assert len(skill.requires) == 0

    def test_empty_supported_targets(self):
        """测试空支持平台列表"""
        skill = ExternalSkillInfo(
            name="no-targets",
            description="No targets",
            skill_type="npm-cli",
            package="package",
            supported_targets=[],
        )
        assert skill.supported_targets == []
        assert len(skill.supported_targets) == 0

    def test_empty_strings(self):
        """测试空字符串字段"""
        skill = ExternalSkillInfo(
            name="",
            description="",
            skill_type="",
            package="",
            homepage="",
            license="",
        )
        assert skill.name == ""
        assert skill.description == ""
        assert skill.skill_type == ""
        assert skill.package == ""
        assert skill.homepage == ""
        assert skill.license == ""

    def test_skill_types(self):
        """测试不同的技能类型"""
        types = ["npm-cli", "npx", "pip-cli", "git"]
        for skill_type in types:
            skill = ExternalSkillInfo(
                name=f"{skill_type}-skill",
                description=f"A {skill_type} skill",
                skill_type=skill_type,
                package="package",
            )
            assert skill.skill_type == skill_type


# --- DependencyStatus 测试 ---

class TestDependencyStatus:
    """DependencyStatus 数据类测试"""

    def test_create_satisfied(self):
        """测试创建满足的依赖状态"""
        status = DependencyStatus(name="node", satisfied=True)
        assert status.name == "node"
        assert status.satisfied is True

    def test_create_unsatisfied(self):
        """测试创建未满足的依赖状态"""
        status = DependencyStatus(name="npm", satisfied=False)
        assert status.name == "npm"
        assert status.satisfied is False

    def test_empty_name(self):
        """测试空依赖名称"""
        status = DependencyStatus(name="", satisfied=True)
        assert status.name == ""
        assert status.satisfied is True

    def test_common_dependencies(self):
        """测试常见依赖"""
        deps = ["node", "npm", "python3", "git", "pip"]
        for dep in deps:
            status = DependencyStatus(name=dep, satisfied=True)
            assert status.name == dep


# --- DependencyCheckResult 测试 ---

class TestDependencyCheckResult:
    """DependencyCheckResult 数据类测试"""

    def test_create_all_satisfied(self):
        """测试所有依赖都满足的情况"""
        result = DependencyCheckResult(
            all_satisfied=True,
            dependencies=[
                DependencyStatus(name="node", satisfied=True),
                DependencyStatus(name="npm", satisfied=True),
            ],
        )
        assert result.all_satisfied is True
        assert len(result.dependencies) == 2
        assert all(d.satisfied for d in result.dependencies)

    def test_create_some_unsatisfied(self):
        """测试部分依赖未满足的情况"""
        result = DependencyCheckResult(
            all_satisfied=False,
            dependencies=[
                DependencyStatus(name="node", satisfied=True),
                DependencyStatus(name="npm", satisfied=False),
            ],
        )
        assert result.all_satisfied is False
        assert len(result.dependencies) == 2
        assert not all(d.satisfied for d in result.dependencies)

    def test_default_empty_dependencies(self):
        """测试默认空依赖列表"""
        result = DependencyCheckResult(all_satisfied=True)
        assert result.dependencies == []
        assert len(result.dependencies) == 0

    def test_empty_dependencies_list(self):
        """测试显式空依赖列表"""
        result = DependencyCheckResult(
            all_satisfied=True,
            dependencies=[],
        )
        assert result.all_satisfied is True
        assert result.dependencies == []

    def test_single_dependency(self):
        """测试单个依赖"""
        result = DependencyCheckResult(
            all_satisfied=True,
            dependencies=[DependencyStatus(name="git", satisfied=True)],
        )
        assert len(result.dependencies) == 1
        assert result.dependencies[0].name == "git"


# --- InstallResult 测试 ---

class TestInstallResult:
    """InstallResult 数据类测试"""

    def test_create_success(self):
        """测试创建成功的安装结果"""
        result = InstallResult(
            success=True,
            skill_name="test-skill",
            message="Installation successful",
        )
        assert result.success is True
        assert result.skill_name == "test-skill"
        assert result.message == "Installation successful"
        assert result.error is None

    def test_create_failure_with_error(self):
        """测试创建失败的安装结果（带错误信息）"""
        result = InstallResult(
            success=False,
            skill_name="failed-skill",
            message="Installation failed",
            error="Command exited with code 1",
        )
        assert result.success is False
        assert result.skill_name == "failed-skill"
        assert result.message == "Installation failed"
        assert result.error == "Command exited with code 1"

    def test_default_error_is_none(self):
        """测试默认错误为 None"""
        result = InstallResult(
            success=True,
            skill_name="skill",
            message="OK",
        )
        assert result.error is None

    def test_empty_strings(self):
        """测试空字符串字段"""
        result = InstallResult(
            success=False,
            skill_name="",
            message="",
            error="",
        )
        assert result.skill_name == ""
        assert result.message == ""
        assert result.error == ""

    def test_success_with_error_field(self):
        """测试成功但带有错误字段（边界情况）"""
        # 虽然不常见，但数据类允许这种情况
        result = InstallResult(
            success=True,
            skill_name="skill",
            message="Success with warning",
            error="Some warning",
        )
        assert result.success is True
        assert result.error == "Some warning"

    def test_failure_without_error(self):
        """测试失败但没有错误信息（边界情况）"""
        result = InstallResult(
            success=False,
            skill_name="skill",
            message="Unknown failure",
        )
        assert result.success is False
        assert result.error is None
