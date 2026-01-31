"""技能列表组件 - SkillItem 和 SkillListView

显示外部技能列表，支持键盘导航和搜索过滤。

Requirements: 2.2, 2.4, 6.2, 6.3
"""


from textual.message import Message
from textual.widgets import ListItem, ListView, Static

from ..core.models import ExternalSkillInfo

# 技能类型图标映射
SKILL_TYPE_ICONS = {
    "npm-cli": "📦",
    "npx": "⚡",
    "pip-cli": "🐍",
    "git": "🔗",
}


class SkillItem(ListItem):
    """技能列表项

    单行显示: 类型图标 | 名称 | 描述 | 支持状态

    Attributes:
        skill: 技能信息对象
    """

    DEFAULT_CSS = """
    SkillItem {
        height: 1;
        padding: 0 1;
        background: transparent;
    }

    SkillItem:hover {
        background: $surface-lighten-2;
    }

    /* ListView 高亮状态 (键盘浏览) - 实色绿色背景 */
    SkillItem.-highlight {
        background: $success;
    }

    SkillItem.-highlight #content {
        color: $background;
        text-style: bold;
    }

    /* 不支持当前平台的技能 - 灰色显示 */
    SkillItem.-unsupported {
        opacity: 0.5;
    }

    SkillItem.-unsupported #content {
        color: $text-muted;
    }

    SkillItem #content {
        width: 100%;
        color: $text;
    }
    """

    def __init__(self, skill: ExternalSkillInfo) -> None:
        """初始化技能列表项

        Args:
            skill: 技能信息对象
        """
        super().__init__()
        self.skill = skill
        self._content: Static | None = None

    @property
    def skill_name(self) -> str:
        """获取技能名称"""
        return self.skill.name

    @property
    def description(self) -> str:
        """获取技能描述"""
        return self.skill.description

    @property
    def skill_type(self) -> str:
        """获取技能类型"""
        return self.skill.skill_type

    @property
    def is_supported(self) -> bool:
        """是否支持当前平台"""
        return self.skill.is_supported

    def compose(self):
        """组合组件 - 单个 Static 组件，最小化嵌套"""
        self._content = Static(self._render_line(False), id="content")
        yield self._content

        # 如果不支持当前平台，添加样式类
        if not self.is_supported:
            self.add_class("-unsupported")

    def _render_line(self, highlighted: bool = False) -> str:
        """渲染单行内容: ▶/  类型图标  名称  -  描述  [不支持]

        Args:
            highlighted: 是否高亮显示

        Returns:
            渲染后的字符串
        """
        # 高亮指示箭头
        arrow = "▶" if highlighted else " "

        # 类型图标
        icon = SKILL_TYPE_ICONS.get(self.skill_type, "📦")

        # 名称 (固定宽度)
        name = self.skill_name.ljust(20)[:20]

        # 描述 (截断过长的描述)
        desc = self.description[:50] if self.description else ""

        # 支持状态
        support_status = "" if self.is_supported else " [不支持]"

        return f"{arrow} {icon}  {name}  {desc}{support_status}"

    def _update_display(self) -> None:
        """更新显示"""
        if self._content:
            highlighted = self.has_class("-highlight")
            self._content.update(self._render_line(highlighted))


class SkillListView(ListView):
    """技能列表视图

    显示所有外部技能，支持键盘导航 (j/k) 和搜索过滤。

    Requirements: 2.2, 2.4, 6.2, 6.3
    """

    DEFAULT_CSS = """
    SkillListView {
        height: 1fr;
        border: round $primary;
        padding: 0;
        scrollbar-size: 1 1;
    }

    SkillListView:focus {
        border: round $accent;
    }
    """

    class SkillHighlighted(Message):
        """技能高亮变更消息"""
        def __init__(self, skill: ExternalSkillInfo | None) -> None:
            super().__init__()
            self.skill = skill

    def __init__(self, id: str | None = None) -> None:
        """初始化技能列表视图

        Args:
            id: 组件 ID
        """
        super().__init__(id=id)
        self._all_items: list[SkillItem] = []
        self._filter_text: str = ""
        self._last_highlighted: SkillItem | None = None

    @property
    def items(self) -> list[SkillItem]:
        """获取所有技能项"""
        return self._all_items

    def load_skills(self, skills: list[ExternalSkillInfo]) -> None:
        """加载技能列表

        Args:
            skills: 技能信息列表
        """
        self.clear()
        self._all_items = []

        if not skills:
            # 空状态
            empty = ListItem(Static("  (无技能)", classes="text-muted"))
            empty.can_focus = False
            self.append(empty)
            return

        for skill in skills:
            item = SkillItem(skill=skill)
            self._all_items.append(item)
            self.append(item)

    def filter_skills(self, query: str) -> None:
        """过滤技能列表

        根据查询字符串过滤技能，匹配名称或描述（不区分大小写）。

        Args:
            query: 搜索查询字符串

        Requirements: 6.2, 6.3
        """
        self._filter_text = query.lower()
        self._apply_filter()

    def clear_filter(self) -> None:
        """清除搜索过滤，显示完整列表

        Requirements: 6.4
        """
        self._filter_text = ""
        self._apply_filter()

    def _apply_filter(self) -> None:
        """应用过滤"""
        self.clear()
        visible = [item for item in self._all_items if self._matches_filter(item)]

        if not visible:
            empty = ListItem(Static("  无匹配结果", classes="text-muted"))
            empty.can_focus = False
            self.append(empty)
            return

        for item in visible:
            self.append(item)

    def _matches_filter(self, item: SkillItem) -> bool:
        """检查技能是否匹配过滤条件

        匹配名称或描述（不区分大小写）。

        Args:
            item: 技能列表项

        Returns:
            是否匹配

        Requirements: 6.3
        """
        if not self._filter_text:
            return True

        # 匹配名称或描述
        name_match = self._filter_text in item.skill_name.lower()
        desc_match = self._filter_text in item.description.lower()

        return name_match or desc_match

    def get_focused_skill(self) -> ExternalSkillInfo | None:
        """获取当前高亮的技能

        Returns:
            当前高亮的技能信息，如果没有则返回 None
        """
        if self.highlighted_child and isinstance(self.highlighted_child, SkillItem):
            return self.highlighted_child.skill
        return None

    def watch_index(self, old_index: int, new_index: int) -> None:
        """监听高亮索引变化，更新高亮样式

        Args:
            old_index: 旧索引
            new_index: 新索引
        """
        # 移除旧的高亮
        if self._last_highlighted:
            self._last_highlighted.remove_class("-highlight")
            self._last_highlighted._update_display()

        # 添加新的高亮
        if self.highlighted_child and isinstance(self.highlighted_child, SkillItem):
            self.highlighted_child.add_class("-highlight")
            self.highlighted_child._update_display()
            self._last_highlighted = self.highlighted_child

            # 发送高亮变更消息
            self.post_message(self.SkillHighlighted(self.highlighted_child.skill))
