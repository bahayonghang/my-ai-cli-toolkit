# Creation handoff — file-sorter 0.1.0

## 1. Result

- Skill: `file-sorter` 0.1.0
- Job: scan one local folder, assemble a category/rename review plan, dry-run by default, move only after this-turn `plan_id` approval
- Path: `skills/developer-tools-integrations/file-sorter/`
- Publication: not published; no GitHub Release; isolated `npx skills add` install is `missing evidence`

## 2. Reference skills studied

- `composiohq/awesome-claude-skills@file-organizer` / `davila7/claude-code-templates` file-organizer (5.4K skills.sh installs and 30,311 GitHub stars observed 2026-08-21, MIT). Lesson: plan before mutation. Mapped to SKILL workflow step 4–5.
- `claude-office-skills/skills@file-organizer` (4.6K installs, MIT). Lesson: table-shaped mapping of original → destination. Mapped to assemble-plan JSON items.
- `jxnl/dots` file-organizer (license unavailable). Lesson: plan first, inspect content only when names are vague, no overwrite. Mapped to taxonomy content rule and apply dest-exists gate.
- Local `windows-dev-process-cleanup`. Lesson: audit/WhatIf default and explicit mutation flag. Mapped to `--execute`.

## 3. Absorbed and rejected

- Keep: review-before-apply, junk skip, no delete by default, conflict suffix.
- Adapt: AI File Sorter file families, refined/consistent, protected project roots, identity-checked apply, JSON undo sidecar.
- Reject: duplicate deletion, PARA/Work-Personal cabinets, Drive sync, extension-only auto-move without a plan, GGUF/Qt port.
- Invent: deterministic helper owns destinations and apply gates; LLM fills labels only.

## 4. Advantages

| Label | Claim |
|---|---|
| design advantage | Helper computes `target_dir`; the model cannot `mv` around the plan. |
| design advantage | Strong project roots skip at scan root and nested directories. |
| hypothesis | Family locks should reduce screenshot→Installer drift. Provider comparison is `missing evidence`. |

## 5. Verification and limits

- Node tests: `tests/file-sorter.test.mjs`
- House evals: `evals/evals.json` (CI does not execute them)
- Trigger eval, Skill IR, `just ci`: recorded in sibling report files when generated
- Missing evidence: install proof, provider-backed output comparison, human blind review, public accuracy metrics
