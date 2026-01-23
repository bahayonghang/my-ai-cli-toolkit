# 命令 (Commands)

斜杠命令提供对常用开发工作流的快速访问。根据目标平台，它们会被安装到不同的位置：

- Claude: `~/.claude/commands/`
- Codex: `~/.codex/prompts/`
- Gemini: `~/.gemini/commands/`
- Qwen: `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/workflows/`
- Windsurf: `~/.codeium/windsurf/workflows/`

在 Claude Code, Gemini CLI, 或 Antigravity 中，可以使用 `/command-name` 来调用命令。

## 可用命令 (Available Commands)

### 核心命令 (Core Commands)

| 命令 | 描述 |
|---------|-------------|
| [export-summary](/commands/export-summary) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](/commands/import-summary) | 从摘要文件恢复会话上下文 |

### Git 工具命令 (Git Utility Commands - ZCF)

| 命令 | 描述 |
|---------|-------------|
| [git-commit](/commands/git-commit) | 分析变更并生成符合 Conventional Commits 规范的消息 (可选表情符号) |
| [git-cleanBranches](git-cleanBranches) | 安全地查找并清理已合并或过期的 Git 分支，支持试运行 (dry-run) |
| [git-rollback](git-rollback) | 交互式地将 Git 分支回滚到历史版本 |
| [git-worktree](git-worktree) | 使用智能默认值和 IDE 集成来管理 Git worktrees |
| [init-project](init-project) | 初始化项目 AI 上下文并生成 CLAUDE.md 索引 |

### 规划命令 (Planning Commands - 仅限 Gemini)

| 命令 | 描述 |
|---------|-------------|
| [plan/impl](plan/impl) | 实现规划工作流 |
| [plan/new](plan/new) | 新功能规划工作流 |

## 什么是命令？

命令是 Claude/Gemini 可以通过单个斜杠命令执行的预定义工作流。与提供上下文和能力的技能不同，命令是以行动为导向的，专为特定任务设计。

## 安装 (Installation)

命令与技能一起使用安装脚本进行安装：

::: code-group
```bash [Linux/macOS]
python3 install.py install-all
```
```powershell [Windows]
python install.py install-all
```
:::

命令会被复制到相应的目标目录：
- Claude: `~/.claude/commands/`
- Codex: `~/.codex/prompts/`
- Gemini: `~/.gemini/commands/`
- Qwen: `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/workflows/`
- Windsurf: `~/.codeium/windsurf/workflows/`

## 使用方法 (Usage)

在 Claude Code 或 Gemini CLI 中，只需输入带有前导斜杠的命令：

```
/git-commit
/git-commit --emoji
/git-commit --all --signoff
/git-cleanBranches --dry-run
/git-rollback
/git-worktree add feature-branch
```

## 嵌套目录支持 (Nested Directory Support)

命令可以组织在子目录中以便于管理。TUI 和安装脚本完全支持嵌套结构：

```
commands/claude/
├── export-summary.md
├── import-summary.md
└── zcf/                    # ZCF 工具的子目录
    ├── git-commit.md
    ├── git-cleanBranches.md
    └── git-rollback.md
```

在 TUI 中，嵌套命令显示为其完整路径（例如 `zcf/git-commit`）。安装时，目标位置将保留目录结构。

## 创建自定义命令 (Creating Custom Commands)

命令是具有结构化元数据的 Markdown 文件 (Claude) 或 TOML 文件 (Gemini)。元数据定义包括：

- `description`: 命令列表中显示的简短描述
- `allowed-tools`: 命令可以使用的工具
- `argument-hint`: 参数使用提示

Claude (Markdown) 示例结构：

```yaml
---
description: 命令功能的简短描述
allowed-tools: Read(**), Exec(git status, git diff)
argument-hint: [--flag] [--option <value>]
---

# Command Name

Claude 的详细指令...
```

Gemini (TOML) 示例结构：
```toml
description = "命令功能的简短描述"
prompt = """# Command Name

Gemini 的详细指令...

## Usage
...
"""
```

Antigravity (Markdown) 示例结构：
```markdown
# Workflow Name

Antigravity agent 的指令...

## Steps
1. First step
2. Second step

## Action
执行工作流...
```
