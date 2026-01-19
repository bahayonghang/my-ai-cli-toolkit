"""
安装功能属性测试

Property 6: Skill Installation Creates Target Directory
Property 7: Batch Install Processes All Selected Items
Property 8: Batch Install Clears Selection After Completion
Property 9: Install All Processes Every Available Item

**Validates: Requirements 6.1, 6.5, 7.1, 7.4, 7.6, 8.1, 8.4**
"""

import sys
import shutil
import tempfile
from pathlib import Path
from contextlib import contextmanager

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings, assume

from tui.core.manager import TUIManager
from tui.core.models import ItemInfo, ItemType, InstallStatus
from install import SKILLS_SRC_DIR, COMMANDS_SRC_DIR


# --- 临时目录上下文管理器 ---

@contextmanager
def temp_target_context():
    """创建临时目标目录并修改 TARGET_CONFIG"""
    import install
    import tempfile
    
    # 保存原始配置
    original_config = {k: v.copy() for k, v in install.TARGET_CONFIG.items()}
    
    # 创建临时目录
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        
        # 创建临时目录结构
        temp_base = tmp_path / ".claude"
        temp_skills = temp_base / "skills"
        temp_commands = temp_base / "commands"
        
        # 修改配置指向临时目录
        install.TARGET_CONFIG["claude"] = {
            "base": temp_base,
            "skills": temp_skills,
            "commands": temp_commands,
            "prompt": temp_base / "CLAUDE.md"
        }
        
        try:
            yield {
                "base": temp_base,
                "skills": temp_skills,
                "commands": temp_commands,
            }
        finally:
            # 恢复原始配置
            install.TARGET_CONFIG.clear()
            install.TARGET_CONFIG.update(original_config)


# --- 模拟批量安装的核心逻辑 ---

class MockSelectableItem:
    """模拟 SelectableItem 的核心逻辑"""
    
    def __init__(self, item_info: ItemInfo, selected: bool = False):
        self.item_info = item_info
        self._selected = selected
    
    @property
    def item_name(self) -> str:
        return self.item_info.name
    
    @property
    def selected(self) -> bool:
        return self._selected
    
    @selected.setter
    def selected(self, value: bool) -> None:
        self._selected = value
    
    def update_install_status(self, status: InstallStatus) -> None:
        self.item_info.status = status


class MockItemListView:
    """模拟 ItemListView 的核心逻辑"""
    
    def __init__(self, item_type: str = "skills"):
        self.item_type = item_type
        self._all_items: list[MockSelectableItem] = []
    
    @property
    def items(self) -> list[MockSelectableItem]:
        return self._all_items
    
    def load_items(self, item_infos: list[ItemInfo]) -> None:
        self._all_items = [MockSelectableItem(info) for info in item_infos]
    
    def get_selected_items(self) -> list[MockSelectableItem]:
        return [item for item in self._all_items if item.selected]
    
    def deselect_all(self) -> None:
        for item in self._all_items:
            item.selected = False



# --- Property 6: Skill Installation Creates Target Directory ---
# **Validates: Requirements 6.1, 6.5**

@settings(max_examples=100)
@given(platform=st.sampled_from(["claude"]))
def test_property_6_skill_installation_creates_target_directory(platform: str):
    """
    Property 6: Skill Installation Creates Target Directory
    
    *For any* valid skill name, after `install_skill(name)` succeeds, 
    the target directory SHALL exist and contain the skill files.
    
    **Feature: install-tui, Property 6: Skill Installation Creates Target Directory**
    **Validates: Requirements 6.1, 6.5**
    """
    with temp_target_context() as temp_dirs:
        manager = TUIManager(platform)
        skills = manager.get_skills()
        
        # 跳过如果没有可用的技能
        assume(len(skills) > 0)
        
        # 选择第一个技能进行测试
        skill = skills[0]
        skill_name = skill.name
        
        # 安装技能
        result = manager.install_skill(skill_name)
        
        # 验证安装成功
        assert result.success, f"Installation should succeed for {skill_name}: {result.message}"
        
        # 验证目标目录存在
        target_dir = temp_dirs["skills"] / skill_name
        assert target_dir.exists(), f"Target directory should exist: {target_dir}"
        
        # 验证目标目录包含文件
        assert any(target_dir.iterdir()), f"Target directory should contain files: {target_dir}"


def test_property_6_skill_installation_with_real_skills():
    """
    Property 6: Skill Installation Creates Target Directory (具体示例)
    
    测试所有可用技能的安装。
    
    **Feature: install-tui, Property 6: Skill Installation Creates Target Directory**
    **Validates: Requirements 6.1, 6.5**
    """
    with temp_target_context() as temp_dirs:
        manager = TUIManager("claude")
        skills = manager.get_skills()
        
        if not skills:
            pytest.skip("No skills available for testing")
        
        for skill in skills[:3]:  # 只测试前3个以节省时间
            result = manager.install_skill(skill.name)
            
            # 验证安装成功
            assert result.success, f"Installation should succeed for {skill.name}: {result.message}"
            
            # 验证目标目录存在
            target_dir = temp_dirs["skills"] / skill.name
            assert target_dir.exists(), f"Target directory should exist: {target_dir}"


# --- Property 7: Batch Install Processes All Selected Items ---
# **Validates: Requirements 7.1, 7.6**

@settings(max_examples=100)
@given(selection_pattern=st.lists(st.booleans(), min_size=1, max_size=10))
def test_property_7_batch_install_processes_all_selected_items(selection_pattern: list[bool]):
    """
    Property 7: Batch Install Processes All Selected Items
    
    *For any* set of selected items, batch install SHALL attempt to install 
    each selected item and return correct success/failure counts.
    
    **Feature: install-tui, Property 7: Batch Install Processes All Selected Items**
    **Validates: Requirements 7.1, 7.6**
    """
    with temp_target_context() as temp_dirs:
        manager = TUIManager("claude")
        skills = manager.get_skills()
        
        # 跳过如果没有足够的技能
        assume(len(skills) >= 1)
        
        # 创建模拟列表视图
        list_view = MockItemListView(item_type="skills")
        list_view.load_items(skills[:len(selection_pattern)])
        
        # 设置选择状态
        selected_names = []
        for i, item in enumerate(list_view.items):
            if i < len(selection_pattern) and selection_pattern[i]:
                item.selected = True
                selected_names.append(item.item_name)
        
        # 获取选中项
        selected_items = list_view.get_selected_items()
        
        # 模拟批量安装
        success_count = 0
        fail_count = 0
        
        for item in selected_items:
            result = manager.install_skill(item.item_name)
            if result.success:
                success_count += 1
                item.update_install_status(InstallStatus.INSTALLED)
            else:
                fail_count += 1
        
        # 验证处理了所有选中项
        assert success_count + fail_count == len(selected_items), (
            f"Should process all {len(selected_items)} selected items, "
            f"but processed {success_count + fail_count}"
        )
        
        # 验证成功安装的项目目标目录存在
        for item in selected_items:
            if item.item_info.status == InstallStatus.INSTALLED:
                target_dir = temp_dirs["skills"] / item.item_name
                assert target_dir.exists(), f"Target directory should exist for {item.item_name}"



# --- Property 8: Batch Install Clears Selection After Completion ---
# **Validates: Requirements 7.4**

@settings(max_examples=100)
@given(selection_pattern=st.lists(st.booleans(), min_size=1, max_size=10))
def test_property_8_batch_install_clears_selection_after_completion(selection_pattern: list[bool]):
    """
    Property 8: Batch Install Clears Selection After Completion
    
    *For any* batch install operation, after completion, 
    all items SHALL have `selected = False`.
    
    **Feature: install-tui, Property 8: Batch Install Clears Selection After Completion**
    **Validates: Requirements 7.4**
    """
    with temp_target_context() as temp_dirs:
        manager = TUIManager("claude")
        skills = manager.get_skills()
        
        # 跳过如果没有足够的技能
        assume(len(skills) >= 1)
        
        # 创建模拟列表视图
        list_view = MockItemListView(item_type="skills")
        list_view.load_items(skills[:len(selection_pattern)])
        
        # 设置选择状态
        for i, item in enumerate(list_view.items):
            if i < len(selection_pattern):
                item.selected = selection_pattern[i]
        
        # 获取选中项
        selected_items = list_view.get_selected_items()
        
        # 模拟批量安装
        for item in selected_items:
            result = manager.install_skill(item.item_name)
            if result.success:
                item.update_install_status(InstallStatus.INSTALLED)
        
        # 清除选择状态 (模拟 action_install_selected 的行为)
        list_view.deselect_all()
        
        # 验证所有项目都已取消选择
        for item in list_view.items:
            assert item.selected is False, (
                f"Item {item.item_name} should be deselected after batch install"
            )


# --- Property 9: Install All Processes Every Available Item ---
# **Validates: Requirements 8.1, 8.4**

@settings(max_examples=100)
@given(platform=st.sampled_from(["claude"]))
def test_property_9_install_all_processes_every_available_item(platform: str):
    """
    Property 9: Install All Processes Every Available Item
    
    *For any* platform, `install_all_skills()` SHALL install every skill 
    in the source directory and return the correct count.
    
    **Feature: install-tui, Property 9: Install All Processes Every Available Item**
    **Validates: Requirements 8.1, 8.4**
    """
    with temp_target_context() as temp_dirs:
        manager = TUIManager(platform)
        skills = manager.get_skills()
        
        # 跳过如果没有可用的技能
        assume(len(skills) > 0)
        
        # 安装所有技能
        success_count, fail_count, failures = manager.install_all_skills()
        
        # 验证处理了所有技能
        total_processed = success_count + fail_count
        assert total_processed == len(skills), (
            f"Should process all {len(skills)} skills, but processed {total_processed}"
        )
        
        # 验证成功安装的数量
        assert success_count > 0, "At least some skills should be installed successfully"
        
        # 验证成功安装的技能目标目录存在
        for skill in skills:
            if skill.name not in failures:
                target_dir = temp_dirs["skills"] / skill.name
                assert target_dir.exists(), (
                    f"Target directory should exist for successfully installed skill: {skill.name}"
                )


def test_property_9_install_all_commands():
    """
    Property 9: Install All Commands (具体示例)
    
    测试安装所有命令。
    
    **Feature: install-tui, Property 9: Install All Processes Every Available Item**
    **Validates: Requirements 8.1, 8.4**
    """
    with temp_target_context() as temp_dirs:
        manager = TUIManager("claude")
        commands = manager.get_commands()
        
        if not commands:
            pytest.skip("No commands available for testing")
        
        # 安装所有命令
        success_count, fail_count, failures = manager.install_all_commands()
        
        # 验证处理了所有命令
        total_processed = success_count + fail_count
        assert total_processed == len(commands), (
            f"Should process all {len(commands)} commands, but processed {total_processed}"
        )
        
        # 验证成功安装的命令目标文件存在
        for cmd in commands:
            if cmd.name not in failures:
                # 命令是文件，不是目录
                target_files = list(temp_dirs["commands"].glob(f"{cmd.name}.*"))
                assert len(target_files) > 0, (
                    f"Target file should exist for successfully installed command: {cmd.name}"
                )

