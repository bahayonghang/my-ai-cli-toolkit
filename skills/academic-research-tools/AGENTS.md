# academic-research-tools — suite conventions

House standard for academic research tooling skills. This category currently
holds `academic-figure`, which creates or reviews journal-compliant figures and
also reproduces paper styles from data or uploaded images. Future academic
research tools — reference/citation helpers, submission-prep aids, and similar
— belong here and should follow the same conventions. `academic-figure` is the
structural template: a lean `SKILL.md` router + a `references/` layer for heavy
content + bundled `scripts`, `assets`, `tests`, and `evals`.

## Script path resolution

- Refer to a skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path. `${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_
  must resolve. In Windows PowerShell, set `$env:PYTHONUTF8 = '1'` before
  Python commands that read or write UTF-8.

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
- Cover all three internal modes (`journal-spec`, `from-data`, `from-image`),
  the explicit-journal precedence rule, and create/review behavior. Include at
  least two near-neighbor routing negatives for `literature-mentor`
  (single-paper reading) and `paper-workbench` (multi-paper synthesis).
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

- `academic-figure` owns three modes and selects one output contract before
  loading branch guidance. `journal-spec` is vector/compliance-first;
  `from-data` and `from-image` are matplotlib/300-DPI-PNG mimicry modes.
- An explicit journal or thesis target selects `journal-spec`, even when a
  style or reference image is also present. If exact mimicry and journal
  compliance are both explicit, ask once which contract is authoritative.
- Integration with `industrytslib` is call-only: use its visualization API,
  never modify that library from a skill.

## After structural changes

Deleting/adding resource folders or moving evals drifts the docs catalog. Run
`just docs-sync`, then `just ci` (which runs `docs-check`) must pass clean. A new
category also needs a label in `docs/scripts/sync_docs_catalog.py`
(`CATEGORY_LABELS_ZH` / `CATEGORY_LABELS_EN`) so the catalog shows a localized
title instead of the title-cased fallback.
