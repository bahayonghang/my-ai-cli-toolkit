"""列表组件 - SelectableItem 和 ItemListView

简洁紧凑的列表项设计，优化性能。
Requirements: 3.1, 3.3-3.9, 4.1-4.8, 9.1, 9.2, 11.2
"""


from textual.message import Message
from textual.widgets import ListItem, ListView, Static

from ..core.models import InstallStatus, ItemInfo


def get_display_width(text: str) -> int:
    """计算字符串的显示宽度（考虑中文字符）

    Args:
        text: 要计算宽度的字符串

    Returns:
        显示宽度（中文字符算2，英文字符算1）
    """
    width = 0
    for char in text:
        # 中文字符、全角符号等占2个显示宽度
        if ord(char) > 0x7F:  # 非ASCII字符
            width += 2
        else:
            width += 1
    return width


def truncate_to_width(text: str, max_width: int) -> str:
    """截断字符串到指定显示宽度

    Args:
        text: 要截断的字符串
        max_width: 最大显示宽度

    Returns:
        截断后的字符串
    """
    if not text:
        return ""

    result = []
    current_width = 0

    for char in text:
        char_width = 2 if ord(char) > 0x7F else 1
        if current_width + char_width > max_width:
            break
        result.append(char)
        current_width += char_width

    return ''.join(result)


def pad_to_width(text: str, target_width: int) -> str:
    """填充字符串到指定显示宽度

    Args:
        text: 要填充的字符串
        target_width: 目标显示宽度

    Returns:
        填充后的字符串
    """
    current_width = get_display_width(text)
    if current_width >= target_width:
        return text

    # 用空格填充到目标宽度
    padding = target_width - current_width
    return text + ' ' * padding


class SelectableItem(ListItem):
    """Selectable list item

    Single-line display: ☐/☑ ✓/○/⚠ name description
    Compact 1-line layout for maximum information density.
    """

    DEFAULT_CSS = """
    SelectableItem {
        height: 1;
        padding: 0 1;
        background: transparent;
    }

    SelectableItem:hover {
        background: $surface-lighten-1;
    }

    /* Selection state (Space toggle) - accent highlight */
    SelectableItem.-selected {
        background: $accent 20%;
    }

    SelectableItem.-selected #content {
        color: $accent;
        text-style: bold;
    }

    /* Keyboard navigation highlight - primary background */
    SelectableItem.-highlight {
        background: $primary 30%;
    }

    SelectableItem.-highlight #content {
        color: $foreground;
        text-style: bold;
    }

    /* Selected + highlighted */
    SelectableItem.-selected.-highlight {
        background: $primary 30%;
    }

    SelectableItem.-selected.-highlight #content {
        color: $foreground;
        text-style: bold;
    }

    /* Outdated items - warning color */
    SelectableItem.-outdated #content {
        color: $warning;
    }

    SelectableItem #content {
        width: 100%;
        color: $text;
    }
    """

    class SelectionChanged(Message):
        """选择状态变更消息"""
        def __init__(self, item: "SelectableItem", selected: bool) -> None:
            super().__init__()
            self.item = item
            self.selected = selected

    def __init__(self, item_info: ItemInfo, selected: bool = False) -> None:
        super().__init__()
        self.item_info = item_info
        self._selected = selected
        self._content: Static | None = None

    @property
    def item_name(self) -> str:
        return self.item_info.name

    @property
    def description(self) -> str | None:
        return self.item_info.description

    @property
    def installed(self) -> bool:
        return self.item_info.is_installed

    @property
    def needs_update(self) -> bool:
        return self.item_info.needs_update

    @property
    def selected(self) -> bool:
        return self._selected

    @selected.setter
    def selected(self, value: bool) -> None:
        if self._selected != value:
            self._selected = value
            self._update_display()
            self.post_message(self.SelectionChanged(self, value))

    def compose(self):
        self._content = Static(self._render_line(False), id="content")
        yield self._content

    def _render_line(self, highlighted: bool = False) -> str:
        """Render single-line content (compact table layout).

        Format: ▶ ☐ ✓ Name                           Description...
        """
        SEP = "  "

        # Highlight arrow indicator
        arrow = "▶" if highlighted else " "

        # Checkbox column (1 char)
        checkbox = "☑" if self._selected else "☐"

        # Status column (1 char)
        if self.needs_update:
            status = "⚠"
        elif self.installed:
            status = "✓"
        else:
            status = "○"

        # Name column (fixed display width 30)
        name_text = truncate_to_width(self.item_name, 30)
        name = pad_to_width(name_text, 30)

        # Description column (fill remaining, ~50 chars)
        desc = self.description or ""
        desc_text = truncate_to_width(desc, 50)
        desc = pad_to_width(desc_text, 50)

        return f"{arrow}{SEP}{checkbox}{SEP}{status}{SEP}{name}{SEP}{desc}"

    def _update_display(self) -> None:
        """更新显示"""
        if self._selected:
            self.add_class("-selected")
        else:
            self.remove_class("-selected")

        # 标记需要更新的项目
        if self.needs_update:
            self.add_class("-outdated")
        else:
            self.remove_class("-outdated")

        if self._content:
            # 检查是否有高亮
            highlighted = self.has_class("-highlight")
            self._content.update(self._render_line(highlighted))

    def toggle_selection(self) -> None:
        """切换选择状态"""
        self.selected = not self._selected

    def update_install_status(self, status: InstallStatus) -> None:
        """更新安装状态"""
        self.item_info.status = status
        if self._content:
            highlighted = self.has_class("-highlight")
            self._content.update(self._render_line(highlighted))


class ItemListView(ListView):
    """高性能列表视图

    支持选择、过滤，显示分页信息。
    """

    DEFAULT_CSS = """
    ItemListView {
        height: 1fr;
        border: round $primary;
        padding: 0 1;
        scrollbar-size: 1 1;
    }

    ItemListView:focus {
        border: round $accent;
    }

    /* Table header style */
    .list-header {
        background: $surface;
        color: $accent;
        text-style: bold;
        height: 1;
        padding: 0 1;
    }
    """

    class SelectionCountChanged(Message):
        """选中数量变更消息"""
        def __init__(self, count: int) -> None:
            super().__init__()
            self.count = count

    def __init__(self, item_type: str = "skills", id: str | None = None) -> None:
        super().__init__(id=id)
        self.item_type = item_type
        self._all_items: list[SelectableItem] = []
        self._filter_text: str = ""
        self._filter_category: str | None = None
        self._last_highlighted: SelectableItem | None = None
        self._filter_apply_scheduled = False

    @property
    def items(self) -> list[SelectableItem]:
        return self._all_items

    def _create_header(self) -> ListItem:
        """Create table header row."""
        SEP = "  "
        header_text = f" {SEP}☐{SEP}✓{SEP}{'Name':<30}{SEP}{'Description':<50}"
        header = ListItem(Static(header_text, classes="list-header"))
        header.can_focus = False
        return header

    def load_items(self, item_infos: list[ItemInfo]) -> None:
        """加载项目列表"""
        self.clear()
        self._all_items = []

        # 添加表头
        self.append(self._create_header())

        if not item_infos:
            empty = ListItem(Static("  📭 No items found", classes="text-muted"))
            empty.can_focus = False
            self.append(empty)
            return

        for info in item_infos:
            item = SelectableItem(item_info=info)
            self._all_items.append(item)
            self.append(item)

    def get_selected_items(self) -> list[SelectableItem]:
        return [item for item in self._all_items if item.selected]

    def get_selected_names(self) -> list[str]:
        return [item.item_name for item in self._all_items if item.selected]

    def select_all(self) -> None:
        for item in self._get_visible_items():
            item.selected = True
        self._notify_selection_changed()

    def deselect_all(self) -> None:
        for item in self._all_items:
            item.selected = False
        self._notify_selection_changed()

    def filter_items(self, text: str) -> None:
        """过滤列表"""
        self._filter_text = text.lower()
        self._schedule_filter_apply()

    def clear_filter(self) -> None:
        self._filter_text = ""
        self._filter_category = None
        self._schedule_filter_apply()

    def filter_by_category(self, category: str | None) -> None:
        """Filter items by category.

        Args:
            category: Category to filter by, or None for all items
        """
        self._filter_category = category
        self._schedule_filter_apply()

    def _schedule_filter_apply(self) -> None:
        """在刷新后调度过滤应用，避免首次点击渲染异常。"""
        if self._filter_apply_scheduled:
            return
        self._filter_apply_scheduled = True
        # 确保产生一次刷新循环，保证 call_after_refresh 执行。
        self.refresh()
        self.call_after_refresh(self._apply_filter)

    def _apply_filter(self) -> None:
        """应用过滤"""
        self._filter_apply_scheduled = False
        self.clear()

        # 添加表头
        self.append(self._create_header())

        visible = [item for item in self._all_items if self._matches_filter(item)]

        if not visible:
            empty = ListItem(Static("  🔍 No matches found", classes="text-muted"))
            empty.can_focus = False
            self.append(empty)
            return

        for item in visible:
            self.append(item)

    def _matches_filter(self, item: SelectableItem) -> bool:
        """Check if item matches current filter criteria.

        Args:
            item: Item to check

        Returns:
            True if item matches all active filters
        """
        # Check category filter
        if self._filter_category is not None:
            item_category = item.item_info.category
            if item_category != self._filter_category:
                return False

        # Check text filter
        if self._filter_text:
            if self._filter_text not in item.item_name.lower():
                return False

        return True

    def _get_visible_items(self) -> list[SelectableItem]:
        if not self._filter_text and self._filter_category is None:
            return self._all_items
        return [item for item in self._all_items if self._matches_filter(item)]

    def _notify_selection_changed(self) -> None:
        count = len(self.get_selected_items())
        self.post_message(self.SelectionCountChanged(count))

    def on_selectable_item_selection_changed(self, event: SelectableItem.SelectionChanged) -> None:
        self._notify_selection_changed()

    def get_focused_item(self) -> SelectableItem | None:
        if self.highlighted_child and isinstance(self.highlighted_child, SelectableItem):
            return self.highlighted_child
        return None

    def toggle_focused_selection(self) -> None:
        focused = self.get_focused_item()
        if focused:
            focused.toggle_selection()

    def watch_index(self, old_index: int, new_index: int) -> None:
        """监听高亮索引变化，更新高亮样式"""
        # 移除旧的高亮
        if self._last_highlighted:
            self._last_highlighted.remove_class("-highlight")
            self._last_highlighted._update_display()

        # 添加新的高亮
        if self.highlighted_child and isinstance(self.highlighted_child, SelectableItem):
            self.highlighted_child.add_class("-highlight")
            self.highlighted_child._update_display()
            self._last_highlighted = self.highlighted_child

    def get_page_info(self) -> tuple[int, int]:
        """获取分页信息 (当前页, 总页数)"""
        total = len(self._all_items)
        if total == 0:
            return (1, 1)
        # 简单估算：假设每页显示约 20 项
        page_size = 20
        total_pages = max(1, (total + page_size - 1) // page_size)
        # 当前页基于滚动位置估算
        current_page = 1
        if self.highlighted_child:
            try:
                idx = self._all_items.index(self.highlighted_child)
                current_page = (idx // page_size) + 1
            except (ValueError, AttributeError):
                pass
        return (current_page, total_pages)
