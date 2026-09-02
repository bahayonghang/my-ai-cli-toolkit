# Design: categorized live-link installer

## Boundaries

- Owner: `scripts/install_projects.py` plus `scripts/test_install_projects.py`.
- Just: one recipe `install-projects` in the root `justfile`.
- Docs: README / README_CN only, unless generated catalog pages mention the command.
- Do not import `docs/scripts/sync_docs_catalog.py`. Duplicate the small `skills/<category>/<slug>/SKILL.md` walk in `scripts/` rather than adding a shared package.
- Do not call `npx` / official `skills` CLI.
- Do not write under `skills/`, `docs/` generated pages (unless a command string is added there by the generator later), or any skill package.

## Catalog root vs project root

```text
catalog_root  = repo that contains justfile + skills/
                resolved from Path(__file__).resolve().parents[1]
project_root  = Path(--project) if given else Path.cwd()
```

`--list` / `--json` read only `catalog_root`. Install writes only under `project_root`.

Refuse to install if `catalog_root / "skills"` is missing. `--project` must be an existing directory.

## Data flow

1. Discover skills: `catalog_root/skills/<category>/<slug>/SKILL.md` where `category` ∈ `CANONICAL_CATEGORY_SLUGS` (import or copy the set from `scripts/check.py`; do not silently accept unknown category dirs).
2. Resolve selection:
   - `--skill NAME` (repeatable) matches frontmatter `name` or directory slug.
   - `--category SLUG` (repeatable) expands to every skill in that slug.
   - Union, de-dupe by skill name.
   - TTY and no selection flags: numbered menu (categories, then optional per-skill). Cancel / empty → exit 1, no writes.
3. Resolve dests under `project_root` (see dest table).
4. For each (skill, dest_dir): create parent, then junction/symlink `dest_dir / skill_name → source_dir`.
5. Print one line per created or reused link to stdout. Errors to stderr.

## Dest table

Always (create parents):

| Agent key | Relative dest |
|---|---|
| `universal` | `.agents/skills` |

Detect extra dests only when the **agent root directory** already exists (not when only `skills/` is missing):

| Agent key | Detect if exists | Relative dest |
|---|---|---|
| `claude-code` | `.claude/` | `.claude/skills` |
| `kiro` | `.kiro/` | `.kiro/skills` |
| `trae` | `.trae/` | `.trae/skills` |
| `opencode` | `.opencode/` | `.opencode/skills` |
| `gemini` | `.gemini/` | `.gemini/skills` |
| `grok` | `.grok/` | `.grok/skills` |
| `cursor` | `.cursor/` | `.cursor/skills` |
| `codex` | `.codex/` | `.codex/skills` |
| `kimi-code` | `.kimi-code/` | `.kimi-code/skills` |
| `omp` | `.omp/` | `.omp/skills` |

`--agent KEY` adds that dest even if the agent root does not yet exist.

Hard deny: any dest whose first component is `.agent` (no `s`).

## Link contract

- POSIX: `os.symlink(source_dir, dest_skill_path, target_is_directory=True)`.
- Windows: directory **junction** (no admin), source path absolute. Do not use file symlinks. `mklink /J` via `cmd /c` is acceptable because `mklink` is a cmd builtin; argv must be a list (`["cmd", "/c", "mklink", "/J", dest, src]`), `shell=False`.
- Same-source existing link: success, no replace.
- Existing real directory or different link target: error, no replace, abort remaining dests after cleanup? **Fail closed with no half install**: if any dest fails, do not leave newly created links from this invocation. Practical MVP: apply dests in a temp plan, create all, on first failure remove **this run's** newly created links (not pre-existing same-source links).
- Relative vs absolute: Windows junction stores absolute target. POSIX may use absolute source to survive CWD changes.

## CLI surface

```text
python scripts/install_projects.py [--list] [--json]
    [--category SLUG]... [--skill NAME]...
    [--project DIR] [--agent KEY]...
```

Exit codes: `0` success (including `--list`); `1` validation/policy; `2` usage.

User-facing command name is `python`, never `python3`. Shebang may match `scripts/check.py` (`#!/usr/bin/env python3`) for Unix; Windows callers still use `python`.

## Interactive UX

Match `npx skills add` selection, not a numbered one-shot menu:

- One screen: `Select All`, then category groups, then skills under each group.
- ↑/↓ move. Space toggles the current row (all / whole category / one skill).
- Enter installs the checked set. Zero checked stays on the picker.
- `q` / Esc cancels with no writes.
- Description pane shows the highlighted skill (or a select-all / category hint).
- Non-TTY: no prompts; require `--category` and/or `--skill`.

No extra TUI package. Windows uses `msvcrt`; POSIX uses `termios` raw mode.

## Just

```just
install-projects *args:
    {{ python_cmd }} scripts/install_projects.py {{ args }}
```

`help` documents it under 工具. `ci` does **not** call it. Unittest is invoked from `python-check` only if we keep compile-only; run tests via a focused command in `implement.md` and optionally add `just install-projects-test`. Prefer adding the unittest file next to the script and calling it from a new just recipe **or** from `implement.md` validation only — do not put interactive install into `just ci`. Add `python scripts/test_install_projects.py` as a step in local/CI only if it stays side-effect free on the repo tree (use `TemporaryDirectory`). If added to CI, it belongs after `python-check` as an extra just recipe that `ci` calls. Default: add `install-projects-test` and include it in `just ci` because A5 requires tests in the finish gate.

## Compatibility

- Creating `.agents/` in a consumer project is intended and gitignored in **this** repo; consumer repos may need their own ignore. Out of scope to edit other repos' gitignore.
- Live-link means agents see the working tree, including uncommitted edits. That is the point of D1.

## Rollback

Delete the created links under dest `*/skills/<name>`. Do not delete source trees. Do not `rm -rf` `.agents`.
