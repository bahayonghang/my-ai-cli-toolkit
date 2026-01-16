# Skills Overview

MyClaude Skills provides a collection of specialized AI skills for different development tasks.

## Available Skills

| Skill | Category | Description |
|-------|----------|-------------|
| [article-cover](./article-cover) | Design | Generate professional SVG cover images |
| [codex](./codex) | Development | Code analysis and web search via Codex CLI |
| [excalidraw](./excalidraw) | Design | Create hand-drawn style diagrams |
| [frontend-design](./frontend-design) | Design | Build distinctive frontend interfaces |
| [gemini-image](./gemini-image) | Design | AI image generation via Gemini API |
| [research](./research) | Research | Technical research with citations |
| [spec-interview](./spec-interview) | Planning | Refine specs through systematic questioning |
| [paper-replication](./paper-replication) | Development | Replicate deep learning papers to PyTorch |
| [tech-blog](./tech-blog) | Documentation | Write technical blog posts |
| [tech-design-doc](./tech-design-doc) | Documentation | Generate technical design documents |
| [claude-expert-skill-creator](./claude-expert-skill-creator) | Development | Create production-ready skills from expert knowledge |
| [mcp-to-skill](./mcp-to-skill) | Development | Convert MCP servers to Claude Code Skills |
| [IEEE-writing-skills](./IEEE-writing-skills) | Academic | Translate, polish, and validate IEEE papers |
| [latex-paper-en](./latex-paper-en) | Academic | LaTeX assistant for English academic papers |
| [latex-thesis-zh](./latex-thesis-zh) | Academic | Chinese thesis LaTeX assistant with GB/T 7714 |

### OMO Agents (Multi-Agent System)

| Skill | Role | Description |
|-------|------|-------------|
| [omo-agents](./omo-agents) | Overview | Multi-agent orchestration system guide |
| [sisyphus](./sisyphus) | Orchestrator | Complex task planning and parallel execution |
| [oracle](./oracle) | Architect | Design decisions, code review, debugging |
| [explore](./explore) | Scout | Fast code search and dependency tracing |
| [librarian](./librarian) | Researcher | External docs and best practices |
| [frontend-engineer](./frontend-engineer) | UI Expert | Beautiful, polished interfaces |
| [document-writer](./document-writer) | Writer | README, API docs, architecture docs |
| [multimodal-looker](./multimodal-looker) | Analyst | Images, PDFs, charts analysis |

## Skill Categories

### Design Skills
Skills for creating visual assets and interfaces:
- **article-cover** - SVG cover images for articles
- **excalidraw** - Hand-drawn diagrams
- **frontend-design** - Production-grade UI
- **gemini-image** - AI-generated images

### Development Skills
Skills for code analysis and generation:
- **codex** - Deep code analysis with Codex CLI
- **paper-replication** - Deep learning paper to PyTorch code

### Research Skills
Skills for gathering and organizing information:
- **research** - Web research with citations

### Documentation Skills
Skills for creating technical documents:
- **tech-blog** - Technical blog posts
- **tech-design-doc** - Design documents
- **spec-interview** - Specification refinement

### Academic Writing Skills
Skills for academic paper and thesis writing:
- **IEEE-writing-skills** - IEEE paper translation, polishing, restructuring, and validation
- **latex-paper-en** - English academic paper LaTeX assistant with format checking and compilation
- **latex-thesis-zh** - Chinese thesis LaTeX assistant with GB/T 7714 format support

### Skill Development
Skills for creating new skills:
- **claude-expert-skill-creator** - Create production-ready skills with layered architecture
- **mcp-to-skill** - Convert MCP servers to Claude Code Skills

### OMO Agents (Multi-Agent System)

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), these skills enable multi-agent collaboration where specialized agents work together on complex tasks.

**Core Concept**: Instead of a single AI handling everything, specialized agents collaborate—each excelling in their domain—to deliver better results.

- **sisyphus** - Main orchestrator that plans, delegates, and executes complex tasks
- **oracle** - Expert architect for design decisions and code review
- **explore** - Fast code search for locating code and tracing dependencies
- **librarian** - Documentation researcher for external docs and best practices
- **frontend-engineer** - UI/UX expert for creating beautiful interfaces
- **document-writer** - Technical writer for README and API docs
- **multimodal-looker** - Visual analyst for images, PDFs, and charts

**Quick Start**:
```
@sisyphus Add user authentication to this project
```

Sisyphus will automatically coordinate other agents to complete the task.

## Installation

Install all skills:

::: code-group
```bash [Linux/macOS]
./install.sh install-all
```
```powershell [Windows]
.\install.ps1 install-all
```
:::

Install specific skills:

::: code-group
```bash [Linux/macOS]
./install.sh install frontend-design excalidraw
```
```powershell [Windows]
.\install.ps1 install frontend-design excalidraw
```
:::
