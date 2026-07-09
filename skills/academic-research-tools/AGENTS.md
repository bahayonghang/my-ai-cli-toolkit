# academic-research-tools — suite conventions

House standard for academic research tooling skills. This category currently
holds a single skill, `academic-figure` (journal-compliant publication figures
across matplotlib/seaborn/plotly and industrytslib). Future academic research
tools — reference/citation helpers, submission-prep aids, and similar — belong
in this directory and should follow the same conventions so the suite does not
drift apart. `academic-figure` is the structural template: a lean `SKILL.md`
router + a `references/` layer for heavy content + bundled `scripts/` and
`tests/` + `evals/`.

## Script path resolution

- Refer to a skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path. `${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_
  must resolve. On Windows, prefix Python runs with `PYTHONUTF8=1`.

## Frontmatter

- Keep top-level `name`, `description`, `category`, `tags`, `version` aligned
  with the directory category. `category` **must** equal `academic-research-tools`
  and match the parent directory. `scripts/check.py` enforces these (and the
  canonical category set), and warns on unknown top-level keys.
- `description` must not contain angle brackets and stays under 1024 characters;
  the checker rejects both.
- Keep marketplace/registry metadata (`package.json`, `_meta.json`, vendor-only
  fields) out of the skill; the repo tooling reads only `SKILL.md` frontmatter.
  Pin a single source of truth for `version` (the frontmatter), not duplicated
  across sidecar files.

## Evals

- One format and location: `evals/evals.json` using the git-commit schema
  (`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`).
  This matches the repo-wide house standard; do **not** use a root
  `test-prompts.json`.
- Keep prompts in their natural language; write `expected_output` and
  `assertions` in English.
- Include at least two near-neighbor **routing-negative** cases asserting the
  request should route to a sibling skill, not this one. The most important
  boundary is `paper-plot` (reproduce a specific paper's figure / mimic one
  paper's visual style) in `research-learning-knowledge` vs `academic-figure`
  (produce a figure that meets a target journal's submission specs).
- Note: evals are not executed by CI (`scripts/check.py` validates only
  `SKILL.md` frontmatter; `node-test` runs `tests/*.mjs`). They are review and
  future-tooling assets.

## Tests

- Node tests under `tests/*.mjs` **are** run by `just node-test` and gate CI;
  keep them deterministic and use a temp config directory (never touch a real
  `~/.config`).
- If a skill here ever ships `pytest` tests, treat them as **local/optional**:
  `pytest` is not a declared repo dependency (`just check-deps` covers only
  just/node/npm/python) and `just python-check` does `py_compile`, not test
  execution. Do **not** wire `pytest` into `just ci` — that would add an
  unguaranteed dependency and break the dependency-light CI.

## Scope & boundaries

- `academic-figure` is journal-submission-compliance-first (style axis × library
  axis, vector export contract, industrytslib integration). Keep its routing
  boundary vs `paper-plot` explicit in both descriptions: reproduction /
  paper-style mimicry routes to `paper-plot`; journal-submission compliance
  routes to `academic-figure`.
- Integration with `industrytslib` is call-only: use its visualization API,
  never modify that library from a skill.

## After structural changes

Deleting/adding resource folders or moving evals drifts the docs catalog. Run
`just docs-sync`, then `just ci` (which runs `docs-check`) must pass clean. A new
category also needs a label in `docs/scripts/sync_docs_catalog.py`
(`CATEGORY_LABELS_ZH` / `CATEGORY_LABELS_EN`) so the catalog shows a localized
title instead of the title-cased fallback.
