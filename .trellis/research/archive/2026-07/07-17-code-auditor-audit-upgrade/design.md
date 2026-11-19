# Design: code-auditor project-audit upgrade

## Decision (R1)

**Option (a): extend code-auditor with an intent-routed project-audit mode.**

Rationale:

- The near-neighbor `fuck-my-shit-mountain` lives in `~/.claude/skills` (user-global), not in this repo's installable `skills/` catalog. The catalog itself has no project-level audit capability; delegating would make the shipped skill incomplete for other installers.
- Overlap is bidirectional anyway (fuck-my-shit-mountain also claims PR incremental audits), so "delegate" would not remove the routing ambiguity — only sharper descriptions do.
- Boundary is **three-way**; encode in the description as positive scope + explicit exclusions:
  - **code-auditor** — full-spectrum engineering audit that always covers correctness, security, performance, readability, testing, AND architecture together: PR diff review, directory audit, whole-project audit. Exclusion clauses in description: "Not for reviews focused only on structure, maintainability, or refactoring opportunities; not for repository health reports spanning non-code dimensions such as compliance, privacy, cost, or accessibility."
  - **code-quality-review** (repo-local) — maintainability/structure/abstraction/refactoring-focused review, incl. "架构质量审查". code-auditor must NOT claim "整个项目的架构和质量" as bare wording, since it collides with this skill and with existing eval #5; the project-audit trigger wording is "multi-dimension/full-spectrum audit of an entire project" (全维度/全谱审计).
  - **fuck-my-shit-mountain** (user-global) — 20+-dimension repository _health report_ including non-code lenses. Handoff mentioned only in a reference note, not in the description (descriptions stay portable).

## Architecture of the change

### 1. Intent routing (SKILL.md, replaces current "Determine the review target" step 1)

| Route     | Trigger                                                                                   | Depth                                | Output                             |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- |
| `pr`      | PR number/URL, "review PR/MR", git diff default                                           | current 4-phase workflow (unchanged) | chat review via existing templates |
| `dir`     | explicit file/dir path, small scope                                                       | current workflow, deep on all files  | chat review or short report        |
| `project` | "audit the project/codebase", "全维度审计", "full audit", repo root target, or >200 files | new audit workflow (below)           | in-chat report; opt-in dated file  |

The current ">200 files → ask user to narrow" rule becomes ">200 files → switch to project route (confirm with user)" instead of refusing.

### 2. New project-audit workflow (`references/audit-workflow.md`, new file)

Four phases, modeled on tech-debt-skill + synthesis-codebase-review:

1. **Orient (mandatory, before any judgment)** — read manifest(s) and README; map directory structure; run `git log` churn analysis (most-modified × largest files = debt hotspots); write a short mental model of the architecture into the report draft.
2. **Ground** — detect stack; run available native tools with graceful fallback (`npm audit`/`knip`, `ruff`/`pip-audit`, `cargo audit`, `golangci-lint`, `just lint` if repo has one); collect ripgrep/AST sweeps per dimension. Regex rule JSONs stay as _hints_ for the sweep, not the evidence standard. **Tool policy: only use tools already installed; never auto-install; no network access (registry audits, downloads) without explicit user approval — offline tools preferred.**
3. **Judge** — per-dimension findings using existing 6 dimensions and severity contract. Contract additions: every `critical`/`high` finding MUST have `file:line`; separate **new vs pre-existing** only in delta mode; uncertain-intent items go to Open Questions, not findings.
4. **Report** — default output is **in-chat** (consistent with the repo's review-is-read-only convention). Persisting a report file is **opt-in**: the skill offers it once at the end; only on explicit user request/confirmation does it write `docs/audits/code-audit-YYYY-MM-DD.md` (repo-relative; ask before creating the directory the first time). Same-day collision: never overwrite — append `-02`, `-03`… (`code-audit-YYYY-MM-DD-02.md`) so the delta baseline is preserved. If any prior report exists in `docs/audits/`, run **delta mode** against the latest one: mark each prior finding Fixed / Partially Fixed / Still Present, and split new findings.

Depth tiers inside the project route: `quick` (orient + ground + top hotspots only, ~top 20 files) vs `deep` (full sweep). Default `quick` unless user says deep/thorough/全面.

### 3. Report contract (`assets/audit-report-template.md`, new file)

Sections (localized per existing Output Mode rules):

1. Executive summary (≤10 lines, no filler praise)
2. Mental model / architecture sketch
3. Findings table: `ID | Dimension | File:Line | Severity | Effort(S/M/L) | Description | Recommendation` — **no minimum count** (a floor would induce fabrication); no padding: report exactly what the evidence supports
4. Top-5 priorities + quick wins
5. **Looks bad but is actually fine** (section always present; if genuinely nothing qualifies, write "在已检查范围内未找到可靠实例" / "no reliable instances found in the checked scope" — never invent entries)
6. Open questions (uncertain intent)
7. What was checked (scope + tools run + tools unavailable, marked `missing evidence`)

Anti-sycophancy contract: no "overall well-structured" filler; praise only concrete practices (reuse existing tone rules).

### 4. SKILL.md edits

- `description`: add full-spectrum project-audit wording plus the two exclusion clauses per the Decision section — e.g. append "…, or run a full-spectrum multi-dimension audit of an entire project (correctness, security, performance, readability, testing, architecture together), optionally saving a dated report. Not for maintainability/structure/refactoring-only reviews, and not for repository health reports covering non-code dimensions like compliance, privacy, cost, or accessibility." Keep existing PR/CR/代码审查 triggers. Write description first (yao-meta), then run trigger eval.
- Add "Route" section (table above) before Workflow; Workflow keeps existing steps for pr/dir and points to `audit-workflow.md` for project.
- Add file:line-required rule and untrusted-input rule applies to audit mode too.
- Bump `version` to 0.3.0.

### 5. Evals & trigger gate

Two separate artifacts — schemas are incompatible:

**(a) `evals/evals.json` (repo schema: `expected_output`/`assertions`; exercised manually/by review, NOT by `just ci`).** Keep #1–#5 unchanged (`code-quality-review` exists; #5 stays valid). Add:

- E6 (zh, positive): "对这个项目做一次全维度的代码审计，正确性、安全、性能、测试都要看" → project route, orientation before findings, in-chat report; offers (not forces) saving a dated file.
- E7 (en, positive): "do a deep full-spectrum audit of this repo, focus on architecture debt too" → deep tier, findings table with file:line + effort, "looks bad but fine" section present (may state no-instances).
- E8 (delta): prior report exists in `docs/audits/` → delta mode statuses used against the latest report.
- E9 (near-negative): "给我一份包含合规、隐私、无障碍、成本的仓库健康报告" → should NOT be captured (non-code health-report neighbor).

**(b) Task-local trigger cases for yao-meta `trigger_eval.py`** (schema: `should_trigger` / `should_not_trigger` / `near_neighbor`), stored in the task dir (e.g. `research/trigger-cases.json`), plus a code-auditor-specific semantic config (`research/semantic_config.json`) — the yao-meta default config targets skill-creation routing and does not apply. Cases: E6/E7 + "review this PR" as should_trigger; E9 and "帮我看看 src/ 的结构和可维护性，抽象合不合理" (code-quality-review's scope, mirrors eval #5) as near_neighbor/should_not_trigger. Exact invocation command lives in implement.md step 7.

### 6. Scripts, hygiene & production gates

- pyc reality check (2026-07-17): `scripts/__pycache__/*.pyc` are untracked and `.gitignore` already has `*.pyc`; `just python-check` regenerates them via `py_compile`. So the contract is "never tracked", not "never on disk". Verification: `git ls-files` shows no pyc, checked AFTER the final `just ci`. Optional local cleanup last, via PowerShell (`Remove-Item -Recurse` on the `__pycache__` dir) since `rm -rf` is hook-blocked.
- No new scripts in this iteration. `pr-analyzer.py` stays PR-route-only; audit route uses native tools + rg (documented in audit-workflow.md). `rule-tester.py` untouched.
- Production-mode gates: run yao-meta `validate_skill.py` and `resource_boundary_check.py` on the updated skill; record outputs under the task's `research/`. Unavailable gate evidence is marked `missing evidence`, not fabricated.

## Compatibility & rollback

- PR/dir routes and all existing templates/references untouched except SKILL.md routing prelude → existing evals #1–#4 must still pass.
- Rollback boundary: revert SKILL.md + delete the two new files (`references/audit-workflow.md`, `assets/audit-report-template.md`) + revert evals.json restores v0.2.0 behavior exactly.

## Out of scope

- Subagent/parallel orchestration per dimension (repo skills are platform-portable; keep single-agent).
- Module 0–100 scoring dashboards (codemap-style) — future direction only.
- Extending the regex rule JSONs.
