"""
列表项格式化属性测试

Property 3: Checkbox Symbol Consistency
Property 4: Status Icon Consistency

**Validates: Requirements 4.1, 4.2**
"""

import sys
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings

from tui.core.formatters import (
    format_checkbox,
    format_status_icon,
    CHECKBOX_CHECKED,
    CHECKBOX_UNCHECKED,
    STATUS_INSTALLED,
    STATUS_NOT_INSTALLED,
)


# --- Property 3: Checkbox Symbol Consistency ---
# **Validates: Requirements 4.1**

@settings(max_examples=100)
@given(selected=st.booleans())
def test_property_3_checkbox_symbol_consistency(selected: bool):
    """
    Property 3: Checkbox Symbol Consistency
    
    *For any* boolean selection state, the checkbox formatting function 
    SHALL return "☑" for True and "☐" for False, with no other possible outputs.
    
    **Feature: tui-beautify, Property 3: Checkbox Symbol Consistency**
    **Validates: Requirements 4.1**
    """
    result = format_checkbox(selected)
    
    if selected:
        assert result == CHECKBOX_CHECKED, (
            f"format_checkbox(True) should return '{CHECKBOX_CHECKED}', "
            f"got '{result}'"
        )
    else:
        assert result == CHECKBOX_UNCHECKED, (
            f"format_checkbox(False) should return '{CHECKBOX_UNCHECKED}', "
            f"got '{result}'"
        )


def test_property_3_checkbox_only_two_outputs():
    """
    Property 3: Checkbox Symbol Consistency (Output Set)
    
    验证 format_checkbox 只有两种可能的输出。
    
    **Feature: tui-beautify, Property 3: Checkbox Symbol Consistency**
    **Validates: Requirements 4.1**
    """
    # 测试所有可能的输入
    outputs = {format_checkbox(True), format_checkbox(False)}
    
    # 应该只有两种输出
    assert len(outputs) == 2, (
        f"format_checkbox should have exactly 2 possible outputs, "
        f"got {len(outputs)}: {outputs}"
    )
    
    # 输出应该是预定义的 Unicode 符号
    assert outputs == {CHECKBOX_CHECKED, CHECKBOX_UNCHECKED}, (
        f"format_checkbox outputs should be {{{CHECKBOX_CHECKED}, {CHECKBOX_UNCHECKED}}}, "
        f"got {outputs}"
    )


def test_property_3_checkbox_symbols_are_unicode():
    """
    Property 3: Checkbox Symbol Consistency (Unicode Verification)
    
    验证复选框符号是正确的 Unicode 字符。
    
    **Feature: tui-beautify, Property 3: Checkbox Symbol Consistency**
    **Validates: Requirements 4.1**
    """
    # 验证常量值
    assert CHECKBOX_CHECKED == "☑", (
        f"CHECKBOX_CHECKED should be '☑', got '{CHECKBOX_CHECKED}'"
    )
    assert CHECKBOX_UNCHECKED == "☐", (
        f"CHECKBOX_UNCHECKED should be '☐', got '{CHECKBOX_UNCHECKED}'"
    )
    
    # 验证函数输出
    assert format_checkbox(True) == "☑", (
        f"format_checkbox(True) should return '☑'"
    )
    assert format_checkbox(False) == "☐", (
        f"format_checkbox(False) should return '☐'"
    )


# --- Property 4: Status Icon Consistency ---
# **Validates: Requirements 4.2**

@settings(max_examples=100)
@given(installed=st.booleans())
def test_property_4_status_icon_consistency(installed: bool):
    """
    Property 4: Status Icon Consistency
    
    *For any* installation status (installed/not_installed), the status icon 
    formatting function SHALL return "✓" for installed and "○" for not installed.
    
    **Feature: tui-beautify, Property 4: Status Icon Consistency**
    **Validates: Requirements 4.2**
    """
    result = format_status_icon(installed)
    
    if installed:
        assert result == STATUS_INSTALLED, (
            f"format_status_icon(True) should return '{STATUS_INSTALLED}', "
            f"got '{result}'"
        )
    else:
        assert result == STATUS_NOT_INSTALLED, (
            f"format_status_icon(False) should return '{STATUS_NOT_INSTALLED}', "
            f"got '{result}'"
        )


def test_property_4_status_icon_only_two_outputs():
    """
    Property 4: Status Icon Consistency (Output Set)
    
    验证 format_status_icon 只有两种可能的输出。
    
    **Feature: tui-beautify, Property 4: Status Icon Consistency**
    **Validates: Requirements 4.2**
    """
    # 测试所有可能的输入
    outputs = {format_status_icon(True), format_status_icon(False)}
    
    # 应该只有两种输出
    assert len(outputs) == 2, (
        f"format_status_icon should have exactly 2 possible outputs, "
        f"got {len(outputs)}: {outputs}"
    )
    
    # 输出应该是预定义的 Unicode 符号
    assert outputs == {STATUS_INSTALLED, STATUS_NOT_INSTALLED}, (
        f"format_status_icon outputs should be {{{STATUS_INSTALLED}, {STATUS_NOT_INSTALLED}}}, "
        f"got {outputs}"
    )


def test_property_4_status_icons_are_unicode():
    """
    Property 4: Status Icon Consistency (Unicode Verification)
    
    验证状态图标是正确的 Unicode 字符。
    
    **Feature: tui-beautify, Property 4: Status Icon Consistency**
    **Validates: Requirements 4.2**
    """
    # 验证常量值
    assert STATUS_INSTALLED == "✓", (
        f"STATUS_INSTALLED should be '✓', got '{STATUS_INSTALLED}'"
    )
    assert STATUS_NOT_INSTALLED == "○", (
        f"STATUS_NOT_INSTALLED should be '○', got '{STATUS_NOT_INSTALLED}'"
    )
    
    # 验证函数输出
    assert format_status_icon(True) == "✓", (
        f"format_status_icon(True) should return '✓'"
    )
    assert format_status_icon(False) == "○", (
        f"format_status_icon(False) should return '○'"
    )
