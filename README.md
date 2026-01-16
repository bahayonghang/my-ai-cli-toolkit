# MyClaude Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A curated collection of Claude Code skills and prompts for enhanced AI-assisted development workflows.

## Features

- 🎯 Reusable AI skill modules covering frontend design, research, documentation, and more
- 📦 Unified skill format (`SKILL.md`) for easy extension and maintenance
- 🔄 Cross-platform Python installation script (`install.py`)
- 🎛️ Multi-target support: Claude Code (`~/.claude/`), Codex CLI (`~/.codex/`), Gemini CLI (`~/.gemini/`), Qwen Code (`~/.qwen/`), Google Antigravity (`~/.gemini/antigravity/`), and Windsurf (`~/.codeium/windsurf/`)
- ⚡ Slash commands for common workflows (git commit, etc.)

## Prerequisites

- Git
- Python 3.6+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex CLI](https://github.com/openai/codex), [Gemini CLI](https://geminicli.com), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Google Antigravity](https://antigravity.google/), or [Windsurf](https://windsurf.com/)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# Install all skills
python3 install.py install-all

# Update global prompt configuration
python3 install.py prompt-update

# Or use the TUI for interactive management
python3 install_tui.py
```

Run `python3 install.py --help` for more options.

## Skills

| Skill | Description |
|-------|-------------|
| [article-cover](skills/article-cover/) | Generate professional SVG cover images for blog posts and articles |
| [codex](skills/codex/) | Codex CLI integration for deep code analysis and web search |
| [excalidraw](skills/excalidraw/) | Create hand-drawn style diagrams as Excalidraw JSON files |
| [frontend-design](skills/frontend-design/) | Build distinctive, production-grade frontend interfaces |
| [gemini-image](skills/gemini-image/) | AI image generation via Gemini API (text-to-image, image-to-image) |
| [research](skills/research/) | Technical research with web search and citation support |
| [spec-interview](skills/spec-interview/) | Deep interview to refine technical specs through systematic questioning |
| [paper-replication](skills/paper-replication/) | Replicate deep learning papers into industrial-grade PyTorch code with detailed module documentation |
| [tech-blog](skills/tech-blog/) | Write technical blog posts with source code analysis |
| [tech-design-doc](skills/tech-design-doc/) | Generate structured technical design documents |
| [claude-expert-skill-creator](skills/claude-expert-skill-creator/) | Create production-ready skills from expert knowledge with layered architecture |
| [IEEE-writing-skills](skills/IEEE-writing-skills/) | Translate, polish, restructure, and validate academic papers for IEEE publications |
| [latex-paper-en](skills/latex-paper-en/) | LaTeX academic paper assistant for English conference/journal papers |
| [latex-thesis-zh](skills/latex-thesis-zh/) | Chinese doctoral/master thesis LaTeX assistant with GB/T 7714 support |
| [mcp-to-skill](skills/mcp-to-skill/) | Convert MCP servers to Claude Code Skills with complete packaging |

## Commands

Slash commands provide quick access to common workflows. Available for both Claude and Gemini platforms.

### Claude Commands

| Command | Description |
|---------|-------------|
| [export-summary](commands/claude/export-summary.md) | Summarize session context and export to a markdown file |
| [import-summary](commands/claude/import-summary.md) | Restore session context from a summary file |
| [git-commit](commands/claude/zcf/git-commit.md) | Analyze changes and generate Conventional Commits messages (optional emoji) |
| [git-cleanBranches](commands/claude/zcf/git-cleanBranches.md) | Safely find and clean merged or stale Git branches with dry-run mode |
| [git-rollback](commands/claude/zcf/git-rollback.md) | Interactive rollback of Git branches to historical revisions |
| [git-worktree](commands/claude/zcf/git-worktree.md) | Manage Git worktrees with smart defaults and IDE integration |
| [init-project](commands/claude/zcf/init-project.md) | Initialize project AI context with CLAUDE.md index generation |

### Gemini Commands

| Command | Description |
|---------|-------------|
| [export-summary](commands/gemini/export-summary.toml) | Summarize session context and export to a markdown file |
| [import-summary](commands/gemini/import- summary.toml) | Restore session context from a summary file |
| [git-commit](commands/gemini/zcf/git-commit.toml) | Analyze changes and generate Conventional Commits messages (optional emoji) |
| [git-cleanBranches](commands/gemini/zcf/git-cleanBranches.toml) | Safely find and clean merged or stale Git branches with dry-run mode |
| [git-rollback](commands/gemini/zcf/git-rollback.toml) | Interactive rollback of Git branches to historical revisions |
| [git-worktree](commands/gemini/zcf/git-worktree.toml) | Manage Git worktrees with smart defaults and IDE integration |
| [init-project](commands/gemini/zcf/init-project.toml) | Initialize project AI context with CLAUDE.md index generation |

### Antigravity Workflows

Workflows for Google Antigravity IDE, triggered via `/workflow-name` in the agent chat.

| Workflow | Description |
|----------|-------------|
| [export-summary](commands/antigravity/export-summary.md) | Summarize session context and export to a markdown file |
| [import-summary](commands/antigravity/import-summary.md) | Restore session context from a summary file |
| [git-commit](commands/antigravity/git-commit.md) | Analyze changes and generate Conventional Commits messages |

### Windsurf Workflows

Workflows for Windsurf IDE, triggered via `/workflow-name` in Cascade.

| Workflow | Description |
|----------|-------------|
| [export-summary](commands/windsurf/export-summary.md) | Summarize session context and export to a markdown file |
| [import-summary](commands/windsurf/import-summary.md) | Restore session context from a summary file |
| [git-commit](commands/windsurf/git-commit.md) | Analyze changes and generate Conventional Commits messages |

### OMO Agents (Multi-Agent System)

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), these skills enable multi-agent collaboration where specialized agents work together on complex tasks.

| Skill | Description |
|-------|-------------|
| [omo-agents](skills/omo-agents/) | Multi-agent orchestration system overview and usage guide |
| [sisyphus](skills/sisyphus/) | Main orchestrator for complex task planning and parallel execution |
| [oracle](skills/oracle/) | Expert architect for design decisions, code review, and debugging |
| [explore](skills/explore/) | Fast code search agent for locating code and tracing dependencies |
| [librarian](skills/librarian/) | Documentation researcher for external docs and best practices |
| [frontend-engineer](skills/frontend-engineer/) | UI/UX expert for creating beautiful, polished interfaces |
| [document-writer](skills/document-writer/) | Technical writer for README, API docs, and architecture docs |
| [multimodal-looker](skills/multimodal-looker/) | Visual analyst for images, PDFs, charts, and diagrams |

## Installation

### Basic Installation

```bash
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# Install all skills to Claude (default)
python3 install.py install-all

# Install to Gemini
python3 install.py --target gemini install-all

# Install to Codex
python3 install.py --target codex install-all

# Install to Qwen
python3 install.py --target qwen install-all

# Install to Antigravity
python3 install.py --target antigravity install-all

# Install to Windsurf
python3 install.py --target windsurf install-all

# Update global CLAUDE.md
python3 install.py prompt-update
```

## Commands

| Command | Description |
|---------|-------------|
| `python3 install.py list` | List all available skills |
| `python3 install.py installed` | List currently installed skills |
| `python3 install.py install <skill> [skill2...]` | Install specific skill(s) |
| `python3 install.py install-all` | Install all skills |
| `python3 install.py interactive` | Interactive skill selection |
| `python3 install.py prompt-diff` | Show diff between local and global CLAUDE.md |
| `python3 install.py prompt-update` | Sync CLAUDE.md to ~/.claude/ |
| `python3 install.py --target gemini <command>` | Run command targeting Gemini |

### TUI Mode (Recommended)

For a more user-friendly experience, use the TUI (Terminal User Interface):

```bash
python3 install_tui.py
```

The TUI provides:
- 🎯 Visual platform selection (Claude/Codex/Gemini/Qwen/Antigravity/Windsurf)
- 📋 Tabbed interface for Skills and Commands/Workflows
- ⌨️ Keyboard shortcuts for quick operations
- 🔍 Real-time search filtering
- ✅ Multi-select batch installation
- 📁 Nested directory support for commands (e.g., `zcf/git-commit`)

**TUI Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| `Tab` | Switch between Skills/Commands tabs |
| `i` / `Enter` | Install focused item |
| `Space` | Toggle selection |
| `s` | Install selected items |
| `a` | Install all items |
| `Ctrl+A` | Select all |
| `Ctrl+D` | Deselect all |
| `/` | Search |
| `t` | Switch platform |
| `q` | Quit |

**Requirements:** Python 3.10+ and [Textual](https://textual.textualize.io/) library (`pip install textual`)

## Project Structure

```
.
├── install.py              # Unified Python installer
├── prompts/
│   ├── CLAUDE.md           # Global workflow configuration
│   └── TRANSLATE.md        # Translation guidelines
├── commands/               # Slash commands
│   ├── claude/             # Claude-specific commands
│   │   ├── export-summary.md
│   │   ├── import-summary.md
│   │   └── zcf/            # ZCF utility commands
│   │       ├── git-commit.md
│   │       ├── git-cleanBranches.md
│   │       ├── git-rollback.md
│   │       ├── git-worktree.md
│   │       └── init-project.md
│   ├── gemini/             # Gemini-specific commands
│   │   ├── export-summary.toml
│   │   ├── import- summary.toml
│   │   └── zcf/            # ZCF utility commands
│   │       ├── git-commit.toml
│   │       ├── git-cleanBranches.toml
│   │       ├── git-rollback.toml
│   │       ├── git-worktree.toml
│   │       └── init-project.toml
│   ├── antigravity/        # Antigravity workflows
│   │   ├── export-summary.md
│   │   ├── import-summary.md
│   │   └── git-commit.md
│   └── windsurf/           # Windsurf workflows
│       ├── export-summary.md
│       ├── import-summary.md
│       └── git-commit.md
└── skills/
    └── <skill-name>/
        ├── SKILL.md        # Skill definition (required)
        ├── config/         # Configuration templates (optional)
        ├── tips/           # Usage tips (optional)
        ├── references/     # Reference documents (optional)
        ├── scripts/        # Helper scripts (optional)
        └── cookbook/       # Code examples (optional)
```

## Prompts

### CLAUDE.md

Global workflow configuration based on Linus Torvalds-style engineering principles:
- KISS/YAGNI enforcement
- Structured workflow (intake → context → exploration → planning → execution → verification → handoff)
- Online search integration via Codex
- Self-reflection checklist before handoff

### TRANSLATE.md

Technical content translation guidelines:
- Natural phrasing over literal translation
- Preserve code, brands, and established technical terms
- Handle ambiguous terms with annotations

## Contributing

### Adding a New Skill

1. Create a new directory under `skills/`:
   ```bash
   mkdir skills/my-new-skill
   ```

2. Create `SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: my-new-skill
   description: Brief description for listing
   license: MIT  # optional
   ---

   # My New Skill

   Detailed instructions and documentation...
   ```

3. (Optional) Add supporting directories:
   - `config/` - Configuration templates
   - `tips/` - Usage tips
   - `references/` - Technical references
   - `scripts/` - Helper scripts
   - `cookbook/` - Code examples

4. Test installation:
   ```bash
   ./install.sh install my-new-skill
   ```

### Guidelines

- Keep `SKILL.md` focused and actionable
- Use clear, concise language
- Include examples where helpful
- Follow existing skill patterns for consistency

## FAQ

**Q: What's the difference between Claude, Codex, Gemini, Qwen, Antigravity, and Windsurf targets?**

A: The target determines the installation directory:
- Claude: `~/.claude/skills/` and `~/.claude/commands/` (default)
- Codex: `~/.codex/skills/` and `~/.codex/prompts/`
- Gemini: `~/.gemini/skills/` and `~/.gemini/commands/`
- Qwen: `~/.qwen/skills/` and `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/skills/` and `~/.gemini/antigravity/workflows/`
- Windsurf: `~/.codeium/windsurf/skills/` and `~/.codeium/windsurf/workflows/`

**Q: How do I update an existing skill?**

A: Simply run the install command again. It will overwrite the existing skill with the latest version.

**Q: Can I use skills from multiple sources?**

A: Yes. The `installed` command shows which skills come from this repository vs external sources.

**Q: Where is the backup stored when updating CLAUDE.md?**

A: Backups are created in `~/.claude/` with timestamp suffix, e.g., `CLAUDE.md.backup.20240115_143022`.

## Plugin Installer

A cross-platform CLI tool for installing Claude Code plugins from various marketplaces.

```bash
cd claude-plugin-install-scripts

# Install dependencies
pip install typer rich tomli  # Python < 3.11
pip install typer rich        # Python >= 3.11

# List available plugins
python install.py list

# Install all plugins
python install.py install --all

# Install specific plugins
python install.py install python-development canvas

# Install by category
python install.py install --category python

# View categories
python install.py categories
```

Plugin configuration is stored in `claude-plugin-install-scripts/plugins.toml`. See [Plugin Installer Documentation](claude-plugin-install-scripts/README.md) for details.

## License

MIT
