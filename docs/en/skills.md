# Skills

`skills/` is the first-party skill catalog. The generated catalog currently indexes **5 categories and 21 skills**; every entry has its own detail page.

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

`developer-tools-integrations` · 5 skills

- [agents-md-improver](/en/skills/developer-tools-integrations/agents-md-improver) — Audit and improve Codex AGENTS.md guidance files in repositories.
- [antigravity-companion](/en/skills/developer-tools-integrations/antigravity-companion) — Coordinate Antigravity companion workflows for staged review, focused task execution, follow-up analysis, and clear continuation boundaries.
- [claude-code-companion](/en/skills/developer-tools-integrations/claude-code-companion) — Coordinate Claude Code companion-style workflows for multi-step implementation, bounded review, follow-up execution, and session-to-session continuation inside Claude Code.
- [codex-companion](/en/skills/developer-tools-integrations/codex-companion) — Manage Codex background tasks, persistent job threads, adversarial code reviews, and job lifecycle (status, result, cancel) from inside any AI coding session.
- [codex-workflow-recommender](/en/skills/developer-tools-integrations/codex-workflow-recommender) — Analyze a repository and current Codex environment, then recommend Codex CLI, Codex App, AGENTS.md, skills, native subagents, plugins, MCP servers, config/hooks, and optional OMX workflow improvements without modifying files.

### Development Workflows

`development-workflows` · 6 skills

- [brainstorming-baha](/en/skills/development-workflows/brainstorming-baha) — 当用户想要 brainstorm 一个想法、设计 feature 或 spec 时使用。通过对话探索意图与需求，然后将 spec 文档写入 .brainstorm/ 并 STOP。不会自动接 implementation planning 或任何其他技能。
- [code-auditor](/en/skills/development-workflows/code-auditor) — Structured code review across correctness, security, performance, readability, testing, and architecture, with language-specific guidance and human-readable findings.
- [cold-shower](/en/skills/development-workflows/cold-shower) — Challenge ideas, requirements, technical plans, products, pricing, markets, pitch/BP narratives, and major personal decisions with a no-flattery adversarial review.
- [handoff](/en/skills/development-workflows/handoff) — Use when the user wants to compact context before auto-compaction kicks in, hand off an unfinished task to a fresh session, switch topics mid-stream and preserve state, or pick up yesterday's work in a new conversation.
- [implementation-notes](/en/skills/development-workflows/implementation-notes) — Use when implementing a multi-step spec, PRD, design doc, GitHub issue, or approved plan where decisions, deviations, and tradeoffs accumulate during coding.
- [improve-codebase-architecture](/en/skills/development-workflows/improve-codebase-architecture) — Review a codebase for architectural friction, rank deep-module refactoring opportunities, and draft RFCs for safer interfaces and boundary-test strategies.

### Docs, Writing & Publishing

`docs-writing-publishing` · 3 skills

- [bidwriter](/en/skills/docs-writing-publishing/bidwriter) — 智能标书编写专家，专精工程咨询、建筑设计、市政工程领域的投标文件编写。
- [document-writer](/en/skills/docs-writing-publishing/document-writer) — Write or update technical documentation from the real codebase and project files.
- [touying](/en/skills/docs-writing-publishing/touying) — Author Typst slide decks with Touying.

### Git & GitHub Collaboration

`git-github-collaboration` · 4 skills

- [gh-address-comments](/en/skills/git-github-collaboration/gh-address-comments) — Address GitHub PR review comments and actionable review threads with GitHub CLI.
- [gh-bootstrap](/en/skills/git-github-collaboration/gh-bootstrap) — Initialize GitHub repository configuration from vetted upstream templates.
- [gh-fix-ci](/en/skills/git-github-collaboration/gh-fix-ci) — Debug and fix failing GitHub PR checks with GitHub CLI.
- [git-commit](/en/skills/git-github-collaboration/git-commit) — Safely orchestrate Conventional Commits for staged Git changes, or for all working-tree changes when the user explicitly asks to include everything.

### Research, Learning & Knowledge

`research-learning-knowledge` · 3 skills

- [deep-research-pro](/en/skills/research-learning-knowledge/deep-research-pro) — Multi-source deep research skill for current-topic investigation, comparison, and cited report writing.
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
