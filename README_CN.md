# MyClaude Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Claude Code 技能和提示词集合，用于增强 AI 辅助开发工作流。

## 特性

- 🎯 可复用的 AI 技能模块，覆盖前端设计、技术研究、文档生成等场景
- 📦 统一的技能定义格式（`SKILL.md`），便于扩展和维护
- 🔄 跨平台 Python 安装脚本 (`src/install.py`)
- 🎛️ 多目标支持：Claude Code (`~/.claude/`), Codex CLI (`~/.codex/`), Gemini CLI (`~/.gemini/`), Qwen Code (`~/.qwen/`), Google Antigravity (`~/.gemini/antigravity/`) 和 Windsurf (`~/.codeium/windsurf/`)
- ⚡ 斜杠命令，用于常见工作流（git commit 等）

## 前置要求

- Git
- Python 3.6+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex CLI](https://github.com/openai/codex), [Gemini CLI](https://geminicli.com), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Google Antigravity](https://antigravity.google/), 或 [Windsurf](https://windsurf.com/)

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# 安装所有技能
uv run python src/install.py install-all

# 更新全局提示词配置
uv run python src/install.py prompt-update

# 或使用 Rust MCS TUI 进行交互式管理（需已安装 Rust/cargo）
just mcs
```

运行 `uv run python src/install.py --help` 查看更多选项。

## 技能列表

技能按领域分类，组织在 `skills/` 下的分类文件夹中。

### 🎓 学术 (`academic-skills/`)
| 技能 | 描述 |
|------|------|
| [academic-slides](skills/academic-skills/academic-slides/) | 学术幻灯片生成，支持双引擎（Typst Touying 和 LaTeX Beamer） |
| [IEEE-writing-skills](skills/academic-skills/IEEE-writing-skills/) | IEEE 学术论文翻译、润色、重构和格式验证 |
| [latex-paper-en](skills/academic-skills/latex-paper-en/) | 英文学术论文 LaTeX 助手，支持会议/期刊论文 |
| [latex-thesis-zh](skills/academic-skills/latex-thesis-zh/) | 中文博士/硕士学位论文 LaTeX 助手，支持 GB/T 7714 |
| [paper-check](skills/academic-skills/paper-check/) | 学术论文全流程质检工具 |
| [paper-replication](skills/academic-skills/paper-replication/) | 将深度学习论文复现为工业级 PyTorch 代码 |
| [typst-paper](skills/academic-skills/typst-paper/) | Typst 学术论文助手，支持模块化工作流 |
| [xray-paper-skill](skills/academic-skills/xray-paper-skill/) | 解构学术论文核心贡献与洞见 |
| [zoterosynth](skills/academic-skills/zoterosynth/) | 通过 zotero-mcp 搜索、浏览和分析 Zotero 文献库 |

### 🤖 AI 与 LLM (`ai-llm-skills/`)
| 技能 | 描述 |
|------|------|
| [codex](skills/ai-llm-skills/codex/) | Codex CLI 集成，支持深度代码分析和网络搜索 |
| [gemini](skills/ai-llm-skills/gemini/) | Gemini 集成，增强推理能力 |
| [gemini-image](skills/ai-llm-skills/gemini-image/) | 通过 Gemini API 生成图像（文生图、图生图） |
| [research](skills/ai-llm-skills/research/) | 技术研究，支持网络搜索和引用 |

### 💻 开发 (`development-skills/`)
| 技能 | 描述 |
|------|------|
| [frontend-engineer](skills/development-skills/frontend-engineer/) | 构建独特的生产级前端界面 |
| [lib-slint-expert](skills/development-skills/lib-slint-expert/) | 全面的 Slint GUI 开发专家 |
| [lsp-manager](skills/development-skills/lsp-manager/) | 自动检测编程语言并配置 LSP 服务器 |
| [rust-cli-tui-developer](skills/development-skills/rust-cli-tui-developer/) | Rust CLI 和 TUI 开发专家指导 |
| [uv-expert](skills/development-skills/uv-expert/) | uv Python 包管理器专家指导 |
| [vue-best-practices](skills/development-skills/vue-best-practices/) | Vue 3 和 TypeScript 最佳实践，支持 Volar |

### 🔧 开发工具 (`devtools-skills/`)
| 技能 | 描述 |
|------|------|
| [karpathy-guidelines](skills/devtools-skills/karpathy-guidelines/) | 减少常见 LLM 编码错误的行为准则 |
| [memory-system](skills/devtools-skills/memory-system/) | 本地记忆系统，将 Markdown 文件索引到 SQLite 实现跨会话语义搜索 |
| [planning-with-files](skills/devtools-skills/planning-with-files/) | 基于文件的复杂多步骤任务规划 |
| [review-code](skills/devtools-skills/review-code/) | 多维度代码审查，生成结构化报告 |
| [spec-interview](skills/devtools-skills/spec-interview/) | 通过系统性访谈完善技术规格，集成 OpenSpec |

### 📊 图表 (`diagram-skills/`)
| 技能 | 描述 |
|------|------|
| [drawio](skills/diagram-skills/drawio/) | AI 驱动的 Draw.io 图表生成工具，支持实时浏览器预览 |
| [excalidraw](skills/diagram-skills/excalidraw/) | 创建手绘风格的 Excalidraw JSON 图表 |
| [mermaid_expert](skills/diagram-skills/mermaid_expert/) | Mermaid.js 图表库专家指导 |

### 📝 文档 (`document-skills/`)
| 技能 | 描述 |
|------|------|
| [document-writer](skills/document-skills/document-writer/) | 技术写手，撰写 README、API 文档和架构文档 |
| [docx](skills/document-skills/docx/) | 创建、读取、编辑和操作 Word 文档（.docx 文件） |
| [pdf](skills/document-skills/pdf/) | 处理 PDF 文件：合并、拆分、提取文本/表格、OCR、水印 |
| [pptx](skills/document-skills/pptx/) | 创建、读取、编辑和设计 PowerPoint 演示文稿（.pptx 文件） |
| [tech-blog](skills/document-skills/tech-blog/) | 撰写带源码分析的技术博客 |
| [tech-design-doc](skills/document-skills/tech-design-doc/) | 生成结构化的技术设计文档 |
| [xlsx](skills/document-skills/xlsx/) | 创建、读取、编辑和分析 Excel 电子表格（.xlsx 文件） |

### 🐙 Git 与 GitHub (`git-github-skills/`)
| 技能 | 描述 |
|------|------|
| [gh-address-comments](skills/git-github-skills/gh-address-comments/) | 帮助处理 GitHub PR 上的审查/问题评论 |
| [gh-bootstrap](skills/git-github-skills/gh-bootstrap/) | 一站式 GitHub 仓库配置初始化工具 |
| [gh-fix-ci](skills/git-github-skills/gh-fix-ci/) | 调试或修复 GitHub Actions 中失败的 PR 检查 |
| [git-commit-cn](skills/git-github-skills/git-commit-cn/) | 中文版 git commit 信息生成器 |

### 🎨 媒体 (`media-skills/`)
| 技能 | 描述 |
|------|------|
| [article-cover](skills/media-skills/article-cover/) | 为博客文章生成专业的 SVG 封面图 |
| [yt-dlp](skills/media-skills/yt-dlp/) | 强大的视频下载工具，支持 YouTube、Bilibili 等 1000+ 网站 |

### 🗃️ Obsidian (`obsidian-skills/`)
| 技能 | 描述 |
|------|------|
| [defuddle](skills/obsidian-skills/defuddle/) | 网页内容提取与清理 |
| [excalidraw-diagram](skills/obsidian-skills/excalidraw-diagram/) | Obsidian Excalidraw 图表 |
| [json-canvas](skills/obsidian-skills/json-canvas/) | JSON Canvas 文件创建与编辑 |
| [mermaid-visualizer](skills/obsidian-skills/mermaid-visualizer/) | Obsidian Mermaid 图表可视化 |
| [obsidian-bases](skills/obsidian-skills/obsidian-bases/) | Obsidian Bases 数据库视图 |
| [obsidian-canvas-creator](skills/obsidian-skills/obsidian-canvas-creator/) | Obsidian Canvas 创建工具 |
| [obsidian-cli](skills/obsidian-skills/obsidian-cli/) | Obsidian 仓库 CLI 操作 |
| [obsidian-markdown](skills/obsidian-skills/obsidian-markdown/) | Obsidian 风格 Markdown 写作 |

### 🧩 技能开发 (`skill-meta-skills/`)
| 技能 | 描述 |
|------|------|
| [claude-expert-skill-creator](skills/skill-meta-skills/claude-expert-skill-creator/) | 从专家知识创建生产级技能 |
| [github-to-skills](skills/skill-meta-skills/github-to-skills/) | 自动将 GitHub 仓库转换为 AI 技能 |
| [mcp-to-skill](skills/skill-meta-skills/mcp-to-skill/) | 将 MCP 服务器转换为 Claude Code 技能 |
| [skill_optimizer](skills/skill-meta-skills/skill_optimizer/) | 分析 Claude Code 技能的合规性和 token 效率 |
| [skill-evolution-manager](skills/skill-meta-skills/skill-evolution-manager/) | 基于用户反馈的技能进化管理器 |
| [skill-manager](skills/skill-meta-skills/skill-manager/) | GitHub 技能生命周期管理器 |
| [skill-seekers](skills/skill-meta-skills/skill-seekers/) | 从文档、代码库和 GitHub 仓库生成 LLM 技能 |

## 命令

斜杠命令提供常见工作流的快捷访问。支持 Claude 和 Gemini 平台。

### Claude 命令

| 命令 | 描述 |
|------|------|
| [export-summary](commands/claude/export-summary.md) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](commands/claude/import-summary.md) | 从总结文件中恢复会话上下文 |
| [git-commit](commands/claude/zcf/git-commit.md) | 分析改动并生成 Conventional Commits 风格的提交信息（可选 emoji） |
| [git-cleanBranches](commands/claude/zcf/git-cleanBranches.md) | 安全查找并清理已合并或过期的 Git 分支，支持 dry-run 模式 |
| [git-rollback](commands/claude/zcf/git-rollback.md) | 交互式回滚 Git 分支到历史版本 |
| [git-worktree](commands/claude/zcf/git-worktree.md) | 管理 Git worktree，支持智能默认和 IDE 集成 |
| [init-project](commands/claude/zcf/init-project.md) | 初始化项目 AI 上下文，生成 CLAUDE.md 索引 |

### Gemini 命令

| 命令 | 描述 |
|------|------|
| [export-summary](commands/gemini/export-summary.toml) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](commands/gemini/import- summary.toml) | 从总结文件中恢复会话上下文 |
| [git-commit](commands/gemini/zcf/git-commit.toml) | 分析改动并生成 Conventional Commits 风格的提交信息（可选 emoji） |
| [git-cleanBranches](commands/gemini/zcf/git-cleanBranches.toml) | 安全查找并清理已合并或过期的 Git 分支，支持 dry-run 模式 |
| [git-rollback](commands/gemini/zcf/git-rollback.toml) | 交互式回滚 Git 分支到历史版本 |
| [git-worktree](commands/gemini/zcf/git-worktree.toml) | 管理 Git worktree，支持智能默认和 IDE 集成 |
| [init-project](commands/gemini/zcf/init-project.toml) | 初始化项目 AI 上下文，生成 CLAUDE.md 索引 |

### Antigravity 工作流

Google Antigravity IDE 的工作流，在 Agent 聊天中通过 `/workflow-name` 触发。

| 工作流 | 描述 |
|--------|------|
| [export-summary](commands/antigravity/export-summary.md) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](commands/antigravity/import-summary.md) | 从总结文件中恢复会话上下文 |
| [git-commit](commands/antigravity/git-commit.md) | 分析改动并生成 Conventional Commits 风格的提交信息 |

### Windsurf 工作流

Windsurf IDE 的工作流，在 Cascade 中通过 `/workflow-name` 触发。

| 工作流 | 描述 |
|--------|------|
| [export-summary](commands/windsurf/export-summary.md) | 总结会话上下文并导出为 Markdown 文件 |
| [import-summary](commands/windsurf/import-summary.md) | 从总结文件中恢复会话上下文 |
| [git-commit](commands/windsurf/git-commit.md) | 分析改动并生成 Conventional Commits 风格的提交信息 |

## 安装方法

### 基础安装

```bash
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills

# 安装所有技能到 Claude (默认)
uv run python src/install.py install-all

# 安装到 Gemini
uv run python src/install.py --target gemini install-all

# 安装到 Codex
uv run python src/install.py --target codex install-all

# 安装到 Qwen
uv run python src/install.py --target qwen install-all

# 安装到 Antigravity
uv run python src/install.py --target antigravity install-all

# 安装到 Windsurf
uv run python src/install.py --target windsurf install-all

# 更新全局 CLAUDE.md
uv run python src/install.py prompt-update
```

## 命令说明

| 命令 | 描述 |
|------|------|
| `uv run python src/install.py list` | 列出所有可用技能 |
| `uv run python src/install.py installed` | 列出已安装的技能 |
| `uv run python src/install.py install <skill> [skill2...]` | 安装指定技能 |
| `uv run python src/install.py install-all` | 安装所有技能 |
| `uv run python src/install.py interactive` | 交互式技能选择 |
| `uv run python src/install.py prompt-diff` | 显示本地与全局 CLAUDE.md 的差异 |
| `uv run python src/install.py prompt-update` | 同步 CLAUDE.md 到 ~/.claude/ |
| `uv run python src/install.py --target gemini <command>` | 以 Gemini 为目标执行命令 |

### TUI 模式 (推荐)

如需更友好的交互体验，可使用 MCS TUI (终端用户界面)：

```bash
just mcs
```

TUI 提供以下功能：
- 🎯 可视化平台选择 (Claude/Codex/Gemini/Qwen/Antigravity/Windsurf)
- 📋 Skills 和 Commands/Workflows 双标签页界面
- ⌨️ 键盘快捷键快速操作
- 🔍 实时搜索过滤
- ✅ 多选批量安装
- 📁 支持嵌套目录的命令（如 `zcf/git-commit`）
- 🔁 兼容旧入口：`uv run python src/install_tui.py` 会自动转发到 MCS

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

**依赖要求：** Python 3.10+ 和 [Textual](https://textual.textualize.io/) 库 (`uv add textual`)

## 项目结构

```
.
├── src/                    # Python 源代码
│   ├── install.py          # 统一 Python 安装脚本
│   ├── install_tui.py      # 旧入口兼容壳（转发到 MCS）
│   ├── launch_mcs.py       # MCS 启动包装脚本
│   ├── core/               # 共享模块 (paths, config, skill_meta)
│   └── tui/                # TUI 组件和屏幕
├── mcs/                    # Rust MCS TUI（ratatui + crossterm）
├── prompts/
│   ├── CLAUDE.md           # 全局工作流配置
│   └── TRANSLATE.md        # 翻译指南
├── commands/               # 斜杠命令
│   ├── claude/             # Claude 专用命令
│   ├── gemini/             # Gemini 专用命令
│   ├── antigravity/        # Antigravity 工作流
│   ├── windsurf/           # Windsurf 工作流
│   └── trae/               # Trae 工作流
├── skills/                 # 技能目录（按分类组织）
│   ├── academic-skills/    # 学术写作与研究
│   ├── ai-llm-skills/     # AI 与 LLM 集成
│   ├── development-skills/ # 开发框架与语言
│   ├── devtools-skills/    # 开发工具与工作流
│   ├── diagram-skills/     # 图表生成
│   ├── document-skills/    # 文档处理与写作
│   ├── git-github-skills/  # Git 与 GitHub 工具
│   ├── media-skills/       # 媒体与视觉内容
│   ├── obsidian-skills/    # Obsidian 知识管理
│   ├── skill-meta-skills/  # 技能创建与管理
│   └── default.toml        # 默认分类配置
└── skills/
    └── <skill-name>/
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

1. 在 `skills/` 下创建新目录：
   ```bash
   mkdir skills/my-new-skill
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
   ./install.sh install my-new-skill
   # or: uv run python src/install.py install my-new-skill
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
cd claude-plugin-install-scripts

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

插件配置保存在 `claude-plugin-install-scripts/plugins.toml` 中。详见 [插件安装器文档](claude-plugin-install-scripts/README.md)。

## 许可证

MIT
