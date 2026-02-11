# MyClaude Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A curated collection of Claude Code skills, prompts, and workflows for enhanced AI-assisted development. This project provides a unified framework for managing and installing AI skills across multiple platforms including Claude Code, Codex, Gemini, Qwen, Google Antigravity, and Windsurf.

## Features

- 🎯 **Modular Skills**: Reusable AI skill modules covering frontend design, research, documentation, academic writing, and more.
- 📦 **Unified Format**: Standardized `SKILL.md` definition for easy extension and maintenance.
- 🔄 **Cross-Platform**: Single Python installation script (`src/install.py`) that works everywhere (Windows, Linux, macOS).
- 🎛️ **Multi-Target Support**:
  - **Claude Code** (`~/.claude/`)
  - **Codex CLI** (`~/.codex/`)
  - **Gemini CLI** (`~/.gemini/`)
  - **Qwen Code** (`~/.qwen/`)
  - **Google Antigravity** (`~/.gemini/antigravity/`)
  - **Windsurf** (`~/.codeium/windsurf/`)
  - **Trae** (`~/.trae/`)
- ⚡ **Slash Commands**: Quick access to common workflows like `git commit`, `export-summary`, and more.
- 🖥️ **TUI Management**: Interactive Terminal User Interface for easy skill browsing and installation.
- 🧩 **External Skills**: Support for installing skills from npm, pip, and git repositories.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# Run the interactive TUI (Recommended)
uv run python src/install_tui.py
```

Or use the command line:

```bash
# Install all skills to Claude (default)
uv run python src/install.py install-all

# Update global prompt configuration
uv run python src/install.py prompt-update
```

## Skills

Skills are specialized capabilities that can be added to your AI assistant. They are categorized by domain.

### 🎨 Design
| Skill | Description |
|-------|-------------|
| [article-cover](skills/article-cover/) | Generate professional SVG cover images for blog posts and articles |
| [drawio](skills/drawio/) | AI-powered Draw.io diagram generation with real-time browser preview |
| [excalidraw](skills/excalidraw/) | Create hand-drawn style diagrams as Excalidraw JSON files |
| [frontend-design](skills/frontend-design/) | Build distinctive, production-grade frontend interfaces |
| [gemini-image](skills/gemini-image/) | AI image generation via Gemini API (text-to-image, image-to-image) |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Advanced UI/UX design intelligence (External Skill) |

### 💻 Development
| Skill | Description |
|-------|-------------|
| [codex](skills/codex/) | Codex CLI integration for deep code analysis and web search |
| [paper-replication](skills/paper-replication/) | Replicate deep learning papers into industrial-grade PyTorch code |
| [paper-check](skills/paper-check/) | Code review and validation assistant |
| [review-code](skills/review-code/) | Multi-dimensional code review with structured reports |
| [claude-expert-skill-creator](skills/claude-expert-skill-creator/) | Create production-ready skills from expert knowledge |
| [mcp-to-skill](skills/mcp-to-skill/) | Convert MCP servers to Claude Code Skills |
| [skill-manager](skills/skill-manager/) | Lifecycle manager for GitHub-based skills |
| [skill-evolution-manager](skills/skill-evolution-manager/) | Evolve skills based on user feedback and experience |
| [github-to-skills](skills/github-to-skills/) | Convert GitHub repos into AI skills automatically |
| [skill-seekers](skills/skill-seekers/) | Generate LLM skills from documentation and codebases |
| [rust-cli-tui-developer](skills/rust-cli-tui-developer/) | Expert guidance for Rust CLI and TUI development |
| [lib-slint-expert](skills/lib-slint-expert/) | Comprehensive Slint GUI development expert |
| [vue-best-practices](skills/vue-best-practices/) | Vue 3 and TypeScript best practices with Volar |
| [uv-expert](skills/uv-expert/) | Expert guidance for uv Python package manager |
| [gh-bootstrap](skills/gh-bootstrap/) | One-stop GitHub repository configuration tool |
| [agent-browser](https://github.com/vercel-labs/agent-browser) | Browser automation skill from Vercel Labs (External Skill) |
| [gemini](skills/gemini/) | Gemini integration for enhanced reasoning |

### 🔍 Research
| Skill | Description |
|-------|-------------|
| [research](skills/research/) | Technical research with web search and citation support |

### 📝 Documentation
| Skill | Description |
|-------|-------------|
| [docx](skills/docx/) | Create, read, edit, and manipulate Word documents (.docx files) with tracked changes and comments |
| [xlsx](skills/xlsx/) | Create, read, edit, and analyze Excel spreadsheets (.xlsx files) with formulas and formatting |
| [pptx](skills/pptx/) | Create, read, edit, and design PowerPoint presentations (.pptx files) with professional layouts |
| [pdf](skills/pdf/) | Process PDF files: merge, split, extract text/tables, OCR, watermark, and create new PDFs |
| [tech-blog](skills/tech-blog/) | Write technical blog posts with source code analysis |
| [tech-design-doc](skills/tech-design-doc/) | Generate structured technical design documents |
| [spec-interview](skills/spec-interview/) | Systematic interview to refine technical specs with OpenSpec integration |
| [document-writer](skills/document-writer/) | Technical writer for README, API docs, and architecture docs |
| [mermaid-expert](skills/mermaid_expert/) | Expert guidance for Mermaid.js diagramming library |

### 🎓 Academic
| Skill | Description |
|-------|-------------|
| [IEEE-writing-skills](skills/IEEE-writing-skills/) | Translate, polish, and validate academic papers for IEEE publications |
| [latex-paper-en](skills/latex-paper-en/) | LaTeX academic paper assistant for English conference/journal papers |
| [latex-thesis-zh](skills/latex-thesis-zh/) | Chinese doctoral/master thesis LaTeX assistant with GB/T 7714 support |
| [typst-paper](skills/typst-paper/) | Typst academic paper assistant with modular workflow |
| [academic-slides](skills/academic-slides/) | Academic slide generation with dual engines (Typst Touying & LaTeX Beamer) |
| [git-commit-cn](skills/git-commit-cn/) | Chinese version of git commit message generator |

### 🧠 Knowledge Management
| Skill | Description |
|-------|-------------|
| [memory-system](skills/memory-system/) | Local memory system that indexes Markdown files to SQLite for cross-session semantic search with vector and full-text search |

### 🛠️ Utilities
| Skill | Description |
|-------|-------------|
| [lsp-manager](skills/lsp-manager/) | Auto-detect languages and configure LSP servers for code intelligence |
| [planning-with-files](skills/planning-with-files/) | File-based planning for complex multi-step tasks |
| [yt-dlp](skills/yt-dlp/) | Video downloader for YouTube, Bilibili, and 1000+ sites |

## Commands

Slash commands provide quick access to common workflows. Available for Claude, Gemini, Antigravity, and Windsurf.

### Core Commands
| Command | Description |
|---------|-------------|
| `export-summary` | Summarize session context and export to a markdown file |
| `import-summary` | Restore session context from a summary file |

### Git Utilities (ZCF)
| Command | Description |
|---------|-------------|
| `git-commit` | Analyze changes and generate Conventional Commits messages |
| `git-cleanBranches` | Safely find and clean merged or stale Git branches |
| `git-rollback` | Interactive rollback of Git branches to historical revisions |
| `git-worktree` | Manage Git worktrees with smart defaults |
| `init-project` | Initialize project AI context with CLAUDE.md index generation |

### Planning (Gemini)
| Command | Description |
|---------|-------------|
| `plan/impl` | Implementation planning workflow |
| `plan/new` | New feature planning workflow |

## Installation Guide

### Basic Installation
```bash
# Install all skills to Claude (default)
uv run python src/install.py install-all

# Install to specific platform
uv run python src/install.py --target gemini install-all
uv run python src/install.py --target codex install-all
uv run python src/install.py --target antigravity install-all
uv run python src/install.py --target windsurf install-all
```

### Project-Level Installation
Install skills to a specific project directory instead of globally:

```bash
# Install to a project directory
uv run python src/install.py install frontend-engineer --project ./my-web-app

# Install to a Kiro project (.kiro/skills/ structure)
uv run python src/install.py install skill-name --project ./my-kiro-project --kiro
```

### TUI Mode (Recommended)
For a user-friendly experience, use the Terminal User Interface:

```bash
uv run python src/install_tui.py
```

**TUI Features:**
- 🎯 Visual platform selection
- 📁 Project path input for local installation
- 🔍 Real-time search and filtering
- ✅ Multi-select batch installation
- ⌨️ Keyboard shortcuts (`/` to search, `Space` to select, `i` to install)

## Project Structure

```
.
├── src/                    # Python source code
│   ├── install.py          # Unified Python installer
│   ├── install_tui.py      # Terminal User Interface
│   ├── core/               # Shared modules (paths, config, skill_meta)
│   └── tui/                # TUI components and screens
├── prompts/                # Global prompts (CLAUDE.md)
├── commands/               # Slash commands
│   ├── claude/             # Claude-specific commands
│   ├── gemini/             # Gemini-specific commands
│   ├── antigravity/        # Antigravity workflows
│   ├── windsurf/           # Windsurf workflows
│   └── trae/               # Trae workflows
├── skills/                 # Local skills directory
│   └── <skill-name>/       # Individual skill modules
└── external-skills/        # External skill configurations
    └── registry.toml       # Registry for npm/pip/git skills
```

## Contributing

1. Create a new directory under `skills/`.
2. Create `SKILL.md` with the skill definition.
3. (Optional) Add `scripts/`, `config/`, or `references/`.
4. Run `uv run python src/install.py install <your-skill>` to test.

## License

MIT
