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
| 10 | Offline status dashboard with charts/filtering | yes | Status Brief |
| 11 | Role swimlane explainer | yes | Architecture Atlas or Strategy Blueprint |
| 12 | Interactive code review workbench | yes | Review Workbench |
| 13 | Trainer dispatch architecture flow | yes | Architecture Atlas or Strategy Blueprint |
| 14 | Codebase architecture audit with enum/redundancy review | yes | Architecture Atlas + Review Workbench + Strategy Blueprint |
| 15 | Large evidence-heavy report that may exceed one page | yes | Evidence Dossier + Review Workbench |

Ids 1–4 verify positive triggering and correct template selection. Ids 5–6 verify the skill does **not** trigger for short transactional outputs.

Ids 7–13 are design-regression prompts. Id 14 is the architecture-audit regression for deep codebase analysis, call mechanisms, enum selection, redundancy review, and implementation-route reporting. Id 15 is the size-planning regression for evidence-heavy artifacts. They are intentionally human-judgeable:

- outer shell meaningfully uses desktop width instead of sitting inside a narrow ~1100–1300 px centered cap when the page has navigation or a side rail;
- hero has no large meaningless blank zone;
- known five-card sections do not become 4+1 on desktop;
- long Chinese/English/code-like labels do not overflow cards;
- tables make recommendation, evidence, or verdict visible before detail reading;
- roadmaps/architecture use inline SVG or structured HTML diagrams with text equivalents.
- large artifacts include a pre-build size plan, split decision, and split-bundle navigation when estimated size crosses the thresholds.

Use `references/design-review-checklist.md` for qualitative review. Keep `scripts/check_html_artifact.py` limited to objective structure, offline safety, and baseline accessibility checks.


## Architecture audit evaluation focus

For codebase architecture audit artifacts, review these points manually:

- Evidence is traceable: files, symbols, commands, and confidence are visible instead of implied.
- The SVG or structured HTML diagram clarifies the architecture better than prose alone; if it does not, prefer a table.
- Current call graph, enum selection, redundancy matrix, risks, recommendation, implementation route, and verification checklist are all present.
- Recommendations are executable: each suggested boundary/enum/redundancy change names caller impact, docs impact, proof needed, and validation gate.
- Long identifiers remain in HTML lists/tables where they wrap; SVG labels stay short, fill-only, and accessible.
