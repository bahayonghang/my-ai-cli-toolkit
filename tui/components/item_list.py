"""列表组件 - SelectableItem 和 ItemListView

简洁紧凑的列表项设计，优化性能。
Requirements: 3.1, 3.3-3.9, 4.1-4.8, 9.1, 9.2, 11.2
"""

from typing import Optional
from textual.widgets import Static, ListView, ListItem
from textual.message import Message

from ..core.models import ItemInfo, InstallStatus


class SelectableItem(ListItem):
    """紧凑型可选择列表项
    
    单行显示: ☐/☑  ✓/○  name  -  description
    优化性能：减少嵌套组件，使用纯文本渲染
    """
    
    DEFAULT_CSS = """
    SelectableItem {
        height: 1;
        padding: 0 1;
        background: transparent;
    }
    
    SelectableItem:hover {
        background: $surface-lighten-2;
    }
    
    /* 选中状态 (Space 选中) - 橙色高亮 */
    SelectableItem.-selected {
        background: $warning 30%;
    }
    
    SelectableItem.-selected #content {
        color: $warning;
        text-style: bold;
    }
    
    /* ListView 高亮状态 (键盘浏览) - 实色绿色背景 */
    SelectableItem.-highlight {
        background: $success;
    }
    
    SelectableItem.-highlight #content {
        color: $background;
        text-style: bold;
    }
    
    /* 选中且高亮 */
    SelectableItem.-selected.-highlight {
        background: $success;
    }
    
    SelectableItem.-selected.-highlight #content {
        color: $background;
        text-style: bold;
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
        self._content: Optional[Static] = None
    
    @property
    def item_name(self) -> str:
        return self.item_info.name
    
    @property
    def description(self) -> Optional[str]:
        return self.item_info.description
    
    @property
    def installed(self) -> bool:
        return self.item_info.is_installed
    
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
        """单个 Static 组件，最小化嵌套"""
        self._content = Static(self._render_line(False), id="content")
        yield self._content
    
    def _render_line(self, highlighted: bool = False) -> str:
        """渲染单行内容: ▶/  ☐/☑  ✓/○  name  -  description"""
        # 高亮指示箭头
        arrow = "▶" if highlighted else " "
        # 复选框
        checkbox = "☑" if self._selected else "☐"
        # 安装状态
        status = "✓" if self.installed else "○"
        # 名称 (固定宽度)
        name = self.item_name.ljust(26)[:26]
        # 描述
        desc = self.description or ""
        
        return f"{arrow} {checkbox}  {status}  {name}  {desc}"
    
    def _update_display(self) -> None:
        """更新显示"""
        if self._selected:
            self.add_class("-selected")
        else:
            self.remove_class("-selected")
        
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
        padding: 0;
        scrollbar-size: 1 1;
    }
    
    ItemListView:focus {
        border: round $accent;
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
        self._last_highlighted: Optional[SelectableItem] = None
    
    @property
    def items(self) -> list[SelectableItem]:
        return self._all_items
    
    def load_items(self, item_infos: list[ItemInfo]) -> None:
        """加载项目列表"""
        self.clear()
        self._all_items = []
        
        if not item_infos:
            # 空状态
            empty = ListItem(Static("  (empty)", classes="text-muted"))
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
        self._apply_filter()
    
    def clear_filter(self) -> None:
        self._filter_text = ""
        self._apply_filter()
    
    def _apply_filter(self) -> None:
        """应用过滤"""
        self.clear()
        visible = [item for item in self._all_items if self._matches_filter(item)]
        
        if not visible:
            empty = ListItem(Static("  No matches", classes="text-muted"))
            empty.can_focus = False
            self.append(empty)
            return
        
        for item in visible:
            self.append(item)
    
    def _matches_filter(self, item: SelectableItem) -> bool:
        if not self._filter_text:
            return True
        return self._filter_text in item.item_name.lower()
    
    def _get_visible_items(self) -> list[SelectableItem]:
        if not self._filter_text:
            return self._all_items
        return [item for item in self._all_items if self._matches_filter(item)]
    
    def _notify_selection_changed(self) -> None:
        count = len(self.get_selected_items())
        self.post_message(self.SelectionCountChanged(count))
    
    def on_selectable_item_selection_changed(self, event: SelectableItem.SelectionChanged) -> None:
        self._notify_selection_changed()
    
    def get_focused_item(self) -> Optional[SelectableItem]:
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
