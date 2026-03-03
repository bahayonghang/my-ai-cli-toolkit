# Skills Overview

A comprehensive collection of specialized AI skills organized into category folders.

## Available Skills

### 🎓 Academic (`academic-skills/`)
| Skill | Description |
|-------|-------------|
| [academic-slides](./academic-skills/academic-slides) | Academic slide generation with dual engines |
| [IEEE-writing-skills](./academic-skills/IEEE-writing-skills) | Translate, polish, restructure, and validate academic papers for IEEE publications |
| [latex-paper-en](./academic-skills/latex-paper-en) | LaTeX academic paper assistant for English papers (IEEE, ACM, Springer, NeurIPS, ICML) |
| [latex-thesis-zh](./academic-skills/latex-thesis-zh) | 中文学位论文 LaTeX 助手（博士/硕士论文） |
| [paper-audit](./academic-skills/paper-audit) | Unified paper audit for Chinese and English papers |
| [paper-replication](./academic-skills/paper-replication) | Replicate deep learning papers into industrial-grade PyTorch code |
| [typst-paper](./academic-skills/typst-paper) | Typst 学术论文助手（支持中英文论文、会议/期刊投稿） |
| [xray-paper-skill](./academic-skills/xray-paper-skill) | Deconstruct academic papers into core contributions and insights |

### 🤖 AI & LLM (`ai-llm-skills/`)
| Skill | Description |
|-------|-------------|
| [codex](./ai-llm-skills/codex) | Execute Codex CLI for code generation, analysis, web search and web fetch |
| [gemini](./ai-llm-skills/gemini) | Wield Google's Gemini CLI for code generation, review, analysis, and web research |
| [gemini-image](./ai-llm-skills/gemini-image) | Generate images using AI for pictures, drawing, painting, or artwork |
| [research](./ai-llm-skills/research) | Use codex web search for technical research with citation links |

### 📊 Diagrams (`diagram-skills/`)
| Skill | Description |
|-------|-------------|
| [drawio](./diagram-skills/drawio) | AI-powered Draw.io diagram generation with Design System |
| [excalidraw](./diagram-skills/excalidraw) | Generate hand-drawn style diagrams as .excalidraw.json files |
| [mermaid_expert](./diagram-skills/mermaid_expert) | Create Mermaid diagrams with expert guidance |

### 📝 Documentation (`document-skills/`)
| Skill | Description |
|-------|-------------|
| [document-writer](./document-skills/document-writer) | 技术文档撰写专家代理 |
| [docx](./document-skills/docx) | Create, read, edit, or manipulate Word documents (.docx files) |
| [pdf](./document-skills/pdf) | Create, read, edit, or manipulate PDF files |
| [pptx](./document-skills/pptx) | Create, read, edit, or manipulate PowerPoint presentations (.pptx files) |
| [tech-blog](./document-skills/tech-blog) | Write technical blog posts with source code analysis or doc-driven research |
| [tech-design-doc](./document-skills/tech-design-doc) | Generate technical design documents with proper structure and diagrams |
| [xlsx](./document-skills/xlsx) | Create, read, edit, or manipulate spreadsheet files (.xlsx, .csv, .tsv) |

### 🐙 Git & GitHub (`git-github-skills/`)
| Skill | Description |
|-------|-------------|
| [gh-address-comments](./git-github-skills/gh-address-comments) | Help address review/issue comments on open GitHub PR |
| [gh-bootstrap](./git-github-skills/gh-bootstrap) | 一站式 GitHub 仓库配置初始化工具 |
| [gh-fix-ci](./git-github-skills/gh-fix-ci) | Debug or fix failing GitHub PR checks in GitHub Actions |
| [git-commit-cn](./git-github-skills/git-commit-cn) | 生成符合约定式提交规范的中文 Git 提交信息 |

### 🎨 Media (`media-skills/`)
| Skill | Description |
|-------|-------------|
| [article-cover](./media-skills/article-cover) | Generate professional article cover images as SVG files |
| [yt-dlp](./media-skills/yt-dlp) | 强大的视频下载工具，支持 YouTube 和 1000+ 网站 |

### 🧩 Skill Development (`skill-meta-skills/`)
| Skill | Description |
|-------|-------------|
| [claude-expert-skill-creator](./skill-meta-skills/claude-expert-skill-creator) | Create production-ready skills from expert knowledge |
| [mcp-to-skill](./skill-meta-skills/mcp-to-skill) | Convert MCP servers into Claude Code skills |
| [skill-audit](./skill-meta-skills/skill-audit) | Analyze Claude Code skills for compliance and token efficiency |

### 💻 Tech Stack (`tech-stack-skills/`)
| Skill | Description |
|-------|-------------|
| [frontend-engineer](./tech-stack-skills/frontend-engineer) | 前端 UI/UX 设计开发专家代理 |
| [lib-slint-expert](./tech-stack-skills/lib-slint-expert) | Comprehensive Slint GUI development expert |
| [lsp-manager](./tech-stack-skills/lsp-manager) | Automatically detect programming languages and configure Language Servers |
| [rust-cli-tui-developer](./tech-stack-skills/rust-cli-tui-developer) | Expert guidance for Rust CLI and TUI development |
| [uv-expert](./tech-stack-skills/uv-expert) | Expert guidance for uv Python package and project manager |
| [vue-best-practices](./tech-stack-skills/vue-best-practices) | Vue 3 and Vue.js best practices for TypeScript and Volar |

### 🔧 Workflow (`workflow-skills/`)
| Skill | Description |
|-------|-------------|
| [interview-openspec](./workflow-skills/interview-openspec) | Create OpenSpec artifacts through Socratic interview |
| [interview-plan](./workflow-skills/interview-plan) | Socratic interview to refine requirements and generate executable plan |
| [karpathy-guidelines](./workflow-skills/karpathy-guidelines) | Behavioral guidelines to reduce common LLM coding mistakes |
| [memory-system](./workflow-skills/memory-system) | Persistent memory system with automatic session recovery |
| [refactor-audit](./workflow-skills/refactor-audit) | Multi-dimensional code review with structured reports |

## Installation

Install all skills:

::: code-group
```bash [Linux/macOS]
uv run python src/install.py install-all
```
```powershell [Windows]
uv run python src/install.py install-all
```
:::
