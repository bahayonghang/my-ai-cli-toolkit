# Design: uv Python workflow skill

## Recommended shape

Create one package:

```text
skills/developer-tools-integrations/uv-workflow/
|-- SKILL.md
|-- agents/
|   `-- interface.yaml
|-- evals/
|   `-- evals.json
`-- references/
    `-- uv-command-patterns.md
```

This is the smallest package that satisfies the user's request, the repository's skill catalog contract, and the `yao-meta-skill` preference for lean entrypoints with supporting guidance in references.

## Directory choice

Use `developer-tools-integrations`, not `development-workflows`.

Reasons:

- The skill is primarily about integrating a concrete developer tool (`uv`) into agent command execution.
- Existing `developer-tools-integrations` skills include tool-use skills such as `ast-grep`.
- `development-workflows` is reserved for planning, review, handoff, and implementation-process skills; this uv skill is not a planning or review workflow.

## Skill identity

Use `name: uv-workflow`.

Reasons:

- It keeps the package uv-centered without `python` or `via` in the skill name, per the user's naming preference.
- The frontmatter `description` still preserves the broad source-skill trigger and makes the most important rule obvious.
- The standalone-script workflow can live inside the same package as a section/reference because it is a specialization of Python execution through `uv`.
- A single package avoids duplicated sandbox/cache guidance and reduces routing conflict.

## Entrypoint contract

`SKILL.md` should contain:

- Frontmatter: `name`, `description`, `category`, `tags`, `version`, and possibly `argument-hint` / `allowed-tools`.
- Non-negotiable rule: no direct `python` or `python3` shell entrypoints.
- Allowed exception: `uv run python ...` is acceptable because `uv` owns interpreter/environment selection.
- A short decision table:
  - one-liner -> `uv run python -c "..."`
  - module -> `uv run -m package.module`
  - script -> `uv run path/to/script.py`
  - ad hoc dependency -> `uv run --with package python -c "..."`
  - tool from dependencies -> `uv run tool-name`
  - test runner -> `uv run pytest ...` or `uv run -m pytest ...`
  - new standalone script -> `uv init --script path/to/script.py`
- Pointer to `references/uv-command-patterns.md` for detailed script and cache examples.

## Reference contract

`references/uv-command-patterns.md` should hold the longer guidance:

- PowerShell cache setup:

```powershell
$env:UV_CACHE_DIR = Join-Path $env:TEMP 'uv-cache-codex'
uv run path\to\script.py
```

- POSIX cache setup:

```bash
UV_CACHE_DIR=/tmp/uv-cache uv run path/to/script.py
```

- PEP 723 standalone script lifecycle:

```powershell
uv init --script scripts\demo.py
uv add --script scripts\demo.py httpx
uv remove --script scripts\demo.py httpx
uv run scripts\demo.py
```

- Rule that inline metadata is managed by `uv`, not hand edits.
- Boundary for full projects with `pyproject.toml`.

## Interface metadata

Add a neutral `agents/interface.yaml` because `yao-meta-skill` expects an aligned interface artifact and this category allows the neutral interface shape.

Minimum schema:

```yaml
interface:
  display_name: "uv Workflow"
  short_description: "Run Python commands and standalone scripts through uv."
  default_prompt: "Use $uv-workflow whenever you need to run Python code, Python tools, tests, one-liners, or standalone scripts through uv."
```

Do not add platform-named `openai.yaml`.

## Evals

Add `evals/evals.json` with this intent:

- Positive: user asks to run a Python one-liner; expected output says use `uv run python -c`.
- Positive: user asks to create a script with dependencies; expected output says initialize with `uv init --script` and manage deps with `uv add --script`.
- Negative: user asks to run a non-Python command such as `git status`; expected output says do not use this skill.
- Negative: user asks for a full Python project setup with `pyproject.toml`; expected output says use project-oriented `uv` workflow, not PEP 723 script commands.

The evals are routing assets; CI does not execute them today, but they make the broad trigger safer to review.

## Compatibility and rollout

- The skill should be written for generic coding agents, not only Codex.
- Command examples should include PowerShell because this repo and user environment are Windows-first.
- The source article's POSIX `/tmp/uv-cache` example should be retained as a POSIX pattern, not treated as the only valid cache path.
- Generated docs should be refreshed through the existing docs catalog flow after adding public skill metadata.

## Rollback

The implementation is file-local. Rollback is deleting:

- `skills/developer-tools-integrations/uv-workflow/`
- generated docs changes for this skill, if `docs-sync` creates them

No existing skill should be modified unless validation reveals a catalog-level issue directly caused by the new package.
