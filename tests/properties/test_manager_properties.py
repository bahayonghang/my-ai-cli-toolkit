"""
TUIManager 属性测试

Property 10: Get Skills Returns All Available Skills
Property 11: Get Commands Returns Platform-Specific Commands

**Validates: Requirements 3.1, 4.1**
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings

from tui.core.manager import TUIManager
from tui.core.models import ItemType, InstallStatus
from install import SKILLS_SRC_DIR, COMMANDS_SRC_DIR


# --- Property 10: Get Skills Returns All Available Skills ---
# **Validates: Requirements 3.1**

@settings(max_examples=100)
@given(platform=st.sampled_from(["claude", "codex", "gemini"]))
def test_property_10_get_skills_returns_all_available_skills(platform: str):
    """
    Property 10: Get Skills Returns All Available Skills
    
    *For any* platform, `get_skills()` SHALL return an ItemInfo for every 
    directory in the skills source directory.
    
    **Feature: install-tui, Property 10: Get Skills Returns All Available Skills**
    **Validates: Requirements 3.1**
    """
    manager = TUIManager(platform)
    skills = manager.get_skills()
    
    # 获取源目录中的所有技能目录
    if SKILLS_SRC_DIR.exists():
        expected_skill_names = sorted([
            d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir()
        ])
    else:
        expected_skill_names = []
    
    # 验证返回的技能数量与源目录中的目录数量一致
    actual_skill_names = sorted([s.name for s in skills])
    assert actual_skill_names == expected_skill_names, (
        f"Expected skills {expected_skill_names}, got {actual_skill_names}"
    )
    
    # 验证每个返回的技能都有正确的 item_type
    for skill in skills:
        assert skill.item_type == ItemType.SKILL, (
            f"Skill {skill.name} has wrong item_type: {skill.item_type}"
        )
        
        # 验证 source_path 存在
        assert skill.source_path is not None, (
            f"Skill {skill.name} has no source_path"
        )
        assert skill.source_path.exists(), (
            f"Skill {skill.name} source_path does not exist: {skill.source_path}"
        )


# --- Property 11: Get Commands Returns Platform-Specific Commands ---
# **Validates: Requirements 4.1**

@settings(max_examples=100)
@given(platform=st.sampled_from(["claude", "codex", "gemini"]))
def test_property_11_get_commands_returns_platform_specific_commands(platform: str):
    """
    Property 11: Get Commands Returns Platform-Specific Commands
    
    *For any* platform, `get_commands()` SHALL return commands from the correct 
    source directory (gemini/ for gemini, claude/ for others).
    
    **Feature: install-tui, Property 11: Get Commands Returns Platform-Specific Commands**
    **Validates: Requirements 4.1**
    """
    manager = TUIManager(platform)
    commands = manager.get_commands()
    
    # 根据平台确定预期的命令源目录
    if platform == "gemini":
        expected_src_dir = COMMANDS_SRC_DIR / "gemini"
    else:
        expected_src_dir = COMMANDS_SRC_DIR / "claude"
    
    # 获取源目录中的所有命令文件
    if expected_src_dir.exists():
        expected_command_names = sorted([
            f.stem for f in expected_src_dir.iterdir() if f.is_file()
        ])
    else:
        expected_command_names = []
    
    # 验证返回的命令数量与源目录中的文件数量一致
    actual_command_names = sorted([c.name for c in commands])
    assert actual_command_names == expected_command_names, (
        f"Platform {platform}: Expected commands {expected_command_names}, "
        f"got {actual_command_names}"
    )
    
    # 验证每个返回的命令都有正确的 item_type
    for cmd in commands:
        assert cmd.item_type == ItemType.COMMAND, (
            f"Command {cmd.name} has wrong item_type: {cmd.item_type}"
        )
        
        # 验证 source_path 存在且来自正确的目录
        assert cmd.source_path is not None, (
            f"Command {cmd.name} has no source_path"
        )
        assert cmd.source_path.exists(), (
            f"Command {cmd.name} source_path does not exist: {cmd.source_path}"
        )
        assert cmd.source_path.parent == expected_src_dir, (
            f"Command {cmd.name} source_path {cmd.source_path} is not from "
            f"expected directory {expected_src_dir}"
        )
