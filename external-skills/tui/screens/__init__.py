"""
External Skills TUI 屏幕视图模块

包含:
- PlatformSelectScreen: 平台选择屏幕 (Requirements: 1.1-1.4)
- MainScreen: 主界面屏幕 (Requirements: 2.1-2.4, 3.1-3.3, 4.1-4.4, 5.1-5.6, 6.1-6.4, 7.1-7.2)

Requirements: 10.4
"""

from .platform_select import PlatformSelectScreen
from .main_screen import MainScreen

__all__ = [
    "PlatformSelectScreen",
    "MainScreen",
]
