# Skill Authoring Conventions (this repo)

> Executable contracts distilled from the windows-dev-process-cleanup overhauls
> (2026-07-07 and 2026-07-22) and the md-improver twin-skill optimization
> (2026-07-08).
> Follow these when creating or refactoring anything under `skills/`.

## Plotting layout defaults (academic-figure 1.2.0)

Distilled from the academic-figure layout-defaults task (2026-08-20). Apply
when a skill both *creates* figures and *reproduces* catalog originals.

- Put canvas ratio, axis headroom, and type-size-vs-plot-box numbers in **one**
  reference file. Recipes, QA checklists, and visual-review items point there.
  Do not copy the numbers into `SKILL.md`.
- A publication-default change does **not** rewrite catalog reproduction
  scripts (`from-data` / `from-image`). Those scripts keep the source figure's
  `figsize` and `ylim`.
- Machine layout checks that catch a tight axis or a crowded plot box stay
  `WARN`. Missing glyphs stay `FAIL`.

## Script references in SKILL.md

- Every command in SKILL.md that runs a bundled script must use the literal
  placeholder path form: `pwsh -NoLogo -File "<skill-dir>/scripts/foo.ps1"` /
  `python "<skill-dir>/scripts/foo.py"`.
- Bare relative `scripts/...` breaks at runtime: the agent's CWD is the project,
  not the skill directory, and `$SKILL_DIR` is NOT set as an env var.
- Reference implementations: `gh-pr-release`, `academic-figure`, `archive-planning`,
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

## Governed PowerShell trust evidence

### 1. Scope / Trigger

Apply this contract when a Governed skill ships one or more `.ps1` files and
uses yao-meta to generate its `trust report`.

### 2. Signatures

```powershell
python "<yao-meta-dir>/scripts/trust_check.py" "<skill-dir>" `
  --output-json "<skill-dir>/reports/security_trust_report.json" `
  --output-md "<skill-dir>/reports/security_trust_report.md"
```

### 3. Contracts

- The generated trust inventory scans supported Python script surfaces; it does
  not automatically inspect PowerShell source.
- When `.ps1` files exist, `Scripts: 0` is an inventory limitation, not a safety
  pass. Append a literal `missing evidence` boundary to the generated Markdown.
- Name the manually inventoried `.ps1` files and pair them with deterministic
  parse, fixture, injected-side-effect, and audit/`-WhatIf` evidence.
- Keep host-local absolute paths out of committed JSON reports.

### 4. Validation & Error Matrix

- `.ps1` exists and generated script count is `0` -> keep the report, add the
  PowerShell `missing evidence` boundary, and require manual/test evidence.
- Any real termination, registry write, or other irreversible action in a test
  -> fail the gate; replace it with an injected shim.
- Provider execution, human adjudication, or telemetry was not run -> record
  each item as `missing evidence`; fixture success cannot substitute for it.

### 5. Good / Base / Bad Cases

- Good: two `.ps1` files are manually inventoried, fixture-backed tests pass,
  live checks use audit or `-WhatIf`, and the report discloses the scan gap.
- Base: no PowerShell files exist; interpret the generated script count using
  the tool's normal supported-language contract.
- Bad: publish `Scripts: 0` as proof that a PowerShell package has no executable
  risk.

### 6. Tests Required

- Parse every bundled `.ps1` file with the PowerShell AST parser.
- Load pure functions without running top-level code and test file-backed
  fixtures through injected command/process shims.
- Prove destructive branches make zero real side-effect calls in CI.
- Run only audit and `-WhatIf` smoke commands against the live host.

### 7. Wrong vs Correct

Wrong: "The trust report found zero scripts, so the package passed script
review."

Correct: "The generated report found zero supported scripts; PowerShell
automated trust coverage is `missing evidence`, supplemented by the named
manual inventory and deterministic safety tests."

## Script output files: pin encoding and newline

- A bundled script whose output feeds another tool (`git commit -F`, a JSON
  parser) must write the file itself with `encoding="utf-8", newline="\n"`
  (Python `write_text`) — never rely on the caller capturing stdout with `>`:
  - Windows PowerShell 5.1 `>` writes UTF-16LE, so `git commit -F` reads a
    Chinese/emoji message as mojibake.
  - Python `write_text(...)` without `newline=` rewrites `\n` as CRLF on
    Windows, so file bytes diverge from the stdout path and break byte-level
    test assertions (bit git-commit 2026-07-13: design said "no script change
    needed for --output", but the CRLF rewrite failed the single-`\n` test).
- The SKILL.md must direct the agent to the script's own file-writing flag and
  explicitly forbid PowerShell `>` capture (pattern: git-commit SKILL.md §5.3).

## Adaptive docs need overridable validators

- Contradiction class (bit git-commit v1.10.0, fixed in 1.11.0): SKILL.md
  declared repo config authoritative (commitlint length rules / type-enum),
  but the bundled composer hard-coded 72 columns and a type whitelist with no
  override flag — while SKILL.md also banned hand-rolling the message. Agent
  deadlock on any repo allowing 100-char headers (the
  `@commitlint/config-conventional` default) or custom types like `hotfix`.
- Rule: every limit a bundled script enforces (length, enum, format) that the
  SKILL.md says repo/user config may override MUST have a corresponding script
  flag (e.g. `--max-header-width`, free-form `--type` guarded by a syntax
  regex). When adding an "X is authoritative" sentence to a SKILL.md, grep the
  bundled scripts for hard-coded enforcement of X in the same change.

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

## Read-only CLI grants must whitelist subcommands

- A read-only skill must not grant a whole CLI family when that family also
  contains mutating commands. Allow only the read-only command shapes the
  workflow actually uses, such as `codex mcp list *`, `codex plugin list *`,
  `codex doctor *`, `codex features list *`, and read-only `git` inspection.
- Add a contract test that rejects broad grants such as `Bash(codex *)` and
  `Bash(git *)`, plus any explicitly mutating subcommand used by that CLI.
  Reachability is necessary but does not prove that a permission remains
  read-only.

## Recorded output fixtures prove deterministic contracts only

- Label replayed output as deterministic `recorded_fixture` evidence. It does
  not prove provider/model execution, human blind-review agreement, or live
  telemetry; unavailable evidence stays `missing evidence`.
- Each output assertion should combine multiple short semantic anchors with a
  forbidden material behavior, such as requiring evidence and rollback terms
  while rejecting an unauthorized write. Do not require reproduction of a
  long sentence, and do not let one keyword prove the whole behavior.

## Trigger/boundary changes: two eval systems, not one

> Distilled from the code-auditor project-audit upgrade (2026-07-17).

- The repo's own `skills/<skill>/evals/evals.json` (schema: `id` / `prompt` /
  `expected_output` / `assertions`) is a **behavior/output regression fixture,
  reviewed by hand — `just ci` does NOT execute it.** Do not expect CI to catch
  routing regressions.
- yao-meta's `trigger_eval.py` is a **separate, incompatible** gate. It needs
  `should_trigger` / `should_not_trigger` / `near_neighbor` cases plus a
  domain-specific `semantic_config.json`. The yao-meta default
  `evals/semantic_config.json` targets skill-*creation* routing and scores every
  code-audit prompt wrong — author a skill-specific config or all recall is 0.
- Keep both: extend `evals.json` for the behavior contract, and store the
  trigger cases + semantic config under the task dir (`research/`) so the route
  gate is reproducible. Run it as
  `python "$USERPROFILE/.claude/skills/yao-meta/scripts/trigger_eval.py"
  --cases … --semantic-config … --description-file <SKILL.md>`.
- When redefining a boundary, enumerate ALL near neighbors, not just one. This
  repo had two (`code-quality-review` for maintainability-only, plus the
  user-global `fuck-my-shit-mountain` for non-code health reports); the positive
  wording must dodge both — "全维度/full-spectrum audit", never "架构和质量"
  which collides with `code-quality-review`'s own description.
- qiaomu-meta's `trigger_eval.py` needs no separate `semantic_config.json`: the
  cases JSON itself may embed `positive_concepts`, `negative_patterns`,
  `recommended_threshold`, and `description_required_concepts`. Score model:
  `|prompt-hits ∩ description-hits| / max(3, min(5, |description-hits|))` ≥
  threshold (default 0.34) with a negative-pattern veto — so with 5+ description
  concepts, a prompt needs ≥2 concept-family hits to trigger. Author the domain
  concept table in the cases file (pattern: academic-figure task
  `research/trigger-cases.json`, 2026-08-16, 24/24).
- qiaomu-meta's `validate_skill.py` hard-fails on missing per-skill `README.md`
  and `manifest.json`. Those are qiaomu-package conventions, not this repo's
  (authoritative gates: `scripts/check.py` + docs-sync catalog pages). Record
  the two failures as an intentional schema deviation; do not add the files.

## resource_boundary_check default budget vs reality

- yao-meta `resource_boundary_check.py` defaults to a 1000-token initial-load
  budget. Many existing catalog SKILL.md bodies already exceed it (code-auditor
  0.2.0 was ~1533). A route/section addition will fail the default gate without
  the failure being your regression.
- Correct handling (do NOT fake a pass): record the default failure as
  `missing evidence`, then rerun with `--max-initial-tokens <ceiling>` to prove
  every resource dir is still reachable/connected under an explicit compatibility
  ceiling. Bringing the body under 1000 is a separate entrypoint-refactor task.
- A non-empty optional directory reported as unreferenced is a connectivity
  failure even when the explicit ceiling exits successfully. Reference it from
  the SKILL.md resource map or declare it in manifest factory components, then
  rerun until the ceiling result has zero unused-resource warnings.


- When two skills maintain the same output file (e.g. `agents-md-improver` and
  `claude-context-improver` both own `code_map.md` templates), the shared template
  wording must be byte-identical in both skills, each templates file must carry
  a symmetric "shared with <sibling>; edit both together" note, and each
  SKILL.md needs a coexistence rule (never remove the other tool's mention).
- External-behavior claims (other tools' loading rules, limits, version-gated
  features) go in a reference file with a `Last verified: <date> against <url>`
  line; verify against official docs before repeating a number (the `@import`
  depth was 4, not the 5 both files claimed).

## Marker scanners must exclude their own documentation

> Distilled from the trellis-plan-review precheck script (2026-08-20).

- A bundled script that scans documents for template markers (`TBD`,
  `_example`, `[PLACEHOLDER]`, `TODO`, `待补`) will flag the very docs that
  document the marker list. The skill's own `design.md` listed its blocking set
  and self-reported 10 blocking items on the first self-test.
- Rules for any marker/placeholder scanner:
  1. In Markdown, strip inline code spans (`` `[^`]*` ``) before matching. An
     occurrence inside backticks is a discussion of the marker, not a surviving
     marker.
  2. Detect structured markers structurally, not by substring. A `.jsonl`
     template line is `json.loads(line)` plus an `_example` key test, never
     `"_example" in line`.
  3. Whitelist the files to scan (the contract artifacts). Do not `rglob` the
     whole directory: note/research subtrees are not templates and produce
     false positives.
  4. Split the marker set into blocking and note tiers. `TBD` / `_example` are
     unreplaced template text; a bare `TODO` can legitimately appear in prose
     that discusses an existing code comment.
- Always self-test a scanner against the skill's own artifacts before shipping.
  The self-test is the cheapest case where the scanner's input contains its own
  rule text.

## Repo-wide filename search needs a worktree exclusion

- `rglob` over the repository root reaches `.claude/worktrees/<name>/...`, so a
  filename search returns each hit twice (once real, once inside a worktree
  copy) and an "ambiguous match" heuristic misfires. Add `worktrees` to the
  skip-directory set alongside `node_modules`, `target`, `dist`, and
  `__pycache__`.

