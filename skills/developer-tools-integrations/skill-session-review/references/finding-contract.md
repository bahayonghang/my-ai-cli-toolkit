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

## Excerpts

At most two excerpts per finding. Each excerpt is at most 200 Unicode characters. Do not paste a full `user_query` or a full injected `SKILL.md`. Replace `sk-…`, `ghp_…`, and `Bearer …` with `[REDACTED]`. Other PII stays `UNVERIFIED`.
