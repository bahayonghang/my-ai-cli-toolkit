# 技能概览

AI Skills Hub 提供了针对不同开发任务的专用 AI 技能集合，按分类组织在子文件夹中。

## 可用技能

### 🎓 学术 (`academic-skills/`)
| 技能 | 描述 |
|------|------|
| [academic-slides](./academic-skills/academic-slides) | 学术幻灯片生成，支持双引擎 |
| [IEEE-writing-skills](./academic-skills/IEEE-writing-skills) | IEEE 论文翻译、润色与验证 |
| [latex-paper-en](./academic-skills/latex-paper-en) | 英文学术论文 LaTeX 助手 |
| [latex-thesis-zh](./academic-skills/latex-thesis-zh) | 中文硕博论文 LaTeX 助手 |
| [paper-audit](./academic-skills/paper-audit) | 学术论文审查与质检工具 |
| [paper-replication](./academic-skills/paper-replication) | 将深度学习论文复现为 PyTorch 代码 |
| [typst-paper](./academic-skills/typst-paper) | Typst 学术论文助手 |
| [xray-paper-skill](./academic-skills/xray-paper-skill) | 解构学术论文核心贡献与洞见 |

### 🤖 AI 与 LLM (`ai-llm-skills/`)
| 技能 | 描述 |
|------|------|
| [codex](./ai-llm-skills/codex) | Codex CLI 代码分析与搜索 |
| [gemini](./ai-llm-skills/gemini) | Gemini 集成，增强推理能力 |
| [gemini-image](./ai-llm-skills/gemini-image) | 通过 Gemini API 生成图像 |
| [research](./ai-llm-skills/research) | 网络研究与引用 |

### 📊 图表 (`diagram-skills/`)
| 技能 | 描述 |
|------|------|
| [drawio](./diagram-skills/drawio) | AI 驱动的 Draw.io 图表，支持实时预览 |
| [excalidraw](./diagram-skills/excalidraw) | 手绘风格图表 |
| [mermaid_expert](./diagram-skills/mermaid_expert) | Mermaid.js 图表专家 |

### 📝 文档 (`document-skills/`)
| 技能 | 描述 |
|------|------|
| [document-writer](./document-skills/document-writer) | 技术文档撰写专家 |
| [docx](./document-skills/docx) | Word 文档处理 |
| [pdf](./document-skills/pdf) | PDF 文件处理 |
| [pptx](./document-skills/pptx) | PowerPoint 演示文稿处理 |
| [tech-blog](./document-skills/tech-blog) | 技术博客写作 |
| [tech-design-doc](./document-skills/tech-design-doc) | 技术设计文档生成 |
| [xlsx](./document-skills/xlsx) | Excel 电子表格处理 |

### 🐙 Git 与 GitHub (`git-github-skills/`)
| 技能 | 描述 |
|------|------|
| [gh-address-comments](./git-github-skills/gh-address-comments) | 处理 GitHub PR 审查评论 |
| [gh-bootstrap](./git-github-skills/gh-bootstrap) | GitHub 仓库配置工具 |
| [gh-fix-ci](./git-github-skills/gh-fix-ci) | 修复 GitHub Actions CI 失败 |
| [git-commit-cn](./git-github-skills/git-commit-cn) | 中文 git commit 信息生成器 |

### 🎨 媒体 (`media-skills/`)
| 技能 | 描述 |
|------|------|
| [article-cover](./media-skills/article-cover) | 生成文章 SVG 封面 |
| [yt-dlp](./media-skills/yt-dlp) | 视频下载器 |

### 🧩 技能开发 (`skill-meta-skills/`)
| 技能 | 描述 |
|------|------|
| [claude-expert-skill-creator](./skill-meta-skills/claude-expert-skill-creator) | 创建生产级技能 |
| [mcp-to-skill](./skill-meta-skills/mcp-to-skill) | 转换 MCP 服务器 |
| [skill-audit](./skill-meta-skills/skill-audit) | 技能合规性和 token 效率分析 |

### 💻 技术栈 (`tech-stack-skills/`)
| 技能 | 描述 |
|------|------|
| [frontend-engineer](./tech-stack-skills/frontend-engineer) | 前端 UI/UX 设计开发专家代理 |
| [lib-slint-expert](./tech-stack-skills/lib-slint-expert) | Slint GUI 开发专家 |
| [lsp-manager](./tech-stack-skills/lsp-manager) | 自动检测语言并配置 LSP 服务器 |
| [rust-cli-tui-developer](./tech-stack-skills/rust-cli-tui-developer) | Rust CLI 和 TUI 开发专家 |
| [uv-expert](./tech-stack-skills/uv-expert) | uv 包管理器专家 |
| [vue-best-practices](./tech-stack-skills/vue-best-practices) | Vue 3 最佳实践 |

### 🔧 工作流 (`workflow-skills/`)
| 技能 | 描述 |
|------|------|
| [interview-openspec](./workflow-skills/interview-openspec) | 通过苏格拉底式访谈创建 OpenSpec artifacts |
| [interview-plan](./workflow-skills/interview-plan) | 苏格拉底式访谈细化需求，调用原生 Plan 模式生成计划 |
| [karpathy-guidelines](./workflow-skills/karpathy-guidelines) | 减少 LLM 编码错误的行为准则 |
| [memory-system](./workflow-skills/memory-system) | 本地记忆系统，支持语义搜索 |
| [refactor-audit](./workflow-skills/refactor-audit) | 多维度代码审查 |

## 另请参阅：代理

需要专业 AI 代理？请查看 [代理](/zh/agents/) 部分：

- [@frontend-engineer](/zh/agents/frontend-engineer) - UI/UX 专家
- [@document-writer](/zh/agents/document-writer) - 技术写手

## 安装

安装所有技能：

::: code-group
```bash [Linux/macOS]
uv run python src/install.py install-all
```
```powershell [Windows]
uv run python src/install.py install-all
```
:::
