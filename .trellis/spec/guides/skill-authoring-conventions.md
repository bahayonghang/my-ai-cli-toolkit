# Skill Authoring Conventions (this repo)

> Executable contracts distilled from the windows-dev-process-cleanup overhaul (2026-07-07).
> Follow these when creating or refactoring anything under `skills/`.

## Script references in SKILL.md

- Every command in SKILL.md that runs a bundled script must use the literal
  placeholder path form: `pwsh -NoLogo -File "<skill-dir>/scripts/foo.ps1"` /
  `python "<skill-dir>/scripts/foo.py"`.
- Bare relative `scripts/...` breaks at runtime: the agent's CWD is the project,
  not the skill directory, and `$SKILL_DIR` is NOT set as an env var.
- Reference implementations: `gh-fix-ci`, `paper-plot`, `archive-planning`,
  `windows-dev-process-cleanup` (the latter enforces it with a lint test).

## Frontmatter contract

- Required top-level keys: `name`, `description`, `category`, `tags`, `version`.
- `scripts/check.py` hard-fails on: missing name/description, angle brackets in
  description, description > 1024 chars, category not matching the directory.
  Missing category/tags is only a warning — treat warnings as failures anyway.
- Descriptions for user-facing skills should carry both English and Chinese
  trigger phrases and cover every functional half of the skill.

## Agent interface files

- The per-skill agent interface lives at `agents/interface.yaml`
  (keys: `display_name`, `short_description`, `default_prompt`).
  Do not introduce variant filenames (`openai.yaml` was the one outlier; renamed).

## Testing PowerShell-backed skills

- Put tests in `<skill>/tests/*.mjs`; `just node-test` auto-discovers anything
  matching `skills/**/tests/*.mjs` and runs it with `node --test`.
- Gate on environment, never fail for missing platform:
  `skip: process.platform !== 'win32' ? 'requires Windows' : pwshAvailable() ? false : 'requires pwsh'`.
- Force UTF-8 before parsing pwsh stdout as JSON:
  prepend `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ` to `-Command`.
- Unit-test pure functions without paying for a script's top-level side effects
  by AST extraction: `[Parser]::ParseFile(...)` → `FindAll(FunctionDefinitionAst,
name)` → `Invoke-Expression $fn.Extent.Text` (see `audit-scripts.test.mjs`).
- Make destructive paths injectable (e.g. a `[scriptblock]$KillAction` parameter)
  so tests can shim the side effect and assert what would have been executed.
- PowerShell trap that motivated all this: a plain (non-advanced) function called
  with a wrong parameter name does NOT error — the argument falls into `$args`
  and the declared parameter stays null. Cleanup ran as a silent no-op while
  reporting success. Always cover the destructive path with a shim test.

## Verification traps in this repo

- `git status` looks clean while untracked files exist: the repo sets
  `status.showUntrackedFiles = no`. Use `git status --porcelain -uall` or
  `git ls-files --others --exclude-standard` before trusting "clean".
- After changing any SKILL.md frontmatter, run `just docs-sync` and commit the
  regenerated `docs/` catalog pages, or `just ci` fails at step 1 (`docs-check`).
