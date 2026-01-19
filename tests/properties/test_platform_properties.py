"""
平台选择屏幕属性测试

Property 7: Platform Option Format
Property 8: Header Platform Badge Format

**Validates: Requirements 2.4, 3.2**
"""

import sys
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings

from tui.core.formatters import (
    PlatformConfig,
    format_platform_option,
    format_platform_badge,
)


# --- 生成策略 ---

PLATFORM_ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789-_"
PLATFORM_NAME_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
PATH_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_/.~"


@st.composite
def platform_config_strategy(draw):
    """生成随机的 PlatformConfig"""
    platform_id = draw(st.text(alphabet=PLATFORM_ID_CHARS, min_size=1, max_size=20))
    platform_name = draw(st.text(alphabet=PLATFORM_NAME_CHARS, min_size=1, max_size=20))
    path_style = draw(st.sampled_from(["home", "absolute"]))
    if path_style == "home":
        path = f"~/.{platform_id}/"
    else:
        path_segment = draw(st.text(alphabet="abcdefghijklmnopqrstuvwxyz", min_size=1, max_size=10))
        path = f"/home/user/.{path_segment}/"
    return PlatformConfig(id=platform_id, name=platform_name, path=path)


# --- Property 7: Platform Option Format ---
# **Validates: Requirements 2.4**

@settings(max_examples=100)
@given(platform=platform_config_strategy())
def test_property_7_platform_option_format(platform: PlatformConfig):
    """Property 7: Platform Option Format - validates Requirements 2.4"""
    formatted = format_platform_option(platform)
    assert platform.name in formatted
    assert platform.path in formatted


@settings(max_examples=100)
@given(platform=platform_config_strategy())
def test_property_7_platform_option_name_before_path(platform: PlatformConfig):
    """Property 7: Name appears before path - validates Requirements 2.4"""
    formatted = format_platform_option(platform)
    name_index = formatted.find(platform.name)
    path_index = formatted.find(platform.path)
    assert name_index < path_index


def test_property_7_real_platforms():
    """Property 7: Real platforms test - validates Requirements 2.4"""
    real_platforms = [
        PlatformConfig("claude", "Claude", "~/.claude/"),
        PlatformConfig("codex", "Codex", "~/.codex/"),
        PlatformConfig("gemini", "Gemini", "~/.gemini/"),
    ]
    for platform in real_platforms:
        formatted = format_platform_option(platform)
        assert platform.name in formatted
        assert platform.path in formatted
        print(f"{platform.id}: '{formatted}'")


# --- Property 8: Header Platform Badge Format ---
# **Validates: Requirements 3.2**

@settings(max_examples=100)
@given(platform_name=st.text(alphabet=PLATFORM_NAME_CHARS, min_size=1, max_size=30))
def test_property_8_header_platform_badge_format(platform_name: str):
    """Property 8: Badge is uppercase - validates Requirements 3.2"""
    formatted = format_platform_badge(platform_name)
    assert formatted == platform_name.upper()


@settings(max_examples=100)
@given(platform_name=st.text(alphabet=PLATFORM_NAME_CHARS, min_size=1, max_size=30))
def test_property_8_badge_is_all_uppercase(platform_name: str):
    """Property 8: Badge has no lowercase - validates Requirements 3.2"""
    formatted = format_platform_badge(platform_name)
    has_alpha = any(c.isalpha() for c in formatted)
    if has_alpha:
        assert formatted.isupper()


def test_property_8_real_platforms():
    """Property 8: Real platforms badge test - validates Requirements 3.2"""
    real_platforms = ["claude", "codex", "gemini", "Claude", "Codex", "Gemini"]
    for platform_name in real_platforms:
        formatted = format_platform_badge(platform_name)
        assert formatted == platform_name.upper()
        print(f"{platform_name} -> '{formatted}'")
