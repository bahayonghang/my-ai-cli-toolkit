# git-github-collaboration — suite conventions

House standard for the three skills in this directory: `gh-bootstrap`, `gh-pr-release`,
`git-commit`. `git-commit` is the reference
exemplar; new or edited skills here should match these conventions so the suite
does not drift apart again.

## Script path resolution

- Refer to the skill's own directory as `` `<skill-dir>` `` and instruct the agent
  to substitute the literal path announced when the skill loads.
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a
  broken path. (`${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the
  literal-substitution pattern above is portable and is what this suite uses.)
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_ must
  resolve. Invoke Python through `Bash` (the `compose_commit_message` wrapper in
  git-commit shows the robust `python3`/`python`/`py` probe pattern).

## `allowed-tools`

Declare exactly the real Claude Code tools each skill uses — no invalid tokens
(e.g. `python` is not a tool), no missing tools a step needs, no unused
over-declarations.

| Skill               | Tools                                            | Why                                                     |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| gh-bootstrap        | `AskUserQuestion, Read, Bash, Glob, Grep, Write` | interactive config + writes new files                   |
| gh-pr-release       | `Read, Edit, Bash`                               | operates PR/release state + approved review/CI fixes     |
| git-commit          | `Read, Bash`                                     | reads references + runs git/compose; must not edit code |

## Evals

- One format and location: `evals/evals.json` using the git-commit schema
  (`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`).
- Keep prompts in their natural language; write `expected_output` and
  `assertions` in English (matches git-commit).
- Include at least two near-neighbor **routing-negative** cases asserting the
  request should route to a sibling skill, not this one.
- Note: evals are not yet executed by CI (`scripts/check.py` validates only
  SKILL.md frontmatter; `node-test` runs `tests/*.mjs`). They are review and
  future-tooling assets.

## Interface contract

- File name: `agents/interface.yaml` (neutral, not platform-named).
- Fields: `display_name`, a one-line `short_description`, `default_prompt`.
- Icon policy: include `icon_small` / `icon_large` **only** where matching
  `assets/` exist. None of the current suite packages carries icon assets; do
  not fabricate them.

## License / assets

- `gh-pr-release` carries the repository `LICENSE` for its original content and keeps
  `LICENSE-upstream.txt` plus `NOTICE-upstream.md` for its embedded Apache-2.0
  helper components. `gh-bootstrap` and `git-commit` inherit the repository
  license. None of the three carries icon assets.

## Governance metadata

- Optional. If added, place `owner` / review cadence under a nested `metadata:`
  block, not as new top-level frontmatter keys (top-level unknown keys trigger a
  `scripts/check.py` warning).

## After structural changes

Deleting/adding resource folders, moving evals, or renaming interface files
drifts the docs catalog. Run `just docs-sync`, then `just ci` (which runs
`docs-check`) must pass clean.
