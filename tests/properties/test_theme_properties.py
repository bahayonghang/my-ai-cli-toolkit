"""
主题属性测试

Property 1: Theme Structure Completeness
Property 2: Color Contrast Ratio Compliance

**Validates: Requirements 1.1, 1.2, 1.4**
"""

import sys
import re
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings

from tui.core.theme import (
    myclaudeTheme,
    THEME_COLORS,
    REQUIRED_THEME_PROPERTIES,
    create_myclaude_theme,
)


# --- 辅助函数 ---

def is_valid_hex_color(color: str) -> bool:
    """验证是否为有效的 hex 颜色值"""
    pattern = r'^#[0-9A-Fa-f]{6}$'
    return bool(re.match(pattern, color))


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """将 hex 颜色转换为 RGB 元组"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    """计算相对亮度 (WCAG 2.1 标准)
    
    参考: https://www.w3.org/WAI/GL/wiki/Relative_luminance
    """
    def adjust(c: int) -> float:
        c_srgb = c / 255
        if c_srgb <= 0.03928:
            return c_srgb / 12.92
        return ((c_srgb + 0.055) / 1.055) ** 2.4
    
    r, g, b = rgb
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)


def contrast_ratio(color1: str, color2: str) -> float:
    """计算两个颜色之间的对比度 (WCAG 2.1 标准)
    
    参考: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
    """
    l1 = relative_luminance(hex_to_rgb(color1))
    l2 = relative_luminance(hex_to_rgb(color2))
    
    lighter = max(l1, l2)
    darker = min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)


# --- Property 1: Theme Structure Completeness ---
# **Validates: Requirements 1.1, 1.4**

@settings(max_examples=100)
@given(prop_name=st.sampled_from(REQUIRED_THEME_PROPERTIES))
def test_property_1_theme_structure_completeness(prop_name: str):
    """
    Property 1: Theme Structure Completeness
    
    *For any* valid MyClaude theme object, it SHALL contain all required 
    base color properties with valid hex color values.
    
    **Feature: tui-beautify, Property 1: Theme Structure Completeness**
    **Validates: Requirements 1.1, 1.4**
    """
    # 验证 THEME_COLORS 包含该属性
    assert prop_name in THEME_COLORS, (
        f"THEME_COLORS should contain property '{prop_name}'"
    )
    
    # 验证颜色值是有效的 hex 格式
    color_value = THEME_COLORS[prop_name]
    assert is_valid_hex_color(color_value), (
        f"Color value for '{prop_name}' should be valid hex: {color_value}"
    )


def test_property_1_all_required_properties_present():
    """
    Property 1: Theme Structure Completeness (完整性检查)
    
    验证所有必需属性都存在于 THEME_COLORS 中。
    
    **Feature: tui-beautify, Property 1: Theme Structure Completeness**
    **Validates: Requirements 1.1, 1.4**
    """
    for prop_name in REQUIRED_THEME_PROPERTIES:
        assert prop_name in THEME_COLORS, (
            f"THEME_COLORS should contain required property '{prop_name}'"
        )
        
        color_value = THEME_COLORS[prop_name]
        assert is_valid_hex_color(color_value), (
            f"Color value for '{prop_name}' should be valid hex: {color_value}"
        )


def test_property_1_theme_object_creation():
    """
    Property 1: Theme Structure Completeness (主题对象创建)
    
    验证 create_myclaude_theme() 能成功创建主题对象。
    
    **Feature: tui-beautify, Property 1: Theme Structure Completeness**
    **Validates: Requirements 1.1, 1.4**
    """
    theme = create_myclaude_theme()
    
    # 验证主题名称
    assert theme.name == "myclaude", "Theme name should be 'myclaude'"
    
    # 验证是深色主题
    assert theme.dark is True, "Theme should be a dark theme"


# --- Property 2: Color Contrast Ratio Compliance ---
# **Validates: Requirements 1.2**

# 需要测试的前景/背景颜色对
CONTRAST_PAIRS = [
    ("foreground", "background"),  # 主文本在背景上
    ("foreground", "surface"),     # 主文本在表面上
    ("foreground", "panel"),       # 主文本在面板上
]


@settings(max_examples=100)
@given(pair=st.sampled_from(CONTRAST_PAIRS))
def test_property_2_color_contrast_ratio_compliance(pair: tuple[str, str]):
    """
    Property 2: Color Contrast Ratio Compliance
    
    *For any* foreground/background color pair in the theme, 
    the WCAG contrast ratio SHALL be at least 4.5:1.
    
    **Feature: tui-beautify, Property 2: Color Contrast Ratio Compliance**
    **Validates: Requirements 1.2**
    """
    fg_name, bg_name = pair
    fg_color = THEME_COLORS[fg_name]
    bg_color = THEME_COLORS[bg_name]
    
    ratio = contrast_ratio(fg_color, bg_color)
    
    # WCAG AA 标准要求普通文本对比度至少 4.5:1
    assert ratio >= 4.5, (
        f"Contrast ratio between {fg_name} ({fg_color}) and {bg_name} ({bg_color}) "
        f"should be at least 4.5:1, but got {ratio:.2f}:1"
    )


def test_property_2_all_contrast_pairs():
    """
    Property 2: Color Contrast Ratio Compliance (所有颜色对)
    
    验证所有前景/背景颜色对的对比度。
    
    **Feature: tui-beautify, Property 2: Color Contrast Ratio Compliance**
    **Validates: Requirements 1.2**
    """
    for fg_name, bg_name in CONTRAST_PAIRS:
        fg_color = THEME_COLORS[fg_name]
        bg_color = THEME_COLORS[bg_name]
        
        ratio = contrast_ratio(fg_color, bg_color)
        
        assert ratio >= 4.5, (
            f"Contrast ratio between {fg_name} ({fg_color}) and {bg_name} ({bg_color}) "
            f"should be at least 4.5:1, but got {ratio:.2f}:1"
        )
        
        # 打印对比度信息 (用于调试)
        print(f"{fg_name} on {bg_name}: {ratio:.2f}:1")
