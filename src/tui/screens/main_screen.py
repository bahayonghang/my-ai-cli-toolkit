"""主界面屏幕 - 简洁版

CCR 风格的紧凑布局，优化性能。
"""

from textual import work
from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Container, Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Input, ProgressBar, Static, TabbedContent, TabPane
from textual.worker import Worker, WorkerState

from ..components.category_filter import CategoryFilterBar
from ..components.footer import Footer
from ..components.header import Header
from ..components.item_list import ItemListView, SelectableItem
from ..core.manager import TUIManager
from ..core.models import InstallStatus


class MainScreen(Screen):
    """主界面 - 简洁紧凑设计"""

    BINDINGS = [
        Binding("tab", "next_tab", "Tab Switch", show=False),
        Binding("enter", "install_focused", "Install", show=False),
        Binding("i", "install_selected", "i Install", show=False),
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

    def __init__(
        self,
        platform: str = "claude",
        project_path: str | None = None
    ) -> None:
        super().__init__()
        self._platform = platform
        self._project_path = project_path
        self._manager: TUIManager | None = None
        self._search_visible = False
        self._installing = False  # 安装进行中标志

    @property
    def manager(self) -> TUIManager:
        if self._manager is None:
            self._manager = TUIManager(
                self._platform,
                project_path=self._project_path
            )
        return self._manager

    def _get_commands_tab_label(self) -> str:
        """根据平台返回第二个 Tab 的标签名"""
        if self._platform == "antigravity":
            return "Workflows"
        elif self._platform == "codex":
            return "Prompts"
        elif self._platform == "kiro":
            return "Steering"
        return "Commands"

    def compose(self) -> ComposeResult:
        yield Header(
            platform=self._platform,
            project_path=self._project_path,
        )
        with Vertical(id="main-container"):
            with Container(id="search-container", classes="-hidden"):
                yield Input(placeholder="Search... (Esc)", id="search-input")
            # Category filter bar (Skills tab only, hidden by default until data loads)
            yield CategoryFilterBar(categories=[], id="category-filter")
            with Container(id="content-area"):
                with TabbedContent(id="tabs"):
                    with TabPane("Skills", id="skills-tab"):
                        yield ItemListView(item_type="skills", id="skills-list")
                    with TabPane(self._get_commands_tab_label(), id="commands-tab"):
                        yield ItemListView(item_type="commands", id="commands-list")
            # 进度条区域（默认隐藏）
            with Container(id="progress-container", classes="-hidden"):
                with Horizontal(id="progress-row"):
                    yield Static("Installing...", id="progress-label")
                    yield ProgressBar(total=100, show_eta=False, id="progress-bar")
                    yield Static("0/0", id="progress-count")
        yield Footer()

    def on_mount(self) -> None:
        self._refresh_data()
        self.query_one("#skills-list", ItemListView).focus()

    def _refresh_data(self) -> None:
        header = self.query_one(Header)
        header.set_platform(
            self._platform,
            project_path=self._project_path,
        )

        skills_list = self.query_one("#skills-list", ItemListView)
        if self.manager.check_skills_source_exists():
            skills_list.load_items(self.manager.get_skills())
            # Initialize category filter bar with available categories
            self._init_category_filter()
        else:
            skills_list.load_items([])
            self._show_message("Skills dir not found", "error")

        commands_list = self.query_one("#commands-list", ItemListView)
        if self.manager.check_commands_source_exists():
            commands_list.load_items(self.manager.get_commands())
        else:
            commands_list.load_items([])

        self.query_one(Footer).update_selection_count(0)
        self._update_installed_count()

    def _init_category_filter(self) -> None:
        """Initialize category filter bar with available categories."""
        try:
            filter_bar = self.query_one("#category-filter", CategoryFilterBar)
            categories = self.manager.get_all_categories()
            # Update categories dynamically
            filter_bar.update_categories(categories)
        except Exception as e:
            # Log error for debugging
            self._show_message(f"Filter init error: {e}", "warning")

    def _get_active_list(self) -> ItemListView:
        tabs = self.query_one("#tabs", TabbedContent)
        if tabs.active == "commands-tab":
            return self.query_one("#commands-list", ItemListView)
        return self.query_one("#skills-list", ItemListView)

    def _show_message(self, message: str, level: str = "info") -> None:
        self.query_one(Footer).show_message(message, level)

    def _update_selection_count(self) -> None:
        count = len(self._get_active_list().get_selected_items())
        self.query_one(Footer).update_selection_count(count)

    def _update_installed_count(self) -> None:
        """更新当前列表的已安装统计"""
        active_list = self._get_active_list()
        items = active_list.items
        installed = sum(1 for item in items if item.installed)
        outdated = sum(1 for item in items if item.needs_update)
        total = len(items)
        self.query_one(Footer).update_installed_count(installed, total, outdated)

    def action_next_tab(self) -> None:
        tabs = self.query_one("#tabs", TabbedContent)
        if tabs.active == "skills-tab":
            tabs.active = "commands-tab"
            self.query_one("#commands-list", ItemListView).focus()
            self._hide_category_filter()
        else:
            tabs.active = "skills-tab"
            self.query_one("#skills-list", ItemListView).focus()
            self._show_category_filter()
        self._update_selection_count()
        self._update_installed_count()

    def _show_category_filter(self) -> None:
        """Show the category filter bar."""
        try:
            filter_bar = self.query_one("#category-filter", CategoryFilterBar)
            filter_bar.remove_class("-hidden")
        except Exception:
            pass

    def _hide_category_filter(self) -> None:
        """Hide the category filter bar."""
        try:
            filter_bar = self.query_one("#category-filter", CategoryFilterBar)
            filter_bar.add_class("-hidden")
        except Exception:
            pass

    def on_category_filter_bar_category_changed(
        self, event: CategoryFilterBar.CategoryChanged
    ) -> None:
        """Handle category filter change."""
        skills_list = self.query_one("#skills-list", ItemListView)
        skills_list.filter_by_category(event.category)
        self._update_installed_count()

    def action_cursor_down(self) -> None:
        self._get_active_list().action_cursor_down()

    def action_cursor_up(self) -> None:
        self._get_active_list().action_cursor_up()

    def action_install_focused(self) -> None:
        active_list = self._get_active_list()
        focused = active_list.get_focused_item()

        if focused is None:
            self._show_message("No item focused", "warning")
            return

        item_name = focused.item_name
        is_skill = active_list.item_type == "skills"

        self._show_message(f"Installing {item_name}...", "info")

        if is_skill:
            result = self.manager.install_skill(item_name)
        else:
            result = self.manager.install_command(item_name)

        if result.success:
            focused.update_install_status(InstallStatus.INSTALLED)
            self._show_message(f"Installed {item_name}", "success")
            self._update_installed_count()
        else:
            self._show_message(result.message, "error")

    def action_select_all(self) -> None:
        """全选当前列表（仅选择，不安装）"""
        active_list = self._get_active_list()
        active_list.select_all()
        self._update_selection_count()
        count = len(active_list.get_selected_items())
        self._show_message(f"Selected {count} items (press i to install)", "info")

    def action_install_selected(self) -> None:
        """安装选中项（异步）"""
        if self._installing:
            self._show_message("Installation in progress...", "warning")
            return

        active_list = self._get_active_list()
        selected = active_list.get_selected_items()

        if not selected:
            self._show_message("No items selected (use Space or a)", "warning")
            return

        # 开始异步安装
        self._start_batch_install(selected)

    def _start_batch_install(self, items: list[SelectableItem]) -> None:
        """启动批量异步安装"""
        self._installing = True
        total = len(items)

        # 显示进度条
        progress_container = self.query_one("#progress-container")
        progress_container.remove_class("-hidden")

        progress_bar = self.query_one("#progress-bar", ProgressBar)
        progress_bar.update(total=total, progress=0)

        progress_count = self.query_one("#progress-count", Static)
        progress_count.update(f"0/{total}")

        progress_label = self.query_one("#progress-label", Static)
        progress_label.update("Installing...")

        # 启动异步安装 worker
        self._run_batch_install(items)

    @work(exclusive=True, thread=True)
    def _run_batch_install(self, items: list[SelectableItem]) -> dict:
        """在后台线程中执行批量安装"""
        active_list = self._get_active_list()
        is_skill = active_list.item_type == "skills"

        total = len(items)
        success_count = 0
        results = []

        for i, item in enumerate(items):
            # 执行安装
            if is_skill:
                result = self.manager.install_skill(item.item_name)
            else:
                result = self.manager.install_command(item.item_name)

            if result.success:
                success_count += 1
                results.append((item, True))
            else:
                results.append((item, False))

            # 通过 call_from_thread 更新 UI
            self.app.call_from_thread(
                self._update_install_progress,
                i + 1,
                total,
                item.item_name,
                result.success
            )

        return {"success": success_count, "total": total, "results": results}

    def _update_install_progress(
        self,
        current: int,
        total: int,
        item_name: str,
        success: bool
    ) -> None:
        """更新安装进度（在主线程中调用）"""
        try:
            progress_bar = self.query_one("#progress-bar", ProgressBar)
            progress_bar.update(progress=current)

            progress_count = self.query_one("#progress-count", Static)
            progress_count.update(f"{current}/{total}")

            progress_label = self.query_one("#progress-label", Static)
            status_icon = "✓" if success else "✗"
            progress_label.update(f"{status_icon} {item_name}")

            # 更新列表项状态
            if success:
                active_list = self._get_active_list()
                for item in active_list.items:
                    if item.item_name == item_name:
                        item.update_install_status(InstallStatus.INSTALLED)
                        break
        except Exception:
            pass

    def on_worker_state_changed(self, event: Worker.StateChanged) -> None:
        """处理 worker 状态变化"""
        if event.state == WorkerState.SUCCESS:
            self._on_batch_install_complete(event.worker.result)
        elif event.state == WorkerState.ERROR:
            self._on_batch_install_error()

    def _on_batch_install_complete(self, result: dict) -> None:
        """批量安装完成回调"""
        self._installing = False

        # 隐藏进度条
        progress_container = self.query_one("#progress-container")
        progress_container.add_class("-hidden")

        # 取消所有选择
        active_list = self._get_active_list()
        active_list.deselect_all()
        self._update_selection_count()
        self._update_installed_count()

        # 显示完成消息
        success = result.get("success", 0)
        total = result.get("total", 0)
        self._show_message(f"Installed {success}/{total} items", "success")

    def _on_batch_install_error(self) -> None:
        """批量安装出错回调"""
        self._installing = False

        # 隐藏进度条
        progress_container = self.query_one("#progress-container")
        progress_container.add_class("-hidden")

        self._show_message("Installation failed", "error")

    def action_toggle_selection(self) -> None:
        self._get_active_list().toggle_focused_selection()
        self._update_selection_count()

    def action_search(self) -> None:
        search_container = self.query_one("#search-container")
        search_input = self.query_one("#search-input", Input)

        if not self._search_visible:
            search_container.remove_class("-hidden")
            self._search_visible = True
        search_input.focus()

    def action_escape_action(self) -> None:
        """ESC 键行为：搜索模式下清除搜索，否则返回平台选择"""
        if self._search_visible:
            # 搜索模式下，清除搜索
            search_container = self.query_one("#search-container")
            search_input = self.query_one("#search-input", Input)

            search_container.add_class("-hidden")
            self._search_visible = False
            search_input.value = ""

            self._get_active_list().clear_filter()
            self._get_active_list().focus()
        else:
            # 非搜索模式，返回平台选择界面
            self.app.pop_screen()

    def action_quit(self) -> None:
        self.app.exit()

    def on_input_changed(self, event: Input.Changed) -> None:
        if event.input.id == "search-input":
            self._get_active_list().filter_items(event.value)

    def on_input_submitted(self, event: Input.Submitted) -> None:
        if event.input.id == "search-input":
            self._get_active_list().focus()

    def on_item_list_view_selection_count_changed(
        self, event: ItemListView.SelectionCountChanged
    ) -> None:
        self.query_one(Footer).update_selection_count(event.count)
