# My AI Platform Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A curated collection of Claude Code skills, prompts, and workflows for enhanced AI-assisted development. This project provides a unified framework for managing and installing AI skills across multiple platforms including Claude Code, Codex, Gemini, Qwen, Google Antigravity, and Windsurf.

## Features

- 🎯 **Modular Skills**: Reusable AI skill modules covering frontend design, research, documentation, academic writing, and more.
- 📦 **Unified Format**: Standardized `SKILL.md` definition for easy extension and maintenance.
- 🔄 **Cross-Platform**: Rust TUI (`mcs/`) for interactive skill management across Windows, Linux, and macOS.
- 🎛️ **Multi-Target Support**:
  - **Claude Code** (`~/.claude/`)
  - **Universal shared skills dir** (`~/.agents/skills/`) for:
    - Amp, Cline, Codex CLI, Cursor, Gemini CLI, GitHub Copilot, Kimi Code CLI, OpenCode
  - **Commands/workflows stay platform-specific** (for example Codex `~/.codex/prompts/`, OpenCode `~/.config/opencode/commands/`)
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
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

# Run the interactive Rust MCS TUI (Recommended)
# Requires Rust toolchain (`cargo`)
just mcs
```

## Skills

Skills are specialized capabilities that can be added to your AI assistant. They are organized into category folders under `content/skills/`.

### 🎓 Academic (`academic-skills/`)
| Skill | Description |
|-------|-------------|
| [academic-slides](content/skills/academic-skills/academic-slides/) | Academic slide generation with dual engines (Typst Touying & LaTeX Beamer) |
| [IEEE-writing-skills](content/skills/academic-skills/IEEE-writing-skills/) | Translate, polish, and validate academic papers for IEEE publications |
| [latex-paper-en](content/skills/academic-skills/latex-paper-en/) | LaTeX academic paper assistant for English conference/journal papers |
| [latex-thesis-zh](content/skills/academic-skills/latex-thesis-zh/) | Chinese doctoral/master thesis LaTeX assistant with GB/T 7714 support |
| [paper-check](content/skills/academic-skills/paper-check/) | Academic paper quality inspection tool |
| [paper-replication](content/skills/academic-skills/paper-replication/) | Replicate deep learning papers into industrial-grade PyTorch code |
| [typst-paper](content/skills/academic-skills/typst-paper/) | Typst academic paper assistant with modular workflow |
| [xray-paper-skill](content/skills/academic-skills/xray-paper-skill/) | Deconstruct academic papers into core contributions and insights |
| [zoterosynth](content/skills/academic-skills/zoterosynth/) | Search, browse, and analyze Zotero libraries via zotero-mcp |

### 🤖 AI & LLM (`ai-llm-skills/`)
| Skill | Description |
|-------|-------------|
| [codex](content/skills/ai-llm-skills/codex/) | Codex CLI integration for deep code analysis and web search |
| [gemini](content/skills/ai-llm-skills/gemini/) | Gemini integration for enhanced reasoning |
| [gemini-image](content/skills/ai-llm-skills/gemini-image/) | AI image generation via Gemini API (text-to-image, image-to-image) |
| [research](content/skills/ai-llm-skills/research/) | Technical research with web search and citation support |

### 💻 Tech Stack (`tech-stack-skills/`)
| Skill | Description |
|-------|-------------|
| [frontend-engineer](content/skills/development-skills/frontend-engineer/) | Build distinctive, production-grade frontend interfaces |
| [lib-slint-expert](content/skills/tech-stack-skills/lib-slint-expert/) | Comprehensive Slint GUI development expert |
| [lsp-manager](content/skills/tech-stack-skills/lsp-manager/) | Auto-detect languages and configure LSP servers for code intelligence |
| [rust-cli-tui-developer](content/skills/tech-stack-skills/rust-cli-tui-developer/) | Expert guidance for Rust CLI and TUI development |
| [uv-expert](content/skills/tech-stack-skills/uv-expert/) | Expert guidance for uv Python package manager |
| [vue-best-practices](content/skills/tech-stack-skills/vue-best-practices/) | Vue 3 and TypeScript best practices with Volar |

### 🔧 Dev Tools (`devtools-skills/`)
| Skill | Description |
|-------|-------------|
| [karpathy-guidelines](content/skills/devtools-skills/karpathy-guidelines/) | Behavioral guidelines to reduce common LLM coding mistakes |
| [memory-system](content/skills/workflow-skills/memory-system/) | Local memory system: Markdown → SQLite hybrid search (vector + FTS5), incremental indexing, atomic transactions |
| [planning-with-files](content/skills/devtools-skills/planning-with-files/) | File-based planning for complex multi-step tasks |
| [review-code](content/skills/devtools-skills/review-code/) | Multi-dimensional code review with structured reports |
| [interview-openspec](content/skills/workflow-skills/interview-openspec/) | Create OpenSpec artifacts through Socratic interview (proposal → specs → design → tasks) |

### 📊 Diagrams (`diagram-skills/`)
| Skill | Description |
|-------|-------------|
| [drawio](content/skills/diagram-skills/drawio/) | AI-powered Draw.io diagram generation with real-time browser preview |
| [excalidraw](content/skills/diagram-skills/excalidraw/) | Create hand-drawn style diagrams as Excalidraw JSON files |
| [mermaid_expert](content/skills/diagram-skills/mermaid_expert/) | Expert guidance for Mermaid.js diagramming library |

### 📝 Documentation (`document-skills/`)
| Skill | Description |
|-------|-------------|
| [document-writer](content/skills/document-skills/document-writer/) | Technical writer for README, API docs, and architecture docs |
| [docx](content/skills/document-skills/docx/) | Create, read, edit, and manipulate Word documents (.docx files) |
| [pdf](content/skills/document-skills/pdf/) | Process PDF files: merge, split, extract text/tables, OCR, watermark |
| [pptx](content/skills/document-skills/pptx/) | Create, read, edit, and design PowerPoint presentations (.pptx files) |
| [tech-blog](content/skills/document-skills/tech-blog/) | Write technical blog posts with source code analysis |
| [tech-design-doc](content/skills/document-skills/tech-design-doc/) | Generate structured technical design documents |
| [xlsx](content/skills/document-skills/xlsx/) | Create, read, edit, and analyze Excel spreadsheets (.xlsx files) |

### 🐙 Git & GitHub (`git-github-skills/`)
| Skill | Description |
|-------|-------------|
| [gh-address-comments](content/skills/git-github-skills/gh-address-comments/) | Help address review/issue comments on open GitHub PR |
| [gh-bootstrap](content/skills/git-github-skills/gh-bootstrap/) | One-stop GitHub repository configuration tool |
| [gh-fix-ci](content/skills/git-github-skills/gh-fix-ci/) | Debug or fix failing GitHub PR checks in GitHub Actions |
| [git-commit-cn](content/skills/git-github-skills/git-commit-cn/) | Chinese version of git commit message generator |

### 🎨 Media (`media-skills/`)
| Skill | Description |
|-------|-------------|
| [article-cover](content/skills/media-skills/article-cover/) | Generate professional SVG cover images for blog posts and articles |
| [yt-dlp](content/skills/media-skills/yt-dlp/) | Video downloader for YouTube, Bilibili, and 1000+ sites |

### 🗃️ Obsidian (`obsidian-skills/`)
| Skill | Description |
|-------|-------------|
| [defuddle](content/skills/obsidian-skills/defuddle/) | Web content extraction and cleanup |
| [excalidraw-diagram](content/skills/obsidian-skills/excalidraw-diagram/) | Excalidraw diagrams for Obsidian |
| [json-canvas](content/skills/obsidian-skills/json-canvas/) | JSON Canvas file creation and editing |
| [mermaid-visualizer](content/skills/obsidian-skills/mermaid-visualizer/) | Mermaid diagram visualization for Obsidian |
| [obsidian-bases](content/skills/obsidian-skills/obsidian-bases/) | Obsidian Bases database views |
| [obsidian-canvas-creator](content/skills/obsidian-skills/obsidian-canvas-creator/) | Obsidian Canvas creation tool |
| [obsidian-cli](content/skills/obsidian-skills/obsidian-cli/) | Obsidian vault CLI operations |
| [obsidian-markdown](content/skills/obsidian-skills/obsidian-markdown/) | Obsidian-flavored Markdown writing |

### 🧩 Skill Development (`skill-meta-skills/`)
| Skill | Description |
|-------|-------------|
| [claude-expert-skill-creator](content/skills/skill-meta-skills/claude-expert-skill-creator/) | Create production-ready skills from expert knowledge |
| [github-to-skills](content/skills/skill-meta-skills/github-to-skills/) | Convert GitHub repos into AI skills automatically |
| [mcp-to-skill](content/skills/skill-meta-skills/mcp-to-skill/) | Convert MCP servers to Claude Code Skills |
| [skill_optimizer](content/skills/skill-meta-skills/skill_optimizer/) | Analyze Claude Code skills for compliance and token efficiency |
| [skill-evolution-manager](content/skills/skill-meta-skills/skill-evolution-manager/) | Evolve skills based on user feedback and experience |
| [skill-manager](content/skills/skill-meta-skills/skill-manager/) | Lifecycle manager for GitHub-based skills |
| [skill-seekers](content/skills/skill-meta-skills/skill-seekers/) | Generate LLM skills from documentation and codebases |

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

### Quick Install (Claude Code)
The fastest way to install all skills directly into Claude Code is using `npx`:

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

### TUI Mode (Recommended)
For a user-friendly experience, use the Terminal User Interface:

```bash
just mcs
```

**TUI Features:**
- 🎯 Visual platform selection
- 📁 Project path input for local installation
- 🔍 Real-time search and filtering
- ✅ Multi-select batch installation
- ⌨️ Keyboard shortcuts (`/` to search, `Space` to select, `i` to install)

### Legacy Universal Skills Dirs
- MCS only warns when legacy per-platform skill dirs are detected (`~/.codex/skills`, `~/.cursor/skills`, `~/.config/opencode/skills`, etc.).
- MCS does not auto-migrate legacy dirs into `~/.agents/skills`.

## Project Structure

```
.
├── mcs/                    # Rust TUI (ratatui + crossterm)
├── content/                # All installable content
│   ├── skills/             # Skills directory (categorized)
│   │   ├── academic-skills/    # Academic writing & research
│   │   ├── ai-llm-skills/      # AI & LLM integrations
│   │   ├── development-skills/ # Development frameworks & languages
│   │   ├── devtools-skills/    # Developer tools & workflows
│   │   ├── diagram-skills/     # Diagram generation
│   │   ├── document-skills/    # Document processing & writing
│   │   ├── git-github-skills/  # Git & GitHub utilities
│   │   ├── media-skills/       # Media & visual content
│   │   ├── obsidian-skills/    # Obsidian knowledge management
│   │   ├── skill-meta-skills/  # Skill creation & management
│   │   └── default.toml        # Default category config
│   ├── commands/           # Slash commands
│   │   ├── claude/             # Claude-specific commands
│   │   ├── gemini/             # Gemini-specific commands
│   │   ├── antigravity/        # Antigravity workflows
│   │   ├── windsurf/           # Windsurf workflows
│   │   └── trae/               # Trae workflows
│   ├── agents/             # AI agent definitions (CCW + Specialist)
│   └── prompts/            # Global prompts (CLAUDE.md)
└── tools/                  # Tool sub-projects
    ├── agentkit-desktop/   # Tauri + React desktop app
    ├── external-skills/    # External skill registry & installer
    └── plugin-scripts/     # Claude plugin installer scripts
```

## Contributing

1. Create a new directory under `content/skills/`.
2. Create `SKILL.md` with the skill definition.
3. (Optional) Add `scripts/`, `config/`, or `references/`.
4. Run `just mcs` to browse and test your skill.

## License

MIT
