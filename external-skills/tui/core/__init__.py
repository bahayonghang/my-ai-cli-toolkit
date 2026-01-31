"""
External Skills TUI 核心业务逻辑模块

包含:
- models: 数据模型 (ExternalSkillInfo, DependencyCheckResult, DependencyStatus, InstallResult)
- manager: ExternalSkillManager 封装 install.py 的业务逻辑

Requirements: 10.1, 10.4
"""

from .manager import ExternalSkillManager
from .models import (
    DependencyCheckResult,
    DependencyStatus,
    ExternalSkillInfo,
    InstallResult,
)

__all__ = [
    "ExternalSkillInfo",
    "DependencyCheckResult",
    "DependencyStatus",
    "InstallResult",
    "ExternalSkillManager",
]
