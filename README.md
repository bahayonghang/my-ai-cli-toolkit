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

Skills are specialized capabilities that can be added to your AI assistant. They are organized into category folders under `skills/`.

### 🎓 Academic (`academic-skills/`)
| Skill | Description |
|-------|-------------|
| [academic-slides](skills/academic-skills/academic-slides/) | Academic slide generation with dual engines (Typst Touying & LaTeX Beamer) |
| [IEEE-writing-skills](skills/academic-skills/IEEE-writing-skills/) | Translate, polish, and validate academic papers for IEEE publications |
| [latex-paper-en](skills/academic-skills/latex-paper-en/) | LaTeX academic paper assistant for English conference/journal papers |
| [latex-thesis-zh](skills/academic-skills/latex-thesis-zh/) | Chinese doctoral/master thesis LaTeX assistant with GB/T 7714 support |
| [paper-check](skills/academic-skills/paper-check/) | Academic paper quality inspection tool |
| [paper-replication](skills/academic-skills/paper-replication/) | Replicate deep learning papers into industrial-grade PyTorch code |
| [typst-paper](skills/academic-skills/typst-paper/) | Typst academic paper assistant with modular workflow |
| [xray-paper-skill](skills/academic-skills/xray-paper-skill/) | Deconstruct academic papers into core contributions and insights |
| [zoterosynth](skills/academic-skills/zoterosynth/) | Search, browse, and analyze Zotero libraries via zotero-mcp |

### 🤖 AI & LLM (`ai-llm-skills/`)
| Skill | Description |
|-------|-------------|
| [codex](skills/ai-llm-skills/codex/) | Codex CLI integration for deep code analysis and web search |
| [gemini](skills/ai-llm-skills/gemini/) | Gemini integration for enhanced reasoning |
| [gemini-image](skills/ai-llm-skills/gemini-image/) | AI image generation via Gemini API (text-to-image, image-to-image) |
| [research](skills/ai-llm-skills/research/) | Technical research with web search and citation support |

### 💻 Development (`development-skills/`)
| Skill | Description |
|-------|-------------|
| [frontend-engineer](skills/development-skills/frontend-engineer/) | Build distinctive, production-grade frontend interfaces |
| [lib-slint-expert](skills/development-skills/lib-slint-expert/) | Comprehensive Slint GUI development expert |
| [lsp-manager](skills/development-skills/lsp-manager/) | Auto-detect languages and configure LSP servers for code intelligence |
| [rust-cli-tui-developer](skills/development-skills/rust-cli-tui-developer/) | Expert guidance for Rust CLI and TUI development |
| [uv-expert](skills/development-skills/uv-expert/) | Expert guidance for uv Python package manager |
| [vue-best-practices](skills/development-skills/vue-best-practices/) | Vue 3 and TypeScript best practices with Volar |

### 🔧 Dev Tools (`devtools-skills/`)
| Skill | Description |
|-------|-------------|
| [karpathy-guidelines](skills/devtools-skills/karpathy-guidelines/) | Behavioral guidelines to reduce common LLM coding mistakes |
| [memory-system](skills/devtools-skills/memory-system/) | Local memory system with SQLite for cross-session semantic search |
| [planning-with-files](skills/devtools-skills/planning-with-files/) | File-based planning for complex multi-step tasks |
| [review-code](skills/devtools-skills/review-code/) | Multi-dimensional code review with structured reports |
| [spec-interview](skills/devtools-skills/spec-interview/) | Systematic interview to refine technical specs with OpenSpec integration |

### 📊 Diagrams (`diagram-skills/`)
| Skill | Description |
|-------|-------------|
| [drawio](skills/diagram-skills/drawio/) | AI-powered Draw.io diagram generation with real-time browser preview |
| [excalidraw](skills/diagram-skills/excalidraw/) | Create hand-drawn style diagrams as Excalidraw JSON files |
| [mermaid_expert](skills/diagram-skills/mermaid_expert/) | Expert guidance for Mermaid.js diagramming library |

### 📝 Documentation (`document-skills/`)
| Skill | Description |
|-------|-------------|
| [document-writer](skills/document-skills/document-writer/) | Technical writer for README, API docs, and architecture docs |
| [docx](skills/document-skills/docx/) | Create, read, edit, and manipulate Word documents (.docx files) |
| [pdf](skills/document-skills/pdf/) | Process PDF files: merge, split, extract text/tables, OCR, watermark |
| [pptx](skills/document-skills/pptx/) | Create, read, edit, and design PowerPoint presentations (.pptx files) |
| [tech-blog](skills/document-skills/tech-blog/) | Write technical blog posts with source code analysis |
| [tech-design-doc](skills/document-skills/tech-design-doc/) | Generate structured technical design documents |
| [xlsx](skills/document-skills/xlsx/) | Create, read, edit, and analyze Excel spreadsheets (.xlsx files) |

### 🐙 Git & GitHub (`git-github-skills/`)
| Skill | Description |
|-------|-------------|
| [gh-address-comments](skills/git-github-skills/gh-address-comments/) | Help address review/issue comments on open GitHub PR |
| [gh-bootstrap](skills/git-github-skills/gh-bootstrap/) | One-stop GitHub repository configuration tool |
| [gh-fix-ci](skills/git-github-skills/gh-fix-ci/) | Debug or fix failing GitHub PR checks in GitHub Actions |
| [git-commit-cn](skills/git-github-skills/git-commit-cn/) | Chinese version of git commit message generator |

### 🎨 Media (`media-skills/`)
| Skill | Description |
|-------|-------------|
| [article-cover](skills/media-skills/article-cover/) | Generate professional SVG cover images for blog posts and articles |
| [yt-dlp](skills/media-skills/yt-dlp/) | Video downloader for YouTube, Bilibili, and 1000+ sites |

### 🗃️ Obsidian (`obsidian-skills/`)
| Skill | Description |
|-------|-------------|
| [defuddle](skills/obsidian-skills/defuddle/) | Web content extraction and cleanup |
| [excalidraw-diagram](skills/obsidian-skills/excalidraw-diagram/) | Excalidraw diagrams for Obsidian |
| [json-canvas](skills/obsidian-skills/json-canvas/) | JSON Canvas file creation and editing |
| [mermaid-visualizer](skills/obsidian-skills/mermaid-visualizer/) | Mermaid diagram visualization for Obsidian |
| [obsidian-bases](skills/obsidian-skills/obsidian-bases/) | Obsidian Bases database views |
| [obsidian-canvas-creator](skills/obsidian-skills/obsidian-canvas-creator/) | Obsidian Canvas creation tool |
| [obsidian-cli](skills/obsidian-skills/obsidian-cli/) | Obsidian vault CLI operations |
| [obsidian-markdown](skills/obsidian-skills/obsidian-markdown/) | Obsidian-flavored Markdown writing |

### 🧩 Skill Development (`skill-meta-skills/`)
| Skill | Description |
|-------|-------------|
| [claude-expert-skill-creator](skills/skill-meta-skills/claude-expert-skill-creator/) | Create production-ready skills from expert knowledge |
| [github-to-skills](skills/skill-meta-skills/github-to-skills/) | Convert GitHub repos into AI skills automatically |
| [mcp-to-skill](skills/skill-meta-skills/mcp-to-skill/) | Convert MCP servers to Claude Code Skills |
| [skill_optimizer](skills/skill-meta-skills/skill_optimizer/) | Analyze Claude Code skills for compliance and token efficiency |
| [skill-evolution-manager](skills/skill-meta-skills/skill-evolution-manager/) | Evolve skills based on user feedback and experience |
| [skill-manager](skills/skill-meta-skills/skill-manager/) | Lifecycle manager for GitHub-based skills |
| [skill-seekers](skills/skill-meta-skills/skill-seekers/) | Generate LLM skills from documentation and codebases |

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
├── skills/                 # Skills directory (categorized)
│   ├── academic-skills/    # Academic writing & research
│   ├── ai-llm-skills/     # AI & LLM integrations
│   ├── development-skills/ # Development frameworks & languages
│   ├── devtools-skills/    # Developer tools & workflows
│   ├── diagram-skills/     # Diagram generation
│   ├── document-skills/    # Document processing & writing
│   ├── git-github-skills/  # Git & GitHub utilities
│   ├── media-skills/       # Media & visual content
│   ├── obsidian-skills/    # Obsidian knowledge management
│   ├── skill-meta-skills/  # Skill creation & management
│   └── default.toml        # Default category config
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
