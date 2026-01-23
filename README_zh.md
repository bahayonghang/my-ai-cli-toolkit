# MyClaude Skills (MyClaude 技能库)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个精选的 Claude Code 技能、提示词和工作流集合，旨在增强 AI 辅助开发体验。本项目提供了一个统一的框架，用于在多个平台上管理和安装 AI 技能，支持 Claude Code, Codex, Gemini, Qwen, Google Antigravity, 和 Windsurf。

## 特性

- 🎯 **模块化技能**: 可复用的 AI 技能模块，覆盖前端设计、技术研究、文档编写、学术写作等领域。
- 📦 **统一格式**: 标准化的 `SKILL.md` 定义文件，便于扩展和维护。
- 🔄 **跨平台支持**: 统一的 Python 安装脚本 (`install.py`)，可在 Windows, Linux, macOS 上运行。
- 🎛️ **多目标支持**:
  - **Claude Code** (`~/.claude/`)
  - **Codex CLI** (`~/.codex/`)
  - **Gemini CLI** (`~/.gemini/`)
  - **Qwen Code** (`~/.qwen/`)
  - **Google Antigravity** (`~/.gemini/antigravity/`)
  - **Windsurf** (`~/.codeium/windsurf/`)
- ⚡ **斜杠命令**: 快速访问常用工作流，如 `git commit`, `export-summary` 等。
- 🖥️ **TUI 管理界面**: 交互式终端用户界面，便于浏览和安装技能。
- 🧩 **外部技能**: 支持从 npm, pip 和 git 仓库安装技能。

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# 运行交互式 TUI (推荐)
python3 install_tui.py
```

或者使用命令行：

```bash
# 安装所有技能到 Claude (默认)
python3 install.py install-all

# 更新全局提示词配置
python3 install.py prompt-update
```

## 技能列表

技能是可以添加到您的 AI 助手中的专用能力。它们按领域分类如下。

### 🎨 设计 (Design)
| 技能 | 描述 |
|-------|-------------|
| [article-cover](skills/article-cover/) | 为博客文章生成专业的 SVG 封面图 |
| [drawio](skills/drawio/) | AI 驱动的 Draw.io 图表生成，支持实时浏览器预览 |
| [excalidraw](skills/excalidraw/) | 创建手绘风格的 Excalidraw JSON 图表文件 |
| [frontend-design](skills/frontend-design/) | 构建独特且达到生产级标准的前端界面 |
| [gemini-image](skills/gemini-image/) | 通过 Gemini API 生成图像 (文生图, 图生图) |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 高级 UI/UX 设计智能 (外部技能) |

### 💻 开发 (Development)
| 技能 | 描述 |
|-------|-------------|
| [codex](skills/codex/) | Codex CLI 集成，用于深度代码分析和网络搜索 |
| [paper-replication](skills/paper-replication/) | 将深度学习论文复现为工业级 PyTorch 代码 |
| [paper-check](skills/paper-check/) | 代码审查与验证助手 |
| [claude-expert-skill-creator](skills/claude-expert-skill-creator/) | 将专家知识转化为生产级技能 |
| [mcp-to-skill](skills/mcp-to-skill/) | 将 MCP 服务器转换为 Claude Code 技能 |
| [skill-manager](skills/skill-manager/) | 搜索并安装 31,767+ 个社区技能 |
| [skill-seekers](skills/skill-seekers/) | 从文档和代码库生成 LLM 技能 |
| [explore](skills/explore/) | 快速代码搜索代理，用于定位代码和追踪依赖 |
| [agent-browser](https://github.com/vercel-labs/agent-browser) | 来自 Vercel Labs 的浏览器自动化技能 (外部技能) |
| [gemini](skills/gemini/) | Gemini 集成，用于增强推理能力 |

### 🔍 研究 (Research)
| 技能 | 描述 |
|-------|-------------|
| [research](skills/research/) | 支持引用来源的技术研究与网络搜索 |
| [librarian](skills/librarian/) | 文档研究员，负责查找外部文档和最佳实践 |
| [multimodal-looker](skills/multimodal-looker/) | 视觉分析师，用于分析图像、PDF、图表等 |

### 📝 文档 (Documentation)
| 技能 | 描述 |
|-------|-------------|
| [tech-blog](skills/tech-blog/) | 编写包含源码分析的技术博客文章 |
| [tech-design-doc](skills/tech-design-doc/) | 生成结构化的技术设计文档 |
| [spec-interview](skills/spec-interview/) | 系统化访谈以完善技术规格说明书 (集成 OpenSpec) |
| [document-writer](skills/document-writer/) | 技术文档撰写，用于 README, API 文档和架构文档 |

### 🎓 学术 (Academic)
| 技能 | 描述 |
|-------|-------------|
| [IEEE-writing-skills](skills/IEEE-writing-skills/) | 翻译、润色、重构和验证 IEEE 出版物的学术论文 |
| [latex-paper-en](skills/latex-paper-en/) | 英语会议/期刊论文的 LaTeX 写作助手 |
| [latex-thesis-zh](skills/latex-thesis-zh/) | 支持 GB/T 7714 标准的中文硕博论文 LaTeX 助手 |
| [typst-paper](skills/typst-paper/) | Typst 学术论文助手，包含模块化工作流 |
| [git-commit-cn](skills/git-commit-cn/) | 中文版 git commit 消息生成器 |

### 🤖 OMO Agents (多智能体系统)
| 技能 | 描述 |
|-------|-------------|
| [omo-agents](skills/omo-agents/) | 多智能体编排系统概览 |
| [sisyphus](skills/sisyphus/) | 负责复杂任务规划和执行的主编排器 |
| [oracle](skills/oracle/) | 负责设计决策和代码审查的专家架构师 |

### 🛠️ 工具 (Utilities)
| 技能 | 描述 |
|-------|-------------|
| [yt-dlp](skills/yt-dlp/) | 视频下载器，支持 YouTube, Bilibili 等 1000+ 站点 |

## 命令 (Commands)

斜杠命令提供对常用工作流的快速访问。支持 Claude, Gemini, Antigravity, 和 Windsurf。

### 核心命令
| 命令 | 描述 |
|---------|-------------|
| `export-summary` | 总结会话上下文并导出为 Markdown 文件 |
| `import-summary` | 从摘要文件恢复会话上下文 |

### Git 工具 (ZCF)
| 命令 | 描述 |
|---------|-------------|
| `git-commit` | 分析变更并生成符合 Conventional Commits 规范的消息 |
| `git-cleanBranches` | 安全地查找并清理已合并或过期的 Git 分支 |
| `git-rollback` | 交互式地将 Git 分支回滚到历史版本 |
| `git-worktree` | 使用智能默认值管理 Git worktrees |
| `init-project` | 初始化项目 AI 上下文并生成 CLAUDE.md 索引 |

### 规划 (Gemini)
| 命令 | 描述 |
|---------|-------------|
| `plan/impl` | 实现规划工作流 |
| `plan/new` | 新功能规划工作流 |

## 安装指南

### 基础安装
```bash
# 安装所有技能到 Claude (默认)
python3 install.py install-all

# 安装到特定平台
python3 install.py --target gemini install-all
python3 install.py --target codex install-all
python3 install.py --target antigravity install-all
python3 install.py --target windsurf install-all
```

### 项目级安装
将技能安装到特定项目目录，而不是全局安装：

```bash
# 安装到项目目录
python3 install.py install frontend-engineer --project ./my-web-app

# 安装到 Kiro 项目 (.kiro/skills/ 结构)
python3 install.py install skill-name --project ./my-kiro-project --kiro
```

### TUI 模式 (推荐)
为了获得更友好的体验，请使用终端用户界面 (TUI)：

```bash
python3 install_tui.py
```

**TUI 特性:**
- 🎯 可视化平台选择
- 📁 本地安装的项目路径输入
- 🔍 实时搜索和过滤
- ✅ 多选批量安装
- ⌨️ 快捷键 (`/` 搜索, `Space` 选择, `i` 安装)

## 项目结构

```
.
├── install.py              # 统一 Python 安装脚本
├── install_tui.py          # 终端用户界面脚本
├── prompts/                # 全局提示词 (CLAUDE.md)
├── commands/               # 斜杠命令
│   ├── claude/             # Claude 专用命令
│   ├── gemini/             # Gemini 专用命令
│   ├── antigravity/        # Antigravity 工作流
│   └── windsurf/           # Windsurf 工作流
├── skills/                 # 本地技能目录
│   └── <skill-name>/       # 独立技能模块
└── external-skills/        # 外部技能配置
    └── registry.toml       # npm/pip/git 技能注册表
```

## 贡献指南

1. 在 `skills/` 下创建一个新目录。
2. 创建包含技能定义的 `SKILL.md` 文件。
3. (可选) 添加 `scripts/`, `config/`, 或 `references/`。
4. 运行 `./install.py install <your-skill>` 进行测试。

## 许可证

MIT
