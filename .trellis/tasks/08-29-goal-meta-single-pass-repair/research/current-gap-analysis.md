# Current gap analysis

Date: 2026-08-29

## Verified failure chain

1. `SKILL.md:86-92` requires bounded evidence-driven iteration but has no stable scan envelope or finding ledger.
2. `SKILL.md:115-121` and `references/trellis-goal-cadence.md:92-112` define implementation then verification, but no checker-to-implementer feedback edge.
3. `references/goal-command-playbook.md:305-328` shows commit/archive examples without original-command rescan or same-scope finding ingestion.
4. `scripts/lint_goal_command.py:422-558` validates dispatch and closeout terms, not convergence.
5. `scripts/lint_goal_command.py:624-629` only applies inline Trellis checks when both `.trellis/tasks/` and `archive` occur.
6. `tests/lint-goal-command.test.mjs:492-513` and eval cases 34-41 encode a one-way implementation/check handoff.
7. Target baseline: 50/50 Node tests passed; package metadata check passed; both Python helpers byte-compiled.
8. Qiaomu validator failed only for missing `README.md`/`manifest.json` and warned about missing `evals/trigger_cases.json`.

## Root cause

The current contract proves who implements, who checks, and how a Trellis task closes, but does not define the review-remediation input set or what happens when checking finds another in-scope defect. A downstream agent can therefore treat the checker report as a new handoff artifact and return a new repair Prompt.

If the scan reads a growing session window, the repair session itself can change the next input set. Without command/config/corpus/version pinning, apparent new findings can also be baseline drift rather than missed repair.

## Required correction

One approved external Prompt must own the whole feedback loop. Within-scope actionable findings return to implementation in the same Goal; a user question is legal only when a new user-owned decision or authority is required. Independent validation remains mandatory and internal.

## Evidence limits

Static source and deterministic tests can prove the package contract. They cannot prove provider compliance, human usability, future corpus behavior, or reduced real-world repair-Prompt count.
