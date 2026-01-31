"""主界面屏幕

显示技能列表，支持搜索、安装、依赖检查和详情查看功能。

Requirements: 5.1, 4.1, 3.1, 6.1, 7.1
"""


from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Container, Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Input, ProgressBar, RichLog, Static

from ..components.skill_list import SkillListView
from ..core.manager import ExternalSkillManager
from ..core.models import ExternalSkillInfo


class MainScreen(Screen):
    """主界面屏幕

    集成 SkillListView，实现搜索、安装、依赖检查和详情查看功能。

    Requirements:
    - 5.1: 按 i 键安装当前高亮的技能
    - 4.1: 按 c 键检查当前高亮技能的依赖
    - 3.1: 按 d 键或 Enter 键显示技能详情
    - 6.1: 按 / 键触发搜索输入框
    - 7.1: 支持键盘快捷键操作
    """

    BINDINGS = [
        Binding("j", "cursor_down", "↓ Down", show=False),
        Binding("k", "cursor_up", "↑ Up", show=False),
        Binding("down", "cursor_down", "Down", show=False),
        Binding("up", "cursor_up", "Up", show=False),
        Binding("enter", "show_detail", "Detail", show=False),
        Binding("d", "show_detail", "d Detail", show=False),
        Binding("i", "install", "i Install", show=False),
        Binding("c", "check_deps", "c Check", show=False),
        Binding("slash", "search", "/ Search", show=False),
        Binding("q", "quit", "q Quit", show=False),
        Binding("escape", "escape_action", "Esc Back", show=False),
    ]

    DEFAULT_CSS = """
    MainScreen {
        background: $background;
        layout: vertical;
    }

    /* 顶部标题区 */
    MainScreen #header-area {
        width: 100%;
        height: 3;
        background: $surface;
        border-bottom: solid $primary;
        align: center middle;
    }

    MainScreen #header-row {
        width: 100%;
        height: 100%;
        padding: 0 2;
    }

    MainScreen #title {
        width: 1fr;
        text-style: bold;
        color: $primary;
    }

    MainScreen #platform-badge {
        width: auto;
        color: $success;
        text-style: bold;
    }

    /* 主内容区 */
    MainScreen #main-container {
        width: 100%;
        height: 1fr;
        padding: 1 2;
    }

    /* 搜索框容器 */
    MainScreen #search-container {
        width: 100%;
        height: auto;
        padding: 0 0 1 0;
    }

    MainScreen #search-container.-hidden {
        display: none;
    }

    MainScreen #search-input {
        width: 100%;
        border: round $panel;
    }

    MainScreen #search-input:focus {
        border: round $accent;
    }

    /* 消息区域 */
    MainScreen #message-container {
        width: 100%;
        height: auto;
        padding: 1 0;
    }

    MainScreen #message-container.-hidden {
        display: none;
    }

    MainScreen #message {
        width: 100%;
        padding: 1 2;
        border: round $panel;
        background: $surface;
    }

    MainScreen #message.-success {
        border: round $success;
        color: $success;
    }

    MainScreen #message.-error {
        border: round $error;
        color: $error;
    }

    MainScreen #message.-warning {
        border: round $warning;
        color: $warning;
    }

    MainScreen #message.-info {
        border: round $primary;
        color: $primary;
    }

    /* 进度区域 */
    MainScreen #progress-container {
        width: 100%;
        height: auto;
        padding: 1 0;
    }

    MainScreen #progress-container.-hidden {
        display: none;
    }

    MainScreen #progress-panel {
        width: 100%;
        padding: 1 2;
        border: round $accent;
        background: $surface;
    }

    MainScreen #progress-header {
        width: 100%;
        height: 1;
        padding: 0 0 1 0;
    }

    MainScreen #progress-title {
        width: 1fr;
        text-style: bold;
        color: $accent;
    }

    MainScreen #progress-status {
        width: auto;
        color: $text-muted;
    }

    MainScreen #progress-bar {
        width: 100%;
        height: 1;
        padding: 0 0 1 0;
    }

    MainScreen #progress-bar Bar {
        width: 100%;
    }

    MainScreen #command-log {
        width: 100%;
        height: 6;
        border: round $panel;
        background: $background;
        padding: 0 1;
    }

    /* 详情面板 */
    MainScreen #detail-container {
        width: 100%;
        height: auto;
        max-height: 50%;
        padding: 1 0;
    }

    MainScreen #detail-container.-hidden {
        display: none;
    }

    MainScreen #detail-panel {
        width: 100%;
        padding: 1 2;
        border: round $accent;
        background: $surface;
    }

    MainScreen #detail-title {
        text-style: bold;
        color: $accent;
        padding: 0 0 1 0;
    }

    MainScreen #detail-content {
        color: $text;
    }

    /* 底部状态栏 */
    MainScreen #footer-area {
        width: 100%;
        height: 1;
        background: $surface;
        border-top: solid $panel;
    }

    MainScreen #footer-row {
        width: 100%;
        height: 1;
        padding: 0 2;
    }

    MainScreen #shortcuts {
        width: 1fr;
        color: $text-muted;
    }

    MainScreen #status {
        width: auto;
        color: $text-muted;
    }
    """

    def __init__(self, platform: str = "claude") -> None:
        """初始化主界面

        Args:
            platform: 目标平台
        """
        super().__init__()
        self._platform = platform
        self._manager: ExternalSkillManager | None = None
        self._search_visible = False
        self._detail_visible = False
        self._message_visible = False
        self._progress_visible = False
        self._installing = False

    @property
    def manager(self) -> ExternalSkillManager:
        """获取技能管理器（懒加载）"""
        if self._manager is None:
            self._manager = ExternalSkillManager(self._platform)
        return self._manager

    def compose(self) -> ComposeResult:
        """组合屏幕组件"""
        # 顶部标题栏
        with Vertical(id="header-area"):
            with Horizontal(id="header-row"):
                yield Static("📦 External Skills Manager", id="title")
                yield Static(f"[{self._platform}]", id="platform-badge")

        # 主内容区
        with Vertical(id="main-container"):
            # 搜索框（默认隐藏）
            with Container(id="search-container", classes="-hidden"):
                yield Input(placeholder="🔍 Search skills... (Esc to close)", id="search-input")

            # 消息区域（默认隐藏）
            with Container(id="message-container", classes="-hidden"):
                yield Static("", id="message")

            # 进度区域（默认隐藏）
            with Container(id="progress-container", classes="-hidden"):
                with Vertical(id="progress-panel"):
                    with Horizontal(id="progress-header"):
                        yield Static("⏳ Installing...", id="progress-title")
                        yield Static("", id="progress-status")
                    yield ProgressBar(total=100, show_eta=False, id="progress-bar")
                    yield RichLog(id="command-log", highlight=True, markup=True)

            # 技能列表
            yield SkillListView(id="skill-list")

            # 详情面板（默认隐藏）
            with Container(id="detail-container", classes="-hidden"):
                with Vertical(id="detail-panel"):
                    yield Static("", id="detail-title")
                    yield Static("", id="detail-content")

        # 底部状态栏
        with Vertical(id="footer-area"):
            with Horizontal(id="footer-row"):
                yield Static("↑↓/jk Navigate  Enter/d Detail  i Install  c Check  / Search  Esc Back  q Quit", id="shortcuts")
                yield Static("", id="status")

    def on_mount(self) -> None:
        """屏幕挂载时加载数据"""
        self._load_skills()
        self.query_one("#skill-list", SkillListView).focus()

    def _load_skills(self) -> None:
        """加载技能列表"""
        try:
            skills = self.manager.get_skills()
            skill_list = self.query_one("#skill-list", SkillListView)
            skill_list.load_skills(skills)
            self._update_status(f"{len(skills)} skills")
        except FileNotFoundError as e:
            self._show_message(f"❌ 配置文件不存在: {e}", "error")
        except ValueError as e:
            self._show_message(f"❌ 配置文件格式错误: {e}", "error")
        except Exception as e:
            self._show_message(f"❌ 加载失败: {e}", "error")

    def _get_skill_list(self) -> SkillListView:
        """获取技能列表组件"""
        return self.query_one("#skill-list", SkillListView)

    def _get_focused_skill(self) -> ExternalSkillInfo | None:
        """获取当前高亮的技能"""
        return self._get_skill_list().get_focused_skill()

    def _show_message(self, message: str, level: str = "info") -> None:
        """显示消息

        Args:
            message: 消息内容
            level: 消息级别 (info, success, warning, error)
        """
        message_container = self.query_one("#message-container")
        message_widget = self.query_one("#message", Static)

        # 移除旧的级别样式
        message_widget.remove_class("-info", "-success", "-warning", "-error")
        message_widget.add_class(f"-{level}")

        message_widget.update(message)
        message_container.remove_class("-hidden")
        self._message_visible = True

    def _hide_message(self) -> None:
        """隐藏消息"""
        message_container = self.query_one("#message-container")
        message_container.add_class("-hidden")
        self._message_visible = False

    def _update_status(self, status: str) -> None:
        """更新状态栏"""
        self.query_one("#status", Static).update(status)

    def _show_detail(self, skill: ExternalSkillInfo) -> None:
        """显示技能详情

        Args:
            skill: 技能信息

        Requirements: 3.1, 3.2
        """
        detail_container = self.query_one("#detail-container")
        detail_title = self.query_one("#detail-title", Static)
        detail_content = self.query_one("#detail-content", Static)

        # 类型图标
        type_icons = {
            "npm-cli": "📦",
            "npx": "⚡",
            "pip-cli": "🐍",
            "git": "🔗",
        }
        icon = type_icons.get(skill.skill_type, "📦")

        # 标题
        detail_title.update(f"{icon} {skill.name}")

        # 内容
        lines = [
            f"📝 Description: {skill.description}",
            f"📦 Type: {skill.skill_type}",
            f"📍 Package: {skill.package}",
            f"🔧 Requires: {', '.join(skill.requires) if skill.requires else 'None'}",
            f"🎯 Platforms: {', '.join(skill.supported_targets)}",
            f"🏠 Homepage: {skill.homepage or 'N/A'}",
            f"📜 License: {skill.license or 'N/A'}",
            f"✅ Supported: {'Yes' if skill.is_supported else 'No'}",
        ]
        detail_content.update("\n".join(lines))

        detail_container.remove_class("-hidden")
        self._detail_visible = True

    def _hide_detail(self) -> None:
        """隐藏详情面板

        Requirements: 3.3
        """
        detail_container = self.query_one("#detail-container")
        detail_container.add_class("-hidden")
        self._detail_visible = False

    def _show_progress(self, skill_name: str) -> None:
        """显示进度面板

        Args:
            skill_name: 正在安装的技能名称

        Requirements: 8.1, 8.2, 5.4
        """
        progress_container = self.query_one("#progress-container")
        progress_title = self.query_one("#progress-title", Static)
        progress_status = self.query_one("#progress-status", Static)
        progress_bar = self.query_one("#progress-bar", ProgressBar)
        command_log = self.query_one("#command-log", RichLog)

        # 重置进度条
        progress_bar.update(total=100, progress=0)

        # 清空日志
        command_log.clear()

        # 设置标题
        progress_title.update(f"⏳ Installing {skill_name}...")
        progress_status.update("Preparing...")

        # 显示进度面板
        progress_container.remove_class("-hidden")
        self._progress_visible = True

    def _update_progress(self, message: str, progress: int = -1) -> None:
        """更新进度显示

        Args:
            message: 进度消息
            progress: 进度百分比 (0-100)，-1 表示不更新进度条

        Requirements: 8.2, 5.4
        """
        if not self._progress_visible:
            return

        try:
            command_log = self.query_one("#command-log", RichLog)
            progress_status = self.query_one("#progress-status", Static)

            # 添加日志
            command_log.write(message)

            # 更新状态
            if message.startswith("[Step"):
                progress_status.update(message.split("]")[0] + "]")
            elif message.startswith("$"):
                progress_status.update("Running command...")

            # 更新进度条
            if progress >= 0:
                progress_bar = self.query_one("#progress-bar", ProgressBar)
                progress_bar.update(progress=progress)
        except Exception:
            pass

    def _hide_progress(self) -> None:
        """隐藏进度面板"""
        progress_container = self.query_one("#progress-container")
        progress_container.add_class("-hidden")
        self._progress_visible = False

    def _complete_progress(self, success: bool, message: str) -> None:
        """完成进度显示

        Args:
            success: 是否成功
            message: 完成消息

        Requirements: 5.5
        """
        if not self._progress_visible:
            return

        try:
            progress_title = self.query_one("#progress-title", Static)
            progress_status = self.query_one("#progress-status", Static)
            progress_bar = self.query_one("#progress-bar", ProgressBar)
            command_log = self.query_one("#command-log", RichLog)

            if success:
                progress_title.update("✅ Installation Complete")
                progress_status.update("Success!")
                progress_bar.update(progress=100)
                command_log.write(f"[green]✅ {message}[/green]")
            else:
                progress_title.update("❌ Installation Failed")
                progress_status.update("Failed")
                command_log.write(f"[red]❌ {message}[/red]")
        except Exception:
            pass

    # ==================== Actions ====================

    def action_cursor_down(self) -> None:
        """向下移动光标

        Requirements: 7.1 (j/↓)
        """
        self._get_skill_list().action_cursor_down()

    def action_cursor_up(self) -> None:
        """向上移动光标

        Requirements: 7.1 (k/↑)
        """
        self._get_skill_list().action_cursor_up()

    def action_show_detail(self) -> None:
        """显示技能详情

        Requirements: 3.1 (d/Enter)
        """
        skill = self._get_focused_skill()
        if skill is None:
            self._show_message("⚠️ 请先选择一个技能", "warning")
            return

        if self._detail_visible:
            self._hide_detail()
        else:
            self._show_detail(skill)

    def action_install(self) -> None:
        """安装当前高亮的技能

        Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.1, 8.2
        """
        # 防止重复安装
        if self._installing:
            self._show_message("⚠️ 安装正在进行中...", "warning")
            return

        skill = self._get_focused_skill()
        if skill is None:
            self._show_message("⚠️ 请先选择一个技能", "warning")
            return

        if not skill.is_supported:
            self._show_message(f"⚠️ 技能 {skill.name} 不支持平台 {self._platform}", "warning")
            return

        # 设置安装状态
        self._installing = True

        # 隐藏其他面板
        self._hide_message()
        self._hide_detail()

        # 显示进度面板
        self._show_progress(skill.name)

        # 定义进度回调
        step_progress = {"current": 0}

        def on_output(msg: str) -> None:
            """处理安装输出回调

            Requirements: 8.2 - 显示当前正在执行的命令
            """
            # 根据消息类型更新进度
            if msg.startswith("[Step 1]"):
                step_progress["current"] = 25
            elif msg.startswith("[Step 2]"):
                step_progress["current"] = 50
            elif msg.startswith("$"):
                step_progress["current"] = min(step_progress["current"] + 10, 90)

            self._update_progress(msg, step_progress["current"])

        # 执行安装
        result = self.manager.install_skill(
            skill.name,
            on_output=on_output,
        )

        # 显示安装结果 (Requirements: 5.5)
        if result.success:
            self._complete_progress(True, result.message)
            self._show_message(f"✅ {result.message}", "success")
        else:
            self._complete_progress(False, result.error or "安装失败")
            self._show_message(f"❌ {result.error}", "error")

        # 重置安装状态
        self._installing = False

    def action_check_deps(self) -> None:
        """检查当前高亮技能的依赖

        Requirements: 4.1, 4.2, 4.3, 4.4
        """
        skill = self._get_focused_skill()
        if skill is None:
            self._show_message("⚠️ 请先选择一个技能", "warning")
            return

        try:
            result = self.manager.check_dependencies(skill.name)

            if result.all_satisfied:
                self._show_message(f"✅ 技能 {skill.name} 的所有依赖已满足", "success")
            else:
                # 构建依赖状态列表
                status_lines = []
                for dep in result.dependencies:
                    status = "✓" if dep.satisfied else "✗"
                    status_lines.append(f"  {status} {dep.name}")

                missing = [d.name for d in result.dependencies if not d.satisfied]
                self._show_message(
                    f"❌ 技能 {skill.name} 缺少依赖: {', '.join(missing)}\n" +
                    "\n".join(status_lines),
                    "error"
                )
        except ValueError as e:
            self._show_message(f"❌ {e}", "error")

    def action_search(self) -> None:
        """显示搜索框

        Requirements: 6.1
        """
        search_container = self.query_one("#search-container")
        search_input = self.query_one("#search-input", Input)

        if not self._search_visible:
            search_container.remove_class("-hidden")
            self._search_visible = True

        search_input.focus()

    def action_escape_action(self) -> None:
        """Escape 键行为

        Requirements: 3.3, 6.4, 7.1
        - 搜索模式下：清除搜索并关闭搜索框
        - 详情模式下：关闭详情面板
        - 进度显示时：隐藏进度面板（仅在安装完成后）
        - 消息显示时：隐藏消息
        - 否则：返回平台选择界面
        """
        if self._search_visible:
            # 关闭搜索
            search_container = self.query_one("#search-container")
            search_input = self.query_one("#search-input", Input)

            search_container.add_class("-hidden")
            self._search_visible = False
            search_input.value = ""

            self._get_skill_list().clear_filter()
            self._get_skill_list().focus()
        elif self._detail_visible:
            # 关闭详情
            self._hide_detail()
            self._get_skill_list().focus()
        elif self._progress_visible and not self._installing:
            # 关闭进度面板（仅在安装完成后）
            self._hide_progress()
            self._get_skill_list().focus()
        elif self._message_visible:
            # 隐藏消息
            self._hide_message()
        else:
            # 返回平台选择界面
            self.app.pop_screen()

    def action_quit(self) -> None:
        """退出应用

        Requirements: 7.1 (q)
        """
        self.app.exit()

    # ==================== Event Handlers ====================

    def on_input_changed(self, event: Input.Changed) -> None:
        """处理搜索输入变化

        Requirements: 6.2, 6.3
        """
        if event.input.id == "search-input":
            self._get_skill_list().filter_skills(event.value)

    def on_input_submitted(self, event: Input.Submitted) -> None:
        """处理搜索输入提交"""
        if event.input.id == "search-input":
            self._get_skill_list().focus()

    def on_skill_list_view_skill_highlighted(
        self, event: SkillListView.SkillHighlighted
    ) -> None:
        """处理技能高亮变化事件"""
        if event.skill:
            self._update_status(f"Selected: {event.skill.name}")
            # 如果详情面板打开，更新详情
            if self._detail_visible:
                self._show_detail(event.skill)
