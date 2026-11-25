# Prior-Art Research

- Researched at: `2026-11-24`
- Queries: `"issue review"`, `"ticket review"`, `"spec review"` (`skills.sh`), `"github issue review"`, `"ticket spec review"` (`SkillsMP`), plus local inspection of first-party sibling skills `trellis-plan-review` and `matt-implement-prompt`.
- Catalog tooling note: `qiaomu-meta-skill/scripts/research_prior_art.py` failed on Windows with `FileNotFoundError: [WinError 2]` because it invokes bare `npx` rather than `npx.cmd`. Discovery was completed directly via `npx.cmd --yes skills find` and `python .agents/skills/qiaomu-meta-skill/scripts/search_skillsmp.py` plus direct read-only GitHub API inspection of shortlisted `SKILL.md` sources.
- Rating evidence: `rating evidence unavailable` (`skills.sh` exposes install telemetry only; `SkillsMP` exposes GitHub repository stars only).

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `affaan-m/ECC@issue-review` | Primary external issue-audit anchor | `1.7K` installs | N/A in queried slice; GitHub `310,226` stars | Active repo (`pushed_at: 2026-11-23`); inspected `skills/issue-review/SKILL.md` directly | **Untrusted Content Rule** (treat issue text/comments/links strictly as data), explicit `owner/repo` resolution to avoid fork/ambient env hijacking, argv-safe execution, PR-number interception | Scoped to triaging one external user bug/feature report with a draft reply; no multi-ticket Spec graph audit, no persisted local Markdown report, no downstream reviser handoff prompt | MIT |
| `toss/es-toolkit@issue-review` | Complementary batch issue-review anchor | `223` installs | N/A in queried slice; GitHub `11,399` stars | Active repo (`pushed_at: 2026-11-14`); inspected `.claude/skills/issue-review/SKILL.md` directly | Batch-fetching open issues and cross-checking each against actual source code, tests, and existing implementation | Automatically mutating labels via `/issue-label` during review (violates strict read-only audit separation) | MIT |
| `bahayonghang/my-ai-cli-toolkit@trellis-plan-review` | First-party architecture & handoff paradigm anchor | First-party (local) | First-party (local) | Inspected full local package (`SKILL.md`, `references/`, `scripts/`, `tests/`) | Read-only hard gates, Pass 0 mechanical precheck + structured multi-pass judgment, single atomic report write + gentle untracked gitignore hint (without editing `.gitignore`), copyable handoff prompt with 3-class confirmation gate (`revision-question-gate`), anti-inflation & blind-spot disclosure | Hard coupling to `.trellis/tasks/` (`prd.md`/`design.md`/`implement.md`/`task.json`) and absolute-path placeholders in report/handoff templates | MIT |
| `bahayonghang/my-ai-cli-toolkit@matt-implement-prompt` | First-party workflow neighbor & tracker adapter anchor | First-party (local) | First-party (local) | Inspected local `SKILL.md` and `references/tracker-adapters.md` | Dual GitHub Issues (native `sub_issues` + `blocked_by` with body fallback) and local `.scratch/<feature>/issues/` adapters; Windows UTF-8 `--body-file` rule; deterministic prompt linter gate before output | Compiles execution/implementation prompts after tickets are finalized rather than auditing ticket defects | MIT |

> Adjacent candidates reviewed and kept out of scope: `garrytan/gstack:spec` (SkillsMP `142,483` repo stars — spec authoring, overlaps `/to-spec`), `n8n-io/n8n:linear-issue` / `create-issue` (SkillsMP `210,427` repo stars — Linear context fetching/creation), and `riekelt/technical-writer@writing-issues` (`27.6K` installs — authoring issues).

## Original contribution

1. Bridges the gap between `/to-tickets` and `matt-implement-prompt` / `/implement-spec` with an independent, code-grounded **Spec & Ticket Graph audit** supporting both remote GitHub Issues (including native `sub_issues` and `blocked_by`) and local `.scratch/<feature>/issues/` directories.
2. Encodes domain-neutral audit passes specifically targeting common ticket failure modes before agent execution: code/test contract mismatch, mechanical-vs-judged verification contradictions, pseudo-`ready-for-agent` AFK blockers, cross-ticket parallel write conflicts, and label/dependency topology drift.
3. Combines `trellis-plan-review`'s atomic confined report persistence (`reports/tickets-review/<scope-slug>.md`) and 3-class confirmation gate with `ECC@issue-review`'s untrusted-content security rules, strict anti-doxxing path sanitization (blocking leaked personal absolute paths), and a conservative remote GitHub write-back gate (`--body-file` UTF-8 + read-back verification) enforced by three zero-dependency stdlib Python scripts.

## What we learned from each candidate

- `affaan-m/ECC@issue-review`: untrusted data isolation, explicit `owner/repo` pinning, and PR-vs-Issue disambiguation -> mapped to `SKILL.md` Hard Gates, `references/tracker-adapters.md`, and `scripts/ticket_precheck.py`.
- `toss/es-toolkit@issue-review`: auditing batches of open issues directly against live source and tests -> mapped to `SKILL.md` `all` scope and `references/review-passes.md` Pass 1.
- `trellis-plan-review`: Pass 0 + multi-pass judgment, single atomic confined report writer with non-intrusive gitignore note, anti-inflation + blind-spot disclosure, and structured reviser confirmation gate -> mapped to `references/{review-passes,finding-contract,report-template,handoff-prompt,revision-question-gate}.md` and `scripts/write_ticket_review_report.py`.
- `matt-implement-prompt`: GitHub + `.scratch` dual-tracker contract, Windows UTF-8 `--body-file` safety, and deterministic prompt linting -> mapped to `references/tracker-adapters.md`, `references/handoff-prompt.md`, and `scripts/lint_ticket_handoff.py`.

## Created skill advantages

- `[design advantage]` Enforces strict read-only auditing with one confined atomic report write under `reports/tickets-review/`, rejects leaked personal absolute paths deterministically, and requires a conservative remote write-back approval gate in the downstream optimization prompt.
- `[validated advantage]` Verified locally via stdlib unittest (`tests/test_tickets_review.py`), `validate_skill.py`, `trigger_eval.py`, `release_check.py --phase local --run-tests`, and full repository `just ci`.
- `[hypothesis]` Expected to catch code-contract drift, pseudo-AFK tickets, and cross-ticket parallel conflicts before implementation begins across both GitHub Issues and local `.scratch` workflows; live cross-provider A/B benchmark and blind human review remain `missing evidence`.

## Missing evidence

- No `skills.sh` or SkillsMP user ratings/reviews (`rating evidence unavailable`).
- No live multi-provider behavioral A/B benchmark or independent human blind review yet (`missing evidence`).
