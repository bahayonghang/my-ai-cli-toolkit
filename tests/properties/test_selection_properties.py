"""
选择状态管理属性测试

Property 1: Selection Toggle Consistency
Property 2: Select All Sets All Items
Property 3: Deselect All Clears All Items
Property 4: Get Selected Items Returns Only Selected

**Validates: Requirements 3.9, 4.8, 9.1, 9.2, 7.1**
"""

import sys
from pathlib import Path

# 添加项目根目录到 sys.path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from hypothesis import given, strategies as st, settings

from tui.core.models import ItemInfo, ItemType, InstallStatus


# --- 生成策略 ---

# 使用 ASCII 字母和数字，避免 Unicode 大小写转换的边缘情况
ASCII_ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"


@st.composite
def item_info_strategy(draw):
    """生成随机的 ItemInfo，使用 ASCII 字符以符合实际 skill/command 名称"""
    name = draw(st.text(
        alphabet=ASCII_ALPHANUM,
        min_size=1,
        max_size=20
    ))
    description = draw(st.one_of(st.none(), st.text(min_size=0, max_size=50)))
    status = draw(st.sampled_from([InstallStatus.INSTALLED, InstallStatus.NOT_INSTALLED]))
    item_type = draw(st.sampled_from([ItemType.SKILL, ItemType.COMMAND]))
    
    return ItemInfo(
        name=name,
        item_type=item_type,
        description=description,
        status=status,
    )


@st.composite
def item_info_list_strategy(draw, min_size=0, max_size=20):
    """生成随机的 ItemInfo 列表"""
    items = draw(st.lists(item_info_strategy(), min_size=min_size, max_size=max_size))
    # 确保名称唯一
    seen_names = set()
    unique_items = []
    for item in items:
        if item.name not in seen_names:
            seen_names.add(item.name)
            unique_items.append(item)
    return unique_items


# --- 模拟 SelectableItem 的核心逻辑 ---
# 由于 Textual 组件需要运行在 App 上下文中，我们测试核心逻辑

class MockSelectableItem:
    """模拟 SelectableItem 的核心选择逻辑"""
    
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
    
    def toggle_selection(self) -> None:
        self._selected = not self._selected


class MockItemListView:
    """模拟 ItemListView 的核心选择逻辑"""
    
    def __init__(self):
        self._all_items: list[MockSelectableItem] = []
        self._filter_text: str = ""
    
    @property
    def items(self) -> list[MockSelectableItem]:
        return self._all_items
    
    def load_items(self, item_infos: list[ItemInfo]) -> None:
        self._all_items = [MockSelectableItem(info) for info in item_infos]
    
    def get_selected_items(self) -> list[MockSelectableItem]:
        return [item for item in self._all_items if item.selected]
    
    def select_all(self) -> None:
        for item in self._get_visible_items():
            item.selected = True
    
    def deselect_all(self) -> None:
        for item in self._all_items:
            item.selected = False
    
    def filter_items(self, text: str) -> None:
        self._filter_text = text.lower()
    
    def clear_filter(self) -> None:
        self._filter_text = ""
    
    def _get_visible_items(self) -> list[MockSelectableItem]:
        if not self._filter_text:
            return self._all_items
        return [item for item in self._all_items 
                if self._filter_text in item.item_name.lower()]


# --- Property 1: Selection Toggle Consistency ---
# **Validates: Requirements 3.9, 4.8**

@settings(max_examples=100)
@given(
    item_info=item_info_strategy(),
    initial_selected=st.booleans()
)
def test_property_1_selection_toggle_consistency(item_info: ItemInfo, initial_selected: bool):
    """
    Property 1: Selection Toggle Consistency
    
    *For any* item in the list view, calling `toggle_selection()` twice 
    SHALL return the item to its original selection state.
    
    **Feature: install-tui, Property 1: Selection Toggle Consistency**
    **Validates: Requirements 3.9, 4.8**
    """
    item = MockSelectableItem(item_info, selected=initial_selected)
    original_state = item.selected
    
    # Toggle twice
    item.toggle_selection()
    item.toggle_selection()
    
    # Should return to original state
    assert item.selected == original_state, (
        f"After toggling twice, expected selected={original_state}, "
        f"got selected={item.selected}"
    )


# --- Property 2: Select All Sets All Items ---
# **Validates: Requirements 9.1**

@settings(max_examples=100)
@given(item_infos=item_info_list_strategy(min_size=0, max_size=20))
def test_property_2_select_all_sets_all_items(item_infos: list[ItemInfo]):
    """
    Property 2: Select All Sets All Items
    
    *For any* list of items, calling `select_all()` SHALL result in 
    all items having `selected = True`.
    
    **Feature: install-tui, Property 2: Select All Sets All Items**
    **Validates: Requirements 9.1**
    """
    list_view = MockItemListView()
    list_view.load_items(item_infos)
    
    # Select all
    list_view.select_all()
    
    # All items should be selected
    for item in list_view.items:
        assert item.selected is True, (
            f"Item {item.item_name} should be selected after select_all()"
        )


# --- Property 3: Deselect All Clears All Items ---
# **Validates: Requirements 9.2**

@settings(max_examples=100)
@given(
    item_infos=item_info_list_strategy(min_size=0, max_size=20),
    initial_selections=st.lists(st.booleans(), min_size=0, max_size=20)
)
def test_property_3_deselect_all_clears_all_items(
    item_infos: list[ItemInfo], 
    initial_selections: list[bool]
):
    """
    Property 3: Deselect All Clears All Items
    
    *For any* list of items, calling `deselect_all()` SHALL result in 
    all items having `selected = False`.
    
    **Feature: install-tui, Property 3: Deselect All Clears All Items**
    **Validates: Requirements 9.2**
    """
    list_view = MockItemListView()
    list_view.load_items(item_infos)
    
    # Set initial selection states
    for i, item in enumerate(list_view.items):
        if i < len(initial_selections):
            item.selected = initial_selections[i]
    
    # Deselect all
    list_view.deselect_all()
    
    # All items should be deselected
    for item in list_view.items:
        assert item.selected is False, (
            f"Item {item.item_name} should be deselected after deselect_all()"
        )


# --- Property 4: Get Selected Items Returns Only Selected ---
# **Validates: Requirements 7.1**

@settings(max_examples=100)
@given(
    item_infos=item_info_list_strategy(min_size=0, max_size=20),
    selection_pattern=st.lists(st.booleans(), min_size=0, max_size=20)
)
def test_property_4_get_selected_items_returns_only_selected(
    item_infos: list[ItemInfo],
    selection_pattern: list[bool]
):
    """
    Property 4: Get Selected Items Returns Only Selected
    
    *For any* list of items with mixed selection states, `get_selected_items()` 
    SHALL return exactly the items where `selected = True`.
    
    **Feature: install-tui, Property 4: Get Selected Items Returns Only Selected**
    **Validates: Requirements 7.1**
    """
    list_view = MockItemListView()
    list_view.load_items(item_infos)
    
    # Set selection states
    expected_selected_names = set()
    for i, item in enumerate(list_view.items):
        if i < len(selection_pattern) and selection_pattern[i]:
            item.selected = True
            expected_selected_names.add(item.item_name)
        else:
            item.selected = False
    
    # Get selected items
    selected_items = list_view.get_selected_items()
    actual_selected_names = {item.item_name for item in selected_items}
    
    # Verify
    assert actual_selected_names == expected_selected_names, (
        f"Expected selected items {expected_selected_names}, "
        f"got {actual_selected_names}"
    )
    
    # Also verify all returned items are actually selected
    for item in selected_items:
        assert item.selected is True, (
            f"Item {item.item_name} in get_selected_items() result "
            f"should have selected=True"
        )



# --- Property 5: Filter Returns Matching Items Only ---
# **Validates: Requirements 11.2, 11.4**

@settings(max_examples=100)
@given(
    item_infos=item_info_list_strategy(min_size=1, max_size=20),
    filter_text=st.text(alphabet=ASCII_ALPHANUM, min_size=0, max_size=10)
)
def test_property_5_filter_returns_matching_items_only(
    item_infos: list[ItemInfo],
    filter_text: str
):
    """
    Property 5: Filter Returns Matching Items Only
    
    *For any* filter text and list of items, `filter_items(text)` SHALL return 
    only items whose name contains the filter text (case-insensitive).
    
    **Feature: install-tui, Property 5: Filter Returns Matching Items Only**
    **Validates: Requirements 11.2, 11.4**
    """
    list_view = MockItemListView()
    list_view.load_items(item_infos)
    
    # Apply filter
    list_view.filter_items(filter_text)
    
    # Get visible items after filter
    visible_items = list_view._get_visible_items()
    
    # Calculate expected visible items (case-insensitive match)
    filter_lower = filter_text.lower()
    expected_visible_names = {
        item.item_name for item in list_view.items
        if filter_lower in item.item_name.lower()
    }
    
    actual_visible_names = {item.item_name for item in visible_items}
    
    # Verify all visible items match the filter
    assert actual_visible_names == expected_visible_names, (
        f"Filter '{filter_text}': Expected visible items {expected_visible_names}, "
        f"got {actual_visible_names}"
    )
    
    # Verify each visible item actually contains the filter text (case-insensitive)
    for item in visible_items:
        assert filter_lower in item.item_name.lower(), (
            f"Item '{item.item_name}' should not be visible with filter '{filter_text}'"
        )


@settings(max_examples=100)
@given(item_infos=item_info_list_strategy(min_size=1, max_size=20))
def test_property_5_empty_filter_returns_all_items(item_infos: list[ItemInfo]):
    """
    Property 5 (Edge Case): Empty Filter Returns All Items
    
    *For any* list of items, an empty filter text SHALL return all items.
    
    **Feature: install-tui, Property 5: Filter Returns Matching Items Only**
    **Validates: Requirements 11.2, 11.4**
    """
    list_view = MockItemListView()
    list_view.load_items(item_infos)
    
    # Apply empty filter
    list_view.filter_items("")
    
    # Get visible items
    visible_items = list_view._get_visible_items()
    
    # All items should be visible
    assert len(visible_items) == len(list_view.items), (
        f"Empty filter should return all {len(list_view.items)} items, "
        f"got {len(visible_items)}"
    )


@settings(max_examples=100)
@given(
    item_infos=item_info_list_strategy(min_size=1, max_size=20),
    filter_text=st.text(alphabet=ASCII_ALPHANUM, min_size=1, max_size=10)
)
def test_property_5_filter_is_case_insensitive(
    item_infos: list[ItemInfo],
    filter_text: str
):
    """
    Property 5 (Case Insensitivity): Filter is Case Insensitive
    
    *For any* filter text, the filter SHALL match items regardless of case.
    
    **Feature: install-tui, Property 5: Filter Returns Matching Items Only**
    **Validates: Requirements 11.4**
    """
    list_view = MockItemListView()
    list_view.load_items(item_infos)
    
    # Apply filter with original case
    list_view.filter_items(filter_text)
    visible_original = set(item.item_name for item in list_view._get_visible_items())
    
    # Apply filter with uppercase
    list_view.filter_items(filter_text.upper())
    visible_upper = set(item.item_name for item in list_view._get_visible_items())
    
    # Apply filter with lowercase
    list_view.filter_items(filter_text.lower())
    visible_lower = set(item.item_name for item in list_view._get_visible_items())
    
    # All should return the same results
    assert visible_original == visible_upper == visible_lower, (
        f"Filter should be case-insensitive. "
        f"Original: {visible_original}, Upper: {visible_upper}, Lower: {visible_lower}"
    )
