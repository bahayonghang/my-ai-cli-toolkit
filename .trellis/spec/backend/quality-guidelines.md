# Quality Guidelines

> Code quality standards for repository-side operational code.

## Overview

Quality here means the repo stays machine-checkable and source-driven. Every change should preserve the existing validation chain, keep helper code close to its owner, and avoid hand-maintaining generated output.

## Forbidden Patterns

- Hand-editing generated docs pages produced by `docs/scripts/sync_docs_catalog.py`.
- Moving skill-specific helper code into a broad shared utility module before multiple skills need it.
- Adding a database, service layer, or dependency-heavy framework for file-backed catalog work.
- Leaving `SKILL.md` frontmatter out of sync with its `skills/<category>/<skill-name>/` directory.
- Editing ignored runtime state, dependency output, or build cache paths unless the task is explicitly about recovery.

## Required Patterns

- Keep runnable helpers inside the owning skill or platform subtree.
- Keep Python files byte-compilable under `skills/`, `platforms/`, and `scripts/`.
- Keep Node skill tests under `skills/**/tests/*.mjs` so `just node-test` discovers them.
- When public skill or platform metadata changes, regenerate or check the docs catalog.
- Check nested guidance such as `skills/AGENTS.md`, `platforms/claude/AGENTS.md`, `platforms/codex/AGENTS.md`, or `docs/AGENTS.md` before editing that subtree.

## Testing Requirements

- `just skills-check` for skill metadata or `SKILL.md` changes.
- `just python-check` for Python helpers under `skills/`, `platforms/`, or `scripts/`.
- `just node-test` for Node tests under `skills/**/tests/*.mjs`.
- `just docs-sync` or `just docs-check` when public skill/platform content changes.
- `git diff --check` for whitespace sanity.
- `just ci` before finishing when the change touches repo-wide source or generated output.

## Code Review Checklist

- Does every changed path belong to the requested scope?
- Are generated files updated only through the owning generator?
- Do new skill files keep `SKILL.md` frontmatter in the top-level form: `name`, `description`, `category`, `tags`, `version`?
- Are tests or validation commands matched to the file type that changed?
- Did the change avoid host-local state such as `.claude/`, `.codex/`, `.agents/`, and `docs/node_modules/`?

## Examples

- `skills/git-github-collaboration/git-commit/` keeps its helper scripts and references inside the owning skill package.
- `skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs` shows the Node test placement convention.
- `platforms/claude/hooks/hooks.json` plus `platforms/claude/hooks/pre-bash.py` show the split between hook wiring and executable logic.
