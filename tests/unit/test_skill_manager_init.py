"""
单元测试：SkillManager.__init__() 方法
验证任务 2.1 的所有子任务要求
"""
import pytest
from pathlib import Path
import sys

# 添加父目录到 sys.path 以便导入 install 模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import SkillManager, HOME_DIR


class TestSkillManagerInit:
    """测试 SkillManager.__init__() 方法（任务 2.1）"""
    
    def test_init_with_default_parameters(self):
        """测试使用默认参数初始化（全局安装）"""
        mgr = SkillManager("claude")
        
        # 验证基本属性
        assert mgr.target == "claude"
        assert mgr.project_path is None
        assert mgr.use_kiro is False
        
        # 验证配置生成正确
        assert mgr.config["base"] == HOME_DIR / ".claude"
        assert mgr.target_skills_dir == HOME_DIR / ".claude" / "skills"
        assert mgr.target_commands_dir == HOME_DIR / ".claude" / "commands"
    
    def test_init_with_project_path(self, tmp_path):
        """测试 2.1.1: 添加 project_path 参数"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        
        # 验证 project_path 被保存
        assert mgr.project_path == str(tmp_path)
        
        # 验证配置使用项目路径
        assert ".claude" in str(mgr.config["base"])
        assert tmp_path in mgr.target_skills_dir.parents
    
    def test_init_with_use_kiro(self, tmp_path):
        """测试 2.1.2: 添加 use_kiro 参数"""
        mgr = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)
        
        # 验证 use_kiro 被保存
        assert mgr.use_kiro is True
        
        # 验证配置使用 Kiro 结构
        assert ".kiro" in str(mgr.config["base"])
        assert "steering" in str(mgr.target_commands_dir)
    
    def test_init_uses_get_target_config(self, tmp_path):
        """测试 2.1.3: 使用 get_target_config() 生成配置"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        
        # 验证配置字典包含所有必需的键
        required_keys = {"base", "skills", "commands", "prompt"}
        assert set(mgr.config.keys()) == required_keys
        
        # 验证配置路径正确
        assert mgr.target_skills_dir == mgr.config["skills"]
        assert mgr.target_commands_dir == mgr.config["commands"]
    
    def test_init_saves_project_path_and_kiro_flag(self, tmp_path):
        """测试 2.1.4: 保存项目路径和 Kiro 标志"""
        project_path = str(tmp_path)
        use_kiro = True
        
        mgr = SkillManager("claude", project_path=project_path, use_kiro=use_kiro)
        
        # 验证实例变量被正确保存
        assert mgr.project_path == project_path
        assert mgr.use_kiro == use_kiro
        assert mgr.target == "claude"
    
    def test_init_backward_compatibility(self):
        """测试向后兼容性：不提供新参数时行为不变"""
        # 旧代码调用方式：只传 target
        mgr = SkillManager("claude")
        
        # 应该使用全局配置
        assert mgr.config["base"] == HOME_DIR / ".claude"
        assert mgr.project_path is None
        assert mgr.use_kiro is False
    
    def test_init_with_different_platforms(self, tmp_path):
        """测试不同平台的初始化"""
        platforms = ["claude", "codex", "gemini", "qwen", "antigravity", "windsurf"]
        
        for platform in platforms:
            mgr = SkillManager(platform, project_path=str(tmp_path))
            
            # 验证基本属性
            assert mgr.target == platform
            assert mgr.project_path == str(tmp_path)
            
            # 验证配置生成
            assert mgr.config is not None
            assert mgr.target_skills_dir is not None
            assert mgr.target_commands_dir is not None
    
    def test_init_kiro_without_project_raises_error(self):
        """测试 use_kiro=True 但没有 project_path 时抛出异常"""
        with pytest.raises(ValueError) as exc_info:
            SkillManager("claude", use_kiro=True)
        
        assert "--kiro" in str(exc_info.value)
        assert "--project" in str(exc_info.value)
    
    def test_init_config_paths_are_path_objects(self, tmp_path):
        """测试配置中的路径都是 Path 对象"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        
        # 验证路径类型
        assert isinstance(mgr.config["base"], Path)
        assert isinstance(mgr.config["skills"], Path)
        assert isinstance(mgr.config["commands"], Path)
        assert isinstance(mgr.target_skills_dir, Path)
        assert isinstance(mgr.target_commands_dir, Path)
    
    def test_init_multiple_instances_independent(self, tmp_path):
        """测试多个实例之间相互独立"""
        project1 = tmp_path / "project1"
        project2 = tmp_path / "project2"
        project1.mkdir()
        project2.mkdir()
        
        mgr1 = SkillManager("claude", project_path=str(project1))
        mgr2 = SkillManager("codex", project_path=str(project2))
        
        # 验证实例独立
        assert mgr1.target != mgr2.target
        assert mgr1.project_path != mgr2.project_path
        assert mgr1.target_skills_dir != mgr2.target_skills_dir


class TestSkillManagerInitIntegration:
    """集成测试：验证 SkillManager 初始化后的完整功能"""
    
    def test_init_and_ensure_dirs_global(self):
        """测试全局模式下初始化和创建目录（使用真实 HOME）"""
        # 注意：这个测试使用真实的 HOME 目录
        # 只验证 ensure_dirs() 不会抛出异常
        mgr = SkillManager("claude")
        
        # 调用 ensure_dirs() 应该成功（即使目录已存在）
        try:
            mgr.ensure_dirs()
            success = True
        except Exception:
            success = False
        
        assert success is True
    
    def test_init_and_ensure_dirs_project(self, tmp_path):
        """测试项目模式下初始化和创建目录"""
        mgr = SkillManager("claude", project_path=str(tmp_path))
        mgr.ensure_dirs()
        
        # 验证项目目录被创建
        assert (tmp_path / ".claude").exists()
        assert (tmp_path / ".claude" / "skills").exists()
        assert (tmp_path / ".claude" / "commands").exists()
    
    def test_init_and_ensure_dirs_kiro(self, tmp_path):
        """测试 Kiro 模式下初始化和创建目录"""
        mgr = SkillManager("claude", project_path=str(tmp_path), use_kiro=True)
        mgr.ensure_dirs()
        
        # 验证 Kiro 目录被创建
        assert (tmp_path / ".kiro").exists()
        assert (tmp_path / ".kiro" / "skills").exists()
        assert (tmp_path / ".kiro" / "steering").exists()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
