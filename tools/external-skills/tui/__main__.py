"""External Skills TUI 入口模块

支持通过以下方式启动应用:
- `python external-skills/tui/__main__.py`
- `python -m tui` (从 external-skills 目录)

Requirements: 1.1
"""

import sys
from pathlib import Path

# 确保可以导入本地模块
TUI_ROOT = Path(__file__).parent
EXTERNAL_SKILLS_ROOT = TUI_ROOT.parent
sys.path.insert(0, str(EXTERNAL_SKILLS_ROOT))

# 使用绝对导入
from tui.app import main

if __name__ == "__main__":
    main()
