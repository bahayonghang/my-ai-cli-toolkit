# Skills

`skills/` 是一方 skill catalog。当前自动索引到 **5 个分类、26 个 skill**；每个条目都有独立详情页。

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

`academic-research-tools` · 4 skills

- [academic-figure](/skills/academic-research-tools/academic-figure) — Create, advise on, or audit academic figures in four modes.
- [idea-bib-review](/skills/academic-research-tools/idea-bib-review) — Draft an evidence-grounded literature review or related-work section from both a user-provided idea, argument, reasoning outline, 思路, 框架, or 论证主线 and one or more supplied BibTeX .bib files.
- [laoyeye](/skills/academic-research-tools/laoyeye) — 整合式思考与学习伙伴：理清问题、追问设计、讲透概念、拆解范例、横纵深度研究、核查说法、多视角解题、比较两项选择、设计最小实验；明确请求时做持续教学、agent 任务书、知识收尾、天赋探索与人生设计。支持 Socratic questioning, grilling, critical thinking, first principles, steelman, fact check；可点名原方法。排除普通润色翻译、学术论文精读综述、生产 UI 实施、专业 diff 或 Trellis 规划审查、原生 Goal 管理；代码诊断与治理仅在明确选择本包或其流程内执行。
- [literature-mentor](/skills/academic-research-tools/literature-mentor) — 文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文（计算机/深度学习/自动化方向，个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发；通过 Zotero MCP 优先获取全文，按用户意图自动选择快速筛选、导师深读或研究复盘模式。多篇综合、对比、找研究空白和批量规范化不在本技能范围内。

### 开发者工具集成

`developer-tools-integrations` · 7 skills

- [claude-context-improver](/skills/developer-tools-integrations/claude-context-improver) — Audit and improve the Claude Code context layer — CLAUDE.md guidance files, .claude/rules/ path-scoped rules, and companion code_map.md navigation maps — against Claude 5 context-engineering rules (judgement over rules, progressive disclosure, no cross-layer conflicts). Asks whether to optimize the current repository (default) or the global ~/.claude context.
- [codex-context-improver](/skills/developer-tools-integrations/codex-context-improver) — Audit or improve Codex instruction context: AGENTS.md, task-relevant skills, prompts, and code_map.md.
- [file-sorter](/skills/developer-tools-integrations/file-sorter) — Use when the user wants to categorize, sort, organize, or suggest renames for files in a local folder such as Downloads, or for files that share one parent directory.
- [goal-meta-skill](/skills/developer-tools-integrations/goal-meta-skill) — Use when the user explicitly asks to use Goal mode or to author, save, or manage a Goal for Claude Code, Codex, Grok Build, Oh My Pi, or Kimi Code.
- [image-to-ui-skill](/skills/developer-tools-integrations/image-to-ui-skill) — 将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation; exclude image-only generation and reference-free UI polish.
- [storage-analyzer](/skills/developer-tools-integrations/storage-analyzer) — Use when the user wants a read-only disk/storage analysis on macOS or Windows: 磁盘满了, C盘满了, 空间不够, 存储分析, 占空间, 清缓存, storage analysis, disk cleanup, or Chinese 内存满了 when they mean disk space.
- [windows-dev-process-cleanup](/skills/developer-tools-integrations/windows-dev-process-cleanup) — Audit and safely clean Windows dev-process trees and UWP app background-task pileups, including orphan npm/npx, leaked Playwright MCP workers, workspace dev servers, IDE services, Phone Link, Dolby Access, and backgroundTaskHost.exe.

### 开发工作流

`development-workflows` · 8 skills

- [codex-review](/skills/development-workflows/codex-review) — Use when the user asks for GPT or Codex to review code with the local Codex CLI (使用 GPT 审查、让 Codex 审查、codex review).
- [design-atlas](/skills/development-workflows/design-atlas) — Offline UI catalog of 203 design languages (84 brands, 68 styles, 50 material themes, 1 business scene). Picks one automatically when none is set, writes it as DESIGN.md, implements or restyles production UI from it (web or GPUI), and checks the result against anti-AI-slop gates.
- [html-artifact](/skills/development-workflows/html-artifact) — Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs.
- [in-your-own-words](/skills/development-workflows/in-your-own-words) — Restate in your own words what you think the user's goals are, what underlying problem they are trying to solve, what observable success looks like, and any high-leverage assumptions or open forks, then stop for confirmation before editing files or acting.
- [matt-implement-prompt](/skills/development-workflows/matt-implement-prompt) — Compile Matt Pocock workflow specs and tracer-bullet tickets (GitHub Issues or local .scratch issues) into a self-contained, pointer-driven fresh-session execution prompt with branch-or-worktree isolation, TDD, code-review, CI verification gates, split atomic commits, base-branch-aware delivery (dev direct merge vs main/master PR merge & sync), and commit-linked remote issue-closing protocol.
- [rust-build-optimization](/skills/development-workflows/rust-build-optimization) — Use when a Rust or Cargo build is slow and the user wants it diagnosed or sped up: profiling compile times with cargo --timings or -Zself-profile, finding whether the bottleneck is dependencies, codegen/LLVM, linking, or one oversized crate, and applying targeted fixes such as faster linkers (lld, mold, wild), incremental compilation, dev/release profile tuning, workspace splitting, Cranelift, the nightly parallel frontend, or CI caching with sccache.
- [tickets-review](/skills/development-workflows/tickets-review) — Independent read-only audit of remote GitHub Issues or local .scratch ticket graphs (parent spec plus child tickets) against live code, tests, and repo contracts. Runs Pass 0 dependency/metadata precheck and Passes 1-7 evidence-backed checks, persists one Markdown report under reports/tickets-review/, and emits one copyable handoff prompt with a structured confirmation gate for a downstream agent to optimize the tickets.
- [trellis-plan-review](/skills/development-workflows/trellis-plan-review) — Independent review of Trellis task planning artifacts. Treats the selected task and its recursive current or archived children as one review scope, verifies repository claims and path:line citations against code, traces every acceptance-criterion clause to a requirement and design mechanism, rechecks arithmetic and units, writes one combined evidence-backed Markdown report under the reviewed project's .trellis/reviews directory, and returns one copyable handoff prompt. Compares the plan with the real diff after the task starts.

### 文档写作与发布

`docs-writing-publishing` · 3 skills

- [bidwriter](/skills/docs-writing-publishing/bidwriter) — 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。
- [renhua](/skills/docs-writing-publishing/renhua) — Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, and public technical essays.
- [touying](/skills/docs-writing-publishing/touying) — Author, refactor, migrate, or troubleshoot Typst slide decks using @preview/touying:0.8.0 (Typst 0.15.0+).

### Git / GitHub 协作

`git-github-collaboration` · 4 skills

- [gh-bootstrap](/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-pr-release](/skills/git-github-collaboration/gh-pr-release) — Operate GitHub pull requests and releases with gh CLI: create/draft PRs, publish confirmed reviews, merge safely, reply/resolve threads, apply selected feedback, fix PR checks, prepare release PRs with version bumps/changelogs, tag merged commits, publish GitHub Releases with verified assets, and diagnose release workflows / 创建或发布 PR、评审与安全合并、回复或解决线程、修复 PR CI、准备版本 PR、打 tag、发布含产物的 GitHub Release、诊断 release CI.
- [git-commit](/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or all working-tree changes when the user explicitly asks to include everything.
- [git-worktree](/skills/git-github-collaboration/git-worktree) — Manage isolated Git worktrees under one repository convention root.

## Frontmatter 约定

仓库校验器要求 `SKILL.md` 使用可解析的 YAML frontmatter，并读取 `name`、`description`、`category`、`tags`、`version` 等顶层字段。新增 skill 时保持目录分类与 `category` 一致，并使用 kebab-case skill 名称。

## 校验方式

```bash
just docs-sync
just docs-check
just skills-check
just ci
```
