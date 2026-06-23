# Skills

`skills/` 是一方 skill catalog。当前自动索引到 **5 个分类、31 个 skill**；每个条目都有独立详情页。

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

### 开发者工具集成

`developer-tools-integrations` · 8 skills

- [agent-skill-review](/skills/developer-tools-integrations/agent-skill-review) — Review Codex, Claude, OpenAI, or other agent skill directories as reusable capability packages.
- [agents-md-improver](/skills/developer-tools-integrations/agents-md-improver) — Audit and improve Codex AGENTS.md guidance files and companion code_map.md navigation maps in repositories.
- [archive-planning](/skills/developer-tools-integrations/archive-planning) — Archive root-level planning files (`task_plan.md`, `findings.md`, and `progress.md`) into a timestamped `.plannings/` directory for the current feature.
- [ast-grep](/skills/developer-tools-integrations/ast-grep) — Write, debug, and validate ast-grep structural code search rules.
- [claude-md-improver](/skills/developer-tools-integrations/claude-md-improver) — Audit and improve Claude Code CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps.
- [codex-workflow-recommender](/skills/developer-tools-integrations/codex-workflow-recommender) — Analyze a repository and current Codex environment, then recommend Codex CLI, Codex App, AGENTS.md, skills, native subagents, plugins, MCP servers, config/hooks, and optional OMX workflow improvements without modifying files.
- [goal-meta-skill](/skills/developer-tools-integrations/goal-meta-skill) — Turn vague or complex Codex tasks into strong `/goal` commands with outcome, verification, constraints, boundaries, iteration policy, completion evidence, and pause/block conditions.
- [image-to-ui-skill](/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图、设计稿、参考图复刻为可点击的前端/App demo:拆分代码渲染 UI 与必须生成的位图资产，生成提示词并把生成图接回页面。also use for image to UI, UI screenshot to code, clickable app demo, mobile prototype, iOS preview, high-fidelity UI recreation。涉及生图时优先项目指定 image2 入口，失败再走已登记的 OpenRouter ICU gpt-image-2 备案通道并标明实际通道；不要用 imagegen 或其他未指定工具替代。要求做成 App/手机/iOS 预览时，交付带 iOS 外边框的可点击预览与截图验真。

### 开发工作流

`development-workflows` · 11 skills

- [code-auditor](/skills/development-workflows/code-auditor) — Structured code review across correctness, security, performance, readability, testing, and architecture, with language-specific guidance and human-readable findings.
- [code-quality-review](/skills/development-workflows/code-quality-review) — Run a code quality review focused on maintainability, structure, abstraction quality, file growth, branching complexity, boundary cleanliness, and refactoring opportunities.
- [code-refactor](/skills/development-workflows/code-refactor) — Implement safe, behavior-preserving code refactors after inspecting the existing project.
- [codex-dynamic-workflows](/skills/development-workflows/codex-dynamic-workflows) — Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.
- [cold-shower](/skills/development-workflows/cold-shower) — Challenge ideas, requirements, technical plans, products, pricing, markets, pitch/BP narratives, and major personal decisions with a no-flattery adversarial review.
- [geju](/skills/development-workflows/geju) — Use when the user explicitly asks to think bigger, open up the design space, challenge conservative design, avoid over-indexing on backward compatibility, escape local-detail fixation, or make a bold high-level product or architecture direction call.
- [goudi](/skills/development-workflows/goudi) — Use when the user asks to ground an ambitious proposal, avoid over-grand designs, make a bold direction executable, pressure-test feasibility, prevent "too much vision and too little landing", or turn a strategy/refactor/product idea into the smallest verifiable first move with stop rules.
- [handoff](/skills/development-workflows/handoff) — Use when the user wants to compact context before auto-compaction kicks in, hand off an unfinished task to a fresh session, switch topics mid-stream and preserve state, or pick up yesterday's work in a new conversation.
- [html-artifact](/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts, single-file by default and split into offline per-page bundles when oversized, for complex, visual, comparison-heavy, reviewable, or shareable work outputs.
- [implementation-notes](/skills/development-workflows/implementation-notes) — Use when implementing a multi-step spec, PRD, design doc, GitHub issue, or approved plan where decisions, deviations, and tradeoffs accumulate during coding.
- [spark](/skills/development-workflows/spark) — Plan-first brainstorming workflow that turns an idea into an approved implementation plan before coding.

### 文档写作与发布

`docs-writing-publishing` · 4 skills

- [beautiful-mermaid-editor](/skills/docs-writing-publishing/beautiful-mermaid-editor) — Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.
- [bidwriter](/skills/docs-writing-publishing/bidwriter) — 智能标书编写专家，专精工程咨询、建筑设计、市政工程领域的投标文件编写。
- [document-writer](/skills/docs-writing-publishing/document-writer) — Write or update technical documentation from the real codebase and project files.
- [touying](/skills/docs-writing-publishing/touying) — Author Typst slide decks with the Touying package.

### Git / GitHub 协作

`git-github-collaboration` · 4 skills

- [gh-address-comments](/skills/git-github-collaboration/gh-address-comments) — Address GitHub PR review comments and actionable review threads with GitHub CLI.
- [gh-bootstrap](/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-fix-ci](/skills/git-github-collaboration/gh-fix-ci) — Debug and fix failing GitHub PR checks with GitHub CLI.
- [git-commit](/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or for all working-tree changes when the user explicitly asks to include everything.

### 研究、学习与知识

`research-learning-knowledge` · 4 skills

- [deep-research-pro](/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research skill for current-topic investigation, comparison, and cited report writing.
- [literature-mentor](/skills/research-learning-knowledge/literature-mentor) — 文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文，面向计算机科学、深度学习、自动化等方向（个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发，通过 Zotero MCP 优先获取全文，并根据用户意图自动选择快速筛选、导师深读或研究复盘模式。完整深读时先完成叙事类型判断、阅读前预检、novelty 校准和作者思考路径重建，再整体概览，并基于图例、正文和表格逐图详细解读（Zotero MCP 无法提取 PDF 图片，解读基于文字信息，必要时提醒上传图片）。适用于：(1)快速判断文献是否值得深读 (2)深入理解某篇论文 (3)学习文章中的方法和技术 (4)批判性分析研究设计 (5)寻找研究灵感。需要多篇论文综合、对比或找研究空白，或 arXiv/DOI 批量规范化时，改用 paper-workbench。
- [paper-workbench](/skills/research-learning-knowledge/paper-workbench) — Researcher-profile-driven paper intake and literature workbench for academic workflows.
- [roundtable](/skills/research-learning-knowledge/roundtable) — Multi-perspective roundtable discussion skill for exploring a topic through a truth-seeking moderator and a small set of representative real figures.

## Frontmatter 约定

仓库校验器要求 `SKILL.md` 使用可解析的 YAML frontmatter，并读取 `name`、`description`、`category`、`tags`、`version` 等顶层字段。新增 skill 时保持目录分类与 `category` 一致，并使用 kebab-case skill 名称。

## 校验方式

```bash
just docs-sync
just docs-check
just skills-check
just ci
```
