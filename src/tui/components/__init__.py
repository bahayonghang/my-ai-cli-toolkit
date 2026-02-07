"""
TUI UI components module.

Contains:
- Header: Top title bar
- Footer: Bottom status bar
- SelectableItem: Selectable list item
- ItemListView: Generic list view
- CategorySidebar: Left sidebar with category navigation
- InstallModal: Install path configuration modal
- DetailModal: Skill/command detail view modal
"""

from .category_filter import get_category_label
from .category_sidebar import CategoryItem, CategorySidebar
from .detail_modal import DetailModal
from .footer import Footer
from .header import Header
from .install_modal import InstallConfig, InstallModal
from .item_list import ItemListView, SelectableItem

__all__ = [
    "Header",
    "Footer",
    "SelectableItem",
    "ItemListView",
    "CategorySidebar",
    "CategoryItem",
    "InstallModal",
    "InstallConfig",
    "DetailModal",
    "get_category_label",
]
