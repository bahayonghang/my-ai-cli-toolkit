# Creation Handoff

## 1. Result

- Skill: `tickets-review` (`0.1.0`, Production tier)
- Job to be done: Perform an independent, read-only, code-grounded audit of remote GitHub Issues or local `.scratch` ticket graphs (parent spec plus child tickets), persist one combined Markdown report under `reports/tickets-review/<scope-slug>.md`, and emit one lint-verified copyable handoff prompt with a structured confirmation gate for a downstream agent to optimize the tickets.
- Local path: `skills/development-workflows/tickets-review/` (local working-tree additions on `dev`; not committed or pushed).

## 2. Reference skills studied

- `affaan-m/ECC@issue-review` (`skills/issue-review/SKILL.md`, MIT, `skills.sh` `1.7K` installs as of `2026-11-24`, GitHub `310,226` stars): entered as primary external issue-audit security anchor; learned untrusted-content data isolation, explicit `owner/repo` pinning against fork/ambient env hijacking, argv-safe command invocation, and PR-vs-Issue interception; mapped to `SKILL.md`, `references/tracker-adapters.md`, and `scripts/ticket_precheck.py`.
- `toss/es-toolkit@issue-review` (`.claude/skills/issue-review/SKILL.md`, MIT, `skills.sh` `223` installs as of `2026-11-24`, GitHub `11,399` stars): entered as complementary batch issue-review anchor; learned scanning open issue batches against real source and tests while deliberately rejecting automatic label mutations during review; mapped to `SKILL.md` (`all` scope) and `references/review-passes.md`.
- `bahayonghang/my-ai-cli-toolkit@trellis-plan-review` (first-party local skill, MIT): entered as architecture & handoff anchor; learned Pass 0 + structured judgment passes, single confined atomic report persistence with non-intrusive gitignore notice, cross-member root-cause deduplication, AI blind-spot disclosure, and the 3-class reviser confirmation gate; mapped to `references/` and `scripts/write_ticket_review_report.py`.
- `bahayonghang/my-ai-cli-toolkit@matt-implement-prompt` (first-party workflow neighbor, MIT): entered as dual-tracker & prompt-linting anchor; learned GitHub native `sub_issues`/`blocked_by` + local `.scratch` adapters, Windows UTF-8 `--body-file` safety, and deterministic prompt linting before presentation; mapped to `references/tracker-adapters.md`, `references/handoff-prompt.md`, and `scripts/lint_ticket_handoff.py`.

## 3. Absorbed and rejected

- Keep: untrusted-content isolation and PR interception (`ECC@issue-review`); code-grounded batch audit (`es-toolkit@issue-review`); Pass 0 precheck, confined atomic Markdown writer, anti-inflation, blind-spot disclosure, and structured 3-class reviser confirmation gate (`trellis-plan-review`); dual GitHub/`.scratch` adapters, Windows UTF-8 `--body-file`, and deterministic handoff linting (`matt-implement-prompt`).
- Adapt: generalized real-world ticket audit failure modes (code/test contract drift, mechanical-vs-judged contradictions, pseudo-AFK `ready-for-agent` blockers, cross-ticket parallel conflicts) into domain-neutral Passes 1–7; replaced absolute-path placeholders with strict repo-relative path sanitization; decoupled report storage from `.trellis/` to `reports/tickets-review/<scope-slug>.md`.
- Reject: `es-toolkit@issue-review`'s in-review label mutation; `trellis-plan-review`'s coupling to `.trellis/tasks/` and absolute path fields; `ECC@issue-review`'s single-issue reply-drafting scope; and `gstack:spec` / `writing-issues` authoring scope (handled by `/to-spec` and `/to-tickets`).
- Invent: three zero-dependency stdlib Python helpers (`ticket_precheck.py` with GitHub/local/`--snapshot` modes, `write_ticket_review_report.py` with section + anti-doxxing path checks, and `lint_ticket_handoff.py` with tracker-aware conservative remote write-back enforcement).

## 4. Advantages and highlights

- `[design advantage]` Cleanly separates read-only ticket auditing from remote ticket mutation: persists one sanitized, verifiable local Markdown truth source under `reports/tickets-review/` and enforces conservative write-back confirmation, `--body-file` UTF-8 safety, and read-back verification in the downstream optimization prompt.
- `[validated advantage]` Verified locally via `tests/test_tickets_review.py` (stdlib unittest), `validate_skill.py` (`0` failures, `0` warnings), `trigger_eval.py` (`17/17`, `0` FP, `0` FN), `export_skill_ir.py`, `release_check.py --phase local --run-tests`, and full repository `just ci`.
- `[hypothesis]` Expected to catch code-contract mismatches, pseudo-AFK blockers, and parallel conflicts before implementation across both GitHub Issues and `.scratch` workflows; live cross-provider A/B behavioral comparisons remain `missing evidence`.

## 5. Verification and limits

- `tests/test_tickets_review.py`: covers offline snapshot precheck, cycle/PR fail-closed gates, local `.scratch` scanning + escape guard, atomic UTF-8 LF report write + personal-path leak rejection + gitignore notice, bilingual handoff linter pass/fail cases, and package link/budget integrity.
- `validate_skill.py`, `trigger_eval.py`, `export_skill_ir.py`, `release_check.py --phase local --run-tests`, and `just ci`: run and verified locally during Phase 4–5.
- `missing evidence`: live cross-client runtime discovery, live multi-provider A/B behavioral evaluation, and independent human blind review.
- Excluded actions: never mutates remote GitHub Issues, edits local tickets, modifies `.gitignore`, writes product code, or runs `git commit` / `publish_skill.py` without explicit user authorization.
