# Implementation Plan: renhua first-party skill import

## Preconditions

- The user has reviewed the planning direction.
- The user has confirmed the small `renhua_lint.py` reporter is included in v1.
- Do not run `task.py start` until implementation is explicitly approved.

## Steps

1. Create package directories.
   - Target: `skills/docs-writing-publishing/renhua/`
   - Subdirectories: `references/`, `agents/`, `evals/`, `scripts/`
   - Verify: target directory exists and no unrelated skill files changed.

2. Write `SKILL.md`.
   - Add valid top-level frontmatter: `name`, `description`, `category`, `tags`, `version`, and likely `argument-hint`.
   - Keep `description` under 1024 characters and free of angle brackets.
   - Preserve source operating priorities and default output contract.
   - Add routing boundaries vs `humanizer-paper`, `document-writer`, `bidwriter`, and paper analysis skills.
   - Point long pattern details to `references/pattern-rules.md`.
   - Verify: read the file and confirm all referenced local files exist.

3. Write `references/pattern-rules.md`.
   - Move and lightly edit the source hard-ban catalog and examples.
   - Preserve every source pattern family.
   - Keep the examples concrete and Chinese-public-writing-specific.
   - Verify: source pattern families from `ref/repo/rnskill/skills/renhua/SKILL.md` lines 22-287 all have a destination.

4. Write `agents/interface.yaml`.
   - Use neutral `interface:` shape.
   - Convert the source display name, short description, and default prompt.
   - Do not create `agents/openai.yaml`.
   - Verify: YAML parses.

5. Write `evals/evals.json`.
   - Include positive, audit-only, routing-negative, and integrity-boundary cases.
   - Keep expected outputs/assertions in English.
   - Verify: JSON parses.

6. Write `scripts/renhua_lint.py`.
   - Pure stdlib, UTF-8 explicit, `argparse`, stdin or `--file`, `--json`, exit code 0.
   - Report line/excerpt/pattern/category for exact phrase and near-pattern hits.
   - Do not rewrite text or claim AI-detection capability.
   - Verify: `python -m py_compile skills/docs-writing-publishing/renhua/scripts/renhua_lint.py`.

7. Run targeted validation.

```powershell
python scripts/check.py skills/docs-writing-publishing/renhua
```

If a script is included:

```powershell
python skills/docs-writing-publishing/renhua/scripts/renhua_lint.py --help
```

8. Refresh docs and run gates.

```powershell
just docs-sync
just skills-check
just docs-check
just python-check
just ci
```

If any gate fails, fix failures caused by this task. If a pre-existing unrelated failure appears, report exact command and failure.

9. Review the diff.
   - Confirm changes are limited to the new skill package, generated docs/catalog output, and Trellis task artifacts.
   - Confirm `ref/` is untouched.
   - Confirm no unrelated dirty-tree work is included.

## Risk Points

- Over-triggering on academic writing. Mitigate with explicit negative routing to `humanizer-paper`.
- Over-triggering on codebase docs. Mitigate with explicit negative routing to `document-writer`.
- Losing the source's best examples during cleanup. Mitigate by moving examples into `references/pattern-rules.md`, not deleting them.
- Turning a writing skill into an AI detector. Mitigate by making any script a residual-pattern reporter only.

## Review Gates

- G1: `SKILL.md` frontmatter and routing boundaries pass `scripts/check.py`.
- G2: Source pattern families are preserved in `references/pattern-rules.md`.
- G3: Interface/evals parse.
- G4: Linter help/JSON smoke passes and `just python-check` compiles it.
- G5: `just ci` passes or any unrelated/pre-existing failure is documented.

## Implementation Record

Completed implementation after `task.py start`.

- Created `skills/docs-writing-publishing/renhua/` with lean `SKILL.md`, `references/pattern-rules.md`, neutral `agents/interface.yaml`, `evals/evals.json`, and pure-stdlib `scripts/renhua_lint.py`.
- Kept the source slug `renhua` and placed it under `docs-writing-publishing` to match public writing, posts, product notes, model reviews, and public technical essays.
- Preserved the source hard-ban families in `references/pattern-rules.md`: binary contrast shells, command-template openings, fake insight markers, lecture colon, vague referents, wrong time stance, vague comparatives, abstract-pressure endings, slogan/metaphor endings, and final scan checklist.
- Added routing boundaries against academic-paper polishing (`humanizer-paper`), codebase docs (`document-writer`), tender documents (`bidwriter`), paper intake/synthesis (`paper-workbench` / research skills), and AI-detector evasion.
- Added a Windows/PowerShell-safe stdin path in `renhua_lint.py` by decoding raw stdin bytes as UTF-8 first, while keeping `--file` UTF-8/BOM-safe.
- Updated `.trellis/spec/backend/quality-guidelines.md` with the Windows Python stdin UTF-8 convention learned from the linter smoke failure.

Validation run:

- `python scripts\check.py skills\docs-writing-publishing\renhua` -> passed.
- `python scripts\check.py skills\docs-writing-publishing\renhua --json` -> passed with no warnings.
- `python -m py_compile skills\docs-writing-publishing\renhua\scripts\renhua_lint.py` -> passed.
- `python skills\docs-writing-publishing\renhua\scripts\renhua_lint.py --help` -> passed.
- `python skills\docs-writing-publishing\renhua\scripts\renhua_lint.py --json` with PowerShell stdin sample -> passed; reported 6 residual-pattern hits across `binary_contrast`, `command_template`, `fake_insight`, and `abstract_pressure`.
- `python skills\docs-writing-publishing\renhua\scripts\renhua_lint.py --file $env:TEMP\renhua-lint-smoke.txt --json` -> passed; reported the same 6 hits from a UTF-8 file.
- `evals/evals.json` JSON parse -> passed.
- `agents/interface.yaml` YAML parse -> passed.
- `just docs-sync` -> passed; generated catalog now indexes 36 skills and created `renhua` detail pages.
- `just skills-check` -> passed.
- `just docs-check` -> passed; VitePress emitted existing Rollup PURE-comment warnings from `@vueuse/core`, but the command exited 0.
- `just python-check` -> passed; checked 34 Python files.
- `just ci` -> passed after the spec update; Node skill tests passed 127/127 and `git diff --check` exited 0 with line-ending warnings for `.trellis/spec/backend/quality-guidelines.md` and generated docs files only.

Diff review:

- Changed scope is limited to the new `renhua` skill package, generated docs/catalog files, the backend quality spec note, and this Trellis task.
- `ref/repo/rnskill/skills/renhua` was not edited.
