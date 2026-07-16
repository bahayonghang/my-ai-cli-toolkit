# PRD: Optimize code-auditor skill toward project-level audit best practices

## Background

`skills/development-workflows/code-auditor` (v0.2.0) is currently a **diff/PR-centric review skill**: 6 dimensions, regex rule JSONs, bilingual output contract, 4-phase workflow. The user's actual need includes **whole-project audits** (architecture, quality, health), which the skill handles poorly today.

Web research (2026-07) surveyed leading project-level audit skills:

- [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) — forced orientation phase (manifest + structure + git churn → mental model _before_ judgment); required "looks bad but is actually fine" section; findings table with effort estimates; persistent `TECH_DEBT_AUDIT.md` artifact.
- [GuidanceStudio/code-repository-audit-skill](https://github.com/GuidanceStudio/code-repository-audit-skill) — intent routing (quick / security / release / deep / full cuts) with per-cut effort budgets; dated report artifact.
- [synthesis-codebase-review](https://github.com/rajivpant/synthesis-skills/blob/main/synthesis-codebase-review/SKILL.md) — tiered rigor (Essential → Mission-Critical); **delta review mode** (trajectory vs snapshot); strengths-first framing.
- [lunardragonlabs/codebase-audit](https://github.com/lunardragonlabs/codebase-audit) — CI lint validating SKILL.md ↔ references drift invariants.
- [Iron-Ham/claude-deep-review](https://github.com/Iron-Ham/claude-deep-review), [codeprobe-claude](https://github.com/nishilbhave/codeprobe-claude), [nud3l /code-audit gist](https://gist.github.com/nud3l/15468abc5c4ca7e4e0e38e5b120a7997) — parallel subagent orchestration per dimension; separation of new vs pre-existing issues.
- [Asixa/codemap-skill](https://github.com/Asixa/codemap-skill) — per-module 0–100 scoring by independent subagents; committed JSON as audit history.
- [prod-readiness](https://github.com/acedergren/agentic-tools/blob/HEAD/skills/prod-readiness/SKILL.md) — no CRITICAL without file:line; per-agent report files then synthesis.
- Multi-tool grounding (tech-debt-skill): run stack-native analyzers (`npm audit`, `ruff`, `cargo audit`, `golangci-lint`…) and fold results into findings instead of regex-only detection.

## Yao-meta analysis of current skill (findings)

Mode assessment: **Production** (team-reusable, in catalog, has evals).

### F1 — Missing project-level audit mode (high)

Workflow assumes diff-sized targets: ">200 files → ask user to narrow scope" makes whole-repo audit effectively unsupported. No orientation phase (structure map, git churn, mental model), no tiered rigor, no delta review. Best practice: route by intent (PR review / directory audit / full project audit) with different depth budgets instead of refusing scale.

### F2 — Regex rule JSONs are weak evidence for architecture/quality (high)

`references/rules/*.json` (~60 lines each) are shallow pattern matchers; architecture problems (coupling, layering, circular deps, god modules) are not regex-detectable. No multi-tool grounding; `file:line` evidence for critical findings is encouraged but not contractually required.

### F3 — No persistent audit artifact / audit history (medium)

Output goes to chat via templates; project audits need a dated, committable report (e.g. `docs/audits/` or `TECH_DEBT_AUDIT.md`-style) enabling trends and delta reviews.

### F4 — No anti-shallow-audit mechanisms (medium)

Missing: required "looks bad but is actually fine" section; no-sycophancy/no-filler contract; new vs pre-existing issue separation; "open questions" section in the report contract.

### F5 — Trigger/boundary overlap with near-neighbor (medium)

The boundary is three-way: `fuck-my-shit-mountain` (user-global at `~/.claude/skills`, NOT in this repo's catalog; 20+-dimension repository health report, also claims PR incremental audits) and repo-local `code-quality-review` (its description explicitly claims "架构质量审查" / maintainability / structure review). code-auditor's description already claims "audit a directory or file set", creating routing ambiguity on both fronts. Boundary must be redefined and re-checked with trigger evaluation (yao-meta gate for route/boundary edits). Note: the repo's `evals/evals.json` schema (`expected_output`/`assertions`) is NOT compatible with yao-meta `trigger_eval.py` (requires `should_trigger`/`should_not_trigger`/`near_neighbor` + a `semantic_config.json`); trigger cases must be authored separately.

### F6 — Evals don't cover project-level audits (medium)

All 5 evals are PR/diff scenarios plus one near-negative. New mode requires evals for: full-repo audit trigger, orientation-before-judgment, artifact output, delta mode, and boundary vs fuck-my-shit-mountain.

### F7 — Hygiene (info, downgraded)

Verified 2026-07-17: `scripts/__pycache__/*.pyc` are NOT git-tracked (`git ls-files` count 0) and `.gitignore` already covers `*.pyc`. Furthermore `just python-check` regenerates `__pycache__` via `py_compile`, so "no pyc on disk" is not a stable state. Requirement reduces to keeping pyc untracked. Scripts are PR-oriented; audit mode scopes them out.

## Requirements

- R1. **DECIDED (see design.md):** extend code-auditor with an intent-routed **project-audit mode**. Positive boundary: full-spectrum multi-dimension audit (correctness/security/performance/readability/testing/architecture together). Exclusions to state in the description: not for maintainability/structure/refactoring-only reviews (code-quality-review's scope) and not for repository health reports spanning non-code dimensions (compliance, privacy, cost, a11y).
- R2. Audit workflow with orientation phase (structure, manifest, git churn, mental model) before judgment; tiered depth (quick scan vs deep audit); findings table `ID | dimension | file:line | severity | effort | recommendation`; required "looks bad but is actually fine" + "open questions" sections; delta mode when a prior report exists. **Default output is in-chat; the dated report file is an explicitly opt-in capability** (user asks to save, or confirms when offered). No minimum finding count; sections may state "no reliable instances found in the checked scope".
- R3. Ground findings beyond regex: ripgrep/AST plus stack-native tools when available (graceful fallback); tools must NOT be auto-installed and must not access the network without explicit user approval; require `file:line` evidence for all critical/high findings.
- R4. Update `description` frontmatter early (yao-meta description-first). Author task-local trigger cases in trigger_eval.py's schema (`should_trigger`/`should_not_trigger`/`near_neighbor`) plus a code-auditor-specific semantic config, and run the trigger eval gate. Extend `evals/evals.json` (repo schema) with ≥3 project-audit evals incl. near-negatives for both neighbors.
- R5. Preserve bilingual output contract, severity mapping, and untrusted-input rule; keep diff/PR review backward compatible.
- R6. Verify pyc files remain untracked by Git (they already are); optional local cache cleanup only after final CI run.
- R7. Production-mode gates: run yao-meta `validate_skill.py` and `resource_boundary_check.py` on the updated skill and record results.

## Acceptance Criteria

- [x] AC1. Boundary decision recorded in the skill and reflected in `description`, including the two exclusion clauses (R1).
- [x] AC2. `just skills-check` and `just ci` pass.
- [x] AC3. Project-audit mode defaults to in-chat output; when the user opts in to saving, it produces a dated, collision-safe report file with: executive summary, findings table (file:line + severity + effort), "looks bad but fine" section, open questions.
- [x] AC4. Task-local trigger cases pass `trigger_eval.py` with the code-auditor semantic config: project-audit prompts route in; "review this PR" routes in; maintainability-only (code-quality-review) and non-code health-report (fuck-my-shit-mountain) near-negatives route out.
- [x] AC5. Existing PR-review evals (#1–#4) still satisfied; no regression in bilingual/severity contracts.
- [x] AC6. `git ls-files` shows no tracked `.pyc`/`__pycache__` under the skill directory (checked after final `just ci`).
- [x] AC7. `validate_skill.py` and `resource_boundary_check.py` results recorded in the task's research notes.

## Constraints

- Windows; Python scripts must run with `PYTHONUTF8=1` when reading UTF-8 files.
- Do not fabricate telemetry/benchmarks; mark unavailable evidence as `missing evidence`.
- Complex task: add `design.md` + `implement.md` before `task.py start`.
