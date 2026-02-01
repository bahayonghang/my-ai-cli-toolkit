---
name: lsp-manager
description: Automatically detect programming languages, configure Language Server Protocol (LSP) servers, and troubleshoot LSP integration issues for Claude Code. Use when users request to set up LSP, configure code intelligence, add language support, troubleshoot LSP errors, or when working with projects that need real-time code diagnostics and navigation.
category: development-tools
tags: [lsp, language-server, code-intelligence, diagnostics, configuration, troubleshooting]
---

# LSP Manager

自动检测项目编程语言并配置 Language Server Protocol (LSP) 支持,为 Claude 提供实时代码智能、诊断和导航能力。

## 核心能力

1. **语言检测** - 扫描项目自动识别编程语言
2. **配置生成** - 自动生成 LSP 配置文件
3. **服务器验证** - 检查语言服务器安装状态
4. **故障排查** - 诊断并解决 LSP 连接问题

## 工作流程

### 自动配置流程

检测项目语言 → 检查官方插件 → 验证服务器安装 → 生成配置 → 安装插件

#### 步骤 1: 检测项目语言

使用 `detect_language.py` 扫描项目:

```bash
python scripts/detect_language.py /path/to/project
```

输出示例:
```json
[
  {"language": "Python", "file_count": 23, "extensions": [".py", ".pyi"]},
  {"language": "TypeScript", "file_count": 15, "extensions": [".ts", ".tsx"]}
]
```

#### 步骤 2: 检查官方插件

优先推荐官方插件:
- `pyright-lsp` (Python)
- `typescript-lsp` (TypeScript/JavaScript)  
- `rust-lsp` (Rust)

安装命令:
```bash
claude plugin install pyright-lsp
```

#### 步骤 3: 验证服务器安装

使用 `check_server.sh` 验证:

```bash
bash scripts/check_server.sh
```

如未安装,提供安装命令(参考 references/servers.md)。

#### 步骤 4: 生成配置文件

对于无官方插件的语言,使用 `generate_config.py`:

```bash
python scripts/generate_config.py Python Go Ruby
```

输出包含 `.lsp.json` 和 `plugin.json` 的完整配置。

#### 步骤 5: 创建并安装插件

```bash
# 创建插件目录
mkdir my-lsp
cd my-lsp
mkdir .claude-plugin

# 保存配置
echo '<.lsp.json内容>' > .lsp.json
echo '<plugin.json内容>' > .claude-plugin/plugin.json

# 安装插件
claude plugin install . --scope project
```

### 故障排查流程

遇到 LSP 问题时:

1. 检查可执行文件: `which <language-server>`
2. 验证配置语法: `cat .lsp.json | python -m json.tool`
3. 测试手动启动: `<language-server> --version`
4. 启用调试日志: `claude --enable-lsp-logging`
5. 查看详细错误: 参考 references/troubleshooting.md

## 常见场景

### 场景 1: 新项目 LSP 配置

**用户请求**: "为这个 Python 项目配置 LSP"

**处理**:
1. 运行 `detect_language.py` 确认语言
2. 检查 `pyright-lsp` 官方插件可用性
3. 验证 `pyright-langserver` 安装
4. 推荐安装官方插件或生成自定义配置

### 场景 2: 多语言项目

**用户请求**: "这个全栈项目需要 LSP"

**处理**:
1. 检测所有语言(如 Python + TypeScript)
2. 为每种语言推荐解决方案
3. 生成统一的 `.lsp.json` 配置
4. 创建包含所有语言的单一插件

### 场景 3: LSP 不工作

**用户请求**: "为什么看不到类型提示"

**处理**:
1. 运行 `check_server.sh` 验证安装
2. 检查配置文件语法
3. 查看 Claude Code 调试日志
4. 提供具体修复步骤

## 参考资源

- **servers.md** - 语言服务器详细信息和安装方法
- **troubleshooting.md** - 完整故障排查指南

需要详细信息时,使用 `view` 工具读取这些文件。

## 最佳实践

1. **优先官方插件** - 有官方支持时直接安装
2. **项目级配置** - 使用 `--scope project` 团队共享
3. **验证安装** - 配置前确认服务器可用
4. **启用日志** - 遇到问题时启用调试日志

## 脚本使用

所有脚本可直接执行:

```bash
# 检测语言
python scripts/detect_language.py .

# 检查服务器
bash scripts/check_server.sh

# 生成配置
python scripts/generate_config.py Python Go
```
