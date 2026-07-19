# Skills

`skills/` 是一方 skill catalog。当前自动索引到 **6 个分类、37 个 skill**；每个条目都有独立详情页。

## 快速安装

```bash
npx skills add bahayonghang/my-claude-code-settings/skills
npx skills add bahayonghang/my-claude-code-settings/skills --skill '<skill-name>'
```

## 如何选择 skill

- 先按分类缩小范围：开发流程、工具集成、Git/GitHub、文档写作、研究学习。
- 再打开详情页确认触发场景、资源目录和验证方式。
- 如果一个任务跨多个 skill，优先选择能覆盖主要执行动作的最小 skill 集合。
- 修改或新增 skill 后，运行 `just docs-sync` 重新生成目录，再运行 `just docs-check`。

## 分类目录

### 学术研究工具

`academic-research-tools` · 1 skills

- [academic-figure](/skills/academic-research-tools/academic-figure) — Create or review academic figures in three modes.

### 开发者工具集成

`developer-tools-integrations` · 10 skills

- [agents-md-improver](/skills/developer-tools-integrations/agents-md-improver) — Audit and improve Codex AGENTS.md guidance files and companion code_map.md navigation maps.
- [archive-planning](/skills/developer-tools-integrations/archive-planning) — Archive root-level planning files (`task_plan.md`, `findings.md`, and `progress.md`) into a timestamped `.plannings/` directory for the current feature.
- [ast-grep](/skills/developer-tools-integrations/ast-grep) — Write, debug, and validate ast-grep structural code search rules.
- [claude-md-improver](/skills/developer-tools-integrations/claude-md-improver) — Audit and improve Claude Code CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps.
- [codex-workflow-recommender](/skills/developer-tools-integrations/codex-workflow-recommender) — Analyze a repository and current Codex environment, then recommend Codex CLI/App, AGENTS.md, skills, subagents, plugins, MCP servers, config/hooks, and OMX workflow improvements without modifying files.
- [goal-meta-skill](/skills/developer-tools-integrations/goal-meta-skill) — Turn vague or complex agent tasks into strong `/goal` commands for Claude Code and Codex — outcome, verification, constraints, boundaries, iteration policy, and stop conditions.
- [image-to-ui-skill](/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation; exclude image-only generation and reference-free UI polish.
- [ripgrep](/skills/developer-tools-integrations/ripgrep) — Use when the user needs text or regex content search with ripgrep: composing rg commands, choosing flags, glob/type filtering, multiline or PCRE2 searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed a file (gitignore, hidden, binary defaults).
- [uv-workflow](/skills/developer-tools-integrations/uv-workflow) — Use when a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script.
- [windows-dev-process-cleanup](/skills/developer-tools-integrations/windows-dev-process-cleanup) — Audit and safely clean Windows dev-process buildup and UWP background-task pileups — stale node/npm/cmd/pwsh trees (leaked Playwright MCP workers, dev servers, IDE services) and backgroundTaskHost.exe pileups.

### 开发工作流

`development-workflows` · 12 skills

- [code-auditor](/skills/development-workflows/code-auditor) — Structured code review across correctness, security, performance, readability, testing, and architecture.
- [code-quality-review](/skills/development-workflows/code-quality-review) — Run a code quality review focused on maintainability, structure, abstraction quality, and refactoring opportunities.
- [code-refactor](/skills/development-workflows/code-refactor) — Implement safe, behavior-preserving code refactors after inspecting the existing project.
- [codex-dynamic-workflows](/skills/development-workflows/codex-dynamic-workflows) — Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.
- [cold-shower](/skills/development-workflows/cold-shower) — Challenge ideas, plans, products, pricing, pitch narratives, and major decisions with a no-flattery adversarial review.
- [geju](/skills/development-workflows/geju) — Use when the user explicitly asks to think bigger, open up the design space, challenge conservative design, escape local-detail fixation, or make a bold high-level product or architecture direction call.
- [goudi](/skills/development-workflows/goudi) — Ground an ambitious proposal into the smallest verifiable first move with stop rules — pressure-test feasibility, avoid over-grand designs, make a bold direction executable.
- [handoff](/skills/development-workflows/handoff) — Write a handoff.md that lets a fresh session resume unfinished work cold.
- [html-artifact](/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs.
- [implementation-notes](/skills/development-workflows/implementation-notes) — Maintain a live implementation-notes.md while implementing a multi-step spec, PRD, design doc, or approved plan — capturing design decisions, intentional deviations, rejected alternatives, and open questions. Start before the first edit.
- [spark](/skills/development-workflows/spark) — Turn an idea into an approved implementation plan before coding — plan-first brainstorming.
- [unknowns-first](/skills/development-workflows/unknowns-first) — Diagnose a task before execution when the user may not yet know how to define success.

### 文档写作与发布

`docs-writing-publishing` · 5 skills

- [beautiful-mermaid-editor](/skills/docs-writing-publishing/beautiful-mermaid-editor) — Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.
- [bidwriter](/skills/docs-writing-publishing/bidwriter) — 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。
- [document-writer](/skills/docs-writing-publishing/document-writer) — Write or update technical documentation grounded in the real codebase.
- [renhua](/skills/docs-writing-publishing/renhua) — Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, and public technical essays.
- [touying](/skills/docs-writing-publishing/touying) — Author Typst slide decks with the Touying package.

### Git / GitHub 协作

`git-github-collaboration` · 4 skills

- [gh-address-comments](/skills/git-github-collaboration/gh-address-comments) — Address GitHub PR review comments and actionable review threads with GitHub CLI.
- [gh-bootstrap](/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-fix-ci](/skills/git-github-collaboration/gh-fix-ci) — Debug and fix failing GitHub PR checks with GitHub CLI.
- [git-commit](/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything.

### 研究、学习与知识

`research-learning-knowledge` · 5 skills

- [deep-research-pro](/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research for current-topic investigation, comparison, and cited report writing.
- [humanizer-paper](/skills/research-learning-knowledge/humanizer-paper) — Register-aware academic language polisher for English journal articles and Chinese doctoral dissertations: removes AI-writing tells while keeping academic norms.
- [literature-mentor](/skills/research-learning-knowledge/literature-mentor) — 文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文（计算机/深度学习/自动化方向，个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发；通过 Zotero MCP 优先获取全文，按用户意图自动选择快速筛选、导师深读或研究复盘模式。多篇论文综合、对比、找研究空白或批量规范化时改用 paper-workbench。
- [paper-workbench](/skills/research-learning-knowledge/paper-workbench) — Researcher-profile-driven paper intake and literature workbench for academic workflows.
- [roundtable](/skills/research-learning-knowledge/roundtable) — Multi-perspective roundtable discussion — a truth-seeking moderator plus a small set of representative real figures explore one topic through disciplined debate.

## Frontmatter 约定

仓库校验器要求 `SKILL.md` 使用可解析的 YAML frontmatter，并读取 `name`、`description`、`category`、`tags`、`version` 等顶层字段。新增 skill 时保持目录分类与 `category` 一致，并使用 kebab-case skill 名称。

## 校验方式

```bash
just docs-sync
just docs-check
just skills-check
just ci
```
