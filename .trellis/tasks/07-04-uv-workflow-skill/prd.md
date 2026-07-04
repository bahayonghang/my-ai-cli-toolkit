# Add uv workflow skill for coding agents

## Goal

Add one first-party skill that teaches coding agents to use `uv` as the entrypoint for Python execution and standalone Python script workflows, so agents stop trying direct `python` / `python3` commands in environments where those commands may not exist.

## Confirmed facts

- The user supplied two source skills from mathspp: `python-via-uv` for all Python execution and `uv-script-workflow` for standalone PEP 723 scripts.
- The user asked for one uv skill and explicitly requested a Trellis task before implementation.
- The user approved the combined-skill plan and requested a new name that keeps `uv` but does not include `python` or `via`.
- This repository's public skill layout is `skills/<category>/<skill-name>/SKILL.md`.
- `skills/code_map.md` routes tooling-oriented skills to `developer-tools-integrations/`; `development-workflows/` is more for planning, review, handoff, and implementation process skills.
- `skills/developer-tools-integrations/AGENTS.md` requires top-level `name`, `description`, `category`, `tags`, and `version`; if an interface is present it must be a neutral `agents/interface.yaml`.
- Local `uv` is available (`uv 0.11.26`) and local help confirms `uv init --script`, `uv add --script`, `uv remove --script`, `uv run`, `uv run --with`, and `UV_CACHE_DIR`.
- The installed `yao-meta-skill` references extra `references/` files, but those files are missing from the local skill package. Planning therefore follows the main `SKILL.md` rules only.

## Requirements

1. Create a single skill package at `skills/developer-tools-integrations/uv-workflow/`.
2. Use `name: uv-workflow` so the skill name is concise, uv-centered, and does not include `python` or `via`.
3. Make the skill cover both source workflows:
   - Any Python execution should go through `uv`.
   - Standalone scripts should be created and dependency-managed with `uv init --script`, `uv add --script`, and `uv remove --script`.
4. Do not instruct agents to call direct `python` or `python3` as the shell entrypoint. Calling `python` inside `uv run ...` is allowed and must be explicitly explained.
5. Include Windows-friendly cache guidance, not only POSIX examples:
   - PowerShell: set `UV_CACHE_DIR` to a writable temp path such as `$env:TEMP\uv-cache-codex`.
   - POSIX: use a writable temp path such as `/tmp/uv-cache` when needed.
6. Keep PEP 723 metadata management delegated to `uv`; agents may edit script code but must not hand-edit inline metadata blocks.
7. Clearly separate standalone script workflows from full Python project workflows. For projects with `pyproject.toml`, use normal project-oriented `uv` commands rather than script-specific metadata commands.
8. Keep the entry skill lean. If command examples would make `SKILL.md` noisy, move details into `references/uv-command-patterns.md`.
9. Add `agents/interface.yaml` only in the repo-standard neutral shape.
10. Add routing evals if practical because this skill has a broad trigger surface and could otherwise over-trigger on non-Python tasks.

## Acceptance Criteria

- [x] `skills/developer-tools-integrations/uv-workflow/SKILL.md` exists with valid top-level frontmatter and `category: developer-tools-integrations`.
- [x] The `description` triggers on running Python code, one-liners, modules, test runners, package tools, and standalone script workflows, while staying under 1024 characters and containing no angle brackets.
- [x] The skill body forbids direct `python` / `python3` entrypoints and gives `uv` equivalents for scripts, modules, one-liners, tools, ad hoc dependencies, and tests.
- [x] The skill documents `uv init --script`, `uv add --script`, `uv remove --script`, and `uv run` for PEP 723 scripts.
- [x] The skill documents sandbox/cache behavior for both Windows PowerShell and POSIX shells.
- [x] The skill includes an explicit scope boundary for full Python projects with `pyproject.toml`.
- [x] `skills/developer-tools-integrations/uv-workflow/agents/interface.yaml` exists with `display_name`, `short_description`, and `default_prompt`, or the implementation notes explicitly justify omitting it.
- [x] Routing evals include positive cases for Python one-liners and standalone scripts, plus negative cases for non-Python shell commands and existing non-standalone project workflows.
- [x] Targeted validation passes with `uv run --with pyyaml scripts/check.py skills/developer-tools-integrations/uv-workflow`.
- [x] Repository validation is attempted with `just skills-check`, `just docs-check`, and `just ci`; any failure caused by the repo's current direct-`python` justfile convention is reported separately rather than hidden.

## Out of Scope

- Installing the skill into user-level `~/.codex/skills` or any external agent runtime.
- Changing the root `justfile` from `python` to `uv`; that is a broader repository tooling migration.
- Creating two separate first-party skill packages.
- Adding runtime scripts; the expected deliverable is instruction, metadata, optional interface metadata, references, and evals.

## Implementation Decision

Implement one combined skill named `uv-workflow` under `developer-tools-integrations/`.

Rejected alternative: two separate skills, `python-via-uv` and `uv-script-workflow`, mirroring the source article exactly. The combined skill avoids duplicated cache guidance and reduces routing overlap while still preserving both workflows in the skill body.
