# 命令

斜杠命令提供常见开发工作流的快捷访问。根据目标平台安装到不同位置：

- Claude: `~/.claude/commands/`
- Codex: `~/.codex/prompts/`
- Gemini: `~/.gemini/commands/`
- Qwen: `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/workflows/`

可以在 Claude Code、Gemini CLI 或 Antigravity 中使用 `/command-name` 调用。

## 可用命令

| 命令 | 描述 |
|------|------|
| [export-summary](/zh/commands/export-summary) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](/zh/commands/import-summary) | 从总结文件中恢复会话上下文 |
| [git-commit](/zh/commands/git-commit) | 分析改动并生成 Conventional Commits 风格的提交信息 |

## 什么是命令？

命令是预定义的工作流，Claude 可以通过单个斜杠命令执行。与技能（提供上下文和能力）不同，命令是面向操作的，专为特定任务设计。

## 安装

命令与技能一起通过安装脚本安装：

::: code-group
```bash [Linux/macOS]
./install.sh install-all
```
```powershell [Windows]
.\install.ps1 install-all
```
:::

命令会根据目标平台复制到相应目录：
- Claude: `~/.claude/commands/`
- Codex: `~/.codex/prompts/`
- Gemini: `~/.gemini/commands/`
- Qwen: `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/workflows/`

## 使用方法

在 Claude Code 中，只需输入带斜杠前缀的命令：

```
/git-commit
/git-commit --emoji
/git-commit --all --signoff
```

## 嵌套目录支持

命令可以组织在子目录中以便更好地管理。TUI 和安装脚本完全支持嵌套结构：

```
commands/claude/
├── export-summary.md
├── import-summary.md
└── zcf/                    # ZCF 工具子目录
    ├── git-commit.md
    ├── git-cleanBranches.md
    └── git-rollback.md
```

在 TUI 中，嵌套命令会显示完整路径（如 `zcf/git-commit`）。安装时会保持目录结构。

## 创建自定义命令

命令是带有 YAML frontmatter 的 Markdown 文件。frontmatter 定义：

- `description`: 命令列表中显示的简短描述
- `allowed-tools`: 命令可以使用的工具
- `argument-hint`: 参数使用提示

示例结构：

```yaml
---
description: 命令功能的简短描述
allowed-tools: Read(**), Exec(git status, git diff)
argument-hint: [--flag] [--option <value>]
---

# 命令名称

给 Claude 的详细指令...
```

Antigravity 工作流示例（Markdown）：

```markdown
# 工作流名称

给 Antigravity Agent 的指令...

## 步骤
1. 第一步
2. 第二步

## 操作
执行工作流...
```
