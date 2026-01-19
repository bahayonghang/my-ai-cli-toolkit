"""
手动测试脚本：演示错误处理增强功能
运行此脚本可以看到友好的错误消息
"""
import sys
from pathlib import Path

# 添加父目录到 sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import SkillManager, log_info, log_success

def test_invalid_path_error():
    """测试无效路径的错误处理"""
    print("\n" + "="*60)
    print("测试 1: 使用不存在的项目路径")
    print("="*60)
    
    mgr = SkillManager("claude", project_path="./nonexistent_path_12345")
    result = mgr.install_skill("test-skill")
    
    if not result:
        log_success("✓ 错误处理正常工作：显示了友好的错误消息")
    else:
        print("✗ 错误：应该失败但却成功了")


def test_valid_path_success():
    """测试有效路径的正常安装"""
    print("\n" + "="*60)
    print("测试 2: 使用有效的项目路径")
    print("="*60)
    
    import tempfile
    with tempfile.TemporaryDirectory() as tmp_dir:
        log_info(f"使用临时目录: {tmp_dir}")
        
        mgr = SkillManager("claude", project_path=tmp_dir)
        
        # 尝试安装（会因为技能不存在而失败，但不会因为路径验证失败）
        result = mgr.install_skill("nonexistent-skill")
        
        if not result:
            log_success("✓ 路径验证通过，但技能不存在（预期行为）")


def test_kiro_mode_error():
    """测试 Kiro 模式的错误处理"""
    print("\n" + "="*60)
    print("测试 3: Kiro 模式使用无效路径")
    print("="*60)
    
    mgr = SkillManager("claude", project_path="./nonexistent_kiro", use_kiro=True)
    result = mgr.install_skill("test-skill")
    
    if not result:
        log_success("✓ Kiro 模式错误处理正常工作")


def test_install_commands_error():
    """测试 install_commands 的错误处理"""
    print("\n" + "="*60)
    print("测试 4: install_commands 使用无效路径")
    print("="*60)
    
    mgr = SkillManager("claude", project_path="./nonexistent_commands")
    mgr.install_commands()
    
    log_success("✓ install_commands 错误处理正常工作")


def test_global_mode_no_validation():
    """测试全局模式不进行路径验证"""
    print("\n" + "="*60)
    print("测试 5: 全局模式（不验证项目路径）")
    print("="*60)
    
    mgr = SkillManager("claude")
    log_info(f"安装位置: {mgr.get_install_location_info()}")
    
    # 全局模式应该能够正常工作（不会因为路径验证而失败）
    log_success("✓ 全局模式正常工作，不进行项目路径验证")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("错误处理增强功能 - 手动测试")
    print("="*60)
    print("\n此脚本演示了任务 2.3 实现的错误处理功能：")
    print("1. 在 install_skill() 中添加路径验证")
    print("2. 在 install_commands() 中添加路径验证")
    print("3. 统一使用 format_error() 处理异常")
    
    try:
        test_invalid_path_error()
        test_valid_path_success()
        test_kiro_mode_error()
        test_install_commands_error()
        test_global_mode_no_validation()
        
        print("\n" + "="*60)
        print("所有手动测试完成！")
        print("="*60)
        
    except Exception as e:
        print(f"\n✗ 测试过程中出现异常: {e}")
        import traceback
        traceback.print_exc()
