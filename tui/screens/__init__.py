"""
TUI 屏幕视图模块

包含:
- PlatformSelectScreen: 平台选择屏幕 (Requirements: 1.1-1.5)
- MainScreen: 主界面屏幕 (Requirements: 2.2-2.6, 6.1-6.2, 7.1, 8.1-8.2, 9.1-9.2, 11.1)
"""

from .main_screen import MainScreen
from .platform_select import PlatformSelectScreen

__all__ = ["PlatformSelectScreen", "MainScreen"]
