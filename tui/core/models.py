"""
TUI 数据模型

定义 TUI 使用的核心数据结构。
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional


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
    """
    name: str
    item_type: ItemType
    description: Optional[str] = None
    status: InstallStatus = InstallStatus.NOT_INSTALLED
    source_path: Optional[Path] = None
    target_path: Optional[Path] = None
    source_mtime: Optional[datetime] = None
    target_mtime: Optional[datetime] = None
    
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
    error: Optional[str] = None
