# research-learning-knowledge — suite conventions

House standard for the skills in this directory: `humanizer-paper`,
`literature-mentor`, `paper-workbench`. `paper-workbench` is the
structural exemplar (lean `SKILL.md` + `references/` with a `modes/` layer +
bundled `scripts/` and `tests/`); new or edited skills here should match these
conventions so the suite does not drift apart.

## Script path resolution

- Refer to a skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path (this is exactly what once broke `paper-workbench`'s script
  invocations). `${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_
  must resolve. `paper-workbench` and `humanizer-paper` currently ship scripts.

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
  request should route to a sibling skill, not this one. The most important
  boundary here is `literature-mentor` (single-paper, Zotero-first, interactive
  CS/DL tutor) vs `paper-workbench` (multi-paper, researcher-profile-driven,
  arXiv/DOI normalization). `humanizer-paper` polishes academic language; it
  does not read, synthesize, or normalize papers.
- Note: evals are not executed by CI (`scripts/check.py` validates only
  `SKILL.md` frontmatter; `node-test` runs `tests/*.mjs`). They are review and
  future-tooling assets.

## Python tests

- `paper-workbench` ships `pytest` tests under `tests/`. `pytest` is **not** a
  declared repo dependency (`just check-deps` covers only just/node/npm/python)
  and is not guaranteed in CI; `just python-check` does `py_compile`, not test
  execution. Treat these as **local/optional**: run
  `pytest skills/research-learning-knowledge/paper-workbench` manually. Do **not**
  wire `pytest` into `just ci` — that would add an unguaranteed dependency and
  break the dependency-light CI.

## Scope & boundaries

- `literature-mentor` is intentionally a **personal-scope** skill for CS / DL /
  automation single-paper deep reading; it is allowed to be opinionated about
  domain. Keep its routing boundary vs `paper-workbench` explicit in both
  descriptions.
- `humanizer-paper` is a register-aware academic language polisher, not a paper
  reader. Cited current-topic web research is out of scope for this suite;
  do not reintroduce a bundled `scripts/research` CLI.

## After structural changes

Deleting/adding resource folders or moving evals drifts the docs catalog. Run
`just docs-sync`, then `just ci` (which runs `docs-check`) must pass clean.
