# Skills

`skills/` 是一方 skill catalog。当前自动索引到 **6 个分类、36 个 skill**；每个条目都有独立详情页。

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

`academic-research-tools` · 2 skills

- [academic-figure](/skills/academic-research-tools/academic-figure) — Create, advise on, or audit academic figures in four modes.
- [idea-bib-review](/skills/academic-research-tools/idea-bib-review) — Draft an evidence-grounded literature review or related-work section from both a user-provided idea, argument, reasoning outline, 思路, 框架, or 论证主线 and one or more supplied BibTeX .bib files.

### 开发者工具集成

`developer-tools-integrations` · 9 skills

- [agents-md-improver](/skills/developer-tools-integrations/agents-md-improver) — Audit or improve repository-scoped Codex AGENTS.md, AGENTS.override.md, configured fallback instructions, and companion code_map.md navigation.
- [ast-grep](/skills/developer-tools-integrations/ast-grep) — Write, debug, and validate ast-grep structural code search rules.
- [claude-context-improver](/skills/developer-tools-integrations/claude-context-improver) — Audit and improve the Claude Code context layer — CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps — against Claude 5 context-engineering rules (judgement over rules, progressive disclosure, no cross-layer conflicts). Asks whether to optimize the current repository (default) or the global ~/.claude context.
- [codex-workflow-recommender](/skills/developer-tools-integrations/codex-workflow-recommender) — Audit a repository and current Codex capabilities, then recommend the smallest evidence-backed read-only improvement or no change.
- [goal-meta-skill](/skills/developer-tools-integrations/goal-meta-skill) — Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands for Claude Code and Codex through read-only reconnaissance, bounded interviews, or a direct fast path.
- [image-to-ui-skill](/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation; exclude image-only generation and reference-free UI polish.
- [ripgrep](/skills/developer-tools-integrations/ripgrep) — Use when the user needs text or regex content search with ripgrep: composing rg commands, choosing flags, glob/type filtering, multiline or PCRE2 searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed a file (gitignore, hidden, binary defaults).
- [uv-workflow](/skills/developer-tools-integrations/uv-workflow) — Use when a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script.
- [windows-dev-process-cleanup](/skills/developer-tools-integrations/windows-dev-process-cleanup) — Audit and safely clean Windows dev-process trees and UWP app background-task pileups, including orphan npm/npx, leaked Playwright MCP workers, workspace dev servers, IDE services, Phone Link, Dolby Access, and backgroundTaskHost.exe.

### 开发工作流

`development-workflows` · 10 skills

- [code-auditor](/skills/development-workflows/code-auditor) — Structured code review across correctness, security, performance, readability, testing, and architecture.
- [code-quality-review](/skills/development-workflows/code-quality-review) — Run a code quality review focused on maintainability, structure, abstraction quality, and refactoring opportunities.
- [code-refactor](/skills/development-workflows/code-refactor) — Implement safe, behavior-preserving code refactors after inspecting the existing project.
- [codex-bridge](/skills/development-workflows/codex-bridge) — Use when the user explicitly asks the current agent to involve Codex CLI by reviewing a plan, implementing code, revising an implementation after review, or verifying extrapolated findings.
- [codex-dynamic-workflows](/skills/development-workflows/codex-dynamic-workflows) — Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.
- [html-artifact](/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs.
- [rust-build-optimization](/skills/development-workflows/rust-build-optimization) — Use when a Rust or Cargo build is slow and the user wants it diagnosed or sped up: profiling compile times with cargo --timings or -Zself-profile, finding whether the bottleneck is dependencies, codegen/LLVM, linking, or one oversized crate, and applying targeted fixes such as faster linkers (lld, mold, wild), incremental compilation, dev/release profile tuning, workspace splitting, Cranelift, the nightly parallel frontend, or CI caching with sccache.
- [spark](/skills/development-workflows/spark) — Turn an idea into an approved implementation plan before coding — plan-first brainstorming.
- [unknowns-first](/skills/development-workflows/unknowns-first) — Diagnose a task before execution when the user may not yet know how to define success.
- [web-research](/skills/development-workflows/web-research) — 跨平台互联网来源发现、核验与本地归档。.

### 文档写作与发布

`docs-writing-publishing` · 5 skills

- [beautiful-mermaid-editor](/skills/docs-writing-publishing/beautiful-mermaid-editor) — Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.
- [bidwriter](/skills/docs-writing-publishing/bidwriter) — 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。
- [document-writer](/skills/docs-writing-publishing/document-writer) — Write or update technical documentation grounded in the real codebase.
- [renhua](/skills/docs-writing-publishing/renhua) — Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, and public technical essays.
- [touying](/skills/docs-writing-publishing/touying) — Author Typst slide decks with the Touying package.

### Git / GitHub 协作

`git-github-collaboration` · 4 skills

- [gh-bootstrap](/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-pr-release](/skills/git-github-collaboration/gh-pr-release) — Operate GitHub pull requests and releases with gh CLI: create/draft PRs, publish confirmed reviews, merge safely, reply/resolve threads, apply selected feedback, fix PR checks, prepare release PRs with version bumps/changelogs, tag merged commits, publish GitHub Releases with verified assets, and diagnose release workflows / 创建或发布 PR、评审与安全合并、回复或解决线程、修复 PR CI、准备版本 PR、打 tag、发布含产物的 GitHub Release、诊断 release CI.
- [git-commit](/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything.
- [git-worktree](/skills/git-github-collaboration/git-worktree) — Manage isolated Git worktrees under one repository convention root.

### 研究、学习与知识

`research-learning-knowledge` · 6 skills

- [deep-research-pro](/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research for current-topic investigation, comparison, and cited report writing.
- [dual-steelman](/skills/research-learning-knowledge/dual-steelman) — Bidirectional steelman deep-thinking protocol for one pending decision, stance, or contested choice.
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
