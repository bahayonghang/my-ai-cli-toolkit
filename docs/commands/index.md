# Commands

Slash commands provide quick access to common development workflows. They are installed to `~/.claude/commands/` and can be invoked using `/command-name` in Claude Code.

## Available Commands

| Command | Description |
|---------|-------------|
| [export-summary](/commands/export-summary) | Summarize session context and export to a markdown file |
| [import-summary](/commands/import-summary) | Restore session context from a summary file |
| [git-commit](/commands/git-commit) | Analyze changes and generate Conventional Commits messages |

## What are Commands?

Commands are predefined workflows that Claude can execute with a single slash command. Unlike skills (which provide context and capabilities), commands are action-oriented and designed for specific tasks.

## Installation

Commands are installed alongside skills using the install script:

::: code-group
```bash [Linux/macOS]
./install.sh install-all
```
```powershell [Windows]
.\install.ps1 install-all
```
:::

Commands are copied to `~/.claude/commands/` (or `~/.codex/commands/` when using Codex target).

## Usage

In Claude Code, simply type the command with a leading slash:

```
/git-commit
/git-commit --emoji
/git-commit --all --signoff
```

## Creating Custom Commands

Commands are Markdown files with YAML frontmatter. The frontmatter defines:

- `description`: Brief description shown in command list
- `allowed-tools`: Tools the command can use
- `argument-hint`: Usage hint for arguments

Example structure:

```yaml
---
description: Brief description of what the command does
allowed-tools: Read(**), Exec(git status, git diff)
argument-hint: [--flag] [--option <value>]
---

# Command Name

Detailed instructions for Claude...
```
