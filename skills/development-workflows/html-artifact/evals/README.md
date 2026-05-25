# evals

Test prompts for the `html-artifact` skill. Used to validate triggering, template selection, and the manual design quality expectations that turn a usable artifact into a designed report page.

## Schema

This file uses `expectations` as the per-eval check list, matching the in-repo convention shared with `skills/development-workflows/cold-shower/evals/evals.json`.

`expectations` is semantically equivalent to the `assertions` field in the upstream `skill-creator` schema (`references/schemas.md`): each entry is a human-readable, independently judgeable check that the skill's output should satisfy.

If you wire these evals into the upstream `eval-viewer/generate_review.py` pipeline, map `expectations` → `assertions` at the tool boundary (or add both fields side by side in `evals.json`); the keys carry the same meaning.

## Coverage

| id | Intent | Should trigger | Primary template |
| -- | -- | -- | -- |
| 1 | Migration plan as browser-reviewable artifact | yes | Strategy Blueprint |
| 2 | HTML code review report with severity bands | yes | Review Workbench |
| 3 | Decision page with evidence vs inference | yes | Decision Matrix Studio + Evidence Dossier |
| 4 | Local JSON config editor with preview/export | yes | Interactive Editor |
| 5 | Plain git commit message | no | — |
| 6 | Short bug-fix summary | no | — |
| 7 | VibeDeck vs ccr-ui executive analysis regression | yes | Evidence Dossier + Decision Matrix Studio |
| 8 | Executive implementation plan with visual roadmap | yes | Strategy Blueprint |
| 9 | Before/after architecture explainer | yes | Architecture Atlas |

Ids 1–4 verify positive triggering and correct template selection. Ids 5–6 verify the skill does **not** trigger for short transactional outputs.

Ids 7–9 are design-regression prompts. They are intentionally human-judgeable:

- hero has no large meaningless blank zone;
- known five-card sections do not become 4+1 on desktop;
- long Chinese/English/code-like labels do not overflow cards;
- tables make recommendation, evidence, or verdict visible before detail reading;
- roadmaps/architecture use inline SVG or structured HTML diagrams with text equivalents.

Use `references/design-review-checklist.md` for qualitative review. Keep `scripts/check_html_artifact.py` limited to objective structure, offline safety, and baseline accessibility checks.
