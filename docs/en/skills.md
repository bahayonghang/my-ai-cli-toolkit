# Skills

`skills/` is the first-party skill catalog. The generated catalog currently indexes **5 categories and 33 skills**; every entry has its own detail page.

## Quick install

```bash
npx skills add bahayonghang/my-claude-code-settings/skills
npx skills add bahayonghang/my-claude-code-settings/skills --skill '<skill-name>'
```

## How to choose a skill

- Start with the category: development workflow, tool integration, Git/GitHub, docs writing, or research/learning.
- Open the detail page to confirm trigger scenarios, bundled resources, and validation commands.
- If a task spans multiple skills, choose the smallest skill set that covers the main execution path.
- After adding or changing a skill, run `just docs-sync` to regenerate the catalog, then `just docs-check`.

## Category catalog

### Developer Tools & Integrations

`developer-tools-integrations` · 8 skills

- [agent-skill-review](/en/skills/developer-tools-integrations/agent-skill-review) — Review Codex, Claude, OpenAI, or other agent skill directories as reusable capability packages.
- [agents-md-improver](/en/skills/developer-tools-integrations/agents-md-improver) — Audit and improve Codex AGENTS.md guidance files and companion code_map.md navigation maps in repositories.
- [archive-planning](/en/skills/developer-tools-integrations/archive-planning) — Archive root-level planning files (`task_plan.md`, `findings.md`, and `progress.md`) into a timestamped `.plannings/` directory for the current feature.
- [ast-grep](/en/skills/developer-tools-integrations/ast-grep) — Write, debug, and validate ast-grep structural code search rules.
- [claude-md-improver](/en/skills/developer-tools-integrations/claude-md-improver) — Audit and improve Claude Code CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps.
- [codex-workflow-recommender](/en/skills/developer-tools-integrations/codex-workflow-recommender) — Analyze a repository and current Codex environment, then recommend Codex CLI, Codex App, AGENTS.md, skills, native subagents, plugins, MCP servers, config/hooks, and optional OMX workflow improvements without modifying files.
- [goal-meta-skill](/en/skills/developer-tools-integrations/goal-meta-skill) — Turn vague or complex Codex tasks into strong `/goal` commands with outcome, verification, constraints, boundaries, iteration policy, completion evidence, and pause/block conditions.
- [image-to-ui-skill](/en/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图、设计稿、参考图复刻为可点击的前端/App demo:拆分代码渲染 UI 与必须生成的位图资产，生成提示词并把生成图接回页面。also use for image to UI, UI screenshot to code, clickable app demo, mobile prototype, iOS preview, high-fidelity UI recreation。涉及生图时优先项目指定 image2 入口，失败再走已登记的 OpenRouter ICU gpt-image-2 备案通道并标明实际通道；不要用 imagegen 或其他未指定工具替代。要求做成 App/手机/iOS 预览时，交付带 iOS 外边框的可点击预览与截图验真。

### Development Workflows

`development-workflows` · 11 skills

- [code-auditor](/en/skills/development-workflows/code-auditor) — Structured code review across correctness, security, performance, readability, testing, and architecture, with language-specific guidance and human-readable findings.
- [code-quality-review](/en/skills/development-workflows/code-quality-review) — Run a code quality review focused on maintainability, structure, abstraction quality, file growth, branching complexity, boundary cleanliness, and refactoring opportunities.
- [code-refactor](/en/skills/development-workflows/code-refactor) — Implement safe, behavior-preserving code refactors after inspecting the existing project.
- [codex-dynamic-workflows](/en/skills/development-workflows/codex-dynamic-workflows) — Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.
- [cold-shower](/en/skills/development-workflows/cold-shower) — Challenge ideas, requirements, technical plans, products, pricing, markets, pitch/BP narratives, and major personal decisions with a no-flattery adversarial review.
- [geju](/en/skills/development-workflows/geju) — Use when the user explicitly asks to think bigger, open up the design space, challenge conservative design, avoid over-indexing on backward compatibility, escape local-detail fixation, or make a bold high-level product or architecture direction call.
- [goudi](/en/skills/development-workflows/goudi) — Use when the user asks to ground an ambitious proposal, avoid over-grand designs, make a bold direction executable, pressure-test feasibility, prevent "too much vision and too little landing", or turn a strategy/refactor/product idea into the smallest verifiable first move with stop rules.
- [handoff](/en/skills/development-workflows/handoff) — Use when the user wants to compact context before auto-compaction kicks in, hand off an unfinished task to a fresh session, switch topics mid-stream and preserve state, or pick up yesterday's work in a new conversation.
- [html-artifact](/en/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts, single-file by default and split into offline per-page bundles when oversized, for complex, visual, comparison-heavy, reviewable, or shareable work outputs.
- [implementation-notes](/en/skills/development-workflows/implementation-notes) — Use when implementing a multi-step spec, PRD, design doc, GitHub issue, or approved plan where decisions, deviations, and tradeoffs accumulate during coding.
- [spark](/en/skills/development-workflows/spark) — Plan-first brainstorming workflow that turns an idea into an approved implementation plan before coding.

### Docs, Writing & Publishing

`docs-writing-publishing` · 4 skills

- [beautiful-mermaid-editor](/en/skills/docs-writing-publishing/beautiful-mermaid-editor) — Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.
- [bidwriter](/en/skills/docs-writing-publishing/bidwriter) — 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政工程、IT 与信息化、软件开发、货物采购、服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、分章节撰写技术标与商务标、做技术指标逐条响应与合规性及废标风险审核。当用户提到：标书、投标、招标、投标文件、技术标、商务标、招标响应、投标方案、编写标书、写标书、招标文件分析、评分标准提取、评分细则、评分项核对、废标风险、否决性条款、合规性检查、逐条响应、响应对照表、技术方案撰写、投标策略、偏离表、政府采购、bid document、bid proposal、tender、RFP response、proposal writing 时使用此技能。不适用于通用商务写作、营销软文、年会致辞、产品文案、学术论文，或与招投标无关的文档。
- [document-writer](/en/skills/docs-writing-publishing/document-writer) — Write or update technical documentation from the real codebase and project files.
- [touying](/en/skills/docs-writing-publishing/touying) — Author Typst slide decks with the Touying package.

### Git & GitHub Collaboration

`git-github-collaboration` · 4 skills

- [gh-address-comments](/en/skills/git-github-collaboration/gh-address-comments) — Address GitHub PR review comments and actionable review threads with GitHub CLI.
- [gh-bootstrap](/en/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-fix-ci](/en/skills/git-github-collaboration/gh-fix-ci) — Debug and fix failing GitHub PR checks with GitHub CLI.
- [git-commit](/en/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or for all working-tree changes when the user explicitly asks to include everything.

### Research, Learning & Knowledge

`research-learning-knowledge` · 6 skills

- [deep-research-pro](/en/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research skill for current-topic investigation, comparison, and cited report writing.
- [humanizer-paper](/en/skills/research-learning-knowledge/humanizer-paper) — Register-aware academic language polisher for English journal articles and Chinese doctoral dissertations.
- [literature-mentor](/en/skills/research-learning-knowledge/literature-mentor) — 文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文，面向计算机科学、深度学习、自动化等方向（个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发，通过 Zotero MCP 优先获取全文，并根据用户意图自动选择快速筛选、导师深读或研究复盘模式。完整深读时先完成叙事类型判断、阅读前预检、novelty 校准和作者思考路径重建，再整体概览，并基于图例、正文和表格逐图详细解读（Zotero MCP 无法提取 PDF 图片，解读基于文字信息，必要时提醒上传图片）。适用于：(1)快速判断文献是否值得深读 (2)深入理解某篇论文 (3)学习文章中的方法和技术 (4)批判性分析研究设计 (5)寻找研究灵感。需要多篇论文综合、对比或找研究空白，或 arXiv/DOI 批量规范化时，改用 paper-workbench。
- [paper-plot](/en/skills/research-learning-knowledge/paper-plot) — Generate or reproduce publication-quality matplotlib figures in real academic paper styles. Two modes: (from-data) pick a pre-built paper style and fill in your numbers; (from-image) reproduce an uploaded paper figure as a matplotlib script.
- [paper-workbench](/en/skills/research-learning-knowledge/paper-workbench) — Researcher-profile-driven paper intake and literature workbench for academic workflows.
- [roundtable](/en/skills/research-learning-knowledge/roundtable) — Multi-perspective roundtable discussion skill for exploring a topic through a truth-seeking moderator and a small set of representative real figures.

## Frontmatter contract

The repository validator expects `SKILL.md` to start with parseable YAML frontmatter and reads top-level fields such as `name`, `description`, `category`, `tags`, and `version`. For new skills, keep the directory category aligned with `category` and use kebab-case skill names.

## Validation

```bash
just docs-sync
just docs-check
just skills-check
just ci
```
