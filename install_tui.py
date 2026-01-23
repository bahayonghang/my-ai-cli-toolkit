#!/usr/bin/env python3
import sys


def main() -> int:
    """运行 TUI 应用
    
    Returns:
        退出码 (0 表示正常退出)
    """
    from tui.app import SkillInstallerApp
    
    app = SkillInstallerApp()
    app.run()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        # 优雅处理 Ctrl+C 中断
        print("\nAborted by user.")
        sys.exit(0)
