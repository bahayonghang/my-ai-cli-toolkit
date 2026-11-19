# Current gap: plan-review handoff dumps confirmations

## User-visible failure

2026-08-31 screenshot (external Trellis plan-review repair session, not this repo's product code):

- 14 TPR items were already written into planning artifacts (`TPR-01`–`TPR-14`).
- `task.json` unchanged; `task.py start` not run.
- Chat ended with a start-front list: six user-owned confirmations (including newly added `maint purge` authorization, D7 regex unsupported, D5 switch narrowing).
- Footer the user had to type: `请使用askuserquestion解决确认选项，然后可以直接开工`.

The revising agent listed confirmations as prose and waited. The user had to remind it to call the structured question tool, then continue planning. That extra round is the defect.

Screenshot domain details (`c3/share.rs`, Mihomo, `AUDIT_MAX_ROWS`, routing switch counts) are eval-only fixtures, not core rules.

## Verified package state (this repo)

1. `skills/development-workflows/trellis-plan-review/SKILL.md` hard gates: do not edit `prd.md` / `design.md` / `implement.md` / jsonl / `task.json` / product code; do not produce a revised plan; do not run `task.py start`. The only durable write is `.trellis/reviews/<root>.md`.
2. Chat success contract: verdict line, one report path, exactly one text-fenced handoff from `references/handoff-prompt.md`. The reviewer does not dump a confirmation list today.
3. `references/handoff-prompt.md:70-86` (Chinese) and `:134-149` (English) tell the **reviser** to apply TPR routes, keep unverified items unverified, never claim the plan is approved, and never run `task.py start`. It never names `AskUserQuestion`, never forbids dump-and-wait, never requires a one-batch write-back.
4. `evals/evals.json` #1/#7/#10 lock reviewer read-only and “does not produce a revised plan”. #7 routes authoring/repair to Trellis planning flow. No eval covers the reviser dumping “待你确认”.
5. `tests/tree-review-contract.test.mjs` locks `version: 0.4.0` and one-scope/one-report/one-handoff. It does not lock a question gate.
6. `allowed-tools` has no `AskUserQuestion`. That remains correct for the reviewer.
7. Sibling `.trellis/tasks/08-31-goal-meta-ask-confirm` (planning) owns the same dump-and-wait failure for **generated Trellis `/goal`**. Its PRD Out of Scope explicitly does not modify `trellis-plan-review`. This task is the complementary package change.

## Causal chain

```text
trellis-plan-review writes report + handoff
  -> next agent revises TPR items
  -> revision introduces or leaves user-owned start-front / Route choices
  -> handoff has no positive duty to call AskUserQuestion
  -> reviser dumps "待你确认" in chat
  -> user types "请使用 AskUserQuestion"
  -> another planning round
  -> only then the plan is ready to implement
```

Missing mechanism: the copyable handoff must require the reviser to invoke the host structured question tool in one batch when user-owned confirmation options remain, write answers back in the same turn, and finish so the plan can be implemented without a reminder round. The reviewer stays read-only.

## Generalization

- Domain-neutral behavior: do not dump user-owned confirmation options as chat text and wait for a reminder; call the host structured question tool once, write answers, continue.
- Classification: core mechanism for the **handoff reviser contract**. Screenshot product facts stay fixtures. Reviewer independence stays an invariant.
- Promote: yes. It is a process/permission invariant. Sibling 08-31 promotes it in generated `/goal`; this task promotes it in the plan-review handoff.
