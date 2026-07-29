# development-workflows — suite conventions

House standard for the skills in this directory: `code-auditor`, `code-quality-review`,
`code-refactor`, `codex-dynamic-workflows`, `html-artifact`, `rust-build-optimization`,
`spark`, `unknowns-first`.
These skills cover code review, refactoring, task diagnosis, planning, and artifact
generation. They drifted apart on script paths, eval schemas, and interface files; new or
edited skills here should match the conventions below so the suite does not drift again.

Root `AGENTS.md` and `../AGENTS.md` (the `skills/**` guidelines) still apply. This file
mirrors `../developer-tools-integrations/AGENTS.md` and `../git-github-collaboration/AGENTS.md`;
where they agree, those files are the older reference.

## Reference exemplars

- **`code-auditor`** — exemplar for script/reference path resolution (`<skill-dir>`
  placeholder + the substitution note) and a `references/`-split, rules-driven workflow.
- **`code-refactor`** — exemplar for the eval schema (`evals/evals.json` using `assertions`).
- Cross-category, `../git-github-collaboration/git-commit` remains the repo reference for
  the evals schema and `agents/interface.yaml`.

## Script path resolution

- Refer to the skill's own directory as `` `<skill-dir>` `` and instruct the agent to
  substitute the literal path announced when the skill loads. Add a one-line note where
  paths/commands first appear (see the blockquote in `code-auditor`).
- **Do not** use a bare `$SKILL_DIR` — it is not set at runtime and expands to a broken
  path. Do **not** use a cwd-relative path like `python scripts/foo.py`; the working
  directory is normally the repo root, not the skill directory.
  (`${CLAUDE_SKILL_DIR}` is a Claude-Code-only load-time token; the literal-substitution
  pattern above is portable and is what this suite uses.)
- Bundled scripts self-locate via `Path(__file__)`, so only the script _path_ must
  resolve. Keep a Windows-friendly interpreter fallback (`python` / `py -3`); do not
  assume a single interpreter name.
- Several skills ship scripts (`code-auditor`, `codex-dynamic-workflows`, `html-artifact`,
  `spark`). The advisory/thinking skills (e.g. `unknowns-first`) legitimately have none —
  that is not a gap.

## `allowed-tools`

- Declare it as a comma-separated string, not a YAML sequence, so external skill-review
  tools can validate it (also required by `../AGENTS.md`). Exemplars: `code-auditor`
  (`Read, Write, Glob, Grep, Bash`), `html-artifact` (`Read, Write, Edit, Bash`).
- Declare exactly the real Claude Code tools the skill uses — no invalid tokens (`python`
  is not a tool; use `Bash(python *)`), no missing tools a step needs, no unused
  over-declarations.
- Advisory skills that only produce chat output (e.g. `unknowns-first`) may omit
  `allowed-tools` entirely; do not add file-writing tools to a skill whose hard gate is
  "do not write code or modify files".

## Evals

- One format and location: `evals/evals.json` using the git-commit schema
  (`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`).
  Use the key **`assertions`**, not `expectations`, and do not add stray per-item keys
  such as `name` (the `id` is the stable identifier). `code-refactor` is the in-suite
  exemplar.
- Keep prompts in their natural language (中文/English as written); write
  `expected_output` and `assertions` in English.
- Include at least two near-neighbor **routing-negative** cases asserting the request
  should route elsewhere (e.g. `code-refactor` → `code-quality-review` for review-only;
  `unknowns-first` → `spark` for feature-to-plan brainstorming, not task diagnosis).
- Evals are review and future-tooling assets: CI does **not** execute them
  (`scripts/check.py` validates only SKILL.md frontmatter; `node-test` runs `tests/*.mjs`).
  Skills without evals are a known gap, not a hard failure; add evals when the skill's
  routing surface is worth regression-guarding.

## Interface contract

- Optional. If present, ship one **neutral** `agents/interface.yaml` — never a
  platform-named `openai.yaml`, and never both. Required fields: `display_name`,
  `short_description`, `default_prompt`. Richer `compatibility` / `trust` / `degradation`
  blocks are allowed but optional.
- Skill instruction text should be host-neutral. Do not hardcode a specific runner (e.g.
  "Codex") as the acting agent in a skill that installs for any agent; say "the agent",
  "the model", or address the reader as "you". `spark` is the deliberate exception: it
  names Codex and Claude Code because it branches on those concrete plan-mode surfaces.

## Self-containment

- A first-party skill must not hard-depend on a skill that does not ship in this repo.
  Routing to in-repo skills by name is fine (`code-quality-review`, `code-auditor`,
  `git-commit`). For capabilities with
  no in-repo skill, use generic phrasing ("a planning workflow", "your environment's
  testing workflow", "if available"). Naming a non-bundled skill is
  acceptable only as an explicit, lowest-priority fallback rubric, never as a hard route
  ("stop and invoke X first") — `spark` names `writing-plans` this way and locks it with a
  test. Do not hard-depend on, or unconditionally route to, an external or deleted skill.
- When a skill is removed, grep the suite for references to it and repoint or genericize
  them in the same change.

## Routing: code-auditor vs code-quality-review

These two review skills are deliberately complementary, not duplicates — do not merge them.
They differ on purpose, trigger surface, and output contract:

- **Purpose.** `code-auditor` is the full-spectrum, pre-merge gate across six dimensions
  (correctness, security, performance, readability, testing, architecture) with `pr` /
  `dir` / `project` routes. `code-quality-review` is the single maintainability/structure
  lens: abstraction quality, branching complexity, file growth, boundary and canonical
  ownership, duplication, and behavior-preserving refactoring opportunities.
- **Triggers / routing.** A bare `code review`, `review this PR`, or a full-spectrum /
  multi-dimension audit (`全维度代码审计`) defaults to `code-auditor`. `code-quality-review`
  owns the qualified maintainability requests (`代码质量审查`, `可维护性审查`,
  `architecture quality review`, `code review focused on quality/maintainability`). Neither
  `description` should capture the other's turf; each ships near-neighbor routing-negative
  evals that lock the hand-off (code-auditor #5 defers maintainability-only reviews to
  code-quality-review; code-quality-review #7 defers full-spectrum audits to code-auditor).
- **Output contract.** `code-auditor` maps an internal severity model
  (`critical`/`high`/`medium`/`low`/`info`) to human labels (`[必须修复]` / `[建议修改]` /
  `[仅供参考]`). `code-quality-review` returns a `Verdict` line plus findings with stable
  `CQ-IDs` and a per-finding `Confidence`. The two severity vocabularies stay separate by
  design; do not unify them.

## Frontmatter

- Required top-level keys (enforced by `scripts/check.py`): `name`, `description`,
  `category` (`development-workflows`), `tags`, `version`. Optional but encouraged:
  `allowed-tools`, `argument-hint` for skills that take an argument.
- `description` is the always-loaded routing contract: ≤1024 chars, **no angle brackets**,
  written as "use when the user …" triggers with explicit non-triggers.
- `version` numbers reflect real maturity; do not homogenize them. Leave `version`
  unquoted.
- Governance metadata (`owner`, review cadence) is optional; if added, nest it under a
  `metadata:` block — top-level unknown keys trigger a `check.py` warning.

## After structural changes

Adding/removing `evals/`, scripts, or `agents/` interface files, or renaming interface
files, can drift the docs catalog. Run `just docs-sync`, then `just ci` (which runs
`docs-check`, `skills-check`, `python-check`, `node-test`, and `git diff --check`) must
pass clean.
