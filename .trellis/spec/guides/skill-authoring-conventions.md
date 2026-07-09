# Skill Authoring Conventions (this repo)

> Executable contracts distilled from the windows-dev-process-cleanup overhaul (2026-07-07)
> and the md-improver twin-skill optimization (2026-07-08).
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
- The post-edit formatter hook rewrites markdown tables/fences. A markdown
  example block that itself contains ``` fences must use a 4-backtick outer
  fence, or the formatter's auto-closing produces swallowed sections (bit both
  `update-guidelines.md` files in the md-improver skills).

## Adding a new skill category

- Creating `skills/<new-category>/` alone is NOT enough; four places must move
  together (discovered 2026-07-09 adding `academic-research-tools`):
  1. `scripts/check.py` — add the slug to `CANONICAL_CATEGORY_SLUGS`;
     `just skills-check` hard-fails otherwise ("category must be one of: ...").
  2. `docs/scripts/sync_docs_catalog.py` — add the slug to both
     `CATEGORY_LABELS_ZH` and `CATEGORY_LABELS_EN`. A Title-Case fallback keeps
     `docs-sync` from crashing, but the ZH catalog silently shows an English
     fallback title until the label is added.
  3. `skills/code_map.md` — insert the category line in Internal Routing
     (alphabetical order).
  4. `skills/<new-category>/AGENTS.md` — category house rules; pattern on
     `skills/research-learning-knowledge/AGENTS.md` (`<skill-dir>` rule,
     frontmatter contract, evals schema, docs-sync reminder).

## allowed-tools reachability

- `allowed-tools: Bash(<cmd> *)` entries must be executable in Git Bash (POSIX)
  — Claude Code's Bash tool is never PowerShell. `Bash(Get-ChildItem *)` style
  entries are dead: the command fails in bash, and `powershell -Command ...`
  is not covered by them. Either keep POSIX-only commands or explicitly allow
  `Bash(powershell *)` and show `powershell -Command "..."` examples.
- Discovery/example commands in the SKILL.md body must stay within what
  `allowed-tools` grants.

## Twin skills sharing an artifact

- When two skills maintain the same output file (e.g. `agents-md-improver` and
  `claude-md-improver` both own `code_map.md` templates), the shared template
  wording must be byte-identical in both skills, each templates file must carry
  a symmetric "shared with <sibling>; edit both together" note, and each
  SKILL.md needs a coexistence rule (never remove the other tool's mention).
- External-behavior claims (other tools' loading rules, limits, version-gated
  features) go in a reference file with a `Last verified: <date> against <url>`
  line; verify against official docs before repeating a number (the `@import`
  depth was 4, not the 5 both files claimed).
