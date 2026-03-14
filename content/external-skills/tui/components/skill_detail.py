"""技能详情模态框组件 - SkillDetailModal

显示外部技能的完整详细信息，支持 Escape 关闭。

Requirements: 3.2, 3.3
"""

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Static

from ..core.models import ExternalSkillInfo

# 技能类型图标映射
SKILL_TYPE_ICONS = {
    "npm-cli": "📦",
    "npx": "⚡",
    "pip-cli": "🐍",
    "git": "🔗",
}


def render_skill_detail(skill: ExternalSkillInfo) -> str:
    """渲染技能详情为字符串

    将 ExternalSkillInfo 对象渲染为包含所有字段的详情字符串。

    Args:
        skill: 技能信息对象

    Returns:
        渲染后的详情字符串，包含名称、描述、类型、包名、
        依赖列表、支持平台、主页链接和许可证信息

    Requirements: 3.2
    """
    icon = SKILL_TYPE_ICONS.get(skill.skill_type, "📦")

    lines = [
        f"{icon} {skill.name}",
        "",
        f"📝 Description: {skill.description}",
        f"📦 Type: {skill.skill_type}",
        f"🗂️ Group: {skill.group or 'N/A'}",
        f"🏷️ Category: {skill.category or 'N/A'}",
        f"🚚 Provider: {skill.provider or 'N/A'}",
        f"📍 Package: {skill.package}",
        f"🔧 Requires: {', '.join(skill.requires) if skill.requires else 'None'}",
        f"🎯 Platforms: {', '.join(skill.supported_targets) if skill.supported_targets else 'None'}",
        f"🏷️ Tags: {', '.join(skill.tags) if skill.tags else 'None'}",
    ]

    return "\n".join(lines)


class SkillDetailModal(ModalScreen[None]):
    """技能详情模态框

    显示技能的完整详细信息，包括：
    - 名称（带类型图标）
    - 描述
    - 类型 (npm-cli/npx/pip-cli/git)
    - 包名
    - 依赖列表
    - 支持平台
    - 主页链接
    - 许可证

    支持 Escape 键关闭。

    Requirements: 3.2, 3.3
    """

    BINDINGS = [
        Binding("escape", "close", "Close", show=False),
    ]

    DEFAULT_CSS = """
    SkillDetailModal {
        align: center middle;
    }

    SkillDetailModal #modal-container {
        width: 70;
        max-width: 90%;
        height: auto;
        max-height: 80%;
        background: $surface;
        border: round $accent;
        padding: 1 2;
    }

    SkillDetailModal #modal-title {
        width: 100%;
        text-style: bold;
        color: $accent;
        padding: 0 0 1 0;
        text-align: center;
    }

    SkillDetailModal #modal-content {
        width: 100%;
        height: auto;
        padding: 1 0;
        color: $text;
    }

    SkillDetailModal #button-row {
        width: 100%;
        height: auto;
        align: center middle;
        padding: 1 0 0 0;
    }

    SkillDetailModal #close-button {
        min-width: 16;
    }
    """

    def __init__(self, skill: ExternalSkillInfo) -> None:
        """初始化技能详情模态框

        Args:
            skill: 技能信息对象
        """
        super().__init__()
        self.skill = skill

    def compose(self) -> ComposeResult:
        """组合模态框组件

        Returns:
            组件生成器
        """
        with Vertical(id="modal-container"):
            yield Static("📋 Skill Details", id="modal-title")
            yield Static(render_skill_detail(self.skill), id="modal-content")
            with Horizontal(id="button-row"):
                yield Button("Close [Esc]", id="close-button", variant="primary")

    def action_close(self) -> None:
        """关闭模态框

        Requirements: 3.3
        """
        self.dismiss(None)

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """处理按钮点击事件

        Args:
            event: 按钮点击事件
        """
        if event.button.id == "close-button":
            self.dismiss(None)
