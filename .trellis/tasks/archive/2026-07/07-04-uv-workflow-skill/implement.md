# Implementation Plan: uv Python workflow skill

## Preconditions

- Planning artifacts are reviewed.
- The user approved the single combined skill.
- Skill/package name is `uv-workflow`.
- Do not run `task.py start` until the user approves entering implementation.

## Steps

1. Create the package directories.
   - Target: `skills/developer-tools-integrations/uv-workflow/`
   - Subdirectories: `references/`, `agents/`, `evals/`
   - Verify: `Test-Path skills/developer-tools-integrations/uv-workflow/SKILL.md` after file creation.

2. Write `SKILL.md`.
   - Include top-level frontmatter required by `scripts/check.py`.
   - Use a concise `description` under 1024 characters with no angle brackets.
   - Include direct rules and a short command table.
   - Link to `references/uv-command-patterns.md`.
   - Verify: read the file and check frontmatter shape before running validation.

3. Write `references/uv-command-patterns.md`.
   - Include Windows PowerShell and POSIX cache examples.
   - Include script lifecycle commands.
   - Include project-vs-script boundary.
   - Verify: examples do not use direct `python` / `python3` as the shell entrypoint except inside `uv run`.

4. Write `agents/interface.yaml`.
   - Use neutral `interface:` shape.
   - Do not add `openai.yaml`.
   - Verify: parse as YAML during validation or with a small YAML load if needed.

5. Write `evals/evals.json`.
   - Include at least two positive and two negative routing cases.
   - Follow the local `evals/evals.json` schema used by neighboring skills.
   - Verify: JSON parses and assertions are in English.

6. Run targeted validation.
   - Preferred direct check:

```powershell
$env:UV_CACHE_DIR = Join-Path $env:TEMP 'uv-cache-codex'
uv run --with pyyaml scripts/check.py skills/developer-tools-integrations/uv-workflow
```

   - If this fails, fix the skill package before broad checks.

7. Refresh and check generated docs.
   - Run `just docs-sync` after public skill metadata is added.
   - Run `just skills-check`.
   - Run `just docs-check`.
   - Run `just ci` as the finish-line gate when feasible.
   - If a `just` command fails because the current justfile invokes direct `python`, report that separately and rerun the equivalent Python helper through `uv` where possible. Do not migrate the justfile in this task.

8. Review the diff.
   - Confirm no unrelated files changed.
   - Confirm generated docs changes, if any, mention only the new skill.
   - Confirm `.trellis/` artifacts remain planning bookkeeping unless the user asks to commit them.

## Risk Points

- The broad trigger could over-apply to all shell commands. Evals and a clear "Python only" boundary should reduce this.
- A single combined skill could hide the standalone-script workflow. Mitigate with a visible section title and reference file.
- `just` still uses direct `python` in this repository. This task should not expand into a tooling migration without user approval.
- The local `yao-meta-skill` package is missing its referenced playbooks, so implementation should avoid claiming full Skill OS 2.0 evidence beyond what is actually available.

## Review Gate

Before implementation starts, confirm only the normal Trellis phase transition: the reviewed plan should enter implementation with `uv-workflow` as the skill/package name.
