# Implement: independent diff review stance and trigger split

Ordered checklist. Do not start until the user approves the planning summary and `task.py start` has run.

## 1. Auditor SKILL.md and interface

- Bump `version` to `0.4.0`.
- Replace `description` with the design.md auditor text. Confirm `len <= 1024` and no `<` `>`.
- Insert **Independent Reviewer Stance** after Review Tone. Scope: `pr` and `dir` only.
- In Workflow / Output Contract / Error Handling: product code is read-only; `Write` only for explicit opt-in reports.
- Keep the Route table. `project` still points to `references/audit-workflow.md`.
- Align `agents/interface.yaml` `short_description` and `default_prompt` with the new stance. Do not change adapter/trust keys.

## 2. Auditor supporting docs (minimal)

- `references/communication-guide.md`: add a short anti-advocacy note under 审查者心态. Do not rewrite the file.
- Do not edit `references/rules/*.json`, `BACKGROUND.md`, or language guides.

## 3. Auditor evals

Keep #1–#9. Add:

- New positive: the user's original Chinese prompt. Assertions: Chinese output; findings before summary; severity labels; at least one of regression / missed scenario / wrong assumption / concurrency / test gap; file evidence; no product-code edit.
- New positive (optional if one case already covers it): `order_service.ts` non-atomic charge is Must Fix / `[必须修复]` with location.
- Near-neighbor already present: #5 maintainability-only → CQR; #9 health report. Keep ≥2 negatives.

Use contiguous integer `id` values. Schema: `id`, `prompt`, `expected_output`, `files`, `assertions`.

## 4. CQR SKILL.md

- Bump `version` to `0.3.0`.
- Replace `description` with the design.md CQR text.
- When to Use / When to Skip: drop `PR code quality feedback` and `架构质量审查`. Add 改动的分层与归属 as body language. Name auditor for independent diff / 全维度, `code-refactor` for apply.
- Checklist: split orchestration row per design.md.
- Do not add `agents/interface.yaml` in this task.

## 5. CQR evals

- Edit #3: remove the non-atomic payment assertion. Keep Verdict, CQ-IDs, `any`/silent fallback, and one structural issue.
- Add near-neighbor: the user's original prompt → hand off to `code-auditor`; do not reduce it to maintainability-only.
- Keep #7 (full-spectrum) and #8 (apply refactor).

## 6. Suite and neighbors

- Update `skills/development-workflows/AGENTS.md` section "Routing: code-auditor vs code-quality-review" to match D1–D4 (stance, hunt list, description split, atomicity).
- `code-refactor/SKILL.md` Review-only bullet: independent diff → auditor; maintainability → CQR.
- `trellis-plan-review/SKILL.md` Routing one-liner: independent/full-spectrum vs maintainability. If its frontmatter mentions the pair, keep it true in ≤1024 chars.

## 7. Trigger cases

Author and keep under this task:

- `research/code-auditor-trigger-cases.json`
- `research/code-quality-review-trigger-cases.json`

Must include the user's original prompt as auditor `should_trigger` and CQR `near_neighbor`.

Run, if the file exists:

```text
python C:\Users\lyh\.grok\skills\qiaomu-meta\scripts\trigger_eval.py D:\Documents\Code\Agents\my-claude-code-settings\skills\development-workflows\code-auditor --cases D:\Documents\Code\Agents\my-claude-code-settings\.trellis\tasks\08-21-independent-diff-review-boundary\research\code-auditor-trigger-cases.json --output D:\Documents\Code\Agents\my-claude-code-settings\.trellis\tasks\08-21-independent-diff-review-boundary\research\code-auditor-trigger-eval.json

python C:\Users\lyh\.grok\skills\qiaomu-meta\scripts\trigger_eval.py D:\Documents\Code\Agents\my-claude-code-settings\skills\development-workflows\code-quality-review --cases D:\Documents\Code\Agents\my-claude-code-settings\.trellis\tasks\08-21-independent-diff-review-boundary\research\code-quality-review-trigger-cases.json --output D:\Documents\Code\Agents\my-claude-code-settings\.trellis\tasks\08-21-independent-diff-review-boundary\research\code-quality-review-trigger-eval.json
```

Tune `positive_concepts` until both reports `ok: true`. If the script is missing, write `research/trigger-eval.md` with `missing evidence`.

Do not run qiaomu `validate_skill.py` as a pass gate. If run for curiosity, record README/manifest failures as intentional schema deviation.

## 8. Docs and CI

```text
just docs-sync
just skills-check
just ci
```

`docs-sync` rewrites generated catalog pages. Do not hand-edit `docs/skills/**`.

## Validation commands

| Command | Gate |
| --- | --- |
| `python -c "print(len(description))"` on both descriptions | AC2, AC3 |
| `just skills-check` | frontmatter |
| qiaomu `trigger_eval.py` as above | AC9, or missing evidence |
| `just docs-sync` then `just ci` | AC10 |

## Risky files / rollback

| File | Risk |
| --- | --- |
| `code-auditor/SKILL.md` description | Over-long or angle brackets fail `check.py`; too many `architecture` hits steal CQR |
| `code-quality-review/SKILL.md` description | Leaving `架构质量审查` undoes the split |
| CQR eval #3 | Leaving the non-atomic assertion contradicts R8 |
| `AGENTS.md` | Suite agents keep the old routing story |

Rollback: revert the files listed in design.md Compatibility.

## Do not touch

- `references/rules/*.json`
- `BACKGROUND.md` rewrite
- CQR `assets/templates/` unless the checklist heading names must match
- `gh-pr-release`
- Product code in the host repo
