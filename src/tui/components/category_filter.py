"""Category Filter Component

Horizontal category filter bar for skills filtering.
Requirements: Filter skills by category, combinable with text search.
"""

from textual.containers import Horizontal
from textual.message import Message
from textual.widgets import Button, Static

# Category display label mapping (raw category -> display label)
CATEGORY_LABELS = {
    # Skill categories
    "academic-writing": "Academic",
    "visual-design": "Visual",
    "development-tools": "DevTools",
    "ai-orchestration": "AI/Agent",
    "content-creation": "Content",
    "research": "Research",
    "automation": "Automation",
    # Command directory categories
    "cc": "CC",
    "cli": "CLI",
    "gh": "GitHub",
    "issue": "Issue",
    "kiro": "Kiro",
    "memory": "Memory",
    "task": "Task",
    "workflow": "Workflow",
    "zcf": "ZCF",
    "general": "General",
}


def get_category_label(category: str) -> str:
    """Get display label for a category.

    Args:
        category: Raw category name from SKILL.md or directory name

    Returns:
        Human-readable display label
    """
    if category in CATEGORY_LABELS:
        return CATEGORY_LABELS[category]
    # Short names (<=3 chars) → uppercase (e.g. directory abbreviations)
    if len(category) <= 3:
        return category.upper()
    # Fallback: capitalize and replace hyphens with spaces
    return category.replace("-", " ").title()


class CategoryButton(Button):
    """Individual category toggle button."""

    DEFAULT_CSS = """
    CategoryButton {
        min-width: 10;
        height: 1;
        padding: 0 2;
        margin: 0 1 0 0;
        border: none;
        background: $panel;
        color: $foreground;
    }

    CategoryButton:hover {
        background: $surface-lighten-1;
        color: $primary;
    }

    CategoryButton.-active {
        background: $accent;
        color: $background;
        text-style: bold;
    }

    CategoryButton:focus {
        background: $primary;
        color: $background;
    }
    """

    def __init__(
        self,
        category: str | None,
        label: str,
        active: bool = False,
        id: str | None = None,
    ) -> None:
        """Initialize category button.

        Args:
            category: Category value (None for "All")
            label: Display label
            active: Whether this button is currently active
            id: Widget ID
        """
        super().__init__(label, id=id)
        self.category = category
        if active:
            self.add_class("-active")

    @property
    def is_active(self) -> bool:
        """Check if button is active."""
        return self.has_class("-active")

    def set_active(self, active: bool) -> None:
        """Set active state."""
        if active:
            self.add_class("-active")
        else:
            self.remove_class("-active")


class CategoryFilterBar(Horizontal):
    """Horizontal scrollable category filter bar.

    Displays category buttons for filtering skills.
    Only one category can be active at a time.
    """

    DEFAULT_CSS = """
    CategoryFilterBar {
        width: 100%;
        height: 3;
        padding: 0 1;
        background: $surface;
        overflow-x: auto;
        overflow-y: hidden;
    }

    CategoryFilterBar.-hidden {
        display: none;
    }
    """

    class CategoryChanged(Message):
        """Message sent when category selection changes."""

        def __init__(self, category: str | None) -> None:
            """Initialize message.

            Args:
                category: Selected category (None for "All")
            """
            super().__init__()
            self.category = category

    def __init__(
        self,
        categories: list[str],
        id: str | None = None,
    ) -> None:
        """Initialize filter bar.

        Args:
            categories: List of available categories
            id: Widget ID
        """
        super().__init__(id=id)
        self._categories = categories
        self._active_category: str | None = None
        self._buttons: dict[str | None, CategoryButton] = {}

    def compose(self):
        """Compose the filter bar with category buttons."""
        # Clear buttons dict at the start of compose to ensure consistency
        # This is critical because update_categories() clears _buttons before
        # refresh(recompose=True) is called, and compose() must rebuild it
        self._buttons.clear()

        # Always create "All" button first (active by default)
        all_btn = CategoryButton(category=None, label="All", active=True, id="cat-all")
        self._buttons[None] = all_btn
        yield all_btn

        # Add category buttons if any were provided at init time
        for i, category in enumerate(self._categories):
            label = get_category_label(category)
            btn = CategoryButton(category=category, label=label, active=False, id=f"cat-{i}")
            self._buttons[category] = btn
            yield btn

        # Add placeholder text if no categories (will be replaced by update_categories)
        if not self._categories:
            yield Static("Filter: ", id="filter-label", classes="filter-label")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle category button press."""
        if isinstance(event.button, CategoryButton):
            self._select_category(event.button.category)

    def _select_category(self, category: str | None) -> None:
        """Select a category and update button states.

        Args:
            category: Category to select (None for "All")
        """
        if category == self._active_category:
            return

        # Deactivate previous button
        if self._active_category in self._buttons:
            self._buttons[self._active_category].set_active(False)

        # Activate new button
        self._active_category = category
        if category in self._buttons:
            self._buttons[category].set_active(True)

        # Post message
        self.post_message(self.CategoryChanged(category))

    @property
    def active_category(self) -> str | None:
        """Get currently active category."""
        return self._active_category

    def reset(self) -> None:
        """Reset to "All" category."""
        self._select_category(None)

    def update_categories(self, categories: list[str]) -> None:
        """Update available categories and trigger recompose.

        Args:
            categories: New list of categories
        """
        self._categories = categories
        # Don't clear _buttons here - compose() will handle it when recompose runs
        # This avoids state inconsistency between _buttons.clear() and compose()
        self._active_category = None

        # Trigger refresh with recompose to rebuild the component reliably
        # refresh() is synchronous but schedules recompose for the next render cycle
        self.refresh(recompose=True)
