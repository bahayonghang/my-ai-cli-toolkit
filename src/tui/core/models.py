"""
TUI 数据模型

定义 TUI 使用的核心数据结构。
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path


class ItemType(Enum):
    """项目类型枚举"""
    SKILL = "skill"
    COMMAND = "command"


class InstallStatus(Enum):
    """安装状态枚举"""
    INSTALLED = "installed"
    NOT_INSTALLED = "not_installed"
    OUTDATED = "outdated"  # 已安装但源文件更新


@dataclass
class ItemInfo:
    """通用项目信息模型

    Attributes:
        name: 项目名称
        item_type: 项目类型 (SKILL 或 COMMAND)
        description: 项目描述 (可选)
        status: 安装状态
        source_path: 源文件路径 (可选)
        target_path: 目标安装路径 (可选)
        source_mtime: 源文件修改时间 (可选)
        target_mtime: 目标文件修改时间 (可选)
        category: 技能分类 (可选，仅适用于 SKILL 类型)
        tags: 技能标签列表 (仅适用于 SKILL 类型)
    """
    name: str
    item_type: ItemType
    description: str | None = None
    status: InstallStatus = InstallStatus.NOT_INSTALLED
    source_path: Path | None = None
    target_path: Path | None = None
    source_mtime: datetime | None = None
    target_mtime: datetime | None = None
    category: str | None = None
    tags: list[str] = field(default_factory=list)

    @property
    def is_installed(self) -> bool:
        """检查是否已安装"""
        return self.status in (InstallStatus.INSTALLED, InstallStatus.OUTDATED)

    @property
    def needs_update(self) -> bool:
        """检查是否需要更新"""
        return self.status == InstallStatus.OUTDATED


@dataclass
class InstallResult:
    """安装结果

    Attributes:
        success: 是否成功
        item_name: 项目名称
        message: 结果消息
        error: 错误信息 (可选)
    """
    success: bool
    item_name: str
    message: str
    error: str | None = None
