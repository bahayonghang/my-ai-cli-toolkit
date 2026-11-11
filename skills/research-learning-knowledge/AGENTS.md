# research-learning-knowledge — suite conventions

House standard for the skills in this directory: `literature-mentor` and
`laoyeye`. `laoyeye` is the structural exemplar (lean `SKILL.md` +
`references/` with a `modes/` layer + bundled `scripts/` and `tests/`).
`literature-mentor` is a personal single-paper reader with `references/` and
Node tests. New or edited skills here should match these conventions so the
suite does not drift apart.

## Script path resolution

- Refer to a skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path. `${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_
  must resolve. `laoyeye` currently ships scripts.

## Frontmatter

- Keep top-level `name`, `description`, `category`, `tags`, `version` aligned
  with the directory category (`research-learning-knowledge`). `scripts/check.py`
  enforces these and warns on unknown top-level keys.
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
  request should stay outside this skill. `literature-mentor` owns single-paper,
  Zotero-first, interactive CS/DL reading. Multi-paper synthesis, batch source
  normalization, and academic-register polishing are outside this suite. Do not
  send those jobs to a skill this repository no longer ships.
- `just evals-check` checks this schema. It does not call a model.
  `scripts/check.py` still validates only `SKILL.md` frontmatter, and
  `node-test` runs `tests/*.mjs`.

## Python tests

- `laoyeye` ships stdlib `unittest` tests under `tests/`. `just python-test`
  collects them. Do not add `pytest`. `literature-mentor` ships Node tests
  under `tests/*.mjs`, which `just node-test` runs.

## Scope & boundaries

- `literature-mentor` is intentionally a **personal-scope** skill for CS / DL /
  automation single-paper deep reading; it is allowed to be opinionated about
  domain. Say in both the description and the body that multi-paper synthesis
  and batch normalization are outside it.
- `laoyeye` is a thinking and learning partner. It does not ingest papers or
  polish academic prose. Cited current-topic web research is out of scope for
  this suite; do not reintroduce a bundled `scripts/research` CLI.

## After structural changes

Deleting/adding resource folders or moving evals drifts the docs catalog. Run
`just docs-sync`, then `just ci` (which runs `docs-check`) must pass clean.
