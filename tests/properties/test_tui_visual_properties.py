"""
TUI 视觉属性测试

Property 5: TCSS File Validity
Property 6: Key Selector Existence

**Validates: Requirements 1.1, 1.4**
"""

import re
import sys
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


# --- 辅助函数 ---


def load_tcss_content() -> str:
    """加载 styles.tcss 文件内容"""
    tcss_path = PROJECT_ROOT.parent / "src" / "tui" / "styles.tcss"
    return tcss_path.read_text(encoding="utf-8")


def extract_selectors(tcss_content: str) -> list[str]:
    """提取 TCSS 文件中的所有选择器"""
    # 匹配选择器模式：行首非空白字符直到 {
    pattern = r"^([^\s{][^{]*)\s*\{"
    return re.findall(pattern, tcss_content, re.MULTILINE)


# --- Property 5: TCSS File Validity ---
# **Validates: Requirements 1.1**


def test_property_5_tcss_file_exists():
    """
    Property 5: TCSS File Existence

    验证 styles.tcss 文件存在且可读。

    **Feature: tui-beautify, Property 5: TCSS File Validity**
    **Validates: Requirements 1.1**
    """
    tcss_path = PROJECT_ROOT.parent / "src" / "tui" / "styles.tcss"
    assert tcss_path.exists(), f"TCSS file should exist at {tcss_path}"
    assert tcss_path.is_file(), f"{tcss_path} should be a file"

    # 文件应该可读且非空
    content = tcss_path.read_text(encoding="utf-8")
    assert len(content) > 0, "TCSS file should not be empty"


def test_property_5_tcss_has_valid_structure():
    """
    Property 5: TCSS Structure Validity

    验证 TCSS 文件具有基本的有效结构（平衡的大括号）。

    **Feature: tui-beautify, Property 5: TCSS File Validity**
    **Validates: Requirements 1.1**
    """
    content = load_tcss_content()

    # 移除注释
    content_no_comments = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)

    # 检查大括号平衡
    open_braces = content_no_comments.count("{")
    close_braces = content_no_comments.count("}")

    assert open_braces == close_braces, f"Braces should be balanced: {open_braces} open vs {close_braces} close"


# --- Property 6: Key Selector Existence ---
# **Validates: Requirements 1.4**

# 必须存在的关键选择器
REQUIRED_SELECTORS = [
    "Screen",
    "PlatformSelectScreen",
    "MainScreen",
    "SelectableItem.-selected",
    "SelectableItem.-highlight",
    "Button:hover",
    "CategoryItem.-active",
    "ItemListView",
    "#sidebar",
    "#two-column",
]


def test_property_6_key_selectors_exist():
    """
    Property 6: Key Selector Existence

    验证 TCSS 文件包含所有必需的关键选择器。

    **Feature: tui-beautify, Property 6: Key Selector Existence**
    **Validates: Requirements 1.4**
    """
    content = load_tcss_content()

    for selector in REQUIRED_SELECTORS:
        # 使用灵活的模式匹配（选择器可能有空格或换行）
        pattern = re.escape(selector).replace(r"\ ", r"\s*")
        assert re.search(pattern, content), f"TCSS should contain selector '{selector}'"


def test_property_6_selection_states_styled():
    """
    Property 6: Selection States Styled

    验证选中和高亮状态都有对应的样式定义。

    **Feature: tui-beautify, Property 6: Key Selector Existence**
    **Validates: Requirements 1.4**
    """
    content = load_tcss_content()

    selection_patterns = [
        r"SelectableItem\.-selected",
        r"SelectableItem\.-highlight",
        r"SelectableItem\.-selected\.-highlight",
    ]

    for pattern in selection_patterns:
        assert re.search(pattern, content), f"TCSS should style pattern '{pattern}'"
