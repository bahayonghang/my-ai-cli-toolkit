# Finding contract

Each finding id is `SSR-NN` (01, 02, …).

## Required fields

| Field | Rule |
| --- | --- |
| Session id | Scanner `id` |
| Platform | `claude` / `grok` / `codex` / `oh-my-pi` |
| Evidence | Session file path plus a locator (line, tool record, or short excerpt) |
| Verdict | Exactly one of `UPDATE SKILL`, `COMPLIANCE GAP`, `ONE-OFF`, `INCONCLUSIVE` |
| Step deviation | What the skill required vs what the session did |
| User correction | Next-user-message correction, or `无` |
| Gap | Missing rule, over-rigid rule, or none |
| Reusable suggestion | Concrete SKILL.md change, or `无` if not `UPDATE SKILL` |

## Verdicts

- `UPDATE SKILL` — the skill text is incomplete or too rigid; execution was reasonable.
- `COMPLIANCE GAP` — the skill is right; execution skipped it.
- `ONE-OFF` — a single preference; do not promote into core rules.
- `INCONCLUSIVE` — evidence cannot confirm invocation or cannot support a change.

Promote a pattern to a required suggestion only when at least two `invoked` sessions show it.

## Suggestion gate

An `UPDATE SKILL` suggestion is filed only when all three conditions hold:

1. At least two `invoked` sessions show the same pattern.
2. At least one supporting session is in `failed_sessions` as defined by the
   [review scorecard](review-scorecard.md).
3. The pattern passes the File criteria below.

### File

All of these must be true:

- The failure is attributable to a missing, incorrect, or unclear instruction
  in a specific instruction carrier.
- The carrier and the reusable rule it should contain can be named precisely.
- Had that rule already existed and been followed, this failure would not have
  occurred.

### Don't file

Do not file a suggestion when any of these is true:

- Existing instructions already require the correct behavior but the agent did
  not follow them; use `COMPLIANCE GAP`.
- The behavior is model variance.
- The only possible change is a restatement, qualifier, or example copied from
  the reviewed sessions.
- The real repair belongs outside the instruction carrier.

Every finding must have exactly one destination: it is referenced once by one
`suggestions[].finding_ids` entry, or it has exactly one
`not_filed[].finding_id` explanation. Together those arrays form an exact,
complete partition of `findings[].id`: unknown ids, duplicates within or across
the groups, and omissions are invalid. A review with no fileable suggestion is
successful when each finding has a `not_filed` reason.

The writer enforces the two-session gate, failed-session support, reference
existence, and exact partition. Manual review enforces File/Don't-file judgment.
It separately reviews every invoked-session score reason for evidence alignment,
non-restatement, a causal mechanism, and a repairable lever; that reason review
is not satisfied merely by approving a suggestion decision.

## Excerpts

At most two excerpts per finding. Each excerpt is at most 200 Unicode characters. Do not paste a full `user_query` or a full injected `SKILL.md`. Replace `sk-…`, `ghp_…`, and `Bearer …` with `[REDACTED]`. Other PII stays `UNVERIFIED`.
