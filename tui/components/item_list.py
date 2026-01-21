"""列表组件 - SelectableItem 和 ItemListView

简洁紧凑的列表项设计，优化性能。
Requirements: 3.1, 3.3-3.9, 4.1-4.8, 9.1, 9.2, 11.2
"""

from typing import Optional
from textual.widgets import Static, ListView, ListItem
from textual.message import Message

from ..core.models import ItemInfo, InstallStatus


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
    """紧凑型可选择列表项
    
    单行显示: ☐/☑  ✓/○/⚠  name  -  description  [dates]
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
    
    /* 需要更新的项目 - 黄色警告 */
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
        """单个 Static 组件，最小化嵌套"""
        self._content = Static(self._render_line(False), id="content")
        yield self._content
    
    def _format_datetime(self, dt) -> str:
        """格式化日期时间为简短格式
        
        Args:
            dt: datetime 对象
            
        Returns:
            格式化的日期字符串，如 "01-21 14:30"
        """
        if dt is None:
            return "N/A".ljust(11)
        return dt.strftime("%m-%d %H:%M")
    
    def _render_line(self, highlighted: bool = False) -> str:
        """渲染单行内容（表格式布局）
        
        格式: ▶ ☐ ✓ Name                     Description                                      Src Time     Tgt Time
        """
        # 高亮指示箭头
        arrow = "▶" if highlighted else " "
        
        # 复选框列 (固定1字符)
        checkbox = "☑" if self._selected else "☐"
        
        # 状态列 (固定1字符)
        if self.needs_update:
            status = "⚠"  # 需要更新
        elif self.installed:
            status = "✓"  # 已安装
        else:
            status = "○"  # 未安装
        
        # 名称列 (固定显示宽度 24)
        name_text = truncate_to_width(self.item_name, 24)
        name = pad_to_width(name_text, 24)
        
        # 描述列 (固定显示宽度 48，考虑中文字符)
        desc = self.description or ""
        desc_text = truncate_to_width(desc, 48)
        desc = pad_to_width(desc_text, 48)
        
        # 源时间列 (固定宽度 11: "MM-DD HH:MM")
        src_time = self._format_datetime(self.item_info.source_mtime)
        
        # 目标时间列 (固定宽度 11)
        tgt_time = self._format_datetime(self.item_info.target_mtime)
        
        return f"{arrow} {checkbox} {status} {name} {desc} {src_time} {tgt_time}"
    
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
        padding: 0;
        scrollbar-size: 1 1;
    }
    
    ItemListView:focus {
        border: round $accent;
    }
    
    /* 表头样式 */
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
        self._last_highlighted: Optional[SelectableItem] = None
    
    @property
    def items(self) -> list[SelectableItem]:
        return self._all_items
    
    def _create_header(self) -> ListItem:
        """创建表头"""
        # 格式与 SelectableItem._render_line 对齐
        # ▶ ☐ ✓ Name                     Description                                      Src Time     Tgt Time
        # 列名对齐：箭头(1) 空格 复选框列(1) 空格 状态列(1) 空格 名称(24) 空格 描述(48) 空格 源时间(11) 空格 目标时间(11)
        # 使用空格填充使列名与数据对齐
        header_text = "  ☐ ✓ Name                     Description                                      Src Time     Tgt Time"
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
        
        # 添加表头
        self.append(self._create_header())
        
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
