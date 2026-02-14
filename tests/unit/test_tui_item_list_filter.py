"""ItemListView filtering regression tests."""

import asyncio

from textual.app import App, ComposeResult
from textual.containers import Horizontal
from textual.widgets import ListView

from tui.components.category_sidebar import CategorySidebar
from tui.components.item_list import ItemListView, SelectableItem
from tui.core.models import ItemInfo, ItemType


def _build_items() -> list[ItemInfo]:
    return [
        ItemInfo(name="a1", item_type=ItemType.SKILL, category="academic"),
        ItemInfo(name="a2", item_type=ItemType.SKILL, category="academic"),
        ItemInfo(name="b1", item_type=ItemType.SKILL, category="ai"),
    ]


def _visible_item_names(list_view: ItemListView) -> list[str]:
    return [child.item_name for child in list_view.children if isinstance(child, SelectableItem)]


class _ItemListFilterApp(App):
    def compose(self) -> ComposeResult:
        yield ItemListView(id="list")

    def on_mount(self) -> None:
        self.query_one("#list", ItemListView).load_items(_build_items())


class _SidebarFilterApp(App):
    def compose(self) -> ComposeResult:
        with Horizontal():
            yield CategorySidebar(id="sidebar")
            yield ItemListView(id="list")

    def on_mount(self) -> None:
        sidebar = self.query_one("#sidebar", CategorySidebar)
        sidebar.update_categories([("academic", 2), ("ai", 1)])
        self.query_one("#list", ItemListView).load_items(_build_items())

    def on_category_sidebar_category_changed(self, event: CategorySidebar.CategoryChanged) -> None:
        self.query_one("#list", ItemListView).filter_by_category(event.category)


def test_filter_by_category_works_on_first_call() -> None:
    async def _run() -> None:
        app = _ItemListFilterApp()
        async with app.run_test() as pilot:
            await pilot.pause()
            list_view = app.query_one("#list", ItemListView)

            list_view.filter_by_category("academic")
            await pilot.pause()
            await pilot.pause()

            assert _visible_item_names(list_view) == ["a1", "a2"]

    asyncio.run(_run())


def test_sidebar_first_category_click_filters_immediately() -> None:
    async def _run() -> None:
        app = _SidebarFilterApp()
        async with app.run_test(size=(120, 40)) as pilot:
            await pilot.pause()
            category_list = app.query_one("#category-list", ListView)
            list_view = app.query_one("#list", ItemListView)

            # Click "academic" category once (index 0 is "All")
            await pilot.click(category_list.children[1])
            await pilot.pause()
            await pilot.pause()

            assert _visible_item_names(list_view) == ["a1", "a2"]

    asyncio.run(_run())
