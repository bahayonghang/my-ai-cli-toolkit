# MyClaude Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Claude Code 技能和提示词集合，用于增强 AI 辅助开发工作流。

## 特性

- 🎯 可复用的 AI 技能模块，覆盖前端设计、技术研究、文档生成等场景
- 📦 统一的技能定义格式（`SKILL.md`），便于扩展和维护
- 🔄 Rust TUI (`mcs/`) 交互式技能管理，跨平台支持
- 🎛️ 多目标支持：Claude Code (`~/.claude/`), Codex CLI (`~/.codex/`), Gemini CLI (`~/.gemini/`), Qwen Code (`~/.qwen/`), Google Antigravity (`~/.gemini/antigravity/`) 和 Windsurf (`~/.codeium/windsurf/`)
- ⚡ 斜杠命令，用于常见工作流（git commit 等）

## 前置要求

- Git
- [Rust 工具链](https://rustup.rs/) (cargo)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex CLI](https://github.com/openai/codex), [Gemini CLI](https://geminicli.com), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Google Antigravity](https://antigravity.google/), 或 [Windsurf](https://windsurf.com/)

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# 使用 Rust MCS TUI 进行交互式管理（推荐）
just mcs
```

## 技能列表

技能按领域分类，组织在 `content/skills/` 下的分类文件夹中。

### 🎓 学术 (`academic-skills/`)
| 技能 | 描述 |
|------|------|
| [academic-slides](content/skills/academic-skills/academic-slides/) | 学术幻灯片生成，支持双引擎（Typst Touying 和 LaTeX Beamer） |
| [IEEE-writing-skills](content/skills/academic-skills/IEEE-writing-skills/) | IEEE 学术论文翻译、润色、重构和格式验证 |
| [latex-paper-en](content/skills/academic-skills/latex-paper-en/) | 英文学术论文 LaTeX 助手，支持会议/期刊论文 |
| [latex-thesis-zh](content/skills/academic-skills/latex-thesis-zh/) | 中文博士/硕士学位论文 LaTeX 助手，支持 GB/T 7714 |
| [paper-check](content/skills/academic-skills/paper-check/) | 学术论文全流程质检工具 |
| [paper-replication](content/skills/academic-skills/paper-replication/) | 将深度学习论文复现为工业级 PyTorch 代码 |
| [typst-paper](content/skills/academic-skills/typst-paper/) | Typst 学术论文助手，支持模块化工作流 |
| [xray-paper-skill](content/skills/academic-skills/xray-paper-skill/) | 解构学术论文核心贡献与洞见 |
| [zoterosynth](content/skills/academic-skills/zoterosynth/) | 通过 zotero-mcp 搜索、浏览和分析 Zotero 文献库 |

### 🤖 AI 与 LLM (`ai-llm-skills/`)
| 技能 | 描述 |
|------|------|
| [codex](content/skills/ai-llm-skills/codex/) | Codex CLI 集成，支持深度代码分析和网络搜索 |
| [gemini](content/skills/ai-llm-skills/gemini/) | Gemini 集成，增强推理能力 |
| [gemini-image](content/skills/ai-llm-skills/gemini-image/) | 通过 Gemini API 生成图像（文生图、图生图） |
| [research](content/skills/ai-llm-skills/research/) | 技术研究，支持网络搜索和引用 |

### 💻 开发 (`development-skills/`)
| 技能 | 描述 |
|------|------|
| [frontend-engineer](content/skills/development-skills/frontend-engineer/) | 构建独特的生产级前端界面 |
| [lib-slint-expert](content/skills/development-skills/lib-slint-expert/) | 全面的 Slint GUI 开发专家 |
| [lsp-manager](content/skills/development-skills/lsp-manager/) | 自动检测编程语言并配置 LSP 服务器 |
| [rust-cli-tui-developer](content/skills/development-skills/rust-cli-tui-developer/) | Rust CLI 和 TUI 开发专家指导 |
| [uv-expert](content/skills/development-skills/uv-expert/) | uv Python 包管理器专家指导 |
| [vue-best-practices](content/skills/development-skills/vue-best-practices/) | Vue 3 和 TypeScript 最佳实践，支持 Volar |

### 🔧 开发工具 (`devtools-skills/`)
| 技能 | 描述 |
|------|------|
| [karpathy-guidelines](content/skills/devtools-skills/karpathy-guidelines/) | 减少常见 LLM 编码错误的行为准则 |
| [memory-system](content/skills/workflow-skills/memory-system/) | 本地记忆系统：Markdown → SQLite 混合搜索（向量 + FTS5），增量索引，事务原子保护 |
| [planning-with-files](content/skills/devtools-skills/planning-with-files/) | 基于文件的复杂多步骤任务规划 |
| [review-code](content/skills/devtools-skills/review-code/) | 多维度代码审查，生成结构化报告 |
| [interview-plan](content/skills/workflow-skills/interview-plan/) | 通过苏格拉底式访谈细化需求，直接调用原生 Plan 模式生成可执行计划 |

### 📊 图表 (`diagram-skills/`)
| 技能 | 描述 |
|------|------|
| [drawio](content/skills/diagram-skills/drawio/) | AI 驱动的 Draw.io 图表生成工具，支持实时浏览器预览 |
| [excalidraw](content/skills/diagram-skills/excalidraw/) | 创建手绘风格的 Excalidraw JSON 图表 |
| [mermaid_expert](content/skills/diagram-skills/mermaid_expert/) | Mermaid.js 图表库专家指导 |

### 📝 文档 (`document-skills/`)
| 技能 | 描述 |
|------|------|
| [document-writer](content/skills/document-skills/document-writer/) | 技术写手，撰写 README、API 文档和架构文档 |
| [docx](content/skills/document-skills/docx/) | 创建、读取、编辑和操作 Word 文档（.docx 文件） |
| [pdf](content/skills/document-skills/pdf/) | 处理 PDF 文件：合并、拆分、提取文本/表格、OCR、水印 |
| [pptx](content/skills/document-skills/pptx/) | 创建、读取、编辑和设计 PowerPoint 演示文稿（.pptx 文件） |
| [tech-blog](content/skills/document-skills/tech-blog/) | 撰写带源码分析的技术博客 |
| [tech-design-doc](content/skills/document-skills/tech-design-doc/) | 生成结构化的技术设计文档 |
| [xlsx](content/skills/document-skills/xlsx/) | 创建、读取、编辑和分析 Excel 电子表格（.xlsx 文件） |

### 🐙 Git 与 GitHub (`git-github-skills/`)
| 技能 | 描述 |
|------|------|
| [gh-address-comments](content/skills/git-github-skills/gh-address-comments/) | 帮助处理 GitHub PR 上的审查/问题评论 |
| [gh-bootstrap](content/skills/git-github-skills/gh-bootstrap/) | 一站式 GitHub 仓库配置初始化工具 |
| [gh-fix-ci](content/skills/git-github-skills/gh-fix-ci/) | 调试或修复 GitHub Actions 中失败的 PR 检查 |
| [git-commit-cn](content/skills/git-github-skills/git-commit-cn/) | 中文版 git commit 信息生成器 |

### 🎨 媒体 (`media-skills/`)
| 技能 | 描述 |
|------|------|
| [article-cover](content/skills/media-skills/article-cover/) | 为博客文章生成专业的 SVG 封面图 |
| [yt-dlp](content/skills/media-skills/yt-dlp/) | 强大的视频下载工具，支持 YouTube、Bilibili 等 1000+ 网站 |

### 🗃️ Obsidian (`obsidian-skills/`)
| 技能 | 描述 |
|------|------|
| [defuddle](content/skills/obsidian-skills/defuddle/) | 网页内容提取与清理 |
| [excalidraw-diagram](content/skills/obsidian-skills/excalidraw-diagram/) | Obsidian Excalidraw 图表 |
| [json-canvas](content/skills/obsidian-skills/json-canvas/) | JSON Canvas 文件创建与编辑 |
| [mermaid-visualizer](content/skills/obsidian-skills/mermaid-visualizer/) | Obsidian Mermaid 图表可视化 |
| [obsidian-bases](content/skills/obsidian-skills/obsidian-bases/) | Obsidian Bases 数据库视图 |
| [obsidian-canvas-creator](content/skills/obsidian-skills/obsidian-canvas-creator/) | Obsidian Canvas 创建工具 |
| [obsidian-cli](content/skills/obsidian-skills/obsidian-cli/) | Obsidian 仓库 CLI 操作 |
| [obsidian-markdown](content/skills/obsidian-skills/obsidian-markdown/) | Obsidian 风格 Markdown 写作 |

### 🧩 技能开发 (`skill-meta-skills/`)
| 技能 | 描述 |
|------|------|
| [claude-expert-skill-creator](content/skills/skill-meta-skills/claude-expert-skill-creator/) | 从专家知识创建生产级技能 |
| [github-to-skills](content/skills/skill-meta-skills/github-to-skills/) | 自动将 GitHub 仓库转换为 AI 技能 |
| [mcp-to-skill](content/skills/skill-meta-skills/mcp-to-skill/) | 将 MCP 服务器转换为 Claude Code 技能 |
| [skill_optimizer](content/skills/skill-meta-skills/skill_optimizer/) | 分析 Claude Code 技能的合规性和 token 效率 |
| [skill-evolution-manager](content/skills/skill-meta-skills/skill-evolution-manager/) | 基于用户反馈的技能进化管理器 |
| [skill-manager](content/skills/skill-meta-skills/skill-manager/) | GitHub 技能生命周期管理器 |
| [skill-seekers](content/skills/skill-meta-skills/skill-seekers/) | 从文档、代码库和 GitHub 仓库生成 LLM 技能 |

## 命令

斜杠命令提供常见工作流的快捷访问。支持 Claude 和 Gemini 平台。

### Claude 命令

| 命令 | 描述 |
|------|------|
| [export-summary](content/commands/claude/export-summary.md) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](content/commands/claude/import-summary.md) | 从总结文件中恢复会话上下文 |
| [git-commit](content/commands/claude/zcf/git-commit.md) | 分析改动并生成 Conventional Commits 风格的提交信息（可选 emoji） |
| [git-cleanBranches](content/commands/claude/zcf/git-cleanBranches.md) | 安全查找并清理已合并或过期的 Git 分支，支持 dry-run 模式 |
| [git-rollback](content/commands/claude/zcf/git-rollback.md) | 交互式回滚 Git 分支到历史版本 |
| [git-worktree](content/commands/claude/zcf/git-worktree.md) | 管理 Git worktree，支持智能默认和 IDE 集成 |
| [init-project](content/commands/claude/zcf/init-project.md) | 初始化项目 AI 上下文，生成 CLAUDE.md 索引 |

### Gemini 命令

| 命令 | 描述 |
|------|------|
| [export-summary](content/commands/gemini/export-summary.toml) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](content/commands/gemini/import- summary.toml) | 从总结文件中恢复会话上下文 |
| [git-commit](content/commands/gemini/zcf/git-commit.toml) | 分析改动并生成 Conventional Commits 风格的提交信息（可选 emoji） |
| [git-cleanBranches](content/commands/gemini/zcf/git-cleanBranches.toml) | 安全查找并清理已合并或过期的 Git 分支，支持 dry-run 模式 |
| [git-rollback](content/commands/gemini/zcf/git-rollback.toml) | 交互式回滚 Git 分支到历史版本 |
| [git-worktree](content/commands/gemini/zcf/git-worktree.toml) | 管理 Git worktree，支持智能默认和 IDE 集成 |
| [init-project](content/commands/gemini/zcf/init-project.toml) | 初始化项目 AI 上下文，生成 CLAUDE.md 索引 |

### Antigravity 工作流

Google Antigravity IDE 的工作流，在 Agent 聊天中通过 `/workflow-name` 触发。

| 工作流 | 描述 |
|--------|------|
| [export-summary](content/commands/antigravity/export-summary.md) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](content/commands/antigravity/import-summary.md) | 从总结文件中恢复会话上下文 |
| [git-commit](content/commands/antigravity/git-commit.md) | 分析改动并生成 Conventional Commits 风格的提交信息 |

### Windsurf 工作流

Windsurf IDE 的工作流，在 Cascade 中通过 `/workflow-name` 触发。

| 工作流 | 描述 |
|--------|------|
| [export-summary](content/commands/windsurf/export-summary.md) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](content/commands/windsurf/import-summary.md) | 从总结文件中恢复会话上下文 |
| [git-commit](content/commands/windsurf/git-commit.md) | 分析改动并生成 Conventional Commits 风格的提交信息 |

## 安装方法

### 快速安装 (Claude Code)
将所有技能直接安装到 Claude Code 最快的方法是使用 `npx`：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

### TUI 模式 (推荐)

使用 MCS TUI (终端用户界面) 进行交互式管理：

```bash
just mcs
```

TUI 提供以下功能：
- 🎯 可视化平台选择 (Claude/Codex/Gemini/Qwen/Antigravity/Windsurf)
- 📋 Skills 和 Commands/Workflows 双标签页界面
- ⌨️ 键盘快捷键快速操作
- 🔍 实时搜索过滤
- ✅ 多选批量安装

**TUI 键盘快捷键：**

| 按键 | 功能 |
|------|------|
| `Tab` | 切换 Skills/Commands 标签页 |
| `i` / `Enter` | 安装当前聚焦项 |
| `Space` | 切换选择状态 |
| `s` | 安装选中项 |
| `a` | 安装全部 |
| `Ctrl+A` | 全选 |
| `Ctrl+D` | 取消全选 |
| `/` | 搜索 |
| `t` | 切换平台 |
| `q` | 退出 |

**依赖要求：** [Rust 工具链](https://rustup.rs/) (cargo)

## 项目结构

```
.
├── mcs/                    # Rust TUI（ratatui + crossterm）
├── content/                # 所有可安装内容
│   ├── skills/             # 技能目录（按分类组织）
│   │   ├── academic-skills/    # 学术写作与研究
│   │   ├── ai-llm-skills/      # AI 与 LLM 集成
│   │   ├── development-skills/ # 开发框架与语言
│   │   ├── devtools-skills/    # 开发工具与工作流
│   │   ├── diagram-skills/     # 图表生成
│   │   ├── document-skills/    # 文档处理与写作
│   │   ├── git-github-skills/  # Git 与 GitHub 工具
│   │   ├── media-skills/       # 媒体与视觉内容
│   │   ├── obsidian-skills/    # Obsidian 知识管理
│   │   ├── skill-meta-skills/  # 技能创建与管理
│   │   └── default.toml        # 默认分类配置
│   ├── commands/           # 斜杠命令
│   │   ├── claude/             # Claude 专用命令
│   │   ├── gemini/             # Gemini 专用命令
│   │   ├── antigravity/        # Antigravity 工作流
│   │   ├── windsurf/           # Windsurf 工作流
│   │   └── trae/               # Trae 工作流
│   ├── agents/             # AI 代理定义（CCW + Specialist）
│   └── prompts/            # 全局提示词（CLAUDE.md）
└── tools/                  # 工具子项目
    ├── agentkit-desktop/   # Tauri + React 桌面应用
    ├── external-skills/    # 外部技能注册与安装
    └── plugin-scripts/     # Claude 插件安装脚本
```

Each skill directory:
```
content/skills/<skill-name>/
├── SKILL.md        # 技能定义（必需）
├── config/         # 配置模板（可选）
├── tips/           # 使用提示（可选）
├── references/     # 参考文档（可选）
├── scripts/        # 辅助脚本（可选）
└── cookbook/       # 代码示例（可选）
```

## 提示词说明

### CLAUDE.md

基于 Linus Torvalds 风格工程原则的全局工作流配置：
- 强制 KISS/YAGNI 原则
- 结构化工作流（接收 → 上下文收集 → 探索 → 规划 → 执行 → 验证 → 交付）
- 通过 Codex 集成在线搜索
- 交付前自检清单

### TRANSLATE.md

技术内容翻译指南：
- 自然表达优先于逐字翻译
- 保留代码、品牌名和通用技术术语
- 对歧义术语添加标注

## 贡献指南

### 添加新技能

1. 在 `content/skills/` 下创建新目录：
   ```bash
   mkdir content/skills/my-new-skill
   ```

2. 创建包含 YAML frontmatter 的 `SKILL.md`：
   ```yaml
   ---
   name: my-new-skill
   description: 用于列表展示的简短描述
   license: MIT  # 可选
   ---

   # My New Skill

   详细说明和文档...
   ```

3. （可选）添加辅助目录：
   - `config/` - 配置模板
   - `tips/` - 使用提示
   - `references/` - 技术参考
   - `scripts/` - 辅助脚本
   - `cookbook/` - 代码示例

4. 测试安装：
   ```bash
   just mcs
   ```

### 贡献规范

- 保持 `SKILL.md` 聚焦且可操作
- 使用清晰简洁的语言
- 适当添加示例
- 遵循现有技能的模式以保持一致性

## 常见问题

**Q: Claude, Codex, Gemini, Qwen, Antigravity 和 Windsurf 目标有什么区别？**

A: 目标决定了技能和命令安装的目录：
- Claude: `~/.claude/skills/` 和 `~/.claude/commands/` (默认)
- Codex: `~/.codex/skills/` 和 `~/.codex/prompts/`
- Gemini: `~/.gemini/skills/` 和 `~/.gemini/commands/`
- Qwen: `~/.qwen/skills/` 和 `~/.qwen/commands/`
- Antigravity: `~/.gemini/antigravity/skills/` 和 `~/.gemini/antigravity/workflows/`
- Windsurf: `~/.codeium/windsurf/skills/` 和 `~/.codeium/windsurf/workflows/`

**Q: 如何更新已安装的技能？**

A: 重新运行安装命令即可，会用最新版本覆盖现有技能。

**Q: 可以使用多个来源的技能吗？**

A: 可以。`installed` 命令会显示哪些技能来自本仓库，哪些来自外部。

**Q: 更新 CLAUDE.md 时备份存储在哪里？**

A: 备份创建在 `~/.claude/` 目录下，带有时间戳后缀，如 `CLAUDE.md.backup.20240115_143022`。

## 插件安装器

跨平台 CLI 工具，用于从各种插件市场安装 Claude Code 插件。

```bash
cd tools/plugin-scripts

# 安装依赖
uv add typer rich tomli  # Python < 3.11
uv add typer rich        # Python >= 3.11

# 列出可用插件
uv run python install.py list

# 安装所有插件
uv run python install.py install --all

# 安装指定插件
uv run python install.py install python-development canvas

# 按分类安装
uv run python install.py install --category python

# 查看分类
uv run python install.py categories
```

插件配置保存在 `tools/plugin-scripts/plugins.toml` 中。详见 [插件安装器文档](tools/plugin-scripts/README.md)。

## 许可证

MIT
