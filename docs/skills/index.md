# Skills Overview

A comprehensive collection of specialized AI skills organized into category folders.

## Available Skills

### 🎓 Academic (`academic-skills/`)
| Skill | Description |
|-------|-------------|
| [academic-slides](./academic-slides) | Academic slide generation with dual engines |
| [IEEE-writing-skills](./IEEE-writing-skills) | Translate, polish, restructure, and validate academic papers for IEEE publications |
| [latex-paper-en](./latex-paper-en) | LaTeX academic paper assistant for English papers (IEEE, ACM, Springer, NeurIPS, ICML) |
| [latex-thesis-zh](./latex-thesis-zh) | 中文学位论文 LaTeX 助手（博士/硕士论文） |
| [paper-check](./paper-check) | 学术论文全流程质检工具 |
| [paper-replication](./paper-replication) | Replicate deep learning papers into industrial-grade PyTorch code |
| [typst-paper](./typst-paper) | Typst 学术论文助手（支持中英文论文、会议/期刊投稿） |
| [xray-paper-skill](./xray-paper-skill) | Deconstruct academic papers into core contributions and insights |
| [zoterosynth](./zoterosynth) | Search, browse, and analyze Zotero libraries via zotero-mcp |

### 🤖 AI & LLM (`ai-llm-skills/`)
| Skill | Description |
|-------|-------------|
| [codex](./codex) | Execute Codex CLI for code generation, analysis, web search and web fetch |
| [gemini](./gemini) | Wield Google's Gemini CLI for code generation, review, analysis, and web research |
| [gemini-image](./gemini-image) | Generate images using AI for pictures, drawing, painting, or artwork |
| [research](./research) | Use codex web search for technical research with citation links |

### 💻 Development (`development-skills/`)
| Skill | Description |
|-------|-------------|
| [frontend-engineer](./frontend-engineer) | 前端 UI/UX 设计开发专家代理 |
| [lib-slint-expert](./lib-slint-expert) | Comprehensive Slint GUI development expert |
| [lsp-manager](./lsp-manager) | Automatically detect programming languages and configure Language Servers |
| [rust-cli-tui-developer](./rust-cli-tui-developer) | Expert guidance for Rust CLI and TUI development |
| [uv-expert](./uv-expert) | Expert guidance for uv Python package and project manager |
| [vue-best-practices](./vue-best-practices) | Vue 3 and Vue.js best practices for TypeScript and Volar |

### 🔧 Dev Tools (`devtools-skills/`)
| Skill | Description |
|-------|-------------|
| [karpathy-guidelines](./karpathy-guidelines) | Behavioral guidelines to reduce common LLM coding mistakes |
| [memory-system](./memory-system) | Persistent memory system with automatic session recovery |
| [planning-with-files](./planning-with-files) | Plan complex projects using file-based workflows |
| [review-code](./review-code) | Multi-dimensional code review with structured reports |
| [interview-plan](./interview-plan) | Socratic interview to refine requirements and generate executable plan |
| [interview-openspec](./interview-openspec) | Create OpenSpec artifacts through Socratic interview (proposal → specs → design → tasks) |

### 📊 Diagrams (`diagram-skills/`)
| Skill | Description |
|-------|-------------|
| [drawio](./drawio) | AI-powered Draw.io diagram generation with Design System |
| [excalidraw](./excalidraw) | Generate hand-drawn style diagrams as .excalidraw.json files |
| [mermaid_expert](./mermaid_expert) | Create Mermaid diagrams with expert guidance |

### 📝 Documentation (`document-skills/`)
| Skill | Description |
|-------|-------------|
| [document-writer](./document-writer) | 技术文档撰写专家代理 |
| [docx](./docx) | Create, read, edit, or manipulate Word documents (.docx files) |
| [pdf](./pdf) | Create, read, edit, or manipulate PDF files |
| [pptx](./pptx) | Create, read, edit, or manipulate PowerPoint presentations (.pptx files) |
| [tech-blog](./tech-blog) | Write technical blog posts with source code analysis or doc-driven research |
| [tech-design-doc](./tech-design-doc) | Generate technical design documents with proper structure and diagrams |
| [xlsx](./xlsx) | Create, read, edit, or manipulate spreadsheet files (.xlsx, .csv, .tsv) |

### 🐙 Git & GitHub (`git-github-skills/`)
| Skill | Description |
|-------|-------------|
| [gh-address-comments](./gh-address-comments) | Help address review/issue comments on open GitHub PR |
| [gh-bootstrap](./gh-bootstrap) | 一站式 GitHub 仓库配置初始化工具 |
| [gh-fix-ci](./gh-fix-ci) | Debug or fix failing GitHub PR checks in GitHub Actions |
| [git-commit-cn](./git-commit-cn) | 生成符合约定式提交规范的中文 Git 提交信息 |

### 🎨 Media (`media-skills/`)
| Skill | Description |
|-------|-------------|
| [article-cover](./article-cover) | Generate professional article cover images as SVG files |
| [yt-dlp](./yt-dlp) | 强大的视频下载工具，支持 YouTube 和 1000+ 网站 |

### 🗃️ Obsidian (`obsidian-skills/`)
| Skill | Description |
|-------|-------------|
| [defuddle](./defuddle) | Web content extraction and cleanup |
| [excalidraw-diagram](./excalidraw-diagram) | Excalidraw diagrams for Obsidian |
| [json-canvas](./json-canvas) | JSON Canvas file creation and editing |
| [mermaid-visualizer](./mermaid-visualizer) | Mermaid diagram visualization for Obsidian |
| [obsidian-bases](./obsidian-bases) | Obsidian Bases database views |
| [obsidian-canvas-creator](./obsidian-canvas-creator) | Obsidian Canvas creation tool |
| [obsidian-cli](./obsidian-cli) | Obsidian vault CLI operations |
| [obsidian-markdown](./obsidian-markdown) | Obsidian-flavored Markdown writing |

### 🧩 Skill Development (`skill-meta-skills/`)
| Skill | Description |
|-------|-------------|
| [claude-expert-skill-creator](./claude-expert-skill-creator) | Create production-ready skills from expert knowledge |
| [github-to-skills](./github-to-skills) | Automated factory for converting GitHub repositories into specialized AI skills |
| [mcp-to-skill](./mcp-to-skill) | Convert MCP servers into Claude Code skills |
| [skill_optimizer](./skill_optimizer) | Analyze Claude Code skills for compliance and token efficiency |
| [skill-evolution-manager](./skill-evolution-manager) | Optimize and iterate existing Skills based on user feedback |
| [skill-manager](./skill-manager) | Lifecycle manager for GitHub-based skills |
| [skill-seekers](./skill-seekers) | Generate LLM skills from documentation, codebases, and GitHub repositories |

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
