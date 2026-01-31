"""TUI 项目级别安装功能手动测试脚本

运行此脚本可以手动测试 TUI 的项目路径输入和 Kiro 模式功能。

使用方法:
    python tests/manual_test_tui_project.py
"""

import sys
from pathlib import Path

# 添加项目根目录到 sys.path
_PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(_PROJECT_ROOT))

from tui.app import SkillInstallerApp


def main():
    """运行 TUI 应用进行手动测试"""
    print("=" * 60)
    print("TUI 项目级别安装功能手动测试")
    print("=" * 60)
    print()
    print("测试步骤:")
    print("1. 选择一个平台（如 Claude）")
    print("2. 在 'Project Path' 输入框中输入项目路径（如 ./test-project）")
    print("3. 勾选或不勾选 'Use Kiro Structure' 复选框")
    print("4. 点击 'Continue' 按钮")
    print("5. 验证主界面标题栏显示项目路径和 Kiro 标识")
    print()
    print("预期结果:")
    print("- 标题栏应显示: 🚀 MyClaude Skills Manager | 📁 <项目路径>")
    print("- 平台徽章应显示: CLAUDE [KIRO] (如果勾选了 Kiro)")
    print()
    print("按 Ctrl+C 或 'q' 退出应用")
    print("=" * 60)
    print()

    input("按 Enter 键启动 TUI 应用...")

    app = SkillInstallerApp()
    app.run()


if __name__ == "__main__":
    main()
