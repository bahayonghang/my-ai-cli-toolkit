"""Main Screen - Two-Column Layout

Left sidebar (20%): category navigation with Skills/Commands toggle
Right panel (80%): item list with fixed header
Install via modal dialog with global/directory path selection.
"""

import logging

from textual import work
from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Container, Horizontal, Vertical
from textual.css.query import NoMatches
from textual.screen import Screen
from textual.widgets import Input, ListView, ProgressBar, Static
from textual.worker import Worker, WorkerState

logger = logging.getLogger(__name__)

# Default category for items without an explicit category
DEFAULT_CATEGORY = "general"

from ..components.category_sidebar import CategorySidebar
from ..components.detail_modal import DetailModal
from ..components.footer import Footer
from ..components.header import Header
from ..components.install_modal import InstallConfig, InstallModal
from ..components.item_list import ItemListView
from ..core.manager import TUIManager
from ..core.models import InstallStatus


class MainScreen(Screen):
    """Main screen with two-column layout.

    Left: CategorySidebar (Skills/Commands toggle + category list)
    Right: Content panel (item list)
    """

    BINDINGS = [
        Binding("tab", "next_tab", "Tab Focus", show=False),
        Binding("enter", "install_focused", "Install", show=False),
        Binding("i", "install_selected", "i Install", show=False),
        Binding("d", "show_detail", "d Detail", show=False),
        Binding("a", "select_all", "a Select All", show=False),
        Binding("space", "toggle_selection", "Space Select", show=False),
        Binding("slash", "search", "/ Search", show=False),
        Binding("q", "quit", "q Quit", show=False),
        Binding("escape", "escape_action", "Esc Back", show=False),
        Binding("j", "cursor_down", "j Down", show=False),
        Binding("k", "cursor_up", "k Up", show=False),
        Binding("down", "cursor_down", "↓ Down", show=False),
        Binding("up", "cursor_up", "↑ Up", show=False),
    ]

    def __init__(self, platform: str = "claude") -> None:
        super().__init__()
        self._platform = platform
        self._manager: TUIManager | None = None
        self._search_visible = False
        self._installing = False

    @property
    def manager(self) -> TUIManager:
        if self._manager is None:
            self._manager = TUIManager(self._platform)
        return self._manager

    def _get_commands_tab_label(self) -> str:
        """Get platform-specific label for Commands toggle."""
        labels = {
            "antigravity": "Workflows",
            "codex": "Prompts",
            "kiro": "Steering",
        }
        return labels.get(self._platform, "Commands")

    def compose(self) -> ComposeResult:
        yield Header(platform=self._platform)

        with Vertical(id="main-container"):
            # Search overlay (hidden by default)
            with Container(id="search-container", classes="-hidden"):
                yield Input(placeholder="Search... (Esc)", id="search-input")

            # Two-column layout
            with Horizontal(id="two-column"):
                yield CategorySidebar(
                    commands_label=self._get_commands_tab_label(),
                    id="sidebar",
                )
                with Vertical(id="content-panel"):
                    yield ItemListView(item_type="skills", id="skills-list")
                    yield ItemListView(
                        item_type="commands",
                        id="commands-list",
                        classes="-hidden",
                    )

            # Progress bar area (hidden until batch install)
            with Container(id="progress-container", classes="-hidden"):
                with Horizontal(id="progress-row"):
                    yield Static("Installing...", id="progress-label")
                    yield ProgressBar(total=100, show_eta=False, id="progress-bar")
                    yield Static("0/0", id="progress-count")

        yield Footer()

    # ─── Lifecycle ───

    def on_mount(self) -> None:
        self._refresh_data()
        self.query_one("#skills-list", ItemListView).focus()

    def _refresh_data(self) -> None:
        """Load skills and commands data into their respective lists."""
        # Load skills
        skills_list = self.query_one("#skills-list", ItemListView)
        if self.manager.check_skills_source_exists():
            skills_list.load_items(self.manager.get_skills())
        else:
            skills_list.load_items([])
            self._show_message("Skills dir not found", "error")

        # Load commands
        commands_list = self.query_one("#commands-list", ItemListView)
        if self.manager.check_commands_source_exists():
            commands_list.load_items(self.manager.get_commands())
        else:
            commands_list.load_items([])

        # Initialize sidebar categories
        self._update_sidebar_categories()

        # Update footer stats
        self.query_one(Footer).update_selection_count(0)
        self._update_installed_count()

    # ─── Sidebar Event Handlers ───

    def on_category_sidebar_content_type_changed(self, event: CategorySidebar.ContentTypeChanged) -> None:
        """Handle Skills/Commands toggle in sidebar."""
        if event.content_type == "skills":
            self.query_one("#skills-list").remove_class("-hidden")
            self.query_one("#commands-list").add_class("-hidden")
        else:
            self.query_one("#skills-list").add_class("-hidden")
            self.query_one("#commands-list").remove_class("-hidden")

        # Update sidebar categories for new content type
        self._update_sidebar_categories()

        # Reset category filter on the active list
        active_list = self._get_active_list()
        active_list.filter_by_category(None)
        active_list.focus()

        self._update_installed_count()
        self._update_selection_count()

    def on_category_sidebar_category_changed(self, event: CategorySidebar.CategoryChanged) -> None:
        """Handle category selection in sidebar."""
        active_list = self._get_active_list()
        active_list.filter_by_category(event.category)
        self._update_installed_count()

    # ─── Sidebar Helpers ───

    def _update_sidebar_categories(self) -> None:
        """Update sidebar category list based on current content type."""
        sidebar = self.query_one("#sidebar", CategorySidebar)
        if sidebar.content_type == "skills":
            categories = self._get_skills_categories()
        else:
            categories = self._get_commands_categories()
        sidebar.update_categories(categories)

    def _get_skills_categories(self) -> list[tuple[str, int]]:
        """Get skill categories with counts from loaded data."""
        skills_list = self.query_one("#skills-list", ItemListView)
        cats: dict[str, int] = {}
        for item in skills_list.items:
            cat = item.item_info.category or DEFAULT_CATEGORY
            cats[cat] = cats.get(cat, 0) + 1
        return sorted(cats.items())

    def _get_commands_categories(self) -> list[tuple[str, int]]:
        """Get command categories with counts from loaded data."""
        commands_list = self.query_one("#commands-list", ItemListView)
        cats: dict[str, int] = {}
        for item in commands_list.items:
            cat = item.item_info.category or DEFAULT_CATEGORY
            cats[cat] = cats.get(cat, 0) + 1
        return sorted(cats.items())

    # ─── Active List ───

    def _get_active_list(self) -> ItemListView:
        """Get the currently visible ItemListView."""
        sidebar = self.query_one("#sidebar", CategorySidebar)
        if sidebar.content_type == "commands":
            return self.query_one("#commands-list", ItemListView)
        return self.query_one("#skills-list", ItemListView)

    def _sidebar_has_focus(self) -> bool:
        """Check if sidebar's category list has focus."""
        try:
            cat_list = self.query_one("#sidebar #category-list", ListView)
            return cat_list.has_focus
        except NoMatches:
            return False

    # ─── Status Helpers ───

    def _show_message(self, message: str, level: str = "info") -> None:
        self.query_one(Footer).show_message(message, level)

    def _update_selection_count(self) -> None:
        count = len(self._get_active_list().get_selected_items())
        self.query_one(Footer).update_selection_count(count)

    def _update_installed_count(self) -> None:
        """Update installed count stats in footer."""
        active_list = self._get_active_list()
        items = active_list.items
        installed = sum(1 for item in items if item.installed)
        outdated = sum(1 for item in items if item.needs_update)
        total = len(items)
        self.query_one(Footer).update_installed_count(installed, total, outdated)

    # ─── Navigation Actions ───

    def action_next_tab(self) -> None:
        """Toggle focus between sidebar and content list."""
        if self._sidebar_has_focus():
            self._get_active_list().focus()
        else:
            try:
                cat_list = self.query_one("#sidebar #category-list", ListView)
                cat_list.focus()
            except NoMatches:
                pass

    def action_cursor_down(self) -> None:
        if self._sidebar_has_focus():
            try:
                self.query_one("#sidebar #category-list", ListView).action_cursor_down()
            except NoMatches:
                pass
            return
        self._get_active_list().action_cursor_down()

    def action_cursor_up(self) -> None:
        if self._sidebar_has_focus():
            try:
                self.query_one("#sidebar #category-list", ListView).action_cursor_up()
            except NoMatches:
                pass
            return
        self._get_active_list().action_cursor_up()

    # ─── Selection Actions ───

    def action_toggle_selection(self) -> None:
        self._get_active_list().toggle_focused_selection()
        self._update_selection_count()

    def action_select_all(self) -> None:
        """Select all visible items (without installing)."""
        active_list = self._get_active_list()
        active_list.select_all()
        self._update_selection_count()
        count = len(active_list.get_selected_items())
        self._show_message(f"Selected {count} items (press i to install)", "info")

    # ─── Detail Action ───

    def action_show_detail(self) -> None:
        """Show detail modal for the currently focused item."""
        focused = self._get_active_list().get_focused_item()
        if focused is None:
            self._show_message("No item focused", "warning")
            return
        self.app.push_screen(DetailModal(focused.item_info))

    # ─── Install Actions ───

    def action_install_focused(self) -> None:
        """Install the currently focused item (via modal)."""
        if self._installing:
            self._show_message("Installation in progress...", "warning")
            return

        active_list = self._get_active_list()
        focused = active_list.get_focused_item()

        if focused is None:
            self._show_message("No item focused", "warning")
            return

        # Show install modal for single item
        self.app.push_screen(
            InstallModal(
                platform=self._platform,
                items=[focused.item_name],
            ),
            callback=self._on_install_config,
        )

    def action_install_selected(self) -> None:
        """Install all selected items (via modal)."""
        if self._installing:
            self._show_message("Installation in progress...", "warning")
            return

        active_list = self._get_active_list()
        selected = active_list.get_selected_items()

        if not selected:
            self._show_message("No items selected (use Space or a)", "warning")
            return

        # Show install modal for selected items
        self.app.push_screen(
            InstallModal(
                platform=self._platform,
                items=[item.item_name for item in selected],
            ),
            callback=self._on_install_config,
        )

    def _on_install_config(self, config: InstallConfig | None) -> None:
        """Handle install modal result."""
        if config is None:
            return  # User cancelled

        # Create manager (with optional custom path)
        if config.install_mode == "directory" and config.directory_path:
            install_manager = TUIManager(self._platform, project_path=config.directory_path)
        else:
            install_manager = self.manager

        # Execute install
        if len(config.items) == 1:
            self._do_single_install(config.items[0], install_manager)
        else:
            self._do_batch_install(config.items, install_manager)

    def _do_single_install(self, item_name: str, install_manager: TUIManager) -> None:
        """Install a single item synchronously."""
        active_list = self._get_active_list()
        is_skill = active_list.item_type == "skills"

        self._show_message(f"Installing {item_name}...", "info")

        if is_skill:
            result = install_manager.install_skill(item_name)
        else:
            result = install_manager.install_command(item_name)

        if result.success:
            # Update list status only for global installs
            if install_manager is self.manager:
                for item in active_list.items:
                    if item.item_name == item_name:
                        item.update_install_status(InstallStatus.INSTALLED)
                        break
            self._show_message(f"Installed {item_name}", "success")
            self._update_installed_count()
        else:
            self._show_message(result.message, "error")

    def _do_batch_install(self, item_names: list[str], install_manager: TUIManager) -> None:
        """Start batch install with progress bar."""
        self._installing = True
        total = len(item_names)

        # Show progress bar
        progress_container = self.query_one("#progress-container")
        progress_container.remove_class("-hidden")

        progress_bar = self.query_one("#progress-bar", ProgressBar)
        progress_bar.update(total=total, progress=0)

        self.query_one("#progress-count", Static).update(f"0/{total}")
        self.query_one("#progress-label", Static).update("Installing...")

        # Capture state before launching worker thread (H-1: thread safety)
        active_list = self._get_active_list()
        is_skill = active_list.item_type == "skills"
        is_global = install_manager is self.manager

        # Launch async worker and store reference for identity check (M-2)
        self._batch_worker = self._run_batch_install(item_names, install_manager, is_skill, is_global)

    @work(exclusive=True, thread=True)
    def _run_batch_install(
        self,
        item_names: list[str],
        install_manager: TUIManager,
        is_skill: bool,
        is_global: bool,
    ) -> dict:
        """Execute batch install in background thread."""
        total = len(item_names)
        success_count = 0

        for i, name in enumerate(item_names):
            if is_skill:
                result = install_manager.install_skill(name)
            else:
                result = install_manager.install_command(name)

            if result.success:
                success_count += 1

            self.app.call_from_thread(
                self._update_install_progress,
                i + 1,
                total,
                name,
                result.success,
                is_global,
            )

        return {"success": success_count, "total": total}

    def _update_install_progress(
        self,
        current: int,
        total: int,
        item_name: str,
        success: bool,
        is_global: bool,
    ) -> None:
        """Update install progress (called from main thread)."""
        try:
            self.query_one("#progress-bar", ProgressBar).update(progress=current)
            self.query_one("#progress-count", Static).update(f"{current}/{total}")

            icon = "✓" if success else "✗"
            self.query_one("#progress-label", Static).update(f"{icon} {item_name}")

            # Update list item status for global installs
            if success and is_global:
                active_list = self._get_active_list()
                for item in active_list.items:
                    if item.item_name == item_name:
                        item.update_install_status(InstallStatus.INSTALLED)
                        break
        except NoMatches:
            logger.debug("Progress widget not found during update")

    def on_worker_state_changed(self, event: Worker.StateChanged) -> None:
        """Handle batch install worker state changes."""
        # M-2: Only handle our batch install worker
        if not hasattr(self, "_batch_worker") or event.worker is not self._batch_worker:
            return
        if event.state == WorkerState.SUCCESS:
            self._on_batch_install_complete(event.worker.result)
        elif event.state == WorkerState.ERROR:
            self._on_batch_install_error()

    def _on_batch_install_complete(self, result: dict) -> None:
        """Batch install finished callback."""
        self._installing = False

        # Hide progress bar
        self.query_one("#progress-container").add_class("-hidden")

        # Deselect all and update stats
        active_list = self._get_active_list()
        active_list.deselect_all()
        self._update_selection_count()
        self._update_installed_count()

        success = result.get("success", 0)
        total = result.get("total", 0)
        self._show_message(f"Installed {success}/{total} items", "success")

    def _on_batch_install_error(self) -> None:
        """Batch install error callback."""
        self._installing = False
        self.query_one("#progress-container").add_class("-hidden")
        self._show_message("Installation failed", "error")

    # ─── Search Actions ───

    def action_search(self) -> None:
        search_container = self.query_one("#search-container")
        search_input = self.query_one("#search-input", Input)

        if not self._search_visible:
            search_container.remove_class("-hidden")
            self._search_visible = True
        search_input.focus()

    def action_escape_action(self) -> None:
        """ESC: close search → back to platform select."""
        if self._search_visible:
            self.query_one("#search-container").add_class("-hidden")
            self._search_visible = False
            self.query_one("#search-input", Input).value = ""
            self._get_active_list().clear_filter()
            self._get_active_list().focus()
        else:
            self.app.pop_screen()

    def action_quit(self) -> None:
        self.app.exit()

    def on_input_changed(self, event: Input.Changed) -> None:
        if event.input.id == "search-input":
            self._get_active_list().filter_items(event.value)

    def on_input_submitted(self, event: Input.Submitted) -> None:
        if event.input.id == "search-input":
            self._get_active_list().focus()

    def on_item_list_view_selection_count_changed(self, event: ItemListView.SelectionCountChanged) -> None:
        self.query_one(Footer).update_selection_count(event.count)
