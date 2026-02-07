"""
Theme property tests

Property 1: Theme Structure Completeness
Property 2: Color Contrast Ratio Compliance

**Validates: Requirements 1.1, 1.2, 1.4**
"""

import re
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from hypothesis import given, settings
from hypothesis import strategies as st

from tui.core.theme import (
    REQUIRED_THEME_PROPERTIES,
    THEME_COLORS,
    create_myclaude_theme,
)

# --- Helper functions ---


def is_valid_hex_color(color: str) -> bool:
    """Validate hex color format."""
    pattern = r"^#[0-9A-Fa-f]{6}$"
    return bool(re.match(pattern, color))


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    """Calculate relative luminance (WCAG 2.1).

    Reference: https://www.w3.org/WAI/GL/wiki/Relative_luminance
    """

    def adjust(c: int) -> float:
        c_srgb = c / 255
        if c_srgb <= 0.03928:
            return c_srgb / 12.92
        return ((c_srgb + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)


def contrast_ratio(color1: str, color2: str) -> float:
    """Calculate WCAG contrast ratio between two colors.

    Reference: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
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
    assert prop_name in THEME_COLORS, f"THEME_COLORS should contain property '{prop_name}'"

    color_value = THEME_COLORS[prop_name]
    assert is_valid_hex_color(color_value), f"Color value for '{prop_name}' should be valid hex: {color_value}"


def test_property_1_all_required_properties_present():
    """
    Property 1: Theme Structure Completeness (completeness check)

    **Feature: tui-beautify, Property 1: Theme Structure Completeness**
    **Validates: Requirements 1.1, 1.4**
    """
    for prop_name in REQUIRED_THEME_PROPERTIES:
        assert prop_name in THEME_COLORS, f"THEME_COLORS should contain required property '{prop_name}'"

        color_value = THEME_COLORS[prop_name]
        assert is_valid_hex_color(color_value), f"Color value for '{prop_name}' should be valid hex: {color_value}"


def test_property_1_theme_object_creation():
    """
    Property 1: Theme Structure Completeness (object creation)

    **Feature: tui-beautify, Property 1: Theme Structure Completeness**
    **Validates: Requirements 1.1, 1.4**
    """
    theme = create_myclaude_theme()

    assert theme.name == "myclaude", "Theme name should be 'myclaude'"
    assert theme.dark is True, "Theme should be a dark theme"


# --- Property 2: Color Contrast Ratio Compliance ---
# **Validates: Requirements 1.2**

# Foreground/background color pairs to test (Catppuccin Mocha)
CONTRAST_PAIRS = [
    ("foreground", "background"),  # Main text on base
    ("foreground", "surface"),  # Main text on surface
    ("foreground", "panel"),  # Main text on panel
    ("primary", "background"),  # Blue on base
    ("accent", "surface"),  # Mauve on surface
]

# Large text/icon contrast pairs (WCAG AA Large: 3.0:1)
LARGE_TEXT_CONTRAST_PAIRS = [
    ("warning", "panel"),  # Peach on panel
    ("primary", "surface"),  # Blue on surface
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

    assert ratio >= 4.5, (
        f"Contrast ratio between {fg_name} ({fg_color}) and {bg_name} ({bg_color}) "
        f"should be at least 4.5:1, but got {ratio:.2f}:1"
    )


def test_property_2_all_contrast_pairs():
    """
    Property 2: Color Contrast Ratio Compliance (all pairs)

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

        print(f"{fg_name} on {bg_name}: {ratio:.2f}:1")


# --- Property 3: Large Text Contrast Ratio Compliance ---
# **Validates: Requirements 1.2 (WCAG AA Large)**


@settings(max_examples=50)
@given(pair=st.sampled_from(LARGE_TEXT_CONTRAST_PAIRS))
def test_property_3_large_text_contrast_ratio(pair: tuple[str, str]):
    """
    Property 3: Large Text/Icon Contrast Ratio Compliance

    *For any* large text or icon color pair, WCAG contrast SHALL be at least 3.0:1.

    **Feature: tui-beautify, Property 3: Large Text Contrast**
    **Validates: Requirements 1.2**
    """
    fg_name, bg_name = pair
    fg_color = THEME_COLORS[fg_name]
    bg_color = THEME_COLORS[bg_name]

    ratio = contrast_ratio(fg_color, bg_color)

    assert ratio >= 3.0, (
        f"Large text contrast between {fg_name} ({fg_color}) and {bg_name} ({bg_color}) "
        f"should be at least 3.0:1, but got {ratio:.2f}:1"
    )


# --- Property 4: Theme Variable Existence ---
# **Validates: Requirements 1.4**


def test_property_4_theme_variables_exist():
    """
    Property 4: Theme Variable Existence

    **Feature: tui-beautify, Property 4: Theme Variable Existence**
    **Validates: Requirements 1.4**
    """
    theme = create_myclaude_theme()

    required_variables = [
        "text-muted",
        "footer-key-foreground",
        "input-selection-background",
        "input-cursor-foreground",
    ]

    for var_name in required_variables:
        assert var_name in theme.variables, f"Theme variables should contain '{var_name}'"
