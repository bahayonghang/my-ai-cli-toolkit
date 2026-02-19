# Claude Code Plugin Installer

跨平台通用的 Claude Code 插件安装工具喵～

## 依赖安装

```bash
uv add typer rich tomli  # Python < 3.11 需要 tomli
# 或
uv add typer rich        # Python >= 3.11
```

## 使用方法

### 列出所有插件

```bash
uv run python install.py list

# 按分类筛选
uv run python install.py list --category python
```

### 安装插件

```bash
# 安装所有插件
uv run python install.py install --all

# 安装指定插件
uv run python install.py install python-development canvas

# 按分类安装
uv run python install.py install --category python

# 只显示命令 (dry-run)
uv run python install.py install --all --dry-run
```

### 查看分类

```bash
uv run python install.py categories
```

## 配置文件

插件配置保存在 `plugins.toml` 中，格式如下：

```toml
# 定义插件市场
[marketplaces.wshobson-agents]
repo = "wshobson/agents"
description = "Claude Code Workflows & Skills"

# 定义插件
[plugins.python-development]
marketplace = "wshobson-agents"
description = "Python 开发套件"
category = "python"
```

## 当前支持的插件

| 分类 | 插件 | 描述 |
|------|------|------|
| python | `python-development` | Python 开发套件 |
| javascript | `javascript-typescript` | JS/TS 开发套件 |
| review | `comprehensive-review` | 代码审查套件 |
| infrastructure | `deployment`, `kubernetes` | 基础设施工具 |
| security | `security-scanning` | 安全扫描 |
| tools | `canvas` | Canvas 画布插件 |

## 在 Claude Code 中使用

安装完成后，可以在 Claude Code 中使用：

```
@python-pro Create a FastAPI project with async patterns
@code-reviewer Review this file for bugs
@security-auditor Scan for vulnerabilities
```
