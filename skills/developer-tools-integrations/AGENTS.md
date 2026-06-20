# developer-tools-integrations — suite conventions

House standard for the skills in this directory: `agent-skill-review`,
`agents-md-improver`, `archive-planning`, `ast-grep`, `claude-md-improver`,
`codex-workflow-recommender`, `goal-meta-skill`. These skills package
agent-tooling capabilities (auditing guidance files, structural search, planning
archival, goal authoring). They drifted apart on script paths, evals, and
interface files; new or edited skills here should match the conventions below so
the suite does not drift again. This file mirrors
`../git-github-collaboration/AGENTS.md`; where the two agree, that file is the
older reference.

## Reference exemplars

- **`claude-md-improver`** — exemplar for the audit/improver pattern (frontmatter,
  phased workflow, `references/` split, report-before-edit gate). `agents-md-improver`
  is its near-twin; keep the two aligned when editing either.
- **`archive-planning`** and **`goal-meta-skill`** — exemplars for script-bearing
  skills after the script-path fix (see below).
- Cross-category, `../git-github-collaboration/git-commit` remains the repo
  reference for script invocation and the evals schema.

## Script path resolution

- Refer to the skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads. Add a one-line
  note where commands first appear, e.g. the blockquote in `archive-planning` and
  `goal-meta-skill`.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path. Do **not** use a cwd-relative path like `python scripts/foo.py`;
  the working directory is normally the repo root, not the skill directory.
  (`${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.)
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_ must
  resolve. Keep the Windows-friendly interpreter fallback (`python` / `py -3`)
  that `goal-meta-skill` shows; do not assume a single interpreter name.
- Only `archive-planning` and `goal-meta-skill` ship scripts. The read/audit
  skills legitimately have none — that is not a gap.

## `allowed-tools`

Declare exactly the real Claude Code tools each skill uses — no invalid tokens
(`python` is not a tool; use `Bash(python *)`), no missing tools a step needs, no
unused over-declarations. Constrained `Bash(<cmd> *)` forms are preferred over a
bare `Bash` when the skill only runs a known command family.

| Skill                      | Tools                                                                | Why                                          |
| -------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| agent-skill-review         | `Read, Glob, Grep, Edit, Write, Bash`                               | reads a skill package; edits when asked      |
| agents-md-improver         | `Read, Glob, Grep, Edit, Write, Bash(git *), Bash(find *), …`        | audits + edits AGENTS.md/code_map files      |
| archive-planning           | `Bash(python *), Bash(py *), Read`                                   | runs the bundled archival script             |
| ast-grep                   | `Read, Glob, Grep, Bash, Write`                                      | runs ast-grep, writes rule files             |
| claude-md-improver         | `Read, Glob, Grep, Edit, Write, Bash(git *), Bash(find *), …`        | audits + edits CLAUDE.md/rules/code_map      |
| codex-workflow-recommender | `Read, Glob, Grep, Bash(codex *), Bash(git *), …`                    | read-only discovery; recommends, never edits |
| goal-meta-skill            | `Read, Bash(python *), Bash(py *)`                                   | reads refs; runs the goal lint script        |

`agent-skill-review` and `goal-meta-skill` were missing `allowed-tools`; add them
to match this table.

## Evals

- One format and location: `evals/evals.json` using the git-commit schema
  (`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`).
  Use the key **`assertions`**, not `expectations`, so the repo has one eval
  dialect. `ast-grep` and `goal-meta-skill` currently use `expectations`;
  `archive-planning` has no assertions array — both are drift to fix.
- Keep prompts in their natural language (中文/English as written); write
  `expected_output` and `assertions` in English.
- Include at least two near-neighbor **routing-negative** cases asserting the
  request should route elsewhere (e.g. ast-grep → `rg` for exact strings or LSP
  for rename/type-resolution; archive-planning → an edit, not an archive).
- Evals are review and future-tooling assets: CI does **not** execute them
  (`scripts/check.py` validates only SKILL.md frontmatter; `node-test` runs
  `tests/*.mjs`). Skills without evals (`agents-md-improver`, `claude-md-improver`,
  `codex-workflow-recommender`) are a known gap, not a hard failure; add evals
  when the skill's routing surface is worth regression-guarding.

## Interface contract

- Optional for this category — 5 of 7 skills ship no interface file, which is
  fine for Claude-Code-primary skills.
- If present: one **neutral** `agents/interface.yaml` (not a platform-named
  `openai.yaml`). Never ship both. Required fields: `display_name`,
  `short_description`, `default_prompt`. Richer `compatibility` / `trust` /
  `degradation` blocks (as in `goal-meta-skill`) are allowed but optional.
- `agent-skill-review` (platform-named `openai.yaml` only) and `goal-meta-skill`
  (both `interface.yaml` and `openai.yaml`) are drift to normalize.

## Frontmatter

- Required top-level keys (enforced by `scripts/check.py`): `name`, `description`,
  `category` (`developer-tools-integrations`), `tags`, `version`. Optional but
  encouraged: `allowed-tools`, `argument-hint` for skills that take an argument.
- `description` is the always-loaded routing contract: ≤1024 chars, no angle
  brackets, written as "use when the user …" triggers.
- `version` numbers reflect real maturity (0.1.0 vs 1.0.0); do not homogenize
  them. Leave `version` unquoted.
- Governance metadata (`owner`, review cadence) is optional; if added, nest it
  under a `metadata:` block — top-level unknown keys trigger a `check.py` warning.

## After structural changes

Adding/removing `evals/`, scripts, or `agents/` interface files, or renaming
interface files, can drift the docs catalog. Run `just docs-sync`, then `just ci`
(which runs `docs-check`, `skills-check`, `python-check`, `node-test`, and
`git diff --check`) must pass clean.
