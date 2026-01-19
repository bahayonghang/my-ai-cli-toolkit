"""
Footer 组件属性测试

Property 5: Footer Message Level Styling
Property 6: Footer Selection Count Display

**Validates: Requirements 5.1, 5.2**
"""

import sys
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings

from tui.core.formatters import (
    get_message_css_class,
    get_message_icon,
    format_selection_count,
    ICON_SUCCESS,
    ICON_WARNING,
    ICON_ERROR,
    ICON_INFO,
)


# --- Property 5: Footer Message Level Styling ---
# **Validates: Requirements 5.1**

# 有效的消息级别
VALID_MESSAGE_LEVELS = ["info", "success", "warning", "error"]

# 消息级别到 CSS 类的映射
LEVEL_TO_CSS_CLASS = {
    "info": "status-info",
    "success": "status-success",
    "warning": "status-warning",
    "error": "status-error",
}

# 消息级别到图标的映射
LEVEL_TO_ICON = {
    "info": ICON_INFO,
    "success": ICON_SUCCESS,
    "warning": ICON_WARNING,
    "error": ICON_ERROR,
}


@settings(max_examples=100)
@given(level=st.sampled_from(VALID_MESSAGE_LEVELS))
def test_property_5_message_level_css_class(level: str):
    """
    Property 5: Footer Message Level Styling
    
    *For any* message level (info, success, warning, error), the footer 
    SHALL apply the corresponding CSS class (status-info, status-success, 
    status-warning, status-error).
    
    **Feature: tui-beautify, Property 5: Footer Message Level Styling**
    **Validates: Requirements 5.1**
    """
    result = get_message_css_class(level)
    expected = LEVEL_TO_CSS_CLASS[level]
    
    assert result == expected, (
        f"get_message_css_class('{level}') should return '{expected}', "
        f"got '{result}'"
    )


@settings(max_examples=100)
@given(level=st.sampled_from(VALID_MESSAGE_LEVELS))
def test_property_5_message_level_icon(level: str):
    """
    Property 5: Footer Message Level Styling (Icon)
    
    *For any* message level, the footer SHALL display the corresponding 
    semantic icon (✓/⚠/✗/ℹ).
    
    **Feature: tui-beautify, Property 5: Footer Message Level Styling**
    **Validates: Requirements 5.1**
    """
    result = get_message_icon(level)
    expected = LEVEL_TO_ICON[level]
    
    assert result == expected, (
        f"get_message_icon('{level}') should return '{expected}', "
        f"got '{result}'"
    )


def test_property_5_invalid_level_defaults_to_info():
    """
    Property 5: Footer Message Level Styling (Invalid Level Fallback)
    
    *For any* invalid message level, the function SHALL default to 'status-info'.
    
    **Feature: tui-beautify, Property 5: Footer Message Level Styling**
    **Validates: Requirements 5.1**
    """
    invalid_levels = ["invalid", "unknown", "", "INFO", "SUCCESS", "123"]
    
    for level in invalid_levels:
        result = get_message_css_class(level)
        assert result == "status-info", (
            f"get_message_css_class('{level}') should default to 'status-info', "
            f"got '{result}'"
        )


def test_property_5_css_class_format():
    """
    Property 5: Footer Message Level Styling (CSS Class Format)
    
    验证所有 CSS 类名都遵循 'status-{level}' 格式。
    
    **Feature: tui-beautify, Property 5: Footer Message Level Styling**
    **Validates: Requirements 5.1**
    """
    for level in VALID_MESSAGE_LEVELS:
        result = get_message_css_class(level)
        assert result.startswith("status-"), (
            f"CSS class '{result}' should start with 'status-'"
        )
        assert result == f"status-{level}", (
            f"CSS class should be 'status-{level}', got '{result}'"
        )


# --- Property 6: Footer Selection Count Display ---
# **Validates: Requirements 5.2**

@settings(max_examples=100)
@given(count=st.integers(min_value=1, max_value=10000))
def test_property_6_positive_selection_count(count: int):
    """
    Property 6: Footer Selection Count Display (Positive Count)
    
    *For any* positive integer selection count, the footer SHALL display 
    "Selected: N".
    
    **Feature: tui-beautify, Property 6: Footer Selection Count Display**
    **Validates: Requirements 5.2**
    """
    result = format_selection_count(count)
    expected = f"Selected: {count}"
    
    assert result == expected, (
        f"format_selection_count({count}) should return '{expected}', "
        f"got '{result}'"
    )


@settings(max_examples=100)
@given(count=st.integers(min_value=-1000, max_value=0))
def test_property_6_zero_or_negative_selection_count(count: int):
    """
    Property 6: Footer Selection Count Display (Zero/Negative Count)
    
    *For any* zero or negative selection count, the footer SHALL display 
    an empty string.
    
    **Feature: tui-beautify, Property 6: Footer Selection Count Display**
    **Validates: Requirements 5.2**
    """
    result = format_selection_count(count)
    
    assert result == "", (
        f"format_selection_count({count}) should return '', "
        f"got '{result}'"
    )


def test_property_6_selection_count_format():
    """
    Property 6: Footer Selection Count Display (Format Verification)
    
    验证选中计数的格式正确。
    
    **Feature: tui-beautify, Property 6: Footer Selection Count Display**
    **Validates: Requirements 5.2**
    """
    # 测试边界情况
    assert format_selection_count(0) == "", "Count 0 should return empty string"
    assert format_selection_count(1) == "Selected: 1", "Count 1 should return 'Selected: 1'"
    assert format_selection_count(100) == "Selected: 100", "Count 100 should return 'Selected: 100'"
