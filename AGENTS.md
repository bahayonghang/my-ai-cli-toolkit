<!-- TRELLIS:START -->
# mini-trellis

This project uses mini-trellis as a memory layer. Working knowledge lives under `.trellis/`:

- `.trellis/spec/` — durable contracts (short markdown; read `index.md` first)
- `.trellis/research/` — topic inbox (`<topic>.md`; `README.md` is not a topic)
- `.trellis/workspace/` — per-developer journals

Record a session with `/mini-trellis:remember` (Claude/OpenCode), `/mini-trellis-remember` (Pi/OMP/Kiro), `$mini-trellis-remember` (Codex/ZCode), or the `mini-trellis-remember` skill (Cursor and DeepSeek Harness). When earlier decisions or relevant project rules are needed, use `mini-trellis mem recall "<topic or path>"`; expand evidence with `mini-trellis mem read "<ref>"`. No search is required for unrelated work. Promote lasting boundaries into spec with `mini-trellis-update-spec`.

Record only confirmed decisions, reusable research findings, or the session/compact handoff. Skip ordinary turns and unconfirmed guesses. New installs write notes without an automatic git commit; use `mini-trellis doctor` to check host wiring and `mini-trellis refresh --dry-run` before refreshing assets.

Keep confirmed rules short and faithful. Unconfirmed scope, exceptions, and implementation choices stay open or are labeled as inference, not added to the contract.

For a confirmed update, follow this short order: read the existing topic; edit that file; read it back and check the new rule, limits, and negations; run `python3 ./.trellis/scripts/add_session.py --title "..." --summary "..." --topic <actual-topic-path>`; read the journal and check its topic link. Journal-only success is not topic success; report partial writes accurately. New notes follow the requested or discussion language; updates preserve the document language.

When recall excerpts already answer the question with source and qualifiers, cite them and stop. Expand only missing context; do not repeat a lookup or fall back to dialogue-only `search` merely to reconfirm sufficient evidence.

ZCode, Kiro and OMP conversation histories are not parsed; use project knowledge or supply Markdown/text exports. For an explicit request to organize selected past sessions or supplied Markdown/text exports into project knowledge, use `mini-trellis-session-insight`; update existing documents and preserve sources.

mini-trellis does not create or drive tasks.

Managed by mini-trellis. Edits outside this block are preserved.
<!-- TRELLIS:END -->

# Repository Guidelines

This `AGENTS.md` governs the repository root and all descendants unless a deeper `AGENTS.md` narrows the scope. Before broad search or repo-wide grep, read `./code_map.md` and use its routing/search anchors to choose targeted files.

Shared rules in this file are host-agnostic. Native instruction roots, skill discovery, hooks or extensions, delegation, and permission or sandbox facts live in [`docs/harnesses.md`](docs/harnesses.md) ([English](docs/en/harnesses.md)). Do not copy host-specific load rules into this file.

## Project Structure & Module Organization
This repository organizes content at the repo root. Installable skills live under `skills/<category>/<skill-name>/`. Platform-scoped source assets live under `platforms/<platform>/` only when that platform has them. In this repo: `platforms/antigravity/commands/`; `platforms/claude/agents/` and `platforms/claude/hooks/`; `platforms/codex/agents/` (no Codex `prompts/` directory). Shared behavioral rule files live in root `rules/`. Host placement for Claude Code and OMP, and Codex global `AGENTS.md` `@` references, are documented in [`docs/rules.md`](docs/rules.md) ([English](docs/en/rules.md)); do not copy those load paths into this file. Shared validation scripts live in `scripts/`. Keep navigation/search detail in `code_map.md`, not in this file. Check scoped guidance files such as `platforms/codex/AGENTS.md` and `platforms/claude/AGENTS.md` before editing a nested area that provides its own instructions.

## Build, Test, and Development Commands
Use `just` from the repository root:

- `just ci` — full local CI: `docs-check`, `skills-check`, `python-check`, `python-test`, `install-projects-test`, `node-test`, `evals-check`, then `git diff --check`.
- `just lint` — `skills-check` + `python-check`.
- `just skills-check` — runs `scripts/check_skill_frontmatter.py` over `skills/`.
- `just python-check` — byte-compiles every `*.py` under `skills/`, `platforms/`, and `scripts/` (skips `scaffolds`).
- `just python-test` — stdlib unittest discovered under `platforms/claude/hooks/tests`, `skills/**/tests`, and `scripts/tests`.
- `just evals-check` — schema check for each first-party `evals/evals.json`. It does not score evals with a model.
- `just install-projects` — live-links selected first-party skills into the current project (default `.agents/skills`). Extra agent destinations are linked only when that agent root already exists. Destination maps are a repo contract, not new-session discovery proof.
- `just install-projects-test` — runs `scripts/tests/test_install_projects.py`.
- `just node-test` — discovers and runs Node skill tests under `skills/**/tests/*.mjs`.

The third-party `npx skills add` CLI installs from GitHub into client skill directories. `just install-projects` is the local live-link installer. They are different tools.

## Coding Style & Naming Conventions
Follow existing language conventions instead of introducing local variants. Markdown should stay concise; use kebab-case for content directory names and skill slugs. Python scripts under `skills/`, `platforms/`, and `scripts/` must remain byte-compilable (`just python-check`). Node skill scripts target plain Node >= 20 and live alongside their `tests/*.mjs`. Keep `SKILL.md` frontmatter in the documented top-level form: `name`, `description`, `category`, `tags`, `version`.

## Testing Guidelines
Prefer targeted checks while iterating: `just skills-check` for metadata changes, `just node-test` for Node skill changes, `just python-check` for Python compile, and `just python-test` for stdlib unittest. Run `just ci` once from the repository root before finishing or opening a PR. When adding or changing a Node skill, add or update a matching test file in its `tests/` directory.

## Safety and Generated Paths
Do not edit generated, dependency, runtime, or local-only state by hand unless the task is explicitly about recovery for that path. Common skip paths include `.git/`, `.omx/`, `.claude/`, `.agents/`, `.codex/`, `.grok/`, `.kimi-code/`, `.omp/`, `.antigravitycli/`, `ref/`, `.planning/`, `.plannings/`, `docs/node_modules/`, `docs/.vitepress/cache/`, `docs/.vitepress/dist/`, and `__pycache__/`. When changing public skill metadata or platform catalog content, run `just docs-sync` or `just docs-check` so generated docs stay aligned.

## Codex Workflow Notes
Project-local Codex activation files may live under `.codex/`, but that directory is ignored and should stay local unless the repository policy changes. The source-of-truth Codex agent templates live under `platforms/codex/agents/`; keep reusable templates free of stale hardcoded model names unless a task explicitly requires a pinned model.

## Commit & Pull Request Guidelines
Use Conventional Commits with an optional scope and emoji, for example `feat(skills): ✨ add drawio skill` or `chore(platforms): 🧹 prune dead command source`. Keep subjects imperative and scoped. Run `just ci` before committing and fix any failures. Pull requests should summarize the change, list the verification commands used (typically `just ci`), and link related issues; include screenshots only when a skill or platform asset has a visible artifact worth showing.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `bahayonghang/my-ai-cli-toolkit`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default role names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

single-context. See `docs/agents/domain.md`.
