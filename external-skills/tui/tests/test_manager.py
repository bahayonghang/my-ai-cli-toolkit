"""
ExternalSkillManager 单元测试

测试 ExternalSkillManager 的核心功能。

**Validates: Requirements 2.1, 4.2, 5.1, 10.1**
"""

import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

import pytest

from core.manager import ExternalSkillManager
from core.models import (
    ExternalSkillInfo,
    DependencyCheckResult,
    DependencyStatus,
    InstallResult,
)


# --- 测试用的 fixture ---

@pytest.fixture
def sample_registry_content():
    """示例 registry.toml 内容"""
    return """
[skills.test-skill]
description = "A test skill"
type = "npm-cli"
package = "test-package"
install_command = "npm install -g test-package"
init_command = "test-cli init"
init_args = ["--ai", "{target}"]
target_map = { claude = "claude", codex = "codex" }
supported_targets = ["claude", "codex", "kiro"]
requires = ["node", "npm"]
homepage = "https://example.com"
license = "MIT"

[skills.all-platform-skill]
description = "Supports all platforms"
type = "npx"
package = "all-skill"
supported_targets = ["all"]
requires = ["node"]

[skills.no-deps-skill]
description = "No dependencies"
type = "pip-cli"
package = "simple-skill"
supported_targets = ["claude"]
requires = []
"""


@pytest.fixture
def temp_registry(tmp_path, sample_registry_content):
    """创建临时 registry.toml 文件"""
    registry_file = tmp_path / "registry.toml"
    registry_file.write_text(sample_registry_content)
    return registry_file


@pytest.fixture
def manager_claude(temp_registry):
    """创建 claude 平台的 manager"""
    return ExternalSkillManager(platform="claude", registry_path=temp_registry)


@pytest.fixture
def manager_gemini(temp_registry):
    """创建 gemini 平台的 manager (不支持 test-skill)"""
    return ExternalSkillManager(platform="gemini", registry_path=temp_registry)


# --- get_skills 测试 ---

class TestGetSkills:
    """get_skills 方法测试"""

    def test_load_all_skills(self, manager_claude):
        """测试加载所有技能"""
        skills = manager_claude.get_skills()
        assert len(skills) == 3
        names = [s.name for s in skills]
        assert "test-skill" in names
        assert "all-platform-skill" in names
        assert "no-deps-skill" in names

    def test_skill_info_fields(self, manager_claude):
        """测试技能信息字段正确性"""
        skills = manager_claude.get_skills()
        test_skill = next(s for s in skills if s.name == "test-skill")
        
        assert test_skill.description == "A test skill"
        assert test_skill.skill_type == "npm-cli"
        assert test_skill.package == "test-package"
        assert test_skill.requires == ["node", "npm"]
        assert test_skill.supported_targets == ["claude", "codex", "kiro"]
        assert test_skill.homepage == "https://example.com"
        assert test_skill.license == "MIT"

    def test_is_supported_for_claude(self, manager_claude):
        """测试 claude 平台的支持状态"""
        skills = manager_claude.get_skills()
        test_skill = next(s for s in skills if s.name == "test-skill")
        all_skill = next(s for s in skills if s.name == "all-platform-skill")
        no_deps = next(s for s in skills if s.name == "no-deps-skill")
        
        assert test_skill.is_supported is True
        assert all_skill.is_supported is True  # "all" 支持所有平台
        assert no_deps.is_supported is True

    def test_is_supported_for_unsupported_platform(self, manager_gemini):
        """测试不支持的平台"""
        skills = manager_gemini.get_skills()
        test_skill = next(s for s in skills if s.name == "test-skill")
        all_skill = next(s for s in skills if s.name == "all-platform-skill")
        no_deps = next(s for s in skills if s.name == "no-deps-skill")
        
        assert test_skill.is_supported is False  # gemini 不在 supported_targets 中
        assert all_skill.is_supported is True  # "all" 支持所有平台
        assert no_deps.is_supported is False  # 只支持 claude

    def test_file_not_found(self, tmp_path):
        """测试配置文件不存在"""
        manager = ExternalSkillManager(
            platform="claude",
            registry_path=tmp_path / "nonexistent.toml"
        )
        with pytest.raises(FileNotFoundError):
            manager.get_skills()

    def test_invalid_toml(self, tmp_path):
        """测试无效的 TOML 格式"""
        invalid_file = tmp_path / "invalid.toml"
        invalid_file.write_text("this is not valid toml [[[")
        
        manager = ExternalSkillManager(
            platform="claude",
            registry_path=invalid_file
        )
        with pytest.raises(ValueError):
            manager.get_skills()

    def test_empty_registry(self, tmp_path):
        """测试空的 registry"""
        empty_file = tmp_path / "empty.toml"
        empty_file.write_text("[skills]")
        
        manager = ExternalSkillManager(
            platform="claude",
            registry_path=empty_file
        )
        skills = manager.get_skills()
        assert skills == []

    def test_cache_works(self, manager_claude):
        """测试缓存机制"""
        skills1 = manager_claude.get_skills()
        skills2 = manager_claude.get_skills()
        # 应该返回相同的缓存数据
        assert skills1 == skills2

    def test_clear_cache(self, manager_claude):
        """测试清除缓存"""
        manager_claude.get_skills()
        assert manager_claude._skills_cache is not None
        
        manager_claude.clear_cache()
        assert manager_claude._skills_cache is None


# --- get_skill_detail 测试 ---

class TestGetSkillDetail:
    """get_skill_detail 方法测试"""

    def test_get_existing_skill(self, manager_claude):
        """测试获取存在的技能"""
        skill = manager_claude.get_skill_detail("test-skill")
        assert skill is not None
        assert skill.name == "test-skill"
        assert skill.description == "A test skill"

    def test_get_nonexistent_skill(self, manager_claude):
        """测试获取不存在的技能"""
        skill = manager_claude.get_skill_detail("nonexistent-skill")
        assert skill is None

    def test_get_skill_with_empty_name(self, manager_claude):
        """测试空技能名称"""
        skill = manager_claude.get_skill_detail("")
        assert skill is None


# --- check_dependencies 测试 ---

class TestCheckDependencies:
    """check_dependencies 方法测试"""

    def test_nonexistent_skill(self, manager_claude):
        """测试检查不存在的技能"""
        with pytest.raises(ValueError, match="未知技能"):
            manager_claude.check_dependencies("nonexistent")

    def test_empty_dependencies(self, manager_claude):
        """测试空依赖列表"""
        result = manager_claude.check_dependencies("no-deps-skill")
        assert result.all_satisfied is True
        assert result.dependencies == []

    @patch.object(ExternalSkillManager, '_check_command_exists')
    def test_all_deps_satisfied(self, mock_check, manager_claude):
        """测试所有依赖都满足"""
        mock_check.return_value = True
        
        result = manager_claude.check_dependencies("test-skill")
        assert result.all_satisfied is True
        assert len(result.dependencies) == 2
        assert all(d.satisfied for d in result.dependencies)

    @patch.object(ExternalSkillManager, '_check_command_exists')
    def test_some_deps_missing(self, mock_check, manager_claude):
        """测试部分依赖缺失"""
        # node 存在，npm 不存在
        mock_check.side_effect = lambda cmd: cmd == "node"
        
        result = manager_claude.check_dependencies("test-skill")
        assert result.all_satisfied is False
        
        node_status = next(d for d in result.dependencies if d.name == "node")
        npm_status = next(d for d in result.dependencies if d.name == "npm")
        assert node_status.satisfied is True
        assert npm_status.satisfied is False


# --- install_skill 测试 ---

class TestInstallSkill:
    """install_skill 方法测试"""

    def test_install_nonexistent_skill(self, manager_claude):
        """测试安装不存在的技能"""
        result = manager_claude.install_skill("nonexistent")
        assert result.success is False
        assert "未知技能" in result.error

    def test_install_unsupported_platform(self, manager_gemini):
        """测试安装不支持当前平台的技能"""
        result = manager_gemini.install_skill("test-skill")
        assert result.success is False
        assert "不支持平台" in result.error

    @patch.object(ExternalSkillManager, '_check_command_exists')
    def test_install_missing_deps(self, mock_check, manager_claude):
        """测试安装时依赖缺失"""
        mock_check.return_value = False
        
        result = manager_claude.install_skill("test-skill")
        assert result.success is False
        assert "缺少依赖" in result.error

    @patch.object(ExternalSkillManager, '_check_command_exists')
    @patch.object(ExternalSkillManager, '_run_command')
    def test_install_success(self, mock_run, mock_check, manager_claude):
        """测试成功安装"""
        mock_check.return_value = True
        mock_run.return_value = True
        
        result = manager_claude.install_skill("test-skill")
        assert result.success is True
        assert result.skill_name == "test-skill"
        assert "安装完成" in result.message

    @patch.object(ExternalSkillManager, '_check_command_exists')
    @patch.object(ExternalSkillManager, '_run_command')
    def test_install_command_fails(self, mock_run, mock_check, manager_claude):
        """测试安装命令失败"""
        mock_check.return_value = True
        mock_run.return_value = False  # 命令执行失败
        
        result = manager_claude.install_skill("test-skill")
        assert result.success is False
        assert result.error is not None

    @patch.object(ExternalSkillManager, '_check_command_exists')
    @patch.object(ExternalSkillManager, '_run_command')
    def test_install_with_output_callback(self, mock_run, mock_check, manager_claude):
        """测试安装时的输出回调"""
        mock_check.return_value = True
        mock_run.return_value = True
        
        outputs = []
        def on_output(msg):
            outputs.append(msg)
        
        result = manager_claude.install_skill("test-skill", on_output=on_output)
        assert result.success is True
        assert len(outputs) > 0  # 应该有输出

    @patch.object(ExternalSkillManager, '_check_command_exists')
    @patch.object(ExternalSkillManager, '_run_command')
    def test_install_skip_install(self, mock_run, mock_check, manager_claude):
        """测试跳过全局安装"""
        mock_check.return_value = True
        mock_run.return_value = True
        
        result = manager_claude.install_skill("test-skill", skip_install=True)
        assert result.success is True
        # 应该只调用一次 (init 命令)，而不是两次 (install + init)
        # 因为 skip_install=True 跳过了 install_command


# --- _build_init_command 测试 ---

class TestBuildInitCommand:
    """_build_init_command 方法测试"""

    def test_build_with_target_map(self, manager_claude):
        """测试使用 target_map 构建命令"""
        cmd = manager_claude._build_init_command(
            init_command="test-cli init",
            init_args=["--ai", "{target}"],
            target_map={"claude": "claude-mapped"},
        )
        assert cmd == "test-cli init --ai claude-mapped"

    def test_build_without_target_map(self, manager_claude):
        """测试不使用 target_map 构建命令"""
        cmd = manager_claude._build_init_command(
            init_command="test-cli init",
            init_args=["--ai", "{target}"],
            target_map={},
        )
        assert cmd == "test-cli init --ai claude"

    def test_build_empty_args(self, manager_claude):
        """测试空参数"""
        cmd = manager_claude._build_init_command(
            init_command="test-cli init",
            init_args=[],
            target_map={},
        )
        assert cmd == "test-cli init"


# --- _is_platform_supported 测试 ---

class TestIsPlatformSupported:
    """_is_platform_supported 方法测试"""

    def test_platform_in_list(self, manager_claude):
        """测试平台在支持列表中"""
        assert manager_claude._is_platform_supported(["claude", "codex"]) is True

    def test_platform_not_in_list(self, manager_claude):
        """测试平台不在支持列表中"""
        assert manager_claude._is_platform_supported(["codex", "kiro"]) is False

    def test_all_platform(self, manager_claude):
        """测试 'all' 支持所有平台"""
        assert manager_claude._is_platform_supported(["all"]) is True

    def test_empty_list(self, manager_claude):
        """测试空列表"""
        assert manager_claude._is_platform_supported([]) is False
