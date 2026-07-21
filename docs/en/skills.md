# Skills

`skills/` is the first-party skill catalog. The generated catalog currently indexes **6 categories and 38 skills**; every entry has its own detail page.

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

### Academic Research Tools

`academic-research-tools` · 1 skills

- [academic-figure](/en/skills/academic-research-tools/academic-figure) — Create or review academic figures in three modes.

### Developer Tools & Integrations

`developer-tools-integrations` · 10 skills

- [agents-md-improver](/en/skills/developer-tools-integrations/agents-md-improver) — Audit and improve Codex AGENTS.md guidance files and companion code_map.md navigation maps.
- [archive-planning](/en/skills/developer-tools-integrations/archive-planning) — Archive root-level planning files (`task_plan.md`, `findings.md`, and `progress.md`) into a timestamped `.plannings/` directory for the current feature.
- [ast-grep](/en/skills/developer-tools-integrations/ast-grep) — Write, debug, and validate ast-grep structural code search rules.
- [claude-md-improver](/en/skills/developer-tools-integrations/claude-md-improver) — Audit and improve Claude Code CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps.
- [codex-workflow-recommender](/en/skills/developer-tools-integrations/codex-workflow-recommender) — Analyze a repository and current Codex environment, then recommend Codex CLI/App, AGENTS.md, skills, subagents, plugins, MCP servers, config/hooks, and OMX workflow improvements without modifying files.
- [goal-meta-skill](/en/skills/developer-tools-integrations/goal-meta-skill) — Turn vague or complex agent tasks into strong `/goal` commands for Claude Code and Codex — outcome, verification, constraints, boundaries, iteration policy, and stop conditions.
- [image-to-ui-skill](/en/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation; exclude image-only generation and reference-free UI polish.
- [ripgrep](/en/skills/developer-tools-integrations/ripgrep) — Use when the user needs text or regex content search with ripgrep: composing rg commands, choosing flags, glob/type filtering, multiline or PCRE2 searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed a file (gitignore, hidden, binary defaults).
- [uv-workflow](/en/skills/developer-tools-integrations/uv-workflow) — Use when a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script.
- [windows-dev-process-cleanup](/en/skills/developer-tools-integrations/windows-dev-process-cleanup) — Audit and safely clean Windows dev-process buildup and UWP background-task pileups — stale node/npm/cmd/pwsh trees (leaked Playwright MCP workers, dev servers, IDE services) and backgroundTaskHost.exe pileups.

### Development Workflows

`development-workflows` · 12 skills

- [code-auditor](/en/skills/development-workflows/code-auditor) — Structured code review across correctness, security, performance, readability, testing, and architecture.
- [code-quality-review](/en/skills/development-workflows/code-quality-review) — Run a code quality review focused on maintainability, structure, abstraction quality, and refactoring opportunities.
- [code-refactor](/en/skills/development-workflows/code-refactor) — Implement safe, behavior-preserving code refactors after inspecting the existing project.
- [codex-dynamic-workflows](/en/skills/development-workflows/codex-dynamic-workflows) — Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.
- [cold-shower](/en/skills/development-workflows/cold-shower) — Challenge ideas, plans, products, pricing, pitch narratives, and major decisions with a no-flattery adversarial review.
- [geju](/en/skills/development-workflows/geju) — Use when the user explicitly asks to think bigger, open up the design space, challenge conservative design, escape local-detail fixation, or make a bold high-level product or architecture direction call.
- [goudi](/en/skills/development-workflows/goudi) — Ground an ambitious proposal into the smallest verifiable first move with stop rules — pressure-test feasibility, avoid over-grand designs, make a bold direction executable.
- [handoff](/en/skills/development-workflows/handoff) — Write a handoff.md that lets a fresh session resume unfinished work cold.
- [html-artifact](/en/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs.
- [implementation-notes](/en/skills/development-workflows/implementation-notes) — Maintain a live implementation-notes.md while implementing a multi-step spec, PRD, design doc, or approved plan — capturing design decisions, intentional deviations, rejected alternatives, and open questions. Start before the first edit.
- [spark](/en/skills/development-workflows/spark) — Turn an idea into an approved implementation plan before coding — plan-first brainstorming.
- [unknowns-first](/en/skills/development-workflows/unknowns-first) — Diagnose a task before execution when the user may not yet know how to define success.

### Docs, Writing & Publishing

`docs-writing-publishing` · 5 skills

- [beautiful-mermaid-editor](/en/skills/docs-writing-publishing/beautiful-mermaid-editor) — Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.
- [bidwriter](/en/skills/docs-writing-publishing/bidwriter) — 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。
- [document-writer](/en/skills/docs-writing-publishing/document-writer) — Write or update technical documentation grounded in the real codebase.
- [renhua](/en/skills/docs-writing-publishing/renhua) — Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, and public technical essays.
- [touying](/en/skills/docs-writing-publishing/touying) — Author Typst slide decks with the Touying package.

### Git & GitHub Collaboration

`git-github-collaboration` · 5 skills

- [gh-address-comments](/en/skills/git-github-collaboration/gh-address-comments) — Address GitHub PR review comments and actionable review threads with GitHub CLI.
- [gh-bootstrap](/en/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-fix-ci](/en/skills/git-github-collaboration/gh-fix-ci) — Debug and fix failing GitHub PR checks with GitHub CLI.
- [gh-pr](/en/skills/git-github-collaboration/gh-pr) — Create and operate GitHub pull requests with gh CLI: draft or open a PR, publish confirmed review summaries or inline comments, approve or request changes, merge safely, and reply to or resolve review threads / 创建 PR、发布已确认的 review 总结或逐行评论、批准或请求修改、安全合并、回复或解决评审线程.
- [git-commit](/en/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything.

### Research, Learning & Knowledge

`research-learning-knowledge` · 5 skills

- [deep-research-pro](/en/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research for current-topic investigation, comparison, and cited report writing.
- [humanizer-paper](/en/skills/research-learning-knowledge/humanizer-paper) — Register-aware academic language polisher for English journal articles and Chinese doctoral dissertations: removes AI-writing tells while keeping academic norms.
- [literature-mentor](/en/skills/research-learning-knowledge/literature-mentor) — 文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文（计算机/深度学习/自动化方向，个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发；通过 Zotero MCP 优先获取全文，按用户意图自动选择快速筛选、导师深读或研究复盘模式。多篇论文综合、对比、找研究空白或批量规范化时改用 paper-workbench。
- [paper-workbench](/en/skills/research-learning-knowledge/paper-workbench) — Researcher-profile-driven paper intake and literature workbench for academic workflows.
- [roundtable](/en/skills/research-learning-knowledge/roundtable) — Multi-perspective roundtable discussion — a truth-seeking moderator plus a small set of representative real figures explore one topic through disciplined debate.

## Frontmatter contract

The repository validator expects `SKILL.md` to start with parseable YAML frontmatter and reads top-level fields such as `name`, `description`, `category`, `tags`, and `version`. For new skills, keep the directory category aligned with `category` and use kebab-case skill names.

## Validation

```bash
just docs-sync
just docs-check
just skills-check
just ci
```
