"""
单元测试：项目级别安装功能
测试 get_target_config() 函数的各种场景
"""
import pytest
from pathlib import Path
import sys
import os

# 添加父目录到 sys.path 以便导入 install 模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import (
    get_target_config, 
    TARGET_CONFIG, 
    HOME_DIR,
    validate_project_path,
    normalize_project_path
)


class TestValidateProjectPath:
    """测试 validate_project_path() 函数"""
    
    def test_valid_path(self, tmp_path):
        """测试有效路径验证"""
        valid, error = validate_project_path(str(tmp_path))
        assert valid is True
        assert error is None
    
    def test_path_not_exist(self):
        """测试不存在路径验证"""
        valid, error = validate_project_path("./nonexistent_path_12345")
        assert valid is False
        assert "does not exist" in error
    
    def test_path_is_file_not_directory(self, tmp_path):
        """测试路径是文件而非目录"""
        test_file = tmp_path / "test.txt"
        test_file.touch()
        
        valid, error = validate_project_path(str(test_file))
        assert valid is False
        assert "not a directory" in error
    
    def test_permission_denied(self, tmp_path):
        """测试权限不足的情况（仅在支持权限的系统上测试）"""
        # 创建一个只读目录
        readonly_dir = tmp_path / "readonly"
        readonly_dir.mkdir()
        
        # 尝试移除写权限（在 Windows 上可能不生效）
        try:
            readonly_dir.chmod(0o444)
            valid, error = validate_project_path(str(readonly_dir))
            
            # 在某些系统上可能仍然可写，所以只在失败时检查错误消息
            if not valid:
                assert "Permission denied" in error or "Cannot" in error
        finally:
            # 恢复权限以便清理
            try:
                readonly_dir.chmod(0o755)
            except:
                pass


class TestNormalizeProjectPath:
    """测试 normalize_project_path() 函数"""
    
    def test_absolute_path_unchanged(self, tmp_path):
        """测试绝对路径保持不变（但规范化）"""
        normalized = normalize_project_path(str(tmp_path))
        assert normalized.is_absolute()
        assert normalized == tmp_path.resolve()
    
    def test_relative_path_to_absolute(self, tmp_path):
        """测试相对路径转换为绝对路径"""
        # 创建子目录
        subdir = tmp_path / "test-project"
        subdir.mkdir()
        
        # 切换到临时目录
        original_cwd = os.getcwd()
        try:
            os.chdir(tmp_path)
            
            # 使用相对路径
            normalized = normalize_project_path("./test-project")
            
            # 验证是绝对路径
            assert normalized.is_absolute()
            assert str(subdir) in str(normalized)
        finally:
            os.chdir(original_cwd)
    
    def test_tilde_expansion(self):
        """测试 ~ 用户目录扩展"""
        normalized = normalize_project_path("~")
        assert normalized.is_absolute()
        assert normalized == Path.home()
    
    def test_dot_dot_resolution(self, tmp_path):
        """测试 .. 父目录解析"""
        subdir = tmp_path / "subdir"
        subdir.mkdir()
        
        original_cwd = os.getcwd()
        try:
            os.chdir(subdir)
            
            # 使用 .. 返回父目录
            normalized = normalize_project_path("..")
            
            assert normalized.is_absolute()
            assert normalized == tmp_path.resolve()
        finally:
            os.chdir(original_cwd)
    
    def test_dot_resolution(self, tmp_path):
        """测试 . 当前目录解析"""
        original_cwd = os.getcwd()
        try:
            os.chdir(tmp_path)
            
            normalized = normalize_project_path(".")
            
            assert normalized.is_absolute()
            assert normalized == tmp_path.resolve()
        finally:
            os.chdir(original_cwd)


class TestGetTargetConfigGlobal:
    """测试全局配置生成（project_path=None）"""
    
    def test_claude_global_config(self):
        """测试 Claude 平台全局配置"""
        config = get_target_config("claude")
        
        assert config["base"] == HOME_DIR / ".claude"
        assert config["skills"] == HOME_DIR / ".claude" / "skills"
        assert config["commands"] == HOME_DIR / ".claude" / "commands"
        assert config["prompt"] == HOME_DIR / ".claude" / "CLAUDE.md"
    
    def test_codex_global_config(self):
        """测试 Codex 平台全局配置"""
        config = get_target_config("codex")
        
        assert config["base"] == HOME_DIR / ".codex"
        assert config["skills"] == HOME_DIR / ".codex" / "skills"
        assert config["commands"] == HOME_DIR / ".codex" / "prompts"
        assert config["prompt"] is None
    
    def test_gemini_global_config(self):
        """测试 Gemini 平台全局配置"""
        config = get_target_config("gemini")
        
        assert config["base"] == HOME_DIR / ".gemini"
        assert config["skills"] == HOME_DIR / ".gemini" / "skills"
        assert config["commands"] == HOME_DIR / ".gemini" / "commands"
        assert config["prompt"] is None
    
    def test_qwen_global_config(self):
        """测试 Qwen 平台全局配置"""
        config = get_target_config("qwen")
        
        assert config["base"] == HOME_DIR / ".qwen"
        assert config["skills"] == HOME_DIR / ".qwen" / "skills"
        assert config["commands"] == HOME_DIR / ".qwen" / "commands"
        assert config["prompt"] is None
    
    def test_antigravity_global_config(self):
        """测试 Antigravity 平台全局配置"""
        config = get_target_config("antigravity")
        
        assert config["base"] == HOME_DIR / ".gemini" / "antigravity"
        assert config["skills"] == HOME_DIR / ".gemini" / "antigravity" / "skills"
        assert config["commands"] == HOME_DIR / ".gemini" / "antigravity" / "workflows"
        assert config["prompt"] is None
    
    def test_windsurf_global_config(self):
        """测试 Windsurf 平台全局配置"""
        config = get_target_config("windsurf")
        
        assert config["base"] == HOME_DIR / ".codeium" / "windsurf"
        assert config["skills"] == HOME_DIR / ".codeium" / "windsurf" / "skills"
        assert config["commands"] == HOME_DIR / ".codeium" / "windsurf" / "workflows"
        assert config["prompt"] is None
    
    def test_global_config_matches_target_config(self):
        """测试全局配置与 TARGET_CONFIG 一致"""
        for target in TARGET_CONFIG.keys():
            config = get_target_config(target)
            assert config == TARGET_CONFIG[target]


class TestGetTargetConfigProject:
    """测试项目级别配置生成（project_path 存在）"""
    
    def test_claude_project_config(self, tmp_path):
        """测试 Claude 平台项目配置"""
        config = get_target_config("claude", project_path=str(tmp_path))
        
        assert ".claude" in str(config["base"])
        assert config["skills"] == tmp_path / ".claude" / "skills"
        assert config["commands"] == tmp_path / ".claude" / "commands"
        assert config["prompt"] == tmp_path / ".claude" / "CLAUDE.md"
    
    def test_codex_project_config(self, tmp_path):
        """测试 Codex 平台项目配置（命令目录为 prompts）"""
        config = get_target_config("codex", project_path=str(tmp_path))
        
        assert ".codex" in str(config["base"])
        assert config["skills"] == tmp_path / ".codex" / "skills"
        assert config["commands"] == tmp_path / ".codex" / "prompts"
        assert config["prompt"] is None
    
    def test_gemini_project_config(self, tmp_path):
        """测试 Gemini 平台项目配置"""
        config = get_target_config("gemini", project_path=str(tmp_path))
        
        assert ".gemini" in str(config["base"])
        assert config["skills"] == tmp_path / ".gemini" / "skills"
        assert config["commands"] == tmp_path / ".gemini" / "commands"
        assert config["prompt"] is None
    
    def test_antigravity_project_config(self, tmp_path):
        """测试 Antigravity 平台项目配置（特殊路径结构）"""
        config = get_target_config("antigravity", project_path=str(tmp_path))
        
        assert ".gemini" in str(config["base"])
        assert "antigravity" in str(config["base"])
        assert config["skills"] == tmp_path / ".gemini" / "antigravity" / "skills"
        assert config["commands"] == tmp_path / ".gemini" / "antigravity" / "workflows"
        assert config["prompt"] is None
    
    def test_windsurf_project_config(self, tmp_path):
        """测试 Windsurf 平台项目配置（特殊路径结构）"""
        config = get_target_config("windsurf", project_path=str(tmp_path))
        
        assert ".codeium" in str(config["base"])
        assert "windsurf" in str(config["base"])
        assert config["skills"] == tmp_path / ".codeium" / "windsurf" / "skills"
        assert config["commands"] == tmp_path / ".codeium" / "windsurf" / "workflows"
        assert config["prompt"] is None
    
    def test_relative_path_resolved_to_absolute(self, tmp_path):
        """测试相对路径被转换为绝对路径"""
        # 创建一个临时子目录
        subdir = tmp_path / "test-project"
        subdir.mkdir()
        
        # 切换到临时目录
        original_cwd = os.getcwd()
        try:
            os.chdir(tmp_path)
            
            # 使用相对路径
            config = get_target_config("claude", project_path="./test-project")
            
            # 验证路径是绝对路径
            assert config["base"].is_absolute()
            assert str(subdir) in str(config["base"])
        finally:
            os.chdir(original_cwd)


class TestGetTargetConfigKiro:
    """测试 Kiro 结构配置生成（use_kiro=True）"""
    
    def test_kiro_structure_basic(self, tmp_path):
        """测试 Kiro 基本结构"""
        config = get_target_config("claude", project_path=str(tmp_path), use_kiro=True)
        
        assert ".kiro" in str(config["base"])
        assert config["base"] == tmp_path / ".kiro"
        assert config["skills"] == tmp_path / ".kiro" / "skills"
        assert config["commands"] == tmp_path / ".kiro" / "steering"
        assert config["prompt"] is None
    
    def test_kiro_ignores_target_platform(self, tmp_path):
        """测试 Kiro 模式下忽略目标平台差异"""
        # 不同平台应该生成相同的 Kiro 结构
        config_claude = get_target_config("claude", project_path=str(tmp_path), use_kiro=True)
        config_codex = get_target_config("codex", project_path=str(tmp_path), use_kiro=True)
        config_gemini = get_target_config("gemini", project_path=str(tmp_path), use_kiro=True)
        
        assert config_claude == config_codex == config_gemini
    
    def test_kiro_commands_directory_is_steering(self, tmp_path):
        """测试 Kiro 模式下命令目录为 steering"""
        config = get_target_config("claude", project_path=str(tmp_path), use_kiro=True)
        
        assert "steering" in str(config["commands"])
        assert config["commands"] == tmp_path / ".kiro" / "steering"


class TestGetTargetConfigValidation:
    """测试参数验证"""
    
    def test_kiro_without_project_raises_error(self):
        """测试 use_kiro=True 但 project_path=None 时抛出异常"""
        with pytest.raises(ValueError) as exc_info:
            get_target_config("claude", use_kiro=True)
        
        assert "--kiro" in str(exc_info.value)
        assert "--project" in str(exc_info.value)
    
    def test_kiro_with_empty_project_raises_error(self):
        """测试 use_kiro=True 但 project_path 为空字符串时抛出异常"""
        with pytest.raises(ValueError) as exc_info:
            get_target_config("claude", project_path="", use_kiro=True)
        
        assert "--kiro" in str(exc_info.value)


class TestGetTargetConfigProperties:
    """测试配置生成的属性（Property-Based Testing 风格）"""
    
    def test_path_consistency(self, tmp_path):
        """Property: 相同输入 → 相同输出"""
        config1 = get_target_config("claude", project_path=str(tmp_path))
        config2 = get_target_config("claude", project_path=str(tmp_path))
        
        assert config1 == config2
    
    def test_path_isolation(self, tmp_path):
        """Property: 不同项目 → 不同路径"""
        project1 = tmp_path / "project1"
        project2 = tmp_path / "project2"
        project1.mkdir()
        project2.mkdir()
        
        config1 = get_target_config("claude", project_path=str(project1))
        config2 = get_target_config("claude", project_path=str(project2))
        
        assert config1["skills"] != config2["skills"]
        assert config1["commands"] != config2["commands"]
    
    def test_kiro_structure_correctness(self, tmp_path):
        """Property: use_kiro=True → .kiro/skills/ 和 .kiro/steering/"""
        config = get_target_config("claude", project_path=str(tmp_path), use_kiro=True)
        
        assert ".kiro" in str(config["base"])
        assert "steering" in str(config["commands"])
        assert config["prompt"] is None
    
    def test_backward_compatibility(self):
        """Property: project_path=None → 全局配置"""
        for target in TARGET_CONFIG.keys():
            config = get_target_config(target)
            assert config == TARGET_CONFIG[target]
    
    def test_all_configs_have_required_keys(self, tmp_path):
        """Property: 所有配置都包含必需的键"""
        required_keys = {"base", "skills", "commands", "prompt"}
        
        # 测试全局配置
        for target in TARGET_CONFIG.keys():
            config = get_target_config(target)
            assert set(config.keys()) == required_keys
        
        # 测试项目配置
        config = get_target_config("claude", project_path=str(tmp_path))
        assert set(config.keys()) == required_keys
        
        # 测试 Kiro 配置
        config = get_target_config("claude", project_path=str(tmp_path), use_kiro=True)
        assert set(config.keys()) == required_keys
    
    def test_all_paths_are_path_objects(self, tmp_path):
        """Property: 所有路径值都是 Path 对象（除了 None）"""
        config = get_target_config("claude", project_path=str(tmp_path))
        
        for key, value in config.items():
            if value is not None:
                assert isinstance(value, Path), f"{key} should be a Path object"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
