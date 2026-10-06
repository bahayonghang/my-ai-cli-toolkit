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
- Treating `just python-check` (byte-compile) as event-protocol testing.

## Required Patterns

- Keep runnable helpers inside the owning skill or platform subtree.
- Keep Python files byte-compilable under `skills/`, `platforms/`, and `scripts/`.
- Keep Node skill tests under `skills/**/tests/*.mjs` so `just node-test` discovers them.
- When public skill or platform metadata changes, regenerate or check the docs catalog.
- Check nested guidance such as `skills/AGENTS.md`, `platforms/claude/AGENTS.md`, `platforms/codex/AGENTS.md`, or `docs/AGENTS.md` before editing that subtree.

### Python Text Stdin On Windows

Skill-local Python helpers that inspect user-supplied UTF-8 text from stdin
should read raw bytes and decode UTF-8 first. PowerShell can send UTF-8 bytes
to native commands while Python's text stdin wrapper decodes with a legacy
console code page, producing mojibake and false-negative scans.

```python
raw = sys.stdin.buffer.read()
try:
    text = raw.decode("utf-8-sig")
except UnicodeDecodeError:
    text = raw.decode(sys.stdin.encoding or locale.getpreferredencoding(False), errors="replace")
```

For file input, prefer `Path(path).read_text(encoding="utf-8-sig")` when the
contract is UTF-8 text. This preserves BOM-tolerant reads without accepting
silent mojibake.

## Testing Requirements

- `just skills-check` for skill metadata or `SKILL.md` changes.
- `just python-check` for Python helpers under `skills/`, `platforms/`, or `scripts/`.
- `just python-test` runs `scripts/run_python_tests.py --dynamic-unittest-discover`. It discovers `platforms/claude/hooks/tests`, every `skills/**/tests` directory that contains `test_*.py`, and `scripts/tests`. It does not discover all of `scripts/`, because `scripts/test_install_projects.py` stays on `just install-projects-test`.
- `just node-test` for Node tests under `skills/**/tests/*.mjs`.
- `just evals-check` runs `scripts/check_skill_evals.py`. Every first-party skill needs `evals/evals.json` with `skill_name` plus `evals[]` items that contain `id`, `prompt`, `expected_output`, `files`, and a non-empty `assertions` array. The checker does not call a model.
- Every first-party skill needs at least one test collected by `just node-test` or `just python-test`. A skill with no executable script still gets `tests/<slug>.test.mjs` that locks the exclusion text in `SKILL.md` and at least two named routing-negative assertions.
- Do not add pytest to CI. Existing pytest-style functions must be `unittest.TestCase` before `python-test` can collect them. A module of bare `def test_*` functions makes `unittest discover` report 0 tests and exit 0.
- `just docs-sync` or `just docs-check` when public skill/platform content changes.
- `git diff --check` for whitespace sanity.
- `just ci` is eight steps: `docs-check`, `skills-check`, `python-check`, `python-test`, `install-projects-test`, `node-test`, `evals-check`, `git diff --check`. Step labels in `justfile` and the root `AGENTS.md` list must stay on the same eight names.

Compile is not event-protocol testing. `just python-check` byte-compiles
Python files. Hook stdin, exit codes, and session isolation require
`just python-test` or the owning unittest suite.

## Code Review Checklist

- Does every changed path belong to the requested scope?
- Are generated files updated only through the owning generator?
- Do new skill files keep `SKILL.md` frontmatter in the top-level form: `name`, `description`, `category`, `tags`, `version`?
- Are tests or validation commands matched to the file type that changed?
- Did Python event-protocol changes run `just python-test`, not only `just python-check`?
- Did the change avoid host-local state such as `.claude/`, `.codex/`, `.agents/`, and `docs/node_modules/`?

## Examples

- `skills/git-github-collaboration/git-commit/` keeps its helper scripts and references inside the owning skill package.
- `skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs` shows the Node test placement convention.
- `platforms/claude/hooks/hooks.json` plus `platforms/claude/hooks/pre-bash.py` show the split between hook wiring and executable logic.
