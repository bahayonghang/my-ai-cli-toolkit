#!/usr/bin/env python3
"""External Skills TUI 启动脚本

直接启动 External Skills 管理器的 TUI 界面。
"""
import sys


def main() -> int:
    """运行 External Skills TUI 应用

    Returns:
        退出码 (0 表示正常退出)
    """
    from tui.app import ExternalSkillApp

    app = ExternalSkillApp()
    app.run()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        # 优雅处理 Ctrl+C 中断
        print("\nAborted by user.")
        sys.exit(0)
