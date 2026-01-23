# Commands

Slash commands provide quick access to common development workflows. They are installed to different locations based on the target platform:

- Claude: `~/.claude/commands/`
- Codex: `~/.codex/prompts/`
- Gemini: `~/.gemini/commands/`
- Qwen: `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/workflows/`
- Windsurf: `~/.codeium/windsurf/workflows/`

Commands can be invoked using `/command-name` in Claude Code, Gemini CLI, or Antigravity.

## Available Commands

### Core Commands

| Command | Description |
|---------|-------------|
| [export-summary](/commands/export-summary) | Summarize session context and export to a markdown file |
| [import-summary](/commands/import-summary) | Restore session context from a summary file |

### Git Utility Commands (ZCF)

| Command | Description |
|---------|-------------|
| [git-commit](/commands/git-commit) | Analyze changes and generate Conventional Commits messages (optional emoji) |
| [git-cleanBranches](git-cleanBranches) | Safely find and clean merged or stale Git branches with dry-run mode |
| [git-rollback](git-rollback) | Interactive rollback of Git branches to historical revisions |
| [git-worktree](git-worktree) | Manage Git worktrees with smart defaults and IDE integration |
| [init-project](init-project) | Initialize project AI context with CLAUDE.md index generation |

### Planning Commands (Gemini Only)

| Command | Description |
|---------|-------------|
| [plan/impl](plan/impl) | Implementation planning workflow |
| [plan/new](plan/new) | New feature planning workflow |

## What are Commands?

Commands are predefined workflows that Claude/Gemini can execute with a single slash command. Unlike skills (which provide context and capabilities), commands are action-oriented and designed for specific tasks.

## Installation

Commands are installed alongside skills using the install script:

::: code-group
```bash [Linux/macOS]
python3 install.py install-all
```
```powershell [Windows]
python install.py install-all
```
:::

Commands are copied to the appropriate directory based on target:
- Claude: `~/.claude/commands/`
- Codex: `~/.codex/prompts/`
- Gemini: `~/.gemini/commands/`
- Qwen: `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/workflows/`
- Windsurf: `~/.codeium/windsurf/workflows/`

## Usage

In Claude Code or Gemini CLI, simply type the command with a leading slash:

```
/git-commit
/git-commit --emoji
/git-commit --all --signoff
/git-cleanBranches --dry-run
/git-rollback
/git-worktree add feature-branch
```

## Nested Directory Support

Commands can be organized in subdirectories for better organization. The TUI and install scripts fully support nested structures:

```
commands/claude/
├── export-summary.md
├── import-summary.md
└── zcf/                    # Subdirectory for ZCF utilities
    ├── git-commit.md
    ├── git-cleanBranches.md
    └── git-rollback.md
```

In the TUI, nested commands are displayed with their full path (e.g., `zcf/git-commit`). When installed, the directory structure is preserved in the target location.

## Creating Custom Commands

Commands are Markdown files (for Claude) or TOML files (for Gemini) with structured metadata. The metadata defines:

- `description`: Brief description shown in command list
- `allowed-tools`: Tools the command can use
- `argument-hint`: Usage hint for arguments

Example structure for Claude (Markdown):

```yaml
---
description: Brief description of what the command does
allowed-tools: Read(**), Exec(git status, git diff)
argument-hint: [--flag] [--option <value>]
---

# Command Name

Detailed instructions for Claude...
```

Example structure for Gemini (TOML):
```toml
description = "Brief description of what the command does"
prompt = """# Command Name

Detailed instructions for Gemini...

## Usage
...
"""
```

Example structure for Antigravity (Markdown):
```markdown
# Workflow Name

Instructions for the Antigravity agent...

## Steps
1. First step
2. Second step

## Action
Execute the workflow...
```
