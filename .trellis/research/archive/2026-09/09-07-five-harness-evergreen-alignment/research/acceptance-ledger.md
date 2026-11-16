# Acceptance ledger

Unique evidence ledger for parent `09-07-five-harness-evergreen-alignment` and
children C1–C4. Date: 2026-09-07.

C4 records directed-check results as given. C4 did not re-run C1/C2/C3 suites
and did not run `just ci`.

## Result labels

| Label | Meaning |
| --- | --- |
| PASS | Named command exited 0, or named file inspection matched the AC |
| FAIL | Named command or inspection missed a required behavior |
| SKIP | Out of OBJECTIVE bound, not approved, or deferred |
| MISSING DEPENDENCY | Runner or package absent |
| UNVERIFIED | Required evidence was not run |

Unrun client start and new-SHA hosted stay UNVERIFIED. Child-time `just ci`
was a parent gate and stays UNVERIFIED until the parent runs that command.

## Child commits

| Child | Task | Commit |
| --- | --- | --- |
| C1 | `09-07-claude-hook-runtime-contract` (archived after commit) | `cb9d7b32` |
| C3 | `09-07-harness-verification-coverage` | `3faa1e22` |
| C2 | `09-07-harness-guidance-alignment` | `ffddeaa5` |
| C4 | `09-07-harness-model-routing-knowledge` | this child; no commit |

## Findings F1–F6

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | approved | `platforms/claude/hooks/pre-bash.py`, `platforms/claude/hooks/hooks.json`, `platforms/claude/hooks/tests/test_hooks.py` | `python -m unittest discover -s platforms/claude/hooks/tests -p test_*.py`; `python -m json.tool platforms/claude/hooks/hooks.json`; `just python-check`; `git diff --check` | PASS: 16 tests OK EXIT 0; json.tool EXIT 0; python-check EXIT 0, 65 files; git diff --check EXIT 0. UNVERIFIED: real Claude client wiring. UNVERIFIED: child-time `just ci` (parent gate) | Claude Code | C1 hook sources and tests; C4 `.trellis/spec/backend/error-handling.md` |
| F2 | approved | `platforms/claude/hooks/log-prompt.py`, `platforms/claude/hooks/hooks.json`, `platforms/claude/code_map.md`, `docs/harnesses.md` | hook unittest (session isolation in the 16 tests); `just docs-sync`; `just docs-check` | PASS: 16 tests OK EXIT 0 (distinct session logs; log failure non-blocking 1). PASS: docs-sync EXIT 0; docs-check EXIT 0. UNVERIFIED: real Claude client wiring; client load | Claude Code (runtime); all five hosts (public description) | C1 hook sources; C2 `docs/harnesses.md`; C4 `.trellis/spec/backend/error-handling.md` (prompt-log failure is exit 1) |
| F3 | approved | `justfile` | `just python-test` | PASS: python-test EXIT 0; gh-pr-release 22, hooks 16. UNVERIFIED: child-time `just ci` (parent gate) | all five hosts (local CI); Claude Code (hook suite) | C3 `justfile`; C4 `.trellis/spec/backend/quality-guidelines.md` |
| F4 | approved | `scripts/test_install_projects.py` | `just install-projects-test` | PASS: EXIT 0; 35 tests (29+6). UNVERIFIED: five-client load | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | C3 installer tests; C2 `docs/harnesses.md` (dest map is not discovery); C4 skill-authoring path-link rule |
| F5 | approved | `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/index.md`, `docs/en/index.md`, `docs/scripts/sync_docs_catalog.py`, generated docs | `just docs-sync`; `just docs-check` | PASS: docs-sync EXIT 0; docs-check EXIT 0. SKIP: `README_CN.md`, root `code_map.md`, vitepress top nav (out of C2 OBJECTIVE; leftover, not a C2 fail). UNVERIFIED: client load; child-time `just ci` | all five hosts (project entries); Claude Code (`CLAUDE.md` import) | C2 authored docs and generator |
| F6 | approved | `docs/harnesses.md`, `docs/en/harnesses.md`, `.trellis/spec/guides/harness-execution-routing.md` | `just docs-sync`; `just docs-check`; C4 spec walkthrough; `git diff --check` | PASS: docs-sync EXIT 0; docs-check EXIT 0; routing guide added with no second capability table. UNVERIFIED: five-client load | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | C2 `docs/harnesses.md` (unique capability table); C4 `.trellis/spec/guides/harness-execution-routing.md` |

## Child packages C1–C4

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | approved; archived after `cb9d7b32` | `platforms/claude/hooks/pre-bash.py`, `log-prompt.py`, `hooks.json`, `platforms/claude/hooks/tests/test_hooks.py`, `platforms/claude/code_map.md`; deleted `inject-spec.py` | `python -m unittest discover -s platforms/claude/hooks/tests -p test_*.py`; `python -m json.tool platforms/claude/hooks/hooks.json`; `just python-check`; `git diff --check` | PASS: 16 tests OK EXIT 0; json.tool EXIT 0; python-check EXIT 0, 65 files; git diff --check EXIT 0. UNVERIFIED: real Claude client wiring. UNVERIFIED: child-time `just ci` (parent gate) | Claude Code | hook sources and tests; C4 error-handling spec |
| C2 | approved; commit `ffddeaa5` | `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/index.md`, `docs/en/index.md`, `docs/harnesses.md`, `docs/en/harnesses.md`, `docs/scripts/sync_docs_catalog.py`, generator outputs | `just docs-sync`; `just docs-check` | PASS: docs-sync EXIT 0; docs-check EXIT 0. SKIP: `README_CN.md` / root `code_map.md` / vitepress top nav leftover. UNVERIFIED: client load. UNVERIFIED: child-time `just ci` | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | `docs/harnesses.md` and project entries |
| C3 | approved; commit `3faa1e22` | `justfile`, `scripts/test_install_projects.py` | `just python-test`; `just install-projects-test`; inspect `.github/workflows/agentkit-desktop.yml` | PASS: python-test EXIT 0 (gh-pr-release 22, hooks 16); install-projects-test EXIT 0, 35 tests (29+6); hosted YAML still `run: just ci`. MISSING DEPENDENCY: optional pytest. UNVERIFIED: new-SHA hosted matrix; five-client load | all five hosts (installer layout and CI entry); Claude Code (hook unittest) | `justfile`; installer tests; C4 quality-guidelines |
| C4 | approved; in progress this child | `.trellis/spec/guides/harness-execution-routing.md`, `.trellis/spec/guides/index.md`, `.trellis/spec/backend/error-handling.md`, `.trellis/spec/backend/quality-guidelines.md`, `.trellis/spec/guides/skill-authoring-conventions.md`, this ledger | file inspection of those spec files; `git diff --check` | PASS: routing guide, error-handling PreToolUse 2 and UserPromptSubmit log-failure 1 as separate host-protocol exceptions, quality compile-vs-protocol, authoring path-link rule, ledger rows. PASS: `git diff --check` EXIT 0 (C4 check re-run 2026-09-07). UNVERIFIED: parent `just ci` | Claude Code (PreToolUse exit 2; UserPromptSubmit log-failure 1); all five hosts (routing); Codex (native subagent notes link) | `.trellis/spec/`; this ledger |

## Parent PRD acceptance criteria

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| Parent-AC1 | approved (planning evidence) | `research/audit-report.md`, `research/test-baseline.md` | planning-time `just ci` at HEAD `3c452977` (recorded in test-baseline) | PASS: audit report has HEAD, worktree baseline, structure, test results, and failure anchors. Planning-time just ci EXIT 0 (docs unit 4; skills 41; python-check 65; installer 29; Node 423 / 419 pass / 0 fail / 4 skip). Post-change parent `just ci` UNVERIFIED | all five hosts (review scope) | parent research (planning); not a runtime guarantee |
| Parent-AC2 | approved | `research/harness-capabilities.md`, `docs/harnesses.md`, `docs/en/harnesses.md` | `just docs-sync`; `just docs-check` | PASS: five-host matrix with dated sources; docs-sync EXIT 0; docs-check EXIT 0. UNVERIFIED: five-client load. No performance or price ranking | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | C2 `docs/harnesses.md`; C4 routing guide links that page |
| Parent-AC3 | approved | parent and four child `prd.md` / `design.md` / `implement.md` / jsonl | planning `task.py validate` and plan-precheck (review 2026-09-07: 5 members, 0 blocking) | PASS: parent/child tree linked; C1–C3 archived after directed checks; C4 in progress | all five hosts (planning); per-child file bounds | task tree under `.trellis/tasks/` |
| Parent-AC4 | approved (planning constraint) | task tree; review `.trellis/reviews/09-07-five-harness-evergreen-alignment.md` | planning-time `git status --porcelain=v1 --untracked-files=all`; `git diff --check` | PASS: planning stay held until user approval. After approval, C1–C4 wrote only owned files. User-global AGENTS and Basic Memory SKIP (not authorized) | all five hosts | planning review; no extra knowledge write |
| Parent-AC5 | approved; integration open | C1–C4 products; this ledger | child directed checks below; parent `just ci` not run | PASS: C1–C3 directed checks as given; C4 spec and ledger written; unrun client start and new-SHA hosted labeled UNVERIFIED. UNVERIFIED: parent `just ci`. MISSING DEPENDENCY: optional pytest | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | this ledger; `.trellis/spec/`; `docs/harnesses.md` |

## C1 PRD acceptance criteria

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| C1-AC1 | approved | `platforms/claude/hooks/pre-bash.py`, `platforms/claude/hooks/tests/test_hooks.py` | `python -m unittest discover -s platforms/claude/hooks/tests -p test_*.py` | PASS: 16 tests OK EXIT 0 (stdin hit exit 2; safe command exit 0; invalid event exit 2 not 1) | Claude Code | C1 tests; C4 error-handling |
| C1-AC2 | approved | `platforms/claude/hooks/log-prompt.py` | same hook unittest | PASS: 16 tests OK EXIT 0 (two session_id files; same session_id appends; tests do not write repo session logs) | Claude Code | C1 tests |
| C1-AC3 | approved | `platforms/claude/hooks/hooks.json`, `platforms/claude/code_map.md` | `python -m json.tool platforms/claude/hooks/hooks.json`; hook unittest space-containing plugin root | PASS: json.tool EXIT 0; 16 tests OK EXIT 0 (no CLAUDE_TOOL_INPUT; no no-op; quoted plugin-root command) | Claude Code | C1 hook wiring; C2 public hook description |
| C1-AC4 | approved | hook tests; python compile | hook unittest; `python -m json.tool platforms/claude/hooks/hooks.json`; `just python-check`; `git diff --check` | PASS: 16 tests OK EXIT 0; json.tool EXIT 0; python-check EXIT 0, 65 files; git diff --check EXIT 0. UNVERIFIED: real Claude client wiring. UNVERIFIED: child-time `just ci` (parent gate) | Claude Code | C1 tests; parent gate for `just ci` |

## C2 PRD acceptance criteria

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| C2-AC1 | approved | `CLAUDE.md`, `AGENTS.md` | `git show ffddeaa5:CLAUDE.md` | PASS: `git show` EXIT 0; `CLAUDE.md` uses `@AGENTS.md` and keeps Claude loader notes only. UNVERIFIED: client load | Claude Code | `CLAUDE.md`; `AGENTS.md` |
| C2-AC2 | approved | `docs/harnesses.md`, `docs/en/harnesses.md` | `just docs-sync`; `just docs-check`; five-row walkthrough | PASS: docs-sync EXIT 0; docs-check EXIT 0; five hosts present; sources dated 2026-09-07; UNVERIFIED items labeled; Kimi is Kimi Code CLI; OMP does not borrow Pi. UNVERIFIED: client load | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | `docs/harnesses.md` (unique capability table) |
| C2-AC3 | approved with leftover | `README.md`, `docs/index.md`, `docs/en/index.md` | `just docs-sync`; `just docs-check` | PASS: docs-sync EXIT 0; docs-check EXIT 0; README and docs homepages point at the capability table and current CI list. SKIP: `README_CN.md`, root `code_map.md`, vitepress top nav (out of C2 OBJECTIVE; leftover, not a C2 fail) | all five hosts (docs entries) | README and docs homepages |
| C2-AC4 | approved | `docs/scripts/sync_docs_catalog.py`, generated docs | `just docs-sync`; `just docs-check` | PASS: docs-sync EXIT 0; docs-check EXIT 0. UNVERIFIED: client load. UNVERIFIED: child-time `just ci` (parent gate) | all five hosts (generated catalog) | generator and generated docs |

## C3 PRD acceptance criteria

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| C3-AC1 | approved | `justfile` | `just python-test` | PASS: EXIT 0; gh-pr-release 22, hooks 16 | Claude Code (hooks); repo-wide (gh-pr-release) | `justfile`; C4 quality-guidelines |
| C3-AC2 | approved | `scripts/test_install_projects.py` | `just install-projects-test` | PASS: EXIT 0; 35 tests (29+6). UNVERIFIED: five-client load | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | installer tests; C2 dest-map-is-not-discovery wording |
| C3-AC3 | approved; parent gate open | `justfile`; inspect-only `.github/workflows/agentkit-desktop.yml` | `just python-test`; YAML inspection | PASS: python-test in `just ci` (7 steps); hosted YAML still `run: just ci`. UNVERIFIED: parent `just ci`. UNVERIFIED: new-SHA hosted matrix | all five hosts (CI entry) | `justfile`; parent gate |
| C3-AC4 | approved | none added for pytest or browsers | optional pytest attempt recorded at planning; no new pytest/browser deps | MISSING DEPENDENCY: optional pytest. UNVERIFIED: browser smoke on new SHA; five-client handshake; new-SHA hosted | all five hosts | test-baseline; this ledger |

## C4 PRD acceptance criteria

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| C4-AC1 | approved | `.trellis/spec/guides/harness-execution-routing.md`, `.trellis/spec/guides/index.md` | file inspection of `.trellis/spec/guides/harness-execution-routing.md` (hosts Claude Code, Codex, Grok Build, Kimi Code CLI, OMP; strong/cheap table; section `Return to the strong model`; text `not a performance ranking` and `price ranking`); `git diff --check` | PASS: five-host routing guide with strong/cheap split and return-to-strong conditions; links `docs/harnesses.md`, goal-meta platform-goal-facts, and Codex native subagent README; no second capability table; no performance or price ranking. `git diff --check` in C4-AC3 | Claude Code, Codex, Grok Build, Kimi Code CLI, OMP | `.trellis/spec/guides/harness-execution-routing.md` |
| C4-AC2 | approved | `.trellis/spec/backend/error-handling.md`, `.trellis/spec/backend/quality-guidelines.md`, `.trellis/spec/guides/skill-authoring-conventions.md`, this ledger | file inspection of `error-handling.md` (PreToolUse exit 2; UserPromptSubmit log-failure exit 1; no `exits 1 on blocked commands`); `quality-guidelines.md` (compile vs protocol; `just python-test`); `skill-authoring-conventions.md` (path links not discovery; link to `docs/harnesses.md`); mapping in this file; `git diff --check` | PASS: generic CLI 1 versus Claude PreToolUse 2; invalid PreToolUse event returns 2; UserPromptSubmit prompt-log failure returns 1 and is not a PreToolUse rule; stale pre-bash exit-1 example removed; host-protocol exceptions allowed; Claude PreToolUse codes are not a universal hook protocol (hosts link `docs/harnesses.md`). Quality: compile is not event-protocol testing; `just python-test` named. Authoring: path links are not host discovery; fixtures are not provider behavior. Mapping rows cover F1–F6 and every parent/child AC. `git diff --check` in C4-AC3 | Claude Code (PreToolUse exit 2; UserPromptSubmit log-failure 1); all five hosts (quality/authoring) | `.trellis/spec/backend/` and guides; this ledger |
| C4-AC3 | approved | this ledger; C4 spec files | `git diff --check` | PASS: `git diff --check` EXIT 0 (C4 check re-run 2026-09-07 after error-handling split). Local PASS/FAIL/SKIP/MISSING DEPENDENCY/UNVERIFIED split in every row above. Unapproved items SKIP below. UNVERIFIED: parent `just ci`. UNVERIFIED: unrun client start and new-SHA hosted | all five hosts | this ledger |

## Deferred or out of bound (not complete)

| discovery id | approval status | files | checks | results | applicable tools | knowledge destination |
| --- | --- | --- | --- | --- | --- | --- |
| D1 Kimi skill-session-review schema | not approved this round | none | none | SKIP | Kimi Code CLI | remain in `research/audit-report.md` only |
| D2 Antigravity plan_file binding | out of five-host scope | none | none | SKIP | Antigravity | remain in `research/audit-report.md` only |
| D3 user-global AGENTS / Basic Memory / new router | not authorized | none | none | SKIP | all | none |
| D4 goal-meta / codex-bridge skill edits | no proven defect this round | none | none | SKIP | Codex, Goal hosts | existing skill facts stay owners |
