"""Category Sidebar Component

Left sidebar with content type toggle (Skills/Commands) and vertical category list
with counts. Supports keyboard and mouse navigation.
"""

from textual.containers import Horizontal, Vertical
from textual.css.query import NoMatches
from textual.message import Message
from textual.widgets import Button, ListItem, ListView, Static

from .category_filter import get_category_label


class CategoryItem(ListItem):
    """Individual category item in the sidebar list."""

    def __init__(self, category: str | None, label: str, count: int) -> None:
        super().__init__()
        self.category = category
        self._label = label
        self._count = count
        self._text_widget: Static | None = None

    def compose(self):
        self._text_widget = Static(self._format(), classes="cat-text")
        yield self._text_widget

    def _format(self) -> str:
        prefix = "▸" if self.has_class("-active") else " "
        return f"{prefix} {self._label} ({self._count})"

    def set_active(self, active: bool) -> None:
        if active:
            self.add_class("-active")
        else:
            self.remove_class("-active")
        if self._text_widget:
            self._text_widget.update(self._format())


class CategorySidebar(Vertical):
    """Left sidebar with content type toggle and category list.

    Top: Skills/Commands radio-style toggle buttons
    Bottom: Vertical category list with counts and active highlight

    Messages:
        ContentTypeChanged: Fired when switching between Skills and Commands
        CategoryChanged: Fired when a category is selected
    """

    class ContentTypeChanged(Message):
        """Content type changed (skills/commands)."""

        def __init__(self, content_type: str) -> None:
            super().__init__()
            self.content_type = content_type

    class CategoryChanged(Message):
        """Category selection changed."""

        def __init__(self, category: str | None) -> None:
            super().__init__()
            self.category = category

    def __init__(
        self,
        commands_label: str = "Commands",
        id: str | None = None,
    ) -> None:
        super().__init__(id=id)
        self._content_type = "skills"
        self._active_category: str | None = None
        self._commands_label = commands_label

    @property
    def content_type(self) -> str:
        return self._content_type

    @property
    def active_category(self) -> str | None:
        return self._active_category

    def compose(self):
        with Horizontal(id="sidebar-toggle"):
            yield Button("◉ Skills", id="btn-skills", classes="-active")
            yield Button(f"○ {self._commands_label}", id="btn-commands")
        yield Static("─" * 20, id="sidebar-sep")
        yield ListView(id="category-list")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-skills" and self._content_type != "skills":
            self._switch_content("skills")
        elif event.button.id == "btn-commands" and self._content_type != "commands":
            self._switch_content("commands")

    def _switch_content(self, content_type: str) -> None:
        self._content_type = content_type
        self._active_category = None

        try:
            skills_btn = self.query_one("#btn-skills", Button)
            commands_btn = self.query_one("#btn-commands", Button)

            if content_type == "skills":
                skills_btn.label = "◉ Skills"
                skills_btn.add_class("-active")
                commands_btn.label = f"○ {self._commands_label}"
                commands_btn.remove_class("-active")
            else:
                skills_btn.label = "○ Skills"
                skills_btn.remove_class("-active")
                commands_btn.label = f"◉ {self._commands_label}"
                commands_btn.add_class("-active")
        except NoMatches:
            pass

        self.post_message(self.ContentTypeChanged(content_type))

    def update_categories(self, categories: list[tuple[str, int]]) -> None:
        """Update the category list with names and counts.

        Args:
            categories: List of (category_raw_name, count) tuples
        """
        self._active_category = None

        try:
            cat_list = self.query_one("#category-list", ListView)
            cat_list.clear()

            # "All" with total count
            total = sum(c for _, c in categories)
            all_item = CategoryItem(None, "All", total)
            all_item.set_active(True)
            cat_list.append(all_item)

            # Individual categories
            for name, count in categories:
                label = get_category_label(name)
                cat_list.append(CategoryItem(name, label, count))
        except NoMatches:
            pass

    def on_list_view_selected(self, event: ListView.Selected) -> None:
        """Handle category item selection (Enter or click)."""
        if isinstance(event.item, CategoryItem):
            self._select_category(event.item.category)

    def _select_category(self, category: str | None) -> None:
        if category == self._active_category:
            return

        try:
            cat_list = self.query_one("#category-list", ListView)
            for child in cat_list.children:
                if isinstance(child, CategoryItem):
                    child.set_active(child.category == category)
        except NoMatches:
            pass

        self._active_category = category
        self.post_message(self.CategoryChanged(category))

    def reset(self) -> None:
        """Reset to All category."""
        self._select_category(None)
        try:
            cat_list = self.query_one("#category-list", ListView)
            cat_list.index = 0
        except NoMatches:
            pass
