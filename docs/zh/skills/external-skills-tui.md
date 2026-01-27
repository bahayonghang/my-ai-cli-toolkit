# external-skills-tui

外部技能管理的现代终端用户界面。

## 概述

External Skills TUI 是一个基于 Textual 的终端应用程序，提供直观的界面来浏览、搜索和安装来自 npm/npx/pip/git 源的第三方技能。

## 功能特性

- 🎯 **平台选择** - 启动时选择目标平台 (Claude/Codex/Gemini/Kiro/Windsurf/Cursor/Copilot)
- 📋 **技能浏览** - 浏览所有注册的外部技能，带类型图标和描述
- 🔍 **实时搜索** - 按名称或描述即时过滤技能
- 📖 **详情视图** - 查看完整的技能信息，包括依赖和支持平台
- ✅ **依赖检查** - 安装前验证所需依赖
- 📦 **一键安装** - 实时进度和命令输出的技能安装
- ⌨️ **Vim 风格导航** - 支持 j/k 键和方向键

## 安装

```bash
# 安装依赖
pip install textual typer rich

# Python < 3.11 需要
pip install tomli
```

## 使用方法

```bash
# 从 external-skills 目录运行
cd external-skills
python -m tui
```

## 键盘快捷键

| 按键 | 操作 |
|------|------|
| `↑/↓` 或 `j/k` | 上下导航 |
| `Enter` 或 `d` | 查看技能详情 |
| `i` | 安装选中的技能 |
| `c` | 检查依赖 |
| `/` | 打开搜索 |
| `Esc` | 关闭面板 / 返回 |
| `q` | 退出应用 |

## 界面

### 平台选择界面

启动时显示的第一个界面。选择目标 AI 编程助手平台：

- **Claude** - `~/.claude/`
- **Codex** - `~/.codex/`
- **Gemini** - `~/.gemini/`
- **Kiro** - `~/.kiro/`
- **Windsurf** - `~/.codeium/windsurf/`
- **Cursor** - `~/.cursor/`
- **Copilot** - `~/.copilot/`

### 主界面

选择平台后，主界面显示：

1. **标题栏** - 应用标题和当前平台徽章
2. **技能列表** - 所有可用技能，包含：
   - 类型图标 (📦 npm-cli, ⚡ npx, 🐍 pip-cli, 🔗 git)
   - 技能名称
   - 描述
   - 当前平台的支持状态
3. **底部栏** - 键盘快捷键参考

### 详情面板

按 `d` 或 `Enter` 查看技能详情：

- 描述
- 安装类型
- 包名
- 所需依赖
- 支持的平台
- 主页 URL
- 许可证

### 进度面板

安装期间显示：

- 当前步骤指示器
- 进度条
- 实时命令输出日志
- 成功/失败状态

## 技能类型

| 类型 | 图标 | 描述 |
|------|------|------|
| `npm-cli` | 📦 | 带 init 命令的全局 npm 包 |
| `npx` | ⚡ | 直接 npx 执行（无需全局安装） |
| `pip-cli` | 🐍 | 带 CLI 的 Python 包 |
| `git` | 🔗 | 带安装脚本的 Git 仓库 |

## 架构

```
external-skills/tui/
├── app.py              # 主应用类
├── styles.tcss         # Textual CSS 样式
├── __init__.py
├── __main__.py         # 入口点
├── components/
│   ├── skill_list.py   # SkillItem 和 SkillListView
│   └── ...
├── screens/
│   ├── platform_select.py  # 平台选择界面
│   ├── main_screen.py      # 主技能浏览界面
│   └── ...
└── core/
    ├── manager.py      # ExternalSkillManager
    ├── models.py       # 数据模型
    └── ...
```

## 要求

- Python >= 3.10
- Textual >= 0.40.0
- typer
- rich
- tomli (Python < 3.11)

## 相关

- [技能管理器](./skill-manager) - 社区技能浏览器
