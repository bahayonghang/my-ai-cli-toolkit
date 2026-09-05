# developer-tools-integrations — suite conventions

House standard for the skills in this directory: `agent-skill-review`,
`agents-md-improver`, `ast-grep`, `claude-context-improver`,
`codex-workflow-recommender`, `file-sorter`, `goal-meta-skill`, `image-to-ui-skill`, `ripgrep`,
`skill-session-review`, `storage-analyzer`, `windows-dev-process-cleanup`. These skills package
agent-tooling capabilities (auditing guidance files, structural search, goal
authoring and governed Goal handoff persistence, local file review plans, named-skill session review, disk hotspot reports). They drifted apart on script paths, evals, and
interface files; new or edited skills here should match the conventions below so
the suite does not drift again. This file mirrors
`../git-github-collaboration/AGENTS.md`; where the two agree, that file is the
older reference.

## Reference exemplars

- **`claude-context-improver`** — exemplar for the audit/improver pattern (frontmatter,
  phased workflow, `references/` split, report-before-edit gate). `agents-md-improver`
  is its near-twin; keep the two aligned when editing either.
- **`goal-meta-skill`** — exemplar for script-bearing skills after the script-path
  fix (see below).
- Cross-category, `../git-github-collaboration/git-commit` remains the repo
  reference for script invocation and the evals schema.

## Script path resolution

- Refer to the skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads. Add a one-line
  note where commands first appear, e.g. the blockquote in `goal-meta-skill`.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path. Do **not** use a cwd-relative path like `python scripts/foo.py`;
  the working directory is normally the repo root, not the skill directory.
  (`${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.)
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_ must
  resolve. Keep the Windows-friendly interpreter fallback (`python` / `py -3`)
  that `goal-meta-skill` shows; do not assume a single interpreter name.
- `goal-meta-skill`, `file-sorter`, `skill-session-review`, and `storage-analyzer` ship scripts. The
  remaining read/audit skills legitimately have none — that is not a gap.

## `allowed-tools`

Declare exactly the real Claude Code tools each skill uses — no invalid tokens
(`python` is not a tool; use `Bash(python *)`), no missing tools a step needs, no
unused over-declarations. Constrained `Bash(<cmd> *)` forms are preferred over a
bare `Bash` when the skill only runs a known command family.

| Skill                      | Tools                                                                | Why                                          |
| -------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| agent-skill-review         | `Read, Glob, Grep, Edit, Write, Bash`                               | reads a skill package; edits when asked      |
| agents-md-improver         | `Read, Glob, Grep, Edit, Write, Bash(git *), Bash(rg *), …`          | audits + edits AGENTS.md/code_map files      |
| ast-grep                   | `Read, Glob, Grep, Bash, Write`                                      | runs ast-grep, writes rule files             |
| claude-context-improver    | `Read, Glob, Grep, Edit, Write, AskUserQuestion, Bash(git *), Bash(find *)` | audits + edits CLAUDE.md/rules/code_map; asks repo-vs-global scope |
| codex-workflow-recommender | `Read, Glob, Grep, Bash(codex read-only probes), Bash(git read-only probes), Bash(rg *)` | read-only discovery; recommends, never edits |
| file-sorter                | `Read, Glob, Grep, Bash(python *), Bash(py *)`                      | scans one folder; apply --execute only after plan approval |
| storage-analyzer           | `Read, Glob, Grep, Bash(python *), Bash(py *)`                      | hotspot scan and static HTML; server.py trash only after this-turn path approval |
| goal-meta-skill            | `Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)` | read-only reconnaissance; runs lint and the named writer under explicit save authorization, including same-turn creation |
| image-to-ui-skill          | `Read, Write, Edit, Bash, Glob, Grep`                               | recreates UI from references: generates image2 assets, writes demo code, runs scripts/screenshots |
| ripgrep                    | `Read, Glob, Grep, Bash, Write`                                      | runs rg, writes pattern/config files         |
| skill-session-review       | `Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git rev-parse *), Bash(git check-ignore *)` | scans local sessions; after exact confirmation, independent helpers govern the repo-root `.gitignore` and one payload at a time in the fixed report subtree, proof-clean the review JSON, and open HTML only after both reports succeed |

The goal-meta Python grant covers exactly its documented linter and
`persist_goal_contract.py` path. It is not a claim that the skill is wholly
read-only: reconnaissance is read-only, while the named helper may write one
authorized root Markdown contract. An explicit request to generate and save a new
`GOAL.md` may complete in the same turn after root, scope, and create-only checks;
conflicts or material scope changes require the missing decision. Git remains inspection-only; the helper must
not add, commit, push, ignore, or delete the contract.

## Evals

- One format and location: `evals/evals.json` using the git-commit schema
  (`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`).
  Use the key **`assertions`**, not `expectations`, so the repo has one eval
  dialect. `ast-grep` and `goal-meta-skill` currently use `expectations` — drift
  to fix.
- Keep prompts in their natural language (中文/English as written); write
  `expected_output` and `assertions` in English.
- Include at least two near-neighbor **routing-negative** cases asserting the
  request should route elsewhere (e.g. ast-grep → `rg` for exact strings or LSP
  for rename/type-resolution).
- Evals are review and future-tooling assets: CI does **not** execute them
  (`scripts/check.py` validates only SKILL.md frontmatter; `node-test` runs
  `tests/*.mjs`). `agents-md-improver` now ships routing/output evals plus a
  Node contract test. `codex-workflow-recommender` now follows the same pattern.
  Skills without evals (`claude-context-improver`) remain a known gap, not a hard failure; add evals
  when the skill's routing surface is worth regression-guarding.

## Interface contract

- Optional for this category; `codex-workflow-recommender` now ships the neutral
  Production interface because its OpenAI/Claude/generic degradation behavior is material.
- If present: one **neutral** `agents/interface.yaml` (not a platform-named
  `openai.yaml`). Never ship both. Required fields: `display_name`,
  `short_description`, `default_prompt`. Richer `compatibility` / `trust` /
  `degradation` blocks (as in `goal-meta-skill`) are allowed but optional.
- `agent-skill-review` (platform-named `openai.yaml` only) remains drift to normalize.

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
