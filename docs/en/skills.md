# Skills

`skills/` is the first-party skill catalog. The generated catalog currently indexes **6 categories and 41 skills**; every entry has its own detail page.

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

`academic-research-tools` · 2 skills

- [academic-figure](/en/skills/academic-research-tools/academic-figure) — Create, advise on, or audit academic figures in four modes.
- [idea-bib-review](/en/skills/academic-research-tools/idea-bib-review) — Draft an evidence-grounded literature review or related-work section from both a user-provided idea, argument, reasoning outline, 思路, 框架, or 论证主线 and one or more supplied BibTeX .bib files.

### Developer Tools & Integrations

`developer-tools-integrations` · 12 skills

- [agents-md-improver](/en/skills/developer-tools-integrations/agents-md-improver) — Audit or improve repository-scoped Codex AGENTS.md, AGENTS.override.md, configured fallback instructions, and companion code_map.md navigation.
- [ast-grep](/en/skills/developer-tools-integrations/ast-grep) — Write, debug, and validate ast-grep structural code search rules.
- [claude-context-improver](/en/skills/developer-tools-integrations/claude-context-improver) — Audit and improve the Claude Code context layer — CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps — against Claude 5 context-engineering rules (judgement over rules, progressive disclosure, no cross-layer conflicts). Asks whether to optimize the current repository (default) or the global ~/.claude context.
- [codex-workflow-recommender](/en/skills/developer-tools-integrations/codex-workflow-recommender) — Audit a repository and current Codex capabilities, then recommend the smallest evidence-backed read-only improvement or no change.
- [file-sorter](/en/skills/developer-tools-integrations/file-sorter) — Use when the user wants to categorize, sort, organize, or suggest renames for files in a local folder such as Downloads, or for files that share one parent directory.
- [goal-meta-skill](/en/skills/developer-tools-integrations/goal-meta-skill) — Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands and optional approved root `GOAL.md` handoff contracts for Claude Code, Codex, Grok Build, Oh My Pi, and Kimi Code.
- [image-to-ui-skill](/en/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation; exclude image-only generation and reference-free UI polish.
- [ripgrep](/en/skills/developer-tools-integrations/ripgrep) — Use when the user needs text or regex content search with ripgrep: composing rg commands, choosing flags, glob/type filtering, multiline or PCRE2 searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed a file (gitignore, hidden, binary defaults).
- [skill-session-review](/en/skills/developer-tools-integrations/skill-session-review) — Analyze how an existing agent skill was used in past Claude Code, Grok, Codex, and Oh My Pi conversations.
- [storage-analyzer](/en/skills/developer-tools-integrations/storage-analyzer) — Use when the user wants a read-only disk/storage analysis on macOS or Windows: 磁盘满了, C盘满了, 空间不够, 存储分析, 占空间, 清缓存, storage analysis, disk cleanup, or Chinese 内存满了 when they mean disk space.
- [uv-workflow](/en/skills/developer-tools-integrations/uv-workflow) — Use when a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script.
- [windows-dev-process-cleanup](/en/skills/developer-tools-integrations/windows-dev-process-cleanup) — Audit and safely clean Windows dev-process trees and UWP app background-task pileups, including orphan npm/npx, leaked Playwright MCP workers, workspace dev servers, IDE services, Phone Link, Dolby Access, and backgroundTaskHost.exe.

### Development Workflows

`development-workflows` · 11 skills

- [code-auditor](/en/skills/development-workflows/code-auditor) — Independent pre-merge review of a git diff, PR, or named files.
- [code-quality-review](/en/skills/development-workflows/code-quality-review) — Run a maintainability and structure review focused on abstraction quality, branching complexity, file growth, canonical ownership, duplication, and refactoring opportunities.
- [code-refactor](/en/skills/development-workflows/code-refactor) — Implement safe, behavior-preserving code refactors after inspecting the existing project.
- [codex-bridge](/en/skills/development-workflows/codex-bridge) — Use when the user explicitly asks the current agent to involve Codex CLI by reviewing a plan, implementing code, revising an implementation after review, or verifying extrapolated findings.
- [codex-dynamic-workflows](/en/skills/development-workflows/codex-dynamic-workflows) — Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets.
- [html-artifact](/en/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs.
- [rust-build-optimization](/en/skills/development-workflows/rust-build-optimization) — Use when a Rust or Cargo build is slow and the user wants it diagnosed or sped up: profiling compile times with cargo --timings or -Zself-profile, finding whether the bottleneck is dependencies, codegen/LLVM, linking, or one oversized crate, and applying targeted fixes such as faster linkers (lld, mold, wild), incremental compilation, dev/release profile tuning, workspace splitting, Cranelift, the nightly parallel frontend, or CI caching with sccache.
- [spark](/en/skills/development-workflows/spark) — Turn an idea into an approved implementation plan before coding — plan-first brainstorming.
- [trellis-plan-review](/en/skills/development-workflows/trellis-plan-review) — Independent review of Trellis task planning artifacts. Treats the selected task and its recursive current or archived children as one review scope, verifies repository claims and path:line citations against code, traces every acceptance-criterion clause to a requirement and design mechanism, rechecks arithmetic and units, writes one combined evidence-backed Markdown report under the reviewed project's .trellis/reviews directory, and returns one copyable handoff prompt. Compares the plan with the real diff after the task starts.
- [unknowns-first](/en/skills/development-workflows/unknowns-first) — Diagnose a task before execution when the user may not yet know how to define success.
- [web-research](/en/skills/development-workflows/web-research) — 跨平台互联网来源发现、核验与本地归档。.

### Docs, Writing & Publishing

`docs-writing-publishing` · 6 skills

- [beautiful-mermaid-editor](/en/skills/docs-writing-publishing/beautiful-mermaid-editor) — Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.
- [bidwriter](/en/skills/docs-writing-publishing/bidwriter) — 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。
- [document-writer](/en/skills/docs-writing-publishing/document-writer) — Write or update technical documentation grounded in the real codebase.
- [job-application-kit](/en/skills/docs-writing-publishing/job-application-kit) — 求职申请与面试准备套件：针对目标职位（JD/职位描述）量身定制简历与求职信，在诚实边界内修改与包装既有经历， 生成阶段化面试准备包并支持模拟面试。触发词：写简历、改简历、简历定制、tailor resume、resume、CV、 resume writing、求职信、cover letter、投递、申请职位、job posting、JD、职位描述、岗位匹配、fit 评估、 面试准备、面试问题、interview prep、mock interview、模拟面试、包装经历、量化成果。
- [renhua](/en/skills/docs-writing-publishing/renhua) — Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, and public technical essays.
- [touying](/en/skills/docs-writing-publishing/touying) — Author Typst slide decks with the Touying package.

### Git & GitHub Collaboration

`git-github-collaboration` · 4 skills

- [gh-bootstrap](/en/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-pr-release](/en/skills/git-github-collaboration/gh-pr-release) — Operate GitHub pull requests and releases with gh CLI: create/draft PRs, publish confirmed reviews, merge safely, reply/resolve threads, apply selected feedback, fix PR checks, prepare release PRs with version bumps/changelogs, tag merged commits, publish GitHub Releases with verified assets, and diagnose release workflows / 创建或发布 PR、评审与安全合并、回复或解决线程、修复 PR CI、准备版本 PR、打 tag、发布含产物的 GitHub Release、诊断 release CI.
- [git-commit](/en/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything.
- [git-worktree](/en/skills/git-github-collaboration/git-worktree) — Manage isolated Git worktrees under one repository convention root.

### Research, Learning & Knowledge

`research-learning-knowledge` · 6 skills

- [deep-research-pro](/en/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research for current-topic investigation, comparison, and cited report writing.
- [dual-steelman](/en/skills/research-learning-knowledge/dual-steelman) — Bidirectional steelman deep-thinking protocol for one pending decision, stance, or contested choice.
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
