# Local Skill Boundaries

- Researched at: 2026-08-10
- Scope: repository evidence for `idea-bib-review`

## Existing owners

### `paper-workbench`

Source: `skills/research-learning-knowledge/paper-workbench/SKILL.md` and its `routing.md`, `artifacts.md`, `schema.md`, `modes/synthesis.md`, and `modes/review.md`.

It already owns paper normalization, multi-paper comparison/synthesis, gap maps, review outlines, and PEEL paragraph planning from PDFs, DOI/arXiv inputs, or workbench artifacts. It does not accept `.bib` as a source class, does not preserve a user-supplied BibTeX corpus as a hard citation boundary, and does not define a claim-level evidence ledger for final prose.

Boundary adopted for the new skill:

- `paper-workbench`: collect/normalize/read/synthesize papers and build an outline.
- `idea-bib-review`: receive both an intended argument and BibTeX corpus, then draft review prose under auditable claim/citation constraints.
- A workbench `literature-synthesis` or `review-outline` may be an optional upstream idea artifact, but the new skill must still receive a `.bib` and run its own citation/evidence gates.

### `literature-mentor`

Source: `skills/research-learning-knowledge/literature-mentor/SKILL.md`.

It owns single-paper, Zotero-first, interactive deep reading in CS/DL/automation. Single-paper reading or figure-by-figure tutoring must not trigger the new skill.

### `deep-research-pro`

Source: `skills/research-learning-knowledge/deep-research-pro/SKILL.md`.

It owns open-ended current-topic web research and cited reports. Topic-only discovery without a supplied idea-plus-bib pair remains its route. The new skill may use read-only discovery for explicit evidence gaps, but must keep found candidates separate from the user corpus until the selected approval policy permits use.

### `humanizer-paper`

Source: `skills/research-learning-knowledge/humanizer-paper/SKILL.md`.

It owns language/style revision of an existing academic draft. Editing prose without evidence intake is not the new skill's job.

## Repository contracts

- Category rules: `skills/academic-research-tools/AGENTS.md`.
- Authoring rules: `.trellis/spec/guides/skill-authoring-conventions.md`.
- Structural exemplar: `skills/academic-research-tools/academic-figure/`.
- Required frontmatter: `name`, `description`, `category`, `tags`, `version`.
- Commands in `SKILL.md` must use literal `<skill-dir>` substitution, never `$SKILL_DIR`.
- Package behavior fixtures use `evals/evals.json`; Node tests under `tests/*.mjs` run in `just node-test`.
- Qiaomu trigger-eval schema is incompatible with the repository eval schema. Keep the repository behavior fixture in the package and task-local Qiaomu trigger cases/semantic config as planning/validation evidence.
- Structural/frontmatter changes require `just docs-sync`, then `just ci`.

## Naming result

`idea-bib-review` is the best current candidate:

- `idea` names the user-supplied argument rather than a generic topic.
- `bib` makes the constrained corpus visible in the trigger name.
- `review` names the output.
- The three-part slug follows the Qiaomu concise-name preference and differentiates it from generic `literature-review` skills.

## Dirty-worktree boundary

At task creation, the repository was on `dev` with six pre-existing modified `.trellis` runtime/update files. They are unrelated user work. Implementation and final staging must use an explicit scope whitelist and must not revert or absorb those files.
